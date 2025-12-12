"use client"

import Link from "next/link"
import { Users, Trophy, Building2, BookMarked } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExplorePage() {
  const features = [
    {
      id: 1,
      title: "SURVEYS",
      description: "Community surveys",
      icon: Users,
      href: "/coming-soon/surveys",
      bgColor: "bg-yellow-500",
      borderColor: "border-yellow-100",
      hoverColor: "hover:shadow-yellow-200",
    },
    {
      id: 2,
      title: "COMPETITIONS",
      description: "Design competitions",
      icon: Trophy,
      href: "/coming-soon/competitions",
      bgColor: "bg-blue-500",
      borderColor: "border-blue-100",
      hoverColor: "hover:shadow-blue-200",
    },
    {
      id: 3,
      title: "CONTEXTUAL STUDY",
      description: "Urban & rural architecture studies",
      icon: Building2,
      href: "/coming-soon/contextual-study",
      bgColor: "bg-cyan-500",
      borderColor: "border-cyan-100",
      hoverColor: "hover:shadow-cyan-200",
    },
    {
      id: 4,
      title: "PUBLICATIONS",
      description: "Research & publications",
      icon: BookMarked,
      href: "/coming-soon/publications",
      bgColor: "bg-slate-500",
      borderColor: "border-slate-100",
      hoverColor: "hover:shadow-slate-200",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Explore Features</h1>
          <p className="text-gray-600 mt-2">Discover upcoming features and opportunities on the platform</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What's Coming Next</h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Explore exciting new features that will enhance your architecture learning and collaboration experience.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.id} href={feature.href} className="block group">
                <Card className={`h-full transition-all duration-300 hover:shadow-lg ${feature.hoverColor} cursor-pointer border ${feature.borderColor} bg-white`}>
                  <CardHeader className="text-center space-y-4">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className={`${feature.bgColor} rounded-2xl p-4 text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>

                    {/* Title */}
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4 text-center">
                    {/* Description */}
                    <CardDescription className="text-sm text-gray-600">
                      {feature.description}
                    </CardDescription>

                    {/* Coming Soon Badge with Arrow */}
                    <div className="pt-2">
                      <span className="inline-block text-gray-700 text-sm font-medium group-hover:text-indigo-600 transition-colors">
                        Coming Soon →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-12 border-2 border-indigo-100">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-indigo-600 mb-2">4+</h3>
              <p className="text-gray-700">New Features Coming</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-indigo-600 mb-2">Soon</h3>
              <p className="text-gray-700">Launch Timeline</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-indigo-600 mb-2">You</h3>
              <p className="text-gray-700">Will Love Them</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
