"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  Wrench,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RegisteredWorkshop {
  id: number
  workshop_id: number
  registered_at: string
  status: string
  workshop: {
    id: number
    title: string
    description: string
    image_url: string
    date: string
    time: string
    location: string
    capacity: number
    registered_count: number
    category: string
    skill_level: string
  }
}

export default function MyWorkshopsPage() {
  const [registeredWorkshops, setRegisteredWorkshops] = useState<RegisteredWorkshop[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  useEffect(() => {
    fetchRegisteredWorkshops()
  }, [])

  const fetchRegisteredWorkshops = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/workshop-registrations/my-workshops')
      if (response && response.data) {
        setRegisteredWorkshops(response.data)
      }
    } catch (error) {
      console.error('Error fetching registered workshops:', error)
    } finally {
      setLoading(false)
    }
  }

  const isWorkshopUpcoming = (date: string) => {
    return new Date(date) > new Date()
  }

  const filteredWorkshops = registeredWorkshops.filter(registration => {
    if (filter === 'upcoming') return isWorkshopUpcoming(registration.workshop.date)
    if (filter === 'past') return !isWorkshopUpcoming(registration.workshop.date)
    return true
  })

  const stats = {
    total: registeredWorkshops.length,
    upcoming: registeredWorkshops.filter(w => isWorkshopUpcoming(w.workshop.date)).length,
    past: registeredWorkshops.filter(w => !isWorkshopUpcoming(w.workshop.date)).length,
  }

  const getStatusBadge = (registration: RegisteredWorkshop) => {
    const isUpcoming = isWorkshopUpcoming(registration.workshop.date)
    
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
              <h1 className="text-4xl font-bold mb-2">My Workshops</h1>
              <p className="text-blue-100">Your registered hands-on workshops</p>
            </div>
            <Wrench className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Workshops</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Wrench className="h-10 w-10 text-blue-600" />
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
                <p className="text-gray-600 text-sm">Past Workshops</p>
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
              All Workshops ({stats.total})
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
              Past Workshops ({stats.past})
            </button>
          </div>
        </div>

        {/* Workshops Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading your workshops...</p>
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'all' 
                ? 'No Workshops Yet' 
                : filter === 'upcoming' 
                ? 'No Upcoming Workshops' 
                : 'No Past Workshops'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Register for hands-on workshops to see them here'
                : filter === 'upcoming'
                ? 'Register for upcoming workshops to see them here'
                : 'Your past workshops will appear here'}
            </p>
            <Link
              href="/workshops"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md font-semibold hover:shadow-lg transition-shadow"
            >
              Browse Workshops
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredWorkshops.map((registration) => (
              <div key={registration.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={registration.workshop.image_url || 'https://placehold.co/800x450/png?text=Workshop+Image'}
                    alt={registration.workshop.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(registration)}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{registration.workshop.category || 'Workshop'}</Badge>
                    <Badge variant="outline">{registration.workshop.skill_level || 'All Levels'}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {registration.workshop.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {registration.workshop.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{new Date(registration.workshop.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{registration.workshop.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="line-clamp-1">{registration.workshop.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>{registration.workshop.registered_count}/{registration.workshop.capacity} Registered</span>
                    </div>
                  </div>

                  <Link
                    href={`/workshops/${registration.workshop_id}`}
                    className="block w-full py-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md font-semibold hover:shadow-lg transition-shadow"
                  >
                    View Workshop Details
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
