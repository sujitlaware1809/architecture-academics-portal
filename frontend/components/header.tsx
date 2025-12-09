"use client"

import { useState, useEffect, KeyboardEvent } from "react"
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
  Bell,
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
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0)
  const [showNotifications, setShowNotifications] = useState<boolean>(false)

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

  // Fetch notifications for authenticated users (client side)
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return
      try {
        const token = localStorage.getItem("access_token")
        if (!token) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications?limit=6`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setNotifications(data)
          setUnreadCount(data.filter((n: any) => n.is_read === false || n.read === false).length)
          return
        }
      } catch (err) {
        // ignore and fallback to sample
      }

      // Fallback sample notifications
      const sample = [
        { id: 1, title: "Welcome!", message: "You have new course recommendations.", read: false, created_at: new Date().toISOString() },
        { id: 2, title: "Event Reminder", message: "Workshop tomorrow at 4 PM.", read: false, created_at: new Date().toISOString() }
      ]
      setNotifications(sample)
      setUnreadCount(sample.filter(n => !n.read).length)
    }

    fetchNotifications()
  }, [isAuthenticated])

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!isAuthenticated) return
      try {
        const token = localStorage.getItem("access_token")
        if (!token) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUnreadMessagesCount(data.count)
        }
      } catch (err) {
        console.error("Failed to fetch unread messages count", err)
      }
    }

    fetchUnreadMessages()
    // Poll every minute
    const interval = setInterval(fetchUnreadMessages, 60000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const userMenuItems = isAuthenticated ? [
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
    { title: "Discussions", href: "/discussions", description: "Join community discussions" },
    { title: "Video Demo", href: "/video-demo", description: "Watch course previews" },
    { title: "Learn", href: "/learn", description: "Start learning" },
  ]

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length > 1) {
      setIsSearching(true)
      try {
        // Use the API to search
        const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.data) {
           setSearchResults(res.data.map((item: any) => ({
             title: item.title,
             description: item.description,
             href: item.url,
             type: item.type,
             image: item.image
           })))
        }
      } catch (err) {
        console.error("Search failed", err)
        // Fallback to static search if API fails
        const filtered = searchContent.filter((item) => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        )
        setSearchResults(filtered)
      } finally {
        setIsSearching(false)
      }
    } else {
      setSearchResults([])
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setSearchResults([])
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleSearchSelect = (item: any) => {
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
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-lg">
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
                    onKeyDown={handleKeyDown}
                  />
                </div>
                {(searchResults.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto">
                    {isSearching && searchResults.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">Searching...</div>
                    )}
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors duration-200 flex items-center justify-between group"
                        onClick={() => handleSearchSelect(result)}
                      >
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between">
                             <span className="font-medium text-gray-900 truncate pr-2">{result.title}</span>
                             {result.type && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">{result.type}</span>}
                          </div>
                          <span className="text-xs text-gray-500 line-clamp-1">{result.description}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Auth Buttons - Desktop (with Notifications) */}
            <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 rounded-md text-white hover:bg-white/10 transition-colors relative"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-red-500 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-96 bg-white text-gray-900 shadow-lg rounded-md overflow-hidden z-50">
                        <div className="px-4 py-2 border-b font-medium flex items-center justify-between">
                          <span>Notifications</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setNotifications((prev) => prev.map((x) => ({ ...x, read: true })))
                                setUnreadCount(0)
                                // TODO: call backend to mark read
                              }}
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              Mark all read
                            </button>
                            <Link href="/notifications">
                              <span className="text-sm text-blue-600 cursor-pointer">View all</span>
                            </Link>
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {notifications.length === 0 && (
                            <div className="p-4 text-sm text-gray-500">No notifications</div>
                          )}
                          {notifications.map((n: any) => (
                            <div key={n.id} className="px-4 py-3 hover:bg-gray-50 flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {n.actor && n.actor.avatar ? (
                                  <Image src={n.actor.avatar} alt={n.actor.name || 'avatar'} width={40} height={40} className="rounded-full" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                                    {n.actor && n.actor.name ? n.actor.name.charAt(0).toUpperCase() : 'N'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-semibold">{n.title}</div>
                                  <div className="text-[11px] text-gray-400 ml-2">{new Date(n.created_at).toLocaleString()}</div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{n.message}</div>
                              </div>
                              {(!n.read && !n.is_read) && <span className="text-xs text-blue-600 self-start">•</span>}
                            </div>
                          ))}
                        </div>
                        <div className="px-3 py-2 border-t text-xs text-gray-500 flex justify-between items-center">
                          <span>Notifications are delivered here.</span>
                          <Link href="/notifications" className="text-blue-600 hover:underline font-medium">View all</Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dashboard quick link next to notifications */}
                  <Link href="/dashboard">
                    <button className="px-2 py-1.5 rounded-md text-white hover:bg-white/10 transition-colors flex items-center gap-1" title="Dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="text-sm font-medium hidden xl:inline">Dashboard</span>
                    </button>
                  </Link>
                  
                  <Link href="/messages">
                    <button className="p-2 rounded-md text-white hover:bg-white/10 transition-colors relative" title="Messages">
                      <Mail className="h-4 w-4" />
                      {unreadMessagesCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-black"></span>
                      )}
                    </button>
                  </Link>

                  {/* User info display */}
                  <Link href="/profile">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                      {user && (user.avatar || user.profile_image_url) ? (
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/40 relative">
                          <img 
                            src={user.avatar || (user.profile_image_url?.startsWith('http') ? user.profile_image_url : `${process.env.NEXT_PUBLIC_API_URL}${user.profile_image_url}`)} 
                            alt={user.name || 'avatar'} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('hidden');
                              // Fallback to showing the initial if image fails
                              const fallback = document.getElementById('user-initial-fallback');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        </div>
                      ) : (
                        <div id="user-initial-fallback" className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-sm text-white border-2 border-white/40 font-bold flex-shrink-0">
                          {user && user.first_name ? user.first_name.charAt(0).toUpperCase() : (user && user.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4 text-white" />)}
                        </div>
                      )}
                      {user && (
                        <span className="text-sm font-semibold text-white">
                          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.name || 'User')}
                        </span>
                      )}
                    </div>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white hover:text-white/80 hover:bg-red-500/20 border border-white/20 backdrop-blur-sm text-xs px-2 py-1.5 flex-shrink-0"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1" />
                    Logout
                  </Button>
                </>
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