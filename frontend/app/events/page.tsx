"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Search, 
  Calendar, 
  MapPin, 
  Filter, 
  X,  
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { EventCard, Event } from "@/components/events/event-card"
import { EventDetailModal } from "@/components/events/event-detail-modal"
import { api } from "@/lib/api"

export default function EventsPortal() {
  // State management
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  
  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    date: "",
    location: "",
    isOnline: false
  })

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        const response = await api.get('/events')
        if (response.data) {
          setEvents(response.data)
          setFilteredEvents(response.data)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Handle search and filtering
  useEffect(() => {
    let filtered = events

    // Search by title, description, organizer
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.organizer?.toLowerCase().includes(query) ||
        event.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(event => 
        event.tags?.some(tag => tag.toLowerCase() === filters.category.toLowerCase())
      )
    }

    // Apply date filter
    if (filters.date) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        const filterDate = new Date(filters.date)
        return eventDate.toDateString() === filterDate.toDateString()
      })
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(event => 
        event.venue?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Filter by online status
    if (filters.isOnline) {
      filtered = filtered.filter(event => event.is_online)
    }

    // Filter by Active Tab (Upcoming vs Past)
    const now = new Date()
    if (activeTab === "upcoming") {
      filtered = filtered.filter(event => new Date(event.date) >= now)
    } else {
      filtered = filtered.filter(event => new Date(event.date) < now)
    }

    setFilteredEvents(filtered)
  }, [searchQuery, filters, events, activeTab])

  // Handle opening event details
  const openEventDetails = (event: Event) => {
    setSelectedEvent(event)
    setShowDetailModal(true)
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setFilters({
      category: "",
      date: "",
      location: "",
      isOnline: false
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 text-center bg-gradient-to-r from-teal-500 to-sky-400 hero-section">
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Discover Events Around You</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join architecture workshops, seminars, conferences, and more to expand your knowledge and network with professionals
          </p>
          <button
            className="explore-button"
            onClick={() => document.getElementById('events-listing')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Events
          </button>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="max-w-7xl mx-auto px-4 py-8 -mt-8 z-10 relative">
        <div className="bg-white rounded-xl shadow-xl p-6 search-card">
          {/* Tabs for Upcoming/Past */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
                activeTab === "upcoming"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
                activeTab === "past"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Past Events
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                type="text"
                placeholder="Search events by title, description, or tags..."
                className="pl-10 h-12 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* Category Filter */}
              <div className="relative min-w-[150px]">
                <select
                  className="filter-select"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="">All Categories</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="exhibition">Exhibition</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="relative min-w-[150px]">
                <input
                  type="date"
                  className="filter-select"
                  value={filters.date}
                  onChange={(e) => setFilters({...filters, date: e.target.value})}
                />
              </div>

              {/* Location Filter */}
              <div className="relative min-w-[150px]">
                <input
                  type="text"
                  placeholder="Location"
                  className="filter-select"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                />
              </div>

              {/* Online Filter */}
              <div className="flex items-center h-12 px-3 border border-gray-200 rounded-md bg-white">
                <input
                  type="checkbox"
                  id="online-filter"
                  className="h-4 w-4 text-teal-500 focus:ring-teal-500"
                  checked={filters.isOnline}
                  onChange={(e) => setFilters({...filters, isOnline: e.target.checked})}
                />
                <label htmlFor="online-filter" className="ml-2 text-sm">
                  Online Only
                </label>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="h-12 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center gap-1 transition-colors"
              >
                <X size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Listing */}
      <section id="events-listing" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
          <p className="text-gray-600">{filteredEvents.length} events found</p>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600">No events match your criteria</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
            <button 
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                onViewDetails={openEventDetails}
              />
            ))}
          </div>
        )}
      </section>

      {/* Event Detail Modal */}
      {showDetailModal && selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setShowDetailModal(false)} 
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Architecture Academics</h3>
            <p className="text-gray-400 mb-4">
              Modern architecture education platform with courses, jobs, events, and resources
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-500 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-500 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-500 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/events" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Events</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Courses</Link></li>
              <li><Link href="/jobs-portal" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Jobs</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Login</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Register</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>123 Architecture Way, City, Country</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@architectureacademics.com</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+1 (123) 456-7890</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Architecture Academics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
