'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchInDocuments, highlightMatch, SearchResult } from '@/lib/search';
import bibliotecaData from '@/biblioteca_index.json';
import type { BibliotecaData } from '@/lib/types';

const data = bibliotecaData as BibliotecaData;

interface DocumentContent {
  id: string;
  title: string;
  icon: string;
  content: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allContent, setAllContent] = useState<DocumentContent[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all document content once user focuses the search
  const loadContent = useCallback(async () => {
    if (contentLoaded) return;

    setIsLoading(true);
    try {
      const docs = await Promise.all(
        data.documents.map(async (doc) => {
          try {
            const res = await fetch(`/biblioteca_content/${doc.filename}`);
            const content = await res.text();
            return { id: doc.id, title: doc.title, icon: doc.icon, content };
          } catch {
            return { id: doc.id, title: doc.title, icon: doc.icon, content: '' };
          }
        })
      );
      setAllContent(docs);
      setContentLoaded(true);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contentLoaded]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (!contentLoaded) return;

    const timer = setTimeout(() => {
      const searchResults = searchInDocuments(query, allContent);
      setResults(searchResults);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, allContent, contentLoaded]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        loadContent();
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loadContent]);

  const handleNavigate = (docId: string) => {
    router.push(`/biblioteca/${docId}?highlight=${encodeURIComponent(query)}`);
    setIsOpen(false);
    setQuery('');
  };

  const renderHighlightedText = (text: string) => {
    const parts = highlightMatch(text, query);
    return parts.map((part, i) => {
      if (part.type === 'highlight') {
        return (
          <mark key={i} className="bg-primary-500/40 text-primary-200 px-0.5 rounded">
            {part.content}
          </mark>
        );
      }
      return <span key={i}>{part.content}</span>;
    });
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            loadContent();
          }}
          className="w-32 lg:w-48 bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 pl-8
                     text-sm text-white placeholder-gray-500
                     focus:outline-none focus:border-primary-500 focus:w-48 lg:focus:w-64
                     transition-all duration-200"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          🔍
        </span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600 hidden lg:inline">
          ⌘K
        </span>
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full right-0 mt-2 w-[400px] max-w-[90vw] bg-dark-800 border border-dark-600
                        rounded-lg shadow-2xl max-h-[70vh] overflow-y-auto z-[100]">
          {isLoading && !contentLoaded ? (
            <div className="p-4 text-center text-gray-400">
              <span className="animate-pulse">Cargando documentos...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontró "{query}" en ningún documento
            </div>
          ) : (
            <>
              <div className="px-3 py-2 text-xs text-gray-500 border-b border-dark-600">
                {results.reduce((acc, r) => acc + r.totalMatches, 0)} coincidencias en {results.length} documento{results.length !== 1 ? 's' : ''}
              </div>
              {results.slice(0, 5).map((result) => (
                <div key={result.docId} className="border-b border-dark-700 last:border-0">
                  {/* Document header */}
                  <button
                    onClick={() => handleNavigate(result.docId)}
                    className="w-full px-3 py-2 bg-dark-700/50 flex items-center gap-2 hover:bg-dark-700 transition-colors text-left"
                  >
                    <span>{result.docIcon}</span>
                    <span className="font-medium text-white text-sm flex-1 truncate">
                      {result.docTitle}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.totalMatches}
                    </span>
                  </button>

                  {/* Top match preview */}
                  {result.matches.slice(0, 2).map((match, i) => (
                    <button
                      key={i}
                      onClick={() => handleNavigate(result.docId)}
                      className="w-full px-3 py-2 text-left hover:bg-dark-700/50 transition-colors"
                    >
                      {match.section && (
                        <div className="text-xs text-primary-400 mb-1 truncate">
                          📍 {match.section}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 line-clamp-2">
                        {renderHighlightedText(match.text)}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
              {results.length > 5 && (
                <button
                  onClick={() => {
                    router.push(`/biblioteca/buscar?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-primary-400 hover:bg-dark-700 transition-colors text-center"
                >
                  Ver todos los {results.length} resultados →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
