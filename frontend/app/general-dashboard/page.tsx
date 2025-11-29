"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, Building2, Package, Wrench, Users, TrendingUp } from "lucide-react"

export default function GeneralDashboard() {
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
              <h1 className="text-3xl font-bold text-gray-900">General User Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome to Architecture Academics Portal</p>
            </div>
            <div className="flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-lg">
              <Globe className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">General User</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Your Category</h2>
          <p className="text-gray-600 mb-6">Choose your area of interest to access relevant content and resources</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="border-2 border-purple-200 hover:border-purple-500 rounded-xl p-6 transition-all hover:shadow-lg group">
              <Building2 className="h-10 w-10 text-purple-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 text-center mb-2">Industry Partner</h3>
              <p className="text-xs text-gray-600 text-center">Collaborate with architecture firms and professionals</p>
            </button>

            <button className="border-2 border-blue-200 hover:border-blue-500 rounded-xl p-6 transition-all hover:shadow-lg group">
              <Wrench className="h-10 w-10 text-blue-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 text-center mb-2">Service Provider</h3>
              <p className="text-xs text-gray-600 text-center">Offer services to the architecture community</p>
            </button>

            <button className="border-2 border-green-200 hover:border-green-500 rounded-xl p-6 transition-all hover:shadow-lg group">
              <Package className="h-10 w-10 text-green-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 text-center mb-2">Material Supplier</h3>
              <p className="text-xs text-gray-600 text-center">Architectural materials and products</p>
            </button>

            <button className="border-2 border-orange-200 hover:border-orange-500 rounded-xl p-6 transition-all hover:shadow-lg group">
              <Globe className="h-10 w-10 text-orange-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 text-center mb-2">Other Interest</h3>
              <p className="text-xs text-gray-600 text-center">Explore other opportunities</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Opportunities</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Partner with Architecture Firms</h3>
                      <p className="text-sm text-gray-600 mt-1">Connect with leading architecture practices for collaboration</p>
                      <button className="mt-3 text-sm font-medium text-purple-600 hover:text-purple-700">Learn More →</button>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">List Your Products</h3>
                      <p className="text-sm text-gray-600 mt-1">Showcase architectural materials to our community</p>
                      <button className="mt-3 text-sm font-medium text-green-600 hover:text-green-700">Get Started →</button>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Network with Professionals</h3>
                      <p className="text-sm text-gray-600 mt-1">Join discussions and connect with architecture experts</p>
                      <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">Join Community →</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Updates</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">New Partnership Program Launched</h4>
                    <p className="text-xs text-gray-600 mt-1">Collaborate with top architecture firms</p>
                    <span className="text-xs text-gray-500 mt-1 block">2 days ago</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                  <Package className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Material Showcase Event</h4>
                    <p className="text-xs text-gray-600 mt-1">Present your products to 500+ architects</p>
                    <span className="text-xs text-gray-500 mt-1 block">5 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Browse Partners</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">List Products</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Join Community</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <Globe className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-bold mb-2">Advertise With Us</h3>
              <p className="text-sm text-purple-100 mb-4">
                Reach thousands of architecture professionals and students
              </p>
              <button className="w-full bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
