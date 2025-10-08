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
    setApplyModalOpen(true)
  }

  const handleApplySubmit = async () => {
    if (!applyJobId) return
    setApplying(applyJobId)
    try {
      const response = await api.applyForJob(applyJobId, {
        cover_letter: coverLetterInput || `I am interested in applying for this position.`,
        resume_url: resumeUrlInput || undefined,
      })

      if (response.data) {
        alert('Application submitted successfully!')
        setApplyModalOpen(false)
      } else if (response.error) {
        alert(response.error)
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-mint-50">
      {/* Header/Navbar */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/jobs-portal" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-sky-500 to-purple-600 p-2 rounded-xl">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JobsPortal</h1>
                <span className="text-xs text-gray-500">Architecture Careers</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/jobs-portal" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Jobs
              </Link>
              <Link href="/jobs-portal/post-job" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Post Job
              </Link>
              {isAuthenticated && (
                <Link href="/jobs-portal/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-sky-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.first_name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:block">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-sky-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-sky-700 transition-all duration-200"
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
      <section className="bg-gradient-to-r from-purple-600 via-sky-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Dream
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Architecture Job in India
            </span>
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Discover amazing opportunities in architecture, design, and construction across India. 
            Connect with top companies and build your dream career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-purple-700 font-semibold rounded-full hover:bg-gray-50 transition-colors shadow-lg"
            >
              Search Jobs
            </button>
            <Link
              href="/jobs-portal/post-job"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-purple-700 transition-colors"
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
                  className="pl-12 h-14 text-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
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
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-purple-500"
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
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-purple-500"
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
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-purple-500"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{job.logo}</div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 font-medium">{job.company}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Bookmark 
                        className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-purple-600 text-purple-600' : 'text-gray-400'}`}
                      />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.type}</span>
                    </div>
                  </div>

                  {job.remote && (
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Remote Friendly
                    </div>
                  )}

                  <div className="flex items-center space-x-1 text-lg font-semibold text-purple-600">
                    <DollarSign className="h-5 w-5" />
                    <span>{formatSalary(job)}</span>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      // Parse tags whether backend returns a comma string or an array
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
                              className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              +{tags.length - 3} more
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </CardContent>

                <CardFooter className="pt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{job.postedDate}</span>
                  <button 
                    onClick={() => openApplyModal(job.id)}
                    disabled={applying === job.id}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-sky-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-sky-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>
                      {applying === job.id 
                        ? 'Applying...' 
                        : isAuthenticated 
                          ? 'Apply Now' 
                          : 'Login to Apply'
                      }
                    </span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </CardFooter>
              </Card>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Apply for Job</h3>
            <label className="block text-sm text-gray-700">Cover Letter</label>
            <textarea
              value={coverLetterInput}
              onChange={(e) => setCoverLetterInput(e.target.value)}
              className="w-full border p-2 rounded mb-3"
              rows={5}
            />
            <label className="block text-sm text-gray-700">Resume URL (optional)</label>
            <input
              value={resumeUrlInput}
              onChange={(e) => setResumeUrlInput(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="https://drive.google.com/your-resume"
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setApplyModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={handleApplySubmit}>Submit Application</button>
            </div>
          </div>
        </div>
  )}
      {/* Floating Post Job Button (Mobile) */}
      <Link
        href="/jobs-portal/post-job"
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-gradient-to-r from-purple-600 to-sky-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-200 z-40"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-sky-500 to-purple-600 p-2 rounded-xl">
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
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
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
