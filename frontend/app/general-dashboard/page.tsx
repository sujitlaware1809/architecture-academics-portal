"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Globe, 
  Building2, 
  Package, 
  Wrench, 
  Users, 
  TrendingUp,
  Search,
  ArrowRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GeneralDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900 text-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                {user.profile_image_url ? (
                  <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_image_url}`} 
                      alt={user.first_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-xl">
                    <span className="text-3xl font-bold text-white">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : "G"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.first_name}!</h1>
                <p className="text-purple-100">Explore the world of architecture</p>
              </div>
            </div>
            
            {/* Merged profile controls: circular profession progress + Edit Profile button */}
            <div className="flex items-center gap-4">
              {/* Circular progress for profession */}
              <div className="flex flex-col items-center text-center">
                {/**
                 * Simple SVG circular progress. Uses user.profession_progress (0-100) if available
                 * otherwise falls back to 40. Shows profession name below.
                 */}
                <div className="relative flex items-center justify-center">
                  <svg className="-rotate-90" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="36" cy="36" r="30" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
                    {/* progress circle */}
                    <circle
                      cx="36"
                      cy="36"
                      r="30"
                      stroke="white"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.PI * 2 * 30}`}
                      strokeDashoffset={`${Math.PI * 2 * 30 * (1 - ((user.profession_progress ?? 40) / 100))}`}
                      style={{ transition: 'stroke-dashoffset 600ms ease' }}
                    />
                  </svg>
                  <div className="absolute text-sm font-semibold">
                    <span>{user.profession_progress ?? 40}%</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-purple-100">{user.profession ?? 'Profession'}</div>
              </div>

              {/* Edit profile button */}
              <div>
                <Link href="/profile/setup">
                  <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                    <Search className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Topics Followed</p>
                <h3 className="text-2xl font-bold text-gray-900">5</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Resources Saved</p>
                <h3 className="text-2xl font-bold text-gray-900">12</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Community Posts</p>
                <h3 className="text-2xl font-bold text-gray-900">8</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Activity Score</p>
                <h3 className="text-2xl font-bold text-gray-900">450</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Explore Categories */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Explore Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Architecture Design", icon: Building2, color: "bg-blue-100 text-blue-600" },
                  { name: "Interior Design", icon: Package, color: "bg-green-100 text-green-600" },
                  { name: "Construction", icon: Wrench, color: "bg-orange-100 text-orange-600" },
                  { name: "Urban Planning", icon: Globe, color: "bg-purple-100 text-purple-600" }
                ].map((category, i) => (
                  <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className={`h-12 w-12 ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{category.name}</h4>
                      <p className="text-sm text-gray-500">View resources</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Trending */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Trending Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                      {i}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">Sustainable Architecture Trends 2024</h4>
                      <p className="text-xs text-gray-500 mt-1">5 min read</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/general-dashboard/explore">
                  <Button variant="outline" className="w-full">View All Trending</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
