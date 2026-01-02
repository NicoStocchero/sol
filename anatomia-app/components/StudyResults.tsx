'use client'

import Link from 'next/link'
import { Card, Button, ProgressBar } from '@/components/ui'

interface StudyResultsProps {
  totalQuestions: number
  seguro: number
  duda: number
  noidea: number
  markedForReview: number
  onRetry?: () => void
  onViewMarked?: () => void
}

export function StudyResults({
  totalQuestions,
  seguro,
  duda,
  noidea,
  markedForReview,
  onRetry,
  onViewMarked,
}: StudyResultsProps) {
  const seguroPercent = totalQuestions > 0 ? (seguro / totalQuestions) * 100 : 0
  const dudaPercent = totalQuestions > 0 ? (duda / totalQuestions) * 100 : 0
  const noideaPercent = totalQuestions > 0 ? (noidea / totalQuestions) * 100 : 0

  return (
    <Card className="max-w-lg mx-auto text-center animate-fade-in" padding="lg">
      <div className="text-6xl mb-4">📊</div>
      <h2 className="text-2xl font-bold text-white mb-2">Sesión de Estudio</h2>
      <p className="text-gray-400 mb-6">Completaste {totalQuestions} preguntas</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-correct/10 rounded-xl border border-correct/30">
          <div className="text-3xl font-bold text-correct">{seguro}</div>
          <div className="text-sm text-gray-400">Seguras</div>
          <div className="text-xs text-correct">{Math.round(seguroPercent)}%</div>
        </div>
        <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
          <div className="text-3xl font-bold text-yellow-400">{duda}</div>
          <div className="text-sm text-gray-400">Con dudas</div>
          <div className="text-xs text-yellow-400">{Math.round(dudaPercent)}%</div>
        </div>
        <div className="p-4 bg-incorrect/10 rounded-xl border border-incorrect/30">
          <div className="text-3xl font-bold text-incorrect">{noidea}</div>
          <div className="text-sm text-gray-400">Sin idea</div>
          <div className="text-xs text-incorrect">{Math.round(noideaPercent)}%</div>
        </div>
        <div className="p-4 bg-primary-500/10 rounded-xl border border-primary-500/30">
          <div className="text-3xl font-bold text-primary-400">{markedForReview}</div>
          <div className="text-sm text-gray-400">Para verificar</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-correct">Seguras</span>
            <span className="text-gray-400">{Math.round(seguroPercent)}%</span>
          </div>
          <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-correct rounded-full transition-all" style={{ width: `${seguroPercent}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-yellow-400">Con dudas</span>
            <span className="text-gray-400">{Math.round(dudaPercent)}%</span>
          </div>
          <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${dudaPercent}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-incorrect">Sin idea</span>
            <span className="text-gray-400">{Math.round(noideaPercent)}%</span>
          </div>
          <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-incorrect rounded-full transition-all" style={{ width: `${noideaPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {markedForReview > 0 && onViewMarked && (
          <Button variant="outline" onClick={onViewMarked} className="w-full">
            📌 Ver marcadas para verificar ({markedForReview})
          </Button>
        )}
        {onRetry && (
          <Button variant="secondary" onClick={onRetry} className="w-full">
            Nueva sesión de estudio
          </Button>
        )}
        <Link href="/" className="w-full">
          <Button className="w-full">Volver al inicio</Button>
        </Link>
      </div>
    </Card>
  )
}
