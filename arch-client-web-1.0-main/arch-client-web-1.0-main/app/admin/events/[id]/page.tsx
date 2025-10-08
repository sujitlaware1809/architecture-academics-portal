"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  User, 
  Mail, 
  Globe, 
  Ticket, 
  Edit, 
  Trash2,
  ExternalLink,
  Share2,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { getEventById } from "@/lib/api"

export default function EventPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true)
        const data = await getEventById(id)
        setEvent(data)
      } catch (err) {
        console.error("Failed to fetch event:", err)
        setError("Failed to load event details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const handleDeleteEvent = async () => {
    try {
      setDeleteLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirect after successful deletion
      router.push("/admin/events")
    } catch (error) {
      console.error("Failed to delete event:", error)
      setError("Failed to delete event. Please try again.")
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <button 
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold">{event.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/events/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="text-red-500 hover:text-red-700"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={event.featuredImage || "/placeholder.jpg"} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
              <CardDescription>
                <div className="flex space-x-4 mt-2">
                  <Badge>{event.category}</Badge>
                  <Badge variant={event.status === 'published' ? 'default' : 'outline'}>
                    {event.status === 'published' ? 'Published' : event.status === 'draft' ? 'Draft' : 'Scheduled'}
                  </Badge>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium">Date & Time</h3>
                  <p>{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p>{event.startTime} - {event.endTime}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p>{event.venue}</p>
                  <p>{event.location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium">Organizer</h3>
                  <p>{event.organizer}</p>
                </div>
              </div>

              {event.contact && (
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium">Contact</h3>
                    <a href={`mailto:${event.contact}`} className="text-blue-600 hover:underline">{event.contact}</a>
                  </div>
                </div>
              )}

              {event.website && (
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium">Website</h3>
                    <a 
                      href={event.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      Visit Website
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {(event.ticketPrice || event.ticketUrl) && (
                <div className="flex items-start">
                  <Ticket className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium">Ticket Information</h3>
                    {event.ticketPrice && <p>Price: {event.ticketPrice}</p>}
                    {event.ticketUrl && (
                      <a 
                        href={event.ticketUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        Get Tickets
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Copy Event Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
