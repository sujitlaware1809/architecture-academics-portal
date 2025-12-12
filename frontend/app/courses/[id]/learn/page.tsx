"use client"

import { use, useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Play,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Video,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Menu,
  X,
  Send,
  Bot,
  User as UserIcon,
  Home,
  Settings,
  LogOut,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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

type Material = {
  id: number
  title: string
  description?: string | null
  file_type: string
  file_url: string
  file_size?: number | null
  order_index: number
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
  materials: Material[]
}

export default function CourseLearnPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("")
  const [expandedSections, setExpandedSections] = useState<boolean>(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showDoubtModal, setShowDoubtModal] = useState(false)
  const [doubtQuestion, setDoubtQuestion] = useState("")
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! I'm your course assistant. How can I help you today?" }
  ])
  const [chatInput, setChatInput] = useState("")

  const [showEnrollModal, setShowEnrollModal] = useState(false)

  const isEnrolled = useMemo(() => !!enrollmentId, [enrollmentId])

  const formatDuration = (secs?: number | null) => {
    if (!secs || secs <= 0) return ""
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2,'0')}`
  }

  const buildAbsoluteUrl = (url?: string | null) => {
    if (!url) return ""
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`
    return url
  }

  // Fetch course detail and enrollment
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}`)
        if (!res.ok) throw new Error('Failed to load course')
        const data = await res.json()
        if (cancelled) return

        const sortedLessons: Lesson[] = (data.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
        const sortedMaterials: Material[] = (data.materials || []).sort((a: Material, b: Material) => a.order_index - b.order_index)
        setCourse(data)
        setLessons(sortedLessons)
        setMaterials(sortedMaterials)

        // Attempt to get enrollment
        try {
          const token = localStorage.getItem('access_token')
          if (token) {
            const enr = await fetch(`${API_BASE_URL}/api/enrollments/course/${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (enr.ok) {
              const enrData = await enr.json()
              if (!cancelled) {
                setEnrollmentId(enrData.id)
                setProgress(enrData.progress_percentage || 0)
              }
            }
          }
        } catch {}

        // Pick first playable lesson
        const initial = sortedLessons.find(l => isEnrolled || l.is_free) || sortedLessons[0] || null
        setCurrentLesson(initial || null)
      } catch (e) {
        console.error(e)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  // Resolve video URL for current lesson
  useEffect(() => {
    let cancelled = false
    const resolveVideo = async () => {
      if (!currentLesson) { setCurrentVideoUrl(""); return }
      // If not enrolled and lesson is not free, lock
      if (!isEnrolled && !currentLesson.is_free) {
        setCurrentVideoUrl("")
        return
      }
      try {
        // Prefer dynamic video-url endpoint (for presigned or gated)
        const token = localStorage.getItem('access_token')
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}/lessons/${currentLesson.id}/video-url`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        })
        if (res.ok) {
          const v = await res.json()
          const url = v?.video_url ? buildAbsoluteUrl(v.video_url) : buildAbsoluteUrl(currentLesson.video_url || undefined)
          if (!cancelled) setCurrentVideoUrl(url)
        } else {
          // Fallback to static URL if available
          const url = buildAbsoluteUrl(currentLesson.video_url || undefined)
          if (!cancelled) setCurrentVideoUrl(url)
        }
      } catch {
        const url = buildAbsoluteUrl(currentLesson.video_url || undefined)
        if (!cancelled) setCurrentVideoUrl(url)
      }
    }
    resolveVideo()
    return () => { cancelled = true }
  }, [currentLesson, id, isEnrolled])

  const toggleSection = () => setExpandedSections(s => !s)

  const selectLesson = (lesson: Lesson) => {
    if (!isEnrolled && !lesson.is_free) {
      setShowEnrollModal(true)
      return
    }
    setCurrentLesson(lesson)
  }

  const handleDoubtSubmit = () => {
    if (doubtQuestion.trim()) {
      alert(`Doubt submitted: ${doubtQuestion}`)
      setDoubtQuestion("")
      setShowDoubtModal(false)
    }
  }

  const handleChatSend = () => {
    if (chatInput.trim()) {
      const newMessage = { id: chatMessages.length + 1, sender: "user", text: chatInput }
      setChatMessages([...chatMessages, newMessage])
      setChatInput("")

      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: chatMessages.length + 2,
          sender: "bot",
          text: "I understand your question. Let me help you with that. Could you please provide more details?"
        }
        setChatMessages(prev => [...prev, botResponse])
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900 hidden sm:inline">Architecture Academics</span>
            </Link>
          </div>

          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{course?.title || 'Course'}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
            <Link href="/courses" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              Exit Course
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${Math.round(progress)}%` }}
          ></div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Course Content */}
        <aside
          className={`${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900">Course Content</h2>
              <button onClick={() => setShowSidebar(false)} className="lg:hidden p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{Math.round(progress)}% Complete</span>
              <span>{lessons.length} Lessons</span>
            </div>
          </div>

          {/* Lessons */}
          <div className="divide-y divide-gray-200">
            <div>
              <button
                onClick={toggleSection}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Play className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 text-sm">Lessons</h3>
                    <p className="text-xs text-gray-500">Ordered content</p>
                  </div>
                </div>
                {expandedSections ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {expandedSections && (
                <div className="bg-gray-50">
                  {lessons.map((lesson) => {
                    const locked = !isEnrolled && !lesson.is_free
                    const isActive = currentLesson?.id === lesson.id
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        disabled={locked}
                        className={`w-full px-4 py-3 pl-12 flex items-center gap-3 text-left transition-colors ${
                          isActive ? "bg-blue-50 border-l-4 border-blue-600" : "hover:bg-gray-100"
                        } ${locked && "opacity-50 cursor-not-allowed"}`}
                      >
                        {locked ? (
                          <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <Video className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{lesson.title}</p>
                          <p className="text-xs text-gray-500">{formatDuration(lesson.video_duration)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Video Player Section */}
          <div className="bg-black">
            {currentLesson ? (
              currentVideoUrl ? (
                <div className="aspect-video max-w-6xl mx-auto">
                  <CoursePlayer lessonId={currentLesson.id} lessonTitle={currentLesson.title} videoStreamUrl={currentVideoUrl} enrollmentId={enrollmentId ?? undefined} />
                </div>
              ) : (
                <div className="aspect-video max-w-6xl mx-auto flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
                  <div className="text-center text-white max-w-md px-6">
                    <Lock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-2xl font-semibold mb-3">{currentLesson.title}</h3>
                    <p className="text-gray-300 mb-6">
                      {isEnrolled 
                        ? 'No video available for this lesson.' 
                        : 'This lesson is part of our premium content. Enroll now to unlock all lessons and materials.'}
                    </p>
                    {!isEnrolled && (
                      <Button
                        onClick={() => setShowEnrollModal(true)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        Enroll to Unlock
                      </Button>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="aspect-video max-w-6xl mx-auto flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No lessons available yet</h3>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Info and Tabs */}
          <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson?.title || 'Lesson'}</h1>
              <p className="text-gray-600">Course: {course?.title}</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex gap-8">
                <button className="pb-4 border-b-2 border-blue-600 text-blue-600 font-medium">
                  Overview
                </button>
                <button className="pb-4 text-gray-600 hover:text-gray-900">
                  Notes
                </button>
                <button className="pb-4 text-gray-600 hover:text-gray-900">
                  Discussion
                </button>
              </nav>
            </div>

            {/* Overview Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* About this lesson */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">About this lesson</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {currentLesson?.description || 'No description provided.'}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    We'll cover key topics including spatial organization, proportion, scale, and
                    the relationship between form and function. By the end of this lesson, you'll
                    have a solid understanding of the foundational concepts that every architect
                    needs to know.
                  </p>
                </div>

                {/* Learning Objectives */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Learning Objectives</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        Understand the core principles of architectural design
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        Identify different architectural styles and their characteristics
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        Apply design thinking to solve architectural problems
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        Analyze case studies of famous architectural works
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Ask Doubt Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Have a doubt?</h2>
                      <p className="text-sm text-gray-600">Ask your instructor or teaching assistants</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowDoubtModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Ask a Question
                  </Button>
                </div>
              </div>

              {/* Sidebar - Resources */}
              <div className="space-y-6">
                {/* Course Materials */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Course Materials</h2>
                  <div className="space-y-3">
                    {materials.map((m) => (
                      <a
                        key={m.id}
                        href={buildAbsoluteUrl(m.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {m.title}
                            </p>
                            <p className="text-xs text-gray-500">{m.file_type}{m.file_size ? ` • ${(m.file_size/1024/1024).toFixed(1)} MB` : ''}</p>
                          </div>
                        </div>
                        <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                      </a>
                    ))}
                    {materials.length === 0 && (
                      <p className="text-sm text-gray-500">No materials uploaded yet.</p>
                    )}
                  </div>
                </div>

                {/* Progress Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                  <h3 className="font-bold mb-2">Your Progress</h3>
                  <div className="text-3xl font-bold mb-2">{Math.round(progress)}%</div>
                  <p className="text-sm text-blue-100 mb-4">Keep going! You're doing great!</p>
                  <div className="bg-white/20 rounded-full h-2 mb-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-300"
                      style={{ width: `${Math.round(progress)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-100">
                    {lessons.length > 0 ? `${Math.round(lessons.length * (progress/100))} of ${lessons.length} lessons (approx.)` : 'No lessons yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Doubt Modal */}
      {showDoubtModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Ask Your Doubt</h2>
                <button
                  onClick={() => setShowDoubtModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <Textarea
                value={doubtQuestion}
                onChange={(e) => setDoubtQuestion(e.target.value)}
                placeholder="Describe your doubt in detail..."
                className="w-full min-h-[150px] mb-4"
              />
              <p className="text-sm text-gray-600 mb-4">
                💡 Tip: Be specific about what you're confused about. Include the lesson name and timestamp if applicable.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDoubtModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDoubtSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {showChatbot ? (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-96 h-[500px] flex flex-col">
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Course Assistant</h3>
                  <p className="text-xs text-blue-100">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatbot(false)}
                className="p-1 hover:bg-white/20 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === "bot"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {msg.sender === "bot" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      msg.sender === "bot"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleChatSend}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowChatbot(true)}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
          >
            <Bot className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </button>
        )}
      </div>

      {/* Enrollment Required Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-amber-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-2">
                Premium Content
              </h3>
              <p className="text-amber-100 text-center">
                Unlock all {lessons.length} lessons and advance your skills
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Full Course Access</p>
                    <p className="text-sm text-gray-600">Access all {lessons.length} video lessons</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Downloadable Resources</p>
                    <p className="text-sm text-gray-600">Get all course materials and PDFs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Certificate of Completion</p>
                    <p className="text-sm text-gray-600">Earn a certificate upon completion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Lifetime Access</p>
                    <p className="text-sm text-gray-600">Learn at your own pace, anytime</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Course Price</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {course?.price ? `₹${course.price}` : 'Free'}
                    </p>
                  </div>
                  {course?.price && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 line-through">₹{(course.price * 1.5).toFixed(0)}</p>
                      <Badge className="bg-green-500 text-white">Save 33%</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowEnrollModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={() => {
                    setShowEnrollModal(false)
                    router.push(`/courses/${id}`)
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Enroll Now
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                30-day money-back guarantee • Secure payment
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
