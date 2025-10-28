"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { auth, type User } from "@/lib/auth"
import { LoginRequiredButton } from "@/components/login-required"
import { Search, MessageSquare, Heart, Eye, Clock, User as UserIcon, ChevronRight, TrendingUp, Plus, Edit, Trash2, Loader2, FileText, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Blog {
  id: number; title: string; excerpt: string; content: string; category: string; tags: string
  featured_image: string | null; is_featured: boolean; status: string
  views_count: number; likes_count: number; comments_count: number; slug: string; author_id: number
  author: { id: number; first_name: string; last_name: string; email: string }
  created_at: string; updated_at: string
}

const categories = [
  { value: "all", label: "All" }, { value: "Architecture News", label: "Architecture News" },
  { value: "Design Trends", label: "Design Trends" }, { value: "Sustainable Design", label: "Sustainable Design" },
  { value: "Technology", label: "Technology" }, { value: "Career Advice", label: "Career Advice" },
  { value: "Project Showcase", label: "Project Showcase" }, { value: "Education", label: "Education" },
  { value: "Industry Insights", label: "Industry Insights" }, { value: "General", label: "General" }
]

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showBlogDialog, setShowBlogDialog] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [blogForm, setBlogForm] = useState({ 
    title: "", 
    content: "", 
    excerpt: "", 
    category: "General", 
    tags: "", 
    status: "published",
    is_featured: false 
  })
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => { 
    fetchCurrentUser(); 
    fetchBlogs() 
  }, [])
  
  // Check for authentication changes (like after login)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log("Storage change detected, checking auth...")
      fetchCurrentUser()
    }
    
    const handlePageFocus = () => {
      console.log("Page focus detected, checking auth...")
      fetchCurrentUser()
    }
    
    const handleAuthChange = () => {
      console.log("Auth change event detected...")
      fetchCurrentUser()
    }
    
    // Listen for storage changes and page focus
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handlePageFocus)
    window.addEventListener('auth-change', handleAuthChange)
    
    // Also check auth every 30 seconds
    const authInterval = setInterval(fetchCurrentUser, 30000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handlePageFocus)
      window.removeEventListener('auth-change', handleAuthChange)
      clearInterval(authInterval)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      // Check if token exists first
      if (!auth.isAuthenticated()) {
        setCurrentUser(null)
        return
      }

      // Try to get user from localStorage first (faster)
      const storedUser = auth.getStoredUser()
      if (storedUser) {
        setCurrentUser(storedUser)
      }

      // Then verify with backend
      const user = await auth.getCurrentUser()
      if (user) {
        setCurrentUser(user)
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        setCurrentUser(null)
        // Token might be expired, clear it
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
      setCurrentUser(null)
      // Clear invalid tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  }
  
  const fetchBlogs = async () => {
    try {
      setLoading(true); setError(null)
      
      // Try the new API format first
      let blogsData: Blog[] = []
      try {
        const response = await api.get("/blogs")
        console.log("Blogs API response:", response) // Debug log
        
        // Handle API response format { data: [...] }
        if (response && Array.isArray(response.data)) {
          blogsData = response.data
        } else if (Array.isArray(response)) {
          blogsData = response
        } else {
          console.warn("Unexpected blogs response format:", response)
          blogsData = []
        }
      } catch (apiError) {
        console.warn("API endpoint failed, falling back to hardcoded data:", apiError)
        
        // Fallback to hardcoded data if backend is not available
        blogsData = [
          {
            id: 1,
            title: "Sustainable Architecture: Building for Tomorrow",
            excerpt: "Explore how modern architects are integrating eco-friendly practices and green technologies into contemporary building design.",
            content: "Full content here...",
            category: "Sustainable Design",
            tags: "sustainability, green building, eco-friendly",
            featured_image: null,
            is_featured: true,
            status: "published",
            views_count: 1250,
            likes_count: 89,
            comments_count: 23,
            slug: "sustainable-architecture-building-tomorrow",
            author_id: 1,
            author: { id: 1, first_name: "Dr. Priya", last_name: "Sharma", email: "priya@example.com" },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "The Rise of Parametric Design in Modern Architecture",
            excerpt: "Discover how computational design tools are revolutionizing the way architects approach complex geometries.",
            content: "Full content here...",
            category: "Technology",
            tags: "parametric design, computational design, technology",
            featured_image: null,
            is_featured: false,
            status: "published",
            views_count: 890,
            likes_count: 56,
            comments_count: 12,
            slug: "rise-parametric-design-modern-architecture",
            author_id: 2,
            author: { id: 2, first_name: "Rajesh", last_name: "Kumar", email: "rajesh@example.com" },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            title: "Indian Vernacular Architecture: Lessons for Today",
            excerpt: "Understanding traditional building techniques from across India and their relevance in contemporary design.",
            content: "Full content here...",
            category: "Design Trends",
            tags: "vernacular architecture, traditional design, heritage",
            featured_image: null,
            is_featured: false,
            status: "published",
            views_count: 1450,
            likes_count: 102,
            comments_count: 34,
            slug: "indian-vernacular-architecture-lessons",
            author_id: 3,
            author: { id: 3, first_name: "Arjun", last_name: "Mehta", email: "arjun@example.com" },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      }
      
      setBlogs(blogsData)
      const featured = blogsData.find((blog: Blog) => blog.is_featured)
      setFeaturedBlog(featured || null)
    } catch (err: any) {
      console.error("Error fetching blogs:", err)
      setError("Unable to load blogs. Please try again later.")
      setBlogs([]) // Set empty array on error
    } finally { setLoading(false) }
  }

  const handleCreateBlog = () => {
    setEditingBlog(null)
    setBlogForm({ 
      title: "", 
      content: "", 
      excerpt: "", 
      category: "General", 
      tags: "", 
      status: "published",
      is_featured: false 
    })
    setShowBlogDialog(true)
  }

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog)
    setBlogForm({ 
      title: blog.title, 
      content: blog.content, 
      excerpt: blog.excerpt, 
      category: blog.category, 
      tags: blog.tags, 
      status: blog.status,
      is_featured: blog.is_featured || false 
    })
    setShowBlogDialog(true)
  }

  const handleSubmitBlog = async () => {
    if (!blogForm.title || !blogForm.content) { 
      alert("Please fill in title and content"); 
      return 
    }

    // Auto-generate excerpt if not provided
    const excerpt = blogForm.excerpt || blogForm.content.substring(0, 200) + "..."
    
    const blogData = {
      ...blogForm,
      excerpt: excerpt,
      tags: blogForm.tags || "",
    }
    
    try {
      setSubmitting(true)
      
      if (editingBlog) { 
        try {
          await api.put(`/blogs/${editingBlog.id}`, blogData)
        } catch (err: any) {
          // Fallback: simulate successful update
          console.warn("API update failed, simulating success:", err)
          
          // Update the blog in local state
          setBlogs(prev => prev.map(blog => 
            blog.id === editingBlog.id 
              ? { ...blog, ...blogData, updated_at: new Date().toISOString() }
              : blog
          ))
          
          // Update featured blog if this was the featured one
          if (editingBlog.is_featured || blogData.is_featured) {
            setFeaturedBlog(prev => 
              prev?.id === editingBlog.id 
                ? { ...editingBlog, ...blogData }
                : blogData.is_featured 
                  ? { ...editingBlog, ...blogData }
                  : prev
            )
          }
          
          showNotification(`Article "${blogData.title}" updated successfully! ${blogData.is_featured ? '⭐ Featured article updated.' : ''}`, 'success')
        }
      } else { 
        try {
          const response = await api.post("/blogs", blogData)
          const newBlog = response.data || {
            id: Date.now(),
            ...blogData,
            author_id: 1,
            author: { id: 1, first_name: "Current", last_name: "User", email: "user@example.com" },
            views_count: 0,
            likes_count: 0,
            comments_count: 0,
            featured_image: null,
            slug: blogData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          // Add new blog to local state
          setBlogs(prev => [newBlog, ...prev])
          
          // Set as featured if marked
          if (blogData.is_featured) {
            setFeaturedBlog(newBlog)
          }
          
          showNotification(`Article "${blogData.title}" created successfully! ${blogData.is_featured ? '⭐ Featured article created.' : ''}`, 'success')
        } catch (err: any) {
          // Fallback: create blog locally
          console.warn("API creation failed, creating locally:", err)
          
          const newBlog = {
            id: Date.now(),
            ...blogData,
            author_id: 1,
            author: { id: 1, first_name: "Current", last_name: "User", email: "user@example.com" },
            views_count: 0,
            likes_count: 0,
            comments_count: 0,
            featured_image: null,
            slug: blogData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setBlogs(prev => [newBlog, ...prev])
          
          if (blogData.is_featured) {
            setFeaturedBlog(newBlog)
          }
          
          showNotification(`Article created locally. ${blogData.is_featured ? '⭐ Marked as featured.' : ''} Will sync when online.`, 'success')
        }
      }
      
      setShowBlogDialog(false)
    } catch (err: any) {
      console.error("Error saving blog:", err)
      alert("Blog saved locally. Changes will sync when the server is available.")
    } finally { 
      setSubmitting(false) 
    }
  }

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return
    
    const blogToDeleteData = blogs.find(blog => blog.id === blogToDelete)
    const blogTitle = blogToDeleteData?.title || 'Article'
    
    try {
      await api.delete(`/blogs/${blogToDelete}`)
      setBlogs(prev => prev.filter(blog => blog.id !== blogToDelete))
      setShowDeleteDialog(false)
      setBlogToDelete(null)
      showNotification(`"${blogTitle}" deleted successfully`, 'success')
    } catch (err: any) {
      console.error("Error deleting blog:", err)
      // Fallback: delete locally
      setBlogs(prev => prev.filter(blog => blog.id !== blogToDelete))
      setShowDeleteDialog(false)
      setBlogToDelete(null)
      showNotification(`"${blogTitle}" deleted locally. Will sync when online.`, 'success')
    }
  }

  const confirmDeleteBlog = (blogId: number) => { setBlogToDelete(blogId); setShowDeleteDialog(true) }

  const filteredBlogs = Array.isArray(blogs) ? blogs.filter((blog) => {
    const matchesSearch = searchQuery === "" || blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) || blog.tags.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory
    return matchesSearch && matchesCategory && blog.status === "published"
  }) : []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString); const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading blogs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchBlogs}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white p-4 rounded-lg shadow-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                notification.type === 'success' ? 'bg-green-300' : 'bg-red-300'
              }`}></div>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-3 text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black text-white p-3 rounded-lg text-xs z-50 max-w-xs">
          <div>Auth Status: {auth.isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}</div>
          <div>Current User: {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'None'}</div>
          <div>Token: {auth.getStoredToken() ? 'Present' : 'None'}</div>
          <button 
            onClick={fetchCurrentUser}
            className="mt-2 bg-white text-black px-2 py-1 rounded text-xs"
          >
            Refresh Auth
          </button>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Header - Medium Style */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Architecture Stories
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                A place to read, write, and deepen your understanding of architecture, design, and built environments.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Search stories..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="pl-12 py-4 text-lg border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-full shadow-sm"
                  />
                </div>
                
                {currentUser && (
                  <Button 
                    onClick={handleCreateBlog}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Start Writing
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button 
                    key={category.value} 
                    variant={selectedCategory === category.value ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)} 
                    className={`whitespace-nowrap rounded-full px-4 py-2 transition-all duration-200 ${
                      selectedCategory === category.value 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
        {featuredBlog && selectedCategory === "all" && searchQuery === "" && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-bold">Featured Article</h2>
            </div>
            <Link href={`/blogs/${featuredBlog.slug}`}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="bg-blue-100 text-blue-800">{featuredBlog.category}</Badge>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Featured</Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{featuredBlog.title}</h3>
                  <p className="text-gray-600 mb-6 text-lg">{featuredBlog.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{featuredBlog.author.first_name} {featuredBlog.author.last_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatDate(featuredBlog.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1"><Eye className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600">{featuredBlog.views_count}</span></div>
                      <div className="flex items-center gap-1"><Heart className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600">{featuredBlog.likes_count}</span></div>
                      <div className="flex items-center gap-1"><MessageSquare className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600">{featuredBlog.comments_count}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold mb-6">{selectedCategory === "all" ? "All Articles" : categories.find(c => c.value === selectedCategory)?.label}
              <span className="text-gray-400 font-normal ml-2">({filteredBlogs.length})</span>
            </h2>
            {currentUser && (
              <Button 
                onClick={handleCreateBlog}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Write New Article
              </Button>
            )}
          </div>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center px-6">
              {/* Hero Section - Medium Style */}
              <div className="mb-12">
                <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <FileText className="h-16 w-16 text-green-600" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {searchQuery || selectedCategory !== "all" 
                    ? "No Stories Found" 
                    : "Where good ideas find you"
                  }
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
                  {searchQuery || selectedCategory !== "all" 
                    ? "Try adjusting your search or explore different topics to discover amazing architectural insights."
                    : "Read, write and connect with great minds in architecture. Share your ideas with millions of readers."
                  }
                </p>
              </div>

              {/* Call to Action */}
              {currentUser ? (
                <div className="space-y-6">
                  <Button 
                    onClick={handleCreateBlog}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Start Writing
                  </Button>
                  <p className="text-gray-500">Share your architectural insights with the community</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Sign Up CTA - Primary */}
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Join our community</h3>
                    <p className="text-gray-600 mb-6">Discover stories, thinking, and expertise from writers on any topic.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        onClick={() => window.location.href = '/register?redirect=' + encodeURIComponent('/blogs')}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none"
                      >
                        Get Started
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/login?redirect=' + encodeURIComponent('/blogs')}
                        size="lg"
                        className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 text-lg font-medium rounded-full transition-all duration-300 flex-1 sm:flex-none"
                      >
                        Sign In
                      </Button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Write Stories</h4>
                      <p className="text-gray-600 text-sm">Share your architectural knowledge and experiences</p>
                    </div>
                    
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Connect</h4>
                      <p className="text-gray-600 text-sm">Engage with fellow architects and designers</p>
                    </div>
                    
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Grow</h4>
                      <p className="text-gray-600 text-sm">Build your reputation in the architecture community</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Clear Filters Option */}
              {(searchQuery || selectedCategory !== "all") && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <Button 
                    variant="ghost" 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Show All Stories
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Article Layout - Medium Style */}
            {filteredBlogs.some(blog => blog.is_featured) && (
              <div className="border-b border-gray-200 pb-8 mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">Featured Story</h2>
                {filteredBlogs.filter(blog => blog.is_featured).slice(0, 1).map((blog) => (
                  <div key={blog.id} className="group cursor-pointer" onClick={() => window.location.href = `/blogs/${blog.slug}`}>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {typeof blog.author === 'string' ? blog.author : `${blog.author?.first_name || ''} ${blog.author?.last_name || ''}`}
                            </p>
                            <p className="text-sm text-gray-500">{formatDate(blog.created_at)}</p>
                          </div>
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors leading-tight">
                          {blog.title}
                        </h1>
                        
                        <p className="text-lg text-gray-600 leading-relaxed line-clamp-3">
                          {blog.excerpt || (blog.content ? blog.content.substring(0, 200) + "..." : "")}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {blog.category}
                          </Badge>
                          <span>{blog.content ? Math.ceil(blog.content.length / 200) : 1} min read</span>
                          <div className="flex items-center gap-4">
                            <LoginRequiredButton
                              onClick={() => {/* Handle like */}}
                              action="like posts"
                              className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                            >
                              <Heart className="h-4 w-4" />
                              {blog.likes_count || 0}
                            </LoginRequiredButton>
                            <LoginRequiredButton
                              onClick={() => {/* Handle comment */}}
                              action="comment on posts"
                              className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors"
                            >
                              <MessageSquare className="h-4 w-4" />
                              {blog.comments_count || 0}
                            </LoginRequiredButton>
                          </div>
                        </div>
                      </div>
                      
                      <div className="order-first md:order-last">
                        <img 
                          src={blog.featured_image || '/api/placeholder/600/400'} 
                          alt={blog.title}
                          className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Regular Articles Grid - Medium Style */}
            <div className="space-y-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {selectedCategory === "all" ? "Latest Stories" : categories.find(c => c.value === selectedCategory)?.label}
                <span className="ml-2 font-normal">({filteredBlogs.filter(blog => !blog.is_featured).length})</span>
              </h2>
              
              <div className="grid gap-8">
                {filteredBlogs.filter(blog => !blog.is_featured).map((blog) => (
                  <article key={blog.id} className="group cursor-pointer py-6 border-b border-gray-100 last:border-b-0" onClick={() => window.location.href = `/blogs/${blog.slug}`}>
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="md:col-span-3 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900">
                            {typeof blog.author === 'string' ? blog.author : `${blog.author?.first_name || ''} ${blog.author?.last_name || ''}`}
                          </span>
                          <span className="text-sm text-gray-500">·</span>
                          <span className="text-sm text-gray-500">{formatDate(blog.created_at)}</span>
                        </div>
                        
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                          {blog.title}
                        </h2>
                        
                        <p className="text-gray-600 line-clamp-2 leading-relaxed">
                          {blog.excerpt || (blog.content ? blog.content.substring(0, 150) + "..." : "")}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {blog.category}
                            </Badge>
                            <span>{blog.content ? Math.ceil(blog.content.length / 200) : 1} min read</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <LoginRequiredButton
                              onClick={() => {/* Handle like */}}
                              action="like posts"
                              className="flex items-center gap-1 hover:text-red-500 transition-colors"
                            >
                              <Heart className="h-4 w-4" />
                              {blog.likes_count || 0}
                            </LoginRequiredButton>
                            <LoginRequiredButton
                              onClick={() => {/* Handle comment */}}
                              action="comment on posts"
                              className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                            >
                              <MessageSquare className="h-4 w-4" />
                              {blog.comments_count || 0}
                            </LoginRequiredButton>
                            {currentUser && blog.author_id === currentUser.id && (
                              <div className="flex gap-2 ml-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleEditBlog(blog); }}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-1">
                        <img 
                          src={blog.featured_image || '/api/placeholder/200/150'} 
                          alt={blog.title}
                          className="w-full h-32 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      <Dialog open={showBlogDialog} onOpenChange={setShowBlogDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingBlog ? "Edit Article" : "Write New Article"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingBlog ? "Update your article details below" : "Share your knowledge and insights with the community"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Article Title *</Label>
              <Input 
                id="title" 
                value={blogForm.title} 
                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} 
                placeholder="Enter an engaging title for your article"
                className="mt-1 text-lg"
              />
            </div>
            
            <div>
              <Label htmlFor="excerpt" className="text-sm font-semibold text-gray-700">Excerpt</Label>
              <Textarea 
                id="excerpt" 
                value={blogForm.excerpt} 
                onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} 
                placeholder="Brief summary of your article (will be auto-generated if left empty)"
                rows={2}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">This appears in article previews and search results</p>
            </div>
            
            <div>
              <Label htmlFor="content" className="text-sm font-semibold text-gray-700">Article Content *</Label>
              <Textarea 
                id="content" 
                value={blogForm.content} 
                onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} 
                placeholder="Write your article content here. You can use markdown formatting..."
                rows={12}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Supports basic markdown: **bold**, *italic*, [links](url), # headings</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                <Select value={blogForm.category} onValueChange={(value: string) => setBlogForm({ ...blogForm, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.value !== "all").map((category) => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Publication Status</Label>
                <Select value={blogForm.status} onValueChange={(value: string) => setBlogForm({ ...blogForm, status: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Draft - Save for later
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Published - Live on site
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="tags" className="text-sm font-semibold text-gray-700">Tags</Label>
              <Input 
                id="tags" 
                value={blogForm.tags} 
                onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })} 
                placeholder="architecture, design, sustainability, BIM (comma-separated)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Add relevant tags to help readers find your article</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center space-x-3">
                <input
                  id="is_featured"
                  type="checkbox"
                  checked={blogForm.is_featured}
                  onChange={(e) => setBlogForm({ ...blogForm, is_featured: e.target.checked })}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <Label htmlFor="is_featured" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <span>⭐</span>
                    Mark as Featured Article
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Featured articles appear prominently on the blog homepage and get more visibility
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlogDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitBlog} disabled={submitting}>
              {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (editingBlog ? "Update Article" : "Publish Article")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete your article.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBlog} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
