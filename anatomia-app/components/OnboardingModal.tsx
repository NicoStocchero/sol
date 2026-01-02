'use client'

import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { useAppStore } from '@/lib/store'

export function OnboardingModal() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useAppStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Por favor, ingresa tu nombre')
      return
    }
    if (trimmedName.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }
    setUser(trimmedName)
  }

  return (
    <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full animate-slide-up" padding="lg">
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">🩺</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            ¡Bienvenida a SolStudy!
          </h1>
          <p className="text-gray-400">
            Tu app de estudio de Anatomía para la UNC
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="name"
            label="¿Cómo te llamas?"
            placeholder="Ingresa tu nombre"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            error={error}
            autoFocus
          />

          <Button type="submit" className="w-full" size="lg">
            Comenzar a estudiar
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-dark-700">
          <p className="text-sm text-gray-500 text-center">
            875 preguntas de anatomía • 400 con respuestas verificadas
          </p>
        </div>
      </Card>
    </div>
  )
}
