'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Check } from 'lucide-react'

interface Question {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  questionText: string
  options?: string[]
  correctAnswer: string | number
}

interface QuestionBuilderProps {
  onAdd: (question: Question) => void
  onCancel: () => void
}

export function QuestionBuilder({ onAdd, onCancel }: QuestionBuilderProps) {
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'true-false' | 'short-answer'>('multiple-choice')
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState<number | string>(0)
  const [shortAnswer, setShortAnswer] = useState('')

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
      if (correctAnswer === index) {
        setCorrectAnswer(0)
      }
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = () => {
    if (!questionText.trim()) {
      alert('Please enter a question')
      return
    }

    if (questionType === 'multiple-choice' && options.some(opt => !opt.trim())) {
      alert('Please fill all answer options')
      return
    }

    if (questionType === 'short-answer' && !shortAnswer.trim()) {
      alert('Please provide the correct answer')
      return
    }

    const question: Question = {
      id: Date.now().toString(),
      type: questionType,
      questionText,
      options: questionType === 'multiple-choice' ? options : undefined,
      correctAnswer: questionType === 'short-answer' ? shortAnswer : correctAnswer
    }

    onAdd(question)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add Question</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Type */}
          <div className="space-y-3">
            <Label>Question Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant={questionType === 'multiple-choice' ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => setQuestionType('multiple-choice')}
              >
                Multiple Choice
              </Button>
              <Button
                variant={questionType === 'true-false' ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => setQuestionType('true-false')}
              >
                True/False
              </Button>
              <Button
                variant={questionType === 'short-answer' ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => setQuestionType('short-answer')}
              >
                Short Answer
              </Button>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text *</Label>
            <Textarea
              id="question-text"
              placeholder="What is the capital of France?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
            />
          </div>

          {/* Answer Options */}
          {questionType === 'multiple-choice' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Answer Options</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="gap-2"
                >
                  <Plus className="h-3 w-3" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Button
                      variant={correctAnswer === index ? 'default' : 'outline'}
                      size="sm"
                      className="w-8 h-8 p-0 shrink-0"
                      onClick={() => setCorrectAnswer(index)}
                      title="Mark as correct"
                    >
                      {correctAnswer === index && <Check className="h-3 w-3" />}
                    </Button>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                    {options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click the checkbox to mark the correct answer
              </p>
            </div>
          )}

          {questionType === 'true-false' && (
            <div className="space-y-3">
              <Label>Correct Answer</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={correctAnswer === 0 ? 'default' : 'outline'}
                  onClick={() => setCorrectAnswer(0)}
                >
                  True
                </Button>
                <Button
                  variant={correctAnswer === 1 ? 'default' : 'outline'}
                  onClick={() => setCorrectAnswer(1)}
                >
                  False
                </Button>
              </div>
            </div>
          )}

          {questionType === 'short-answer' && (
            <div className="space-y-2">
              <Label htmlFor="short-answer">Correct Answer *</Label>
              <Input
                id="short-answer"
                placeholder="Enter the correct answer"
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Answer will be case-insensitive
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
