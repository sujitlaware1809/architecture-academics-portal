"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { auth, type User } from "@/lib/auth"
import { 
  ArrowLeft, Play, Clock, Users, Star, Award, CheckCircle, 
  Download, BookOpen, Video, FileText, Target, Calendar,
  User as UserIcon, Globe, Shield, Smartphone, Monitor
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

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
      image: "/api/placeholder/80/80"
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
    thumbnail: "/api/placeholder/600/400",
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
        throw new Error(result.message || 'Failed to access course')
      }
    } catch (error) {
      console.error('Course access error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`❌ Failed to access course: ${errorMessage}`)
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-blue-100 text-blue-800">{course.category}</Badge>
                <Badge variant="outline">{course.difficulty}</Badge>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 mb-6">
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
                  <span>{course.lessonsCount} lessons</span>
                </div>
                {course.certificateIncluded && (
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="text-green-600">Certificate included</span>
                  </div>
                )}
              </div>

              {/* Course Video/Image */}
              <div className="relative rounded-lg overflow-hidden mb-8">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Play className="h-6 w-6 mr-2" />
                    Watch Preview
                  </Button>
                </div>
              </div>
            </div>

            {/* Course Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-8">
                  {/* What you'll learn */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-6 w-6 text-blue-600" />
                        What you'll learn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        {course.outcomes.map((outcome, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills you'll gain */}
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

                  {/* Requirements */}
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
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <p className="text-gray-600">{course.lessonsCount} lessons • {course.duration}</p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {course.syllabus.map((module, moduleIndex) => (
                        <AccordionItem key={moduleIndex} value={`module-${moduleIndex}`}>
                          <AccordionTrigger className="text-left">
                            <div>
                              <h3 className="font-semibold">{module.module}</h3>
                              <p className="text-sm text-gray-500">{module.lessons.length} lessons • {module.duration}</p>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pl-4">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                  <div className="flex items-center gap-3">
                                    {lesson.type === 'video' && <Video className="h-4 w-4 text-blue-600" />}
                                    {lesson.type === 'quiz' && <FileText className="h-4 w-4 text-green-600" />}
                                    {lesson.type === 'assignment' && <BookOpen className="h-4 w-4 text-orange-600" />}
                                    <span className="text-gray-900">{lesson.title}</span>
                                    {lesson.preview && (
                                      <Badge variant="outline" className="text-xs">Preview</Badge>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-500">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About the Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4 mb-6">
                      <img 
                        src={course.instructor.image} 
                        alt={course.instructor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{course.instructor.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.instructor.rating} instructor rating</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.instructor.studentsCount.toLocaleString()} students</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{course.instructor.bio}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {course.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{review.userName}</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-blue-600">₹{course.price}</span>
                    {course.originalPrice && (
                      <span className="text-xl text-gray-500 line-through">₹{course.originalPrice}</span>
                    )}
                  </div>
                  {course.originalPrice && (
                    <Badge className="bg-green-100 text-green-800">
                      {getDiscountPercentage()}% OFF
                    </Badge>
                  )}
                </div>

                <Button 
                  onClick={handleEnrollCourse}
                  className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
                >
                  {course.moodleUrl ? (
                    <>
                      <Globe className="h-5 w-5 mr-2" />
                      Access on Moodle
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-5 w-5 mr-2" />
                      Enroll Now
                    </>
                  )}
                </Button>

                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-900">This course includes:</h3>
                  {course.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Moodle Integration Highlights */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Moodle LMS Features
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-blue-600" />
                      <span>Desktop & Mobile Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      <span>Offline Content Download</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Assignment Scheduling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span>Progress Analytics</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}