"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { 
  Calendar, 
  BookOpen, 
  Briefcase, 
  Wrench, 
  Users, 
  BarChart2, 
  PlusCircle,
  Settings,
  Activity,
  AlertCircle,
  FileText
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AdminStats {
  total_users: number
  total_courses: number
  total_workshops: number
  total_events: number
  total_jobs: number
  active_users: number
  published_courses: number
  upcoming_workshops: number
  upcoming_events: number
  published_jobs: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const token = api.getStoredToken();
    const user = api.getStoredUser();
    
    if (!token) {
      setError("Please login to access the admin dashboard");
      setLoading(false);
      return;
    }

    // Handle role as string or object
    let userRole = "";
    if (user) {
      if (typeof user.role === "string") {
        userRole = user.role;
      } else if (typeof user.role === "object" && user.role !== null && "value" in user.role) {
        userRole = user.role.value;
      }
    }

    if (!user || userRole !== 'ADMIN') {
      setError("Admin access required. Please login with admin credentials.");
      setLoading(false);
      return;
    }

    fetchStats();
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/api/admin/stats')
      setStats(response.data)
    } catch (err: any) {
      console.error("Error fetching stats:", err)
      
      if (err.message === 'Backend server not accessible') {
        setError("Unable to connect to the server. Please ensure the backend is running.")
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please login as admin.")
      } else if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.")
      } else {
        setError(err.response?.data?.detail || err.message || "Failed to load dashboard statistics")
      }
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
    { 
      name: "Total Users", 
      value: stats.total_users, 
      subtitle: `${stats.active_users} active`,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      href: "/admin/users"
    },
    { 
      name: "Courses", 
      value: stats.total_courses, 
      subtitle: `${stats.published_courses} published`,
      icon: BookOpen,
      color: "from-green-500 to-green-600",
      href: "/admin/courses"
    },
    { 
      name: "Events", 
      value: stats.total_events, 
      subtitle: `${stats.upcoming_events} upcoming`,
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600",
      href: "/admin/events"
    },
    { 
      name: "Workshops", 
      value: stats.total_workshops, 
      subtitle: `${stats.upcoming_workshops} upcoming`,
      icon: Wrench,
      color: "from-cyan-500 to-cyan-600",
      href: "/admin/workshops"
    },
    { 
      name: "Job Listings", 
      value: stats.total_jobs, 
      subtitle: `${stats.published_jobs} published`,
      icon: Briefcase,
      color: "from-yellow-500 to-yellow-600",
      href: "/admin/jobs"
    },
  ] : []

  const quickActions = [
    { name: "Manage Events", href: "/admin/events", icon: Calendar, color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200" },
    { name: "Manage Workshops", href: "/admin/workshops", icon: Wrench, color: "bg-blue-100 text-blue-600 hover:bg-blue-200" },
    { name: "Manage Courses", href: "/admin/courses", icon: BookOpen, color: "bg-green-100 text-green-600 hover:bg-green-200" },
    { name: "Manage Jobs", href: "/admin/jobs", icon: Briefcase, color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200" },
    { name: "Manage Blogs", href: "/admin/blogs", icon: FileText, color: "bg-pink-100 text-pink-600 hover:bg-pink-200" },
    { name: "Manage Users", href: "/admin/users", icon: Users, color: "bg-red-100 text-red-600 hover:bg-red-200" },
    { name: "Settings", href: "/admin/settings", icon: Settings, color: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const isAuthError = error.includes("login") || error.includes("Authentication") || error.includes("Admin access");
    
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            
            {isAuthError && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Admin Login Required</h4>
                <p className="text-blue-700 text-sm mb-3">Please log in with admin credentials to access the dashboard:</p>
                <div className="bg-white border border-blue-200 rounded p-3 text-sm">
                  <div className="font-mono">
                    <div><strong>Email:</strong> admin@architecture-academics.online</div>
                    <div><strong>Password:</strong> Admin@123</div>
                  </div>
                </div>
                <div className="mt-3">
                  <Link href="/login">
                    <Button size="sm" className="mr-2">Go to Login</Button>
                  </Link>
                </div>
              </div>
            )}
            
            <Button onClick={fetchStats} variant="outline">Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">{formattedDate}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link href="/">
            <Button variant="outline">View Site</Button>
          </Link>
          <Button onClick={fetchStats} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.name}</CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5 text-blue-600" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Manage your platform content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.name} href={action.href}>
                  <div className={`${action.color} rounded-xl p-4 transition-all duration-200 text-center group`}>
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{action.name}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Platform Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">User Accounts</p>
                    <p className="text-xs text-gray-500">{stats?.active_users} active of {stats?.total_users} total</p>
                  </div>
                </div>
                <Link href="/admin/users">
                  <Button size="sm" variant="ghost">Manage</Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Course Catalog</p>
                    <p className="text-xs text-gray-500">{stats?.published_courses} published courses</p>
                  </div>
                </div>
                <Link href="/admin/courses">
                  <Button size="sm" variant="ghost">Manage</Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Upcoming Events</p>
                    <p className="text-xs text-gray-500">{stats?.upcoming_events} events scheduled</p>
                  </div>
                </div>
                <Link href="/admin/events">
                  <Button size="sm" variant="ghost">Manage</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-blue-600" />
              <span>Content Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Published Courses</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.published_courses}/{stats?.total_courses}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.total_courses ? (stats.published_courses / stats.total_courses * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Published Jobs</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.published_jobs}/{stats?.total_jobs}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.total_jobs ? (stats.published_jobs / stats.total_jobs * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Users</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.active_users}/{stats?.total_users}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.total_users ? (stats.active_users / stats.total_users * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">System Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-600 font-medium">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
