"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Briefcase, 
  Award, 
  User, 
  LogOut,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileText,
  Clock
} from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function FacultyDashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const router = useRouter()
  
  const sidebarItems = [
    { name: "Dashboard", href: "/faculty-dashboard", icon: LayoutDashboard },
    { name: "Blogs", href: "/faculty-dashboard/blogs", icon: FileText },
    { name: "Discussions", href: "/faculty-dashboard/discussions", icon: Users },
    { name: "Schedule", href: "/faculty-dashboard/schedule", icon: Clock },
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
