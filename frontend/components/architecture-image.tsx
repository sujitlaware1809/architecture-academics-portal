"use client"

import { useState, useEffect } from "react"
import { FileText } from "lucide-react"

interface ArchitectureImageProps {
  blogId?: number
  category?: string
  className?: string
  alt?: string
  width?: number
  height?: number
}

// Simplified architecture image collection
const architectureImageUrls = [
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625", // Modern glass building
  "https://images.unsplash.com/photo-1518780664697-55e3ad13c0c6", // Geometric white architecture
  "https://images.unsplash.com/photo-1511818966892-d5d671fb5ffe", // Contemporary glass tower
  "https://images.unsplash.com/photo-1486406146700-532a9ca61417", // Curved modern office
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10b86", // Angular contemporary design
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000", // Urban skyscraper
  "https://images.unsplash.com/photo-1558618047-3c8da1c04d0a", // Minimalist facade
  "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e6", // Brutalist structure
  "https://images.unsplash.com/photo-1495433167890-4c28362e931e", // Glass and steel
  "https://images.unsplash.com/photo-1520637836862-4d197d17c82a", // Residential building
]

export function ArchitectureImage({ 
  blogId = 1, 
  category, 
  className = "w-full h-full object-cover", 
  alt = "Architecture", 
  width = 400, 
  height = 300 
}: ArchitectureImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Get image based on blog ID with some variety
  const getImageUrl = () => {
    const hash = (blogId * 31 + (category?.length || 0)) % architectureImageUrls.length
    const baseUrl = architectureImageUrls[hash]
    return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format&q=80`
  }

  const imageUrl = getImageUrl()

  const handleLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleError = () => {
    console.warn('Failed to load architecture image:', imageUrl)
    setImageError(true)
    setImageLoaded(false)
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-100 via-indigo-50 to-cyan-100">
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          display: imageLoaded && !imageError ? 'block' : 'none'
        }}
      />
      
      {/* Fallback icon when image fails or is loading */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          imageLoaded && !imageError ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <FileText className="h-16 w-16 text-blue-300" />
      </div>
    </div>
  )
}