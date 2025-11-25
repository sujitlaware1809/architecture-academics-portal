"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  Mic,
  Calendar,
  Clock,
  Users,
  Star,
  Play,
  Eye,
  ArrowRight,
  BookOpen,
  Award,
  Building,
  TrendingUp,
  Filter,
  Search,
  ChevronDown
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ExpertTalkPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const categories = [
    { id: "all", name: "All Topics" },
    { id: "sustainable", name: "Sustainable Design" },
    { id: "technology", name: "Architecture Technology" },
    { id: "heritage", name: "Heritage & Conservation" },
    { id: "urban", name: "Urban Planning" },
    { id: "interior", name: "Interior Design" },
    { id: "landscape", name: "Landscape Architecture" },
    { id: "career", name: "Career Development" },
    { id: "business", name: "Architecture Business" }
  ]

  const expertTalks = [
    {
      id: 1,
      title: "Future of Sustainable Architecture in India",
      description: "Join renowned architect Dr. Priya Sharma as she discusses innovative sustainable design practices and green building technologies that are reshaping Indian architecture.",
      expert: {
        name: "Dr. Priya Sharma",
        credentials: "Principal Architect, Green Design Studio",
        experience: "20+ years",
        specialization: "Sustainable Architecture",
        avatar: "PS"
      },
      datetime: "Dec 15, 2024 at 3:00 PM IST",
      duration: "90 minutes",
      category: "sustainable",
      status: "upcoming",
      attendees: 245,
      rating: 4.8,
      isLive: false,
      isPremium: false,
      topics: ["Net Zero Buildings", "Passive Design", "Green Materials", "Climate Responsive Design"],
      image: "sustainable-future"
    },
    {
      id: 2,
      title: "BIM Revolution: Transforming Design Workflows",
      description: "Explore how Building Information Modeling is revolutionizing the architecture industry with expert insights from Rajesh Kumar, BIM specialist with international experience.",
      expert: {
        name: "Rajesh Kumar",
        credentials: "BIM Director, TechArch Solutions",
        experience: "15+ years",
        specialization: "Digital Architecture",
        avatar: "RK"
      },
      datetime: "Dec 20, 2024 at 5:00 PM IST",
      duration: "120 minutes",
      category: "technology",
      status: "upcoming",
      attendees: 189,
      rating: 4.9,
      isLive: false,
      isPremium: true,
      topics: ["Revit Advanced", "Collaboration Tools", "4D & 5D BIM", "VR Integration"],
      image: "bim-revolution"
    },
    {
      id: 3,
      title: "Preserving Indian Heritage Through Modern Techniques",
      description: "Learn conservation techniques and heritage preservation strategies from Arjun Mehta, who has worked on restoring historical monuments across India.",
      expert: {
        name: "Arjun Mehta",
        credentials: "Conservation Architect, Heritage Foundation",
        experience: "25+ years",
        specialization: "Heritage Conservation",
        avatar: "AM"
      },
      datetime: "Live Now",
      duration: "60 minutes",
      category: "heritage",
      status: "live",
      attendees: 312,
      rating: 4.9,
      isLive: true,
      isPremium: false,
      topics: ["Traditional Techniques", "Material Science", "Documentation", "Restoration Ethics"],
      image: "heritage-conservation"
    },
    {
      id: 4,
      title: "Smart Cities: Architecture for the Digital Age",
      description: "Discover how urban architects are integrating IoT, AI, and smart technologies into city planning and building design for tomorrow's urban landscape.",
      expert: {
        name: "Sneha Patel",
        credentials: "Urban Planning Consultant",
        experience: "12+ years",
        specialization: "Smart City Planning",
        avatar: "SP"
      },
      datetime: "Dec 18, 2024 at 4:00 PM IST",
      duration: "75 minutes",
      category: "urban",
      status: "upcoming",
      attendees: 156,
      rating: 4.7,
      isLive: false,
      isPremium: true,
      topics: ["IoT Integration", "Smart Buildings", "Digital Infrastructure", "Future Cities"],
      image: "smart-cities"
    },
    {
      id: 5,
      title: "Career Success in Architecture: From Graduate to Principal",
      description: "A comprehensive guide to building a successful architecture career with insights from Vikram Joshi who built his firm from scratch to 50+ employees.",
      expert: {
        name: "Vikram Joshi",
        credentials: "Founder & Principal, VJ Architects",
        experience: "18+ years",
        specialization: "Practice Management",
        avatar: "VJ"
      },
      datetime: "Dec 22, 2024 at 6:00 PM IST",
      duration: "90 minutes",
      category: "career",
      status: "upcoming",
      attendees: 428,
      rating: 4.8,
      isLive: false,
      isPremium: false,
      topics: ["Portfolio Building", "Client Relations", "Team Management", "Business Growth"],
      image: "career-success"
    },
    {
      id: 6,
      title: "Completed: Parametric Design Masterclass",
      description: "Recording available: Master computational design with Grasshopper and create complex architectural geometries using algorithmic modeling techniques.",
      expert: {
        name: "Kavya Iyer",
        credentials: "Computational Design Specialist",
        experience: "10+ years",
        specialization: "Parametric Architecture",
        avatar: "KI"
      },
      datetime: "Recorded on Dec 5, 2024",
      duration: "180 minutes",
      category: "technology",
      status: "completed",
      attendees: 523,
      rating: 4.9,
      isLive: false,
      isPremium: true,
      topics: ["Grasshopper", "Algorithmic Design", "Form Finding", "Digital Fabrication"],
      image: "parametric-design"
    }
  ]

  const filteredTalks = expertTalks.filter(talk => {
    const matchesSearch = talk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         talk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         talk.expert.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || talk.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || talk.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const upcomingCount = expertTalks.filter(talk => talk.status === "upcoming").length
  const liveCount = expertTalks.filter(talk => talk.status === "live").length
  const completedCount = expertTalks.filter(talk => talk.status === "completed").length

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-full shadow-sm mb-6">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Expert Talk Series</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Learn from the
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Best in Architecture
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join live talks, workshops, and Q&A sessions with renowned architects, 
            urban planners, and design experts from around the world.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-2xl border border-green-100">
              <div className="text-2xl font-bold text-green-600">{liveCount}</div>
              <div className="text-sm text-gray-600">Live Now</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-white p-4 rounded-2xl border border-cyan-100">
              <div className="text-2xl font-bold text-cyan-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Recorded</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search expert talks..."
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 min-w-[180px]"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="live">Live Now</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Recorded</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Expert Talks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTalks.map((talk) => (
            <Card key={talk.id} className="border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              {/* Header with Status */}
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mic className="h-20 w-20 text-blue-300 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={`${
                      talk.status === 'live' ? 'bg-red-500 text-white animate-pulse' :
                      talk.status === 'upcoming' ? 'bg-green-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {talk.status === 'live' && <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />}
                      {talk.status === 'live' ? 'LIVE' : 
                       talk.status === 'upcoming' ? 'UPCOMING' : 'RECORDED'}
                    </Badge>
                  </div>

                  {/* Premium Badge */}
                  {talk.isPremium && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-yellow-500 text-yellow-900">
                        <Award className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}

                  {/* Category */}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      {categories.find(cat => cat.id === talk.category)?.name}
                    </Badge>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {talk.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 line-clamp-3">
                  {talk.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Expert Info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {talk.expert.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{talk.expert.name}</h4>
                    <p className="text-sm text-gray-600">{talk.expert.credentials}</p>
                    <p className="text-xs text-blue-600">{talk.expert.experience} • {talk.expert.specialization}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{talk.rating}</span>
                  </div>
                </div>

                {/* Topics */}
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-gray-700">Key Topics:</h5>
                  <div className="flex flex-wrap gap-2">
                    {talk.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{talk.datetime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{talk.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{talk.attendees} attendees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {talk.status === 'completed' ? 'Watch Recording' : 'Join Live'}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button 
                  className={`w-full ${
                    talk.status === 'live' ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' :
                    talk.status === 'upcoming' ? 'bg-green-600 hover:bg-green-700 text-white' :
                    'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {talk.status === 'live' && <Play className="mr-2 h-4 w-4" />}
                  {talk.status === 'upcoming' && <Calendar className="mr-2 h-4 w-4" />}
                  {talk.status === 'completed' && <Play className="mr-2 h-4 w-4" />}
                  
                  {talk.status === 'live' ? 'Join Live Now' :
                   talk.status === 'upcoming' ? 'Register' :
                   'Watch Recording'}
                  
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTalks.length === 0 && (
          <div className="text-center py-12">
            <Mic className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Expert Talks Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search criteria or filters</p>
            <Button onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
              setSelectedStatus("all")
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16">
          <Card className="border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-2xl overflow-hidden relative">
            <CardContent className="relative py-12 px-6 md:py-16 md:px-12">
              <div className="max-w-3xl mx-auto text-center">
                <Mic className="h-16 w-16 mx-auto mb-6 text-blue-200" />
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Want to Be an Expert Speaker?
                </h3>
                <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                  Share your expertise with our community. Apply to become a featured speaker and inspire the next generation of architects.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg rounded-xl">
                    Apply as Speaker
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg rounded-xl">
                    Contact Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}