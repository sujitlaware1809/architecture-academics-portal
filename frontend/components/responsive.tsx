"use client"

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Responsive container component
interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  size = 'xl'
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  return (
    <div className={cn(
      'w-full mx-auto px-4 sm:px-6 lg:px-8',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive grid component
interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: number
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { xs: 1, sm: 2, lg: 3 },
  gap = 6
}) => {
  const gridClasses = [
    `grid gap-${gap}`,
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  )
}

// Responsive section with proper spacing
interface ResponsiveSectionProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  children,
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16 lg:py-20',
    lg: 'py-16 sm:py-20 lg:py-24',
    xl: 'py-20 sm:py-24 lg:py-32'
  }

  return (
    <section className={cn(paddingClasses[padding], className)}>
      {children}
    </section>
  )
}

// Mobile-first card component
interface MobileCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'bordered'
  padding?: 'sm' | 'md' | 'lg'
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md'
}) => {
  const variantClasses = {
    default: 'bg-card border border-border',
    elevated: 'bg-card shadow-lg border border-border',
    bordered: 'bg-card border-2 border-border'
  }

  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  return (
    <div className={cn(
      'rounded-lg transition-all duration-300',
      variantClasses[variant],
      paddingClasses[padding],
      'hover:shadow-md hover:-translate-y-1',
      className
    )}>
      {children}
    </div>
  )
}

// Responsive text component
interface ResponsiveTextProps {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  responsive?: boolean
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className = '',
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  responsive = true
}) => {
  const responsiveSizes = responsive ? {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
    '3xl': 'text-3xl sm:text-4xl lg:text-5xl',
    '4xl': 'text-4xl sm:text-5xl lg:text-6xl'
  } : {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  return (
    <Component className={cn(
      responsiveSizes[size],
      weightClasses[weight],
      className
    )}>
      {children}
    </Component>
  )
}

// Responsive button component
interface ResponsiveButtonProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  fullWidth?: boolean
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  className = '',
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  onClick,
  disabled = false,
  type = 'button'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm sm:px-4 sm:py-2',
    md: 'px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base',
    lg: 'px-6 py-2.5 text-base sm:px-8 sm:py-3 sm:text-lg'
  }

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300',
    ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  )
}

// Mobile navigation helper
interface MobileNavigationProps {
  children: ReactNode
  className?: string
  isOpen: boolean
  onClose: () => void
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  children,
  className = '',
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile menu */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-80 max-w-sm bg-background border-l border-border z-50 lg:hidden',
        'transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        className
      )}>
        {children}
      </div>
    </>
  )
}

// Responsive spacing utilities
const responsiveSpacing = {
  section: 'py-12 sm:py-16 lg:py-20',
  sectionLarge: 'py-16 sm:py-20 lg:py-32',
  container: 'px-4 sm:px-6 lg:px-8',
  cardPadding: 'p-4 sm:p-6',
  cardPaddingLarge: 'p-6 sm:p-8 lg:p-10'
}

// Breakpoint utilities
const useResponsiveBreakpoint = () => {
  // This would need to be implemented with useMediaQuery hook
  // For now, returning static values
  return {
    isMobile: false,
    isTablet: false,
    isDesktop: true
  }
}

// Mobile-optimized image component
interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'w-full h-auto object-cover rounded-lg',
        className
      )}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
    />
  )
}

export {
  responsiveSpacing,
  useResponsiveBreakpoint
}