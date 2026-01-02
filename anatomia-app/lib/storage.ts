'use client'

import type {
  UserProfile,
  Progress,
  WrongCount,
  UserAnswers,
  ThemeMode,
} from './types'

const KEYS = {
  USER: 'anat_user',
  PROGRESS: 'anat_progress',
  WRONG: 'anat_wrong',
  USER_ANSWERS: 'anat_userAnswers',
  THEME: 'anat_theme',
} as const

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

// Progress
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

// User answers (for study mode)
export function getUserAnswers(): UserAnswers {
  return safeGet<UserAnswers>(KEYS.USER_ANSWERS, {})
}

export function setUserAnswer(questionId: string, answerIndex: number): void {
  const answers = getUserAnswers()
  answers[questionId] = answerIndex
  safeSet(KEYS.USER_ANSWERS, answers)
}

// Theme
export function getTheme(): ThemeMode {
  return safeGet<ThemeMode>(KEYS.THEME, 'dark')
}

export function setTheme(theme: ThemeMode): void {
  safeSet(KEYS.THEME, theme)
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
    theme: getTheme(),
    exportedAt: new Date().toISOString(),
  })
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)
    if (data.user) setUser(data.user)
    if (data.progress) safeSet(KEYS.PROGRESS, data.progress)
    if (data.wrong) safeSet(KEYS.WRONG, data.wrong)
    if (data.userAnswers) safeSet(KEYS.USER_ANSWERS, data.userAnswers)
    if (data.theme) setTheme(data.theme)
    return true
  } catch {
    return false
  }
}
