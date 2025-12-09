"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"
import { auth, type User } from "@/lib/auth"
import { 
  Search, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Tag, 
  User as UserIcon,
  TrendingUp,
  ArrowRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

// Interface matching the backend response
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
  read_time_minutes?: number
}

const CATEGORIES = [
  "All",
  "Education",
  "Exam Prep",
  "Architecture",
  "Career",
  "Tutorials",
  "Design",
  "Technology"
]

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      // Use the correct API endpoint
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBase}/api/blogs?limit=100`)
      if (!response.ok) throw new Error('Failed to fetch blogs')
      
      const data: Blog[] = await response.json()
      
      // Filter only published blogs
      const publishedBlogs = data.filter(blog => blog.status === 'published')
      setBlogs(publishedBlogs)
      
      // Find a featured blog
      const featured = publishedBlogs.find(blog => blog.is_featured) || publishedBlogs[0]
      setFeaturedBlog(featured || null)
      
    } catch (err) {
      console.error("Error fetching blogs:", err)
    } finally {
      setLoading(false)
    }
  }

  // Filter blogs based on search and category
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory.toUpperCase().replace(' ', '_') || blog.category === selectedCategory
    
    // Exclude the featured blog from the main list if it's displayed separately
    const isNotFeatured = featuredBlog ? blog.id !== featuredBlog.id : true
    
    return matchesSearch && matchesCategory && isNotFeatured
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Fallback image if featured_image is missing
  const getBlogImage = (blog: Blog) => {
    if (blog.featured_image) return blog.featured_image
    return `https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&auto=format&fit=crop&q=60`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Architecture <span className="text-blue-400">Insights</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Explore the latest trends, educational resources, and career advice for architects and students.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {CATEGORIES.slice(1, 5).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-2 rounded-full border border-gray-600 hover:border-blue-400 hover:text-blue-400 transition-colors text-sm"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        {/* Featured Post Card */}
        {loading ? (
          <Skeleton className="w-full h-[400px] rounded-xl" />
        ) : featuredBlog && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-16 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <Image
                  src={getBlogImage(featuredBlog)}
                  alt={featuredBlog.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1">
                    Featured
                  </Badge>
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-4">
                  <span className="uppercase tracking-wider">{featuredBlog.category.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{formatDate(featuredBlog.created_at)}</span>
                </div>
                
                <Link href={`/blogs/${featuredBlog.slug}`}>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                    {featuredBlog.title}
                  </h2>
                </Link>
                
                <p className="text-gray-600 mb-6 text-lg line-clamp-3">
                  {featuredBlog.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {featuredBlog.author.first_name} {featuredBlog.author.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {featuredBlog.read_time_minutes || 5} min read
                      </p>
                    </div>
                  </div>
                  
                  <Link href={`/blogs/${featuredBlog.slug}`}>
                    <Button variant="outline" className="group">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content - Blog Grid */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Latest Articles</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Sort by:</span>
                <select className="bg-transparent border-none font-medium text-gray-900 focus:ring-0 cursor-pointer">
                  <option>Newest</option>
                  <option>Popular</option>
                  <option>Oldest</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredBlogs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {filteredBlogs.map(blog => (
                  <Card key={blog.id} className="group hover:shadow-lg transition-all duration-300 border-gray-100 overflow-hidden flex flex-col h-full">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={getBlogImage(blog)}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-900 font-medium hover:bg-white">
                          {blog.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex-grow">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Calendar size={14} />
                        <span>{formatDate(blog.created_at)}</span>
                        <span>•</span>
                        <Clock size={14} />
                        <span>{blog.read_time_minutes || 5} min read</span>
                      </div>
                      
                      <Link href={`/blogs/${blog.slug}`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {blog.excerpt}
                      </p>
                    </CardContent>
                    
                    <CardFooter className="p-6 pt-0 mt-auto border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <UserIcon size={12} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {blog.author.first_name} {blog.author.last_name}
                        </span>
                      </div>
                      
                      <Link href={`/blogs/${blog.slug}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                        Read <ChevronRight size={14} />
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-500">Try adjusting your search or category filter</p>
                <Button 
                  variant="link" 
                  onClick={() => {setSearchQuery(""); setSelectedCategory("All")}}
                  className="mt-2 text-blue-600"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Search Widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">Search</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search articles..." 
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Categories Widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">Categories</h4>
              <div className="space-y-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                      selectedCategory === category 
                        ? "bg-blue-50 text-blue-700 font-medium" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{category}</span>
                    {category === "All" && <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">{blogs.length}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter Widget */}
            <div className="bg-blue-600 p-6 rounded-xl shadow-lg text-white">
              <h4 className="font-bold text-xl mb-2">Subscribe to our newsletter</h4>
              <p className="text-blue-100 text-sm mb-6">
                Get the latest architecture news, tutorials, and career advice delivered to your inbox.
              </p>
              <div className="space-y-3">
                <Input 
                  placeholder="Your email address" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20"
                />
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-blue-200 mt-4 text-center">
                No spam, unsubscribe at any time.
              </p>
            </div>

            {/* Popular Tags */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" />
                Trending Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Sustainability", "NATA 2025", "Design", "Urban Planning", "Interior", "Student Life", "Technology", "History"].map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
