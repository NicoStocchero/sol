'use client'

import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Card, Badge } from '@/components/ui'
import { formatPercentage } from '@/lib/utils'

export default function QuizSelector() {
  const { data, stats, wrongCounts } = useAppStore()

  if (!data) return null

  const { metadata, questions } = data
  const wrongCount = Object.keys(wrongCounts).length

  // Group questions by tema
  const temaGroups = Object.entries(metadata.temas).map(([key, info]) => {
    const temaQuestions = questions.filter(
      (q) => q.tema === key && q.hasAnswer
    )
    const temaStat = stats?.temaStats[key]
    return {
      key,
      info,
      count: temaQuestions.length,
      stats: temaStat,
    }
  }).filter(t => t.count > 0).sort((a, b) => b.info.weight - a.info.weight)

  // Group questions by source
  const sourceGroups = metadata.sources.filter(s => s.hasAnswers).map((source) => {
    const sourceQuestions = questions.filter(
      (q) => q.source === source.name && q.hasAnswer
    )
    return {
      key: source.id,
      name: source.name,
      count: sourceQuestions.length,
    }
  })

  return (
    <div className="container-app">
      <h1 className="page-title">📝 Elegí tu Quiz</h1>

      {/* Quick Options */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/quiz/random">
          <Card className="h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:scale-[1.02] transition-transform">
            <div className="text-3xl mb-2">🎲</div>
            <h3 className="font-semibold text-white">Aleatorio</h3>
            <p className="text-sm text-gray-400">10 preguntas</p>
          </Card>
        </Link>

        <Link
          href={wrongCount > 0 ? '/quiz/errors' : '#'}
          className={wrongCount === 0 ? 'pointer-events-none' : ''}
        >
          <Card
            className={`h-full bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:scale-[1.02] transition-transform ${
              wrongCount === 0 ? 'opacity-50' : ''
            }`}
          >
            <div className="text-3xl mb-2">❌</div>
            <h3 className="font-semibold text-white">Errores</h3>
            <p className="text-sm text-gray-400">
              {wrongCount} pregunta{wrongCount !== 1 ? 's' : ''}
            </p>
          </Card>
        </Link>
      </div>

      {/* By Source */}
      <h2 className="section-title">📂 Por Fuente</h2>
      <div className="space-y-3 mb-8">
        {sourceGroups.map((source) => (
          <Link key={source.key} href={`/quiz/source-${source.key}`}>
            <Card className="hover:bg-dark-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">{source.name}</h3>
                  <p className="text-sm text-gray-400">
                    {source.count} preguntas con respuesta
                  </p>
                </div>
                <Badge>{source.count}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* By Topic */}
      <h2 className="section-title">🎯 Por Tema</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {temaGroups.map(({ key, info, count, stats: temaStat }) => (
          <Link key={key} href={`/quiz/tema-${key}`}>
            <Card className="hover:bg-dark-700 transition-colors h-full">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{info.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white truncate">
                      {info.name}
                    </h3>
                    {temaStat && temaStat.answered > 0 && (
                      <Badge
                        variant={
                          temaStat.accuracy >= 70
                            ? 'success'
                            : temaStat.accuracy >= 50
                            ? 'warning'
                            : 'error'
                        }
                        size="sm"
                      >
                        {formatPercentage(temaStat.accuracy)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {count} preguntas • {info.weight}% del examen
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
