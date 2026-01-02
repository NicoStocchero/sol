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

// NEW: Study mode types
export type ConfidenceLevel = 'seguro' | 'duda' | 'noidea'

export interface StudyProgress {
  [questionId: string]: {
    userAnswer: number
    confidence: ConfidenceLevel
    markedForReview: boolean
    lastReviewed: string
    timesReviewed: number
  }
}

export interface StudyStats {
  totalReviewed: number
  seguro: number
  duda: number
  noidea: number
  markedForReview: number
}

// NEW: Preferences
export interface Preferences {
  theme: 'dark' | 'light'
  sounds: boolean
  notifications: boolean
}

// NEW: Biblioteca types
export interface BibliotecaSection {
  title: string
  level: number
}

export interface BibliotecaDocument {
  id: string
  filename: string
  title: string
  unidad: string
  tipo: 'teoria' | 'resumen' | 'guia' | 'indice'
  icon: string
  sections: BibliotecaSection[]
  wordCount: number
  readingTime: number
}

export interface BibliotecaMetadata {
  totalDocs: number
  unidades: string[]
  tipos: string[]
}

export interface BibliotecaData {
  metadata: BibliotecaMetadata
  documents: BibliotecaDocument[]
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
