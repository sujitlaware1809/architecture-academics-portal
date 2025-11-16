"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Download,
  Eye
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

interface Application {
  id: number
  job_id: number
  user_id: number
  cover_letter: string
  resume_url?: string
  status: string
  applied_at: string
  messages?: string
  job?: {
    id: number
    title: string
    company: string
    location: string
    job_type: string
  }
}

interface Message {
  timestamp: string
  sender: string
  message: string
}

// Application status options
const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string; className: string; icon: any }> = {
    pending: { 
      label: "Pending", 
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: Clock
    },
    under_review: { 
      label: "Under Review", 
      className: "bg-blue-100 text-blue-800 border-blue-300",
      icon: AlertCircle
    },
    interview_scheduled: { 
      label: "Interview Scheduled", 
      className: "bg-purple-100 text-purple-800 border-purple-300",
      icon: Calendar
    },
    accepted: { 
      label: "Accepted", 
      className: "bg-green-100 text-green-800 border-green-300",
      icon: CheckCircle
    },
    rejected: { 
      label: "Rejected", 
      className: "bg-red-100 text-red-800 border-red-300",
      icon: XCircle
    }
  }
  
  return statusMap[status] || { 
    label: status, 
    className: "bg-gray-100 text-gray-800 border-gray-300",
    icon: AlertCircle
  }
}

export default function MyApplicationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [totalMessages, setTotalMessages] = useState(0)

  useEffect(() => {
    const token = api.getStoredToken()
    const userData = api.getStoredUser()
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    fetchMyApplications()
  }, [router])

  const fetchMyApplications = async () => {
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
        
        // Calculate total messages across all applications
        let msgCount = 0
        data.forEach((app: Application) => {
          if (app.messages) {
            try {
              const msgs = JSON.parse(app.messages)
              msgCount += Array.isArray(msgs) ? msgs.length : 0
            } catch (e) {
              // ignore parse errors
            }
          }
        })
        setTotalMessages(msgCount)
        
        // Auto-select first application if available
        if (data.length > 0) {
          selectApplication(data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectApplication = (application: Application) => {
    setSelectedApplication(application)
    
    // Parse messages if available
    if (application.messages) {
      try {
        const parsedMessages: Message[] = JSON.parse(application.messages)
        setMessages(parsedMessages)
      } catch (error) {
        console.error('Error parsing messages:', error)
        setMessages([])
      }
    } else {
      setMessages([])
    }
  }

  const getResumeUrl = (resumeUrl?: string) => {
    if (!resumeUrl) return null
    
    // If it's already a full URL, return as is
    if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
      return resumeUrl
    }
    
    // Otherwise, construct the URL with the backend base
    return `http://localhost:8000${resumeUrl.startsWith('/') ? '' : '/'}${resumeUrl}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-sky-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/profile" className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-white">My Applications</h1>
                <span className="text-sm text-purple-200 font-medium">Track your job applications</span>
              </div>
            </Link>
            
            <Link 
              href="/profile"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-purple-100 hover:text-white transition-colors rounded-full hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Profile</span>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {applications.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-6">You haven't applied to any jobs yet.</p>
              <Link 
                href="/jobs-portal"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Browse Jobs
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Messages Summary Banner */}
            {totalMessages > 0 && (
              <div className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <MessageCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">You have {totalMessages} new message{totalMessages > 1 ? 's' : ''}</h3>
                      <p className="text-purple-100">Recruiters have sent you messages about your applications</p>
                    </div>
                  </div>
                  <Badge className="bg-white text-purple-600 text-lg px-4 py-2 font-bold">
                    {totalMessages}
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Applications list */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-serif">Your Applications</CardTitle>
                  <CardDescription>{applications.length} total applications</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {applications.map((application) => {
                      const statusInfo = getStatusInfo(application.status)
                      const StatusIcon = statusInfo.icon
                      
                      // Parse message count for this application
                      let messageCount = 0
                      if (application.messages) {
                        try {
                          const msgs = JSON.parse(application.messages)
                          messageCount = Array.isArray(msgs) ? msgs.length : 0
                        } catch (e) {
                          messageCount = 0
                        }
                      }
                      
                      return (
                        <div
                          key={application.id}
                          onClick={() => selectApplication(application)}
                          className={`p-4 cursor-pointer transition-all hover:bg-purple-50 ${
                            selectedApplication?.id === application.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 line-clamp-1">
                              {application.job?.title || 'Job Application'}
                            </h4>
                            <StatusIcon className={`h-5 w-5 ${statusInfo.className.split(' ')[1]}`} />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {application.job?.company || 'Company'}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className={`text-xs ${statusInfo.className}`}>
                              {statusInfo.label}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(application.applied_at).toLocaleDateString()}
                            </span>
                          </div>
                          {messageCount > 0 && (
                            <div className="mt-2 flex items-center text-xs text-purple-600 font-medium">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {messageCount} message{messageCount > 1 ? 's' : ''} from recruiter
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Application details */}
            <div className="lg:col-span-2">
              {selectedApplication ? (
                <div className="space-y-6">
                  {/* Job Details Card */}
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl font-serif mb-2">
                            {selectedApplication.job?.title || 'Job Application'}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-gray-600">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {selectedApplication.job?.company || 'Company'}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {selectedApplication.job?.location || 'Location'}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className={`text-sm ${getStatusInfo(selectedApplication.status).className}`}>
                          {getStatusInfo(selectedApplication.status).label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Applied On</h4>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(selectedApplication.applied_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Cover Letter</h4>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                        </div>
                      </div>

                      {selectedApplication.resume_url && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Resume</h4>
                          <div className="flex space-x-3">
                            <a
                              href={getResumeUrl(selectedApplication.resume_url) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Resume</span>
                            </a>
                            <a
                              href={getResumeUrl(selectedApplication.resume_url) || '#'}
                              download
                              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download Resume</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Messages Card - Enhanced */}
                  <Card className={`shadow-xl border-2 ${messages.length > 0 ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-white' : 'border-gray-200 bg-white/80'} backdrop-blur-sm`}>
                    <CardHeader className={messages.length > 0 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg' : ''}>
                      <CardTitle className={`flex items-center justify-between text-xl font-serif ${messages.length > 0 ? 'text-white' : ''}`}>
                        <div className="flex items-center">
                          <MessageCircle className={`h-5 w-5 mr-2 ${messages.length > 0 ? 'text-white' : 'text-purple-600'}`} />
                          Messages from Recruiter
                        </div>
                        {messages.length > 0 && (
                          <Badge className="bg-white text-purple-600 font-bold">
                            {messages.length} message{messages.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className={messages.length > 0 ? 'text-purple-100' : ''}>
                        {messages.length > 0 ? 'Read your messages from the recruiter below' : 'Communication history for this application'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="h-10 w-10 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h4>
                          <p className="text-gray-600">The recruiter will reach out to you here</p>
                          <p className="text-sm text-gray-500 mt-1">Check back later for updates on your application</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                          {messages.map((msg, index) => (
                            <div
                              key={index}
                              className={`p-5 rounded-xl shadow-md ${
                                msg.sender === 'recruiter' 
                                  ? 'bg-gradient-to-r from-purple-100 to-purple-50 border-l-4 border-purple-500' 
                                  : 'bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-blue-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    msg.sender === 'recruiter' ? 'bg-purple-600' : 'bg-blue-600'
                                  }`}>
                                    <span className="text-white text-sm font-bold">
                                      {msg.sender === 'recruiter' ? 'R' : 'Y'}
                                    </span>
                                  </div>
                                  <span className={`text-sm font-bold ${
                                    msg.sender === 'recruiter' ? 'text-purple-700' : 'text-blue-700'
                                  }`}>
                                    {msg.sender === 'recruiter' ? 'Recruiter' : 'You'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-600 font-medium">
                                    {new Date(msg.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">
                                {msg.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="py-16 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Application</h3>
                    <p className="text-gray-600">Choose an application from the list to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}