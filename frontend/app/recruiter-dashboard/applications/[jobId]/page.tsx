"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"

// Application status options
const applicationStatusOptions = [
  { value: "pending", label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  { value: "under_review", label: "Under Review", className: "bg-blue-100 text-blue-800" },
  { value: "interview_scheduled", label: "Interview Scheduled", className: "bg-purple-100 text-purple-800" },
  { value: "accepted", label: "Accepted", className: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", className: "bg-red-100 text-red-800" }
]

// Get status label and styling by value
const getStatusInfo = (status: string) => {
  return applicationStatusOptions.find(option => option.value === status) || 
    { value: status, label: status, className: "bg-gray-100 text-gray-800" };
}

export default function JobApplications({ params }: { params: Promise<{ jobId: string }> }) {
  // Unwrap the params Promise using React.use()
  const { jobId } = use(params)
  
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [messageError, setMessageError] = useState<string | null>(null)

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
    
    fetchJobDetails()
    fetchApplications()
  }, [router, jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const token = api.getStoredToken()
      const response = await fetch(`http://localhost:8000/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setJob(data)
      } else {
        router.push('/recruiter-dashboard')
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const token = api.getStoredToken()
      const response = await fetch(`http://localhost:8000/jobs/${jobId}/applications`, {
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

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      setStatusUpdateLoading(true)
      const token = api.getStoredToken()
      const response = await fetch(`http://localhost:8000/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        // Update the application status in local state
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ))
        
        if (selectedApplication && selectedApplication.id === applicationId) {
          setSelectedApplication({ ...selectedApplication, status: newStatus })
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating application status:', error)
      return false
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedApplication) return
    
    try {
      setMessageSuccess(null)
      setMessageError(null)
      
      const token = api.getStoredToken()
      
      if (!token) {
        setMessageError("You must be logged in to send messages.")
        return
      }
      
      const response = await fetch(`http://localhost:8000/applications/${selectedApplication.id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })
      
      if (response.ok) {
        setMessageSuccess("Message sent successfully to the applicant!")
        setMessage("")
        // Refresh applications to get updated messages
        fetchApplications()
      } else {
        const errorData = await response.json().catch(() => ({}))
        setMessageError(errorData.detail || "Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error('Error sending message:', error)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setMessageError("Cannot connect to server. Please make sure the backend is running on http://localhost:8000")
      } else {
        setMessageError("Error sending message. Please check your connection and try again.")
      }
    }
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
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
      
      {/* Main content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        {job ? (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="text-gray-600">{job.company} • {job.location}</div>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Applications</h1>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column - Applications list */}
          <div className="w-full lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Applications ({applications.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {applications.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No applications yet</p>
                    </div>
                  ) : (
                    applications.map((application) => (
                      <div 
                        key={application.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          selectedApplication?.id === application.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                        }`}
                        onClick={() => setSelectedApplication(application)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {application.applicant?.first_name} {application.applicant?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.applicant?.email}
                            </div>
                          </div>
                          <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusInfo(application.status).className}`}>
                            {getStatusInfo(application.status).label}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Applied on {new Date(application.applied_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Application details */}
          <div className="w-full lg:w-2/3">
            {selectedApplication ? (
              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Applicant info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Applicant Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <User className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-700">Name</div>
                            <div>
                              {selectedApplication.applicant?.first_name} {selectedApplication.applicant?.last_name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-700">Email</div>
                            <div>{selectedApplication.applicant?.email}</div>
                          </div>
                        </div>
                        {selectedApplication.applicant?.phone && (
                          <div className="flex items-start space-x-3">
                            <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-700">Phone</div>
                              <div>{selectedApplication.applicant?.phone}</div>
                            </div>
                          </div>
                        )}
                        {selectedApplication.applicant?.location && (
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-700">Location</div>
                              <div>{selectedApplication.applicant?.location}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Additional profile info */}
                      {selectedApplication.applicant?.bio && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-700 mb-1">About</div>
                          <p className="text-gray-600">{selectedApplication.applicant.bio}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Application details */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-700">Applied Date</div>
                            <div>{new Date(selectedApplication.applied_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        {selectedApplication.cover_letter && (
                          <div className="flex items-start space-x-3">
                            <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-700">Cover Letter</div>
                              <div className="bg-white border p-4 rounded-md mt-2 text-gray-700 max-h-60 overflow-y-auto">
                                {selectedApplication.cover_letter}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {selectedApplication.resume_url && (
                          <div className="flex items-start space-x-3">
                            <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">Resume</div>
                              <div className="flex flex-col gap-2">
                                <a 
                                  href={selectedApplication.resume_url.startsWith('http') 
                                    ? selectedApplication.resume_url 
                                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${selectedApplication.resume_url}`
                                  } 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                                >
                                  <FileText className="h-4 w-4" />
                                  View Resume
                                </a>
                                <a 
                                  href={selectedApplication.resume_url.startsWith('http') 
                                    ? selectedApplication.resume_url 
                                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${selectedApplication.resume_url}`
                                  } 
                                  download
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Download Resume
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Status update */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Update Application Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {applicationStatusOptions.map(option => (
                          <button 
                            key={option.value}
                            disabled={statusUpdateLoading || selectedApplication.status === option.value}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors 
                              ${selectedApplication.status === option.value 
                                ? `${option.className} border-2 border-gray-400` 
                                : `${option.className} opacity-70 hover:opacity-100`}
                            `}
                            onClick={() => updateApplicationStatus(selectedApplication.id, option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Messaging section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Message Applicant</h3>
                      <div className="space-y-3">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Write a message to the applicant..."
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows={4}
                        />
                        
                        {messageSuccess && (
                          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">{messageSuccess}</span>
                          </div>
                        )}
                        
                        {messageError && (
                          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">{messageError}</span>
                          </div>
                        )}
                        
                        <div>
                          <button
                            onClick={sendMessage}
                            disabled={!message.trim()}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>Send Message</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No application selected</h3>
                  <p className="text-gray-600">
                    {applications.length > 0 
                      ? 'Select an application from the list to view details.'
                      : 'No applications have been submitted for this job yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
