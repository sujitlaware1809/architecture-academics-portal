"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  Search,
  Calendar,
  Users,
  BookOpen,
  Briefcase,
  Trophy,
  FileText,
  MessageSquare,
  Building,
  MapPin,
  Wrench,
  Menu,
  X,
  Plus,
  ArrowRight,
  Star,
  TrendingUp,
  Award,
  GraduationCap,
  Sparkles
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ArchitecturePlatform() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = api.isAuthenticated()
      setIsAuthenticated(authenticated)
      if (authenticated) {
        const userData = api.getStoredUser()
        setUser(userData)
      }
    }

    checkAuth()
  }, [])

  const navigationItems = [
    { name: "Home", href: "/", active: true },
    { name: "Courses", href: "/courses", active: false },
    ...(isAuthenticated ? [
      { name: "Jobs Portal", href: "/jobs-portal" },
      { name: "Profile", href: "/profile" },
      ...(user && user.role === 'ADMIN' ? [{ name: "Admin Dashboard", href: "/admin" }] : []),
      { name: "Logout", href: "#", onClick: () => { api.logout(); setIsAuthenticated(false); setUser(null); } }
    ] : [
      { name: "Login", href: "/login" },
      { name: "Register", href: "/register" }
    ]),
    { name: "Contact Us", href: "/contact-us", active: false },
    { name: "Advertise With Us", href: "/advertise-with-us", active: false },
  ]

  const mainSections = [
    { title: "COURSES", icon: BookOpen, description: "Explore architecture courses", color: "bg-slate-800", href: "/courses" },
    { title: "JOBS", icon: Briefcase, description: "Find career opportunities", color: "bg-purple-500", href: isAuthenticated ? "/jobs-portal" : "/login" },
    { title: "EVENTS", icon: Calendar, description: "Upcoming architecture events", color: "bg-purple-500", href: "/events" },
    { title: "BLOGS", icon: FileText, description: "Read architecture articles", color: "bg-blue-500", href: "/blogs" },
    { title: "DISCUSSIONS", icon: MessageSquare, description: "Community Q&A forum", color: "bg-red-500", href: "/discussions" },
    { title: "WORKSHOPS & FDPs", icon: Wrench, description: "Professional development", color: "bg-purple-500", href: "/workshops" },
  ]

  // Add Post Job section for recruiters
  const recruiterSections = isAuthenticated && user && user.role === 'RECRUITER' ? [
    { title: "POST JOB", icon: Plus, description: "Post a new job opportunity", color: "bg-green-500", href: "/jobs-portal/post-job" },
  ] : []

  const secondarySections = [
    { title: "SURVEYS", icon: Users, description: "Community surveys", color: "bg-yellow-500", href: "#" },
    { title: "COMPETITIONS", icon: Trophy, description: "Design competitions", color: "bg-blue-500", href: "#" },
    { title: "CONTEXTUAL STUDY", icon: Building, description: "Urban & rural architecture studies", color: "bg-cyan-500", href: "#" },
    { title: "NATA COURSES", icon: BookOpen, description: "National Aptitude Test preparation", color: "bg-orange-500", href: "#" },
    { title: "PUBLICATIONS", icon: FileText, description: "Research & publications", color: "bg-green-500", href: "#" },
  ]

  const allContent = [
    ...mainSections.map((s) => s.title),
    ...secondarySections.map((s) => s.title),
    "Architecture Tours",
    "NATA Courses",
    "Networking",
    "Sustainable Design",
    "BIM Software",
    "CAD Training",
    "Portfolio Development",
    "Internships",
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const filtered = allContent.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      setSearchResults(filtered.slice(0, 5)) // Show max 5 results
    } else {
      setSearchResults([])
    }
  }

  const footerLinks = [
    "Architecture Tours",
    "Architecture Stationaries",
    "NATA Courses",
    "Networking & Collaboration",
    "Tests Schedule",
    "Feedback",
    "CoA Portal",
    "IIA Portal",
    "Interview with Architects",
    "Advertise with us",
    "Terms & Conditions",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-purple-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-purple-600 to-indigo-600 p-2.5 rounded-xl">
                  <Building className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Architecture
                </h1>
                <span className="text-sm text-gray-600 font-medium">Academics Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => (
                item.onClick ? (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                      item.active 
                        ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md" 
                        : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              {/* Desktop Search */}
              <div className="relative ml-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses, jobs..."
                  className="pl-10 w-64 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-purple-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between group"
                        onClick={() => {
                          setSearchQuery(result)
                          setSearchResults([])
                        }}
                      >
                        <span>{result}</span>
                        <ArrowRight className="h-4 w-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white rounded-xl mt-2 mb-4 border border-gray-200 shadow-lg">
              <div className="px-4 py-3 space-y-3">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                
                {/* Mobile Navigation Links */}
                <div className="space-y-2 pt-2">
                  {navigationItems.map((item) => (
                    item.onClick ? (
                      <button
                        key={item.name}
                        onClick={() => { item.onClick!(); setIsMobileMenuOpen(false); }}
                        className="block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          item.active 
                            ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600" 
                            : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {searchQuery && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-sm text-gray-700 flex items-center gap-2">
              <Search className="h-4 w-4 text-purple-600" />
              Search results for: <span className="font-semibold text-purple-700">"{searchQuery}"</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-20 relative">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Welcome to Architecture Academics</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Shape Your{" "}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Architecture Career
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover world-class courses, connect with industry professionals, explore exciting job opportunities, 
            and advance your architecture career on India's premier platform
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Courses
              </Button>
            </Link>
            <Link href={isAuthenticated ? "/jobs-portal" : "/login"}>
              <Button variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg rounded-xl transition-all duration-300">
                <Briefcase className="mr-2 h-5 w-5" />
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>

        {/* Primary Sections */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Explore Our Platform
              </h3>
              <p className="text-gray-600">Everything you need to succeed in architecture</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {mainSections.map((section, index) => {
              const IconComponent = section.icon
              return (
                <Link 
                  key={section.title}
                  href={section.href === "#" ? (isAuthenticated ? "#" : "/login") : section.href}
                  className="group"
                >
                  <Card className="h-full border-2 border-gray-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50">
                    <CardHeader className="text-center pb-4 space-y-4">
                      <div className="relative mx-auto w-fit">
                        <div className={`absolute inset-0 ${section.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                        <div
                          className={`relative w-20 h-20 rounded-2xl ${section.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                        >
                          <IconComponent className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <CardDescription className="text-sm text-center text-gray-600">
                        {section.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="justify-center pt-0">
                      <Button 
                        variant="ghost" 
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium group-hover:gap-2 transition-all"
                      >
                        {section.title === "COURSES" ? "Explore" : 
                         section.title === "JOBS" ? (isAuthenticated ? "View Jobs" : "Login to Access") : 
                         section.href === "#" ? (isAuthenticated ? "Coming Soon" : "Login") : 
                         (isAuthenticated ? "Explore" : "Login")}
                        <ArrowRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recruiter Sections (only shown to recruiters) */}
        {recruiterSections.length > 0 && (
          <div className="mb-16">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-3 rounded-xl">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Recruiter Actions</h3>
                    <p className="text-sm text-gray-600">Post and manage job opportunities</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recruiterSections.map((section) => {
                  const IconComponent = section.icon
                  return (
                    <Link key={section.title} href={section.href} className="group">
                      <Card className="h-full border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg bg-white">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl ${section.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              <IconComponent className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                {section.title}
                              </CardTitle>
                              <CardDescription className="text-sm text-gray-600 mt-1">
                                {section.description}
                              </CardDescription>
                            </div>
                            <ArrowRight className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Secondary Sections */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                More Features
              </h3>
              <p className="text-gray-600">Additional resources to enhance your learning</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {secondarySections.map((section) => {
              const IconComponent = section.icon
              return (
                <Link 
                  key={section.title}
                  href={section.href === "#" ? (isAuthenticated ? "#" : "/login") : section.href}
                  className="group"
                >
                  <Card className="h-full border-2 border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white">
                    <CardHeader className="text-center pb-4 space-y-4">
                      <div className="relative mx-auto w-fit">
                        <div
                          className={`w-16 h-16 rounded-xl ${section.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}
                        >
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-sm font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <CardDescription className="text-xs text-center text-gray-600">
                        {section.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="justify-center pt-0">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium text-xs group-hover:gap-1 transition-all"
                      >
                        {section.href === "#" ? (isAuthenticated ? "Coming Soon" : "Login") : 
                         (isAuthenticated ? "Explore" : "Login")}
                        <ArrowRight className="h-3 w-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Featured Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Card className="lg:col-span-2 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                  Latest Updates
                </CardTitle>
                <Badge className="bg-purple-600 text-white">New</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer">
                  <div className="relative w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex-shrink-0 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Award className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      Sustainable Architecture Trends 2025
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      Exploring the latest innovations in eco-friendly building design and green construction practices...
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                
                <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer">
                  <div className="relative w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex-shrink-0 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Wrench className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      Digital Design Tools Workshop
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      Master the latest CAD and BIM software in our intensive hands-on workshop...
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                        <Calendar className="h-3 w-3 mr-1" />
                        Workshop
                      </Badge>
                      <span className="text-xs text-gray-500">5 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                Platform Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <Link href="/courses" className="group block">
                  <div className="flex justify-between items-center p-4 rounded-xl hover:bg-purple-50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Active Courses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-3xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">127</span>
                      <ArrowRight className="h-4 w-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>

                <div className="flex justify-between items-center p-4 rounded-xl hover:bg-purple-50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Job Listings</span>
                  </div>
                  <span className="font-bold text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">89</span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl hover:bg-purple-50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Events</span>
                  </div>
                  <span className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">23</span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl hover:bg-purple-50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Members</span>
                  </div>
                  <span className="font-bold text-3xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">2.4k</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <div className="mb-16">
          <Card className="border-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <CardContent className="relative py-12 px-6 md:py-16 md:px-12">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <GraduationCap className="h-5 w-5" />
                  <span className="text-sm font-medium">Join Our Community</span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of architecture professionals and students who are already advancing their careers with us
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {!isAuthenticated ? (
                    <>
                      <Link href="/register">
                        <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                          <Users className="mr-2 h-5 w-5" />
                          Get Started Free
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl transition-all duration-300">
                          Sign In
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link href="/profile">
                      <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <Users className="mr-2 h-5 w-5" />
                        View Your Profile
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Footer Top */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-xl">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Architecture
                  </h3>
                  <span className="text-xs text-gray-600 font-medium">Academics</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                India's premier platform for architecture education, career growth, and professional networking.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-lg">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg">
                  <Users className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg">
                  <Building className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/courses" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                  Courses
                </Link>
                <Link href="/events" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                  Events
                </Link>
                <Link href="/workshops" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                  Workshops
                </Link>
                <Link href={isAuthenticated ? "/jobs-portal" : "/login"} className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                  Jobs Portal
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
              <div className="space-y-2">
                {["NATA Courses", "Architecture Tours", "CoA Portal", "IIA Portal"].map((link, index) => (
                  <a key={index} href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="/contact-us" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                  Contact Us
                </Link>
                <Link href="/advertise-with-us" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                  Advertise With Us
                </Link>
                <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                  Terms & Conditions
                </a>
                <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-gray-300">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600 text-center md:text-left">
                © 2025 Architecture Academics. All rights reserved. Empowering the next generation of architects.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {["Privacy", "Terms", "Cookies", "Accessibility"].map((item, index) => (
                  <a key={index} href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
