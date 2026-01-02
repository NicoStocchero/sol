'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, Button, Input } from '@/components/ui'
import { exportData, importData } from '@/lib/storage'

export default function SettingsPage() {
  const { user, theme, toggleTheme, resetProgress, setUser } = useAppStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(user?.name || '')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)

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
        // Reload to apply changes
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

  return (
    <div className="container-app">
      <h1 className="page-title">⚙️ Configuración</h1>

      {/* Profile */}
      <Card className="mb-6">
        <h2 className="section-title">Perfil</h2>

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
          <div className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
            <div>
              <p className="text-white font-medium">{user.name}</p>
              <p className="text-sm text-gray-400">
                Estudiando desde{' '}
                {new Date(user.createdAt).toLocaleDateString('es-AR')}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEditingName(true)}>
              Editar
            </Button>
          </div>
        )}
      </Card>

      {/* Appearance */}
      <Card className="mb-6">
        <h2 className="section-title">Apariencia</h2>

        <div className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
          <div>
            <p className="text-white font-medium">Tema</p>
            <p className="text-sm text-gray-400">
              {theme === 'dark' ? 'Oscuro' : 'Claro'}
            </p>
          </div>
          <Button variant="outline" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Cambiar a claro' : '🌙 Cambiar a oscuro'}
          </Button>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="mb-6">
        <h2 className="section-title">Datos</h2>

        <div className="space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
            <div>
              <p className="text-white font-medium">Exportar progreso</p>
              <p className="text-sm text-gray-400">
                Descargá un backup de tu progreso
              </p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              📥 Exportar
            </Button>
          </div>

          {/* Import */}
          <div className="p-4 bg-dark-700 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-medium">Importar progreso</p>
                <p className="text-sm text-gray-400">
                  Restaurá desde un backup anterior
                </p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center px-4 py-2 text-base font-medium rounded-xl border-2 border-dark-600 hover:border-primary-500 hover:bg-primary-500/10 text-white transition-all duration-200">
                  📤 Importar
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
      <Card className="border-incorrect/30">
        <h2 className="section-title text-incorrect">Zona de Peligro</h2>

        {showResetConfirm ? (
          <div className="p-4 bg-incorrect/10 rounded-xl border border-incorrect/30">
            <p className="text-white font-medium mb-2">
              ¿Estás segura que querés borrar todo?
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Se eliminará tu perfil, progreso, y todas las respuestas guardadas.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <Button variant="incorrect" onClick={handleReset}>
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
              <p className="text-white font-medium">Reiniciar todo</p>
              <p className="text-sm text-gray-400">
                Borra todo el progreso y empieza de cero
              </p>
            </div>
            <Button
              variant="outline"
              className="border-incorrect text-incorrect hover:bg-incorrect/10"
              onClick={() => setShowResetConfirm(true)}
            >
              🗑️ Reiniciar
            </Button>
          </div>
        )}
      </Card>

      {/* Credits */}
      <Card variant="outlined" className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          SolStudy v1.0 • Hecho con 💕 para Sol
        </p>
        <p className="text-gray-500 text-xs mt-1">
          875 preguntas de Anatomía • UNC
        </p>
      </Card>
    </div>
  )
}
