"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Trophy,
  Target,
  Clock,
  Award,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LineChartSimple from "@/components/charts/LineChartSimple"
import DonutChart from "@/components/charts/DonutChart"
import BarChartSimple from "@/components/charts/BarChartSimple"
import { api } from "@/lib/api"

// Reusable Dashboard Section Component (kept for backwards compatibility but not used)
const DashboardSection = ({ title, icon: Icon, link, linkText, accentColor, children }: any) => (
  <div className={`space-y-4 border-t-4 ${accentColor} pt-4`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${accentColor.replace('border-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`h-5 w-5 ${accentColor.replace('border-', 'text-')}`} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <Link href={link} className={`text-sm font-medium ${accentColor.replace('border-', 'text-')} hover:underline flex items-center gap-1`}>
        {linkText} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
    {children}
  </div>
)

export default function NATADashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [nataCourses, setNataCourses] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    // Fetch NATA courses
    fetchNataCourses()
  }, [router])

  const fetchNataCourses = async () => {
    try {
      const response = await api.get('/api/nata-courses')
      if (response?.data?.data) {
        // Limit to first 3 courses for dashboard display
        setNataCourses(response.data.data.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching NATA courses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Compute profile progress (from user or derived from course completion)
  const displayProfileProgress = user?.profession_progress 
    ? user.profession_progress
    : user?.enrolled_courses && user?.completed_courses
      ? Math.round((user.completed_courses / user.enrolled_courses) * 100)
      : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Welcome Header with Profile Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.profile_image_url ? (
                  <div className="h-16 w-16 rounded-full overflow-hidden">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_image_url}`} 
                      alt={user.first_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : "N"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.first_name}!
                </h1>
                <p className="text-gray-500 text-sm">
                  Ready to continue your learning journey?
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-center">
              {/* Circular Profile Progress */}
              <div className="text-center">
                <div className="relative h-20 w-20 mx-auto">
                  <svg className="transform -rotate-90" width="80" height="80">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#f97316"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - displayProfileProgress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{displayProfileProgress}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Profile</p>
              </div>
              <Link href="/nata-dashboard/profile">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Test Scores</CardTitle>
                <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">142/200</div>
              <p className="text-xs text-green-600 font-medium mb-4">+15 points from last mock</p>
              <div className="h-[100px]">
                <LineChartSimple 
                  data={[120, 125, 135, 130, 140, 138, 142]}
                  height={100}
                  color="#10b981"
                  compact={true}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Study Hours</CardTitle>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">24.5h</div>
              <p className="text-xs text-gray-500 font-medium mb-4">This week</p>
              <div className="h-[100px]">
                <BarChartSimple 
                  labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                  values={[3, 4, 2.5, 4.5, 3.5, 3, 4]}
                  height={100}
                  colors={['#3b82f6']}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Syllabus Covered</CardTitle>
                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">65%</div>
              <p className="text-xs text-gray-500 font-medium mb-4">On track for exam</p>
              <div className="h-[100px] flex justify-center">
                <DonutChart 
                  value={65}
                  total={100}
                  height={100}
                  colors={['#8b5cf6', '#e5e7eb']}
                  compact={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-6">
          
          {/* NATA Courses Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">My NATA Courses</h2>
                  <p className="text-xs text-gray-500">Continue your learning journey</p>
                </div>
              </div>
              <Link href="/nata-courses">
                <Button variant="outline" className="text-sm border-gray-300 hover:bg-gray-50">
                  View All
                </Button>
              </Link>
            </div>          
            {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-gray-200 animate-pulse">
                  <div className="h-28 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-1.5 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : nataCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nataCourses.map((course) => {
                // Safely parse skills and features if they're JSON strings
                let skills = [];
                try {
                  skills = typeof course.skills === 'string' ? JSON.parse(course.skills) : (Array.isArray(course.skills) ? course.skills : []);
                } catch (e) {
                  // If JSON parse fails, try to split by comma (it might be a comma-separated string)
                  skills = typeof course.skills === 'string' ? course.skills.split(',').map((s: string) => s.trim()) : [];
                }
                const progress = Math.floor(Math.random() * 40) + 30; // Mock progress 30-70%
                
                return (
                  <Link key={course.id} href={`/nata-courses/${course.id}`}>
                    <Card className="group border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full overflow-hidden">
                      <div className="h-28 bg-gradient-to-br from-orange-400 to-orange-600 relative">
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white text-orange-600 hover:bg-white border-0 text-xs font-semibold">
                            {course.category || 'NATA'}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> {course.lessons_count || 0} Lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {course.duration || 'N/A'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-orange-600 font-bold">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="h-14 w-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No courses yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Start your NATA preparation journey
              </p>
              <Link href="/nata-courses">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  Browse NATA Courses
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}