'use client'

import Link from 'next/link'
import { Card, Button, ProgressBar } from '@/components/ui'

interface QuizResultsProps {
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  onRetry?: () => void
}

export function QuizResults({
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  onRetry,
}: QuizResultsProps) {
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

  const getMessage = () => {
    if (accuracy >= 90) return { emoji: '🎉', text: '¡Excelente! Dominas este tema' }
    if (accuracy >= 70) return { emoji: '💪', text: '¡Muy bien! Sigue así' }
    if (accuracy >= 50) return { emoji: '📚', text: 'Bien, pero hay que repasar' }
    return { emoji: '💡', text: 'A seguir estudiando, vos podés' }
  }

  const message = getMessage()

  return (
    <Card className="max-w-lg mx-auto text-center animate-fade-in" padding="lg">
      <div className="text-6xl mb-4">{message.emoji}</div>
      <h2 className="text-2xl font-bold text-white mb-2">{message.text}</h2>

      <div className="my-8">
        <div className="text-5xl font-bold text-primary-400 mb-2">
          {Math.round(accuracy)}%
        </div>
        <p className="text-gray-400">de respuestas correctas</p>
      </div>

      <ProgressBar
        value={accuracy}
        color={accuracy >= 70 ? 'correct' : accuracy >= 50 ? 'warning' : 'incorrect'}
        size="lg"
        className="mb-8"
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-dark-700 rounded-xl">
          <div className="text-2xl font-bold text-white">{totalQuestions}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="p-4 bg-correct/10 rounded-xl">
          <div className="text-2xl font-bold text-correct">{correctAnswers}</div>
          <div className="text-xs text-gray-400">Correctas</div>
        </div>
        <div className="p-4 bg-incorrect/10 rounded-xl">
          <div className="text-2xl font-bold text-incorrect">{wrongAnswers}</div>
          <div className="text-xs text-gray-400">Incorrectas</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="flex-1">
            Reintentar
          </Button>
        )}
        <Link href="/quiz" className="flex-1">
          <Button variant="secondary" className="w-full">
            Elegir otro quiz
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button className="w-full">Volver al inicio</Button>
        </Link>
      </div>
    </Card>
  )
}
