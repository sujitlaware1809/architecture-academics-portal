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
  Mic
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HeroSlider } from "@/components/hero-slider"
import { DiscussionMarquee } from "@/components/discussion-marquee"
import { FeatureCards } from "@/components/feature-cards"
import { ArticleMarquee } from "@/components/article-marquee"

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
    { title: "JOBS", icon: Briefcase, description: "Find career opportunities", color: "bg-blue-500", href: "/jobs-portal" },
    { title: "EVENTS", icon: Calendar, description: "Upcoming architecture events", color: "bg-blue-500", href: "/events" },
    { title: "EXPERT TALK", icon: Mic, description: "Learn from industry experts", color: "bg-blue-500", href: "/expert-talk" },
    { title: "DISCUSSIONS", icon: MessageSquare, description: "Community Q&A forum", color: "bg-red-500", href: "/discussions" },
    { title: "WORKSHOPS & FDPs", icon: Wrench, description: "Professional development", color: "bg-blue-500", href: "/workshops" },
  ]

  const recruiterSections = isAuthenticated && user && user.role === 'RECRUITER' ? [
    { title: "POST JOB", icon: Plus, description: "Post a new job opportunity", color: "bg-green-500", href: "/jobs-portal/post-job" },
  ] : []

  const secondarySections = [
    { title: "SURVEYS", icon: Users, description: "Community surveys", color: "bg-yellow-500", href: "#", count: "0" },
    { title: "COMPETITIONS", icon: Trophy, description: "Design competitions", color: "bg-blue-500", href: "#", count: "0" },
    { title: "CONTEXTUAL STUDY", icon: Building, description: "Urban & rural architecture studies", color: "bg-cyan-500", href: "#", count: "0" },
    { title: "NATA COURSES", icon: GraduationCap, description: "National Aptitude Test preparation", color: "bg-orange-500", href: "/nata-courses", count: "0" },
    { title: "PUBLICATIONS", icon: FileText, description: "Research & publications", color: "bg-green-500", href: "#", count: "0" },
  ]

  // State for dynamic data
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([])
  const [popularDiscussions, setPopularDiscussions] = useState<any[]>([])
  const [loadingBlogs, setLoadingBlogs] = useState(true)
  const [loadingDiscussions, setLoadingDiscussions] = useState(true)

  // Fetch featured articles from backend
  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs?is_featured=true&limit=4`)
        if (response.ok) {
          const data = await response.json()
          setFeaturedArticles(data)
        } else {
          console.warn('Failed to fetch featured articles, using fallback')
          // Fallback data if backend is unavailable
          setFeaturedArticles([
            {
              id: 1,
              title: "Sustainable Architecture: Building for Tomorrow",
              excerpt: "Explore how modern architects are integrating eco-friendly practices and green technologies into contemporary building design.",
              author: "Dr. Rajesh Kumar",
              created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
              category: "Sustainability",
              estimated_read_time: 8,
              featured_image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop&auto=format&q=80",
              slug: "sustainable-architecture-building-tomorrow"
            },
            {
              id: 2,
              title: "The Rise of Parametric Design in Modern Architecture",
              excerpt: "Discover how computational design tools are revolutionizing the way architects approach complex geometries and structural systems.",
              author: "Priya Sharma",
              created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
              category: "Technology",
              estimated_read_time: 10,
              featured_image: "https://images.unsplash.com/photo-1518780664697-55e3ad13c0c6?w=400&h=300&fit=crop&auto=format&q=80",
              slug: "rise-parametric-design-modern-architecture"
            },
            {
              id: 3,
              title: "Biophilic Design: Bringing Nature Into Architecture",
              excerpt: "Understanding how architects are incorporating natural elements and patterns into built environments for enhanced well-being.",
              author: "Dr. Meera Singh",
              created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
              category: "Design Trends",
              estimated_read_time: 7,
              featured_image: "https://images.unsplash.com/photo-1511818966892-d5d671fb5ffe?w=400&h=300&fit=crop&auto=format&q=80",
              slug: "biophilic-design-bringing-nature-architecture"
            },
            {
              id: 4,
              title: "Smart Buildings: The Future of Urban Development",
              excerpt: "Exploring IoT integration and intelligent systems that are transforming how we design and manage modern buildings.",
              author: "Arjun Patel",
              created_at: new Date(Date.now() - 10*24*60*60*1000).toISOString(),
              category: "Technology",
              estimated_read_time: 9,
              featured_image: "https://images.unsplash.com/photo-1486406146700-532a9ca61417?w=400&h=300&fit=crop&auto=format&q=80",
              slug: "smart-buildings-future-urban-development"
            }
          ])
        }
      } catch (error) {
        console.error('Error fetching featured articles:', error)
        setFeaturedArticles([])
      } finally {
        setLoadingBlogs(false)
      }
    }

    fetchFeaturedArticles()
  }, [])

  // Fetch popular discussions from backend
  useEffect(() => {
    const fetchPopularDiscussions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions?limit=10`)
        if (response.ok) {
          const data = await response.json()
          setPopularDiscussions(data)
        } else {
          console.warn('Failed to fetch popular discussions, using fallback')
          // Fallback data if backend is unavailable
          setPopularDiscussions([
            {
              id: 1,
              title: "Best software for rendering architectural designs?",
              content: "Looking for recommendations on rendering software. Currently using V-Ray but wondering if there are better alternatives for photorealistic renders...",
              author: "Amit Singh",
              reply_count: 24,
              view_count: 1250,
              updated_at: new Date(Date.now() - 2*60*60*1000).toISOString(),
              category: "Software",
              tags: ["Rendering", "3D", "Software"],
              is_solved: false
            },
            {
              id: 2,
              title: "How to prepare portfolio for architectural firms?",
              content: "I'm a fresh graduate and want to create an impressive portfolio. What should I include? How many projects?",
              author: "Neha Reddy",
              reply_count: 18,
              view_count: 890,
              updated_at: new Date(Date.now() - 5*60*60*1000).toISOString(),
              category: "Career",
              tags: ["Portfolio", "Jobs", "Career"],
              is_solved: true
            },
            {
              id: 3,
              title: "Sustainable materials for tropical climates",
              content: "Working on a project in Kerala. Need suggestions for sustainable materials that can withstand high humidity and heavy rainfall.",
              author: "Rahul Menon",
              reply_count: 12,
              view_count: 560,
              updated_at: new Date(Date.now() - 24*60*60*1000).toISOString(),
              category: "Materials",
              tags: ["Sustainability", "Materials", "Tropical"],
              is_solved: false
            },
            {
              id: 4,
              title: "Thesis topic ideas for final year",
              content: "Struggling to finalize my thesis topic. Interested in urban planning and adaptive reuse. Any suggestions?",
              author: "Priya Patel",
              reply_count: 35,
              view_count: 1500,
              updated_at: new Date(Date.now() - 48*60*60*1000).toISOString(),
              category: "Academics",
              tags: ["Thesis", "Urban Planning", "Student"],
              is_solved: false
            },
            {
              id: 5,
              title: "Experience with Zaha Hadid Architects internship?",
              content: "Has anyone here interned at ZHA? How was the interview process and what is the work culture like?",
              author: "Arjun Kapoor",
              reply_count: 8,
              view_count: 2100,
              updated_at: new Date(Date.now() - 72*60*60*1000).toISOString(),
              category: "Career",
              tags: ["Internship", "ZHA", "Career"],
              is_solved: true
            }
          ])
        }
      } catch (error) {
        console.error('Error fetching popular discussions:', error)
        setPopularDiscussions([])
      } finally {
        setLoadingDiscussions(false)
      }
    }

    fetchPopularDiscussions()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <HeroSlider />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Core Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Platform for Architectural Fraternity
            </h2>
            <p className="text-lg text-black max-w-2xl mx-auto">
              A holistic platform for the architectural fraternity - Access all the tools and resources you need to thrive in your architecture career
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainSections.map((section, index) => {
              const IconComponent = section.icon
              const colorClasses = {
                'bg-slate-800': { bg: 'bg-slate-800', hover: 'hover:bg-slate-700', text: 'text-slate-600', border: 'border-slate-200' },
                'bg-blue-500': { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', border: 'border-blue-200' },
                'bg-red-500': { bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600', border: 'border-red-200' },
              }
              const colors = colorClasses[section.color as keyof typeof colorClasses] || colorClasses['bg-blue-500']
              
              return (
                <Link 
                  key={section.title}
                  href={section.href === "#" ? "#" : section.href}
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
                      <CardDescription className="text-sm text-black leading-relaxed">
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

        {/* Feature Cards (Roadmap, Stats, etc.) */}
        <div className="mb-16 -mx-4 sm:-mx-6 lg:-mx-8">
          <FeatureCards />
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
                    <p className="text-sm text-black">Post and manage job opportunities</p>
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
                              <CardDescription className="text-sm text-black mt-1">
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
              <p className="text-black">Additional resources to enhance your learning</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {secondarySections.map((section) => {
              const IconComponent = section.icon
              return (
                <Link 
                  key={section.title}
                  href={section.href === "#" ? "#" : section.href}
                  className="group"
                  onClick={(e) => {
                    if (section.href === "#") {
                      e.preventDefault()
                      alert("Coming soon! This feature is currently under development.")
                    }
                  }}
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
                      <CardDescription className="text-xs text-center text-black">
                        {section.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="justify-center pt-0">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-black hover:text-gray-900 hover:bg-gray-50 font-medium text-xs group-hover:gap-1 transition-all"
                      >
                        {section.href === "#" ? "Coming Soon" : "Explore"}
                        <ArrowRight className="h-3 w-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>



        {/* Featured Articles Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Articles
              </h2>
              <p className="text-lg text-black">Latest insights from architecture experts</p>
            </div>
            <Link href="/blogs">
              <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingBlogs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="h-full border-2 border-gray-100">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <CardHeader className="pb-3">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredArticles.length > 0 ? (
            <div className="-mx-4 sm:-mx-6 lg:-mx-8">
              <ArticleMarquee articles={featuredArticles} speed={50} direction="right" />
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-black">No featured articles available</p>
            </div>
          )}
        </div>

        {/* Popular Discussions Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Popular Discussions
              </h2>
              <p className="text-lg text-black">Join the conversation with fellow architects</p>
            </div>
            <Link href="/discussions">
              <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                View All Discussions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingDiscussions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-2 border-gray-100 h-64">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="space-y-2 mb-3">
                          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : popularDiscussions.length > 0 ? (
            <div className="-mx-4 sm:-mx-6 lg:-mx-8">
              <DiscussionMarquee discussions={popularDiscussions} speed={60} singleRow={true} direction="left" />
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-black">No discussions available</p>
            </div>
          )}


        </div>


      </main>
    </div>
  )
}
