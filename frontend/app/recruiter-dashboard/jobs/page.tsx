"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Users, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

export default function MyJobsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Sample hardcoded jobs from backend
  const sampleJobs = [
    {
      id: 1,
      title: "Senior Architect",
      company: "Tech Design Studio",
      location: "Mumbai, India",
      jobType: "Full Time",
      salary: "₹12,00,000 - ₹15,00,000",
      description: "Looking for experienced architect to lead design projects",
      requirements: ["10+ years experience", "AutoCAD Expert", "Leadership skills"],
      applications: 12,
      views: 156,
      postedDate: "2025-12-10",
      status: "Active"
    },
    {
      id: 2,
      title: "Junior Architect",
      company: "Urban Planning Corp",
      location: "Bangalore, India",
      jobType: "Full Time",
      salary: "₹6,00,000 - ₹8,00,000",
      description: "Fresh graduate architect wanted for residential projects",
      requirements: ["0-2 years experience", "B.Arch degree", "CAD knowledge"],
      applications: 24,
      views: 342,
      postedDate: "2025-12-08",
      status: "Active"
    }
  ]

  useEffect(() => {
    const token = api.getStoredToken()
    const userData = api.getStoredUser()
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    let userRole = ""
    if (typeof userData.role === "string") {
      userRole = userData.role
    } else if (typeof userData.role === "object" && userData.role !== null && "value" in userData.role) {
      userRole = userData.role.value
    }
    
    if (userRole !== 'RECRUITER') {
      router.push('/jobs-portal')
      return
    }
    
    setUser(userData)
    setIsAuthenticated(true)

    // Fetch real jobs from backend
    const fetchJobs = async () => {
      try {
        const response = await api.get('/api/jobs/my')
        if (response && Array.isArray(response.data)) {
          setMyJobs(response.data)
        } else if (Array.isArray(response)) {
          setMyJobs(response)
        } else {
          setMyJobs(sampleJobs)
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
        setMyJobs(sampleJobs)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'RECRUITER') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/recruiter-dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">My Job Listings</h1>
            <p className="text-gray-600 mt-1">Manage all your posted job opportunities</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Jobs List */}
        <div className="space-y-4">
          {myJobs.length > 0 ? (
            myJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {job.title}
                        </CardTitle>
                        <Badge className={job.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 font-medium">{job.company}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Job Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold text-gray-900">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Salary</p>
                        <p className="font-semibold text-gray-900">{job.salary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-semibold text-gray-900">{job.jobType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Applications</p>
                        <p className="font-semibold text-gray-900">{job.applications}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4">{job.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
                    <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                    <span>{job.views} views • {job.applications} applications</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No jobs posted yet</h3>
              <p className="text-gray-600 mt-2">Start by posting your first job opportunity</p>
              <Link href="/recruiter-dashboard/post-job">
                <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Post First Job</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
