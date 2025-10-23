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
  // Hardcoded discussions data
  const hardcodedDiscussions: Discussion[] = [
    {
      id: 1,
      title: "Best software for rendering architectural designs?",
      content: "Looking for recommendations on rendering software. Currently using V-Ray but wondering if there are better alternatives for photorealistic renders. What do you all use?",
      category: "Software & Tools",
      tags: "Rendering,3D,Software,V-Ray",
      is_solved: false,
      is_pinned: true,
      views_count: 1250,
      replies_count: 24,
      likes_count: 45,
      author_id: 1,
      author: {
        id: 1,
        first_name: "Amit",
        last_name: "Singh",
        email: "amit@example.com"
      },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: "How to prepare portfolio for architectural firms?",
      content: "I'm a fresh graduate and want to create an impressive portfolio. What should I include? How many projects? Any specific layout recommendations? Would appreciate any guidance!",
      category: "Career Advice",
      tags: "Portfolio,Jobs,Career,Fresh Graduate",
      is_solved: true,
      is_pinned: false,
      views_count: 890,
      replies_count: 18,
      likes_count: 32,
      author_id: 2,
      author: {
        id: 2,
        first_name: "Neha",
        last_name: "Reddy",
        email: "neha@example.com"
      },
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      title: "NATA 2025 preparation strategy - Need advice",
      content: "Appearing for NATA next year. What are the best resources for preparation? Should I join coaching or is self-study sufficient? Any tips from those who have cleared it?",
      category: "Education & Learning",
      tags: "NATA,Exam,Preparation,Entrance Test",
      is_solved: false,
      is_pinned: false,
      views_count: 2100,
      replies_count: 32,
      likes_count: 67,
      author_id: 3,
      author: {
        id: 3,
        first_name: "Rohan",
        last_name: "Gupta",
        email: "rohan@example.com"
      },
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      title: "Sustainable materials for low-cost housing projects",
      content: "Working on a low-cost housing project and want to incorporate sustainable materials. What are some cost-effective eco-friendly alternatives? Looking for practical suggestions.",
      category: "Design Help",
      tags: "Sustainable,Materials,Housing,Eco-Friendly",
      is_solved: true,
      is_pinned: false,
      views_count: 670,
      replies_count: 15,
      likes_count: 28,
      author_id: 4,
      author: {
        id: 4,
        first_name: "Kavya",
        last_name: "Iyer",
        email: "kavya@example.com"
      },
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      title: "Freelancing as an architect - Tips and experiences?",
      content: "Thinking of starting freelance architectural practice. Would love to hear from experienced freelancers about challenges, client acquisition, pricing strategies, and work-life balance.",
      category: "Career Advice",
      tags: "Freelancing,Business,Career,Self-Employment",
      is_solved: false,
      is_pinned: false,
      views_count: 1580,
      replies_count: 41,
      likes_count: 53,
      author_id: 5,
      author: {
        id: 5,
        first_name: "Vikram",
        last_name: "Joshi",
        email: "vikram@example.com"
      },
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 6,
      title: "Best practices for client presentations?",
      content: "How do you make effective presentations to clients? Any tips on software, presentation structure, or dealing with difficult clients?",
      category: "General Discussion",
      tags: "Presentation,Clients,Communication",
      is_solved: true,
      is_pinned: false,
      views_count: 450,
      replies_count: 12,
      likes_count: 19,
      author_id: 6,
      author: {
        id: 6,
        first_name: "Priya",
        last_name: "Sharma",
        email: "priya@example.com"
      },
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 7,
      title: "Understanding building codes and regulations in India",
      content: "Can someone explain the key building codes and regulations in India? Particularly for residential projects. NBC 2016 compliance requirements?",
      category: "Technical Questions",
      tags: "Building Codes,Regulations,NBC,Legal",
      is_solved: false,
      is_pinned: false,
      views_count: 980,
      replies_count: 22,
      likes_count: 41,
      author_id: 7,
      author: {
        id: 7,
        first_name: "Arjun",
        last_name: "Mehta",
        email: "arjun@example.com"
      },
      created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 8,
      title: "Feedback on my residential project design",
      content: "Sharing my recent residential project design. Would appreciate constructive feedback on the layout, elevation, and spatial planning. Link to drawings in comments.",
      category: "Project Feedback",
      tags: "Feedback,Residential,Design Review",
      is_solved: false,
      is_pinned: false,
      views_count: 1120,
      replies_count: 28,
      likes_count: 62,
      author_id: 8,
      author: {
        id: 8,
        first_name: "Sneha",
        last_name: "Patel",
        email: "sneha@example.com"
      },
      created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 9,
      title: "BIM implementation in small architectural firms",
      content: "Is it worth implementing BIM in a small 5-person firm? What's the learning curve? Cost implications? Would love to hear real experiences.",
      category: "Software & Tools",
      tags: "BIM,Revit,Implementation,Small Firm",
      is_solved: true,
      is_pinned: false,
      views_count: 750,
      replies_count: 19,
      likes_count: 35,
      author_id: 9,
      author: {
        id: 9,
        first_name: "Karan",
        last_name: "Desai",
        email: "karan@example.com"
      },
      created_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 10,
      title: "Networking events for architects in India",
      content: "Are there any good networking events or conferences for architects in India? Looking to expand my professional network and learn from industry leaders.",
      category: "Networking",
      tags: "Networking,Events,Conferences,Professional",
      is_solved: false,
      is_pinned: false,
      views_count: 540,
      replies_count: 14,
      likes_count: 22,
      author_id: 10,
      author: {
        id: 10,
        first_name: "Aisha",
        last_name: "Khan",
        email: "aisha@example.com"
      },
      created_at: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString()
    }
  ]

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
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Filter hardcoded discussions
      let filteredDiscussions = [...hardcodedDiscussions]
      
      // Filter by category
      if (selectedCategory && selectedCategory !== "all") {
        filteredDiscussions = filteredDiscussions.filter(
          d => d.category === selectedCategory
        )
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredDiscussions = filteredDiscussions.filter(
          d => d.title.toLowerCase().includes(query) || 
               d.content.toLowerCase().includes(query) ||
               d.tags.toLowerCase().includes(query)
        )
      }
      
      setDiscussions(filteredDiscussions)
    } catch (error) {
      console.error("Error fetching discussions:", error)
      setDiscussions(hardcodedDiscussions)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discussions.map((discussion) => (
              <Link key={discussion.id} href={`/discussions/${discussion.id}`}>
                <article className="group cursor-pointer h-full">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 h-full flex flex-col">
                    {/* Header with Gradient Background */}
                    <div className="relative p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 border-b border-gray-100">
                      {/* Status Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {discussion.is_pinned && (
                          <Badge className="bg-purple-600 text-white hover:bg-purple-600 gap-1">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </Badge>
                        )}
                        {discussion.is_solved && (
                          <Badge className="bg-green-500 text-white hover:bg-green-500 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Solved
                          </Badge>
                        )}
                        <Badge className={getCategoryColor(discussion.category)}>
                          {discussion.category}
                        </Badge>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-purple-600 transition-colors line-clamp-2 mb-3">
                        {discussion.title}
                      </h2>

                      {/* Category Icon */}
                      <div className="absolute top-4 right-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">
                        {discussion.category === "Technical Help" && "🔧"}
                        {discussion.category === "Design Critique" && "🎨"}
                        {discussion.category === "Career Advice" && "💼"}
                        {discussion.category === "Software & Tools" && "💻"}
                        {discussion.category === "Study Materials" && "📚"}
                        {discussion.category === "Project Discussion" && "🏗️"}
                        {discussion.category === "General" && "💬"}
                        {discussion.category === "Networking" && "🤝"}
                        {!["Technical Help", "Design Critique", "Career Advice", "Software & Tools", "Study Materials", "Project Discussion", "General", "Networking"].includes(discussion.category) && "💭"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                        {discussion.content}
                      </p>
                      
                      {/* Tags */}
                      {discussion.tags && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {discussion.tags.split(',').slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Author */}
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {discussion.author.first_name[0]}{discussion.author.last_name[0]}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-medium text-gray-900 truncate">
                            {discussion.author.first_name} {discussion.author.last_name}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(discussion.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Footer Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {discussion.views_count}
                          </span>
                          <span className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {discussion.replies_count}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 group-hover:text-purple-500 transition-colors font-medium">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {discussion.likes_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
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
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
