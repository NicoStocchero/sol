'use client'

import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Card, Button, ProgressBar, Badge } from '@/components/ui'
import { formatPercentage } from '@/lib/utils'

export default function Dashboard() {
  const { user, data, stats, progress, wrongCounts } = useAppStore()

  if (!data || !user) return null

  const { metadata } = data
  const questionsWithAnswers = metadata.withAnswers
  const answeredCount = Object.keys(progress).length
  const wrongCount = Object.keys(wrongCounts).length

  const quickActions = [
    {
      href: '/quiz/random',
      icon: '🎲',
      title: 'Quiz Aleatorio',
      description: '10 preguntas random',
      color: 'from-purple-500/20 to-pink-500/20',
    },
    {
      href: '/quiz/errors',
      icon: '❌',
      title: 'Repasar Errores',
      description: `${wrongCount} pregunta${wrongCount !== 1 ? 's' : ''}`,
      color: 'from-red-500/20 to-orange-500/20',
      disabled: wrongCount === 0,
    },
    {
      href: '/study',
      icon: '📖',
      title: 'Modo Estudio',
      description: `${metadata.withoutAnswers} sin respuesta`,
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      href: '/quiz',
      icon: '📝',
      title: 'Quiz por Tema',
      description: 'Elige un tema',
      color: 'from-green-500/20 to-emerald-500/20',
    },
  ]

  return (
    <div className="container-app">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          ¡Hola, {user.name}! 👋
        </h1>
        <p className="text-gray-400">
          {user.streakDays > 1
            ? `🔥 ${user.streakDays} días de racha`
            : 'Listo para estudiar hoy?'}
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <h2 className="section-title flex items-center gap-2">
          <span>📊</span> Tu Progreso
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-dark-700 rounded-xl">
            <div className="text-3xl font-bold text-primary-400">
              {answeredCount}
            </div>
            <div className="text-sm text-gray-400">Respondidas</div>
          </div>
          <div className="text-center p-4 bg-dark-700 rounded-xl">
            <div className="text-3xl font-bold text-correct">
              {stats?.totalCorrect || 0}
            </div>
            <div className="text-sm text-gray-400">Correctas</div>
          </div>
          <div className="text-center p-4 bg-dark-700 rounded-xl">
            <div className="text-3xl font-bold text-incorrect">
              {wrongCount}
            </div>
            <div className="text-sm text-gray-400">A repasar</div>
          </div>
          <div className="text-center p-4 bg-dark-700 rounded-xl">
            <div className="text-3xl font-bold text-white">
              {formatPercentage(stats?.accuracy || 0)}
            </div>
            <div className="text-sm text-gray-400">Precisión</div>
          </div>
        </div>

        <ProgressBar
          value={answeredCount}
          max={questionsWithAnswers}
          showLabel
          label={`${answeredCount}/${questionsWithAnswers} preguntas con respuesta`}
          color="primary"
        />
      </Card>

      {/* Quick Actions */}
      <h2 className="section-title">⚡ Acciones Rápidas</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.disabled ? '#' : action.href}
            className={action.disabled ? 'pointer-events-none' : ''}
          >
            <Card
              className={`h-full hover:scale-[1.02] transition-transform bg-gradient-to-br ${action.color} ${
                action.disabled ? 'opacity-50' : ''
              }`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h3 className="font-semibold text-white mb-1">{action.title}</h3>
              <p className="text-sm text-gray-400">{action.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Topics Overview */}
      {stats && stats.weakestTemas.length > 0 && (
        <Card className="mb-6">
          <h2 className="section-title flex items-center gap-2">
            <span>🎯</span> Temas a Repasar
          </h2>
          <div className="space-y-3">
            {stats.weakestTemas.slice(0, 3).map((tema) => {
              const temaInfo = metadata.temas[tema]
              const temaStat = stats.temaStats[tema]
              return (
                <Link
                  key={tema}
                  href={`/quiz/tema-${tema}`}
                  className="flex items-center justify-between p-3 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{temaInfo?.icon || '📚'}</span>
                    <div>
                      <p className="font-medium text-white">
                        {temaInfo?.name || tema}
                      </p>
                      <p className="text-xs text-gray-400">
                        {temaStat.answered} respondidas
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      temaStat.accuracy >= 70
                        ? 'success'
                        : temaStat.accuracy >= 50
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {formatPercentage(temaStat.accuracy)}
                  </Badge>
                </Link>
              )
            })}
          </div>
          <Link href="/stats" className="block mt-4">
            <Button variant="ghost" className="w-full">
              Ver todas las estadísticas →
            </Button>
          </Link>
        </Card>
      )}

      {/* Data Info */}
      <Card variant="outlined" className="text-center">
        <p className="text-gray-400 text-sm">
          📚 {metadata.totalQuestions} preguntas totales • ✅{' '}
          {metadata.withAnswers} con respuesta • 📖 {metadata.withoutAnswers}{' '}
          para estudio
        </p>
      </Card>
    </div>
  )
}
