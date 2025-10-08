"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  Search,
  MessageSquare,
  Heart,
  Eye,
  Clock,
  User,
  ChevronRight,
  TrendingUp,
  Plus
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  { value: "all", label: "All" },
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated())
    fetchBlogs()
  }, [selectedCategory, searchQuery])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: 50,
        status: "published"
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      if (selectedCategory && selectedCategory !== "all") {
        params.category = selectedCategory
      }

      const response = await api.get("/blogs", { params })
      const allBlogs = response.data
      
      // Set featured blog (first one)
      if (allBlogs.length > 0 && allBlogs[0].is_featured) {
        setFeaturedBlog(allBlogs[0])
        setBlogs(allBlogs.slice(1))
      } else {
        setFeaturedBlog(null)
        setBlogs(allBlogs)
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} min read`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Medium-style Header */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full border-gray-300 focus:border-gray-900 focus:ring-gray-900 rounded-full"
                />
              </div>
            </div>
            {isAuthenticated && (
              <Link href="/blogs/new">
                <Button className="ml-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Write
                </Button>
              </Link>
            )}
          </div>

          {/* Category Filter */}
          <div className="mt-6 flex items-center gap-3 overflow-x-auto hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Featured Blog */}
            {featuredBlog && (
              <Link href={`/blogs/${featuredBlog.slug}`}>
                <div className="mb-16 pb-12 border-b border-gray-200 cursor-pointer group">
                  <Badge className="mb-3 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Featured
                  </Badge>
                  <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-gray-700 transition-colors">
                    {featuredBlog.title}
                  </h1>
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {featuredBlog.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {featuredBlog.author.first_name[0]}{featuredBlog.author.last_name[0]}
                      </div>
                      <span className="font-medium text-gray-900">
                        {featuredBlog.author.first_name} {featuredBlog.author.last_name}
                      </span>
                    </div>
                    <span>·</span>
                    <span>{formatDate(featuredBlog.created_at)}</span>
                    <span>·</span>
                    <span>{getReadingTime(featuredBlog.content)}</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Blog List */}
            <div className="space-y-12">
              {blogs.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No blogs found. Try a different search or category.</p>
                </div>
              ) : (
                blogs.map((blog) => (
                  <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                    <article className="group cursor-pointer">
                      <div className="flex items-start gap-6">
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                              {blog.author.first_name[0]}{blog.author.last_name[0]}
                            </div>
                            <span className="text-sm text-gray-700 font-medium">
                              {blog.author.first_name} {blog.author.last_name}
                            </span>
                          </div>
                          
                          <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-gray-700 transition-colors">
                            {blog.title}
                          </h2>
                          
                          <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">
                            {blog.excerpt}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <Badge variant="secondary" className="text-xs">
                              {blog.category}
                            </Badge>
                            <span>{formatDate(blog.created_at)}</span>
                            <span>·</span>
                            <span>{getReadingTime(blog.content)}</span>
                            <span>·</span>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {blog.likes_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {blog.comments_count}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Optional: Thumbnail placeholder */}
                        {blog.featured_image && (
                          <div className="w-32 h-32 bg-gray-100 rounded flex-shrink-0"></div>
                        )}
                      </div>
                    </article>
                  </Link>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
