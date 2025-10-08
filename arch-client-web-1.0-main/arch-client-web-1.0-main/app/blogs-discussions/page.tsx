"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  Search,
  MessageSquare,
  Heart,
  Eye,
  Calendar,
  User,
  TrendingUp,
  Filter,
  Plus,
  BookOpen,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Blog {
  id: number
  title: string
  excerpt: string
  content: string
  category: string
  tags: string
  featured_image: string | null
  is_featured: boolean
  status: string
  views_count: number
  likes_count: number
  comments_count: number
  slug: string
  author_id: number
  author: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  created_at: string
  updated_at: string
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Architecture News", label: "Architecture News" },
  { value: "Design Trends", label: "Design Trends" },
  { value: "Sustainable Design", label: "Sustainable Design" },
  { value: "Technology", label: "Technology" },
  { value: "Career Advice", label: "Career Advice" },
  { value: "Project Showcase", label: "Project Showcase" },
  { value: "Education", label: "Education" },
  { value: "Industry Insights", label: "Industry Insights" },
  { value: "General", label: "General" },
]

export default function BlogsDiscussions() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated())
    fetchBlogs()
    fetchFeaturedBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await api.get("/blogs", {
        params: {
          limit: 50,
          status: "published"
        }
      })
      setBlogs(response.data)
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedBlogs = async () => {
    try {
      const response = await api.get("/blogs", {
        params: {
          limit: 3,
          is_featured: true,
          status: "published"
        }
      })
      setFeaturedBlogs(response.data)
    } catch (error) {
      console.error("Error fetching featured blogs:", error)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: 50,
        status: "published"
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      if (selectedCategory !== "all") {
        params.category = selectedCategory
      }

      const response = await api.get("/blogs", { params })
      setBlogs(response.data)
    } catch (error) {
      console.error("Error searching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Architecture News": "bg-blue-100 text-blue-700 border-blue-200",
      "Design Trends": "bg-purple-100 text-purple-700 border-purple-200",
      "Sustainable Design": "bg-green-100 text-green-700 border-green-200",
      "Technology": "bg-cyan-100 text-cyan-700 border-cyan-200",
      "Career Advice": "bg-orange-100 text-orange-700 border-orange-200",
      "Project Showcase": "bg-pink-100 text-pink-700 border-pink-200",
      "Education": "bg-indigo-100 text-indigo-700 border-indigo-200",
      "Industry Insights": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "General": "bg-gray-100 text-gray-700 border-gray-200",
    }
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-medium">Blogs & Discussions</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Architecture Community Hub
            </h1>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto mb-8">
              Explore insights, share ideas, and engage in meaningful discussions with architecture professionals worldwide
            </p>

            {isAuthenticated && (
              <Link href="/blogs-discussions/create">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Write a Blog Post
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Section */}
        <div className="mb-12">
          <Card className="border-2 border-gray-100 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search blogs by title, content, or tags..."
                    className="pl-10 bg-gray-50 border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                <Button 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Blogs Section */}
        {featuredBlogs.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">Featured Posts</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredBlogs.map((blog) => (
                <Link key={blog.id} href={`/blogs-discussions/${blog.slug}`}>
                  <Card className="h-full border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-500 overflow-hidden">
                      {blog.featured_image ? (
                        <img 
                          src={blog.featured_image} 
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-yellow-500 text-white border-0">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader>
                      <Badge className={`w-fit mb-2 ${getCategoryColor(blog.category)}`}>
                        {blog.category}
                      </Badge>
                      <CardTitle className="text-xl group-hover:text-purple-600 transition-colors line-clamp-2">
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {blog.excerpt || blog.content.substring(0, 150)}
                      </CardDescription>
                    </CardHeader>

                    <CardFooter className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {blog.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {blog.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {blog.comments_count}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Blogs Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategory !== "all" ? `${selectedCategory}` : "All Posts"}
            </h2>
            <span className="text-gray-600">{blogs.length} posts</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search or filters"
                    : "Be the first to create a blog post!"}
                </p>
                {isAuthenticated && (
                  <Link href="/blogs-discussions/create">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Post
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blogs-discussions/${blog.slug}`}>
                  <Card className="h-full border-2 border-gray-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      {blog.featured_image ? (
                        <img 
                          src={blog.featured_image} 
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-gray-400 opacity-50" />
                        </div>
                      )}
                    </div>
                    
                    <CardHeader>
                      <Badge className={`w-fit mb-2 ${getCategoryColor(blog.category)}`}>
                        {blog.category}
                      </Badge>
                      <CardTitle className="text-lg group-hover:text-purple-600 transition-colors line-clamp-2">
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {blog.excerpt || blog.content.substring(0, 120)}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <User className="h-4 w-4" />
                        <span>{blog.author.first_name} {blog.author.last_name}</span>
                        <span>•</span>
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(blog.created_at)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {blog.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {blog.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {blog.comments_count}
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button 
                        variant="ghost" 
                        className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 group-hover:gap-2 transition-all"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
