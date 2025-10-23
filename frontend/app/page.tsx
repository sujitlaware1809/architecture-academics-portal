"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  Calendar,
  Users,
  BookOpen,
  Briefcase,
  Trophy,
  FileText,
  MessageSquare,
  Building,
  Wrench,
  Plus,
  ArrowRight,
  Star,
  TrendingUp,
  Award,
  GraduationCap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
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

  const mainSections = [
    { title: "COURSES", icon: BookOpen, description: "Explore architecture courses", color: "bg-slate-800", href: "/courses" },
    { title: "JOBS", icon: Briefcase, description: "Find career opportunities", color: "bg-purple-500", href: isAuthenticated ? "/jobs-portal" : "/login" },
    { title: "EVENTS", icon: Calendar, description: "Upcoming architecture events", color: "bg-purple-500", href: "/events" },
    { title: "BLOGS", icon: FileText, description: "Read architecture articles", color: "bg-blue-500", href: "/blogs" },
    { title: "DISCUSSIONS", icon: MessageSquare, description: "Community Q&A forum", color: "bg-red-500", href: "/discussions" },
    { title: "WORKSHOPS & FDPs", icon: Wrench, description: "Professional development", color: "bg-purple-500", href: "/workshops" },
  ]

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

  // Hardcoded Featured Articles
  const featuredArticles = [
    {
      id: 1,
      title: "Sustainable Architecture: Building for Tomorrow",
      excerpt: "Explore how modern architects are integrating eco-friendly practices and green technologies into contemporary building design. Learn about passive solar design, green roofs, and sustainable materials.",
      author: "Dr. Rajesh Kumar",
      date: "2 days ago",
      category: "Sustainability",
      readTime: "8 min read",
      image: "sustainable",
      slug: "sustainable-architecture-building-tomorrow"
    },
    {
      id: 2,
      title: "The Rise of Parametric Design in Modern Architecture",
      excerpt: "Discover how computational design tools are revolutionizing the way architects approach complex geometries and structural systems. From Grasshopper to algorithmic modeling.",
      author: "Priya Sharma",
      date: "5 days ago",
      category: "Technology",
      readTime: "10 min read",
      image: "parametric",
      slug: "rise-parametric-design-modern-architecture"
    },
    {
      id: 3,
      title: "Indian Vernacular Architecture: Lessons for Today",
      excerpt: "Understanding traditional building techniques from across India and their relevance in contemporary sustainable design. Climate-responsive architecture from our heritage.",
      author: "Arjun Mehta",
      date: "1 week ago",
      category: "Heritage",
      readTime: "12 min read",
      image: "vernacular",
      slug: "indian-vernacular-architecture-lessons"
    },
    {
      id: 4,
      title: "BIM Revolution: Complete Guide for Architects",
      excerpt: "Building Information Modeling is transforming the construction industry. Learn how to leverage Revit, ArchiCAD, and other BIM tools to enhance your workflow and collaboration.",
      author: "Sneha Patel",
      date: "1 week ago",
      category: "Technology",
      readTime: "15 min read",
      image: "bim",
      slug: "bim-revolution-complete-guide-architects"
    }
  ]

  // Hardcoded Popular Discussions
  const popularDiscussions = [
    {
      id: 1,
      title: "Best software for rendering architectural designs?",
      excerpt: "Looking for recommendations on rendering software. Currently using V-Ray but wondering if there are better alternatives for photorealistic renders...",
      author: "Amit Singh",
      replies: 24,
      views: 1250,
      lastActivity: "2 hours ago",
      category: "Software",
      tags: ["Rendering", "3D", "Software"],
      solved: false
    },
    {
      id: 2,
      title: "How to prepare portfolio for architectural firms?",
      excerpt: "I'm a fresh graduate and want to create an impressive portfolio. What should I include? How many projects? Any specific layout recommendations?",
      author: "Neha Reddy",
      replies: 18,
      views: 890,
      lastActivity: "5 hours ago",
      category: "Career",
      tags: ["Portfolio", "Jobs", "Career"],
      solved: true
    },
    {
      id: 3,
      title: "NATA 2025 preparation strategy - Need advice",
      excerpt: "Appearing for NATA next year. What are the best resources for preparation? Should I join coaching or is self-study sufficient?",
      author: "Rohan Gupta",
      replies: 32,
      views: 2100,
      lastActivity: "1 day ago",
      category: "Education",
      tags: ["NATA", "Exam", "Preparation"],
      solved: false
    },
    {
      id: 4,
      title: "Sustainable materials for low-cost housing projects",
      excerpt: "Working on a low-cost housing project and want to incorporate sustainable materials. What are some cost-effective eco-friendly alternatives?",
      author: "Kavya Iyer",
      replies: 15,
      views: 670,
      lastActivity: "1 day ago",
      category: "Design",
      tags: ["Sustainable", "Materials", "Housing"],
      solved: true
    },
    {
      id: 5,
      title: "Freelancing as an architect - Tips and experiences?",
      excerpt: "Thinking of starting freelance architectural practice. Would love to hear from experienced freelancers about challenges, client acquisition, pricing strategies...",
      author: "Vikram Joshi",
      replies: 41,
      views: 1580,
      lastActivity: "3 hours ago",
      category: "Career",
      tags: ["Freelancing", "Business", "Career"],
      solved: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Hero Section - Ultra Modern Design */}
        <div className="mb-12 md:mb-16 relative overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-full shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">India's Leading Architecture Platform</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="font-poppins text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                  Build Your
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent animate-gradient">
                      Future Today
                    </span>
                    <div className="absolute -bottom-2 left-0 w-full h-4 bg-gradient-to-r from-purple-400/30 via-indigo-400/30 to-purple-400/30 blur-xl"></div>
                  </span>
                </h1>
                <div className="w-24 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl font-medium">
                Join <span className="font-bold text-purple-600">10,000+</span> architects shaping the world. 
                Access elite courses, connect with masters, and unlock opportunities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/courses">
                  <Button size="lg" className="group bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-700 text-white px-10 h-14 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto text-lg font-bold hover:scale-105 bg-[length:200%_100%] hover:bg-right">
                    <BookOpen className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Start Learning
                  </Button>
                </Link>
                <Link href="/blogs">
                  <Button size="lg" variant="outline" className="group border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 h-14 rounded-2xl transition-all duration-300 w-full sm:w-auto text-lg font-bold hover:scale-105">
                    <FileText className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Explore Content
                  </Button>
                </Link>
              </div>

              {/* Stats - Modern Cards */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-2xl border border-purple-100 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="font-poppins text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">10K+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-semibold mt-1">Students</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-2xl border border-indigo-100 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="font-poppins text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">500+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-semibold mt-1">Courses</div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-white p-4 rounded-2xl border border-pink-100 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="font-poppins text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">1K+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-semibold mt-1">Jobs</div>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Highlights */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Feature Card 1 */}
                <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white p-6 hover:shadow-lg transition-shadow">
                  <div className="bg-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Expert-Led Courses</h3>
                  <p className="text-sm text-gray-600">Learn from industry professionals with years of experience</p>
                </Card>

                {/* Feature Card 2 */}
                <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 hover:shadow-lg transition-shadow mt-8">
                  <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Career Opportunities</h3>
                  <p className="text-sm text-gray-600">Connect with top firms and find your dream job</p>
                </Card>

                {/* Feature Card 3 */}
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 hover:shadow-lg transition-shadow">
                  <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Active Community</h3>
                  <p className="text-sm text-gray-600">Engage with peers and expand your network</p>
                </Card>

                {/* Feature Card 4 */}
                <Card className="border-2 border-pink-100 bg-gradient-to-br from-pink-50 to-white p-6 hover:shadow-lg transition-shadow mt-8">
                  <div className="bg-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Certifications</h3>
                  <p className="text-sm text-gray-600">Earn recognized certificates to boost your profile</p>
                </Card>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>

        {/* Core Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Platform for Architects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access all the tools and resources you need to thrive in your architecture career
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainSections.map((section, index) => {
              const IconComponent = section.icon
              const colorClasses = {
                'bg-slate-800': { bg: 'bg-slate-800', hover: 'hover:bg-slate-700', text: 'text-slate-600', border: 'border-slate-200' },
                'bg-purple-500': { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', text: 'text-purple-600', border: 'border-purple-200' },
                'bg-blue-500': { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', border: 'border-blue-200' },
                'bg-red-500': { bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600', border: 'border-red-200' },
              }
              const colors = colorClasses[section.color as keyof typeof colorClasses] || colorClasses['bg-purple-500']
              
              return (
                <Link 
                  key={section.title}
                  href={section.href === "#" ? (isAuthenticated ? "#" : "/login") : section.href}
                  className="group"
                >
                  <Card className={`h-full border-2 ${colors.border} hover:border-current hover:${colors.text} transition-all duration-300 hover:shadow-2xl bg-white overflow-hidden`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`${colors.bg} ${colors.hover} w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-md`}>
                          <IconComponent className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 group-hover:${colors.text} transition-colors">
                            {section.title}
                          </CardTitle>
                        </div>
                        <ArrowRight className={`h-5 w-5 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </div>
                      <CardDescription className="text-sm text-gray-600 leading-relaxed">
                        {section.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className={`h-1 w-full ${colors.bg} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                    </CardContent>
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

        {/* Featured Articles Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Articles
              </h2>
              <p className="text-lg text-gray-600">Latest insights from architecture experts</p>
            </div>
            <Link href="/blogs">
              <Button variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredArticles.map((article) => (
              <Link key={article.id} href={`/blogs/${article.slug}`}>
                <Card className="h-full border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-20 w-20 text-purple-300 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-purple-700 border border-purple-200">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <CardDescription className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {article.excerpt}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {article.author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{article.author}</p>
                          <p className="text-xs text-gray-500">{article.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <BookOpen className="h-3 w-3" />
                        {article.readTime}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Discussions Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Popular Discussions
              </h2>
              <p className="text-lg text-gray-600">Join the conversation with fellow architects</p>
            </div>
            <Link href="/discussions">
              <Button variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50">
                View All Discussions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {popularDiscussions.map((discussion) => (
              <Link key={discussion.id} href={`/discussions/${discussion.id}`}>
                <Card className="border-2 border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Discussion Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          discussion.solved 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          <MessageSquare className="h-6 w-6" />
                        </div>
                      </div>

                      {/* Discussion Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                            {discussion.title}
                          </h3>
                          {discussion.solved && (
                            <Badge className="bg-green-100 text-green-700 border border-green-200 flex-shrink-0">
                              ✓ Solved
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {discussion.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {discussion.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-[10px] font-bold">
                                {discussion.author.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium text-gray-700">{discussion.author}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{discussion.replies} replies</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{discussion.views.toLocaleString()} views</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{discussion.lastActivity}</span>
                          </div>

                          <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                            {discussion.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex-shrink-0">
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Community Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">2,450+</div>
                <div className="text-sm text-gray-600">Discussions</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Members</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">850+</div>
                <div className="text-sm text-gray-600">Articles</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </CardContent>
            </Card>
          </div>
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
    </div>
  )
}
