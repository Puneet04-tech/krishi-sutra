import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  children: React.ReactNode
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200'
    
    const variants = {
      default: 'bg-secondary-slate-100 text-secondary-slate-700 border border-secondary-slate-300',
      success: 'bg-primary-green-100 text-primary-green-700 border border-primary-green-300',
      warning: 'bg-accent-gold-100 text-accent-gold-700 border border-accent-gold-300',
      error: 'bg-red-100 text-red-700 border border-red-300',
      info: 'bg-blue-100 text-blue-700 border border-blue-300'
    }
    
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm'
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'
