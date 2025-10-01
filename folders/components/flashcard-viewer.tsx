'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Flashcard } from '@/stores/flashcardStore'
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FlashcardViewerProps {
  flashcard: Flashcard
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

const FlashcardViewer = ({
  flashcard,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: FlashcardViewerProps) => {
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    // Reset state when flashcard changes
    setUserAnswer('')
    setSelectedOption(null)
    setShowResult(false)
    setIsCorrect(false)
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
  }

  const handleNext = () => {
    setUserAnswer('')
    setSelectedOption(null)
    setShowResult(false)
    setIsCorrect(false)
    onNext?.()
  }

  const handlePrevious = () => {
    setUserAnswer('')
    setSelectedOption(null)
    setShowResult(false)
    setIsCorrect(false)
    onPrevious?.()
  }

  const canCheck = flashcard.is_multiple_choice
    ? selectedOption !== null
    : userAnswer.trim() !== ''

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Question</CardTitle>
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
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {!showResult ? (
          <Button onClick={handleCheckAnswer} disabled={!canCheck}>
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!hasNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default FlashcardViewer
