import type { Question, TemaStats, Stats, Progress, WrongCount } from './types'
import type { QuestionsData } from './types'

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getQuestionsWithAnswers(questions: Question[]): Question[] {
  return questions.filter((q) => q.hasAnswer)
}

export function getQuestionsWithoutAnswers(questions: Question[]): Question[] {
  return questions.filter((q) => !q.hasAnswer)
}

export function filterByTema(questions: Question[], tema: string): Question[] {
  return questions.filter((q) => q.tema === tema)
}

export function filterByUnidad(
  questions: Question[],
  unidad: string
): Question[] {
  return questions.filter((q) => q.unidad === unidad)
}

export function filterBySource(
  questions: Question[],
  source: string
): Question[] {
  return questions.filter((q) => q.source === source)
}

export function getWrongQuestions(
  questions: Question[],
  progress: Progress
): Question[] {
  return questions.filter((q) => progress[q.id] === 'wrong')
}

export function sortByWrongCount(
  questions: Question[],
  wrongCounts: WrongCount
): Question[] {
  return [...questions].sort((a, b) => {
    const countA = wrongCounts[a.id] || 0
    const countB = wrongCounts[b.id] || 0
    return countB - countA
  })
}

export function calculateStats(
  data: QuestionsData,
  progress: Progress
): Stats {
  const { questions, metadata } = data
  const temaStats: Record<string, TemaStats> = {}
  const unidadStats: Record<string, TemaStats> = {}

  // Initialize tema stats
  Object.keys(metadata.temas).forEach((tema) => {
    temaStats[tema] = { total: 0, answered: 0, correct: 0, accuracy: 0 }
  })

  // Initialize unidad stats and calculate
  questions.forEach((q) => {
    // Tema stats
    if (!temaStats[q.tema]) {
      temaStats[q.tema] = { total: 0, answered: 0, correct: 0, accuracy: 0 }
    }
    temaStats[q.tema].total += 1

    // Unidad stats
    if (!unidadStats[q.unidad]) {
      unidadStats[q.unidad] = { total: 0, answered: 0, correct: 0, accuracy: 0 }
    }
    unidadStats[q.unidad].total += 1

    // Check progress (only for questions with answers)
    if (q.hasAnswer && progress[q.id]) {
      const isCorrect = progress[q.id] === 'correct'
      temaStats[q.tema].answered += 1
      unidadStats[q.unidad].answered += 1
      if (isCorrect) {
        temaStats[q.tema].correct += 1
        unidadStats[q.unidad].correct += 1
      }
    }
  })

  // Calculate accuracy
  Object.values(temaStats).forEach((stat) => {
    stat.accuracy = stat.answered > 0 ? (stat.correct / stat.answered) * 100 : 0
  })
  Object.values(unidadStats).forEach((stat) => {
    stat.accuracy = stat.answered > 0 ? (stat.correct / stat.answered) * 100 : 0
  })

  // Calculate totals
  let totalAnswered = 0
  let totalCorrect = 0
  Object.values(progress).forEach((status) => {
    if (status !== 'unanswered') {
      totalAnswered += 1
      if (status === 'correct') totalCorrect += 1
    }
  })

  // Find weakest and strongest temas (only those with at least 3 answered)
  const temasWithEnoughData = Object.entries(temaStats)
    .filter(([, stat]) => stat.answered >= 3)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)

  const weakestTemas = temasWithEnoughData.slice(0, 3).map(([tema]) => tema)
  const strongestTemas = temasWithEnoughData
    .slice(-3)
    .reverse()
    .map(([tema]) => tema)

  return {
    temaStats,
    unidadStats,
    totalAnswered,
    totalCorrect,
    accuracy: totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0,
    weakestTemas,
    strongestTemas,
  }
}

export function generateExplanation(question: Question): string {
  if (!question.hasAnswer || question.correctIndex < 0) {
    return 'Esta pregunta no tiene respuesta verificada.'
  }

  const correctAnswer = question.options[question.correctIndex]
  return `La respuesta correcta es: "${correctAnswer}"`
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function getUniqueTemas(questions: Question[]): string[] {
  return [...new Set(questions.map((q) => q.tema))]
}

export function getUniqueUnidades(questions: Question[]): string[] {
  return [...new Set(questions.map((q) => q.unidad))]
}

export function getUniqueSources(questions: Question[]): string[] {
  return [...new Set(questions.map((q) => q.source))]
}
