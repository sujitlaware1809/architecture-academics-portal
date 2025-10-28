"use client"

import Image from "next/image"
import { Calendar, Clock, MapPin, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoginRequiredButton } from "@/components/login-required"
import { useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

// Event type definition matching backend API response
export interface Event {
  id: number
  title: string
  description: string
  short_description?: string
  date: string
  duration: number  // Duration in hours from backend
  location?: string
  image_url?: string
  max_participants?: number
  is_online: boolean
  meeting_link?: string
  requirements?: string
  status: string
  participants_count: number
  created_at: string
  updated_at: string
  
  // Optional legacy fields for backward compatibility
  time?: string
  venue?: string
  organizer?: string
  organizerLogo?: string
  tags?: string[]
  agenda?: string[]
  speakers?: { name: string; bio: string; image?: string }[]
  registrationLink?: string
  imageUrl?: string
}

interface EventCardProps {
  event: Event
  onViewDetails: (event: Event) => void
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const { toast } = useToast()

  const eventDate = new Date(event.date)
  const month = eventDate.toLocaleString('default', { month: 'short' })
  const day = eventDate.getDate()
  
  // Extract time from date
  const eventTime = eventDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  
  // Use backend fields with fallbacks
  const displayImage = event.image_url || event.imageUrl
  const displayDescription = event.short_description || event.description
  const displayLocation = event.location || event.venue || 'TBD'
  const isOnline = event.is_online

  const handleRegister = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to register for this event",
        variant: "destructive"
      })
      // Redirect to login
      setTimeout(() => {
        window.location.href = `/login?redirect=/events`
      }, 1500)
      return
    }

    setIsRegistering(true)
    try {
      const response = await api.post(`/events/${event.id}/register`, {})
      toast({
        title: "Success! 🎉",
        description: response.data.message || "You have successfully registered for this event"
      })
      setIsRegistered(true)
    } catch (err: any) {
      console.error('Registration error:', err)
      
      // Check if it's an authentication error
      if (err.message?.includes('authentication') || err.message?.includes('credentials') || err.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again to register for this event",
          variant: "destructive"
        })
        // Clear invalid token and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        setTimeout(() => {
          window.location.href = `/login?redirect=/events`
        }, 1500)
      } else {
        toast({
          title: "Registration Failed",
          description: err.response?.data?.detail || err.message || "Failed to register for event",
          variant: "destructive"
        })
      }
    } finally {
      setIsRegistering(false)
    }
  }
  
  return (
    <article className="group cursor-pointer h-full">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-teal-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Event Image/Header */}
        <div className="relative h-48 overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-teal-100 via-cyan-100 to-sky-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="h-20 w-20 text-teal-300 group-hover:text-teal-400 transition-colors" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
          
          {/* Date Badge */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg overflow-hidden w-16">
            <div className="bg-teal-500 text-white text-xs font-bold py-1 text-center uppercase">
              {month}
            </div>
            <div className="text-2xl font-bold text-gray-900 py-2 text-center">
              {day}
            </div>
          </div>

          {/* Online Badge */}
          {isOnline && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                🌐 Online
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Tags - only show if available */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {event.tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  className="bg-teal-50 text-teal-700 hover:bg-teal-100"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Status Badge */}
          <div className="mb-3">
            <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-teal-600 transition-colors line-clamp-2">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2 flex-1">
            {displayDescription}
          </p>

          {/* Event Details */}
          <div className="space-y-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" />
              <span>{event.time || eventTime} • {event.duration}h duration</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" />
              <span className="line-clamp-1">{isOnline ? 'Online Event' : displayLocation}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" />
              <span className="line-clamp-1">
                {event.participants_count || 0} / {event.max_participants || 50} participants
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(event)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              View Details
            </button>
            <LoginRequiredButton
              action="register for events"
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors text-center text-sm ${
                isRegistered 
                  ? 'bg-green-500 text-white cursor-default' 
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
              } ${isRegistering ? 'opacity-50 cursor-wait' : ''}`}
              onClick={handleRegister}
              disabled={isRegistering || isRegistered}
            >
              {isRegistering ? 'Registering...' : isRegistered ? '✓ Registered' : 'Register Now'}
            </LoginRequiredButton>
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
