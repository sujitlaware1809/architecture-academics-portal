"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import CoursePlayer from "@/components/course-player"
import {
  ArrowLeft,
  Book,
  Download,
  FileText,
  CheckCircle,
  Circle,
  Lock,
  MessageSquare,
  Send,
  Bot,
  X,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Clock,
  Award,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Lesson {
  id: number
  title: string
  duration: string
  is_free: boolean
  video_url?: string
  order_index: number
  completed?: boolean
}

interface Material {
  id: number
  title: string
  file_url: string
  file_type: string
  file_size?: string
}

interface Course {
  id: number
  title: string
  description: string
  image_url: string
  lessons: Lesson[]
  materials: Material[]
  instructor_name?: string
  level?: string
  duration?: string
}

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const courseId = unwrappedParams.id

  const [course, setCourse] = useState<Course | null>(null)
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]))
  
  // Chatbot state
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', message: string}[]>([
    { role: 'ai', message: 'Hello! I\'m your AI course assistant. Ask me anything about this course!' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  useEffect(() => {
    // Check authentication first
    if (!api.isAuthenticated()) {
      alert('Please login to access course content')
      window.location.href = '/login'
      return
    }
    
    fetchCourseData()
    fetchEnrollmentData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/courses/${courseId}`)
      if (response && response.data) {
        // Add dummy materials if none exist
        const courseMaterials = response.data.materials && response.data.materials.length > 0 
          ? response.data.materials 
          : [
              {
                id: 1,
                title: 'Course Syllabus.pdf',
                file_url: '/dummy-materials/syllabus.pdf',
                file_type: 'pdf',
                file_size: '2.5 MB'
              },
              {
                id: 2,
                title: 'Architecture Basics.pptx',
                file_url: '/dummy-materials/basics.pptx',
                file_type: 'pptx',
                file_size: '8.3 MB'
              },
              {
                id: 3,
                title: 'Design Resources.zip',
                file_url: '/dummy-materials/resources.zip',
                file_type: 'zip',
                file_size: '45.7 MB'
              },
              {
                id: 4,
                title: 'Reference Sheet.docx',
                file_url: '/dummy-materials/reference.docx',
                file_type: 'docx',
                file_size: '1.2 MB'
              }
            ]

        const courseData = {
          ...response.data,
          materials: courseMaterials,
          lessons: response.data.lessons || []
        }
        
        setCourse(courseData)
        
        // Set first lesson as current if available
        if (courseData.lessons && courseData.lessons.length > 0) {
          setCurrentLesson(courseData.lessons[0])
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollmentData = async () => {
    try {
      const response = await api.get(`/api/enrollments/course/${courseId}`)
      if (response && response.data) {
        setEnrollmentId(response.data.id)
        setIsEnrolled(true)
        // TODO: Fetch completed lessons
      } else {
        setIsEnrolled(false)
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error)
      setIsEnrolled(false)
    }
  }

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    // Mark lesson as viewed
    if (!completedLessons.has(lesson.id)) {
      // TODO: Update progress in backend
    }
  }

  const handleLessonComplete = () => {
    if (currentLesson) {
      setCompletedLessons(prev => new Set([...prev, currentLesson.id]))
      // TODO: Update progress in backend
      
      // Auto-advance to next lesson
      const currentIndex = course?.lessons.findIndex(l => l.id === currentLesson.id) || 0
      if (course && currentIndex < course.lessons.length - 1) {
        setCurrentLesson(course.lessons[currentIndex + 1])
      }
    }
  }

  const toggleModule = (index: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', message: userMessage }])
    setIsSendingMessage(true)

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiResponses = [
        `Great question! In this course, we cover ${userMessage.includes('topic') ? 'various architectural design principles' : 'the fundamentals of architecture'}.`,
        `${userMessage.includes('how') || userMessage.includes('what') ? 'Let me explain' : 'I can help with that'}. The course material in lesson ${currentLesson?.order_index || 1} discusses this in detail.`,
        `That's an interesting question about ${userMessage.split(' ')[0]}. I recommend reviewing the materials section for additional resources.`,
        `Based on your progress, you're doing great! ${userMessage.includes('help') ? 'I suggest focusing on the practical exercises' : 'Keep up the good work'}.`
      ]
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      setChatMessages(prev => [...prev, { role: 'ai', message: randomResponse }])
      setIsSendingMessage(false)
    }, 1000)
  }

  const calculateProgress = () => {
    if (!course || !course.lessons || course.lessons.length === 0) return 0
    return Math.round((completedLessons.size / course.lessons.length) * 100)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
    if (fileType.includes('pptx') || fileType.includes('ppt')) return <FileText className="h-5 w-5 text-orange-500" />
    if (fileType.includes('docx') || fileType.includes('doc')) return <FileText className="h-5 w-5 text-blue-500" />
    if (fileType.includes('zip')) return <FileText className="h-5 w-5 text-gray-500" />
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  if (loading || isEnrolled === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  // Check if user is not enrolled
  if (isEnrolled === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div className="mb-6">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Enrollment Required</h2>
            <p className="text-gray-600">
              You need to enroll in this course to access the content.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href={`/courses/${courseId}`}
              className="inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Enroll Now
            </Link>
            <Link
              href="/courses"
              className="inline-block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-200 transition-colors font-semibold"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <Link href="/courses" className="text-blue-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/profile/my-courses" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                My Courses
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {course.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{progress}%</span> Complete
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {currentLesson ? (
                <div>
                  <div className="aspect-video bg-black">
                    <CoursePlayer
                      lessonId={currentLesson.id}
                      lessonTitle={currentLesson.title}
                      videoStreamUrl={currentLesson.video_url || '/AWS.mp4'}
                      enrollmentId={enrollmentId || undefined}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {currentLesson.title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {currentLesson.duration}
                          </span>
                          <span>Lesson {currentLesson.order_index}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleLessonComplete}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          completedLessons.has(currentLesson.id)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {completedLessons.has(currentLesson.id) ? '✓ Completed' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Select a lesson to begin</p>
                </div>
              )}
            </div>

            {/* Course Materials */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Book className="h-5 w-5" />
                Course Materials
              </h3>
              <div className="space-y-3">
                {course.materials && course.materials.length > 0 ? (
                  course.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(material.file_type)}
                        <div>
                          <p className="font-medium text-gray-900">{material.title}</p>
                          {material.file_size && (
                            <p className="text-sm text-gray-600">{material.file_size}</p>
                          )}
                        </div>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No materials available yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Course Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Instructor</span>
                  <span className="font-medium">{course.instructor_name || 'Architecture Expert'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <Badge variant="outline">{course.level || 'All Levels'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{course.duration || 'Self-paced'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-green-600">{progress}%</span>
                </div>
              </div>
              
              {progress === 100 && (
                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-colors flex items-center justify-center gap-2">
                  <Award className="h-5 w-5" />
                  Get Certificate
                </button>
              )}
            </div>

            {/* Lessons List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Course Content</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {course.lessons.length} lessons • {completedLessons.size} completed
                </p>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson, index) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonSelect(lesson)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          currentLesson?.id === lesson.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {completedLessons.has(lesson.id) ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : currentLesson?.id === lesson.id ? (
                              <PlayCircle className="h-5 w-5 text-blue-600" />
                            ) : lesson.is_free ? (
                              <Circle className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${
                              currentLesson?.id === lesson.id ? 'text-blue-600' : 'text-gray-900'
                            }`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                              <span>{lesson.duration}</span>
                              {lesson.is_free && (
                                <Badge className="bg-green-100 text-green-700 text-xs">Free</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-600">
                      No lessons available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {showChatbot ? (
          <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col">
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6" />
                <div>
                  <h3 className="font-bold">AI Course Assistant</h3>
                  <p className="text-xs text-blue-100">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatbot(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
              {isSendingMessage && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask anything about this course..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || !chatInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowChatbot(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  )
}
