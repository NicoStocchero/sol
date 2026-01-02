'use client'

import { useAppStore } from '@/lib/store'
import { formatPercentage } from '@/lib/utils'

interface StatsChartProps {
  type: 'tema' | 'unidad'
  limit?: number
}

export function StatsChart({ type, limit = 10 }: StatsChartProps) {
  const { stats, data } = useAppStore()

  if (!stats || !data) return null

  const statsData = type === 'tema' ? stats.temaStats : stats.unidadStats
  const entries = Object.entries(statsData)
    .filter(([, stat]) => stat.total > 0)
    .sort((a, b) => {
      // Sort by answered count descending, then by accuracy
      if (b[1].answered !== a[1].answered) {
        return b[1].answered - a[1].answered
      }
      return b[1].accuracy - a[1].accuracy
    })
    .slice(0, limit)

  if (entries.length === 0) {
    return (
      <p className="text-gray-400 text-center py-8">
        No hay datos suficientes todavía
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map(([key, stat]) => {
        const temaInfo = type === 'tema' ? data.metadata.temas[key] : null
        const displayName = temaInfo?.name || key
        const icon = temaInfo?.icon || '📚'

        const getBarColor = (accuracy: number) => {
          if (accuracy >= 80) return 'bg-correct'
          if (accuracy >= 60) return 'bg-yellow-500'
          return 'bg-incorrect'
        }

        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 flex items-center gap-2">
                <span>{icon}</span>
                <span className="truncate">{displayName}</span>
              </span>
              <span className="text-gray-400 ml-2 shrink-0">
                {stat.correct}/{stat.answered}{' '}
                <span className="text-gray-500">
                  ({formatPercentage(stat.accuracy)})
                </span>
              </span>
            </div>
            <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                  stat.accuracy
                )}`}
                style={{
                  width: `${stat.answered > 0 ? stat.accuracy : 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stat.answered} respondidas</span>
              <span>{stat.total} total</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
