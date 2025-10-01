'use client'
import React, { useEffect, useState } from 'react'
import { useFlashcardStore } from '@/stores/flashcardStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Plus, MoreVertical, Trash2, Play, Brain, Sparkles } from 'lucide-react'
import { Skeleton } from './ui/skeleton'
import FlashcardCreateDialog from './flashcard-create-dialog'
import FlashcardAIGenerateDialog from './flashcard-ai-generate-dialog'
import FlashcardViewerSRS from './flashcard-viewer-srs'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'

interface FlashcardListProps {
  folderId: string
}

const FlashcardList = ({ folderId }: FlashcardListProps) => {
  const {
    flashcards,
    loading,
    fetchFlashcardsByFolder,
    fetchDueFlashcards,
    deleteFlashcard,
    setCurrentFlashcard
  } = useFlashcardStore()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [aiGenerateDialogOpen, setAiGenerateDialogOpen] = useState(false)
  const [studyMode, setStudyMode] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [flashcardToDelete, setFlashcardToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchFlashcardsByFolder(folderId)
  }, [folderId, fetchFlashcardsByFolder])

  const handleDelete = async () => {
    if (!flashcardToDelete) return
    
    try {
      await deleteFlashcard(flashcardToDelete)
      toast.success('Flashcard deleted successfully')
      setDeleteDialogOpen(false)
      setFlashcardToDelete(null)
    } catch {
      toast.error('Failed to delete flashcard')
    }
  }

  const handleStartStudy = async () => {
    // Fetch only due cards for study mode
    await fetchDueFlashcards(folderId)
    if (flashcards.length > 0) {
      setCurrentIndex(0)
      setStudyMode(true)
    } else {
      toast.info('No cards due for review right now!')
    }
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleExitStudy = async () => {
    setStudyMode(false)
    setCurrentIndex(0)
    // Reload all flashcards when exiting study mode
    await fetchFlashcardsByFolder(folderId)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  // Study Mode View
  if (studyMode && flashcards.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Study Mode</h2>
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
          </div>
          <Button variant="outline" onClick={handleExitStudy}>
            Exit Study Mode
          </Button>
        </div>

        <FlashcardViewerSRS
          flashcard={flashcards[currentIndex]}
          folderId={folderId}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={currentIndex < flashcards.length - 1}
          hasPrevious={currentIndex > 0}
        />
      </div>
    )
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Flashcards</h2>
          <p className="text-sm text-muted-foreground">
            {flashcards.length} {flashcards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <div className="flex gap-2">
          {flashcards.length > 0 && (
            <Button onClick={handleStartStudy}>
              <Play className="h-4 w-4 mr-2" />
              Start Studying
            </Button>
          )}
          <Button variant="outline" onClick={() => setAiGenerateDialogOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Flashcard
          </Button>
        </div>
      </div>

     

      {/* Empty State */}
      {flashcards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No flashcards yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              Create your first flashcard to start studying. Flashcards are a great way to memorize and test your knowledge.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAiGenerateDialogOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Flashcard Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map((flashcard) => (
            <Card key={flashcard.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">
                      {flashcard.question}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {flashcard.is_multiple_choice ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          Multiple Choice
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          Text Answer
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentFlashcard(flashcard.id)
                          setCurrentIndex(flashcards.indexOf(flashcard))
                          setStudyMode(true)
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Study
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setFlashcardToDelete(flashcard.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {flashcard.answers.length}{' '}
                    {flashcard.answers.length === 1 ? 'answer' : 'answers'}
                  </p>
                  {flashcard.is_multiple_choice && (
                    <div className="space-y-1">
                      {flashcard.answers.slice(0, 3).map((answer, index) => (
                        <div
                          key={index}
                          className="text-xs text-muted-foreground flex items-center gap-2"
                        >
                          <span className="font-medium">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="truncate">{answer.text}</span>
                        </div>
                      ))}
                      {flashcard.answers.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{flashcard.answers.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <FlashcardCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        folderId={folderId}
      />

      {/* AI Generate Dialog */}
      <FlashcardAIGenerateDialog
        open={aiGenerateDialogOpen}
        onOpenChange={setAiGenerateDialogOpen}
        folderId={folderId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flashcard? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default FlashcardList
