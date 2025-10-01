'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Flashcard, useFlashcardStore } from '@/stores/flashcardStore'
import { Check, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getIntervalPreview } from '@/lib/srs-algorithm'
import { toast } from 'sonner'

interface FlashcardViewerSRSProps {
  flashcard: Flashcard
  folderId: string
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

const FlashcardViewerSRS = ({
  flashcard,
  folderId,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: FlashcardViewerSRSProps) => {
  const { reviewFlashcard } = useFlashcardStore()
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showQualityRating, setShowQualityRating] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [isReviewing, setIsReviewing] = useState(false)

  useEffect(() => {
    // Reset state when flashcard changes
    setUserAnswer('')
    setSelectedOption(null)
    setShowResult(false)
    setIsCorrect(false)
    setShowQualityRating(false)
    setStartTime(Date.now())
  }, [flashcard.id])

  const handleCheckAnswer = () => {
    if (flashcard.is_multiple_choice) {
      if (selectedOption === null) return
      const correct = flashcard.answers[selectedOption].isCorrect
      setIsCorrect(correct)
    } else {
      // For text answers, check if user's answer matches any correct answer (case-insensitive)
      const correct = flashcard.answers.some(
        (answer) =>
          answer.isCorrect &&
          answer.text.toLowerCase().trim() === userAnswer.toLowerCase().trim()
      )
      setIsCorrect(correct)
    }
    setShowResult(true)
    setShowQualityRating(true)
  }

  const handleQualityRating = async (quality: number) => {
    setIsReviewing(true)
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000) // seconds
      await reviewFlashcard(flashcard.id, folderId, quality, timeTaken)
      
      const intervalText = getIntervalPreview(
        quality,
        flashcard.ease_factor,
        flashcard.interval_days,
        flashcard.repetitions
      )
      
      toast.success(`Review saved! Next review: ${intervalText}`)
      
      // Move to next card after a short delay
      setTimeout(() => {
        handleNext()
      }, 1000)
    } catch (error) {
      toast.error('Failed to save review')
      setIsReviewing(false)
    }
  }

  const handleNext = () => {
    setUserAnswer('')
    setSelectedOption(null)
    setShowResult(false)
    setIsCorrect(false)
    setShowQualityRating(false)
    setIsReviewing(false)
    setStartTime(Date.now())
    onNext?.()
  }

  const handlePrevious = () => {
    setUserAnswer('')
    setSelectedOption(null)
    setShowResult(false)
    setIsCorrect(false)
    setShowQualityRating(false)
    setIsReviewing(false)
    setStartTime(Date.now())
    onPrevious?.()
  }

  const canCheck = flashcard.is_multiple_choice
    ? selectedOption !== null
    : userAnswer.trim() !== ''

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Question</span>
          {flashcard.total_reviews > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              Success: {Math.round((flashcard.correct_reviews / flashcard.total_reviews) * 100)}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-lg font-medium">{flashcard.question}</p>
        </div>

        {/* Answer Input */}
        {!showResult && (
          <div className="space-y-4">
            {flashcard.is_multiple_choice ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Select your answer:
                </p>
                {flashcard.answers.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    className={cn(
                      'w-full p-4 text-left border-2 rounded-lg transition-all hover:border-primary',
                      selectedOption === index
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium',
                          selectedOption === index
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        )}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{answer.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Type your answer:
                </label>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canCheck) {
                      handleCheckAnswer()
                    }
                  }}
                  className="text-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Result Display */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'p-6 rounded-lg border-2',
                isCorrect
                  ? 'bg-green-50 border-green-500 dark:bg-green-950/20'
                  : 'bg-red-50 border-red-500 dark:bg-red-950/20'
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                {isCorrect ? (
                  <>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                        Correct!
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-500">
                        Great job! You got it right.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500">
                      <X className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                        Incorrect
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-500">
                        Don't worry, keep practicing!
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Show correct answer if wrong */}
              {!isCorrect && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Correct answer{flashcard.answers.filter(a => a.isCorrect).length > 1 ? 's' : ''}:
                  </p>
                  <div className="space-y-1">
                    {flashcard.answers
                      .filter((answer) => answer.isCorrect)
                      .map((answer, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {flashcard.is_multiple_choice && (
                            <span className="font-medium text-green-600">
                              {String.fromCharCode(
                                65 + flashcard.answers.indexOf(answer)
                              )}.
                            </span>
                          )}
                          <span className="font-medium">{answer.text}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quality Rating Buttons */}
        <AnimatePresence>
          {showQualityRating && !isReviewing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-center">How well did you know this?</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleQualityRating(isCorrect ? 2 : 0)}
                  className="flex flex-col h-auto py-3 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <span className="font-semibold">Again</span>
                  <span className="text-xs text-muted-foreground">
                    {getIntervalPreview(isCorrect ? 2 : 0, flashcard.ease_factor, flashcard.interval_days, flashcard.repetitions)}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQualityRating(isCorrect ? 3 : 1)}
                  className="flex flex-col h-auto py-3 hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
                >
                  <span className="font-semibold">{isCorrect ? 'Good' : 'Hard'}</span>
                  <span className="text-xs text-muted-foreground">
                    {getIntervalPreview(isCorrect ? 3 : 1, flashcard.ease_factor, flashcard.interval_days, flashcard.repetitions)}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQualityRating(isCorrect ? 5 : 2)}
                  className="flex flex-col h-auto py-3 hover:bg-green-50 dark:hover:bg-green-950/20"
                  disabled={!isCorrect}
                >
                  <span className="font-semibold">Easy</span>
                  <span className="text-xs text-muted-foreground">
                    {getIntervalPreview(isCorrect ? 5 : 2, flashcard.ease_factor, flashcard.interval_days, flashcard.repetitions)}
                  </span>
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Choose how difficult this card was for you
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {isReviewing && (
          <div className="text-center py-4">
            <Clock className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Saving review...</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious || isReviewing}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {!showResult ? (
          <Button onClick={handleCheckAnswer} disabled={!canCheck}>
            Check Answer
          </Button>
        ) : !showQualityRating ? (
          <Button onClick={handleNext} disabled={!hasNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground">
            Rate your knowledge →
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

export default FlashcardViewerSRS
