'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Card, Button, Badge, Input } from '@/components/ui'
import { Footer } from '@/components/Footer'
import bibliotecaData from '@/biblioteca_index.json'
import type { BibliotecaData, BibliotecaDocument } from '@/lib/types'

const data = bibliotecaData as BibliotecaData

export default function BibliotecaPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterUnidad, setFilterUnidad] = useState<string>('all')
  const [filterTipo, setFilterTipo] = useState<string>('all')
  const [showOnlyResumen, setShowOnlyResumen] = useState(false)

  const filteredDocs = useMemo(() => {
    let docs = data.documents

    if (filterUnidad !== 'all') {
      docs = docs.filter(d => d.unidad === filterUnidad)
    }

    if (filterTipo !== 'all') {
      docs = docs.filter(d => d.tipo === filterTipo)
    }

    if (showOnlyResumen) {
      docs = docs.filter(d => d.tipo === 'resumen')
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(query) ||
        d.unidad.toLowerCase().includes(query)
      )
    }

    return docs
  }, [filterUnidad, filterTipo, showOnlyResumen, searchQuery])

  const getTipoStyle = (tipo: string) => {
    switch (tipo) {
      case 'teoria': return 'bg-blue-500/20 text-blue-400'
      case 'resumen': return 'bg-green-500/20 text-green-400'
      case 'guia': return 'bg-purple-500/20 text-purple-400'
      case 'indice': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-dark-600 text-gray-400'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'teoria': return 'Teoría'
      case 'resumen': return 'Resumen'
      case 'guia': return 'Guía'
      case 'indice': return 'Índice'
      default: return tipo
    }
  }

  // Sort unidades naturally
  const sortedUnidades = useMemo(() => {
    return [...data.metadata.unidades].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numA - numB
    })
  }, [])

  return (
    <div className="container-app">
      <h1 className="page-title">📚 Biblioteca</h1>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="🔍 Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            {/* Unidad Filter */}
            <select
              value={filterUnidad}
              onChange={(e) => setFilterUnidad(e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todas las unidades</option>
              {sortedUnidades.map(unidad => (
                <option key={unidad} value={unidad}>{unidad}</option>
              ))}
            </select>

            {/* Tipo Filter */}
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="teoria">Teoría completa</option>
              <option value="resumen">Resúmenes</option>
              <option value="guia">Guías</option>
              <option value="indice">Índices</option>
            </select>

            {/* Quick toggle for resúmenes */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyResumen}
                onChange={(e) => {
                  setShowOnlyResumen(e.target.checked)
                  if (e.target.checked) setFilterTipo('all')
                }}
                className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-400">Solo resúmenes</span>
            </label>
          </div>

          <p className="text-sm text-gray-500">
            {filteredDocs.length} de {data.metadata.totalDocs} documentos
          </p>
        </div>
      </Card>

      {/* Full text search link */}
      <Link href="/biblioteca/buscar">
        <Card className="mb-6 hover:bg-dark-700 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔎</span>
            <div>
              <p className="text-white font-medium">Búsqueda avanzada</p>
              <p className="text-sm text-gray-400">Buscar dentro del contenido de los documentos</p>
            </div>
          </div>
        </Card>
      </Link>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <Link key={doc.id} href={`/biblioteca/${doc.id}`}>
            <Card className="h-full hover:bg-dark-700 transition-all hover:scale-[1.02] cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{doc.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1 truncate">{doc.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="info" size="sm">{doc.unidad}</Badge>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getTipoStyle(doc.tipo)}`}>
                      {getTipoLabel(doc.tipo)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {doc.wordCount.toLocaleString()} palabras • {doc.readingTime} min lectura
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-400">No se encontraron documentos con esos filtros</p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => {
              setFilterUnidad('all')
              setFilterTipo('all')
              setShowOnlyResumen(false)
              setSearchQuery('')
            }}
          >
            Limpiar filtros
          </Button>
        </Card>
      )}

      <Footer />
    </div>
  )
}
