import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-300',
      secondary: 'bg-white text-emerald-600 font-medium border-2 border-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300',
      accent: 'bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300',
      ghost: 'bg-transparent text-gray-600 font-medium hover:text-emerald-600 hover:bg-gray-100 transition-all duration-300',
      outline: 'border-2 border-emerald-600 text-emerald-600 font-medium hover:bg-emerald-600 hover:text-white transition-all duration-300'
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg'
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
