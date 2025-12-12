"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  LayoutDashboard,
  BookOpen,
  FileText,
  Video,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Trophy
} from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function NATADashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const router = useRouter()
  
  const sidebarItems = [
    { name: "Dashboard", href: "/nata-dashboard", icon: LayoutDashboard },
    { name: "My Courses", href: "/nata-dashboard/courses", icon: BookOpen },
    { name: "Mock Tests", href: "/nata-dashboard/tests", icon: FileText },
    { name: "Study Material", href: "/nata-dashboard/material", icon: Video },
    { name: "Profile", href: "/profile", icon: User },
  ]

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar removed - content takes full width */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
}
