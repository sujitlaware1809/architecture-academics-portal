"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  Search,
  MessageSquare,
  ThumbsUp,
  Eye,
  CheckCircle2,
  Plus,
  Filter,
  TrendingUp,
  Pin,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Discussion {
  id: number
  title: string
  content: string
  category: string
  tags: string
  is_solved: boolean
  is_pinned: boolean
  views_count: number
  replies_count: number
  likes_count: number
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
  { value: "all", label: "All Topics" },
  { value: "General Discussion", label: "General Discussion" },
  { value: "Design Help", label: "Design Help" },
  { value: "Technical Questions", label: "Technical Questions" },
  { value: "Career Advice", label: "Career Advice" },
  { value: "Software & Tools", label: "Software & Tools" },
  { value: "Education & Learning", label: "Education & Learning" },
  { value: "Project Feedback", label: "Project Feedback" },
  { value: "Industry News", label: "Industry News" },
  { value: "Networking", label: "Networking" },
]

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    "General Discussion": "bg-gray-100 text-gray-800",
    "Design Help": "bg-blue-100 text-blue-800",
    "Technical Questions": "bg-purple-100 text-purple-800",
    "Career Advice": "bg-green-100 text-green-800",
    "Software & Tools": "bg-indigo-100 text-indigo-800",
    "Education & Learning": "bg-yellow-100 text-yellow-800",
    "Project Feedback": "bg-pink-100 text-pink-800",
    "Industry News": "bg-red-100 text-red-800",
    "Networking": "bg-teal-100 text-teal-800",
  }
  return colors[category] || "bg-gray-100 text-gray-800"
}

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated())
    fetchDiscussions()
  }, [selectedCategory, searchQuery])

  const fetchDiscussions = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: 50
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      if (selectedCategory && selectedCategory !== "all") {
        params.category = selectedCategory
      }

      const response = await api.get("/discussions", { params })
      setDiscussions(response.data)
    } catch (error) {
      console.error("Error fetching discussions:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) return "just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Discussion Community
              </h1>
              <p className="text-lg text-gray-600">
                Ask questions, share knowledge, and connect with fellow architects
              </p>
            </div>
            {isAuthenticated ? (
              <Link href="/discussions/new">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg gap-2">
                  <Plus className="h-5 w-5" />
                  Ask Question
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg gap-2">
                  <Plus className="h-5 w-5" />
                  Sign In to Ask
                </Button>
              </Link>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.value
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No discussions found
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to start a discussion in this category!
              </p>
              {isAuthenticated && (
                <Link href="/discussions/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Ask a Question
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Link key={discussion.id} href={`/discussions/${discussion.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {discussion.is_pinned && (
                            <Pin className="h-4 w-4 text-purple-600" />
                          )}
                          {discussion.is_solved && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Solved
                            </Badge>
                          )}
                          <Badge className={getCategoryColor(discussion.category)}>
                            {discussion.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                          {discussion.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {discussion.content}
                    </p>
                    
                    {/* Tags */}
                    {discussion.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {discussion.tags.split(',').slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                            {discussion.author.first_name[0]}{discussion.author.last_name[0]}
                          </div>
                          <span className="font-medium text-gray-700">
                            {discussion.author.first_name} {discussion.author.last_name}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(discussion.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {discussion.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {discussion.replies_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {discussion.likes_count}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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
