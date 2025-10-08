"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  User,
  LogOut,
  Briefcase,
  Bookmark,
  Bell,
  Settings,
  FileText,
  MapPin,
  Calendar,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

// Mock data for applications and saved jobs
// Application status styling
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'under_review':
      return 'bg-blue-100 text-blue-800';
    case 'interview_scheduled':
      return 'bg-purple-100 text-purple-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Pending';
    case 'under_review':
      return 'Under Review';
    case 'interview_scheduled':
      return 'Interview Scheduled';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("applications")
  const [applications, setApplications] = useState<any[]>([])
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user's job applications
  const fetchApplications = async () => {
    try {
      setLoading(true)
      const token = api.getStoredToken()
      const response = await fetch('http://localhost:8000/applications/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user's saved jobs
  const fetchSavedJobs = async () => {
    try {
      setLoading(true)
      const token = api.getStoredToken()
      const response = await fetch('http://localhost:8000/jobs/saved/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSavedJobs(data)
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    // Check authentication status
    const token = api.getStoredToken()
    const userData = api.getStoredUser()
    
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(userData)
      fetchApplications()
      fetchSavedJobs()
    } else {
      // Redirect to login if not authenticated
      router.push("/login")
    }
  }, [router])

  const handleLogout = async () => {
    await api.logout()
    setIsAuthenticated(false)
    setUser(null)
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700"
      case "under_review": return "bg-yellow-100 text-yellow-700" 
      case "interview_scheduled": return "bg-blue-100 text-blue-700"
      case "accepted": return "bg-green-100 text-green-700"
      case "rejected": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />
      case "under_review": return <Clock className="h-4 w-4" />
      case "interview_scheduled": return <Calendar className="h-4 w-4" />
      case "accepted": return <CheckCircle className="h-4 w-4" />
      case "rejected": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const removeApplication = async (id: number) => {
    try {
      const token = api.getStoredToken();
      const response = await fetch(`http://localhost:8000/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Remove from UI
        setApplications(prev => prev.filter(app => app.id !== id));
      } else {
        console.error('Failed to remove application');
      }
    } catch (error) {
      console.error('Error removing application:', error);
    }
  }

  const removeSavedJob = async (id: number) => {
    try {
      const token = api.getStoredToken();
      const response = await fetch(`http://localhost:8000/jobs/saved/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Remove from UI
        setSavedJobs(prev => prev.filter(job => job.id !== id));
      } else {
        console.error('Failed to remove saved job');
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-mint-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/jobs-portal" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-sky-500 to-purple-600 p-2 rounded-xl">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JobsPortal</h1>
                <span className="text-xs text-gray-500">Dashboard</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/jobs-portal" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Browse Jobs
              </Link>
              <Link href="/jobs-portal/post-job" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Post Job
              </Link>
            </nav>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-sky-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600">
            Manage your job applications and saved positions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sky-100 text-sm">Saved Jobs</p>
                  <p className="text-2xl font-bold">{savedJobs.length}</p>
                </div>
                <Bookmark className="h-8 w-8 text-sky-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Interviews</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === "interview_scheduled").length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Profile Views</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Eye className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "applications"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "saved"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Saved Jobs ({savedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile Settings
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {applications.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-6">Start applying to jobs to see them here</p>
                  <Link
                    href="/jobs-portal"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-sky-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-sky-700 transition-all duration-200"
                  >
                    <Search className="h-4 w-4" />
                    <span>Browse Jobs</span>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.job?.title || 'Job Title Unavailable'}
                            </h3>
                            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(application.status)}`}>
                              {application.status === 'pending' && <Clock className="h-4 w-4" />}
                              {application.status === 'under_review' && <Clock className="h-4 w-4" />}
                              {application.status === 'interview_scheduled' && <Calendar className="h-4 w-4" />}
                              {application.status === 'accepted' && <CheckCircle className="h-4 w-4" />}
                              {application.status === 'rejected' && <XCircle className="h-4 w-4" />}
                              <span>{getStatusLabel(application.status)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{application.job?.company || 'Company Unavailable'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{application.job?.location || 'Location Unavailable'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {(application.job?.salary_min || application.job?.salary_max) && (
                            <p className="text-sm font-medium text-purple-600">
                              {application.job.currency === 'INR' ? '₹' : '$'}
                              {application.job.salary_min && application.job.salary_min.toLocaleString()} 
                              {application.job.salary_min && application.job.salary_max && ' - '} 
                              {application.job.salary_max && application.job.salary_max.toLocaleString()}
                              {application.job.salary_period && ` per ${application.job.salary_period}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link 
                            href={`/jobs-portal/job/${application.job?.id}`} 
                            className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => removeApplication(application.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Saved Jobs</h2>
              <Link
                href="/jobs-portal"
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Find More Jobs</span>
              </Link>
            </div>

            {savedJobs.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
                  <p className="text-gray-600 mb-6">Save interesting jobs to apply later</p>
                  <Link
                    href="/jobs-portal"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-sky-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-sky-700 transition-all duration-200"
                  >
                    <Search className="h-4 w-4" />
                    <span>Browse Jobs</span>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {savedJobs.map((job) => (
                  <Card key={job.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {job.job?.title || 'Job Title Unavailable'}
                          </h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{job.job?.company || 'Company Unavailable'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.job?.location || 'Location Unavailable'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{job.job?.job_type || 'Job Type Unavailable'}</span>
                            </div>
                          </div>
                          {(job.job?.salary_min || job.job?.salary_max) && (
                            <p className="text-sm font-medium text-purple-600">
                              {job.job.currency === 'INR' ? '₹' : '$'}
                              {job.job.salary_min && job.job.salary_min.toLocaleString()} 
                              {job.job.salary_min && job.job.salary_max && ' - '} 
                              {job.job.salary_max && job.job.salary_max.toLocaleString()}
                              {job.job.salary_period && ` per ${job.job.salary_period}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/jobs-portal/job/${job.job?.id}`}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-sky-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-sky-700 transition-all duration-200"
                          >
                            Apply Now
                          </Link>
                          <button
                            onClick={() => removeSavedJob(job.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-sky-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-sky-700 transition-all duration-200"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Link>
              </div>
              <div className="text-center text-gray-600">
                <p>Update your profile information, resume, and job preferences</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
