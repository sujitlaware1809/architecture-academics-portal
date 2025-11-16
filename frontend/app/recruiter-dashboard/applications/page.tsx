"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft,
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"

interface Job {
  id: number
  title: string
  company: string
  location: string
  applications_count: number
  status: string
  created_at: string
}

interface Application {
  id: number
  job: Job
  applicant: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  status: string
  applied_at: string
  cover_letter?: string
  resume_url?: string
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800", icon: Clock },
  under_review: { label: "Under Review", className: "bg-blue-100 text-blue-800", icon: Eye },
  interview_scheduled: { label: "Interview Scheduled", className: "bg-purple-100 text-purple-800", icon: AlertCircle },
  accepted: { label: "Accepted", className: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800", icon: XCircle }
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  useEffect(() => {
    const token = api.getStoredToken()
    const userData = api.getStoredUser()
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    // Check if user is a recruiter
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
        const jobs = await response.json()
        setMyJobs(jobs)
        
        // Fetch applications for each job
        await fetchAllApplications(jobs)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllApplications = async (jobs: Job[]) => {
    try {
      const token = api.getStoredToken()
      const allApps: Application[] = []
      
      for (const job of jobs) {
        const response = await fetch(`http://localhost:8000/jobs/${job.id}/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const apps = await response.json()
          // Add job info to each application
          const appsWithJob = apps.map((app: any) => ({
            ...app,
            job: job
          }))
          allApps.push(...appsWithJob)
        }
      }
      
      setAllApplications(allApps)
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const filteredApplications = selectedStatus === "all" 
    ? allApplications 
    : allApplications.filter(app => app.status === selectedStatus)

  const statusCounts = {
    all: allApplications.length,
    pending: allApplications.filter(app => app.status === "pending").length,
    under_review: allApplications.filter(app => app.status === "under_review").length,
    interview_scheduled: allApplications.filter(app => app.status === "interview_scheduled").length,
    accepted: allApplications.filter(app => app.status === "accepted").length,
    rejected: allApplications.filter(app => app.status === "rejected").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-sky-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/recruiter-dashboard"
                className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Applications</h1>
          <p className="text-gray-600">Manage applications across all your job postings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedStatus === "all" 
                ? "border-purple-500 bg-purple-50" 
                : "border-gray-200 hover:border-purple-300"
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">All Applications</div>
          </button>

          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === key 
                    ? "border-purple-500 bg-purple-50" 
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-2xl font-bold text-gray-900">{statusCounts[key as keyof typeof statusCounts]}</div>
                  <Icon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-xs text-gray-600">{config.label}</div>
              </button>
            )
          })}
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedStatus === "all" ? "All Applications" : statusConfig[selectedStatus as keyof typeof statusConfig]?.label}
              {" "}({filteredApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">
                  {selectedStatus === "all" 
                    ? "You haven't received any applications yet."
                    : `No applications with status "${statusConfig[selectedStatus as keyof typeof statusConfig]?.label}"`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const StatusIcon = statusConfig[application.status as keyof typeof statusConfig]?.icon || AlertCircle
                  return (
                    <div 
                      key={application.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.applicant?.first_name} {application.applicant?.last_name}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                              statusConfig[application.status as keyof typeof statusConfig]?.className || "bg-gray-100 text-gray-800"
                            }`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig[application.status as keyof typeof statusConfig]?.label || application.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Briefcase className="h-4 w-4" />
                            <span className="font-medium">{application.job.title}</span>
                            <span className="text-gray-400">•</span>
                            <span>{application.job.company}</span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                            </div>
                            {application.applicant?.email && (
                              <>
                                <span className="text-gray-300">|</span>
                                <a 
                                  href={`mailto:${application.applicant.email}`}
                                  className="text-purple-600 hover:text-purple-800"
                                >
                                  {application.applicant.email}
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                        <Link 
                          href={`/recruiter-dashboard/applications/${application.job.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}