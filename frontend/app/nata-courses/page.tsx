"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { auth, type User } from "@/lib/auth"
import { LoginRequiredButton } from "@/components/login-required"
import { 
  BookOpen, Clock, Users, Star, Play, FileText, Award, 
  CheckCircle, Calendar, Target, TrendingUp, Download,
  Video, PenTool, Ruler, Palette, Building2, Lightbulb,
  Search, FolderOpen, ChevronDown, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import "./courses.css"

interface NATACourse {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  originalPrice: number
  rating: number
  studentsEnrolled: number
  lessonsCount: number
  certificateIncluded: boolean
  moodleUrl?: string
  thumbnail: string
  category: 'Drawing' | 'Mathematics' | 'General Aptitude' | 'Full Course'
  skills: string[]
  features: string[]
  syllabus?: {
    module: string
    topics: string[]
    duration: string
    lessons?: {
      title: string
      type: 'video' | 'assignment' | 'quiz'
      duration: string
      preview?: boolean
    }[]
  }[]
}

export default function NATACoursesPage() {
  const [courses, setCourses] = useState<NATACourse[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Sample NATA courses data
  const sampleCourses: NATACourse[] = [
    // ... your existing course data ...
  ]

  const categories = ['All', ...Array.from(new Set(courses.map(course => course.category))).sort()]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch NATA courses and user data in parallel
        const [coursesResponse, user] = await Promise.all([
          api.get('/api/nata-courses'),
          auth.isAuthenticated() ? auth.getCurrentUser() : null
        ]);

        // Handle courses response
        if (coursesResponse && coursesResponse.data) {
          const coursesData = coursesResponse.data;
          
          // Check if it's the wrapped format { data: [...] }
          if (coursesData.data && Array.isArray(coursesData.data)) {
            setCourses(coursesData.data);
          }
          // Or if it's direct array format
          else if (Array.isArray(coursesData)) {
            setCourses(coursesData);
          }
          // Or if it has success flag format { success: true, data: [...] }
          else if (coursesData.success && Array.isArray(coursesData.data)) {
            setCourses(coursesData.data);
          }
          else {
            console.error('Unexpected courses response format:', coursesData);
            setCourses([]);
          }
        } else {
          console.error('Invalid courses response:', coursesResponse);
          setCourses([]);
        }

        // Set user if authenticated
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData()
  }, [])

  const filteredCourses = courses
    .filter(course => {
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
      const matchesSearch = searchQuery === '' || [
        course.title,
        course.description,
        course.instructor,
        ...course.skills,
        ...(course.syllabus?.map(s => s.module) || [])
      ].some(text => 
        text.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return matchesCategory && matchesSearch
    })

  const handleEnrollCourse = async (course: NATACourse) => {
    if (!currentUser) {
      window.location.href = `/login?redirect=${encodeURIComponent('/nata-courses')}`
      return
    }

    try {
      // Call backend enrollment endpoint
      const response = await api.post(`/nata-courses/${course.id}/enroll`, {})

      if (response.success) {
        // Get access URL from response
        const accessUrl = response.data.sso_url || response.data.course_url

        if (accessUrl) {
          // Open course in new tab using SSO link
          window.open(accessUrl, '_blank')
        } else {
          throw new Error('No course access URL provided')
        }
      } else {
        throw new Error(response.message || 'Enrollment failed')
      }
    } catch (error: any) {
      console.error('Enrollment error:', error)
      alert(error.message || 'Failed to enroll in course. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading NATA courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 font-serif">
              Master NATA with Expert-Led Lessons
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
              Comprehensive NATA preparation covering drawing, mathematics, general aptitude, and complete exam strategies from industry experts
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="#course-catalog"
                className="inline-flex items-center px-6 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 duration-300"
              >
                Browse Lessons
              </a>
              <Link
                href="/profile/my-courses"
                className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 duration-300"
              >
                <Users className="h-4 w-4 mr-2" />
                My Lessons
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-pattern-dots"></div>
          <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-pattern-dots"></div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white shadow-md rounded-lg -mt-10 max-w-6xl mx-auto z-20 relative p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {/* Search bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search courses, topics, or instructors..."
              className="pl-10 h-12 text-base border-gray-300 focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Filter */}
            <div className="relative">
              <button className={`flex items-center px-4 py-2 rounded-full text-sm ${selectedCategory === "" ? 'bg-gray-100 text-black' : 'bg-blue-100 text-blue-800'} hover:bg-blue-100 hover:text-blue-800 transition-colors`}>
                <span className="mr-1">Category:</span>
                <span className="font-medium">{selectedCategory || 'All'}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>

            {/* Reset Filters */}
            {(selectedCategory || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("")
                  setSearchQuery("")
                }}
                className="flex items-center px-4 py-2 rounded-full text-sm bg-gray-200 text-black hover:bg-gray-300 transition-colors"
              >
                <X className="mr-1 h-4 w-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Course Catalog Section */}
      <section id="course-catalog" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 font-serif text-center">
          NATA Sections
        </h2>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-black mb-4">No courses match your search criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory("")
                setSearchQuery("")
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <article key={course.id} className="group cursor-pointer h-full">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-cyan-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
                    
                    {/* Status Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-white/95 text-gray-900 font-semibold backdrop-blur-sm">
                        {course.category}
                      </Badge>
                      <Badge variant="secondary" className="bg-black/30 text-white backdrop-blur-sm">
                        {course.difficulty}
                      </Badge>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(course.rating) ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-gray-700 ml-1">{course.rating}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-sm text-black mb-4 leading-relaxed line-clamp-2 flex-1">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{(course.studentsEnrolled || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{course.duration || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{course.lessonsCount || 0} sections</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">
                          {skill}
                        </Badge>
                      ))}
                      {course.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">
                          +{course.skills.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <Link
                        href={`/nata-courses/${course.id}`}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start Learning
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}