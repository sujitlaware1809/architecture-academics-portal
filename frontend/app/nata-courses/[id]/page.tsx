"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { auth, type User } from "@/lib/auth"
import { ArrowLeft, Play, Clock, Users, Star, Award, CheckCircle, Download, BookOpen, Video, FileText, Target, Calendar, User as UserIcon, Globe, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CourseDetails {
  id: number
  title: string
  description: string
  instructor: {
    name: string
    bio: string
    rating: number
    studentsCount: number
    image: string
  }
  duration: string
  difficulty: string
  price: number
  originalPrice?: number
  rating: number
  studentsEnrolled: number
  lessonsCount: number
  certificateIncluded: boolean
  moodleUrl?: string
  thumbnail: string
  category: string
  skills: string[]
  syllabus: {
    module: string
    topics: string[]
    duration: string
    lessons: {
      title: string
      type: 'video' | 'quiz' | 'assignment' | 'reading'
      duration: string
      preview?: boolean
    }[]
  }[]
  features: string[]
  requirements: string[]
  outcomes: string[]
  reviews: {
    id: number
    userName: string
    rating: number
    comment: string
    date: string
  }[]
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showPurchasePrompt, setShowPurchasePrompt] = useState(false)
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [showPlayer, setShowPlayer] = useState(false)

  // Sample course detail data
  const sampleCourse: CourseDetails = {
    id: 1,
    title: "NATA Drawing Fundamentals",
    description: "Master the art of architectural drawing with comprehensive techniques for NATA preparation. This course covers everything from basic sketching to advanced perspective drawing, ensuring you're fully prepared for the drawing section of NATA.",
    instructor: {
      name: "Prof. Arjun Mehta",
      bio: "Renowned architect and educator with 15+ years of experience in NATA preparation. Former HOD at SPA Delhi.",
      rating: 4.9,
      studentsCount: 5000,
      image: "https://placehold.co/80x80/png?text=Instructor"
    },
    duration: "8 weeks",
    difficulty: "Beginner",
    price: 4999,
    originalPrice: 7999,
    rating: 4.8,
    studentsEnrolled: 1250,
    lessonsCount: 45,
    certificateIncluded: true,
    moodleUrl: "https://moodle.architectureacademics.com/course/nata-drawing",
    thumbnail: "https://placehold.co/600x400/png?text=Drawing+Course",
    category: "Drawing",
    skills: ["Perspective Drawing", "Sketching", "Geometric Construction", "Shading", "Composition"],
    syllabus: [
      {
        module: "Basic Drawing Techniques",
        topics: ["Line Drawing", "Basic Shapes", "Proportions", "Hand-eye Coordination"],
        duration: "2 weeks",
        lessons: [
          { title: "Introduction to Drawing", type: "video", duration: "15 min", preview: true },
          { title: "Basic Line Techniques", type: "video", duration: "20 min", preview: true },
          { title: "Understanding Proportions", type: "video", duration: "25 min" },
          { title: "Practice Exercise 1", type: "assignment", duration: "30 min" },
          { title: "Week 1 Assessment", type: "quiz", duration: "15 min" }
        ]
      },
      {
        module: "Perspective Drawing",
        topics: ["One-point Perspective", "Two-point Perspective", "Three-point Perspective"],
        duration: "2 weeks",
        lessons: [
          { title: "Understanding Perspective", type: "video", duration: "30 min" },
          { title: "One-point Perspective Demo", type: "video", duration: "35 min" },
          { title: "Two-point Perspective Tutorial", type: "video", duration: "40 min" },
          { title: "Perspective Practice Set", type: "assignment", duration: "45 min" },
          { title: "Perspective Quiz", type: "quiz", duration: "20 min" }
        ]
      },
      {
        module: "Architectural Elements",
        topics: ["Building Components", "Structural Elements", "Landscape Elements"],
        duration: "2 weeks",
        lessons: [
          { title: "Drawing Buildings", type: "video", duration: "35 min" },
          { title: "Structural Details", type: "video", duration: "30 min" },
          { title: "Landscape Elements", type: "video", duration: "25 min" },
          { title: "Architectural Portfolio", type: "assignment", duration: "60 min" }
        ]
      },
      {
        module: "Advanced Techniques",
        topics: ["Shading & Rendering", "Texture Studies", "Composition", "Speed Drawing"],
        duration: "2 weeks",
        lessons: [
          { title: "Shading Techniques", type: "video", duration: "40 min" },
          { title: "Texture and Materials", type: "video", duration: "35 min" },
          { title: "Composition Principles", type: "video", duration: "30 min" },
          { title: "Speed Drawing Workshop", type: "video", duration: "45 min" },
          { title: "Final Project", type: "assignment", duration: "90 min" }
        ]
      }
    ],
    features: [
      "Live interactive sessions twice a week",
      "Personal feedback on all drawing submissions",
      "Downloadable practice worksheets",
      "Access to drawing reference library",
      "Mock test papers with solutions",
      "Moodle LMS with mobile app access",
      "Discussion forums with peers",
      "One-on-one doubt clearing sessions"
    ],
    requirements: [
      "Basic drawing materials (pencils, paper, ruler)",
      "Scanner or smartphone for submission",
      "Stable internet connection",
      "Dedication of 2-3 hours daily for practice"
    ],
    outcomes: [
      "Master all NATA drawing techniques",
      "Develop speed and accuracy in sketching",
      "Create impressive architectural drawings",
      "Build confidence for NATA exam",
      "Receive industry-recognized certificate"
    ],
    reviews: [
      {
        id: 1,
        userName: "Priya Sharma",
        rating: 5,
        comment: "Excellent course! Prof. Mehta's teaching style is amazing. I improved my drawing skills drastically.",
        date: "2024-10-15"
      },
      {
        id: 2,
        userName: "Rahul Kumar",
        rating: 5,
        comment: "The Moodle platform makes learning so convenient. Great interactive content and assignments.",
        date: "2024-10-10"
      },
      {
        id: 3,
        userName: "Ananya Gupta",
        rating: 4,
        comment: "Very comprehensive course. The feedback on drawings is really helpful for improvement.",
        date: "2024-10-05"
      }
    ]
  }

  useEffect(() => {
    const fetchCourseData = async () => {
      // Simulate API call with course ID
      setCourse(sampleCourse)
      
      // Fetch current user
      if (auth.isAuthenticated()) {
        const user = await auth.getCurrentUser()
        setCurrentUser(user)
      }
      
      setLoading(false)
    }

    fetchCourseData()
  }, [params.id])

  const handleEnrollCourse = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(`/nata-courses/${params.id}`)}`)
      return
    }

    try {
      setLoading(true)
      
      // Call the backend enrollment API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nata-courses/${params.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...auth.getAuthHeaders()
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Show success notification
        alert(`🎉 Successfully enrolled in ${course?.title}!`)
        
        // Redirect to Moodle LMS for course access
        if (result.data?.sso_url) {
          window.open(result.data.sso_url, '_blank')
        } else if (result.moodle_direct_url) {
          window.open(result.moodle_direct_url, '_blank')
        } else {
          // Fallback: redirect to course dashboard
          router.push('/profile/courses')
        }
      } else {
        throw new Error(result.message || 'Enrollment failed')
      }
    } catch (error) {
      console.error('Enrollment error:', error)
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error occurred'
      alert(`❌ Enrollment failed: ${errorMessage}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleAccessCourse = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(`/nata-courses/${params.id}`)}`)
      return
    }

    try {
      setLoading(true)
      
      // Get course access URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nata-courses/${params.id}/access`, {
        method: 'GET',
        headers: {
          ...auth.getAuthHeaders()
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Redirect to Moodle LMS
        if (result.sso_url) {
          window.open(result.sso_url, '_blank')
        } else if (result.course_url) {
          window.open(result.course_url, '_blank')
        }
      } else {
        // If backend says access is not allowed (need to purchase), show friendly prompt.
        // Fall back to showing a purchase/appointment prompt rather than a raw error.
        setShowPurchasePrompt(true)
        console.warn('Access denied or purchase required:', result.message || result)
        return
      }
    } catch (error) {
      console.error('Course access error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      // Show generic failure and a purchase prompt
      setShowPurchasePrompt(true)
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    // Try to go back in history. If that doesn't change the route, fall back to listing.
    try {
      router.back()
      // ensure fallback in case router.back doesn't navigate (e.g., opened directly)
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith(`/nata-courses/`)) {
          router.push('/nata-courses')
        }
      }, 250)
    } catch (e) {
      router.push('/nata-courses')
    }
  }

  const getDiscountPercentage = () => {
    if (course?.originalPrice && course?.price) {
      return Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    }
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-64">
          <img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full" />
          <button
              onClick={closeModal}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating}</span>
              <span className="text-sm text-white/80">({course.studentsEnrolled} students)</span>
            </div>
            <h2 className="text-2xl font-bold">{course.title}</h2>
          </div>
        </div>

  <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* Course Header and rest of content (kept compact) */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-blue-100 text-blue-800">{course.category}</Badge>
              <Badge variant="outline">{course.difficulty}</Badge>
            </div>
            
            <h1 className="text-2xl lg:text-2xl font-bold text-gray-900 mb-2 leading-tight">{course.title}</h1>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{course.rating}</span>
                <span className="text-gray-500">({course.studentsEnrolled} students)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-400" />
                <span>{course.lessonsCount} sections</span>
              </div>
              {course.certificateIncluded && (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="text-green-600">Certificate included</span>
                </div>
              )}
            </div>

            {/* Compact CTA (moved from sidebar): Access / Enroll button */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Button onClick={handleAccessCourse} className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md">
                {course.moodleUrl ? (
                  <><Globe className="h-5 w-5 mr-2" />Access on Moodle</>
                ) : (
                  <><BookOpen className="h-5 w-5 mr-2" />Enroll Now</>
                )}
              </Button>

              {course.originalPrice && (
                <Badge className="bg-green-100 text-green-800">{getDiscountPercentage()}% OFF</Badge>
              )}
            </div>
          </div>

          {/* Overview, Sections, Reviews follow (kept as-is) */}
          <div className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  What you'll learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  {course.outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{outcome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills you'll gain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle>Sections</CardTitle>
                    <p className="text-gray-600 text-sm">{course.lessonsCount} sections • {course.duration}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {course.syllabus.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="min-w-[220px] bg-white border border-gray-100 rounded-md p-3 shadow-sm">
                      <h4 className="font-semibold text-sm">Section {moduleIndex + 1}</h4>
                      <p className="text-sm text-gray-600">{module.module}</p>
                      <p className="text-xs text-gray-500 mt-2">{module.lessons.length} lessons • {module.duration}</p>
                      <div className="mt-3 text-xs text-gray-700 space-y-1 max-h-20 overflow-hidden">
                        {module.lessons.slice(0,4).map((lesson, li) => (
                          <div key={li} className="flex items-center gap-2">
                            {lesson.type === 'video' && <Video className="h-3 w-3 text-blue-600" />}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle>Student Reviews</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => alert('Open reviews modal (not implemented)')}>View all</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  {course.reviews.slice(0,2).map((review) => (
                    <div key={review.id} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-sm">{review.userName}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-700 text-sm mt-1 line-clamp-3">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>

      {/* Purchase / Access Prompt Dialog */}
      <Dialog open={showPurchasePrompt} onOpenChange={setShowPurchasePrompt}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Access required</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-gray-700">It looks like you don't have access to this course yet. To access full videos and materials you need to purchase the NATA course or schedule an appointment.</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => { setShowPurchasePrompt(false); router.push(`/nata-courses/${params.id}/buy`) }} className="bg-purple-600 text-white">Buy NATA course</Button>
              <Button variant="outline" onClick={() => { setShowPurchasePrompt(false); router.push('/contact-us') }}>Contact / Appointment</Button>
              <Button variant="ghost" onClick={() => setShowPurchasePrompt(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}