"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Plus, 
  Briefcase, 
  Users, 
  Eye, 
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Clock,
  Building,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

export default function RecruiterDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = api.getStoredToken()
    const userData = api.getStoredUser()
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    // Check if user is a recruiter (handle both string and enum object)
    let userRole = "";
    if (typeof userData.role === "string") {
      userRole = userData.role;
    } else if (typeof userData.role === "object" && userData.role !== null && "value" in userData.role) {
      userRole = userData.role.value;
    }
    
    if (userRole !== 'RECRUITER') {
      router.push('/jobs-portal')
      return
    }
    
    setIsAuthenticated(true)
    setUser(userData)
    
    // Fetch recruiter's jobs
    const fetchMyJobs = async () => {
      try {
        const response = await api.get('/jobs/my-jobs')
        setMyJobs(response)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMyJobs()
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

  if (!isAuthenticated) return null

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 text-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                {user?.profile_image_url ? (
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
                      {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "R"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name}!</h1>
                <p className="text-blue-100">Manage your job postings and applications</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link href="/recruiter-dashboard/post-job">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
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
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900">{myJobs.length}</h3>
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
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {myJobs.reduce((acc, job) => acc + (job.applications_count || 0), 0)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-600">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {myJobs.reduce((acc, job) => acc + (job.views || 0), 0)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Hired Candidates</p>
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Recent Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myJobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No jobs posted yet.
                  </div>
                ) : (
                  myJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-200 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-blue-700" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-500">{job.location} • {job.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/recruiter-dashboard/jobs/${job.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4">
                <Link href="/recruiter-dashboard/jobs">
                  <Button variant="outline" className="w-full">View All Jobs</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recent Applications */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder for recent applications */}
                <div className="text-center py-8 text-gray-500">
                  No recent applications.
                </div>
              </div>
              <div className="mt-4">
                <Link href="/recruiter-dashboard/applications">
                  <Button variant="outline" className="w-full">View All Applications</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
