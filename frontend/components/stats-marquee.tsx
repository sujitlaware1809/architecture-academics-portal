"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, BookOpen, Briefcase, Trophy, Building, GraduationCap } from "lucide-react"

interface StatItem {
  label: string
  value: string
  icon: any
  color: string
}

const stats: StatItem[] = [
  { label: "Active Students", value: "5,000+", icon: Users, color: "text-blue-500" },
  { label: "Courses Available", value: "120+", icon: BookOpen, color: "text-blue-500" },
  { label: "Job Opportunities", value: "500+", icon: Briefcase, color: "text-green-500" },
  { label: "Competitions", value: "50+", icon: Trophy, color: "text-yellow-500" },
  { label: "Partner Firms", value: "200+", icon: Building, color: "text-indigo-500" },
  { label: "NATA Success", value: "95%", icon: GraduationCap, color: "text-red-500" },
]

export function StatsMarquee() {
  const speed = 30
  // Duplicate items to ensure smooth scrolling
  const items = [...stats, ...stats, ...stats, ...stats]

  return (
    <div className="relative w-full overflow-hidden py-6 bg-gray-50 border-y border-gray-200">
      <div className="relative flex overflow-hidden group">
        <div 
          className="flex animate-marquee hover:[animation-play-state:paused]"
          style={{ animationDuration: `${speed}s` }}
        >
          {items.map((stat, idx) => (
            <StatCard key={`stat-1-${idx}`} stat={stat} />
          ))}
        </div>
        <div 
          className="flex absolute top-0 animate-marquee2 hover:[animation-play-state:paused]"
          style={{ animationDuration: `${speed}s` }}
        >
          {items.map((stat, idx) => (
            <StatCard key={`stat-2-${idx}`} stat={stat} />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ stat }: { stat: StatItem }) {
  const Icon = stat.icon
  return (
    <div className="mx-4 flex-shrink-0">
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 flex items-center gap-3">
          <div className={`p-2 rounded-full bg-white shadow-sm ${stat.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
