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
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
    
    const variants = {
      primary: 'bg-gradient-to-r from-primary-green to-primary-green-500 text-white shadow-lg hover:from-primary-green-500 hover:to-primary-green-400',
      secondary: 'bg-gradient-to-r from-secondary-slate to-secondary-slate-500 text-white shadow-lg hover:from-secondary-slate-500 hover:to-secondary-slate-400',
      accent: 'bg-gradient-to-r from-accent-gold to-accent-gold-400 text-white shadow-lg hover:from-accent-gold-400 hover:to-accent-gold-300',
      ghost: 'bg-transparent text-primary-green hover:bg-primary-green-50',
      outline: 'border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white'
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
