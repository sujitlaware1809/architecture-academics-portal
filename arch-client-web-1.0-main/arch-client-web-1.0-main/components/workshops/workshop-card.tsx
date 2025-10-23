"use client"

import Image from "next/image"
import { Clock, User, MapPin, BookOpen, Award, Tag } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

// Workshop type definition matching backend API response
export interface Workshop {
  id: number
  title: string
  description: string
  short_description?: string
  date: string
  duration: number  // Duration in hours from backend
  max_participants: number
  price: number
  currency?: string
  location?: string
  image_url?: string
  requirements?: string
  status: string
  created_at: string
  updated_at: string
  instructor_id?: number
  registered_count: number
  
  // Optional legacy fields for backward compatibility
  trainer?: {
    name: string
    bio: string
    image?: string
  }
  mode?: "Online" | "Offline"
  venue?: string
  category?: string
  difficulty?: "Beginner" | "Intermediate" | "Advanced"
  syllabus?: string[]
  prerequisites?: string[]
  isTrending?: boolean
  limitedSeats?: boolean
  isFDP?: boolean
  imageUrl?: string
}

interface WorkshopCardProps {
  workshop: Workshop
  onViewDetails: (workshop: Workshop) => void
}

export function WorkshopCard({ workshop, onViewDetails }: WorkshopCardProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const { toast } = useToast()

  const workshopDate = new Date(workshop.date)
  const month = workshopDate.toLocaleString('default', { month: 'short' })
  const day = workshopDate.getDate()
  
  // Use backend fields with fallbacks
  const displayImage = workshop.image_url || workshop.imageUrl
  const displayDescription = workshop.short_description || workshop.description
  const displayLocation = workshop.location || workshop.venue || 'TBD'
  const displayPrice = workshop.price === 0 ? 'Free' : `${workshop.currency || '₹'}${workshop.price}`
  const trainerName = workshop.trainer?.name || 'Instructor'
  const workshopMode = workshop.location && workshop.location.toLowerCase().includes('online') ? 'Online' : 'Offline'
  
  // Check if limited seats (less than 30% capacity available)
  const availableSeats = workshop.max_participants - workshop.registered_count
  const isLimitedSeats = availableSeats < workshop.max_participants * 0.3

  const handleRegister = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to register for this workshop",
        variant: "destructive"
      })
      // Redirect to login
      setTimeout(() => {
        window.location.href = `/login?redirect=/workshops`
      }, 1500)
      return
    }

    setIsRegistering(true)
    try {
      const response = await api.post(`/workshops/${workshop.id}/register`, {})
      toast({
        title: "Success! 🎉",
        description: response.data.message || "You have successfully registered for this workshop"
      })
      setIsRegistered(true)
    } catch (err: any) {
      console.error('Registration error:', err)
      
      // Check if it's an authentication error
      if (err.message?.includes('authentication') || err.message?.includes('credentials') || err.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again to register for this workshop",
          variant: "destructive"
        })
        // Clear invalid token and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        setTimeout(() => {
          window.location.href = `/login?redirect=/workshops`
        }, 1500)
      } else {
        toast({
          title: "Registration Failed",
          description: err.response?.data?.detail || err.message || "Failed to register for workshop",
          variant: "destructive"
        })
      }
    } finally {
      setIsRegistering(false)
    }
  }
  
  return (
    <article className="group cursor-pointer h-full">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Workshop Image/Header */}
        <div className="relative h-48 overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={workshop.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-20 w-20 text-purple-300 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
          
          {/* Date Badge */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg overflow-hidden w-16">
            <div className={`${workshop.isFDP ? 'bg-indigo-500' : 'bg-purple-500'} text-white text-xs font-bold py-1 text-center uppercase`}>
              {month}
            </div>
            <div className="text-2xl font-bold text-gray-900 py-2 text-center">
              {day}
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Badge variant={workshop.status === 'upcoming' ? 'default' : 'secondary'}>
              {workshop.status}
            </Badge>
            {workshop.isTrending && (
              <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                🔥 Trending
              </Badge>
            )}
            {(isLimitedSeats || workshop.limitedSeats) && (
              <Badge className="bg-red-500 text-white hover:bg-red-600">
                ⏰ Limited
              </Badge>
            )}
            {workshop.isFDP && (
              <Badge className="bg-indigo-600 text-white hover:bg-indigo-700">
                🎓 FDP
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Category & Difficulty - only show if available */}
          {(workshop.difficulty || workshop.category) && (
            <div className="flex gap-2 flex-wrap mb-3">
              {workshop.difficulty && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  workshop.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                  workshop.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {workshop.difficulty}
                </span>
              )}
              {workshop.category && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  {workshop.category}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-purple-600 transition-colors line-clamp-2">
            {workshop.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2 flex-1">
            {displayDescription}
          </p>

          {/* Workshop Details */}
          <div className="space-y-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
              <span className="line-clamp-1">{trainerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
              <span>{workshop.duration}h duration</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
              <span className="line-clamp-1">{workshopMode} {displayLocation !== 'TBD' ? `- ${displayLocation}` : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
              <span>{workshop.registered_count || 0} / {workshop.max_participants} registered</span>
            </div>
          </div>

          {/* Price & Mode Badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-purple-600">
              {displayPrice}
            </span>
            {workshopMode === 'Online' && (
              <Badge className="bg-blue-100 text-blue-700">🌐 Online</Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(workshop)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              View Details
            </button>
            <button
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors text-sm text-white ${
                isRegistered 
                  ? 'bg-green-500 cursor-default'
                  : workshop.isFDP 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              } ${isRegistering ? 'opacity-50 cursor-wait' : ''}`}
              onClick={handleRegister}
              disabled={isRegistering || isRegistered}
            >
              {isRegistering ? 'Registering...' : isRegistered ? '✓ Registered' : 'Register Now'}
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </article>
  )
}
