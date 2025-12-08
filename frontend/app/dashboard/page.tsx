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
  Settings,
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
    } catch (err) {
      console.error("Dashboard error:", err)
      setError("Failed to load dashboard data. Please try refreshing the page.")
      // Don't redirect on error, just show error message
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    router.push("/")
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name}!</h1>
              <p className="text-emerald-100">Here's what's happening with your learning journey</p>
            </div>
           
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrolled_courses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completed_courses} completed
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Registered</CardTitle>
              <Calendar className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.registered_events}</div>
              <p className="text-xs text-muted-foreground">Upcoming & past events</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workshops</CardTitle>
              <Award className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.registered_workshops}</div>
              <p className="text-xs text-muted-foreground">Learning experiences</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.job_applications}</div>
              <p className="text-xs text-muted-foreground">Active applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription className="text-xs">Your activity over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartSimple data={[5, 12, 18, 22, 28, 34, 40]} dataLabel="Activity Score" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Completion</CardTitle>
              <CardDescription className="text-xs">How you're progressing</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <DonutChart value={stats.completed_courses} total={Math.max(1, stats.enrolled_courses)} label="Completion" />
            </CardContent>
          </Card>

          <Card>
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
            <Card>
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
                      <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{course.title}</h3>
                          <Badge variant="outline">{course.progress}%</Badge>
                        </div>
                        <Progress value={course.progress} className="mb-2" />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last accessed: {new Date(course.last_accessed).toLocaleDateString()}
                          </span>
                          <Link href={`/learn/${course.id}`}>
                            <Button size="sm" variant="ghost">
                              Continue <TrendingUp className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/courses">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <BookOpen className="h-5 w-5" />
                      <span className="text-sm">Courses</span>
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm">Events</span>
                    </Button>
                  </Link>
                  <Link href="/workshops">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <Award className="h-5 w-5" />
                      <span className="text-sm">Workshops</span>
                    </Button>
                  </Link>
                  <Link href="/jobs-portal">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <Briefcase className="h-5 w-5" />
                      <span className="text-sm">Jobs</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recent_activity && recent_activity.length > 0 ? (
                  <div className="space-y-4">
                    {recent_activity.map((activity) => (
                      <div key={activity.id} className="border-l-2 border-blue-600 pl-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-gray-500 capitalize">{activity.type}</p>
                          </div>
                          <Badge 
                            variant={activity.status === 'completed' ? 'default' : 'secondary'}
                            className="ml-2"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/profile/my-applications">
                  <Button variant="ghost" className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    My Applications
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
