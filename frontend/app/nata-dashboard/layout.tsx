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
                <div className="bg-orange-100 p-2 rounded-md">
                  <Trophy className="h-6 w-6 text-orange-600" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-800">NATA Panel</h1>
              </div>
            </div>
            
            <nav className="p-4 space-y-1">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-orange-50 hover:text-orange-700 text-gray-700"
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <IconComponent className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
              <button 
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-red-50 hover:text-red-700 text-gray-700"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex fixed top-16 bottom-0 z-40 ${sidebarOpen ? 'w-64' : 'w-20'} flex-col transition-all duration-300 bg-white border-r border-gray-200 shadow-sm`}>
        <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} p-4 border-b border-gray-200`}>
          {sidebarOpen && (
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-md">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-800">NATA Panel</h1>
            </div>
          )}
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronDown className={`h-5 w-5 transform ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>
        
        <nav className={`flex-1 p-4 space-y-2 ${sidebarOpen ? 'overflow-y-auto' : 'overflow-visible'}`}>
          {sidebarItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 text-sm font-medium rounded-lg hover:bg-orange-50 hover:text-orange-700 text-gray-600 transition-all duration-200`}
              >
                <IconComponent className={`${sidebarOpen ? 'mr-3 h-5 w-5' : 'h-6 w-6'} transition-all`} />
                {sidebarOpen && item.name}
                
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                    {item.name}
                    <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-gray-900" />
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className={`group relative flex w-full items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-700 text-gray-600 transition-all duration-200`}
          >
            <LogOut className={`${sidebarOpen ? 'mr-3 h-5 w-5' : 'h-6 w-6'} transition-all`} />
            {sidebarOpen && 'Logout'}
            
            {!sidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                Logout
                <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
