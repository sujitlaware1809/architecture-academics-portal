"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Building2, 
  Award, 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock,
  Briefcase,
  FolderOpen
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ArchitectDashboard() {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 text-white rounded-xl shadow-lg overflow-hidden">
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
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : "A"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.first_name}!</h1>
                <p className="text-green-100">Professional certification and resources</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link href="/architect-dashboard/projects/new">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <Building2 className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </Link>
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
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Projects</p>
                <h3 className="text-2xl font-bold text-gray-900">5</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Certifications</p>
                <h3 className="text-2xl font-bold text-gray-900">3</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                <h3 className="text-2xl font-bold text-gray-900">2</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Messages</p>
                <h3 className="text-2xl font-bold text-gray-900">12</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Projects */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Urban Housing Complex</h4>
                        <p className="text-sm text-gray-500">Last updated 2 days ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/architect-dashboard/projects">
                  <Button variant="outline" className="w-full">View All Projects</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Resources */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Building Codes 2024</h4>
                      <p className="text-xs text-gray-500 mt-1">Updated PDF available</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/architect-dashboard/resources">
                  <Button variant="outline" className="w-full">Access Library</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
