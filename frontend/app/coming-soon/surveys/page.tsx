"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SurveysComingSoon() {
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
      <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Coming Soon</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Surveys</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Share your feedback and help us improve our platform. Your voice matters!
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
                Our Community Surveys feature will allow you to participate in regular feedback surveys, help shape the future of the platform, and earn rewards for your contributions.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Key Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-pink-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Regular Surveys</p>
                    <p className="text-sm text-gray-500">Participate in weekly and monthly surveys</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-pink-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Earn Rewards</p>
                    <p className="text-sm text-gray-500">Get points and badges for your feedback</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-pink-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Impact the Platform</p>
                    <p className="text-sm text-gray-500">Your feedback directly influences our development</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-pink-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Leaderboard</p>
                    <p className="text-sm text-gray-500">Compete with other survey participants</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-12 border-2 border-pink-100">
              <div className="space-y-4">
                <div className="h-4 bg-pink-200 rounded-full w-3/4"></div>
                <div className="h-4 bg-pink-200 rounded-full w-full"></div>
                <div className="h-4 bg-pink-200 rounded-full w-5/6"></div>
              </div>
              <div className="mt-8 space-y-2">
                <div className="flex gap-2">
                  <div className="h-12 w-12 rounded-lg bg-pink-200"></div>
                  <div className="h-12 w-12 rounded-lg bg-rose-200"></div>
                  <div className="h-12 w-12 rounded-lg bg-orange-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-12 border-2 border-pink-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Be Among the First</h3>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Stay tuned! We'll notify you as soon as Community Surveys launches.
          </p>
          <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-2">
            Notify Me When Ready
          </Button>
        </div>
      </div>
    </div>
  )
}
