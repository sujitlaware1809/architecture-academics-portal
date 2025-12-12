"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContextualStudyComingSoon() {
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
      <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Coming Soon</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contextual Study</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Urban & rural architecture studies with real-world insights and analysis.
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
                Deep dive into urban and rural architecture with comprehensive case studies, site analysis, and contextual research conducted by experts.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Key Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Case Studies</p>
                    <p className="text-sm text-gray-500">Detailed analysis of iconic projects and buildings</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Site Analysis</p>
                    <p className="text-sm text-gray-500">Urban planning and contextual research methods</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Expert Guidance</p>
                    <p className="text-sm text-gray-500">Learn from renowned architects and planners</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Global Perspective</p>
                    <p className="text-sm text-gray-500">Study architecture from around the world</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12 border-2 border-green-100">
              <div className="space-y-4">
                <MapPin className="h-16 w-16 text-green-500 mx-auto" />
                <div className="h-4 bg-green-200 rounded-full w-3/4 mx-auto"></div>
                <div className="h-4 bg-green-200 rounded-full w-full"></div>
              </div>
              <div className="mt-8 space-y-2">
                <div className="h-3 bg-green-200 rounded-full w-full"></div>
                <div className="h-3 bg-green-200 rounded-full w-5/6"></div>
                <div className="h-3 bg-green-200 rounded-full w-4/5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-12 border-2 border-green-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Explore Architecture in Context</h3>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Understand how geography, culture, and society shape architectural design. Coming very soon!
          </p>
          <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-2">
            Notify Me
          </Button>
        </div>
      </div>
    </div>
  )
}
