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
  GraduationCap
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

  const navigationItems = [
    { name: "Home", href: "/", icon: Building },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "NATA", href: "/nata-courses", icon: GraduationCap },
    { name: "Jobs", href: "/jobs-portal", icon: Briefcase },
    { name: "Blogs", href: "/blogs", icon: FileText },
    { name: "Advertise", href: "/advertise-with-us", icon: Megaphone },
  ]
  
  const mobileOnlyItems = [
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Workshops", href: "/workshops", icon: Wrench },
  ]

  const userMenuItems = isAuthenticated ? [
    { name: "Profile", href: "/profile", icon: User },
    ...(user && user.role === 'ADMIN' ? [{ name: "Admin", href: "/admin", icon: LayoutDashboard }] : []),
    ...(user && user.role === 'RECRUITER' ? [{ name: "Dashboard", href: "/recruiter-dashboard", icon: LayoutDashboard }] : []),
  ] : [
    { name: "Login", href: "/login", icon: User },
    { name: "Register", href: "/register", icon: User },
  ]

  const allContent = [
    "Courses", "Jobs", "Events", "Workshops", "Contact Us", "Advertise with Us",
    "Architecture Tours", "NATA Courses", "Networking", "Sustainable Design",
    "BIM Software", "CAD Training", "Portfolio Development", "Internships",
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Logo 
            size="md" 
            variant="default" 
            className="flex-shrink-0 group hover:scale-105 transition-transform"
          />

          {/* Quick Access for Very Small Screens */}
          <div className="flex sm:hidden items-center space-x-1 flex-1 justify-center">
            <Link
              href="/nata-courses"
              className="px-1.5 py-1 text-[10px] font-medium text-purple-600 bg-purple-50 rounded"
            >
              NATA
            </Link>
            <Link
              href="/courses"
              className="px-1.5 py-1 text-[10px] font-medium text-gray-600 hover:text-purple-600"
            >
              Courses
            </Link>
          </div>

          {/* Mobile Navigation - Key Items Always Visible */}
          <nav className="hidden sm:flex lg:hidden items-center space-x-1 flex-1 justify-center max-w-xs">
            <Link
              href="/nata-courses"
              className={`px-2 py-1 text-xs font-medium transition-all duration-200 rounded-md ${
                pathname === "/nata-courses"
                  ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600"
                  : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              NATA
            </Link>
            <Link
              href="/courses"
              className={`px-2 py-1 text-xs font-medium transition-all duration-200 rounded-md ${
                pathname === "/courses"
                  ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600"
                  : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              Courses
            </Link>
            <Link
              href="/jobs-portal"
              className={`px-2 py-1 text-xs font-medium transition-all duration-200 rounded-md ${
                pathname === "/jobs-portal"
                  ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600"
                  : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              Jobs
            </Link>
          </nav>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg flex items-center gap-2 ${
                    isActive
                      ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md"
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Desktop Search & User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-9 w-48 h-9 text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
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

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {userMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.name} href={item.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                        >
                          <Icon className="h-4 w-4 mr-1" />
                          {item.name}
                        </Button>
                      </Link>
                    )
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-purple-600 hover:bg-purple-50">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white rounded-xl mt-2 mb-3 border border-gray-200 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="px-3 py-3 space-y-2">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses, jobs..."
                  className="pl-9 h-9 text-sm w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-1 pt-1 border-t border-gray-200">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600"
                          : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
                
                {/* Mobile-Only Links (Events, Workshops) */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 px-3 pb-1">More</div>
                  {mobileOnlyItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
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
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all"
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
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all w-full text-left"
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
                      className="flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all"
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
  )
}
