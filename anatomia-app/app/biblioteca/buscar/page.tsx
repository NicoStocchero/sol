'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, Button, Input, Badge } from '@/components/ui'
import { Footer } from '@/components/Footer'
import bibliotecaData from '@/biblioteca_index.json'
import type { BibliotecaData } from '@/lib/types'

const data = bibliotecaData as BibliotecaData

interface SearchResult {
  docId: string
  docTitle: string
  docIcon: string
  snippet: string
  matchCount: number
}

export default function BuscarPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)
    const query = searchQuery.toLowerCase()
    const searchResults: SearchResult[] = []

    // Search through each document
    for (const doc of data.documents) {
      try {
        const response = await fetch(`/biblioteca_content/${doc.filename}`)
        const content = await response.text()
        const lowerContent = content.toLowerCase()

        if (lowerContent.includes(query)) {
          // Count matches
          const matches = lowerContent.split(query).length - 1

          // Find snippet with context
          const index = lowerContent.indexOf(query)
          const start = Math.max(0, index - 100)
          const end = Math.min(content.length, index + query.length + 100)
          let snippet = content.substring(start, end)

          // Clean up snippet
          if (start > 0) snippet = '...' + snippet
          if (end < content.length) snippet = snippet + '...'

          // Highlight the match
          const highlightedSnippet = snippet.replace(
            new RegExp(`(${searchQuery})`, 'gi'),
            '**$1**'
          )

          searchResults.push({
            docId: doc.id,
            docTitle: doc.title,
            docIcon: doc.icon,
            snippet: highlightedSnippet,
            matchCount: matches,
          })
        }
      } catch (error) {
        console.error(`Error searching ${doc.filename}:`, error)
      }
    }

    // Sort by match count
    searchResults.sort((a, b) => b.matchCount - a.matchCount)
    setResults(searchResults)
    setIsSearching(false)
  }, [searchQuery])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="container-app">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/biblioteca">
          <Button variant="ghost" size="sm">← Biblioteca</Button>
        </Link>
        <h1 className="page-title mb-0">🔎 Búsqueda Avanzada</h1>
      </div>

      {/* Search Box */}
      <Card className="mb-6">
        <div className="flex gap-3">
          <Input
            placeholder="Buscar en el contenido de los documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Busca términos específicos dentro de todos los documentos de la biblioteca
        </p>
      </Card>

      {/* Results */}
      {isSearching && (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4 animate-pulse">🔍</div>
          <p className="text-gray-400">Buscando en {data.metadata.totalDocs} documentos...</p>
        </Card>
      )}

      {!isSearching && hasSearched && results.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-400">No se encontraron resultados para "{searchQuery}"</p>
          <p className="text-sm text-gray-500 mt-2">Intentá con otros términos</p>
        </Card>
      )}

      {!isSearching && results.length > 0 && (
        <>
          <p className="text-sm text-gray-400 mb-4">
            {results.length} documento{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-4">
            {results.map((result) => (
              <Link key={result.docId} href={`/biblioteca/${result.docId}`}>
                <Card className="hover:bg-dark-700 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{result.docIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{result.docTitle}</h3>
                        <Badge variant="info" size="sm">{result.matchCount} coincidencias</Badge>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-3">
                        {result.snippet.split('**').map((part, i) =>
                          i % 2 === 1 ? (
                            <mark key={i} className="bg-primary-500/30 text-primary-300 px-0.5 rounded">
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      <Footer />
    </div>
  )
}
