'use client'

import type {
  UserProfile,
  Progress,
  WrongCount,
  UserAnswers,
  ThemeMode,
  StudyProgress,
  ConfidenceLevel,
  Preferences,
} from './types'

const KEYS = {
  USER: 'solstudy_user',
  PROGRESS: 'solstudy_progress',
  WRONG: 'solstudy_wrong',
  USER_ANSWERS: 'solstudy_userAnswers',
  THEME: 'solstudy_theme',
  STUDY_PROGRESS: 'solstudy_study_progress',
  PREFERENCES: 'solstudy_preferences',
  BIBLIOTECA_HISTORY: 'solstudy_biblioteca_history',
} as const

// Migration: check for old keys and migrate
function migrateOldKeys(): void {
  if (typeof window === 'undefined') return
  const oldKeys = ['anat_user', 'anat_progress', 'anat_wrong', 'anat_userAnswers', 'anat_theme']
  const newKeyMap: Record<string, string> = {
    'anat_user': KEYS.USER,
    'anat_progress': KEYS.PROGRESS,
    'anat_wrong': KEYS.WRONG,
    'anat_userAnswers': KEYS.USER_ANSWERS,
    'anat_theme': KEYS.THEME,
  }

  oldKeys.forEach(oldKey => {
    const value = localStorage.getItem(oldKey)
    if (value && !localStorage.getItem(newKeyMap[oldKey])) {
      localStorage.setItem(newKeyMap[oldKey], value)
      localStorage.removeItem(oldKey)
    }
  })
}

// Run migration on load
if (typeof window !== 'undefined') {
  migrateOldKeys()
}

function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Error saving to localStorage:', e)
  }
}

// User Profile
export function getUser(): UserProfile | null {
  return safeGet<UserProfile | null>(KEYS.USER, null)
}

export function setUser(user: UserProfile): void {
  safeSet(KEYS.USER, user)
}

export function createUser(name: string): UserProfile {
  const now = new Date().toISOString()
  const user: UserProfile = {
    name,
    createdAt: now,
    lastSession: now,
    totalAnswered: 0,
    totalCorrect: 0,
    streakDays: 1,
    lastStudyDate: now.split('T')[0],
  }
  setUser(user)
  return user
}

export function updateUserStats(correct: boolean): void {
  const user = getUser()
  if (!user) return

  const today = new Date().toISOString().split('T')[0]
  const lastDate = user.lastStudyDate

  let streak = user.streakDays
  if (lastDate) {
    const lastDateObj = new Date(lastDate)
    const todayObj = new Date(today)
    const diffDays = Math.floor(
      (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 1) {
      streak += 1
    } else if (diffDays > 1) {
      streak = 1
    }
  }

  setUser({
    ...user,
    lastSession: new Date().toISOString(),
    totalAnswered: user.totalAnswered + 1,
    totalCorrect: user.totalCorrect + (correct ? 1 : 0),
    streakDays: streak,
    lastStudyDate: today,
  })
}

// Progress (Quiz mode)
export function getProgress(): Progress {
  return safeGet<Progress>(KEYS.PROGRESS, {})
}

export function setQuestionProgress(
  questionId: string,
  status: 'correct' | 'wrong'
): void {
  const progress = getProgress()
  progress[questionId] = status
  safeSet(KEYS.PROGRESS, progress)
}

// Wrong counts
export function getWrongCounts(): WrongCount {
  return safeGet<WrongCount>(KEYS.WRONG, {})
}

export function incrementWrongCount(questionId: string): void {
  const wrong = getWrongCounts()
  wrong[questionId] = (wrong[questionId] || 0) + 1
  safeSet(KEYS.WRONG, wrong)
}

export function decrementWrongCount(questionId: string): void {
  const wrong = getWrongCounts()
  if (wrong[questionId] && wrong[questionId] > 0) {
    wrong[questionId] -= 1
    if (wrong[questionId] === 0) {
      delete wrong[questionId]
    }
  }
  safeSet(KEYS.WRONG, wrong)
}

// User answers (legacy - for backward compat)
export function getUserAnswers(): UserAnswers {
  return safeGet<UserAnswers>(KEYS.USER_ANSWERS, {})
}

export function setUserAnswer(questionId: string, answerIndex: number): void {
  const answers = getUserAnswers()
  answers[questionId] = answerIndex
  safeSet(KEYS.USER_ANSWERS, answers)
}

// NEW: Study Progress (with confidence levels)
export function getStudyProgress(): StudyProgress {
  return safeGet<StudyProgress>(KEYS.STUDY_PROGRESS, {})
}

export function setStudyQuestionProgress(
  questionId: string,
  userAnswer: number,
  confidence: ConfidenceLevel,
  markedForReview: boolean = false
): void {
  const progress = getStudyProgress()
  const existing = progress[questionId]

  progress[questionId] = {
    userAnswer,
    confidence,
    markedForReview,
    lastReviewed: new Date().toISOString(),
    timesReviewed: (existing?.timesReviewed || 0) + 1,
  }
  safeSet(KEYS.STUDY_PROGRESS, progress)
}

export function toggleStudyReviewMark(questionId: string): void {
  const progress = getStudyProgress()
  if (progress[questionId]) {
    progress[questionId].markedForReview = !progress[questionId].markedForReview
    safeSet(KEYS.STUDY_PROGRESS, progress)
  }
}

// Calculate study stats
export function calculateStudyStats() {
  const progress = getStudyProgress()
  const entries = Object.values(progress)

  return {
    totalReviewed: entries.length,
    seguro: entries.filter(e => e.confidence === 'seguro').length,
    duda: entries.filter(e => e.confidence === 'duda').length,
    noidea: entries.filter(e => e.confidence === 'noidea').length,
    markedForReview: entries.filter(e => e.markedForReview).length,
  }
}

// Get question IDs by confidence level
export function getQuestionIdsByConfidence(confidence: ConfidenceLevel): string[] {
  const progress = getStudyProgress()
  return Object.entries(progress)
    .filter(([, entry]) => entry.confidence === confidence)
    .map(([id]) => id)
}

// NEW: Preferences
export function getPreferences(): Preferences {
  return safeGet<Preferences>(KEYS.PREFERENCES, {
    theme: 'dark',
    sounds: false,
    notifications: false,
  })
}

export function setPreferences(prefs: Partial<Preferences>): void {
  const current = getPreferences()
  safeSet(KEYS.PREFERENCES, { ...current, ...prefs })
}

// Theme
export function getTheme(): ThemeMode {
  return getPreferences().theme
}

export function setTheme(theme: ThemeMode): void {
  setPreferences({ theme })
}

// Biblioteca history
export function getBibliotecaHistory(): string[] {
  return safeGet<string[]>(KEYS.BIBLIOTECA_HISTORY, [])
}

export function addBibliotecaHistory(docId: string): void {
  const history = getBibliotecaHistory()
  const filtered = history.filter(id => id !== docId)
  filtered.unshift(docId)
  safeSet(KEYS.BIBLIOTECA_HISTORY, filtered.slice(0, 20))
}

// Reset all data
export function resetAllData(): void {
  if (typeof window === 'undefined') return
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}

// Export/Import
export function exportData(): string {
  return JSON.stringify({
    user: getUser(),
    progress: getProgress(),
    wrong: getWrongCounts(),
    userAnswers: getUserAnswers(),
    studyProgress: getStudyProgress(),
    preferences: getPreferences(),
    bibliotecaHistory: getBibliotecaHistory(),
    exportedAt: new Date().toISOString(),
    version: '2.0',
  })
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)
    if (data.user) setUser(data.user)
    if (data.progress) safeSet(KEYS.PROGRESS, data.progress)
    if (data.wrong) safeSet(KEYS.WRONG, data.wrong)
    if (data.userAnswers) safeSet(KEYS.USER_ANSWERS, data.userAnswers)
    if (data.studyProgress) safeSet(KEYS.STUDY_PROGRESS, data.studyProgress)
    if (data.preferences) safeSet(KEYS.PREFERENCES, data.preferences)
    if (data.bibliotecaHistory) safeSet(KEYS.BIBLIOTECA_HISTORY, data.bibliotecaHistory)
    // Legacy theme support
    if (data.theme && !data.preferences) setTheme(data.theme)
    return true
  } catch {
    return false
  }
}
