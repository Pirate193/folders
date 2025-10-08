'use client'
import React, { useEffect } from 'react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Folder, 
  FileText, 
  Brain, 
  File, 
  Clock, 
  TrendingUp, 
  Plus,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { formatNextReview } from '@/lib/srs-algorithm'
import { useProfileStore } from '@/stores/profileStore'

export default function Home() {
  const {
    stats,
    recentFolders,
    recentNotes,
    dueFlashcards,
    loading,
    fetchAllDashboardData,
  } = useDashboardStore()

  const {currentProfile}=useProfileStore()

  useEffect(() => {
    fetchAllDashboardData()
  }, [fetchAllDashboardData])

  if (loading && !stats) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 sm:">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back! {currentProfile?.username} </h1>
         
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your learning today
          </p>
        </div>
        <Link href="/folders">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Folders */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Folders</CardTitle>
              <Folder className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalFolders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total folders
            </p>
          </CardContent>
        </Card>

        {/* Total Notes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Notes</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalNotes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total notes
            </p>
          </CardContent>
        </Card>

        {/* Due Flashcards */}
        <Card className={stats?.dueFlashcardsToday ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats?.dueFlashcardsToday || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.dueFlashcardsToday === 0 ? 'All caught up! 🎉' : 'Cards to review'}
            </p>
          </CardContent>
        </Card>

        {/* Total Files */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Files</CardTitle>
              <File className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalFiles || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total files
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Study Section */}
      {stats && stats.dueFlashcardsToday > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Ready to Study?</h3>
                  <p className="text-sm text-muted-foreground">
                    You have {stats.dueFlashcardsToday} card{stats.dueFlashcardsToday > 1 ? 's' : ''} waiting for review across your folders
                  </p>
                </div>
              </div>
              <Button size="lg">
                Start Studying
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Overview */}
      {stats && stats.totalFlashcards > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Flashcards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFlashcards}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all folders
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Mastered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.masteredFlashcards}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalFlashcards > 0 
                  ? Math.round((stats.masteredFlashcards / stats.totalFlashcards) * 100)
                  : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overallSuccessRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalReviews} total reviews
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Folders */}
      {recentFolders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Folders</h2>
            <Link href="/folders">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFolders.map((folder) => (
              <Link key={folder.id} href={`/folders/${folder.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg truncate">{folder.name}</CardTitle>
                    </div>
                    {folder.description && (
                      <CardDescription className="line-clamp-2">
                        {folder.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{folder.noteCount} notes</span>
                      <span>{folder.flashcardCount} cards</span>
                      <span>{folder.fileCount} files</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Due Flashcards Preview */}
      {dueFlashcards.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Due for Review</h2>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="space-y-2 ">
            {dueFlashcards.slice(0, 5).map((card) => (
              <Link key={card.id} href={`/folders/${card.folder_id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer mb-2">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{card.question}</p>
                        <p className="text-sm text-muted-foreground">
                          {card.folder_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground ml-4">
                        <Clock className="h-4 w-4" />
                        <span>{formatNextReview(card.next_review_date)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Notes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentNotes.map((note) => (
              <Link key={note.id} href={`/folders/${note.folder_id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base truncate">{note.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {note.folder_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats && stats.totalFolders === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Folder className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No folders yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              Create your first folder to start organizing your notes, flashcards, and files
            </p>
            <Link href="/folders">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Folder
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
