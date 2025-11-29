"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Award, FileText, Send, CheckCircle2, Clock } from "lucide-react"

export default function ArchitectDashboard() {
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
              <h1 className="text-3xl font-bold text-gray-900">Architect Dashboard</h1>
              <p className="text-gray-600 mt-1">Professional certification and resources</p>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Architect</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Award className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Professional Architecture Portal</h3>
              <p className="text-blue-700 mt-1">
                As a practicing architect, you have access to certification requests and professional resources. 
                Note: Course content is not available for architect accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Certification Request */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-3 mb-6">
                <FileText className="h-7 w-7 text-green-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Request Course Certification</h2>
                  <p className="text-gray-600 mt-1">Submit requests for professional certifications and credentials</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certification Type</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option>Select certification type</option>
                    <option>Professional Practice Certification</option>
                    <option>Sustainable Design Certification</option>
                    <option>BIM & Digital Architecture</option>
                    <option>Heritage Conservation</option>
                    <option>Urban Design Certification</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course/Topic Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Advanced Sustainable Architecture Practices"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CAO Registration Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="Council of Architecture registration number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">* This helps us verify your professional credentials</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Details & Requirements</label>
                  <textarea
                    rows={5}
                    placeholder="Describe your certification requirements, objectives, and any specific topics you'd like covered..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Submit Certification Request</span>
                </button>
              </div>
            </div>

            {/* Request History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Requests</h2>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Sustainable Architecture Certification</h3>
                      <p className="text-sm text-gray-600 mt-1">Submitted on Nov 20, 2025</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-700">Pending</span>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">BIM Professional Certification</h3>
                      <p className="text-sm text-gray-600 mt-1">Submitted on Nov 10, 2025</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700">Approved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info & Resources */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Resources</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Certifications</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Guidelines</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Industry Updates</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
              <Building2 className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-bold mb-2">Architect Portal</h3>
              <p className="text-sm text-green-100 mb-4">
                Access professional certifications, industry resources, and connect with other architects
              </p>
              <div className="bg-white/20 rounded-lg p-3 text-sm">
                <p className="font-semibold">Need Help?</p>
                <p className="text-green-100 mt-1">Contact our professional services team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
