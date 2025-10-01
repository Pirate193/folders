'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { useFlashcardStore, FlashcardAnswer } from '@/stores/flashcardStore'
import { Loader2, Plus, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from './ui/textarea'

interface FlashcardCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId: string
}

const FlashcardCreateDialog = ({ open, onOpenChange, folderId }: FlashcardCreateDialogProps) => {
  const { createFlashcard, loading } = useFlashcardStore()
  const [question, setQuestion] = useState('')
  const [isMultipleChoice, setIsMultipleChoice] = useState(false)
  const [answers, setAnswers] = useState<FlashcardAnswer[]>([
    { text: '', isCorrect: false }
  ])

  const handleAddAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, { text: '', isCorrect: false }])
    } else {
      toast.error('Maximum 6 answers allowed')
    }
  }

  const handleRemoveAnswer = (index: number) => {
    if (answers.length > 1) {
      setAnswers(answers.filter((_, i) => i !== index))
    }
  }

  const handleAnswerTextChange = (index: number, text: string) => {
    const newAnswers = [...answers]
    newAnswers[index].text = text
    setAnswers(newAnswers)
  }

  const handleAnswerCorrectToggle = (index: number) => {
    const newAnswers = [...answers]
    if (isMultipleChoice) {
      // For multiple choice, only one answer can be correct
      newAnswers.forEach((answer, i) => {
        answer.isCorrect = i === index
      })
    } else {
      // For text answer, toggle the correct flag
      newAnswers[index].isCorrect = !newAnswers[index].isCorrect
    }
    setAnswers(newAnswers)
  }

  const handleModeToggle = (checked: boolean) => {
    setIsMultipleChoice(checked)
    if (checked) {
      // When switching to multiple choice, ensure at least 2 answers
      if (answers.length < 2) {
        setAnswers([
          { text: '', isCorrect: true },
          { text: '', isCorrect: false }
        ])
      } else {
        // Ensure only one answer is marked correct
        const newAnswers = answers.map((answer, i) => ({
          ...answer,
          isCorrect: i === 0
        }))
        setAnswers(newAnswers)
      }
    } else {
      // When switching to text answer, keep only one answer
      setAnswers([{ text: answers[0]?.text || '', isCorrect: true }])
    }
  }

  const handleSave = async () => {
    // Validation
    if (!question.trim()) {
      toast.error('Question is required')
      return
    }

    const validAnswers = answers.filter(a => a.text.trim())
    if (validAnswers.length === 0) {
      toast.error('At least one answer is required')
      return
    }

    if (isMultipleChoice && validAnswers.length < 2) {
      toast.error('Multiple choice requires at least 2 answers')
      return
    }

    const hasCorrectAnswer = validAnswers.some(a => a.isCorrect)
    if (!hasCorrectAnswer) {
      toast.error('Please mark at least one answer as correct')
      return
    }

    try {
      await createFlashcard({
        folderId,
        question: question.trim(),
        answers: validAnswers,
        isMultipleChoice
      })
      toast.success('Flashcard created successfully!')
      handleClose()
    } catch (error) {
      console.error(error)
      toast.error('Failed to create flashcard')
    }
  }

  const handleClose = () => {
    setQuestion('')
    setIsMultipleChoice(false)
    setAnswers([{ text: '', isCorrect: false }])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Create Flashcard</DialogTitle>
          <DialogDescription>
            Add a new flashcard to help you study
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question Field */}
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question..."
              className="min-h-[100px]"
            />
          </div>

          {/* Multiple Choice Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="multiple-choice" className="text-base">
                Multiple Choice
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable to create a multiple choice question
              </p>
            </div>
            <Switch
              id="multiple-choice"
              checked={isMultipleChoice}
              onCheckedChange={handleModeToggle}
            />
          </div>

          {/* Answers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                {isMultipleChoice ? 'Answer Options' : 'Correct Answer(s)'}
              </Label>
              {isMultipleChoice && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAnswer}
                  disabled={answers.length >= 6}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {answers.map((answer, index) => (
                <div key={index} className="flex items-start gap-2">
                  {isMultipleChoice && (
                    <div className="flex items-center justify-center w-8 h-10 text-sm font-medium text-muted-foreground">
                      {String.fromCharCode(65 + index)}.
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      value={answer.text}
                      onChange={(e) => handleAnswerTextChange(index, e.target.value)}
                      placeholder={isMultipleChoice ? `Option ${String.fromCharCode(65 + index)}` : 'Enter correct answer'}
                    />
                  </div>
                  <Button
                    type="button"
                    variant={answer.isCorrect ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handleAnswerCorrectToggle(index)}
                    title={answer.isCorrect ? 'Correct answer' : 'Mark as correct'}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  {isMultipleChoice && answers.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAnswer(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {isMultipleChoice && (
              <p className="text-xs text-muted-foreground">
                Click the checkmark to mark the correct answer
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Flashcard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FlashcardCreateDialog
