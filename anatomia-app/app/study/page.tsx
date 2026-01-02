'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { QuestionCard } from '@/components'
import { Card, Button, Badge, ProgressBar } from '@/components/ui'
import { shuffleArray, getQuestionsWithoutAnswers, filterByTema, filterBySource } from '@/lib/utils'
import type { Question } from '@/lib/types'

type FilterType = 'all' | 'tema' | 'source'

export default function StudyMode() {
  const { data, userAnswers } = useAppStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterValue, setFilterValue] = useState<string>('')
  const [isStarted, setIsStarted] = useState(false)

  // Get questions without answers
  const studyQuestions = useMemo(() => {
    if (!data) return []
    return getQuestionsWithoutAnswers(data.questions)
  }, [data])

  // Apply filters
  useEffect(() => {
    if (!data) return

    let filtered = studyQuestions

    if (filterType === 'tema' && filterValue) {
      filtered = filterByTema(studyQuestions, filterValue)
    } else if (filterType === 'source' && filterValue) {
      const sourceName = data.metadata.sources.find(s => s.id === filterValue)?.name || ''
      filtered = filterBySource(studyQuestions, sourceName)
    }

    setQuestions(shuffleArray(filtered))
    setCurrentIndex(0)
  }, [data, filterType, filterValue, studyQuestions])

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const answeredInSession = useMemo(() => {
    return questions.filter(q => userAnswers[q.id] !== undefined).length
  }, [questions, userAnswers])

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsStarted(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleStart = () => {
    setQuestions(shuffleArray(questions))
    setCurrentIndex(0)
    setIsStarted(true)
  }

  if (!data) {
    return (
      <div className="container-app">
        <p className="text-gray-400 text-center">Cargando...</p>
      </div>
    )
  }

  // Selection screen
  if (!isStarted) {
    const temas = Object.entries(data.metadata.temas)
      .filter(([key]) => studyQuestions.some(q => q.tema === key))
      .map(([key, info]) => ({
        key,
        name: info.name,
        icon: info.icon,
        count: studyQuestions.filter(q => q.tema === key).length,
      }))

    const sources = data.metadata.sources
      .filter(s => !s.hasAnswers)
      .map(source => ({
        key: source.id,
        name: source.name,
        count: studyQuestions.filter(q => q.source === source.name).length,
      }))

    return (
      <div className="container-app">
        <h1 className="page-title">📖 Modo Estudio</h1>

        <Card className="mb-6">
          <p className="text-gray-400 mb-4">
            En este modo practicás con las {studyQuestions.length} preguntas que no tienen
            respuesta verificada. Podés marcar cuál creés que es la correcta para referencia futura.
          </p>

          {/* Filter by type */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={filterType === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setFilterType('all')
                setFilterValue('')
              }}
            >
              Todas
            </Button>
            <Button
              variant={filterType === 'tema' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterType('tema')}
            >
              Por Tema
            </Button>
            <Button
              variant={filterType === 'source' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterType('source')}
            >
              Por Fuente
            </Button>
          </div>

          {/* Tema selector */}
          {filterType === 'tema' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {temas.map(tema => (
                <button
                  key={tema.key}
                  onClick={() => setFilterValue(tema.key)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    filterValue === tema.key
                      ? 'bg-primary-500/20 border-2 border-primary-500'
                      : 'bg-dark-700 border-2 border-transparent hover:border-dark-500'
                  }`}
                >
                  <span className="text-xl">{tema.icon}</span>
                  <p className="text-sm font-medium text-white truncate">{tema.name}</p>
                  <p className="text-xs text-gray-400">{tema.count} preguntas</p>
                </button>
              ))}
            </div>
          )}

          {/* Source selector */}
          {filterType === 'source' && (
            <div className="space-y-2 mb-4">
              {sources.map(source => (
                <button
                  key={source.key}
                  onClick={() => setFilterValue(source.key)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    filterValue === source.key
                      ? 'bg-primary-500/20 border-2 border-primary-500'
                      : 'bg-dark-700 border-2 border-transparent hover:border-dark-500'
                  }`}
                >
                  <p className="font-medium text-white">{source.name}</p>
                  <p className="text-sm text-gray-400">{source.count} preguntas</p>
                </button>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-dark-700 rounded-xl mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Preguntas seleccionadas:</span>
              <Badge size="md">{questions.length}</Badge>
            </div>
          </div>

          <Button
            onClick={handleStart}
            disabled={questions.length === 0}
            className="w-full"
            size="lg"
          >
            Comenzar Estudio ({questions.length} preguntas)
          </Button>
        </Card>
      </div>
    )
  }

  // Study session
  return (
    <div className="container-app">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => setIsStarted(false)}>
          ← Volver
        </Button>
        <Badge>{answeredInSession} marcadas</Badge>
      </div>

      {/* Progress */}
      <ProgressBar
        value={currentIndex + 1}
        max={totalQuestions}
        showLabel
        className="mb-6"
      />

      {/* Question */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          mode="study"
          onNext={handleNext}
          onPrevious={currentIndex > 0 ? handlePrevious : undefined}
        />
      )}
    </div>
  )
}
