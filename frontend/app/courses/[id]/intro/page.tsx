"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Play,
  Users,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import CoursePlayer from "@/components/course-player"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

type Lesson = {
  id: number
  title: string
  description?: string | null
  video_duration?: number | null
  order_index: number
  is_free: boolean
  video_url?: string | null
}

type CourseDetail = {
  id: number
  title: string
  description: string
  short_description?: string | null
  level: string
  duration: string
  price?: number
  image_url?: string | null
  lessons: Lesson[]
  enrolled_count?: number
  rating?: number
}

export default function CourseIntroPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [introLesson, setIntroLesson] = useState<Lesson | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = api.isAuthenticated()
      setIsAuthenticated(authenticated)
      if (authenticated) {
        const userData = api.getStoredUser()
        setUser(userData)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true)
      try {
        // Fetch course details
        const response = await api.get(`/api/courses/${id}`)
        if (response && response.data) {
          const courseData = response.data
          setCourse(courseData)

          // Find the first lesson (introduction video)
          if (courseData.lessons && courseData.lessons.length > 0) {
            const sortedLessons = [...courseData.lessons].sort((a, b) => a.order_index - b.order_index)
            const firstLesson = sortedLessons[0]
            setIntroLesson(firstLesson)

            // Get video URL for intro lesson
            if (firstLesson.video_url) {
              const videoUrlResponse = await api.get(`/api/courses/lessons/${firstLesson.id}/video-url`)
              if (videoUrlResponse && videoUrlResponse.data) {
                setVideoUrl(videoUrlResponse.data.url || videoUrlResponse.data.video_url || firstLesson.video_url)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const checkEnrollment = async () => {
      if (!api.isAuthenticated()) {
        setIsEnrolled(false)
        return
      }

      try {
        const response = await api.get(`/api/enrollments/course/${id}`)
        if (response && response.data) {
          setIsEnrolled(true)
          setEnrollmentId(response.data.id)
        }
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          console.error('Error checking enrollment:', error)
        }
        setIsEnrolled(false)
      }
    }

    fetchCourseData()
    checkEnrollment()
  }, [id])

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${id}/intro`)
      return
    }

    try {
      const response = await api.post(`/api/enrollments`, { course_id: parseInt(id) })
      if (response && response.data) {
        setIsEnrolled(true)
        setEnrollmentId(response.data.id)
        alert('✅ Successfully enrolled! You can now access all course content.')
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        alert('You are already enrolled in this course!')
        setIsEnrolled(true)
      } else {
        alert('Failed to enroll. Please try again.')
        console.error('Enrollment error:', error)
      }
    }
  }

  const handleNext = () => {
    if (!isEnrolled) {
      // Show payment/registration modal
      return
    }
    router.push(`/courses/${id}/learn`)
  }

  const buildAbsoluteUrl = (url?: string | null) => {
    if (!url) return ""
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`
    return url
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course introduction...</p>
        </div>
      </div>
    )
  }

  if (!course || !introLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/courses" className="text-blue-600 hover:underline">
            ← Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/courses"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Courses</span>
            </Link>
            <div className="flex items-center gap-4">
              {isEnrolled && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Enrolled
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Info Banner */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={buildAbsoluteUrl(course.image_url) || 'https://placehold.co/400x300/png?text=Course'}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.short_description || course.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.enrolled_count || 0} students
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.lessons.length} lessons
                </span>
                <Badge variant="outline">{course.level}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction Video Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 p-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Play className="h-6 w-6" />
                  Introduction Video
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  {introLesson.title} • Free Preview
                </p>
              </div>

              <div className="p-6">
                {/* Video Player */}
                {videoUrl ? (
                  <div className="mb-6">
                    <CoursePlayer
                      lessonId={introLesson.id}
                      lessonTitle={introLesson.title}
                      videoStreamUrl={buildAbsoluteUrl(videoUrl)}
                      enrollmentId={enrollmentId ?? undefined}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                    <div className="text-center">
                      <Play className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Video not available</p>
                    </div>
                  </div>
                )}

                {/* Lesson Description */}
                {introLesson.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">About this lesson</h3>
                    <p className="text-gray-700">{introLesson.description}</p>
                  </div>
                )}

                {/* Next Button */}
                <div className="border-t pt-6">
                  {isEnrolled ? (
                    <Button
                      onClick={handleNext}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg font-bold rounded-xl shadow-lg"
                    >
                      Continue to Next Lesson
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900 mb-1">
                            Premium Content Locked
                          </h4>
                          <p className="text-amber-800 text-sm">
                            To access all {course.lessons.length} lessons and continue your learning journey, 
                            please enroll in this course.
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleEnroll}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg font-bold rounded-xl shadow-lg"
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        Enroll Now {course.price ? `- ₹${course.price}` : '- Free'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Course Overview</h3>
              
              {/* What You'll Get */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    {course.lessons.length} comprehensive video lessons
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Downloadable resources and materials
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Certificate of completion
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Lifetime access to course content
                  </span>
                </div>
              </div>

              {/* Course Stats */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Lessons</span>
                  <span className="font-semibold text-gray-900">{course.lessons.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Duration</span>
                  <span className="font-semibold text-gray-900">{course.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Level</span>
                  <span className="font-semibold text-gray-900">{course.level}</span>
                </div>
                {course.rating && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Rating</span>
                    <span className="font-semibold text-gray-900">{course.rating.toFixed(1)} ⭐</span>
                  </div>
                )}
              </div>

              {/* View Full Course */}
              <div className="border-t mt-6 pt-6">
                <Link
                  href={`/courses/${id}`}
                  className="block w-full text-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  View Full Course Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
