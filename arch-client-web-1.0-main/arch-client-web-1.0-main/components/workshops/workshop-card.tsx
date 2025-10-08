import Image from "next/image"
import { Clock, User, MapPin, BookOpen, Award, Tag } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Workshop type definition
export interface Workshop {
  id: number
  title: string
  description: string
  trainer: {
    name: string
    bio: string
    image?: string
  }
  date: string
  duration: string
  mode: "Online" | "Offline"
  venue?: string
  price: number | "Free"
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  syllabus: string[]
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
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 workshop-card ${workshop.isFDP ? 'fdp-card' : ''}`}>
      <div className="relative h-48 w-full bg-gray-100">
        {workshop.imageUrl ? (
          <Image
            src={workshop.imageUrl}
            alt={workshop.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
            <BookOpen className="h-16 w-16 text-purple-400/50" />
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white shadow-md rounded-lg overflow-hidden date-badge">
          <div className={`month ${workshop.isFDP ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-green-500'}`}>
            {new Date(workshop.date).toLocaleString('default', { month: 'short' })}
          </div>
          <div className="day">
            {new Date(workshop.date).getDate()}
          </div>
        </div>
        
        {/* Trending/Limited Badge */}
        {(workshop.isTrending || workshop.limitedSeats) && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {workshop.isTrending && (
              <Badge className="trend-badge">
                Trending
              </Badge>
            )}
            {workshop.limitedSeats && (
              <Badge variant="destructive" className="limited-badge">
                Limited Seats
              </Badge>
            )}
          </div>
        )}
        
        {/* FDP Badge */}
        {workshop.isFDP && (
          <div className="absolute bottom-4 right-4">
            <Badge variant="secondary" className="fdp-badge">
              FDP
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={`category-tag ${workshop.difficulty.toLowerCase()}`}
          >
            {workshop.difficulty}
          </Badge>
          <Badge 
            variant="outline" 
            className="category-tag"
          >
            {workshop.category}
          </Badge>
        </div>
        <CardTitle className="text-xl group-hover:text-purple-600 transition-colors duration-200 mt-2 line-clamp-2">
          {workshop.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-0">
        <CardDescription className="line-clamp-2 mb-4">
          {workshop.description}
        </CardDescription>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User size={16} className="text-purple-500" />
            <span>{workshop.trainer.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-purple-500" />
            <span>{workshop.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-purple-500" />
            <span>{workshop.mode} {workshop.venue ? `- ${workshop.venue}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-purple-500" />
            <span className="font-medium">{workshop.price === 'Free' ? 'Free' : `₹${workshop.price}`}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-6 flex gap-2">
        <button
          onClick={() => onViewDetails(workshop)}
          className="flex-1 text-center px-4 py-2 border border-purple-500 text-purple-600 rounded-md hover:bg-purple-50 transition-colors duration-200"
        >
          View Details
        </button>
        <button
          className={`flex-1 text-center px-4 py-2 rounded-md transition-colors duration-200 ${
            workshop.isFDP 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white'
          }`}
        >
          Join {workshop.isFDP ? 'FDP' : 'Workshop'}
        </button>
      </CardFooter>
    </Card>
  )
}
