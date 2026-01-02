'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { QuestionCard, QuizResults } from '@/components'
import { Card, Button, ProgressBar } from '@/components/ui'
import {
  shuffleArray,
  getQuestionsWithAnswers,
  filterByTema,
  filterBySource,
  getWrongQuestions,
  sortByWrongCount,
} from '@/lib/utils'
import type { Question } from '@/lib/types'

export default function QuizMode() {
  const params = useParams()
  const router = useRouter()
  const { data, progress, wrongCounts } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionResults, setSessionResults] = useState({
    correct: 0,
    wrong: 0,
  })
  const [isFinished, setIsFinished] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])

  const mode = params.mode as string

  // Parse mode and filter questions
  useEffect(() => {
    if (!data) return

    let filteredQuestions: Question[] = []
    const questionsWithAnswers = getQuestionsWithAnswers(data.questions)

    if (mode === 'random') {
      filteredQuestions = shuffleArray(questionsWithAnswers).slice(0, 10)
    } else if (mode === 'errors') {
      const wrongQuestions = getWrongQuestions(questionsWithAnswers, progress)
      filteredQuestions = sortByWrongCount(wrongQuestions, wrongCounts)
    } else if (mode.startsWith('tema-')) {
      const tema = mode.replace('tema-', '')
      filteredQuestions = shuffleArray(
        filterByTema(questionsWithAnswers, tema)
      )
    } else if (mode.startsWith('source-')) {
      const sourceId = mode.replace('source-', '')
      const sourceName =
        data.metadata.sources.find((s) => s.id === sourceId)?.name || ''
      filteredQuestions = shuffleArray(
        filterBySource(questionsWithAnswers, sourceName)
      )
    } else {
      // Default to random
      filteredQuestions = shuffleArray(questionsWithAnswers).slice(0, 10)
    }

    setQuestions(filteredQuestions)
    setCurrentIndex(0)
    setSessionResults({ correct: 0, wrong: 0 })
    setIsFinished(false)
  }, [data, mode, progress, wrongCounts])

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length

  const getModeTitle = () => {
    if (mode === 'random') return '🎲 Quiz Aleatorio'
    if (mode === 'errors') return '❌ Repaso de Errores'
    if (mode.startsWith('tema-')) {
      const tema = mode.replace('tema-', '')
      const temaInfo = data?.metadata.temas[tema]
      return `${temaInfo?.icon || '📚'} ${temaInfo?.name || tema}`
    }
    if (mode.startsWith('source-')) {
      const sourceId = mode.replace('source-', '')
      const source = data?.metadata.sources.find((s) => s.id === sourceId)
      return `📂 ${source?.name || sourceId}`
    }
    return '📝 Quiz'
  }

  const handleNext = () => {
    // Track result based on progress
    const questionProgress = progress[currentQuestion?.id]
    if (questionProgress === 'correct') {
      setSessionResults((prev) => ({ ...prev, correct: prev.correct + 1 }))
    } else if (questionProgress === 'wrong') {
      setSessionResults((prev) => ({ ...prev, wrong: prev.wrong + 1 }))
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsFinished(true)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleRetry = () => {
    if (data) {
      // Re-shuffle for another attempt
      const questionsWithAnswers = getQuestionsWithAnswers(data.questions)
      let newQuestions: Question[] = []

      if (mode === 'random') {
        newQuestions = shuffleArray(questionsWithAnswers).slice(0, 10)
      } else if (mode === 'errors') {
        const wrongQuestions = getWrongQuestions(questionsWithAnswers, progress)
        newQuestions = sortByWrongCount(wrongQuestions, wrongCounts)
      } else if (mode.startsWith('tema-')) {
        const tema = mode.replace('tema-', '')
        newQuestions = shuffleArray(filterByTema(questionsWithAnswers, tema))
      } else if (mode.startsWith('source-')) {
        const sourceId = mode.replace('source-', '')
        const sourceName =
          data.metadata.sources.find((s) => s.id === sourceId)?.name || ''
        newQuestions = shuffleArray(
          filterBySource(questionsWithAnswers, sourceName)
        )
      }

      setQuestions(newQuestions)
      setCurrentIndex(0)
      setSessionResults({ correct: 0, wrong: 0 })
      setIsFinished(false)
    }
  }

  if (!data) {
    return (
      <div className="container-app">
        <p className="text-gray-400 text-center">Cargando...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container-app">
        <Card className="text-center" padding="lg">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-white mb-2">
            ¡No hay preguntas disponibles!
          </h2>
          <p className="text-gray-400 mb-6">
            {mode === 'errors'
              ? 'No tienes errores pendientes. ¡Excelente trabajo!'
              : 'No se encontraron preguntas para este filtro.'}
          </p>
          <Button onClick={() => router.push('/quiz')}>
            Volver al selector
          </Button>
        </Card>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="container-app">
        <QuizResults
          totalQuestions={totalQuestions}
          correctAnswers={sessionResults.correct}
          wrongAnswers={sessionResults.wrong}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  return (
    <div className="container-app">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/quiz')}>
          ← Volver
        </Button>
        <h1 className="text-lg font-semibold text-white">{getModeTitle()}</h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Progress */}
      <ProgressBar
        value={currentIndex + 1}
        max={totalQuestions}
        showLabel
        className="mb-6"
      />

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={totalQuestions}
        mode="quiz"
        onNext={handleNext}
        onPrevious={currentIndex > 0 ? handlePrevious : undefined}
      />
    </div>
  )
}
