'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, Button, Badge } from '@/components/ui'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { Footer } from '@/components/Footer'
import { addBibliotecaHistory } from '@/lib/storage'
import bibliotecaData from '@/biblioteca_index.json'
import type { BibliotecaData, BibliotecaDocument } from '@/lib/types'

const data = bibliotecaData as BibliotecaData

// Import all markdown files
const markdownFiles: Record<string, string> = {}

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const docId = params.docId as string
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('')

  const doc = useMemo(() => {
    return data.documents.find(d => d.id === docId)
  }, [docId])

  useEffect(() => {
    if (doc) {
      addBibliotecaHistory(doc.id)
      // Load markdown content
      fetch(`/biblioteca_content/${doc.filename}`)
        .then(res => res.text())
        .then(text => {
          setContent(text)
          setIsLoading(false)
        })
        .catch(() => {
          setContent('Error al cargar el documento')
          setIsLoading(false)
        })
    }
  }, [doc])

  // Track scroll position for active section
  useEffect(() => {
    const handleScroll = () => {
      const headers = document.querySelectorAll('h1, h2, h3')
      let current = ''
      headers.forEach((header) => {
        const rect = header.getBoundingClientRect()
        if (rect.top <= 100) {
          current = header.id || header.textContent || ''
        }
      })
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (!doc) {
    return (
      <div className="container-app">
        <Card className="text-center py-12">
          <p className="text-gray-400 mb-4">Documento no encontrado</p>
          <Link href="/biblioteca">
            <Button>Volver a la biblioteca</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const getTipoStyle = (tipo: string) => {
    switch (tipo) {
      case 'teoria': return 'bg-blue-500/20 text-blue-400'
      case 'resumen': return 'bg-green-500/20 text-green-400'
      case 'guia': return 'bg-purple-500/20 text-purple-400'
      case 'indice': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-dark-600 text-gray-400'
    }
  }

  return (
    <div className="container-app">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 no-print">
        <Button variant="ghost" size="sm" onClick={() => router.push('/biblioteca')}>
          ← Biblioteca
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          🖨️ Imprimir
        </Button>
      </div>

      {/* Document Info */}
      <Card className="mb-6 no-print">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{doc.icon}</span>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{doc.title}</h1>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="info">{doc.unidad}</Badge>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getTipoStyle(doc.tipo)}`}>
                {doc.tipo.charAt(0).toUpperCase() + doc.tipo.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {doc.wordCount.toLocaleString()} palabras • {doc.readingTime} min lectura
            </p>
          </div>
        </div>
      </Card>

      {/* Table of Contents - Sidebar on desktop */}
      {doc.sections.length > 0 && (
        <Card className="mb-6 no-print">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Contenido</h3>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {doc.sections.slice(0, 15).map((section, idx) => (
              <a
                key={idx}
                href={`#${section.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                className={`block text-sm py-1 hover:text-primary-400 transition-colors ${
                  section.level === 1 ? 'font-medium text-white' :
                  section.level === 2 ? 'pl-3 text-gray-300' :
                  'pl-6 text-gray-400'
                }`}
              >
                {section.title.substring(0, 50)}{section.title.length > 50 ? '...' : ''}
              </a>
            ))}
            {doc.sections.length > 15 && (
              <p className="text-xs text-gray-500 pt-2">
                +{doc.sections.length - 15} secciones más
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Content */}
      <Card padding="lg" className="print-content">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">📄</div>
            <p className="text-gray-400">Cargando documento...</p>
          </div>
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6 no-print">
        <Link href="/biblioteca">
          <Button variant="outline">← Volver a biblioteca</Button>
        </Link>
        <Button variant="outline" onClick={handlePrint}>
          🖨️ Imprimir
        </Button>
      </div>

      <Footer />
    </div>
  )
}
