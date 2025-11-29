"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building, BookOpen, Users, Award, TrendingUp, Calendar } from "lucide-react"

export default function FacultyDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.first_name}!</p>
            </div>
            <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Faculty Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Students Enrolled</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">245</p>
              </div>
              <Users className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Course Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">4.8</p>
              </div>
              <Award className="h-10 w-10 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">87%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - All Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">All Available Courses</h2>
              <p className="text-gray-600 mb-4">Browse and access all courses on the platform</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✓ You have access to view all courses
                  <br />
                  ✓ Explore course materials and content
                  <br />
                  ✓ Monitor student progress and engagement
                </p>
              </div>
            </div>

            {/* Request Special Courses Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Building className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Request Special Courses</h2>
                  <p className="text-gray-600 mt-1">Submit requests for specialized courses or custom content</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Advanced Sustainable Architecture"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the course content and objectives..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all">
                  Submit Request
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Browse Courses</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Schedule Classes</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Student Analytics</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Faculty Resources</h3>
              <p className="text-sm text-blue-100 mb-4">Access teaching materials, guides, and support</p>
              <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                View Resources
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
