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
      primary: 'bg-gradient-to-r from-cyber-emerald to-emerald-accent text-black font-bold shadow-lg hover:from-emerald-accent hover:to-emerald-light cyber-emerald-glow uppercase tracking-wider',
      secondary: 'bg-gradient-to-r from-emerald-light to-cyber-neon text-black font-bold shadow-lg hover:from-cyber-neon hover:to-gold-cyber cyber-neon-glow uppercase tracking-wider',
      accent: 'bg-gradient-to-r from-emerald-accent to-gold-cyber text-black font-bold shadow-lg hover:from-gold-cyber hover:to-cyber-orange cyber-gold-glow uppercase tracking-wider',
      ghost: 'bg-transparent text-cyber-emerald font-bold hover:text-emerald-accent hover:bg-frosted-cyber cyber-emerald-glow uppercase tracking-wider',
      outline: 'border-2 border-cyber-emerald text-cyber-emerald font-bold hover:bg-cyber-emerald hover:text-cyber-dark cyber-emerald-glow uppercase tracking-wider'
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
