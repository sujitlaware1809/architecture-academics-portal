"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Filter,
  Building,
  Users,
  Plus,
  ChevronDown,
  Heart,
  Bookmark,
  ExternalLink,
  User,
  LogOut
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoginRequiredButton } from "@/components/login-required"
import { api } from "@/lib/api"

// Mock job data - Updated to Indian jobs
const mockJobs = [
  {
    id: 1,
    title: "Senior Architect",
    company: "Architecture Academics",
    location: "Mumbai, India",
    type: "Full-time",
    remote: false,
    salary: "₹8L - ₹12L",
    tags: ["Commercial", "Residential", "AutoCAD"],
    description: "We're looking for a Senior Architect to join our award-winning team in Mumbai. You'll work on prestigious commercial and residential projects...",
    postedDate: "2 days ago",
    logo: "🏢"
  },
  {
    id: 2,
    title: "Interior Designer",
    company: "Creative Spaces Pvt Ltd",
    location: "Delhi, India",
    type: "Full-time",
    remote: false,
    salary: "₹4L - ₹6L",
    tags: ["Interior Design", "3D Visualization", "Space Planning"],
    description: "Join our team focused on creating sustainable indoor spaces. We're looking for creative designers with experience in commercial projects...",
    postedDate: "1 week ago",
    logo: "🎨"
  },
  {
    id: 3,
    title: "BIM Specialist",
    company: "Digital Designs Solutions",
    location: "Remote",
    type: "Contract",
    remote: true,
    salary: "₹50 - ₹80/hour",
    tags: ["BIM", "Revit", "3D Modeling"],
    description: "Remote BIM specialist position for large-scale commercial projects. Experience with Revit and Navisworks required...",
    postedDate: "3 days ago",
    logo: "💻"
  },
  {
    id: 4,
    title: "Project Manager - Architecture",
    company: "BuildRight Engineers",
    location: "Pune, India",
    type: "Full-time",
    remote: false,
    salary: "₹10L - ₹15L",
    tags: ["Project Management", "Leadership", "Construction"],
    description: "Lead architectural projects from concept to completion. Requires 7+ years of experience in construction project management...",
    postedDate: "5 days ago",
    logo: "🏗️"
  },
  {
    id: 5,
    title: "Architectural Intern",
    company: "Future Designs Studio",
    location: "Bangalore, India",
    type: "Internship",
    remote: false,
    salary: "₹15K - ₹25K/month",
    tags: ["Internship", "CAD", "Learning", "Architecture"],
    description: "Exciting internship opportunity for architecture students! Gain hands-on experience working on real projects with our experienced team...",
    postedDate: "1 day ago",
    logo: "🎓"
  },
  {
    id: 6,
    title: "Urban Planner",
    company: "City Development Corp",
    location: "Hyderabad, India",
    type: "Full-time",
    remote: true,
    salary: "₹6.5L - ₹8.5L",
    tags: ["Urban Planning", "GIS", "Community Development"],
    description: "Shape the future of urban development in Hyderabad. Requires experience with GIS software and community engagement...",
    postedDate: "4 days ago",
    logo: "🏙️"
  }
]

const jobCategories = [
  "All Categories",
  "Architecture",
  "Interior Design", 
  "Landscape Architecture",
  "Urban Planning",
  "Project Management",
  "BIM/CAD",
  "Construction",
  "Sustainable Design",
  "Heritage Conservation"
]

const jobTypes = [
  "All Types",
  "Full-time",
  "Part-time", 
  "Contract",
  "Internship",
  "Remote"
]

const locations = [
  "All Locations",
  "Mumbai, India",
  "Delhi, India",
  "Bangalore, India",
  "Pune, India",
  "Hyderabad, India",
  "Chennai, India",
  "Kolkata, India",
  "Ahmedabad, India",
  "Jaipur, India",
  "Lucknow, India",
  "Remote"
]

export default function JobsPortal() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [filteredJobs, setFilteredJobs] = useState(mockJobs)
  const [showFilters, setShowFilters] = useState(false)
  const [savedJobs, setSavedJobs] = useState<number[]>([])
  const [realJobs, setRealJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<number | null>(null)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [applyJobId, setApplyJobId] = useState<number | null>(null)
  const [coverLetterInput, setCoverLetterInput] = useState<string>('')
  const [resumeUrlInput, setResumeUrlInput] = useState<string>('')
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Add this state for refresh
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  useEffect(() => {
    // Check authentication status
    const token = api.getStoredToken()
    const userData = api.getStoredUser()
    
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(userData)
    }

    // Fetch real jobs from backend
    fetchJobs()
    
    // Check if a job was just posted and refresh if needed
    const jobPosted = localStorage.getItem('jobPosted')
    if (jobPosted === 'true') {
      localStorage.removeItem('jobPosted')
      // Small delay to ensure the backend has processed the new job
      setTimeout(() => {
        fetchJobs()
      }, 1000)
    }
  }, [refreshTrigger]) // Add refreshTrigger to dependencies

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/jobs')
      if (response.ok) {
        const data = await response.json()
        setRealJobs(data)
        // Use real jobs if available, otherwise fall back to mock data
        setFilteredJobs(data.length > 0 ? data : mockJobs)
      } else {
        setFilteredJobs(mockJobs)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setFilteredJobs(mockJobs)
    } finally {
      setLoading(false)
    }
  }

  // Add this function to trigger refresh
  const triggerJobRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const openApplyModal = (jobId: number) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    setApplyJobId(jobId)
    setCoverLetterInput('')
    setResumeUrlInput('')
    setResumeFile(null)
    setApplyModalOpen(true)
  }

  const handleApplySubmit = async () => {
    if (!applyJobId) return
    setApplying(applyJobId)
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = api.getStoredToken()
      if (!token) throw new Error('Login required')
      let ok = false
      if (resumeFile) {
        const form = new FormData()
        form.append('cover_letter', coverLetterInput || `I am interested in applying for this position.`)
        form.append('resume_file', resumeFile)
        const res = await fetch(`${base}/jobs/${applyJobId}/apply/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: form
        })
        ok = res.ok
      } else {
        const res = await fetch(`${base}/jobs/${applyJobId}/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            cover_letter: coverLetterInput || `I am interested in applying for this position.`,
            resume_url: resumeUrlInput || undefined,
          })
        })
        ok = res.ok
      }

      if (ok) {
        alert('Application submitted successfully!')
        setApplyModalOpen(false)
      } else {
        alert('Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying for job:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setApplying(null)
    }
  }

  const formatSalary = (job: any) => {
    // If it's a real job from API with min_salary and max_salary
    if (job.min_salary !== undefined && job.max_salary !== undefined) {
      const formatAmount = (amount: number) => {
        if (amount >= 100000) {
          return `₹${(amount / 100000).toFixed(1)}L`
        }
        return `₹${amount.toLocaleString()}`
      }
      return `${formatAmount(job.min_salary)} - ${formatAmount(job.max_salary)}`
    }
    // Fallback to the salary field for mock data
    return job.salary || 'Salary not specified'
  }

  // Update the useEffect for filtering to work with real jobs
  useEffect(() => {
    // Filter jobs based on search and filters
    let jobsToFilter = realJobs.length > 0 ? realJobs : mockJobs

    if (searchQuery) {
      jobsToFilter = jobsToFilter.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.tags && job.tags.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory !== "All Categories") {
      jobsToFilter = jobsToFilter.filter(job =>
        job.tags && job.tags.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    }

    if (selectedType !== "All Types") {
      jobsToFilter = jobsToFilter.filter(job => job.job_type === selectedType)
    }

    if (selectedLocation !== "All Locations") {
      jobsToFilter = jobsToFilter.filter(job => job.location === selectedLocation)
    }

    setFilteredJobs(jobsToFilter)
  }, [searchQuery, selectedCategory, selectedType, selectedLocation, realJobs])

  const handleLogout = async () => {
    await api.logout()
    setIsAuthenticated(false)
    setUser(null)
    router.push("/")
  }

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-mint-50">
      {/* Header/Navbar */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/jobs-portal" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-2 rounded-xl">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JobsPortal</h1>
                <span className="text-xs text-gray-500">Architecture Careers</span>
              </div>
            </Link>

            {/* Combined Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/jobs-portal" className="flex items-center space-x-1.5 text-gray-700 hover:text-blue-600 font-medium transition-colors group">
                <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Jobs</span>
              </Link>
              <Link href="/jobs-portal/post-job" className="flex items-center space-x-1.5 text-gray-700 hover:text-blue-600 font-medium transition-colors group">
                <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Post Job</span>
              </Link>
              {isAuthenticated && (
                <Link href="/jobs-portal/dashboard" className="flex items-center space-x-1.5 text-gray-700 hover:text-blue-600 font-medium transition-colors group">
                  <Briefcase className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Dashboard</span>
                </Link>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/profile"
                    className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.first_name}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:block">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-sky-700 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Dream
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Architecture Job in India
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Discover amazing opportunities in architecture, design, and construction across India. 
            Connect with top companies and build your dream career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-full hover:bg-gray-50 transition-colors shadow-lg"
            >
              Search Jobs
            </button>
            <Link
              href="/jobs-portal/post-job"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-700 transition-colors"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* Search + Filter Bar */}
      <section id="search-section" className="py-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter Dropdowns */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                  >
                    {jobCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Job Listings Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Available Jobs in India ({filteredJobs.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Updated 2 hours ago</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <article key={job.id} className="group cursor-pointer h-full">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Header with Gradient */}
                  <div className="relative p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white shadow-md flex items-center justify-center text-2xl">
                          {job.logo}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium line-clamp-1">{job.company}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className="p-2 hover:bg-white/80 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Bookmark 
                          className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-blue-600 text-blue-600' : 'text-gray-400'}`}
                        />
                      </button>
                    </div>

                    {/* Job Type & Remote Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {job.type}
                      </span>
                      {job.remote && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          🌐 Remote
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Location & Salary */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="line-clamp-1">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
                        <DollarSign className="h-5 w-5 flex-shrink-0" />
                        <span>{formatSalary(job)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3 flex-1">
                      {job.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(() => {
                        let tags: string[] = [];
                        if (typeof job.tags === 'string') {
                          tags = (job.tags as string).split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
                        } else if (Array.isArray(job.tags)) {
                          tags = job.tags as string[];
                        }

                        return (
                          <>
                            {tags.slice(0, 3).map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                            {tags.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                +{tags.length - 3}
                              </span>
                            )}
                          </>
                        )
                      })()}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.postedDate}
                      </span>
                      <LoginRequiredButton 
                        onClick={() => openApplyModal(job.id)}
                        action="apply to jobs"
                        disabled={applying === job.id}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-sky-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <span>
                          {applying === job.id 
                            ? 'Applying...' 
                            : 'Apply'
                          }
                        </span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </LoginRequiredButton>
                    </div>
                  </div>
                </div>
                
                <style jsx>{`
                  .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  }
                  .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  }
                `}</style>
              </article>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </section>

      {applyModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
              Apply for Job
            </h3>
            
            {/* Cover Letter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter <span className="text-red-500">*</span>
              </label>
              <textarea
                value={coverLetterInput}
                onChange={(e) => setCoverLetterInput(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                placeholder="Tell us why you're a great fit for this position..."
                required
              />
            </div>

            {/* Resume File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume (PDF) <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                  required
                />
                {resumeFile && (
                  <p className="mt-2 text-sm text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {resumeFile.name} selected
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">PDF format only, max 10MB</p>
              </div>
            </div>

            {/* Optional Resume URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume URL (Optional)
              </label>
              <input
                type="url"
                value={resumeUrlInput}
                onChange={(e) => setResumeUrlInput(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://drive.google.com/your-resume"
              />
              <p className="mt-1 text-xs text-gray-500">
                Or provide a link to your online resume (LinkedIn, Google Drive, etc.)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button 
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors" 
                onClick={() => {
                  setApplyModalOpen(false)
                  setCoverLetterInput('')
                  setResumeFile(null)
                  setResumeUrlInput('')
                }}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleApplySubmit}
                disabled={!coverLetterInput.trim() || (!resumeFile && !resumeUrlInput)}
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Post Job Button (Mobile) */}
      <Link
        href="/jobs-portal/post-job"
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-200 z-40"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-2 rounded-xl">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">JobsPortal</h1>
                  <span className="text-xs text-gray-400">Architecture Careers</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting talented architects with amazing opportunities worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Jobs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Create Profile</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career Advice</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Salary Guide</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Post Jobs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Find Candidates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Recruitment Tips</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-sm">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
                  <span className="text-sm">t</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-sm">in</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2025 Architecture Academics JobsPortal. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
