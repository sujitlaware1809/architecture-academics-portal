"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Calendar, 
  BookOpen, 
  Briefcase, 
  Wrench, 
  Users, 
  TrendingUp, 
  BarChart2, 
  PlusCircle,
  Check,
  Clock,
  AlertTriangle,
  ArrowRight,
  X
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Mock stats data for dashboard
  const stats = [
    { name: "Total Users", value: 1245, change: "+12%", color: "bg-blue-500" },
    { name: "Active Courses", value: 47, change: "+5%", color: "bg-green-500" },
    { name: "Published Events", value: 23, change: "+8%", color: "bg-purple-500" },
    { name: "Job Listings", value: 89, change: "+15%", color: "bg-yellow-500" },
  ]

  // Mock recent activity for dashboard
  const recentActivity = [
    { action: "New user registered", user: "Rajesh Kumar", time: "10 minutes ago" },
    { action: "New job posted", user: "Archimedes Architects", time: "2 hours ago" },
    { action: "Course updated", user: "Admin", time: "3 hours ago" },
    { action: "Event published", user: "Admin", time: "Yesterday" },
    { action: "Workshop canceled", user: "Admin", time: "Yesterday" },
  ]

  // Mock pending approvals
  const pendingApprovals = [
    { type: "Job Listing", title: "Senior Architect at XYZ Firm", status: "pending" },
    { type: "Workshop", title: "Sustainable Design Principles", status: "pending" },
    { type: "Course", title: "Advanced AutoCAD Techniques", status: "pending" }
  ]

  // Mock quick actions
  const quickActions = [
    { name: "Add New Event", href: "/admin/events/new", icon: Calendar, color: "bg-purple-100 text-purple-600" },
    { name: "Add Workshop", href: "/admin/workshops/new", icon: Wrench, color: "bg-blue-100 text-blue-600" },
    { name: "Add Course", href: "/admin/courses/new", icon: BookOpen, color: "bg-green-100 text-green-600" },
    { name: "Add Job", href: "/admin/jobs/new", icon: Briefcase, color: "bg-yellow-100 text-yellow-600" },
    { name: "Add User", href: "/admin/users/new", icon: Users, color: "bg-red-100 text-red-600" },
  ]

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">{formattedDate}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Site
          </Link>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="ml-2 text-xs font-medium text-green-500">{stat.change}</p>
              </div>
            </CardContent>
            <div className={`h-1 w-full ${stat.color} rounded-b-lg`} />
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
          >
            <div className={`p-3 rounded-full ${action.color} mb-3`}>
              {<action.icon size={20} />}
            </div>
            <p className="font-medium text-sm text-gray-700">{action.name}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Pending Approvals</CardTitle>
            <CardDescription>Items that need your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((item, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full mb-2">
                        {item.type}
                      </span>
                      <h3 className="font-medium text-sm">{item.title}</h3>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200">
                        <Check size={14} />
                      </button>
                      <button className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Link 
              href="/admin/approvals"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
            >
              View all pending approvals
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </CardFooter>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Clock size={16} className="text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Link 
              href="/admin/activity"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
            >
              View all activity
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
