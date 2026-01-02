'use client'

import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Card, Button, Badge } from '@/components/ui'
import { Footer } from '@/components'
import { formatPercentage } from '@/lib/utils'
import { calculateStudyStats } from '@/lib/storage'

export default function Dashboard() {
  const { user, data, stats, progress, wrongCounts } = useAppStore()
  const studyStats = calculateStudyStats()

  if (!data || !user) return null

  const { metadata } = data
  const questionsWithAnswers = metadata.withAnswers
  const answeredCount = Object.keys(progress).length
  const wrongCount = Object.keys(wrongCounts).length

  return (
    <div className="container-app">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          ¡Hola, {user.name}! 👋
        </h1>
        <p className="text-gray-400">
          {user.streakDays > 1
            ? `🔥 ${user.streakDays} días de racha`
            : '¿Qué querés hacer hoy?'}
        </p>
      </div>

      {/* 3 Main Actions - Big and Clear */}
      <div className="space-y-4 mb-8">
        {/* QUIZ */}
        <Link href="/quiz">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-6
                          hover:scale-[1.02] transition-transform cursor-pointer shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📝</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Practicar Quiz</h2>
                <p className="text-sm text-white/80">
                  {questionsWithAnswers} preguntas con respuestas verificadas
                </p>
              </div>
              <span className="text-2xl text-white/70">→</span>
            </div>
            {answeredCount > 0 && (
              <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
                <span>✅ {answeredCount} respondidas</span>
                <span>•</span>
                <span>{formatPercentage(stats?.accuracy || 0)} precisión</span>
                {wrongCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-200">❌ {wrongCount} a repasar</span>
                  </>
                )}
              </div>
            )}
          </div>
        </Link>

        {/* STUDY MODE */}
        <Link href="/study">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6
                          hover:scale-[1.02] transition-transform cursor-pointer shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📖</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Modo Estudio</h2>
                <p className="text-sm text-white/80">
                  {metadata.withoutAnswers} preguntas para practicar sin presión
                </p>
              </div>
              <span className="text-2xl text-white/70">→</span>
            </div>
            {studyStats.totalReviewed > 0 && (
              <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
                <span>📚 {studyStats.totalReviewed} revisadas</span>
                <span>•</span>
                <span className="text-green-200">✓ {studyStats.seguro} seguras</span>
                {studyStats.duda > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-200">? {studyStats.duda} dudas</span>
                  </>
                )}
              </div>
            )}
          </div>
        </Link>

        {/* LIBRARY */}
        <Link href="/biblioteca">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6
                          hover:scale-[1.02] transition-transform cursor-pointer shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📚</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Leer Apuntes</h2>
                <p className="text-sm text-white/80">
                  23 documentos de teoría y resúmenes
                </p>
              </div>
              <span className="text-2xl text-white/70">→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats Summary */}
      <div className="p-4 bg-dark-700/50 rounded-xl mb-6">
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div>
            <div className="text-lg font-bold text-white">{answeredCount}</div>
            <div className="text-xs text-gray-400">Respondidas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-correct">{stats?.totalCorrect || 0}</div>
            <div className="text-xs text-gray-400">Correctas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-incorrect">{wrongCount}</div>
            <div className="text-xs text-gray-400">A repasar</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary-400">{formatPercentage(stats?.accuracy || 0)}</div>
            <div className="text-xs text-gray-400">Precisión</div>
          </div>
        </div>
      </div>

      {/* Quick Error Repair Button (if there are errors) */}
      {wrongCount > 0 && (
        <Link href="/quiz/errors">
          <Card className="mb-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:scale-[1.01] transition-transform cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div className="flex-1">
                <p className="font-medium text-white">Repasar errores</p>
                <p className="text-sm text-gray-400">{wrongCount} pregunta{wrongCount !== 1 ? 's' : ''} para revisar</p>
              </div>
              <Badge variant="error">{wrongCount}</Badge>
            </div>
          </Card>
        </Link>
      )}

      {/* Topics to Review (only if user has data) */}
      {stats && stats.weakestTemas.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">🎯 Temas a mejorar</h3>
          <div className="space-y-2">
            {stats.weakestTemas.slice(0, 3).map((tema) => {
              const temaInfo = metadata.temas[tema]
              const temaStat = stats.temaStats[tema]
              return (
                <Link
                  key={tema}
                  href={`/quiz/tema-${tema}`}
                  className="flex items-center justify-between p-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{temaInfo?.icon || '📚'}</span>
                    <span className="text-sm text-white">{temaInfo?.name || tema}</span>
                  </div>
                  <Badge
                    size="sm"
                    variant={temaStat.accuracy >= 70 ? 'success' : temaStat.accuracy >= 50 ? 'warning' : 'error'}
                  >
                    {formatPercentage(temaStat.accuracy)}
                  </Badge>
                </Link>
              )
            })}
          </div>
        </Card>
      )}

      {/* Secondary Links */}
      <div className="flex justify-center gap-6 text-sm text-gray-500 mb-4">
        <Link href="/stats" className="hover:text-white transition-colors">📊 Estadísticas</Link>
        <Link href="/settings" className="hover:text-white transition-colors">⚙️ Configuración</Link>
      </div>

      <Footer />
    </div>
  )
}
