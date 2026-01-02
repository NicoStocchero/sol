'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Navigation, OnboardingModal } from '@/components'
import questionsData from '@/data/questions.json'
import type { QuestionsData } from '@/lib/types'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, theme, isLoading, initializeApp } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    initializeApp(questionsData as QuestionsData)
    setMounted(true)
  }, [initializeApp])

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark')
      document.documentElement.classList.toggle('light', theme === 'light')
    }
  }, [theme, mounted])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🩺</div>
          <p className="text-gray-400 animate-pulse">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <OnboardingModal />
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navigation />
      <main className="pb-20 md:pb-8">{children}</main>
    </div>
  )
}
