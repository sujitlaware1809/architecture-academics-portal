import Image from "next/image"
import { Calendar, Clock, MapPin, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Event type definition
export interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  venue: string
  isOnline: boolean
  organizer: string
  organizerLogo?: string
  tags: string[]
  agenda?: string[]
  speakers?: { name: string; bio: string; image?: string }[]
  registrationLink: string
  imageUrl?: string
}

interface EventCardProps {
  event: Event
  onViewDetails: (event: Event) => void
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group event-card">
      <div className="relative h-48 w-full bg-gray-100">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-100 to-sky-100">
            <Calendar className="h-16 w-16 text-teal-400/50" />
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white shadow-md rounded-lg overflow-hidden date-badge">
          <div className="month">
            {new Date(event.date).toLocaleString('default', { month: 'short' })}
          </div>
          <div className="day">
            {new Date(event.date).getDate()}
          </div>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex gap-2 flex-wrap">
          {event.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className={`category-tag ${tag.toLowerCase()}`}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-xl group-hover:text-teal-600 transition-colors duration-200 mt-2">
          {event.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-0">
        <CardDescription className="line-clamp-2 mb-4">
          {event.description}
        </CardDescription>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-teal-500" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-teal-500" />
            <span>{event.isOnline ? 'Online' : event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-teal-500" />
            <span>{event.organizer}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-6 flex gap-2">
        <button
          onClick={() => onViewDetails(event)}
          className="flex-1 text-center px-4 py-2 border border-teal-500 text-teal-600 rounded-md hover:bg-teal-50 transition-colors duration-200"
        >
          View Details
        </button>
        <a
          href={event.registrationLink}
          className="flex-1 text-center px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors duration-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          Register Now
        </a>
      </CardFooter>
    </Card>
  )
}
