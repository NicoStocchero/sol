'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-dark-800 border border-dark-600
            text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-incorrect focus:ring-incorrect' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-incorrect">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
