'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useFlashcardStore, StudyStats } from '@/stores/flashcardStore'
import { Brain, Calendar, CheckCircle2, Clock, TrendingUp, Zap } from 'lucide-react'
import { Skeleton } from './ui/skeleton'
import { Progress } from './ui/progress'

interface StudyDashboardProps {
  folderId: string
}

const StudyDashboard = ({ folderId }: StudyDashboardProps) => {
  const { fetchStudyStats, loading } = useFlashcardStore()
  const [stats, setStats] = useState<StudyStats | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchStudyStats(folderId)
      setStats(data)
    }
    loadStats()
  }, [folderId, fetchStudyStats])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const masteryPercentage = stats.totalCards > 0 
    ? Math.round((stats.masteredCards / stats.totalCards) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Due Today */}
        <Card className={stats.dueToday > 0 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.dueToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.dueToday === 0 ? 'All caught up! 🎉' : 'Ready to review'}
            </p>
          </CardContent>
        </Card>

        {/* Due This Week */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.dueThisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cards to review
            </p>
          </CardContent>
        </Card>

        {/* Mastered Cards */}
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Mastered</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.masteredCards}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {masteryPercentage}% of total
            </p>
          </CardContent>
        </Card>

        {/* New Cards */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">New Cards</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.newCards}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Never reviewed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mastery Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Mastery Progress
            </CardTitle>
            <CardDescription>
              {stats.masteredCards} of {stats.totalCards} cards mastered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{masteryPercentage}%</span>
              </div>
              <Progress value={masteryPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-muted rounded">
                <div className="text-lg font-bold">{stats.masteredCards}</div>
                <div className="text-xs text-muted-foreground">Mastered</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="text-lg font-bold">
                  {stats.totalCards - stats.masteredCards - stats.newCards}
                </div>
                <div className="text-xs text-muted-foreground">Learning</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="text-lg font-bold">{stats.newCards}</div>
                <div className="text-xs text-muted-foreground">New</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>
              Your study statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="text-2xl font-bold text-green-600">
                  {Math.round(stats.successRate)}%
                </span>
              </div>
              <Progress value={stats.successRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
                <div className="text-2xl font-bold">{stats.totalReviews}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Ease</div>
                <div className="text-2xl font-bold">{stats.averageEase.toFixed(1)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Recommendation */}
      {stats.dueToday > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Ready to Study?</h3>
                <p className="text-sm text-muted-foreground">
                  You have {stats.dueToday} card{stats.dueToday > 1 ? 's' : ''} waiting for review. 
                  Keep up the momentum!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Caught Up Message */}
      {stats.dueToday === 0 && stats.totalCards > 0 && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-700 dark:text-green-400">
                  All Caught Up! 🎉
                </h3>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Great work! No cards due for review right now. 
                  Next review: {stats.dueThisWeek - stats.dueToday} card{stats.dueThisWeek - stats.dueToday !== 1 ? 's' : ''} this week.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default StudyDashboard
