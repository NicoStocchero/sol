'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, Button, Input } from '@/components/ui'
import { Footer } from '@/components'
import { exportData, importData, getPreferences, setPreferences } from '@/lib/storage'

export default function SettingsPage() {
  const { user, theme, toggleTheme, resetProgress, setUser } = useAppStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(user?.name || '')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)

  const preferences = getPreferences()
  const [sounds, setSounds] = useState(preferences.sounds)

  if (!user) return null

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `solstudy-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const success = importData(content)
      if (success) {
        setImportSuccess(true)
        setImportError('')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setImportError('Error al importar. Verificá el archivo.')
        setImportSuccess(false)
      }
    }
    reader.readAsText(file)
  }

  const handleSaveName = () => {
    if (newName.trim().length >= 2) {
      setUser(newName.trim())
      setEditingName(false)
    }
  }

  const handleReset = () => {
    resetProgress()
    window.location.reload()
  }

  const handleToggleSounds = () => {
    const newValue = !sounds
    setSounds(newValue)
    setPreferences({ sounds: newValue })
  }

  return (
    <div className="container-app">
      <h1 className="page-title">⚙️ Configuración</h1>

      {/* Profile */}
      <Card className="mb-6">
        <h2 className="section-title">Tu Perfil</h2>

        {editingName ? (
          <div className="flex gap-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
            />
            <Button onClick={handleSaveName}>Guardar</Button>
            <Button variant="ghost" onClick={() => setEditingName(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-sm text-gray-400">
                  Estudiando desde {new Date(user.createdAt).toLocaleDateString('es-AR')}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditingName(true)}>
                Editar
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-dark-700 rounded-xl text-center">
                <div className="text-xl font-bold text-primary-400">🔥 {user.streakDays}</div>
                <div className="text-xs text-gray-400">Días de racha</div>
              </div>
              <div className="p-3 bg-dark-700 rounded-xl text-center">
                <div className="text-xl font-bold text-correct">{user.totalCorrect}</div>
                <div className="text-xs text-gray-400">Correctas totales</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Preferences */}
      <Card className="mb-6">
        <h2 className="section-title">Preferencias</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
              <div>
                <p className="text-white font-medium">Tema</p>
                <p className="text-sm text-gray-400">
                  {theme === 'dark' ? 'Oscuro' : 'Claro'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Cambiar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔊</span>
              <div>
                <p className="text-white font-medium">Sonidos</p>
                <p className="text-sm text-gray-400">
                  {sounds ? 'Activados' : 'Desactivados'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleSounds}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                sounds ? 'bg-primary-500' : 'bg-dark-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  sounds ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="mb-6">
        <h2 className="section-title">Datos</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
            <div>
              <p className="text-white font-medium">💾 Backup JSON</p>
              <p className="text-sm text-gray-400">
                Exportar progreso completo
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              Exportar
            </Button>
          </div>

          <div className="p-4 bg-dark-700 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-medium">📥 Importar backup</p>
                <p className="text-sm text-gray-400">
                  Restaurar desde archivo
                </p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-xl border-2 border-dark-600 hover:border-primary-500 hover:bg-primary-500/10 text-white transition-all duration-200">
                  Seleccionar
                </span>
              </label>
            </div>
            {importError && (
              <p className="text-sm text-incorrect">{importError}</p>
            )}
            {importSuccess && (
              <p className="text-sm text-correct">
                ✓ Importado correctamente. Recargando...
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="mb-6 border border-incorrect/30">
        <h2 className="section-title text-incorrect">Zona de Peligro</h2>

        {showResetConfirm ? (
          <div className="p-4 bg-incorrect/10 rounded-xl border border-incorrect/30">
            <p className="text-white font-medium mb-2">
              ¿Estás segura que querés borrar todo?
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Se eliminará tu perfil, progreso, y todas las respuestas.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-incorrect text-incorrect hover:bg-incorrect/20"
                onClick={handleReset}
              >
                Sí, borrar todo
              </Button>
              <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
            <div>
              <p className="text-white font-medium">🗑️ Reiniciar todo</p>
              <p className="text-sm text-gray-400">
                Borrar progreso y empezar de cero
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-incorrect text-incorrect hover:bg-incorrect/10"
              onClick={() => setShowResetConfirm(true)}
            >
              Reiniciar
            </Button>
          </div>
        )}
      </Card>

      {/* About */}
      <Card variant="outlined" className="text-center">
        <div className="text-4xl mb-3">🩺</div>
        <p className="text-white font-semibold mb-1">SolStudy v2.0</p>
        <p className="text-gray-400 text-sm mb-2">
          Hecho con <span className="text-red-500">❤️</span> por Nico para Sol
        </p>
        <p className="text-gray-500 text-xs">
          875 preguntas • 23 documentos • Anatomía UNC 2025
        </p>
      </Card>

      <Footer />
    </div>
  )
}
