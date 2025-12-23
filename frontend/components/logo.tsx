'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  showText?: boolean
  variant?: 'default' | 'white' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  inlineText?: boolean
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true, 
  variant = 'default',
  size = 'md',
  inlineText = false,
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const textColorClasses = {
    default: 'text-gray-900',
    white: 'text-white',
    dark: 'text-gray-900'
  }

  const pixelSizes: Record<string, number> = {
    sm: 24,
    md: 32,
    lg: 48,
  }

  return (
    <Link href="/" className={`flex items-center space-x-3 ${className}`}>
      {/* Icon: rounded gray square with logo image centered */}
      <div className={`${sizeClasses[size]} flex-shrink-0 rounded-lg overflow-hidden bg-gray-300 flex items-center justify-center`}> 
        <Image
          src="/logo.jpg"
          alt="AAO logo"
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="object-contain p-1"
          priority={true}
        />
      </div>

      {showText && (
        inlineText ? (
          <div className="flex items-center gap-2 leading-none whitespace-nowrap">
            <span className={`font-semibold ${textSizeClasses[size]} ${variant === 'white' ? 'text-white' : 'text-gray-900'}`}>
              AAO
            </span>
            {size !== 'sm' && (
              <span className={`text-xs ${variant === 'white' ? 'text-white/85' : 'text-gray-500'} lowercase`}>architecture-academics.online</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col leading-tight">
            <span className={`font-semibold ${textSizeClasses[size]} ${variant === 'white' ? 'text-white' : 'text-gray-900'}`}>
              AAO
            </span>
            {size !== 'sm' && (
              <span className={`text-xs ${variant === 'white' ? 'text-white/85' : 'text-gray-500'} lowercase`}>architecture-academics.online</span>
            )}
          </div>
        )
      )}
    </Link>
  )
}

export default Logo