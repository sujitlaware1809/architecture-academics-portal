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
  XCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import NotificationBar from "./NotificationBar";
import LineChartSimple from "@/components/charts/LineChartSimple"
import DonutChart from "@/components/charts/DonutChart"
import BarChartSimple from "@/components/charts/BarChartSimple"

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

export default function UserDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const user = localStorage.getItem("user")
    
    console.log("Dashboard: Checking auth...", { hasToken: !!token, hasUser: !!user })
    
    if (!token) {
      console.log("Dashboard: No token found, redirecting to login")
      router.push("/login")
      return
    }

    fetchDashboardData(token)
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      setLoading(true)
      setError("") // Clear previous errors
      
      console.log("Dashboard: Fetching data from API...")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/dashboard`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      console.log("Dashboard: API response status:", response.status)

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Dashboard: Unauthorized, clearing auth and redirecting")
          localStorage.removeItem("access_token")
          localStorage.removeItem("user")
          router.push("/login")
          return
        }
        const errorText = await response.text()
        console.error("Dashboard: API error:", errorText)
        throw new Error("Failed to fetch dashboard data")
      }

      const data = await response.json()
      console.log("Dashboard: Data received successfully", data)
      setDashboardData(data)

      // Update local storage with fresh user data including profile image
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
      const updatedUser = { 
        ...currentUser, 
        ...data.user,
        avatar: data.user.profile_image_url ? `${process.env.NEXT_PUBLIC_API_URL}${data.user.profile_image_url}` : null
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      window.dispatchEvent(new Event('auth-change'))
    } catch (err) {
      console.error("Dashboard error:", err)
      setError("Failed to load dashboard data. Please try refreshing the page.")
      // Don't redirect on error, just show error message
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-emerald-500 to-gray-900 text-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                {user.profile_image_url ? (
                  <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_image_url}`} 
                      alt={user.full_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-xl">
                    <span className="text-3xl font-bold text-white">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name}!</h1>
                <p className="text-emerald-50">Here's what's happening with your learning journey</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link href="/courses">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2">
        {/* Profile Completion Alert */}
        {(!user.username || (user.profile_completion !== undefined && user.profile_completion < 100)) && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-orange-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  {user.profile_image_url ? (
                    <div className="h-6 w-6 rounded-full overflow-hidden border border-orange-200">
                       <img src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_image_url}`} className="h-full w-full object-cover" alt="Profile" />
                    </div>
                  ) : (
                    <User className="h-5 w-5 text-orange-500" />
                  )}
                  {!user.username ? "Profile Incomplete" : "Complete Your Profile"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {!user.username 
                    ? "Please add your username to complete your profile." 
                    : `Your profile is ${user.profile_completion}% complete. Add more details to get better recommendations.`}
                </p>
                {user.profile_completion !== undefined && (
                  <div className="flex items-center gap-3 w-full max-w-md mt-2">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${user.profile_completion}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-orange-700">{user.profile_completion}%</span>
                  </div>
                )}
              </div>
              <Button 
                onClick={() => router.push('/profile')}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
              >
                {!user.username ? "Add Username" : "Complete Profile"}
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Enrolled Courses</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.enrolled_courses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completed_courses} completed
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Events Registered</CardTitle>
              <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.registered_events}</div>
              <p className="text-xs text-muted-foreground mt-1">Upcoming & past events</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-pink-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Workshops</CardTitle>
              <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center">
                <Award className="h-4 w-4 text-pink-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.registered_workshops}</div>
              <p className="text-xs text-muted-foreground mt-1">Learning experiences</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Job Applications</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.job_applications}</div>
              <p className="text-xs text-muted-foreground mt-1">Active applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription className="text-xs">Your activity over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartSimple data={[5, 12, 18, 22, 28, 34, 40]} dataLabel="Activity Score" />
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Course Completion</CardTitle>
              <CardDescription className="text-xs">How you're progressing</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <DonutChart value={stats.completed_courses} total={Math.max(1, stats.enrolled_courses)} label="Completion" />
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Your Engagement</CardTitle>
              <CardDescription className="text-xs">Activity breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartSimple labels={["Events","Workshops","Job Apps"]} values={[stats.registered_events, stats.registered_workshops, stats.job_applications]} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  My Courses
                </CardTitle>
                <CardDescription>Continue your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                {enrolled_courses && enrolled_courses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolled_courses.map((course) => (
                      <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{course.progress}%</Badge>
                        </div>
                        <Progress value={course.progress} className="mb-2 h-2" />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last accessed: {new Date(course.last_accessed).toLocaleDateString()}
                          </span>
                          <Link href={`/learn/${course.id}`}>
                            <Button size="sm" variant="ghost" className="hover:bg-blue-50 hover:text-blue-700">
                              Continue <TrendingUp className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
                    <Link href="/courses">
                      <Button>
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <Card className="shadow-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recent_activity && recent_activity.length > 0 ? (
                  <div className="space-y-6">
                    {recent_activity.map((activity) => (
                      <div key={activity.id} className="relative pl-6 border-l-2 border-gray-200 last:border-0">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-indigo-500"></div>
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <Badge 
                            variant={activity.status === 'completed' ? 'default' : 'secondary'}
                            className="ml-2 text-[10px] px-1.5 py-0"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 capitalize mb-1">{activity.type}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No recent activity
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
