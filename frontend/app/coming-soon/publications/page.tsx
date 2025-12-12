"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, BookMarked } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PublicationsComingSoon() {
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
      <div className="bg-gradient-to-r from-slate-600 via-gray-500 to-stone-500 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Coming Soon</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Research & Publications</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Access cutting-edge research and published articles from leading architects and scholars.
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
                A comprehensive repository of research papers, white papers, and publications from renowned architects, academics, and industry experts.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Key Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-slate-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Research Papers</p>
                    <p className="text-sm text-gray-500">Access peer-reviewed architectural research</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-slate-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">White Papers</p>
                    <p className="text-sm text-gray-500">Industry insights and technical documentation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-slate-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Expert Articles</p>
                    <p className="text-sm text-gray-500">Thought leadership from industry leaders</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-slate-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Citation Tools</p>
                    <p className="text-sm text-gray-500">Easy citation and reference management</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-12 border-2 border-slate-100">
              <div className="space-y-4">
                <BookMarked className="h-16 w-16 text-slate-500 mx-auto" />
                <div className="h-4 bg-slate-200 rounded-full w-3/4 mx-auto"></div>
                <div className="h-4 bg-slate-200 rounded-full w-full"></div>
              </div>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/2 mt-1"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/2 mt-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-12 border-2 border-slate-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated on Latest Research</h3>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Access the latest architectural research and publications. Sign up to be notified when this feature launches.
          </p>
          <Button className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-2">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  )
}
