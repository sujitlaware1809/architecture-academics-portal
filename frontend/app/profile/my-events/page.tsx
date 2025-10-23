"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RegisteredEvent {
  id: number
  event_id: number
  registered_at: string
  status: string
  event: {
    id: number
    title: string
    description: string
    image_url: string
    event_date: string
    event_time: string
    location: string
    capacity: number
    registered_count: number
    event_type: string
  }
}

export default function MyEventsPage() {
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  useEffect(() => {
    fetchRegisteredEvents()
  }, [])

  const fetchRegisteredEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/event-registrations/my-events')
      if (response && response.data) {
        setRegisteredEvents(response.data)
      }
    } catch (error) {
      console.error('Error fetching registered events:', error)
    } finally {
      setLoading(false)
    }
  }

  const isEventUpcoming = (eventDate: string) => {
    return new Date(eventDate) > new Date()
  }

  const filteredEvents = registeredEvents.filter(registration => {
    if (filter === 'upcoming') return isEventUpcoming(registration.event.event_date)
    if (filter === 'past') return !isEventUpcoming(registration.event.event_date)
    return true
  })

  const stats = {
    total: registeredEvents.length,
    upcoming: registeredEvents.filter(e => isEventUpcoming(e.event.event_date)).length,
    past: registeredEvents.filter(e => !isEventUpcoming(e.event.event_date)).length,
  }

  const getStatusBadge = (registration: RegisteredEvent) => {
    const isUpcoming = isEventUpcoming(registration.event.event_date)
    
    if (!isUpcoming) {
      return <Badge className="bg-gray-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
    }

    if (registration.status === 'confirmed') {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
    }

    if (registration.status === 'pending') {
      return <Badge className="bg-yellow-500 text-white"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>
    }

    if (registration.status === 'cancelled') {
      return <Badge className="bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
    }

    return <Badge className="bg-blue-500 text-white">Registered</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/profile" 
            className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Events</h1>
              <p className="text-blue-100">Your registered architecture events</p>
            </div>
            <Calendar className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming</p>
                <p className="text-3xl font-bold text-green-600">{stats.upcoming}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Past Events</p>
                <p className="text-3xl font-bold text-gray-600">{stats.past}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Events ({stats.total})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Upcoming ({stats.upcoming})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Past Events ({stats.past})
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading your events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'all' 
                ? 'No Events Yet' 
                : filter === 'upcoming' 
                ? 'No Upcoming Events' 
                : 'No Past Events'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Register for architecture events to see them here'
                : filter === 'upcoming'
                ? 'Register for upcoming events to see them here'
                : 'Your past events will appear here'}
            </p>
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md font-semibold hover:shadow-lg transition-shadow"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredEvents.map((registration) => (
              <div key={registration.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={registration.event.image_url || 'https://placehold.co/800x450/png?text=Event+Image'}
                    alt={registration.event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(registration)}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{registration.event.event_type || 'Event'}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {registration.event.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {registration.event.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{new Date(registration.event.event_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{registration.event.event_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="line-clamp-1">{registration.event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>{registration.event.registered_count}/{registration.event.capacity} Registered</span>
                    </div>
                  </div>

                  <Link
                    href={`/events/${registration.event_id}`}
                    className="block w-full py-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md font-semibold hover:shadow-lg transition-shadow"
                  >
                    View Event Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
