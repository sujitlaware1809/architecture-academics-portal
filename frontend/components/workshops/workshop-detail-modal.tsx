import Image from "next/image"
import { Clock, User, MapPin, Tag, Award, BookOpen, X, CheckCircle, ChevronRight, Calendar, Target, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Workshop } from "./workshop-card"

interface WorkshopDetailModalProps {
  workshop: Workshop
  onClose: () => void
}

export function WorkshopDetailModal({ workshop, onClose }: WorkshopDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{workshop.title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Image and Quick Info */}
              <div className="lg:w-1/3">
                {workshop.imageUrl ? (
                  <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-sm">
                    <Image 
                      src={workshop.imageUrl} 
                      alt={workshop.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-64 w-full rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-sm">
                    <BookOpen className="h-24 w-24 text-blue-400/50" />
                  </div>
                )}
                
                <div className="mt-6 space-y-3">
                  {workshop.isFDP && (
                    <span className="inline-block px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                      FDP
                    </span>
                  )}
                  {workshop.difficulty && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="h-4 w-4" />
                      <span className="text-sm capitalize font-medium">
                        {workshop.difficulty}
                      </span>
                    </div>
                  )}
                  {workshop.category && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm font-medium">{workshop.category}</span>
                    </div>
                  )}
                  {workshop.isTrending && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </span>
                  )}
                  {workshop.limitedSeats && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                      Limited Seats
                    </span>
                  )}
                </div>

                {/* Quick Details Card */}
                <div className="mt-6 bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{new Date(workshop.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{workshop.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{workshop.mode} {workshop.venue ? `- ${workshop.venue}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Tag className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-800">
                      {workshop.price === 0 ? 'Free' : `₹${workshop.price}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="lg:w-2/3">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">About this Workshop</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {workshop.description}
                  </p>

                  {/* Trainer Info */}
                  {workshop.trainer && (
                    <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Instructor</h4>
                      <div className="flex gap-4 items-center">
                        <div className="h-14 w-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          {workshop.trainer?.image ? (
                            <Image
                              src={workshop.trainer.image}
                              alt={workshop.trainer.name}
                              width={56}
                              height={56}
                              className="object-cover"
                            />
                          ) : (
                            <User className="h-full w-full p-3 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800">{workshop.trainer.name}</h5>
                          {workshop.trainer.bio && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{workshop.trainer.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Syllabus */}
                  {workshop.syllabus && workshop.syllabus.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Syllabus Outline
                      </h4>
                      <ul className="space-y-2">
                        {workshop.syllabus.map((item, index) => (
                          <li key={index} className="flex gap-3 items-start">
                            <ChevronRight className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prerequisites */}
                  {workshop.prerequisites && workshop.prerequisites.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Prerequisites
                      </h4>
                      <ul className="space-y-2">
                        {workshop.prerequisites.map((item, index) => (
                          <li key={index} className="flex gap-3 items-start">
                            <ChevronRight className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      Ready to Enhance Your Skills?
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Secure your spot in this {workshop.isFDP ? 'faculty development program' : 'workshop'} and take your knowledge to the next level.
                    </p>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                      Enroll Now
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

