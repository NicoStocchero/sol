'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { StudyQuestionCard, StudyResults } from '@/components'
import { Footer } from '@/components/Footer'
import { Card, Button, Badge, ProgressBar } from '@/components/ui'
import { shuffleArray, getQuestionsWithoutAnswers, filterByTema } from '@/lib/utils'
import { getStudyProgress, calculateStudyStats } from '@/lib/storage'
import type { Question, StudyProgress } from '@/lib/types'

type FilterType = 'all' | 'tema' | 'source' | 'review'

export default function StudyMode() {
  const { data } = useAppStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterValue, setFilterValue] = useState<string>('')
  const [isStarted, setIsStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [sessionStats, setSessionStats] = useState({ seguro: 0, duda: 0, noidea: 0, markedForReview: 0 })

  // Use ref to track initialization and prevent infinite loops
  const isInitialized = useRef(false)

  // Memoize study progress to prevent infinite re-renders
  const [studyProgressState, setStudyProgressState] = useState<StudyProgress>({})

  // Load study progress only once on mount
  useEffect(() => {
    setStudyProgressState(getStudyProgress())
  }, [])

  // Get questions without answers
  const studyQuestions = useMemo(() => {
    if (!data) return []
    return getQuestionsWithoutAnswers(data.questions)
  }, [data])

  // Get existing study progress (memoized)
  const existingStats = useMemo(() => {
    return calculateStudyStats()
  }, [studyProgressState])

  // Get questions marked for review
  const reviewQuestions = useMemo(() => {
    return studyQuestions.filter(q => studyProgressState[q.id]?.markedForReview)
  }, [studyQuestions, studyProgressState])

  // Filter by source - fixed to use partial match
  const filterBySourceFixed = (questions: Question[], sourceId: string): Question[] => {
    if (!data) return questions
    const sourceInfo = data.metadata.sources.find(s => s.id === sourceId)
    if (!sourceInfo) return []
    // Use partial match since questions have "Preguntero X" but metadata has "X"
    return questions.filter(q => q.source.toLowerCase().includes(sourceInfo.name.toLowerCase()))
  }

  // Apply filters - only when filter changes, not on every render
  useEffect(() => {
    if (!data || !studyQuestions.length) return

    // Prevent running on initial mount before data is ready
    if (!isInitialized.current) {
      isInitialized.current = true
    }

    let filtered = studyQuestions

    if (filterType === 'tema' && filterValue) {
      filtered = filterByTema(studyQuestions, filterValue)
    } else if (filterType === 'source' && filterValue) {
      filtered = filterBySourceFixed(studyQuestions, filterValue)
    } else if (filterType === 'review') {
      filtered = reviewQuestions
    }

    setQuestions(shuffleArray(filtered))
    setCurrentIndex(0)
  }, [data, filterType, filterValue]) // Removed studyQuestions and reviewQuestions from deps

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Calculate session stats
      const progress = getStudyProgress()
      const sessionQuestionIds = questions.map(q => q.id)
      const sessionEntries = sessionQuestionIds
        .map(id => progress[id])
        .filter(Boolean)

      setSessionStats({
        seguro: sessionEntries.filter(e => e.confidence === 'seguro').length,
        duda: sessionEntries.filter(e => e.confidence === 'duda').length,
        noidea: sessionEntries.filter(e => e.confidence === 'noidea').length,
        markedForReview: sessionEntries.filter(e => e.markedForReview).length,
      })
      setIsFinished(true)
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
    setIsFinished(false)
  }

  const handleRetry = () => {
    setIsFinished(false)
    setIsStarted(false)
  }

  const handleViewMarked = () => {
    setFilterType('review')
    setIsFinished(false)
    setIsStarted(false)
  }

  if (!data) {
    return (
      <div className="container-app">
        <p className="text-gray-400 text-center">Cargando...</p>
      </div>
    )
  }

  // Results screen
  if (isFinished) {
    return (
      <div className="container-app">
        <StudyResults
          totalQuestions={totalQuestions}
          seguro={sessionStats.seguro}
          duda={sessionStats.duda}
          noidea={sessionStats.noidea}
          markedForReview={sessionStats.markedForReview}
          onRetry={handleRetry}
          onViewMarked={sessionStats.markedForReview > 0 ? handleViewMarked : undefined}
        />
        <Footer />
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
        // Use partial match: questions have "Preguntero X", metadata has "X"
        count: studyQuestions.filter(q =>
          q.source.toLowerCase().includes(source.name.toLowerCase())
        ).length,
      }))

    return (
      <div className="container-app">
        <h1 className="page-title">📖 Modo Estudio</h1>

        {/* Existing Progress */}
        {existingStats.totalReviewed > 0 && (
          <Card className="mb-6 bg-gradient-to-br from-primary-500/10 to-purple-500/10">
            <h3 className="text-white font-semibold mb-3">Tu progreso de estudio</h3>
            <div className="grid grid-cols-4 gap-2 text-center mb-3">
              <div>
                <div className="text-xl font-bold text-white">{existingStats.totalReviewed}</div>
                <div className="text-xs text-gray-400">Revisadas</div>
              </div>
              <div>
                <div className="text-xl font-bold text-correct">{existingStats.seguro}</div>
                <div className="text-xs text-gray-400">Seguras</div>
              </div>
              <div>
                <div className="text-xl font-bold text-yellow-400">{existingStats.duda}</div>
                <div className="text-xs text-gray-400">Con dudas</div>
              </div>
              <div>
                <div className="text-xl font-bold text-incorrect">{existingStats.noidea}</div>
                <div className="text-xs text-gray-400">Sin idea</div>
              </div>
            </div>
            {existingStats.markedForReview > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setFilterType('review')}
              >
                📌 Ver {existingStats.markedForReview} marcadas para verificar
              </Button>
            )}
          </Card>
        )}

        <Card className="mb-6">
          <p className="text-gray-400 mb-4">
            Practicá con las {studyQuestions.length} preguntas sin respuesta verificada.
            Indicá tu nivel de confianza en cada respuesta.
          </p>

          {/* Filter by type */}
          <div className="flex flex-wrap gap-2 mb-4">
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
            {reviewQuestions.length > 0 && (
              <Button
                variant={filterType === 'review' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterType('review')}
              >
                📌 Para verificar ({reviewQuestions.length})
              </Button>
            )}
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

        <Footer />
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
        <Badge variant="info">{currentIndex + 1} / {totalQuestions}</Badge>
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
        <StudyQuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          onNext={handleNext}
          onPrevious={currentIndex > 0 ? handlePrevious : undefined}
        />
      )}
    </div>
  )
}
