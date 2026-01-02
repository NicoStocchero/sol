'use client'

import { create } from 'zustand'
import type {
  Question,
  QuestionsData,
  UserProfile,
  Progress,
  WrongCount,
  UserAnswers,
  ThemeMode,
  Stats,
} from './types'
import * as storage from './storage'
import { calculateStats } from './utils'

interface AppState {
  // Data
  data: QuestionsData | null
  isLoading: boolean

  // User
  user: UserProfile | null
  theme: ThemeMode

  // Progress
  progress: Progress
  wrongCounts: WrongCount
  userAnswers: UserAnswers

  // Computed
  stats: Stats | null

  // Actions
  initializeApp: (data: QuestionsData) => void
  setUser: (name: string) => void
  loadUserFromStorage: () => void
  toggleTheme: () => void

  // Quiz actions
  answerQuestion: (
    question: Question,
    selectedIndex: number,
    isCorrect: boolean
  ) => void
  markUserAnswer: (questionId: string, answerIndex: number) => void

  // Stats
  recalculateStats: () => void

  // Reset
  resetProgress: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  data: null,
  isLoading: true,
  user: null,
  theme: 'dark',
  progress: {},
  wrongCounts: {},
  userAnswers: {},
  stats: null,

  initializeApp: (data: QuestionsData) => {
    const user = storage.getUser()
    const theme = storage.getTheme()
    const progress = storage.getProgress()
    const wrongCounts = storage.getWrongCounts()
    const userAnswers = storage.getUserAnswers()

    const stats = calculateStats(data, progress)

    set({
      data,
      isLoading: false,
      user,
      theme,
      progress,
      wrongCounts,
      userAnswers,
      stats,
    })
  },

  setUser: (name: string) => {
    const user = storage.createUser(name)
    set({ user })
  },

  loadUserFromStorage: () => {
    const user = storage.getUser()
    const theme = storage.getTheme()
    const progress = storage.getProgress()
    const wrongCounts = storage.getWrongCounts()
    const userAnswers = storage.getUserAnswers()
    set({ user, theme, progress, wrongCounts, userAnswers })
  },

  toggleTheme: () => {
    const { theme } = get()
    const newTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark'
    storage.setTheme(newTheme)
    set({ theme: newTheme })
  },

  answerQuestion: (
    question: Question,
    selectedIndex: number,
    isCorrect: boolean
  ) => {
    const { progress, wrongCounts, data } = get()

    // Update progress
    const newProgress = {
      ...progress,
      [question.id]: isCorrect ? 'correct' : 'wrong',
    } as Progress
    storage.setQuestionProgress(question.id, isCorrect ? 'correct' : 'wrong')

    // Update wrong counts
    let newWrongCounts = { ...wrongCounts }
    if (!isCorrect) {
      storage.incrementWrongCount(question.id)
      newWrongCounts[question.id] = (newWrongCounts[question.id] || 0) + 1
    } else if (wrongCounts[question.id]) {
      storage.decrementWrongCount(question.id)
      newWrongCounts[question.id] = Math.max(
        0,
        (newWrongCounts[question.id] || 0) - 1
      )
      if (newWrongCounts[question.id] === 0) {
        delete newWrongCounts[question.id]
      }
    }

    // Update user stats
    storage.updateUserStats(isCorrect)
    const user = storage.getUser()

    // Recalculate stats
    const stats = data ? calculateStats(data, newProgress) : null

    set({
      progress: newProgress,
      wrongCounts: newWrongCounts,
      user,
      stats,
    })
  },

  markUserAnswer: (questionId: string, answerIndex: number) => {
    const { userAnswers } = get()
    storage.setUserAnswer(questionId, answerIndex)
    set({
      userAnswers: {
        ...userAnswers,
        [questionId]: answerIndex,
      },
    })
  },

  recalculateStats: () => {
    const { data, progress } = get()
    if (data) {
      const stats = calculateStats(data, progress)
      set({ stats })
    }
  },

  resetProgress: () => {
    storage.resetAllData()
    set({
      user: null,
      progress: {},
      wrongCounts: {},
      userAnswers: {},
      stats: null,
    })
  },
}))
