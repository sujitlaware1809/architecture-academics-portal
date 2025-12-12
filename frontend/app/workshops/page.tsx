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
  const [showAllUpcoming, setShowAllUpcoming] = useState(false)
  const [showAllPast, setShowAllPast] = useState(false)
  
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

    setFilteredWorkshops(filteredW)
    setFilteredFDPs(filteredF)
  }, [searchQuery, filters, workshops])

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

  // Split workshops into upcoming and past (combine workshops and FDPs)
  const now = new Date()
  const allFiltered = [...filteredWorkshops, ...filteredFDPs]
  const upcomingAll = allFiltered.filter(w => new Date(w.date) >= now)
  const pastAll = allFiltered.filter(w => new Date(w.date) < now)
  
  // Apply view limits
  const upcomingToShow = showAllUpcoming ? upcomingAll : upcomingAll.slice(0, 6)
  const pastToShow = showAllPast ? pastAll : pastAll.slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-12 px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-green-900 via-emerald-800 to-black opacity-95"></div>
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-5 left-5 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply filter blur-2xl"></div>
          <div className="absolute bottom-5 right-5 w-32 h-32 bg-green-500 rounded-full mix-blend-multiply filter blur-2xl"></div>
          <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-teal-400 rounded-full mix-blend-multiply filter blur-2xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            Upgrade Your <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">Skills</span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-100 mb-6 max-w-2xl mx-auto">
            Master hands-on workshops and faculty development programs led by industry experts
          </p>
          
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm flex items-center gap-2"
              onClick={() => document.getElementById('upcoming-workshops')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <BookOpen className="h-4 w-4" />
              Upcoming Programs
            </button>
            <button
              className="px-6 py-2 bg-black/40 backdrop-blur-sm border border-emerald-400/50 text-white font-semibold rounded-full hover:bg-black/60 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
              onClick={() => document.getElementById('past-workshops')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Past Programs
            </button>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="max-w-7xl mx-auto px-4 py-8 -mt-12 z-10 relative">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-500" />
            Search & Filter Workshops
          </h3>
          
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <Input 
                type="text"
                placeholder="Search workshops by title, trainer, or category..."
                className="pl-12 h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-gray-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Category Filter */}
              <div className="relative">
                <select
                  className="h-14 px-4 border-2 border-gray-200 focus:border-blue-500 rounded-lg bg-white text-gray-700 font-medium cursor-pointer appearance-none pr-10"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <select
                  className="h-14 px-4 border-2 border-gray-200 focus:border-blue-500 rounded-lg bg-white text-gray-700 font-medium cursor-pointer appearance-none pr-10"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
              </div>

              {/* Price Filter */}
              <div className="relative">
                <select
                  className="h-14 px-4 border-2 border-gray-200 focus:border-blue-500 rounded-lg bg-white text-gray-700 font-medium cursor-pointer appearance-none pr-10"
                  value={filters.price}
                  onChange={(e) => setFilters({...filters, price: e.target.value})}
                >
                  <option value="">Any Price</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
              </div>

              {/* Trainer Filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Trainer Name"
                  className="h-14 px-4 border-2 border-gray-200 focus:border-blue-500 rounded-lg text-gray-700 font-medium"
                  value={filters.trainer}
                  onChange={(e) => setFilters({...filters, trainer: e.target.value})}
                />
                {filters.trainer && (
                  <button 
                    onClick={() => setFilters({...filters, trainer: ""})}
                    className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Reset Button - only show if filters are applied */}
              {(filters.category || filters.difficulty || filters.price || filters.trainer || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="h-14 px-6 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 border-2 border-gray-200"
                >
                  <RefreshCw size={18} />
                  Reset
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

      {/* Workshops & FDPs Listing */}
      <section id="workshops-listing" className="max-w-7xl mx-auto px-4 workshops-section py-12">
        {/* Upcoming Workshops & FDPs */}
        <div id="upcoming-workshops" className="mb-20">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-emerald-500" />
                Upcoming Workshops & Faculty Development Programs
              </h2>
              <p className="text-gray-600 mt-2 text-lg">
                {upcomingAll.length} workshop{upcomingAll.length !== 1 ? 's' : ''} and FDP{upcomingAll.length !== 1 ? 's' : ''} available for registration
              </p>
            </div>
          </div>

          {upcomingAll.length === 0 ? (
            <EmptyState 
              title="No upcoming programs found" 
              message="Try adjusting your filters or search terms to find workshops and FDPs that match your interests."
              icon={<Calendar className="h-10 w-10 text-blue-400" />}
              resetFilters={resetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingToShow.map((workshop) => (
                  <WorkshopCard 
                    key={workshop.id} 
                    workshop={workshop}
                    onViewDetails={openWorkshopDetails}
                  />
                ))}
              </div>
              {upcomingAll.length > 6 && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {showAllUpcoming ? (
                      <>
                        Show Less
                        <X className="h-5 w-5" />
                      </>
                    ) : (
                      <>
                        View All {upcomingAll.length} Workshops & FDPs
                        <BookOpen className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Past Workshops & FDPs */}
        <div id="past-workshops">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-600 flex items-center gap-3">
                <Award className="h-8 w-8 text-gray-400" />
                Past Workshops & Faculty Development Programs
              </h2>
              <p className="text-gray-500 mt-2 text-lg">
                {pastAll.length} workshop{pastAll.length !== 1 ? 's' : ''} and FDP{pastAll.length !== 1 ? 's' : ''} previously conducted
              </p>
            </div>
          </div>

          {pastAll.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600">No past programs found</h3>
              <p className="text-gray-500 mt-2 text-lg">Check back soon for program archives and recordings</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75">
                {pastToShow.map((workshop) => (
                  <WorkshopCard 
                    key={workshop.id} 
                    workshop={workshop}
                    onViewDetails={openWorkshopDetails}
                  />
                ))}
              </div>
              {pastAll.length > 6 && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setShowAllPast(!showAllPast)}
                    className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {showAllPast ? (
                      <>
                        Show Less
                        <X className="h-5 w-5" />
                      </>
                    ) : (
                      <>
                        View All {pastAll.length} Workshops & FDPs
                        <BookOpen className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
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

