'use client'

import { useState } from 'react'
import type { Question } from '@/lib/types'
import { Card, Button, Badge } from '@/components/ui'
import { useAppStore } from '@/lib/store'
import { generateExplanation } from '@/lib/utils'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  mode: 'quiz' | 'study'
  onNext: () => void
  onPrevious?: () => void
  showNavigation?: boolean
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  mode,
  onNext,
  onPrevious,
  showNavigation = true,
}: QuestionCardProps) {
  const { data, progress, userAnswers, answerQuestion, markUserAnswer } =
    useAppStore()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)

  const previousAnswer = progress[question.id]
  const previousUserAnswer = userAnswers[question.id]
  const temaInfo = data?.metadata.temas[question.tema]

  const handleOptionClick = (index: number) => {
    if (hasAnswered && mode === 'quiz') return
    setSelectedIndex(index)
  }

  const handleAnswer = () => {
    if (selectedIndex === null) return

    if (mode === 'quiz' && question.hasAnswer) {
      const isCorrect = selectedIndex === question.correctIndex
      answerQuestion(question, selectedIndex, isCorrect)
      setHasAnswered(true)
    } else if (mode === 'study') {
      setIsRevealed(true)
    }
  }

  const handleMarkAsCorrect = () => {
    if (selectedIndex !== null) {
      markUserAnswer(question.id, selectedIndex)
    }
  }

  const handleNext = () => {
    setSelectedIndex(null)
    setIsRevealed(false)
    setHasAnswered(false)
    onNext()
  }

  const handlePrevious = () => {
    setSelectedIndex(null)
    setIsRevealed(false)
    setHasAnswered(false)
    onPrevious?.()
  }

  const getOptionStyle = (index: number) => {
    const base =
      'w-full p-4 rounded-xl text-left transition-all duration-200 border-2'

    if (mode === 'quiz' && hasAnswered && question.hasAnswer) {
      if (index === question.correctIndex) {
        return `${base} bg-correct/20 border-correct text-white`
      }
      if (index === selectedIndex && index !== question.correctIndex) {
        return `${base} bg-incorrect/20 border-incorrect text-white`
      }
      return `${base} bg-dark-700/50 border-dark-600 text-gray-400`
    }

    if (mode === 'study' && isRevealed) {
      if (index === selectedIndex) {
        return `${base} bg-primary-500/20 border-primary-500 text-white`
      }
      if (previousUserAnswer === index) {
        return `${base} bg-correct/20 border-correct text-white`
      }
      return `${base} bg-dark-700/50 border-dark-600 text-gray-400`
    }

    if (index === selectedIndex) {
      return `${base} bg-primary-500/20 border-primary-500 text-white`
    }

    return `${base} bg-dark-700 border-dark-600 text-gray-200 hover:border-primary-500/50 hover:bg-dark-600`
  }

  return (
    <Card className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-dark-700">
        <Badge variant="info">
          {questionNumber} / {totalQuestions}
        </Badge>
        <Badge>
          {temaInfo?.icon || '📚'} {temaInfo?.name || question.tema}
        </Badge>
        {previousAnswer === 'correct' && (
          <Badge variant="success">Ya acertada</Badge>
        )}
        {previousAnswer === 'wrong' && (
          <Badge variant="error">Fallada antes</Badge>
        )}
      </div>

      {/* Reference Info */}
      <div className="text-sm text-gray-400 mb-4 space-y-1">
        <p>
          📄 {question.source} — Pregunta #{question.number}
        </p>
        <p>📂 {question.unidad}</p>
      </div>

      {/* Question */}
      <h2 className="text-lg md:text-xl font-semibold text-white mb-6 leading-relaxed">
        {question.question}
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            disabled={hasAnswered && mode === 'quiz'}
            className={getOptionStyle(index)}
          >
            <span className="font-semibold text-primary-400 mr-2">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </button>
        ))}
      </div>

      {/* Explanation (after answering in quiz mode) */}
      {mode === 'quiz' && hasAnswered && question.hasAnswer && (
        <div
          className={`p-4 rounded-xl mb-6 ${
            selectedIndex === question.correctIndex
              ? 'bg-correct/10 border border-correct/30'
              : 'bg-incorrect/10 border border-incorrect/30'
          }`}
        >
          <p
            className={`font-semibold mb-2 ${
              selectedIndex === question.correctIndex
                ? 'text-correct'
                : 'text-incorrect'
            }`}
          >
            {selectedIndex === question.correctIndex
              ? '✓ ¡Correcto!'
              : '✗ Incorrecto'}
          </p>
          <p className="text-gray-300 text-sm">
            {generateExplanation(question)}
          </p>
        </div>
      )}

      {/* Study mode revealed state */}
      {mode === 'study' && isRevealed && (
        <div className="p-4 rounded-xl mb-6 bg-dark-700 border border-dark-600">
          <p className="text-gray-300 text-sm mb-3">
            Tu selección: <strong>{String.fromCharCode(65 + (selectedIndex ?? 0))}</strong>
          </p>
          {previousUserAnswer !== undefined && previousUserAnswer !== selectedIndex && (
            <p className="text-correct text-sm">
              Respuesta marcada previamente:{' '}
              <strong>{String.fromCharCode(65 + previousUserAnswer)}</strong>
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleMarkAsCorrect}
          >
            Marcar mi selección como correcta
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!hasAnswered && !isRevealed && (
          <Button
            onClick={handleAnswer}
            disabled={selectedIndex === null}
            className="flex-1"
          >
            {mode === 'quiz' ? 'Responder' : 'Revelar mi selección'}
          </Button>
        )}

        {showNavigation && (hasAnswered || isRevealed) && (
          <>
            {onPrevious && (
              <Button variant="outline" onClick={handlePrevious}>
                ← Anterior
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {questionNumber < totalQuestions ? 'Siguiente →' : 'Finalizar'}
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
