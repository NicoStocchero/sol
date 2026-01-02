export interface Question {
  id: string
  source: string
  sourceFile: string
  number: number
  question: string
  options: string[]
  correctIndex: number
  hasAnswer: boolean
  tema: string
  unidad: string
}

export interface TemaInfo {
  name: string
  icon: string
  color: string
  weight: number
}

export interface SourceInfo {
  id: string
  name: string
  count: number
  hasAnswers: boolean
}

export interface Metadata {
  totalQuestions: number
  withAnswers: number
  withoutAnswers: number
  sources: SourceInfo[]
  temas: Record<string, TemaInfo>
}

export interface QuestionsData {
  metadata: Metadata
  questions: Question[]
}

export interface UserProfile {
  name: string
  createdAt: string
  lastSession: string
  totalAnswered: number
  totalCorrect: number
  streakDays: number
  lastStudyDate: string | null
}

export type AnswerStatus = 'correct' | 'wrong' | 'unanswered'

export interface Progress {
  [questionId: string]: AnswerStatus
}

export interface WrongCount {
  [questionId: string]: number
}

export interface UserAnswers {
  [questionId: string]: number
}

export interface TemaStats {
  total: number
  answered: number
  correct: number
  accuracy: number
}

export interface Stats {
  temaStats: Record<string, TemaStats>
  unidadStats: Record<string, TemaStats>
  totalAnswered: number
  totalCorrect: number
  accuracy: number
  weakestTemas: string[]
  strongestTemas: string[]
}

export type ThemeMode = 'dark' | 'light'

export type QuizMode = 'random' | 'errors' | 'tema' | 'unidad' | 'source'

export interface QuizConfig {
  mode: QuizMode
  filter?: string
  limit?: number
}
