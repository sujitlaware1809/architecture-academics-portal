import Image from "next/image"
import { Clock, User, MapPin, Tag, Award, BookOpen, X, CheckCircle, ChevronRight, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Workshop } from "./workshop-card"

interface WorkshopDetailModalProps {
  workshop: Workshop
  onClose: () => void
}

export function WorkshopDetailModal({ workshop, onClose }: WorkshopDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 workshop-modal">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Workshop Details</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Workshop Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="relative h-64 md:h-auto md:w-1/2 bg-gray-100 rounded-lg overflow-hidden">
              {workshop.imageUrl ? (
                <Image
                  src={workshop.imageUrl}
                  alt={workshop.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                  <BookOpen className="h-24 w-24 text-blue-400/50" />
                </div>
              )}
              
              {/* FDP Badge */}
              {workshop.isFDP && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="fdp-badge-large">
                    Faculty Development Program
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="md:w-1/2">
              <div className="flex gap-2 mb-3 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={`category-tag-large ${workshop.difficulty?.toLowerCase()}`}
                >
                  {workshop.difficulty}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="category-tag-large"
                >
                  {workshop.category}
                </Badge>
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
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {workshop.title}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {workshop.description}
              </p>
              
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-500" />
                  <span>Conducted by <span className="font-medium">{workshop.trainer?.name}</span></span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>{new Date(workshop.date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>{workshop.duration}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span>{workshop.mode} {workshop.venue ? `- ${workshop.venue}` : ''}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{workshop.price === 0 ? 'Free' : `₹${workshop.price}`}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Syllabus */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Syllabus Outline
              </h3>
              <ul className="space-y-3">
                {workshop.syllabus?.map((item, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Prerequisites */}
            {workshop.prerequisites && workshop.prerequisites.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Prerequisites
                </h3>
                <ul className="space-y-3">
                  {workshop.prerequisites.map((item, index) => (
                    <li key={index} className="flex gap-3 items-start">
                      <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Trainer Bio */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              About the Trainer
            </h3>
            <div className="flex gap-4 items-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {workshop.trainer?.image ? (
                  <Image
                    src={workshop.trainer?.image}
                    alt={workshop.trainer?.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <User className="h-full w-full p-4 text-gray-400" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-800 text-lg">{workshop.trainer?.name}</h4>
              </div>
            </div>
            <p className="text-gray-700">{workshop.trainer?.bio}</p>
          </div>
          
          {/* CTA */}
          <div className={`p-6 rounded-lg ${
            workshop.isFDP 
              ? 'bg-gradient-to-r from-indigo-50 to-blue-50' 
              : 'bg-gradient-to-r from-blue-50 to-green-50'
          }`}>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Enhance Your Skills?</h3>
            <p className="text-gray-600 mb-4">
              Secure your spot in this {workshop.isFDP ? 'faculty development program' : 'workshop'} and take your knowledge to the next level.
            </p>
            <button
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-md transition-colors duration-200 text-white ${
                workshop.isFDP 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
              }`}
            >
              Enroll Now
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

