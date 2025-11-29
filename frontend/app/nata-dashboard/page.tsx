"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, BookOpen, Video, Building2, Trophy, TrendingUp } from "lucide-react"

export default function NATADashboard() {
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
              <h1 className="text-3xl font-bold text-gray-900">NATA Preparation Dashboard</h1>
              <p className="text-gray-600 mt-1">Your complete NATA exam preparation portal</p>
            </div>
            <div className="flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-lg">
              <Trophy className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">NATA Student</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">NATA Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
              </div>
              <BookOpen className="h-10 w-10 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">65%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mock Tests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
              </div>
              <Trophy className="h-10 w-10 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Videos Watched</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">34</p>
              </div>
              <Video className="h-10 w-10 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - NATA Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">NATA Preparation Courses</h2>
              <p className="text-gray-600 mb-6">Comprehensive courses designed specifically for NATA exam preparation</p>
              
              <div className="space-y-4">
                {/* Course Cards */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Drawing Skills & Techniques</h3>
                      <p className="text-sm text-gray-600 mt-1">Master architectural drawing for NATA Part A</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div className="w-3/4 h-2 bg-orange-600 rounded-full"></div>
                          </div>
                          <span className="text-xs text-gray-600">75%</span>
                        </div>
                        <button className="text-sm font-medium text-orange-600 hover:text-orange-700">Continue →</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">General Aptitude & Mathematics</h3>
                      <p className="text-sm text-gray-600 mt-1">Aptitude test preparation for NATA Part B</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div className="w-1/2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                          <span className="text-xs text-gray-600">50%</span>
                        </div>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Continue →</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Video className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">3D Perception & Visualization</h3>
                      <p className="text-sm text-gray-600 mt-1">Develop spatial understanding for architecture</p>
                      <div className="mt-3">
                        <button className="text-sm font-medium text-green-600 hover:text-green-700">Start Course →</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Guidance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Career Guidance Videos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                  <Video className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-sm text-gray-900">Life as an Architect</h4>
                  <p className="text-xs text-gray-600 mt-1">15 min</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                  <Video className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-sm text-gray-900">Top Architecture Colleges</h4>
                  <p className="text-xs text-gray-600 mt-1">20 min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Top Architecture Colleges</h2>
              <div className="space-y-3">
                <div className="border-l-4 border-orange-500 pl-3">
                  <h4 className="font-semibold text-gray-900 text-sm">IIT Kharagpur</h4>
                  <p className="text-xs text-gray-600">B.Arch Program</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <h4 className="font-semibold text-gray-900 text-sm">SPA Delhi</h4>
                  <p className="text-xs text-gray-600">School of Planning & Architecture</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <h4 className="font-semibold text-gray-900 text-sm">CEPT University</h4>
                  <p className="text-xs text-gray-600">Ahmedabad</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <h4 className="font-semibold text-gray-900 text-sm">NIT Trichy</h4>
                  <p className="text-xs text-gray-600">National Institute of Technology</p>
                </div>
              </div>
              <button className="w-full mt-4 text-sm font-medium text-orange-600 hover:text-orange-700 border border-orange-200 rounded-lg py-2">
                View All Colleges →
              </button>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <Trophy className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-bold mb-2">NATA Exam Tips</h3>
              <p className="text-sm text-orange-100 mb-4">
                Get expert tips and strategies to ace your NATA examination
              </p>
              <button className="w-full bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                View Tips
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
