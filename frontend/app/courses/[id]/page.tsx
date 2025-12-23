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
  CheckCircle2,
  Download,
  MessageSquare,
  Award,
  Lock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import VideoPlayer from "@/components/video-player"
import CoursePlayer from "@/components/course-player"
import EnhancedVideoPlayer from "@/components/enhanced-video-player"

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [comments, setComments] = useState<Array<{id: number, user: string, text: string, rating: number, date: string}>>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);

  const suggestionQuestions = [
    "How can I improve my architectural design skills?",
    "What are the best resources for learning sustainable architecture?",
    "How do I prepare for architecture entrance exams like NATA?"
  ];

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
            syllabus: response.data.syllabus ? (typeof response.data.syllabus === 'string' ? [response.data.syllabus] : response.data.syllabus) : [],
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

  const relatedCourses = [
    { id: 2, title: "Advanced Sustainable Architecture", rating: 4.8, students: 1234, thumbnail: "https://images.unsplash.com/photo-1518005068251-37900150dfca" },
    { id: 3, title: "Digital Tools for Architects", rating: 4.6, students: 2103, thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713" },
    { id: 4, title: "Architectural History", rating: 4.9, students: 987, thumbnail: "https://images.unsplash.com/photo-1487958449943-2429e8be8625" }
  ];

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || currentMessage;
    if (!textToSend.trim()) return;
    setChatMessages([...chatMessages, { text: textToSend, isUser: true }]);
    setCurrentMessage('');
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        text: "Thanks for your question! I'm here to help you with course information, learning guidance, and answer any doubts you have. How can I assist you today?",
        isUser: false
      }]);
    }, 1000);
  };

  const handleSuggestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    if (!api.isAuthenticated()) {
      alert('Please login to post a review')
      window.location.href = '/login'
      return
    }

    // Submit review to backend
    (async () => {
      try {
        const payload = { rating: newRating, review_text: newComment }
        const res = await api.post(`/api/courses/${courseId}/reviews`, payload)
        if (res && res.data) {
          // Prepend to local comments list for immediate UI feedback
          const created = res.data
          const comment = {
            id: created.id || Date.now(),
            user: localStorage.getItem('userName') || 'You',
            text: created.review_text || newComment,
            rating: created.rating || newRating,
            date: new Date(created.created_at || Date.now()).toLocaleDateString()
          }
          setComments([comment, ...comments])
          setNewComment('')
          setNewRating(5)

          // Refresh course data to update aggregate rating/counts
          try {
            const cRes = await api.get(`/api/courses/${courseId}`)
            if (cRes && cRes.data) {
              setCourse(prev => ({ ...prev, rating: cRes.data.rating || prev.rating, reviewCount: cRes.data.reviewCount || prev.reviewCount }))
            }
          } catch (err) {
            // ignore
          }
        }
      } catch (err: any) {
        console.error('Error submitting review', err)
        alert(err?.response?.data?.detail || 'Failed to submit review')
      }
    })()
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
    <div className="bg-gray-50 min-h-screen">
      {/* Simple Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link href="/courses" className="flex items-center hover:text-teal-600 transition-colors gap-2 text-gray-700">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Courses</span>
            </Link>
            <div className="flex gap-3">
              <button 
                className={`p-2 rounded-md border ${isBookmarked ? 'bg-teal-50 border-teal-200 text-teal-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} transition-colors`}
                onClick={toggleBookmark}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-teal-600' : ''}`} />
              </button>
              <button 
                className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content - Video Player */}
          <div className="lg:w-2/3">
            {/* Course Title */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating.toFixed(1)} ({course.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {course.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Video Player Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
              <div className="aspect-video bg-black">
                <EnhancedVideoPlayer
                  src="/Demo.mp4"
                  title={course.lessons?.[0]?.title || 'Introduction'}
                  isAuthenticated={isAuthenticated}
                  isEnrolled={isEnrolled}
                  userEmail={isAuthenticated ? localStorage.getItem('userEmail') || undefined : undefined}
                  userName={isAuthenticated ? localStorage.getItem('userName') || undefined : undefined}
                  onLoginRequired={() => window.location.href = '/login'}
                  onSubscriptionRequired={() => {
                    // Scroll to enrollment section
                    const enrollSection = document.getElementById('enroll-section')
                    enrollSection?.scrollIntoView({ behavior: 'smooth' })
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                  {course.lessons?.[0]?.title || 'Introduction'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Comments and Reviews Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reviews & Comments</h3>
              
              {/* Add Comment Form */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this lesson..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  className="mt-3 px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all font-medium"
                >
                  Post Review
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                          {comment.user[0]}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">{comment.user}</h4>
                            <span className="text-sm text-gray-500">{comment.date}</span>
                          </div>
                          <div className="flex mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= comment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Related Courses */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">You Might Also Like</h3>
              <div className="space-y-4">
                {relatedCourses.map((relatedCourse) => (
                  <Link
                    key={relatedCourse.id}
                    href={`/courses/${relatedCourse.id}`}
                    className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-32 h-20 bg-gray-200 rounded flex-shrink-0 relative overflow-hidden">
                      <Image
                        src={relatedCourse.thumbnail}
                        alt={relatedCourse.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900 hover:text-teal-600 transition-colors mb-2">
                        {relatedCourse.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span>{relatedCourse.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{relatedCourse.students.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Course Content/Syllabus - REMOVED FOR CLEAN LAYOUT */}
            {false && course.lessons && course.lessons.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Course Content</h2>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{course.lessons.length} lessons • {course.duration}</span>
                  <span className="text-gray-500">{course.lessons.filter((l: any) => l.is_free).length} free preview{course.lessons.filter((l: any) => l.is_free).length !== 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-2">
                  {course.lessons.map((lesson: any, index: number) => (
                  <div key={lesson.id || index} className="border border-gray-200 rounded-md overflow-hidden hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        {lesson.video_duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {Math.floor(lesson.video_duration / 60)}:{String(lesson.video_duration % 60).padStart(2, '0')}
                          </span>
                        )}
                        {lesson.is_free ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Free Preview
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements - REMOVED FOR CLEAN LAYOUT */}

            {/* Description - REMOVED FOR CLEAN LAYOUT */}

            {/* AI Course Info - REMOVED FOR CLEAN LAYOUT */}

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

          {/* Sidebar - Video Playlist */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              {/* Course Playlist */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-900 p-4">
                  <h3 className="font-semibold text-white text-base">Course Content</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    {course.lessons?.length || 0} lessons
                  </p>
                </div>
                
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {course.lessons && course.lessons.map((lesson: any, index: number) => {
                    const isFree = index === 0;
                    const needsSubscription = index > 0 && !isEnrolled;
                    
                    return (
                      <div
                        key={lesson.id}
                        className={`border-b border-gray-200 last:border-0 transition-colors ${
                          index === 0 ? 'bg-slate-50' : 'hover:bg-gray-50'
                        } ${needsSubscription ? 'cursor-pointer' : 'cursor-pointer'}`}
                        onClick={() => {
                          if (needsSubscription) {
                            alert('Subscribe to access this lesson');
                          } else {
                            console.log('Switch to lesson:', lesson.id);
                          }
                        }}
                      >
                        <div className="p-3">
                          <div className="flex gap-3">
                            {/* Video Thumbnail */}
                            <div className="w-40 h-24 bg-gray-200 rounded flex-shrink-0 relative overflow-hidden">
                              <Image
                                src={lesson.thumbnail || course.thumbnail}
                                alt={lesson.title}
                                fill
                                className="object-cover"
                              />
                              {needsSubscription && (
                                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                                  <Lock className="h-6 w-6 text-white" />
                                </div>
                              )}
                              {index === 0 && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-green-500 text-white hover:bg-green-500 text-xs px-2 py-0.5">
                                    FREE
                                  </Badge>
                                </div>
                              )}
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 px-1.5 py-0.5 rounded text-white text-xs">
                                {lesson.duration || '15:30'}
                              </div>
                            </div>
                            
                            {/* Lesson Info */}
                            <div className="flex-grow min-w-0">
                              <div className="flex items-start gap-2">
                                <span className="text-gray-500 font-medium text-sm mt-0.5">{index + 1}.</span>
                                <div className="flex-grow">
                                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                    {lesson.title}
                                  </h4>
                                  {needsSubscription && (
                                    <div className="flex items-center gap-1.5 text-xs text-orange-600 mt-1">
                                      <Lock className="h-3 w-3" />
                                      <span className="font-medium">Subscription required</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {!isEnrolled && (
                  <div id="enroll-section" className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-t border-orange-100">
                    <p className="text-sm text-gray-800 mb-3">
                      <strong className="text-orange-700">Subscribe to unlock all {course.lessons?.length || 0} lessons</strong>
                    </p>
                    <button 
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className={`w-full py-3 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white ${
                        isEnrolling ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isEnrolling ? 'Enrolling...' : '🚀 Subscribe Now'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AAO Assistant Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen && (
          <div className="bg-white rounded-2xl shadow-xl w-[400px] h-[600px] mb-4 flex flex-col">
            {/* Chat Header */}
            <div className="bg-green-600 text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center p-0.5 overflow-hidden">
                  <Image src="/logo.jpg" alt="AAO Logo" width={40} height={40} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">AAO Assistant</h3>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:bg-green-700 transition-colors p-1 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
              {chatMessages.length === 0 ? (
                <div className="space-y-3">
                  {/* Initial Bot Message */}
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 p-0.5 overflow-hidden">
                        <Image src="/logo.jpg" alt="AAO Logo" width={32} height={32} className="w-full h-full object-contain" />
                      </div>
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                        <p className="text-sm text-gray-800">Hi there! I'm AAO Assistant. How can I help you today?</p>
                        <p className="text-xs text-gray-400 mt-1">just now</p>
                      </div>
                    </div>
                  </div>

                  {/* Suggestion Questions */}
                  <div className="space-y-2 pt-2">
                    {suggestionQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(question)}
                        className="w-full text-left px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm text-blue-600 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!msg.isUser && (
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1 p-0.5 overflow-hidden">
                          <Image src="/logo.jpg" alt="AAO Logo" width={32} height={32} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                          msg.isUser
                            ? 'bg-green-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your first message to start chatting..."
                  className="flex-grow px-4 py-2.5 border-0 focus:outline-none text-sm text-gray-600 placeholder:text-gray-400"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!currentMessage.trim()}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Popup Notification */}
        {showWelcomePopup && !isChatOpen && (
          <div className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-200 w-80 animate-fade-in-up z-50">
            <button
              onClick={() => setShowWelcomePopup(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-start gap-3 pr-6">
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center flex-shrink-0 p-0.5 overflow-hidden">
                <Image src="/logo.jpg" alt="AAO Logo" width={40} height={40} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">Hi there! I'm AAO Assistant.</p>
                <p className="text-xs text-gray-500 mt-0.5">How can I help you today?</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Button */}
        <button
          onClick={() => {
            setIsChatOpen(!isChatOpen)
            setShowWelcomePopup(false)
          }}
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
