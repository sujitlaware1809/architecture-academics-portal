"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  Star,
  StarHalf,
  Users,
  Clock,
  Calendar,
  Bookmark,
  Share2,
  FileText,
  Play,
  PlayCircle,
  Check,
  Download,
  MessageSquare,
  Award,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import VideoPlayer from "@/components/video-player"
import CoursePlayer from "@/components/course-player"

// We'll fetch course data from backend; keep minimal local fallback

export default function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;
  
  const [course, setCourse] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = api.isAuthenticated();
      setIsAuthenticated(authenticated);
    };

    checkAuth();

    // Fetch course data based on ID
    const fetchCourseData = async () => {
      try {
        const response = await api.get(`/api/courses/${courseId}`)
        if (response && response.data) {
          // Ensure all expected properties exist with defaults
          const courseData = {
            ...response.data,
            tags: response.data.tags || [response.data.level || 'General'],
            features: response.data.features || [],
            syllabus: response.data.syllabus || [],
            requirements: response.data.requirements || [],
            reviews: response.data.reviews || [],
            lessons: response.data.lessons || [],
            materials: response.data.materials || [],
            students: response.data.students || response.data.enrolled_count || 0,
            rating: response.data.rating || 0,
            duration: response.data.duration || 'N/A',
            totalLessons: response.data.totalLessons || (response.data.lessons?.length || 0),
            lastUpdated: response.data.lastUpdated || response.data.updated_at || 'Recently',
            thumbnail: response.data.thumbnail || response.data.image_url || 'https://placehold.co/800x450/png?text=Course+Image',
            isFree: response.data.isFree !== undefined ? response.data.isFree : (!response.data.price || response.data.price === 0),
            freeLessons: response.data.freeLessons || (response.data.lessons?.filter((l: any) => l.is_free).length || 1),
            reviewCount: response.data.reviewCount || 0
          }
          setCourse(courseData)
        }
      } catch (error) {
        console.error('Error fetching course:', error)
      }
    }

    // Check if user is already enrolled
    const checkEnrollment = async () => {
      if (!api.isAuthenticated()) {
        setIsEnrolled(false);
        return;
      }
      
      try {
        const response = await api.get(`/api/enrollments/course/${courseId}`)
        if (response && response.data) {
          setIsEnrolled(true)
          setEnrollmentId(response.data.id)
        } else {
          setIsEnrolled(false)
        }
      } catch (error: any) {
        // 404 means not enrolled, which is expected
        if (error?.response?.status === 404) {
          setIsEnrolled(false)
        } else {
          console.error('Error checking enrollment:', error)
          setIsEnrolled(false)
        }
      }
    }

    fetchCourseData();
    checkEnrollment();
  }, [courseId]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading course...</div>
      </div>
    );
  }

  const toggleModule = (index: number) => {
    setExpandedModule(expandedModule === index ? null : index);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, you would call an API to save/unsave the course
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      alert('Please login to enroll in this course')
      window.location.href = '/login'
      return
    }

    if (isEnrolled) {
      // Already enrolled, redirect to course player
      window.location.href = `/courses/${courseId}/learn`
      return
    }

    setIsEnrolling(true)
    
    try {
      const response = await api.post('/api/enrollments', { 
        course_id: parseInt(courseId)
      })
      
      if (response && response.data) {
        const newEnrollmentId = response.data.id || response.data.enrollment_id
        setEnrollmentId(newEnrollmentId)
        setIsEnrolled(true)
        
        // Show success message and redirect to course player
        alert('🎉 Successfully enrolled! Redirecting to course player...')
        
        setTimeout(() => {
          window.location.href = `/courses/${courseId}/learn`
        }, 1000)
      }
    } catch (err: any) {
      console.error('Enroll error', err)
      
      // Check if already enrolled error
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('already enrolled')) {
        setIsEnrolled(true)
        alert('You are already enrolled! Redirecting to course player...')
        setTimeout(() => {
          window.location.href = `/courses/${courseId}/learn`
        }, 1000)
      } else {
        alert(err.response?.data?.detail || 'Failed to enroll. Please try again.')
      }
    } finally {
      setIsEnrolling(false)
    }
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen pb-16">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-blue-100 mb-6">
            <Link href="/courses" className="flex items-center hover:text-white transition-colors gap-2 bg-white/10 px-4 py-2 rounded-full">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Course Image */}
            <div className="md:w-1/3 relative">
              <div className="aspect-video relative rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <button className="bg-white bg-opacity-90 rounded-full p-4 transform transition-transform hover:scale-110">
                    <Play className="h-8 w-8 text-blue-600 fill-blue-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="md:w-2/3">
              <div className="flex flex-wrap gap-2 mb-3">
                {course.tags && course.tags.map((tag: string, index: number) => (
                  <Badge key={index} className="bg-white/20 text-white hover:bg-white/30">
                    {tag}
                  </Badge>
                ))}
                {course.isNew && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
                )}
                {course.isTrending && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">Trending</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white mb-3">
                {course.title}
              </h1>

              <div className="flex items-center gap-4 text-blue-100 mb-4">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {renderStars(course.rating)}
                  </div>
                  <span>({course.rating}) • {course.reviewCount} reviews</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="h-4 w-4" />
                  <span>{course.totalLessons} lessons</span>
                </div>
              </div>

              <p className="text-blue-100 mb-6">
                {course.description.substring(0, 200)}...
              </p>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div>
                  <p className="text-white font-medium">AI-Powered Architecture Course</p>
                  <p className="text-blue-200 text-sm">Comprehensive AI-Generated Curriculum</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {course.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>English</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment CTA */}
      <div className="bg-white shadow-md py-4 sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center">
                {course.isFree ? (
                  <span className="text-2xl font-bold text-green-600 mr-3">FREE COURSE</span>
                ) : (
                  <span className="text-2xl font-bold text-blue-600 mr-3">
                    {course.freeLessons || 1} Free Lessons + Premium Access
                  </span>
                )}
              </div>
              {!course.isFree && (
                <p className="text-sm text-orange-600">
                  <span className="font-medium">First {course.freeLessons || 1} lesson{(course.freeLessons || 1) > 1 ? 's' : ''} FREE</span> - No subscription required!
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleEnroll}
                disabled={isEnrolling}
                className={`px-8 py-3 rounded-md font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${
                  isEnrolled 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' 
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-105 text-white'
                } ${isEnrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isEnrolling ? (
                  'Enrolling...'
                ) : isEnrolled ? (
                  <>
                    <PlayCircle className="h-5 w-5" />
                    Go to Course Player
                  </>
                ) : course.isFree ? (
                  'Enroll Free'
                ) : (
                  'Enroll Now'
                )}
              </button>
              <button 
                className={`p-2.5 rounded-md border ${isBookmarked ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} transition-colors`}
                onClick={toggleBookmark}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
              </button>
              <button 
                className="p-2.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link copied to clipboard!')
                }}
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div id="course-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Free Lesson Video Player */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Free Preview Lesson</h2>
                    <p className="text-gray-600">Get a taste of our course content</p>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    FREE
                  </Badge>
                </div>
              </div>
              {/* If user enrolled, show CoursePlayer to save progress. For preview show CoursePlayer with no enrollmentId */}
              <div className="aspect-video">
                <CoursePlayer
                  lessonId={course.lessons?.[0]?.id ?? 0}
                  lessonTitle={course.lessons?.[0]?.title ?? 'Preview'}
                  videoStreamUrl={(course.lessons && course.lessons[0] && course.lessons[0].videoUrl) || '/AWS.mp4'}
                  enrollmentId={enrollmentId ?? undefined}
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Lesson 1: Introduction to Architectural Principles
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  In this free preview lesson, you'll learn the fundamental principles that guide 
                  architectural design. This video demonstrates our professional video player and 
                  the quality of content you can expect from our AI-powered courses.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>15:30</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>1,234 students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8 rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            {course.features && course.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="mt-1 text-green-500">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content/Syllabus */}
            {course.syllabus && course.syllabus.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Course Content</h2>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{course.syllabus.length} modules • {course.syllabus.reduce((total: number, module: any) => total + (module.lessons?.length || 0), 0)} lessons</span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Expand All</button>
                </div>

                <div className="space-y-3">
                  {course.syllabus.map((module: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      onClick={() => toggleModule(index)}
                    >
                      <span className="font-medium text-gray-900">{module.title}</span>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">{(module.lessons && module.lessons.length) || 0} lessons</span>
                        <svg
                          className={`h-5 w-5 transform transition-transform ${expandedModule === index ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {expandedModule === index && (
                      <div className="p-4 border-t border-gray-200">
                        <ul className="space-y-3">
                          {module.lessons && module.lessons.length > 0 && module.lessons.map((lesson: any, lessonIndex: number) => (
                            <li key={lessonIndex} className="flex items-center gap-3 text-gray-700">
                              <Play className="h-4 w-4 text-blue-600" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {typeof lesson === 'string' ? lesson : lesson.title}
                                  </span>
                                  {typeof lesson === 'object' && lesson.isFree && (
                                    <Badge className="bg-green-500 text-white text-xs">FREE</Badge>
                                  )}
                                  {typeof lesson === 'object' && (
                                    <span className="text-sm text-gray-500">({lesson.duration})</span>
                                  )}
                                </div>
                                {typeof lesson === 'object' && lesson.description && (
                                  <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <div className="mt-1 text-blue-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <div className="text-gray-700 space-y-4">
                <p>{course.description}</p>
                <p>
                  This comprehensive course is designed for beginners who want to understand the fundamentals of architectural design. Whether you're planning to pursue architecture as a career or simply interested in understanding the built environment around you, this course will provide the essential knowledge and skills to get started.
                </p>
                <p>
                  Through a combination of theoretical lectures and practical exercises, you'll learn how to analyze, conceptualize, and develop architectural designs. By the end of the course, you'll have a solid foundation in architectural principles and be able to approach design problems with confidence.
                </p>
              </div>
            </div>

            {/* AI Course Info */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg shadow-md p-6 mb-8 text-white">
              <h2 className="text-xl font-bold mb-4">AI-Powered Architecture Course</h2>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">AI</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Comprehensive AI-Generated Curriculum</h3>
                  <p className="text-blue-100 mb-2">Advanced Learning Technology</p>
                  <div className="flex items-center gap-4 text-sm text-blue-100">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>AI-Optimized Content</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-blue-200" />
                      <span>Industry-Standard Material</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-blue-100">
                This course features AI-curated content designed to provide comprehensive architecture education. 
                Our advanced algorithms ensure up-to-date industry practices and progressive learning pathways tailored for optimal knowledge retention.
              </p>
            </div>

            {/* Student Reviews */}
            {course.reviews && course.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Student Reviews</h2>
                  <span className="text-sm text-gray-600">
                    {course.reviews.length} of {course.reviewCount || course.reviews.length} reviews
                  </span>
                </div>

                <div className="space-y-6">
                  {course.reviews.map((review: any) => (
                  <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
                    <div className="flex items-start gap-4">
                      <Image
                        src={review.avatar}
                        alt={review.user}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900">{review.user}</h3>
                          <span className="text-sm text-gray-600">{review.date}</span>
                        </div>
                        <div className="flex mb-3">
                          {Array.from({ length: 5 }).map((_: any, i: number) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                  Load More Reviews
                </button>
              </div>
            </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              {/* Course Info Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">This course includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-700">
                    <Play className="h-5 w-5 text-blue-600" />
                    <span>24 hours on-demand video</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>12 downloadable resources</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Download className="h-5 w-5 text-blue-600" />
                    <span>Downloadable project files</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Lifetime access</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span>Access on mobile and desktop</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span>Certificate of completion</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <button 
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className={`w-full py-3 rounded-md font-semibold shadow-md hover:shadow-lg transition-shadow ${
                      isEnrolled 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    } ${isEnrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isEnrolling ? 'Enrolling...' : isEnrolled ? '✓ Enrolled - Continue' : 'Enroll Now'}
                  </button>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    {isEnrolled ? 'Access your course anytime' : 'Free enrollment for all students'}
                  </p>
                </div>
              </div>

              {/* Related Courses */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">You might also like</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-20 h-14 bg-gray-200 rounded-md flex-shrink-0 relative overflow-hidden">
                      <Image
                        src="https://placehold.co/600x400/png?text=Lesson+Preview"
                        alt="Course thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors">
                        <Link href="/courses/2">Sustainable Architecture: Green Building Design</Link>
                      </h4>
                      <p className="text-sm text-gray-600">Prof. Michael Chen</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {renderStars(4.8)}
                        </div>
                        <span className="text-xs text-gray-600">4.8</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-20 h-14 bg-gray-200 rounded-md flex-shrink-0 relative overflow-hidden">
                      <Image
                        src="https://placehold.co/600x400/png?text=Lesson+Preview"
                        alt="Course thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors">
                        <Link href="/courses/3">Digital Modeling for Architects</Link>
                      </h4>
                      <p className="text-sm text-gray-600">Alexandra Rodriguez</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {renderStars(4.2)}
                        </div>
                        <span className="text-xs text-gray-600">4.2</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-20 h-14 bg-gray-200 rounded-md flex-shrink-0 relative overflow-hidden">
                      <Image
                        src="https://placehold.co/600x400/png?text=Lesson+Preview"
                        alt="Course thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors">
                        <Link href="/courses/5">Architectural History: Ancient to Modern</Link>
                      </h4>
                      <p className="text-sm text-gray-600">Prof. Emily Chang</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {renderStars(4.9)}
                        </div>
                        <span className="text-xs text-gray-600">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
