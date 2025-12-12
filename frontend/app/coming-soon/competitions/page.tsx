"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CompetitionsComingSoon() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button 
            onClick={() => router.back()}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Coming Soon</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Design Competitions</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Showcase your design skills and compete with architects worldwide.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Description */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What to Expect</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Compete in exciting design challenges with fellow architects. Win prizes, gain recognition, and build your portfolio with real-world projects.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Key Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Multiple Competitions</p>
                    <p className="text-sm text-gray-500">Monthly design challenges on various themes</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Prize Pool</p>
                    <p className="text-sm text-gray-500">Win exciting prizes and cash rewards</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Expert Judging</p>
                    <p className="text-sm text-gray-500">Evaluated by industry professionals</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Portfolio Showcase</p>
                    <p className="text-sm text-gray-500">Display your winning designs publicly</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-12 border-2 border-purple-100">
              <div className="space-y-4">
                <Trophy className="h-16 w-16 text-purple-500 mx-auto" />
                <div className="h-4 bg-purple-200 rounded-full w-3/4 mx-auto"></div>
                <div className="h-4 bg-purple-200 rounded-full w-full"></div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-2">
                <div className="h-20 rounded-lg bg-yellow-100"></div>
                <div className="h-20 rounded-lg bg-gray-300"></div>
                <div className="h-20 rounded-lg bg-orange-100"></div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-12 border-2 border-purple-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Ready to Compete</h3>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Prepare your designs! Competitions will launch soon with exciting themes and rewards.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2">
            Join Waitlist
          </Button>
        </div>
      </div>
    </div>
  )
}
