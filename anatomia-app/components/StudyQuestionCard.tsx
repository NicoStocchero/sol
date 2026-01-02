'use client'

import { useState } from 'react'
import type { Question, ConfidenceLevel } from '@/lib/types'
import { Card, Button, Badge } from '@/components/ui'
import { setStudyQuestionProgress, getStudyProgress } from '@/lib/storage'

interface StudyQuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  onNext: () => void
  onPrevious?: () => void
}

export function StudyQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onNext,
  onPrevious,
}: StudyQuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showConfidence, setShowConfidence] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [markedForReview, setMarkedForReview] = useState(false)

  const studyProgress = getStudyProgress()
  const previousProgress = studyProgress[question.id]

  const handleOptionClick = (index: number) => {
    if (hasAnswered) return
    setSelectedIndex(index)
  }

  const handleShowConfidence = () => {
    if (selectedIndex === null) return
    setShowConfidence(true)
  }

  const handleConfidence = (confidence: ConfidenceLevel) => {
    if (selectedIndex === null) return
    setStudyQuestionProgress(question.id, selectedIndex, confidence, markedForReview)
    setHasAnswered(true)
  }

  const handleNext = () => {
    setSelectedIndex(null)
    setShowConfidence(false)
    setHasAnswered(false)
    setMarkedForReview(false)
    onNext()
  }

  const handlePrevious = () => {
    setSelectedIndex(null)
    setShowConfidence(false)
    setHasAnswered(false)
    setMarkedForReview(false)
    onPrevious?.()
  }

  const getOptionStyle = (index: number) => {
    const base = 'w-full p-4 rounded-xl text-left transition-all duration-200 border-2'

    if (hasAnswered && index === selectedIndex) {
      return `${base} bg-primary-500/20 border-primary-500 text-white`
    }

    if (index === selectedIndex) {
      return `${base} bg-primary-500/20 border-primary-500 text-white`
    }

    return `${base} bg-dark-700 border-dark-600 text-gray-200 hover:border-primary-500/50 hover:bg-dark-600`
  }

  const getConfidenceColor = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'seguro': return 'text-correct'
      case 'duda': return 'text-yellow-400'
      case 'noidea': return 'text-incorrect'
    }
  }

  return (
    <Card className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-dark-700">
        <Badge variant="info">
          {questionNumber} / {totalQuestions}
        </Badge>
        <Badge>📖 Modo Estudio</Badge>
        {previousProgress && (
          <Badge variant={previousProgress.confidence === 'seguro' ? 'success' : previousProgress.confidence === 'duda' ? 'warning' : 'error'}>
            Revisada ({previousProgress.timesReviewed}x)
          </Badge>
        )}
      </div>

      {/* Reference Info */}
      <div className="text-sm text-gray-400 mb-4 space-y-1">
        <p>📄 {question.source} — Pregunta #{question.number}</p>
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
            disabled={hasAnswered}
            className={getOptionStyle(index)}
          >
            <span className="font-semibold text-primary-400 mr-2">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </button>
        ))}
      </div>

      {/* Mark for review checkbox */}
      {!hasAnswered && (
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={markedForReview}
            onChange={(e) => setMarkedForReview(e.target.checked)}
            className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-400">📌 Marcar para verificar después</span>
        </label>
      )}

      {/* Confidence selection */}
      {showConfidence && !hasAnswered && (
        <div className="p-4 rounded-xl mb-6 bg-dark-700 border border-dark-600 animate-fade-in">
          <p className="text-white font-medium mb-3">¿Qué tan segura estás de tu respuesta?</p>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleConfidence('seguro')}
              className="border-correct text-correct hover:bg-correct/20"
            >
              ✅ Segura
            </Button>
            <Button
              variant="outline"
              onClick={() => handleConfidence('duda')}
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/20"
            >
              🤔 Dudas
            </Button>
            <Button
              variant="outline"
              onClick={() => handleConfidence('noidea')}
              className="border-incorrect text-incorrect hover:bg-incorrect/20"
            >
              ❓ No sé
            </Button>
          </div>
        </div>
      )}

      {/* Result after answering */}
      {hasAnswered && (
        <div className="p-4 rounded-xl mb-6 bg-dark-700 border border-dark-600 animate-fade-in">
          <p className="text-white mb-2">
            Tu respuesta: <strong className="text-primary-400">{String.fromCharCode(65 + (selectedIndex ?? 0))}</strong>
          </p>
          {markedForReview && (
            <p className="text-yellow-400 text-sm">📌 Marcada para verificar con el libro</p>
          )}
          {previousProgress && previousProgress.userAnswer !== selectedIndex && (
            <p className="text-gray-400 text-sm mt-2">
              Antes habías elegido: <strong>{String.fromCharCode(65 + previousProgress.userAnswer)}</strong>
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!showConfidence && !hasAnswered && (
          <Button
            onClick={handleShowConfidence}
            disabled={selectedIndex === null}
            className="flex-1"
          >
            Confirmar selección
          </Button>
        )}

        {hasAnswered && (
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
