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
  const [searchResults, setSearchResults] = useState<string[]>([])
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
    
    // Check auth on mount
    checkAuth()
    
    // Listen for auth changes (login/logout)
    const handleAuthChange = () => {
      checkAuth()
    }
    
    window.addEventListener('auth-change', handleAuthChange)
    
    // Cleanup
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

  const allContent = [
    "Courses", "NATA", "Jobs", "Blogs", "Events", "Workshops", 
    "Contact Us", "Advertise with Us", "Architecture Tours", "Networking", 
    "Sustainable Design", "BIM Software", "CAD Training", "Portfolio Development", "Internships",
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const filtered = allContent.filter((item) => 
        item.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered.slice(0, 5))
    } else {
      setSearchResults([])
    }
  }

  const handleLogout = () => {
    api.logout()
    setIsAuthenticated(false)
    setUser(null)
    // Dispatch auth change event
    window.dispatchEvent(new Event('auth-change'))
    window.location.href = "/"
  }

  return (
    <div className="sticky top-0 z-50 flex flex-col transition-colors duration-300">
      {/* Search Bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Courses, NATA, Jobs, Blogs..."
              className="pl-9 w-full h-9 text-sm bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-black border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between group"
                    onClick={() => {
                      setSearchQuery(result)
                      setSearchResults([])
                    }}
                  >
                    <span>{result}</span>
                    <ArrowRight className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Header - Creative Design */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-xl border-b border-blue-500/20 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo with glow effect */}
          <div className="relative group">
            <Logo 
              size="md" 
              variant="white" 
              className="flex-shrink-0 hover:scale-110 transition-all duration-300 drop-shadow-lg"
            />
            <div className="absolute -inset-2 bg-white/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
          </div>

          {/* Main Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            <Link href="/" className="relative px-4 py-2 text-white font-medium hover:text-blue-200 transition-all duration-300 group">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/courses" className="relative px-4 py-2 text-white font-medium hover:text-blue-200 transition-all duration-300 group">
                  <span className="relative z-10 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Courses
                  </span>
                  <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                </Link>
                <Link href="/nata-courses" className="relative px-4 py-2 text-white font-medium hover:text-yellow-200 transition-all duration-300 group">
                  <span className="relative z-10 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    NATA
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                </Link>
                <Link href="/jobs-portal" className="relative px-4 py-2 text-white font-medium hover:text-green-200 transition-all duration-300 group">
                  <span className="relative z-10 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Jobs
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                </Link>
                <Link href="/blogs" className="relative px-4 py-2 text-white font-medium hover:text-pink-200 transition-all duration-300 group">
                  <span className="relative z-10 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Blogs
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-6 text-sm text-white/90">
                  <span className="flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-pointer group">
                    <Phone className="h-4 w-4 group-hover:animate-pulse" />
                    +91 98765 43210
                  </span>
                  <span className="flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-pointer group">
                    <Mail className="h-4 w-4 group-hover:animate-pulse" />
                    info@architecture-academics.online
                  </span>
                </div>

                <div className="flex items-center gap-4 border-l border-white/20 pl-6">
                  <a href="#" className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110" title="Facebook">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110" title="LinkedIn">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="#" className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110" title="Twitter">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110" title="Instagram">
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </>
            )}
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:text-red-200 hover:bg-red-500/20 border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:text-blue-100 hover:bg-white/10 border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-300 flex-shrink-0 backdrop-blur-sm border border-white/20"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      </header>

      {/* Creative Search Bar */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 border-b border-blue-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
              <Input
                placeholder="🔍 Search Courses, NATA, Jobs, Blogs... Discover your path!"
                className="pl-12 pr-4 w-full h-12 text-sm bg-transparent border-0 text-gray-900 placeholder:text-blue-600/70 focus:ring-0 focus:outline-none font-medium"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer text-sm text-gray-800 border-b border-gray-100/50 last:border-b-0 transition-all duration-300 flex items-center justify-between group"
                    onClick={() => {
                      setSearchQuery(result)
                      setSearchResults([])
                    }}
                  >
                    <span className="font-medium">{result}</span>
                    <ArrowRight className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Creative Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl mx-4 mt-3 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-800 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Building className="h-5 w-5" />
                  Home
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/courses"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-800 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BookOpen className="h-5 w-5" />
                      Courses
                    </Link>
                    <Link
                      href="/nata-courses"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-800 hover:text-yellow-600 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <GraduationCap className="h-5 w-5" />
                      NATA
                    </Link>
                    <Link
                      href="/jobs-portal"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-800 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Briefcase className="h-5 w-5" />
                      Jobs
                    </Link>
                    <Link
                      href="/blogs"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-800 hover:text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FileText className="h-5 w-5" />
                      Blogs
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Contact Information for non-authenticated users */}
                    <div className="px-4 py-3 space-y-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100/50">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span>+91 98765 43210</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span>info@architecture-academics.online</span>
                      </div>
                      <div className="flex items-center gap-4 pt-2 border-t border-blue-100">
                        <a href="#" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300" title="Facebook">
                          <Facebook className="h-5 w-5" />
                        </a>
                        <a href="#" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300" title="LinkedIn">
                          <Linkedin className="h-5 w-5" />
                        </a>
                        <a href="#" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300" title="Twitter">
                          <Twitter className="h-5 w-5" />
                        </a>
                        <a href="#" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300" title="Instagram">
                          <Instagram className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile User Menu */}
              <div className="space-y-1 pt-1 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="text-xs font-semibold text-gray-500 px-3 pb-1">Account</div>
                    {userMenuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-black hover:text-blue-600 hover:bg-blue-50 transition-all"
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
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-black hover:text-red-600 hover:bg-red-50 transition-all w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-gray-500 px-3 pb-1">Account</div>
                    <Link
                      href="/login"
                      className="flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg text-black hover:text-blue-600 hover:bg-blue-50 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </header>

      {/* Creative Search Bar */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 border-b border-blue-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
              <Input
                placeholder="🔍 Search Courses, NATA, Jobs, Blogs... Discover your path!"
                className="pl-12 pr-4 w-full h-12 text-sm bg-transparent border-0 text-gray-900 placeholder:text-blue-600/70 focus:ring-0 focus:outline-none font-medium"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer text-sm text-gray-800 border-b border-gray-100/50 last:border-b-0 transition-all duration-300 flex items-center justify-between group"
                    onClick={() => {
                      setSearchQuery(result)
                      setSearchResults([])
                    }}
                  >
                    <span className="font-medium">{result}</span>
                    <ArrowRight className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
