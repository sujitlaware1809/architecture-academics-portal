"use client"

import { BookOpen, GraduationCap } from "lucide-react"

export default function WorkshopsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section Skeleton */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 text-center hero-section">
        <div className="relative max-w-5xl mx-auto">
          <div className="h-12 bg-white/20 rounded-lg w-3/4 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-white/20 rounded-lg w-2/3 mx-auto mb-8 animate-pulse"></div>
          <div className="h-12 bg-white/30 rounded-full w-40 mx-auto animate-pulse"></div>
        </div>
      </section>

      {/* Search and Filters Skeleton */}
      <section className="max-w-7xl mx-auto px-4 py-8 -mt-8 z-10 relative">
        <div className="bg-white rounded-xl shadow-xl p-6 search-card">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="relative flex-grow">
              <div className="h-12 bg-gray-100 rounded-md w-full animate-pulse"></div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="h-12 bg-gray-100 rounded-md w-32 animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded-md w-32 animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded-md w-32 animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded-md w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Skeleton */}
      <section className="max-w-7xl mx-auto px-4 workshops-section">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-gray-200 rounded-md w-48 animate-pulse"></div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-300" />
            <div className="h-5 bg-gray-200 rounded-md w-36 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                <div className="h-4 bg-gray-100 rounded-md w-full"></div>
                <div className="h-4 bg-gray-100 rounded-md w-full"></div>
                <div className="flex justify-between items-center pt-4">
                  <div className="h-8 bg-gray-200 rounded-md w-24"></div>
                  <div className="h-8 bg-purple-100 rounded-md w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FDP Section Skeleton */}
      <section className="fdp-section mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-gray-200 rounded-md w-64 animate-pulse"></div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-300" />
              <div className="h-5 bg-gray-200 rounded-md w-36 animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-full"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-full"></div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-8 bg-gray-200 rounded-md w-24"></div>
                    <div className="h-8 bg-indigo-100 rounded-md w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
