import {create} from 'zustand'
import { createClient } from "@/lib/client";
import { calculateNextReview } from "@/lib/srs-algorithm";

export interface FlashcardAnswer {
  text: string;
  isCorrect: boolean;
}

export type Flashcard = {
  id: string;
  folder_id: string;
  question: string;
  answers: FlashcardAnswer[];
  is_multiple_choice: boolean;
  created_at: string;
  updated_at: string;
  // SRS fields
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at: string | null;
  total_reviews: number;
  correct_reviews: number;
};

export interface StudyStats {
  totalCards: number;
  dueToday: number;
  dueThisWeek: number;
  masteredCards: number;
  newCards: number;
  averageEase: number;
  totalReviews: number;
  successRate: number;
}

interface FlashcardState {
  flashcards: Flashcard[];
  currentFlashcard: Flashcard | null;
  loading: boolean;
  error: string | null;

  fetchFlashcardsByFolder: (folderId: string) => Promise<void>;
  createFlashcard: (data: {
    folderId: string;
    question: string;
    answers: FlashcardAnswer[];
    isMultipleChoice: boolean;
  }) => Promise<Flashcard | null>;
  updateFlashcard: (
    id: string,
    data: {
      question?: string;
      answers?: FlashcardAnswer[];
      isMultipleChoice?: boolean;
    }
  ) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  setCurrentFlashcard: (flashcardId: string | null) => void;
  
  // SRS functions
  reviewFlashcard: (flashcardId: string, folderId: string, quality: number, timeTaken?: number) => Promise<void>;
  fetchDueFlashcards: (folderId: string) => Promise<void>;
  fetchStudyStats: (folderId: string) => Promise<StudyStats | null>;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  flashcards: [],
  currentFlashcard: null,
  loading: false,
  error: null,

  fetchFlashcardsByFolder: async (folderId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ flashcards: data || [], loading: false });
    } catch (error: any) {
      set({
        error: error.message ?? "Failed to fetch flashcards",
        loading: false,
      });
    }
  },

  createFlashcard: async (data) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data: newFlashcard, error } = await supabase
        .from("flashcards")
        .insert({
          folder_id: data.folderId,
          question: data.question,
          answers: data.answers,
          is_multiple_choice: data.isMultipleChoice,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        flashcards: [newFlashcard, ...state.flashcards],
        currentFlashcard: newFlashcard,
        loading: false,
      }));
      return newFlashcard;
    } catch (error: any) {
      set({
        error: error.message ?? "Error creating flashcard",
        loading: false,
      });
      return null;
    }
  },

  updateFlashcard: async (id: string, data) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      if (data.question !== undefined) updateData.question = data.question;
      if (data.answers !== undefined) updateData.answers = data.answers;
      if (data.isMultipleChoice !== undefined)
        updateData.is_multiple_choice = data.isMultipleChoice;

      const { error } = await supabase
        .from("flashcards")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        flashcards: state.flashcards.map((flashcard) =>
          flashcard.id === id
            ? { ...flashcard, ...updateData }
            : flashcard
        ),
        currentFlashcard:
          state.currentFlashcard?.id === id
            ? { ...state.currentFlashcard, ...updateData }
            : state.currentFlashcard,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to update flashcard",
        loading: false,
      });
    }
  },

  deleteFlashcard: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { error } = await supabase.from("flashcards").delete().eq("id", id);
      if (error) throw error;

      set((state) => ({
        flashcards: state.flashcards.filter((flashcard) => flashcard.id !== id),
        currentFlashcard:
          state.currentFlashcard?.id === id ? null : state.currentFlashcard,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message ?? "Error deleting flashcard",
        loading: false,
      });
    }
  },

  setCurrentFlashcard: (flashcardId) => {
    const flashcards = get().flashcards;
    const foundFlashcard =
      flashcards.find((f) => f.id === flashcardId) || null;
    set({ currentFlashcard: foundFlashcard });
  },

  // SRS Functions
  reviewFlashcard: async (flashcardId: string, folderId: string, quality: number, timeTaken?: number) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      
      // Get current flashcard data
      const flashcard = get().flashcards.find(f => f.id === flashcardId);
      if (!flashcard) throw new Error('Flashcard not found');

      // Calculate next review using SM-2 algorithm
      const srsResult = calculateNextReview(
        quality,
        flashcard.ease_factor || 2.5,
        flashcard.interval_days || 0,
        flashcard.repetitions || 0
      );

      // Update flashcard with new SRS data
      const { error: updateError } = await supabase
        .from('flashcards')
        .update({
          ease_factor: srsResult.easeFactor,
          interval_days: srsResult.interval,
          repetitions: srsResult.repetitions,
          next_review_date: srsResult.nextReviewDate.toISOString(),
          last_reviewed_at: new Date().toISOString(),
          total_reviews: (flashcard.total_reviews || 0) + 1,
          correct_reviews: (flashcard.correct_reviews || 0) + (srsResult.wasCorrect ? 1 : 0),
        })
        .eq('id', flashcardId);

      if (updateError) throw updateError;

      // Save review to history
      const { error: reviewError } = await supabase
        .from('flashcard_reviews')
        .insert({
          flashcard_id: flashcardId,
          folder_id: folderId,
          quality,
          was_correct: srsResult.wasCorrect,
          time_taken_seconds: timeTaken,
          ease_factor_after: srsResult.easeFactor,
          interval_days_after: srsResult.interval,
        });

      if (reviewError) throw reviewError;

      // Update local state
      set((state) => ({
        flashcards: state.flashcards.map((f) =>
          f.id === flashcardId
            ? {
                ...f,
                ease_factor: srsResult.easeFactor,
                interval_days: srsResult.interval,
                repetitions: srsResult.repetitions,
                next_review_date: srsResult.nextReviewDate.toISOString(),
                last_reviewed_at: new Date().toISOString(),
                total_reviews: (f.total_reviews || 0) + 1,
                correct_reviews: (f.correct_reviews || 0) + (srsResult.wasCorrect ? 1 : 0),
              }
            : f
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message ?? 'Failed to review flashcard',
        loading: false,
      });
      throw error;
    }
  },

  fetchDueFlashcards: async (folderId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('folder_id', folderId)
        .lte('next_review_date', new Date().toISOString())
        .order('next_review_date', { ascending: true });

      if (error) throw error;
      set({ flashcards: data || [], loading: false });
    } catch (error: any) {
      set({
        error: error.message ?? 'Failed to fetch due flashcards',
        loading: false,
      });
    }
  },

  fetchStudyStats: async (folderId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      
      // Fetch all flashcards for the folder
      const { data: flashcards, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('folder_id', folderId);

      if (error) throw error;

      if (!flashcards || flashcards.length === 0) {
        set({ loading: false });
        return null;
      }

      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      const stats: StudyStats = {
        totalCards: flashcards.length,
        dueToday: flashcards.filter(f => new Date(f.next_review_date) <= now).length,
        dueThisWeek: flashcards.filter(f => new Date(f.next_review_date) <= weekFromNow).length,
        masteredCards: flashcards.filter(f => f.repetitions >= 3 && f.ease_factor >= 2.5).length,
        newCards: flashcards.filter(f => f.total_reviews === 0).length,
        averageEase: flashcards.reduce((sum, f) => sum + (f.ease_factor || 2.5), 0) / flashcards.length,
        totalReviews: flashcards.reduce((sum, f) => sum + (f.total_reviews || 0), 0),
        successRate: flashcards.reduce((sum, f) => sum + (f.total_reviews || 0), 0) > 0
          ? (flashcards.reduce((sum, f) => sum + (f.correct_reviews || 0), 0) / 
             flashcards.reduce((sum, f) => sum + (f.total_reviews || 0), 0)) * 100
          : 0,
      };

      set({ loading: false });
      return stats;
    } catch (error: any) {
      set({
        error: error.message ?? 'Failed to fetch study stats',
        loading: false,
      });
      return null;
    }
  },
}));