"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  BookOpen, 
  Calendar, 
  Briefcase, 
  Award,
  User,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import NotificationBar from "./NotificationBar";
import LineChartSimple from "@/components/charts/LineChartSimple"
import DonutChart from "@/components/charts/DonutChart"
import BarChartSimple from "@/components/charts/BarChartSimple"
import { DashboardSection } from "@/components/dashboard-section"

interface UserDashboardData {
  user: {
    id: number
    email: string
    full_name: string
    role: string
    created_at: string
    profile_completion?: number
    profile_image_url?: string
    username?: string
  }
  stats: {
    enrolled_courses: number
    completed_courses: number
    registered_events: number
    registered_workshops: number
    job_applications: number
  }
  recent_activity: Array<{
    id: number
    type: string
    title: string
    date: string
    status: string
  }>
  enrolled_courses: Array<{
    id: number
    title: string
    progress: number
    last_accessed: string
  }>
}

import { api } from "@/lib/api"

export default function UserDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null)
  const [error, setError] = useState("")
  const [events, setEvents] = useState<any[]>([])
  const [blogs, setBlogs] = useState<any[]>([])
  const [discussions, setDiscussions] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = () => {
      if (!api.isAuthenticated()) {
        console.log("Dashboard: No token found, redirecting to login")
        router.push("/login")
        return
      }
      fetchDashboardData()
    }
    checkAuth()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("") // Clear previous errors
      
      console.log("Dashboard: Fetching data from API...")
      const response = await api.get('/api/users/dashboard')

      if (response.error) {
        throw new Error(response.error)
      }

      const data = response.data
      console.log("Dashboard: Data fetched successfully", data)
      setDashboardData(data)

      // Determine if student is 4th/5th year (Senior)
      const currentYear = new Date().getFullYear()
      const gradYear = data.user.graduation_year
      const isSeniorStudent = gradYear && (gradYear - currentYear <= 2)

      // Fetch additional data
      try {
        const promises = [
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events?limit=10`).then(r => r.json()).catch(() => []),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs?limit=10`).then(r => r.json()).catch(() => []),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions?limit=10`).then(r => r.json()).catch(() => [])
        ]

        if (isSeniorStudent) {
          promises.push(fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?limit=10`).then(r => r.json()).catch(() => []))
        }

        const results = await Promise.all(promises)
        
        if (Array.isArray(results[0])) setEvents(results[0])
        if (Array.isArray(results[1])) setBlogs(results[1])
        if (Array.isArray(results[2])) setDiscussions(results[2])
        if (isSeniorStudent && Array.isArray(results[3])) setJobs(results[3])
        
      } catch (e) {
        console.error("Failed to fetch additional dashboard items", e)
      }

      // Update local storage with fresh user data including profile image
      const currentUser = api.getStoredUser() || {}
      const updatedUser = { 
        ...currentUser, 
        ...data.user,
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      window.dispatchEvent(new Event('auth-change'))
    } catch (err: any) {
      console.error("Dashboard: Error fetching data:", err)
      if (err.message?.includes('401') || err.response?.status === 401) {
        console.log("Dashboard: Unauthorized, clearing auth and redirecting")
        api.logout()
        router.push("/login")
      } else {
        setError("Failed to load dashboard data. Please try again later.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50/30 via-white to-white">
        <div className="text-center max-w-md mx-auto p-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error || "Failed to load dashboard data"}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => {
              const token = localStorage.getItem("access_token")
              if (token) {
                fetchDashboardData(token)
              } else {
                router.push("/login")
              }
            }}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { user, stats, recent_activity, enrolled_courses } = dashboardData
  
  // Calculate if senior student (4th or 5th year)
  const currentYear = new Date().getFullYear()
  const gradYear = user.graduation_year
  const isSeniorStudent = gradYear && (gradYear - currentYear <= 2)

  return (
    <div className="space-y-6 container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100 border-t-4 border-indigo-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-full p-1 bg-gray-50 border border-gray-100">
                {user.profile_image_url ? (
                  <div className="h-full w-full rounded-full overflow-hidden">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_image_url}`} 
                      alt={user.full_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <span className="text-2xl font-bold text-gray-500">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1 text-gray-900">
                Welcome back, {user.full_name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-500 font-medium">Ready to continue your learning journey?</p>
            </div>
          </div>
          
          {/* Replace Browse Courses with circular profile completion + Edit Profile */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center">
                <svg className="-rotate-90" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="36" cy="36" r="30" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    stroke="#4F46E5"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.PI * 2 * 30}`}
                    strokeDashoffset={`${Math.PI * 2 * 30 * (1 - ((user.profile_completion ?? 40) / 100))}`}
                    style={{ transition: 'stroke-dashoffset 600ms ease' }}
                  />
                </svg>
                <div className="absolute text-sm font-semibold text-gray-900">
                  <span>{user.profile_completion ?? 40}%</span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">Profile</div>
            </div>

            <div>
              <Button
                onClick={() => router.push('/profile')}
                className="bg-gray-900 text-white hover:bg-gray-800 font-medium shadow-sm h-10 px-4"
              >
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2">
        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* My Courses */}
          <DashboardSection
            title="My Courses"
            stat={stats.enrolled_courses}
            statLabel="Enrolled"
            accentColor="border-blue-500"
            icon={<BookOpen className="h-5 w-5 text-blue-600" />}
            description="Continue your learning journey"
            viewAllLink="/courses"
            viewAllText="View All"
            items={enrolled_courses}
            tabs={[
              { label: "In Progress", value: "in_progress", filter: (c) => c.progress < 100 },
              { label: "Completed", value: "completed", filter: (c) => c.progress >= 100 }
            ]}
            renderItem={(course) => (
              <div className="group border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300 bg-white hover:border-blue-100">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                  <Badge variant="secondary" className={`
                    ${course.progress >= 100 ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'} 
                    border-0 font-medium
                  `}>
                    {course.progress}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${course.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-400 font-medium">
                      {course.progress >= 100 ? 'Completed' : 'In Progress'}
                    </span>
                    <Link href={`/learn/${course.id}`}>
                      <Button size="sm" variant="ghost" className="h-8 px-3 text-xs hover:bg-blue-50 hover:text-blue-600 -mr-2">
                        Continue <TrendingUp className="h-3 w-3 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            emptyMessage="No courses yet"
          />

          {/* Events */}
          <DashboardSection
            title="Events"
            stat={stats.registered_events}
            statLabel="Registered"
            accentColor="border-indigo-500"
            icon={<Calendar className="h-5 w-5 text-indigo-600" />}
            description="Upcoming events"
            viewAllLink="/events"
            viewAllText="View All"
            items={events}
            tabs={[
              { label: "Upcoming", value: "upcoming", filter: (e) => new Date(e.date) >= new Date() },
              { label: "Past", value: "past", filter: (e) => new Date(e.date) < new Date() }
            ]}
            renderItem={(event) => (
              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100">
                <div className="h-12 w-12 rounded-xl bg-white border border-indigo-100 shadow-sm flex flex-col items-center justify-center text-indigo-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg font-bold leading-none">{new Date(event.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <h4 className="font-semibold text-gray-900 truncate text-sm group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-indigo-100 text-indigo-600 bg-indigo-50/30">{event.category}</Badge>
                    {event.startTime && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {event.startTime}</span>}
                  </div>
                </div>
              </div>
            )}
            emptyMessage="No events"
          />

          {/* Blogs */}
          <DashboardSection
            title="Latest Blogs"
            accentColor="border-emerald-500"
            icon={<FileText className="h-5 w-5 text-emerald-600" />}
            description="Latest articles"
            viewAllLink="/blogs"
            viewAllText="View All"
            items={blogs}
            renderItem={(blog) => (
              <Link href={`/blogs/${blog.slug}`} className="block group">
                <div className="flex gap-4 p-3 rounded-xl hover:bg-emerald-50/30 transition-all border border-transparent hover:border-emerald-100">
                  <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                    {blog.featured_image ? (
                      <img 
                        src={blog.featured_image.startsWith('http') ? blog.featured_image : `${process.env.NEXT_PUBLIC_API_URL}${blog.featured_image}`} 
                        alt={blog.title} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="h-full w-full bg-emerald-50 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-emerald-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <h4 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 text-sm leading-snug">{blog.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        {new Date(blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-gray-400">• {blog.read_time || '5 min read'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            emptyMessage="No blogs"
          />

          {/* Jobs or Discussions based on Year */}
          {isSeniorStudent ? (
            <DashboardSection
              title="Latest Jobs"
              accentColor="border-orange-500"
              icon={<Briefcase className="h-5 w-5 text-orange-600" />}
              description="Career opportunities"
              viewAllLink="/jobs-portal"
              viewAllText="View All"
              items={jobs}
              renderItem={(job) => (
                <Link href={`/jobs-portal/${job.id}`} className="block group">
                  <div className="p-4 rounded-xl bg-gray-50/50 hover:bg-orange-50/30 transition-all border border-transparent hover:border-orange-100">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-orange-600 flex-shrink-0 shadow-sm">
                        {job.company_logo ? (
                          <img src={job.company_logo} alt={job.company} className="h-full w-full object-contain rounded-lg" />
                        ) : (
                          <Briefcase className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate text-sm">{job.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{job.company} • {job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-[10px] h-5 bg-white border-gray-100 text-gray-600">
                        {job.type}
                      </Badge>
                      <span className="text-[10px] text-gray-400 ml-auto">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              )}
              emptyMessage="No jobs available"
            />
          ) : (
            <DashboardSection
              title="Discussions"
              accentColor="border-orange-500"
              icon={<MessageSquare className="h-5 w-5 text-orange-600" />}
              description="Join conversations"
              viewAllLink="/discussions"
              viewAllText="View All"
              items={discussions}
              renderItem={(discussion) => (
                <Link href={`/discussions/${discussion.id}`} className="block group">
                  <div className="p-4 rounded-xl bg-gray-50/50 hover:bg-orange-50/30 transition-all border border-transparent hover:border-orange-100">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 font-bold text-xs">
                        {discussion.author?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate text-sm">{discussion.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{discussion.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pl-11">
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(discussion.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-5 bg-white shadow-sm border-gray-100 group-hover:border-orange-100 group-hover:text-orange-600 transition-colors">
                        <MessageSquare className="h-3 w-3 mr-1" /> {discussion.answers?.length || 0}
                      </Badge>
                    </div>
                  </div>
                </Link>
              )}
              emptyMessage="No discussions"
            />
          )}
        </div>

        {/* Quick Access Title Blocks (clickable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/blogs" className="block">
            <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer rounded-lg border-2 border-t-4 border-gray-200 border-t-blue-500 hover:border-blue-400 bg-white hover:shadow-blue-200">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Blogs</h3>
                  <p className="text-xs text-gray-500 mt-1">Read and share articles</p>
                </div>
                <div className="text-xs text-blue-600 font-medium mt-3">View All →</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/competitions" className="block">
            <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer rounded-lg border-2 border-t-4 border-gray-200 border-t-purple-500 hover:border-purple-400 bg-white hover:shadow-purple-200">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Competitions</h3>
                  <p className="text-xs text-gray-500 mt-1">Participate and track</p>
                </div>
                <div className="text-xs text-purple-600 font-medium mt-3">View All →</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/expert-talks" className="block">
            <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer rounded-lg border-2 border-t-4 border-gray-200 border-t-orange-500 hover:border-orange-400 bg-white hover:shadow-orange-200">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Expert Talks</h3>
                  <p className="text-xs text-gray-500 mt-1">Upcoming expert talks & sessions</p>
                </div>
                <div className="text-xs text-orange-600 font-medium mt-3">View All →</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/surveys" className="block">
            <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer rounded-lg border-2 border-t-4 border-gray-200 border-t-pink-500 hover:border-pink-400 bg-white hover:shadow-pink-200">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Surveys</h3>
                  <p className="text-xs text-gray-500 mt-1">Feedback & polls</p>
                </div>
                <div className="text-xs text-pink-600 font-medium mt-3">View All →</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Charts Row */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Analytics</h2>
        {/* If user is Faculty or Architect, render bar charts for the first two as well and add Competition Analysis */}
        {((user.user_type === 'FACULTY') || (user.user_type === 'ARCHITECT')) ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-purple-500">
              <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-purple-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Learning Progress</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium pl-1">Activity breakdown</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <BarChartSimple labels={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]} values={[5,12,18,22,28,34,40]} />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-pink-500">
              <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-pink-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Course Completion</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium pl-1">Completion breakdown</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <BarChartSimple labels={["Completed","In Progress","Not Started"]} values={[stats.completed_courses, Math.max(0, stats.enrolled_courses - stats.completed_courses), 0]} />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-cyan-500">
              <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-cyan-600">
                      <Award className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Your Engagement</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium pl-1">Activity breakdown</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <BarChartSimple labels={["Events","Workshops","Job Apps"]} values={[stats.registered_events, stats.registered_workshops, stats.job_applications]} />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-emerald-500">
              <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-emerald-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Competition Analysis</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium pl-1">Compare performance against peers</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <BarChartSimple labels={["Local","Regional","National"]} values={[10, 25, 5]} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-purple-500">
              <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-purple-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Learning Progress</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium pl-1">Your activity over the last 7 days</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <LineChartSimple data={[5, 12, 18, 22, 28, 34, 40]} dataLabel="Activity Score" />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-pink-500">
              <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-pink-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Course Completion</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium pl-1">How you're progressing</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex flex-col items-center justify-center">
                <DonutChart value={stats.completed_courses} total={Math.max(1, stats.enrolled_courses)} label="Completion" />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-cyan-500">
              <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-cyan-600">
                      <Award className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Your Engagement</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium pl-1">Activity breakdown</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <BarChartSimple labels={["Events","Workshops","Job Apps"]} values={[stats.registered_events, stats.registered_workshops, stats.job_applications]} />
              </CardContent>
            </Card>
          </div>
        )}


      </div>
    </div>
  )
}
