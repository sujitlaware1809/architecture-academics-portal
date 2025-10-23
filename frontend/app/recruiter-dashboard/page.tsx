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
  Building
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
    fetchMyJobs()
  }, [router])

  const fetchMyJobs = async () => {
    try {
      setLoading(true)
      const token = api.getStoredToken()
      const response = await fetch('http://localhost:8000/jobs/my/posted', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMyJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatSalary = (min: number | undefined, max: number | undefined, currency: string) => {
    const formatAmount = (amount: number | undefined) => {
      if (!amount && amount !== 0) {
        return 'Not specified';
      }
      
      if (currency === 'INR') {
        if (amount >= 100000) {
          return `₹${(amount / 100000).toFixed(1)}L`
        }
        return `₹${amount.toLocaleString()}`
      }
      return `$${amount.toLocaleString()}`
    }
    
    if (!min && !max) {
      return 'Salary not specified';
    }
    
    if (min && !max) {
      return `${formatAmount(min)}+`;
    }
    
    if (!min && max) {
      return `Up to ${formatAmount(max)}`;
    }
    
    return `${formatAmount(min)} - ${formatAmount(max)}`
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-sky-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">
                Architecture Academics
              </Link>
              <span className="text-sm text-gray-500">Recruiter Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/jobs-portal"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                View All Jobs
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <span className="text-gray-700 text-sm font-medium">{user?.first_name} {user?.last_name}</span>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Logout</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className="text-gray-600">
            Manage your job postings and track applications from your recruiter dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Posted Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{myJobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <Users className="h-6 w-6 text-sky-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myJobs.reduce((total, job) => total + (job.applications_count || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <Link 
                href="/recruiter-dashboard/applications"
                className="text-purple-600 text-sm hover:text-purple-800 font-medium flex items-center space-x-1"
              >
                <span>Manage Applications</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myJobs.filter(job => job.status === 'published').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Job Postings</h2>
          <div className="flex items-center space-x-3">
            <Link 
              href="/recruiter-dashboard/applications"
              className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-all duration-200 flex items-center space-x-2"
            >
              <Users className="h-5 w-5" />
              <span>View Applications</span>
            </Link>
            <Link 
              href="/jobs-portal/post-job"
              className="bg-gradient-to-r from-purple-600 to-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-sky-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Post New Job</span>
            </Link>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {myJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                <p className="text-gray-600 mb-6">Start by posting your first job to attract talented candidates.</p>
                <Link 
                  href="/jobs-portal/post-job"
                  className="bg-gradient-to-r from-purple-600 to-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-sky-700 transition-all duration-200 inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Post Your First Job</span>
                </Link>
              </CardContent>
            </Card>
          ) : (
            myJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatSalary(job.min_salary, job.max_salary, job.currency)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : job.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags && typeof job.tags === 'string' ? (
                      <>
                        {job.tags.split(',')
                          .filter((tag: string) => tag.trim() !== '')
                          .slice(0, 3)
                          .map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              {tag.trim()}
                            </span>
                          ))
                        }
                        {job.tags.split(',').filter((tag: string) => tag.trim() !== '').length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{job.tags.split(',').filter((tag: string) => tag.trim() !== '').length - 3} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">No tags</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{job.applications_count || 0} applications</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between pt-4">
                  <div className="flex space-x-2">
                    <Link 
                      href="/recruiter-dashboard/applications"
                      className="flex items-center space-x-1 px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Applications</span>
                    </Link>
                    <button className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200">
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors duration-200">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
