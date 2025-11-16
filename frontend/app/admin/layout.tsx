"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Home, 
  Calendar, 
  BookOpen, 
  Briefcase, 
  Wrench, 
  Users, 
  Settings, 
  LogOut,
  ChevronDown,
  Menu,
  X,
  FileText
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  const sidebarItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "Workshops", href: "/admin/workshops", icon: Wrench },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
    { name: "Blogs", href: "/admin/blogs", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-800"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setMobileSidebarOpen(false)}>
          <div 
            className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-md">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-800">Admin Panel</h1>
              </div>
            </div>
            
            <nav className="p-4 space-y-1">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-purple-50 hover:text-purple-700 text-gray-700"
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <IconComponent className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
              <Link 
                href="/"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-red-50 hover:text-red-700 text-gray-700"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex h-screen fixed inset-y-0 z-50 ${sidebarOpen ? 'w-64' : 'w-20'} flex-col transition-all duration-300 bg-white border-r border-gray-200`}>
        <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} p-4 border-b border-gray-200`}>
          {sidebarOpen && (
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-md">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-800">Admin Panel</h1>
            </div>
          )}
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:text-gray-800"
          >
            <ChevronDown className={`h-5 w-5 transform ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2 text-sm font-medium rounded-md hover:bg-purple-50 hover:text-purple-700 text-gray-700`}
              >
                <IconComponent className={sidebarOpen ? 'mr-3 h-5 w-5' : 'h-6 w-6'} />
                {sidebarOpen && item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Link 
            href="/"
            className={`flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2 text-sm font-medium rounded-md hover:bg-red-50 hover:text-red-700 text-gray-700`}
          >
            <LogOut className={sidebarOpen ? 'mr-3 h-5 w-5' : 'h-6 w-6'} />
            {sidebarOpen && 'Exit Admin'}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
