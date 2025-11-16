'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  showText?: boolean
  variant?: 'default' | 'white' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true, 
  variant = 'default',
  size = 'md'
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

  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <Image
          src="/logo.jpg"
          alt="AAO Logo"
          width={32}
          height={32}
          className="object-contain rounded-lg"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizeClasses[size]} leading-tight ${
            variant === 'white' 
              ? 'text-white' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
          }`}>
            AAO
          </span>
          {size !== 'sm' && (
            <span className={`text-xs leading-tight ${
              variant === 'white' 
                ? 'text-white opacity-75' 
                : 'text-gray-500 font-medium lowercase'
            }`}>
              architectureacademics.online
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

export default Logo