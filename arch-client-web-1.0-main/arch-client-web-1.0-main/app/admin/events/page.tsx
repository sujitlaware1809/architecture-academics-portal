"use client"

import { useState } from "react"
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Loader2 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock events data
const mockEvents = [
  {
    id: 1,
    title: "International Architecture Symposium",
    date: "2025-10-15",
    time: "9:00 AM - 5:00 PM",
    location: "Grand Convention Center, Mumbai",
    category: "Conference",
    status: "published"
  },
  {
    id: 2,
    title: "Sustainable Urban Planning Workshop",
    date: "2025-11-05",
    time: "10:00 AM - 4:00 PM",
    location: "Green Building Council, Bangalore",
    category: "Workshop",
    status: "published"
  },
  {
    id: 3,
    title: "Architecture Career Fair",
    date: "2025-12-10",
    time: "11:00 AM - 6:00 PM",
    location: "University Campus, Delhi",
    category: "Fair",
    status: "draft"
  },
  {
    id: 4,
    title: "Historic Building Preservation Talk",
    date: "2026-01-20",
    time: "3:00 PM - 5:00 PM",
    location: "City Museum, Chennai",
    category: "Seminar",
    status: "published"
  },
  {
    id: 5,
    title: "Modern Interior Design Trends",
    date: "2026-02-15",
    time: "10:00 AM - 1:00 PM",
    location: "Design Center, Hyderabad",
    category: "Seminar",
    status: "draft"
  },
  {
    id: 6,
    title: "Architectural Photography Competition",
    date: "2026-03-01",
    time: "All Day",
    location: "Online",
    category: "Competition",
    status: "scheduled"
  },
  {
    id: 7,
    title: "Green Roof Implementation Techniques",
    date: "2026-03-25",
    time: "9:00 AM - 12:00 PM",
    location: "Environmental Center, Pune",
    category: "Workshop",
    status: "published"
  }
]

export default function AdminEvents() {
  const [events, setEvents] = useState(mockEvents)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  
  const eventsPerPage = 5
  
  // Apply filters
  const filteredEvents = events.filter(event => {
    // Search query filter
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesStatus = filterStatus ? event.status === filterStatus : true
    
    // Category filter
    const matchesCategory = filterCategory ? event.category === filterCategory : true
    
    return matchesSearch && matchesStatus && matchesCategory
  })
  
  // Pagination
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)
  
  // Get unique categories for filter
  const categories = [...new Set(events.map(event => event.category))]
  
  // Handle event deletion
  const handleDeleteEvent = (id: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setEvents(events.filter(event => event.id !== id))
        setSelectedEvents(selectedEvents.filter(eventId => eventId !== id))
        setIsLoading(false)
      }, 500)
    }
  }
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedEvents.length === 0) return
    
    if (window.confirm(`Are you sure you want to delete ${selectedEvents.length} selected events?`)) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setEvents(events.filter(event => !selectedEvents.includes(event.id)))
        setSelectedEvents([])
        setIsLoading(false)
      }, 500)
    }
  }
  
  // Handle bulk publish
  const handleBulkPublish = () => {
    if (selectedEvents.length === 0) return
    
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setEvents(events.map(event => 
        selectedEvents.includes(event.id) 
          ? { ...event, status: "published" } 
          : event
      ))
      setSelectedEvents([])
      setIsLoading(false)
    }, 500)
  }
  
  // Handle event selection
  const handleSelectEvent = (id: number) => {
    setSelectedEvents(prev => 
      prev.includes(id) 
        ? prev.filter(eventId => eventId !== id) 
        : [...prev, id]
    )
  }
  
  // Handle select all events on current page
  const handleSelectAllEvents = () => {
    if (selectedEvents.length === currentEvents.length) {
      setSelectedEvents([])
    } else {
      setSelectedEvents(currentEvents.map(event => event.id))
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Events Management</h1>
        <div className="mt-4 md:mt-0">
          <Link href="/admin/events/new">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Event
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="md:col-span-3">
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            
            <div className="md:col-span-3">
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-1">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchQuery("")
                  setFilterStatus("")
                  setFilterCategory("")
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Bulk Actions */}
      {selectedEvents.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mb-4 flex justify-between items-center">
          <span className="text-sm text-purple-700">
            {selectedEvents.length} events selected
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBulkPublish}
              disabled={isLoading}
            >
              Publish Selected
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
              disabled={isLoading}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      
      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-purple-600"
                      checked={selectedEvents.length === currentEvents.length && currentEvents.length > 0}
                      onChange={handleSelectAllEvents}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEvents.length > 0 ? (
                  currentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-purple-600"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => handleSelectEvent(event.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <div>{new Date(event.date).toLocaleDateString()}</div>
                          <div>{event.time}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{event.location}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="bg-gray-100">
                          {event.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge 
                          className={
                            event.status === 'published' ? 'bg-green-100 text-green-800' :
                            event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }
                        >
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <Link
                            href={`/admin/events/edit/${event.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Link>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={isLoading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No events found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        
        {/* Pagination */}
        {filteredEvents.length > eventsPerPage && (
          <CardFooter className="py-4 border-t border-gray-200">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstEvent + 1} to {Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded-md border ${
                      page === currentPage 
                        ? 'bg-purple-600 text-white border-purple-600' 
                        : 'bg-white text-gray-500 border-gray-300'
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <Loader2 className="animate-spin text-purple-600" />
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  )
}
