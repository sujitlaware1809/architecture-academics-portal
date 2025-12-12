"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  Book,
  Clock,
  PlayCircle,
  CheckCircle,
  TrendingUp,
  Award,
  Calendar,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EnrolledCourse {
  id: number
  course_id: number
  enrolled_at: string
  progress: number
  last_accessed: string | null
  completed: boolean
  course: {
    id: number
    title: string
    description: string
    image_url: string
    level: string
    duration: string
    lessons?: any[]
    instructor_name?: string
  }
}

export default function MyCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all')

  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true)
      
      // Check if user is authenticated
      if (!api.isAuthenticated()) {
        console.log('User not authenticated, redirecting to login')
        window.location.href = '/login'
        return
      }
      
      const response = await api.get('/api/enrollments/my-courses')
      if (response && response.data) {
        console.log('Enrolled courses:', response.data)
        setEnrolledCourses(response.data)
      } else {
        console.log('No enrolled courses found')
        setEnrolledCourses([])
      }
    } catch (error: any) {
      console.error('Error fetching enrolled courses:', error)
      
      // If authentication error, redirect to login
      if (error?.response?.status === 401) {
        alert('Session expired. Please login again.')
        window.location.href = '/login'
      } else if (error?.message?.includes('fetch')) {
        console.error('Backend server might not be running.')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = enrolledCourses.filter(enrollment => {
    if (filter === 'completed') return enrollment.completed
    if (filter === 'in-progress') return !enrollment.completed && enrollment.progress > 0
    return true
  })

  const stats = {
    total: enrolledCourses.length,
    inProgress: enrolledCourses.filter(e => !e.completed && e.progress > 0).length,
    completed: enrolledCourses.filter(e => e.completed).length,
    notStarted: enrolledCourses.filter(e => e.progress === 0).length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/profile" 
            className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Courses</h1>
              <p className="text-blue-100">Continue your learning journey</p>
            </div>
            <Book className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Book className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Not Started</p>
                <p className="text-3xl font-bold text-gray-600">{stats.notStarted}</p>
              </div>
              <PlayCircle className="h-10 w-10 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Courses ({stats.total})
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'in-progress'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              In Progress ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completed ({stats.completed})
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading your courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'all' 
                ? 'No Courses Yet' 
                : filter === 'completed' 
                ? 'No Completed Courses' 
                : 'No Courses In Progress'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Start your learning journey by enrolling in a course'
                : filter === 'completed'
                ? 'Complete a course to see it here'
                : 'Continue learning to see your progress here'}
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md font-semibold hover:shadow-lg transition-shadow"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredCourses.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={enrollment.course.image_url || 'https://placehold.co/800x450/png?text=Course+Image'}
                    alt={enrollment.course.title}
                    fill
                    className="object-cover"
                  />
                  {enrollment.completed && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  )}
                  {enrollment.progress > 0 && !enrollment.completed && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-orange-500 text-white">
                        {enrollment.progress}% Complete
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{enrollment.course.level || 'All Levels'}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {enrollment.course.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {enrollment.course.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          enrollment.completed
                            ? 'bg-green-600'
                            : enrollment.progress > 0
                            ? 'bg-orange-600'
                            : 'bg-gray-400'
                        }`}
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{enrollment.course.duration || 'Self-paced'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    href={`/courses/${enrollment.course_id}`}
                    className="block w-full py-2 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md font-semibold hover:shadow-lg transition-shadow"
                  >
                    {enrollment.progress === 0 ? 'Start Course' : 'Continue Learning'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
