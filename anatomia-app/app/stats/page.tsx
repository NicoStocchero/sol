'use client'

import { useAppStore } from '@/lib/store'
import { Card, Badge, ProgressBar } from '@/components/ui'
import { StatsChart } from '@/components'
import { formatPercentage } from '@/lib/utils'

export default function StatsPage() {
  const { user, data, stats, progress, wrongCounts } = useAppStore()

  if (!data || !user || !stats) {
    return (
      <div className="container-app">
        <p className="text-gray-400 text-center">Cargando estadísticas...</p>
      </div>
    )
  }

  const { metadata } = data
  const answeredCount = Object.keys(progress).length
  const wrongCount = Object.keys(wrongCounts).length

  return (
    <div className="container-app">
      <h1 className="page-title">📊 Estadísticas</h1>

      {/* General Stats */}
      <Card className="mb-6">
        <h2 className="section-title">Resumen General</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-dark-700 rounded-xl">
            <div className="text-3xl font-bold text-white">
              {user.totalAnswered}
            </div>
            <div className="text-sm text-gray-400">Total Respondidas</div>
          </div>
          <div className="text-center p-4 bg-dark-700 rounded-xl">
            <div className="text-3xl font-bold text-correct">
              {user.totalCorrect}
            </div>
            <div className="text-sm text-gray-400">Correctas</div>
          </div>
          <div className="text-center p-4 bg-dark-700 rounded-xl">
            <div className="text-3xl font-bold text-incorrect">{wrongCount}</div>
            <div className="text-sm text-gray-400">Pendientes Repaso</div>
          </div>
          <div className="text-center p-4 bg-dark-700 rounded-xl">
            <div className="text-3xl font-bold text-primary-400">
              {formatPercentage(stats.accuracy)}
            </div>
            <div className="text-sm text-gray-400">Precisión</div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-4">
          <ProgressBar
            value={answeredCount}
            max={metadata.withAnswers}
            showLabel
            label="Progreso Quiz (preguntas con respuesta)"
            color="primary"
          />
          <ProgressBar
            value={stats.totalCorrect}
            max={stats.totalAnswered || 1}
            showLabel
            label="Tasa de aciertos"
            color={stats.accuracy >= 70 ? 'correct' : stats.accuracy >= 50 ? 'warning' : 'incorrect'}
          />
        </div>
      </Card>

      {/* User Stats */}
      <Card className="mb-6">
        <h2 className="section-title">Tu Perfil</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-dark-700 rounded-xl">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xl font-bold text-white">{user.streakDays}</div>
            <div className="text-sm text-gray-400">Días de racha</div>
          </div>
          <div className="p-4 bg-dark-700 rounded-xl">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-sm font-bold text-white">
              {new Date(user.createdAt).toLocaleDateString('es-AR')}
            </div>
            <div className="text-sm text-gray-400">Fecha de inicio</div>
          </div>
        </div>
      </Card>

      {/* Weak/Strong Topics */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Weakest */}
        <Card>
          <h2 className="section-title flex items-center gap-2">
            <span>⚠️</span> Temas a Repasar
          </h2>
          {stats.weakestTemas.length > 0 ? (
            <div className="space-y-3">
              {stats.weakestTemas.map((tema) => {
                const temaInfo = metadata.temas[tema]
                const temaStat = stats.temaStats[tema]
                return (
                  <div
                    key={tema}
                    className="flex items-center justify-between p-3 bg-dark-700 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{temaInfo?.icon || '📚'}</span>
                      <span className="text-white">{temaInfo?.name || tema}</span>
                    </div>
                    <Badge variant="error">
                      {formatPercentage(temaStat?.accuracy || 0)}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              Responde más preguntas para ver recomendaciones
            </p>
          )}
        </Card>

        {/* Strongest */}
        <Card>
          <h2 className="section-title flex items-center gap-2">
            <span>💪</span> Temas Dominados
          </h2>
          {stats.strongestTemas.length > 0 ? (
            <div className="space-y-3">
              {stats.strongestTemas.map((tema) => {
                const temaInfo = metadata.temas[tema]
                const temaStat = stats.temaStats[tema]
                return (
                  <div
                    key={tema}
                    className="flex items-center justify-between p-3 bg-dark-700 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{temaInfo?.icon || '📚'}</span>
                      <span className="text-white">{temaInfo?.name || tema}</span>
                    </div>
                    <Badge variant="success">
                      {formatPercentage(temaStat?.accuracy || 0)}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              Responde más preguntas para ver tus fortalezas
            </p>
          )}
        </Card>
      </div>

      {/* Stats by Topic */}
      <Card className="mb-6">
        <h2 className="section-title">Rendimiento por Tema</h2>
        <StatsChart type="tema" limit={15} />
      </Card>

      {/* Stats by Unit */}
      <Card>
        <h2 className="section-title">Rendimiento por Unidad</h2>
        <StatsChart type="unidad" limit={10} />
      </Card>
    </div>
  )
}
