import { create } from 'zustand'
import { createClient } from '@/lib/client'

export interface DashboardStats {
  totalFolders: number
  totalNotes: number
  totalFlashcards: number
  totalFiles: number
  dueFlashcardsToday: number
  dueFlashcardsThisWeek: number
  masteredFlashcards: number
  overallSuccessRate: number
  totalReviews: number
}

export interface RecentFolder {
  id: string
  name: string
  description: string | null
  updated_at: string
  noteCount: number
  flashcardCount: number
  fileCount: number
}

export interface RecentNote {
  id: string
  title: string
  content: string
  folder_id: string
  folder_name: string
  updated_at: string
}

export interface DueFlashcard {
  id: string
  question: string
  folder_id: string
  folder_name: string
  next_review_date: string
  ease_factor: number
  repetitions: number
}

interface DashboardState {
  stats: DashboardStats | null
  recentFolders: RecentFolder[]
  recentNotes: RecentNote[]
  dueFlashcards: DueFlashcard[]
  loading: boolean
  error: string | null

  fetchDashboardStats: () => Promise<void>
  fetchRecentFolders: (limit?: number) => Promise<void>
  fetchRecentNotes: (limit?: number) => Promise<void>
  fetchDueFlashcards: (limit?: number) => Promise<void>
  fetchAllDashboardData: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  recentFolders: [],
  recentNotes: [],
  dueFlashcards: [],
  loading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()

      // Get user's folders first
      const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('id')

      if (foldersError) throw foldersError

      const folderIds = folders?.map(f => f.id) || []

      if (folderIds.length === 0) {
        set({
          stats: {
            totalFolders: 0,
            totalNotes: 0,
            totalFlashcards: 0,
            totalFiles: 0,
            dueFlashcardsToday: 0,
            dueFlashcardsThisWeek: 0,
            masteredFlashcards: 0,
            overallSuccessRate: 0,
            totalReviews: 0,
          },
          loading: false,
        })
        return
      }

      // Fetch all data in parallel using SQL joins
      const [notesResult, flashcardsResult, filesResult] = await Promise.all([
        // Get all notes from user's folders
        supabase
          .from('notes')
          .select('id, folder_id, folders!inner(user_id)')
          .in('folder_id', folderIds),

        // Get all flashcards from user's folders
        supabase
          .from('flashcards')
          .select('*, folders!inner(user_id)')
          .in('folder_id', folderIds),

        // Get all files from user's folders
        supabase
          .from('files')
          .select('id, folder_id, folders!inner(user_id)')
          .in('folder_id', folderIds),
      ])

      const notes = notesResult.data || []
      const flashcards = flashcardsResult.data || []
      const files = filesResult.data || []

      // Calculate flashcard statistics
      const now = new Date()
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)

      const dueToday = flashcards.filter(
        f => new Date(f.next_review_date) <= now
      ).length

      const dueThisWeek = flashcards.filter(
        f => new Date(f.next_review_date) <= weekFromNow
      ).length

      const mastered = flashcards.filter(
        f => f.repetitions >= 3 && f.ease_factor >= 2.5
      ).length

      const totalReviews = flashcards.reduce(
        (sum, f) => sum + (f.total_reviews || 0),
        0
      )

      const correctReviews = flashcards.reduce(
        (sum, f) => sum + (f.correct_reviews || 0),
        0
      )

      const successRate =
        totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0

      const stats: DashboardStats = {
        totalFolders: folders.length,
        totalNotes: notes.length,
        totalFlashcards: flashcards.length,
        totalFiles: files.length,
        dueFlashcardsToday: dueToday,
        dueFlashcardsThisWeek: dueThisWeek,
        masteredFlashcards: mastered,
        overallSuccessRate: Math.round(successRate),
        totalReviews,
      }

      set({ stats, loading: false })
    } catch (error: any) {
      set({
        error: error.message ?? 'Failed to fetch dashboard stats',
        loading: false,
      })
    }
  },

  fetchRecentFolders: async (limit = 6) => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()

      // Get recent folders with counts using SQL
      const { data: folders, error } = await supabase
        .from('folders')
        .select('id, name, description, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Get counts for each folder
      const foldersWithCounts = await Promise.all(
        (folders || []).map(async (folder) => {
          const [notesCount, flashcardsCount, filesCount] = await Promise.all([
            supabase
              .from('notes')
              .select('id', { count: 'exact', head: true })
              .eq('folder_id', folder.id),
            supabase
              .from('flashcards')
              .select('id', { count: 'exact', head: true })
              .eq('folder_id', folder.id),
            supabase
              .from('files')
              .select('id', { count: 'exact', head: true })
              .eq('folder_id', folder.id),
          ])

          return {
            ...folder,
            noteCount: notesCount.count || 0,
            flashcardCount: flashcardsCount.count || 0,
            fileCount: filesCount.count || 0,
          }
        })
      )

      set({ recentFolders: foldersWithCounts, loading: false })
    } catch (error: any) {
      set({
        error: error.message ?? 'Failed to fetch recent folders',
        loading: false,
      })
    }
  },

  fetchRecentNotes: async (limit = 5) => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()

      // Get recent notes with folder info using join
      const { data, error } = await supabase
        .from('notes')
        .select(`
          id,
          title,
          content,
          folder_id,
          updated_at,
          folders!inner (
            id,
            name,
            user_id
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      const recentNotes: RecentNote[] = (data || []).map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        folder_id: note.folder_id,
        folder_name: note.folders.name,
        updated_at: note.updated_at,
      }))

      set({ recentNotes, loading: false })
    } catch (error: any) {
      set({
        error: error.message ?? 'Failed to fetch recent notes',
        loading: false,
      })
    }
  },

  fetchDueFlashcards: async (limit = 10) => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()

      // Get due flashcards with folder info using join
      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          id,
          question,
          folder_id,
          next_review_date,
          ease_factor,
          repetitions,
          folders!inner (
            id,
            name,
            user_id
          )
        `)
        .lte('next_review_date', new Date().toISOString())
        .order('next_review_date', { ascending: true })
        .limit(limit)

      if (error) throw error

      const dueFlashcards: DueFlashcard[] = (data || []).map((card: any) => ({
        id: card.id,
        question: card.question,
        folder_id: card.folder_id,
        folder_name: card.folders.name,
        next_review_date: card.next_review_date,
        ease_factor: card.ease_factor,
        repetitions: card.repetitions,
      }))

      set({ dueFlashcards, loading: false })
    } catch (error: any) {
      set({
        error: error.message ?? 'Failed to fetch due flashcards',
        loading: false,
      })
    }
  },

  fetchAllDashboardData: async () => {
    set({ loading: true, error: null })
    try {
      // Fetch all dashboard data in parallel
      await Promise.all([
        get().fetchDashboardStats(),
        get().fetchRecentFolders(),
        get().fetchRecentNotes(),
        get().fetchDueFlashcards(),
      ])
      set({ loading: false })
    } catch (error: any) {
      set({
        error: error.message ?? 'Failed to fetch dashboard data',
        loading: false,
      })
    }
  },
}))
