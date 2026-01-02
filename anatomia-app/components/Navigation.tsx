'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'

const navItems = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/quiz', label: 'Quiz', icon: '📝' },
  { href: '/study', label: 'Estudio', icon: '📖' },
  { href: '/biblioteca', label: 'Biblioteca', icon: '📚' },
  { href: '/stats', label: 'Stats', icon: '📊' },
  { href: '/settings', label: 'Config', icon: '⚙️' },
]

// Mobile nav has fewer items due to space constraints
const mobileNavItems = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/quiz', label: 'Quiz', icon: '📝' },
  { href: '/study', label: 'Estudio', icon: '📖' },
  { href: '/biblioteca', label: 'Docs', icon: '📚' },
  { href: '/stats', label: 'Stats', icon: '📊' },
]

export function Navigation() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useAppStore()

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 z-50 no-print">
        <div className="max-w-6xl mx-auto w-full px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <span className="text-xl font-bold text-white">SolStudy</span>
            <span className="text-xs text-primary-400 font-medium">v2.0</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
                  ${
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }
                `}
              >
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-900/95 backdrop-blur-sm border-t border-dark-700 z-50 no-print">
        <div className="flex items-center justify-around h-full px-1">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 h-full transition-all duration-200
                ${
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'text-primary-400'
                    : 'text-gray-500'
                }
              `}
            >
              <span className="text-lg mb-0.5">{item.icon}</span>
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacers */}
      <div className="hidden md:block h-16" />
      <div className="md:hidden h-0" />
    </>
  )
}
