"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { api } from "@/lib/api"
import Logo from "@/components/logo"
import {
  Search,
  Building,
  Menu,
  X,
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  Wrench,
  User,
  LogOut,
  LayoutDashboard,
  Mail,
  Megaphone,
  Users,
  Mic,
  FileText,
  GraduationCap,
  Phone,
  MapPin,
  Facebook,
  Linkedin,
  Twitter,
  Instagram
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Header() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<typeof searchContent>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = api.isAuthenticated()
      setIsAuthenticated(authenticated)
      if (authenticated) {
        const userData = api.getStoredUser()
        setUser(userData)
      } else {
        setUser(null)
      }
    }
    
    checkAuth()
    
    const handleAuthChange = () => {
      checkAuth()
    }
    
    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  const userMenuItems = isAuthenticated ? [
    { name: "Profile", href: "/profile", icon: User },
    ...(user && user.role === 'ADMIN' ? [{ name: "Admin", href: "/admin", icon: LayoutDashboard }] : []),
    ...(user && user.role === 'RECRUITER' ? [{ name: "Dashboard", href: "/recruiter-dashboard", icon: LayoutDashboard }] : []),
  ] : [
    { name: "Login", href: "/login", icon: User },
    { name: "Register", href: "/register", icon: User },
  ]

  const searchContent = [
    { title: "Courses", href: "/courses", description: "Browse architecture courses" },
    { title: "NATA Courses", href: "/nata-courses", description: "Prepare for NATA exams" },
    { title: "Jobs Portal", href: "/jobs-portal", description: "Find architecture jobs" },
    { title: "Blogs", href: "/blogs", description: "Read architecture blogs" },
    { title: "Events", href: "/events", description: "Upcoming architecture events" },
    { title: "Workshops", href: "/workshops", description: "Join architecture workshops" },
    { title: "Contact Us", href: "/contact-us", description: "Get in touch with us" },
    { title: "Advertise with Us", href: "/advertise-with-us", description: "Promote your services" },
    { title: "Dashboard", href: "/dashboard", description: "Your personal dashboard" },
    { title: "Profile", href: "/profile", description: "Manage your profile" },
    { title: "Discussions", href: "/discussions", description: "Join community discussions" },
    { title: "Video Demo", href: "/video-demo", description: "Watch course previews" },
    { title: "Learn", href: "/learn", description: "Start learning" },
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const filtered = searchContent.filter((item) => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered.slice(0, 6))
    } else {
      setSearchResults([])
    }
  }

  const handleSearchSelect = (item: typeof searchContent[0]) => {
    setSearchQuery("")
    setSearchResults([])
    window.location.href = item.href
  }

  const handleLogout = () => {
    api.logout()
    setIsAuthenticated(false)
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
    window.location.href = "/"
  }

  return (
    <div className="sticky top-0 z-50 flex flex-col transition-all duration-300">
      {/* Main Navigation Header with Integrated Search */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo 
                size="md" 
                variant="white" 
                className="hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Main Navigation with Search - Desktop */}
            <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center">
              <nav className="flex items-center space-x-1">
                <Link href="/" className="px-3 py-2 text-sm font-medium text-white hover:text-white/80 hover:bg-white/10 rounded-md transition-all duration-200">
                  Home
                </Link>
              
              {isAuthenticated ? (
                <>
                  <Link href="/courses" className="px-3 py-2 text-sm font-medium text-white hover:text-white/80 hover:bg-white/10 rounded-md transition-all duration-200 flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Courses
                  </Link>
                  <Link href="/nata-courses" className="px-3 py-2 text-sm font-medium text-white hover:text-yellow-200 hover:bg-yellow-500/20 rounded-md transition-all duration-200 flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    NATA
                  </Link>
                  <Link href="/jobs-portal" className="px-3 py-2 text-sm font-medium text-white hover:text-green-200 hover:bg-green-500/20 rounded-md transition-all duration-200 flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    Jobs
                  </Link>
                  <Link href="/blogs" className="px-3 py-2 text-sm font-medium text-white hover:text-purple-200 hover:bg-purple-500/20 rounded-md transition-all duration-200 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Blogs
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-xs text-white border-l border-r border-white/20 px-4 mx-4">
                    <span className="flex items-center gap-1 hover:text-white/80 transition-colors cursor-pointer">
                      <Phone className="h-3 w-3" />
                      +91 98765 43210
                    </span>
                    <span className="flex items-center gap-1 hover:text-white/80 transition-colors cursor-pointer">
                      <Mail className="h-3 w-3" />
                      info@architecture-academics.online
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <a href="#" className="p-1.5 text-white hover:text-white/80 hover:bg-white/10 rounded transition-all duration-200" title="Facebook">
                      <Facebook className="h-4 w-4" />
                    </a>
                    <a href="#" className="p-1.5 text-white hover:text-white/80 hover:bg-white/10 rounded transition-all duration-200" title="LinkedIn">
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a href="#" className="p-1.5 text-white hover:text-white/80 hover:bg-white/10 rounded transition-all duration-200" title="Twitter">
                      <Twitter className="h-4 w-4" />
                    </a>
                    <a href="#" className="p-1.5 text-white hover:text-white/80 hover:bg-white/10 rounded transition-all duration-200" title="Instagram">
                      <Instagram className="h-4 w-4" />
                    </a>
                  </div>
                </>
              )}
              </nav>
              
              {/* Integrated Search Bar */}
              <div className="relative ml-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/70 h-3.5 w-3.5" />
                  <Input
                    placeholder="Search courses, jobs, blogs..."
                    className="pl-8 pr-3 w-56 h-7 text-xs bg-white/15 border border-white/30 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/50 focus:ring-0 focus:outline-none rounded-md"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors duration-200 flex items-center justify-between group"
                        onClick={() => handleSearchSelect(result)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{result.title}</span>
                          <span className="text-xs text-gray-500">{result.description}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:text-white/80 hover:bg-red-500/20 border border-white/20 backdrop-blur-sm text-sm"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-white hover:text-white/80 hover:bg-white/10 border border-white/20 backdrop-blur-sm text-sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-white text-blue-600 hover:bg-gray-50 hover:text-blue-700 text-sm font-medium">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl mx-4 mt-1 rounded-lg max-h-[80vh] overflow-y-auto z-50">
              <div className="px-3 py-3 space-y-1">
                {/* Mobile Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search courses, jobs, blogs..."
                      className="pl-10 pr-4 w-full h-10 text-sm bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 focus:ring-0 focus:outline-none rounded-lg"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                          onClick={() => {
                            handleSearchSelect(result)
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{result.title}</span>
                            <span className="text-xs text-gray-500">{result.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-1">
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Building className="h-4 w-4" />
                    Home
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/courses"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" />
                        Courses
                      </Link>
                      <Link
                        href="/nata-courses"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <GraduationCap className="h-4 w-4" />
                        NATA
                      </Link>
                      <Link
                        href="/jobs-portal"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Briefcase className="h-4 w-4" />
                        Jobs
                      </Link>
                      <Link
                        href="/blogs"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4" />
                        Blogs
                      </Link>

                      {/* Mobile User Menu for authenticated users */}
                      <div className="pt-2 border-t border-gray-200 space-y-1">
                        <div className="text-xs font-medium text-gray-500 px-3 pb-1">Account</div>
                        {userMenuItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <Icon className="h-4 w-4" />
                              {item.name}
                            </Link>
                          )
                        })}
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsMobileMenuOpen(false)
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Contact Information for non-authenticated users */}
                      <div className="px-3 py-3 space-y-2 bg-gray-50 rounded-md border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 pb-1">Contact Info</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3 text-gray-500" />
                          <span>+91 98765 43210</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3 text-white-500" />
                          <span>info@architecture-academics.online</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <a href="#" className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200" title="Facebook">
                            <Facebook className="h-4 w-4" />
                          </a>
                          <a href="#" className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200" title="LinkedIn">
                            <Linkedin className="h-4 w-4" />
                          </a>
                          <a href="#" className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200" title="Twitter">
                            <Twitter className="h-4 w-4" />
                          </a>
                          <a href="#" className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200" title="Instagram">
                            <Instagram className="h-4 w-4" />
                          </a>
                        </div>
                      </div>

                      {/* Auth buttons for non-authenticated users */}
                      <div className="pt-2 border-t border-gray-200 space-y-1">
                        <div className="text-xs font-medium text-gray-500 px-3 pb-1">Account</div>
                        <Link
                          href="/login"
                          className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  )
}