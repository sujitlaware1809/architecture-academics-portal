"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Calendar,
  Clock,
  FileText,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FacultyDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 text-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                {user.profile_image_url ? (
                  <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_image_url}`} 
                      alt={user.first_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-xl">
                    <span className="text-3xl font-bold text-white">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : "F"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.first_name}!</h1>
                <p className="text-blue-100">Manage your courses and students from here</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link href="/faculty-dashboard/courses/create">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <h3 className="text-2xl font-bold text-gray-900">12</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Students Enrolled</p>
                <h3 className="text-2xl font-bold text-gray-900">245</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Course Rating</p>
                <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <h3 className="text-2xl font-bold text-gray-900">87%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Courses */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Recent Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-200 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Advanced Architecture Design</h4>
                        <p className="text-sm text-gray-500">Last updated 2 days ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/faculty-dashboard/courses">
                  <Button variant="outline" className="w-full">View All Courses</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Upcoming Schedule */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Upcoming Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-12 text-center">
                      <span className="block text-xs font-bold text-blue-600 uppercase">OCT</span>
                      <span className="block text-xl font-bold text-gray-900">{10 + i}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Live Session: Design Principles</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>10:00 AM - 11:30 AM</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/faculty-dashboard/schedule">
                  <Button variant="outline" className="w-full">View Full Schedule</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
