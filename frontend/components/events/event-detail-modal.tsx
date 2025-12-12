import Image from "next/image"
import { Calendar, Clock, MapPin, User, X, ArrowRight, Users, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Event } from "./event-card"
import { api } from "@/lib/api"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"

interface EventDetailModalProps {
  event: Event
  onClose: () => void
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkRegistrationStatus()
  }, [event.id])

  const checkRegistrationStatus = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/events/${event.id}/check-registration`)
      if (response.data?.is_registered) {
        setIsRegistered(true)
      }
    } catch (error) {
      // User might not be registered or there's an error, but we'll allow them to try
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    try {
      setIsRegistering(true)
      const response = await api.post(`/events/${event.id}/register`, {})
      if (response.data) {
        setIsRegistered(true)
        toast.success('Successfully registered for the event!')
      }
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Failed to register. Please try again.'
      toast.error(message)
    } finally {
      setIsRegistering(false)
    }
  }
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 event-modal">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Event Details</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Event Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="relative h-64 md:h-auto md:w-1/2 bg-gray-100 rounded-lg overflow-hidden">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-100 to-sky-100">
                  <Calendar className="h-24 w-24 text-teal-400/50" />
                </div>
              )}
            </div>
            
            <div className="md:w-1/2">
              <div className="flex gap-2 mb-3 flex-wrap">
                {event.tags?.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className={`category-tag ${tag.toLowerCase()}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {event.title}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {event.description}
              </p>
              
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-teal-500" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                {event.duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-teal-500" />
                    <span>{event.duration} hours duration</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-teal-500" />
                  <span>{event.is_online ? 'Online Event' : (event.location || event.venue || 'Location TBA')}</span>
                </div>
                
                {event.meeting_link && event.is_online && (
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-teal-500" />
                    <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                      Join Meeting Link
                    </a>
                  </div>
                )}
                
                {event.organizer && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-teal-500" />
                    <span>Organized by {event.organizer}</span>
                  </div>
                )}
                
                {event.max_participants && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-teal-500" />
                    <span>{event.participants_count || 0} / {event.max_participants} Participants</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Requirements */}
          {event.requirements && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Requirements</h3>
              <p className="text-gray-700 whitespace-pre-line">{event.requirements}</p>
            </div>
          )}
          
          {/* Event Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Event Agenda</h3>
              <ul className="space-y-3">
                {event.agenda.map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Speakers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.speakers.map((speaker, index) => (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg">
                    <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {speaker.image ? (
                        <Image
                          src={speaker.image}
                          alt={speaker.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <User className="h-full w-full p-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{speaker.name}</h4>
                      <p className="text-sm text-gray-600">{speaker.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* CTA */}
          <div className="bg-gradient-to-r from-teal-50 to-sky-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Join?</h3>
            <p className="text-gray-600 mb-4">
              Secure your spot at this event by registering now. Don't miss this opportunity!
            </p>
            <button
              onClick={handleRegister}
              disabled={isRegistering || isRegistered || isLoading}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-md transition-colors duration-200 font-semibold ${
                isRegistered
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : isLoading
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-teal-500 text-white hover:bg-teal-600 disabled:bg-gray-400'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Loading...
                </>
              ) : isRegistering ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Registering...
                </>
              ) : isRegistered ? (
                <>
                  ✓ Already Registered
                </>
              ) : (
                <>
                  Register Now
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

