"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import "./workshops.css"
import { 
  Search, 
  BookOpen, 
  Filter, 
  X,
  Sliders,
  GraduationCap,
  Calendar,
  AlertCircle,
  RefreshCw,
  User,
  Award
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { WorkshopCard, Workshop } from "@/components/workshops/workshop-card"
import { WorkshopDetailModal } from "@/components/workshops/workshop-detail-modal"
import { EmptyState } from "@/components/workshops/empty-state"
import { api } from "@/lib/api"

export default function WorkshopsPortal() {
  // State management
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([])
  const [filteredFDPs, setFilteredFDPs] = useState<Workshop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  
  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    price: "",
    trainer: ""
  })

  // Fetch workshops from API
  useEffect(() => {
    const fetchWorkshops = async () => {
      setIsLoading(true)
      try {
        const response = await api.get('/workshops')
        if (response.data) {
          setWorkshops(response.data)
          setFilteredWorkshops(response.data.filter((w: Workshop) => !w.isFDP))
          setFilteredFDPs(response.data.filter((w: Workshop) => w.isFDP))
        }
      } catch (error) {
        console.error('Error fetching workshops:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchWorkshops()
  }, [])

  // Handle search and filtering
  useEffect(() => {
    // Filter workshops (non-FDPs)
    let filteredW = workshops.filter(w => !w.isFDP)
    let filteredF = workshops.filter(w => w.isFDP)

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      
      filteredW = filteredW.filter(workshop => 
        workshop.title.toLowerCase().includes(query) ||
        workshop.description.toLowerCase().includes(query) ||
        workshop.trainer?.name.toLowerCase().includes(query) ||
        workshop.category?.toLowerCase().includes(query)
      )
      
      filteredF = filteredF.filter(workshop => 
        workshop.title.toLowerCase().includes(query) ||
        workshop.description.toLowerCase().includes(query) ||
        workshop.trainer?.name.toLowerCase().includes(query) ||
        workshop.category?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (filters.category) {
      filteredW = filteredW.filter(workshop => 
        workshop.category?.toLowerCase() === filters.category.toLowerCase()
      )
      
      filteredF = filteredF.filter(workshop => 
        workshop.category?.toLowerCase() === filters.category.toLowerCase()
      )
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      filteredW = filteredW.filter(workshop => 
        workshop.difficulty?.toLowerCase() === filters.difficulty.toLowerCase()
      )
      
      filteredF = filteredF.filter(workshop => 
        workshop.difficulty?.toLowerCase() === filters.difficulty.toLowerCase()
      )
    }

    // Apply price filter
    if (filters.price) {
      if (filters.price === "free") {
        filteredW = filteredW.filter(workshop => workshop.price === 0)
        filteredF = filteredF.filter(workshop => workshop.price === 0)
      } else if (filters.price === "paid") {
        filteredW = filteredW.filter(workshop => workshop.price !== 0)
        filteredF = filteredF.filter(workshop => workshop.price !== 0)
      }
    }

    // Apply trainer filter
    if (filters.trainer) {
      filteredW = filteredW.filter(workshop => 
        workshop.trainer?.name.toLowerCase().includes(filters.trainer.toLowerCase())
      )
      
      filteredF = filteredF.filter(workshop => 
        workshop.trainer?.name.toLowerCase().includes(filters.trainer.toLowerCase())
      )
    }

    // Filter by Active Tab (Upcoming vs Past)
    const now = new Date()
    if (activeTab === "upcoming") {
      filteredW = filteredW.filter(w => new Date(w.date) >= now)
      filteredF = filteredF.filter(w => new Date(w.date) >= now)
    } else {
      filteredW = filteredW.filter(w => new Date(w.date) < now)
      filteredF = filteredF.filter(w => new Date(w.date) < now)
    }

    setFilteredWorkshops(filteredW)
    setFilteredFDPs(filteredF)
  }, [searchQuery, filters, workshops, activeTab])

  // Handle opening workshop details
  const openWorkshopDetails = (workshop: Workshop) => {
    setSelectedWorkshop(workshop)
    setShowDetailModal(true)
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setFilters({
      category: "",
      difficulty: "",
      price: "",
      trainer: ""
    })
  }

  // Get all unique categories from workshops
  const categories = [...new Set(workshops.map(w => w.category).filter(Boolean))] as string[]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 text-center hero-section">
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Upgrade Your Skills with Hands-on Workshops</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join expert-led workshops and faculty development programs designed to enhance your architectural knowledge and teaching skills
          </p>
          <button
            className="cta-button"
            onClick={() => document.getElementById('workshops-listing')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Join Now
          </button>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="max-w-7xl mx-auto px-4 py-8 -mt-8 z-10 relative">
        <div className="bg-white rounded-xl shadow-xl p-6 search-card">
          {/* Tabs for Upcoming/Past */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
                activeTab === "upcoming"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Upcoming Workshops
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
                activeTab === "past"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Past Workshops
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                type="text"
                placeholder="Search workshops by title, trainer, or category..."
                className="pl-10 h-12 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* Filter Label */}
              <div className="flex items-center text-sm text-gray-500 mr-1">
                <Sliders className="h-4 w-4 mr-1" />
                <span>Filters:</span>
              </div>
              
              {/* Category Filter */}
              <div className="relative min-w-[150px]">
                <select
                  className="filter-select"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="relative min-w-[150px]">
                <select
                  className="filter-select"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Price Filter */}
              <div className="relative min-w-[150px]">
                <select
                  className="filter-select"
                  value={filters.price}
                  onChange={(e) => setFilters({...filters, price: e.target.value})}
                >
                  <option value="">Any Price</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {/* Trainer Filter */}
              <div className="relative min-w-[150px]">
                <input
                  type="text"
                  placeholder="Trainer Name"
                  className="filter-select"
                  value={filters.trainer}
                  onChange={(e) => setFilters({...filters, trainer: e.target.value})}
                />
                {filters.trainer && (
                  <button 
                    onClick={() => setFilters({...filters, trainer: ""})}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Reset Button - only show if filters are applied */}
              {(filters.category || filters.difficulty || filters.price || filters.trainer || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="h-12 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center gap-1 transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(filters.category || filters.difficulty || filters.price || filters.trainer || searchQuery) && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Active filters:</span>
              
              {searchQuery && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.category && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                  Category: {filters.category}
                  <button onClick={() => setFilters({...filters, category: ""})} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.difficulty && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
                  Level: {filters.difficulty}
                  <button onClick={() => setFilters({...filters, difficulty: ""})} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.price && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center gap-1">
                  Price: {filters.price === "free" ? "Free" : "Paid"}
                  <button onClick={() => setFilters({...filters, price: ""})} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.trainer && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                  Trainer: {filters.trainer}
                  <button onClick={() => setFilters({...filters, trainer: ""})} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              <button 
                onClick={resetFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Workshops Listing */}
      <section id="workshops-listing" className="max-w-7xl mx-auto px-4 workshops-section">
        <div className="flex justify-between items-center mb-8">
          <h2 className="section-title">Upcoming Workshops</h2>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <p className="text-gray-600">
              {filteredWorkshops.length} workshop{filteredWorkshops.length !== 1 ? 's' : ''} available
              {searchQuery || filters.category || filters.difficulty || filters.price || filters.trainer ? 
                ` (filtered from ${workshops.filter(w => !w.isFDP).length})` : ''}
            </p>
          </div>
        </div>

        {filteredWorkshops.length === 0 ? (
          <EmptyState 
            title="No workshops found" 
            message="Try adjusting your filters or search terms to find workshops that match your interests."
            icon={<Calendar className="h-10 w-10 text-blue-400" />}
            resetFilters={resetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => (
              <WorkshopCard 
                key={workshop.id} 
                workshop={workshop}
                onViewDetails={openWorkshopDetails}
              />
            ))}
          </div>
        )}
      </section>

      {/* FDP Section */}
      <section className="fdp-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="section-title">Faculty Development Programs</h2>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              <p className="text-gray-600">
                {filteredFDPs.length} FDP{filteredFDPs.length !== 1 ? 's' : ''} available
                {searchQuery || filters.category || filters.difficulty || filters.price || filters.trainer ? 
                  ` (filtered from ${workshops.filter(w => w.isFDP).length})` : ''}
              </p>
            </div>
          </div>

          {filteredFDPs.length === 0 ? (
            <EmptyState 
              title="No FDPs found" 
              message="Try adjusting your filters or search terms to find Faculty Development Programs that match your interests."
              icon={<GraduationCap className="h-10 w-10 text-indigo-400" />}
              resetFilters={resetFilters}
              isForFdp={true}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFDPs.map((workshop) => (
                <WorkshopCard 
                  key={workshop.id} 
                  workshop={workshop}
                  onViewDetails={openWorkshopDetails}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 mt-16 bg-gradient-to-r from-blue-100 to-cyan-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" 
               style={{
                 backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236b46c1' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
               }}
          ></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="px-4 py-1 bg-white/60 text-blue-700 rounded-full text-sm font-medium inline-block mb-4">
            Custom Programs Available
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Looking for Custom Workshops or FDPs?</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
            We offer tailored workshops and faculty development programs for institutions and organizations. Our team of experts can design specialized training solutions to meet your specific educational goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="cta-button">
              Request Custom Program
            </button>
            <button className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-full hover:bg-gray-100 transition-colors">
              Learn More
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customized Curriculum</h3>
              <p className="text-gray-600 text-sm">
                Tailored content based on your institution's specific requirements and learning objectives
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Trainers</h3>
              <p className="text-gray-600 text-sm">
                Learn from industry leaders and academic experts with extensive practical experience
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Certification</h3>
              <p className="text-gray-600 text-sm">
                Provide participants with recognized certifications to enhance their professional portfolios
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Detail Modal */}
      {showDetailModal && selectedWorkshop && (
        <WorkshopDetailModal 
          workshop={selectedWorkshop} 
          onClose={() => setShowDetailModal(false)} 
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Architecture Academics</h3>
            <p className="text-gray-400 mb-4">
              Empowering architects and educators through knowledge sharing and skill development
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-500 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-500 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-500 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/workshops" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">Workshops</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">Events</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">Courses</Link></li>
              <li><Link href="/jobs-portal" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">Jobs</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">Login</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">Register</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact & Support</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Education Way, City, Country</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>workshops@architectureacademics.com</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+1 (123) 456-7890</span>
              </li>
              <li>
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Architecture Academics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

