"use client"

import React, { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { BookOpen, Calendar, Briefcase, FileText, ChevronDown } from "lucide-react"

interface Props {
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

export default function UserSidebar({ sidebarOpen, setSidebarOpen }: Props) {
  const [sidebarItems, setSidebarItems] = useState<Array<any>>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const u = api.getStoredUser()
    setUser(u)

    // normalize helpers
    let userType: string | undefined = undefined
    let studentYear: number | undefined = undefined
    let role: string | undefined = undefined

    if (u) {
      role = typeof u.role === 'object' && u.role !== null && 'value' in u.role ? u.role.value : u.role
      userType = typeof u.user_type === 'object' && u.user_type !== null && 'value' in u.user_type ? u.user_type.value : u.user_type
      // possible year field names
      studentYear = u.year ?? u.student_year ?? u.batch_year ?? undefined
      if (typeof studentYear === 'string') {
        const parsed = parseInt(studentYear, 10)
        if (!Number.isNaN(parsed)) studentYear = parsed
      }
    }

    const isNata = userType === 'NATA_STUDENT'
    const isFacultyOrArchitect = userType === 'FACULTY' || userType === 'ARCHITECT'
    const isEarlyYearStudent = typeof studentYear === 'number' && studentYear >= 1 && studentYear <= 3

    // Build sidebar items based on user type
    if (isNata) {
      // Use routes that actually exist in the app directory
      setSidebarItems([
        { name: 'Profile', href: '/profile', icon: BookOpen },
        { name: 'NATA Courses', href: '/nata-courses', icon: BookOpen },
        { name: 'Discussions', href: '/discussions', icon: FileText },
        { name: 'Blogs', href: '/blogs', icon: Briefcase },
      ])
    } else if (isFacultyOrArchitect) {
      // Faculty / Architect: show faculty-focused links (remove Publications)
      setSidebarItems([
        { name: 'Dashboard', href: '/faculty-dashboard', icon: BookOpen },
        { name: 'Jobs', href: '/jobs-portal', icon: Briefcase },
        { name: 'Events', href: '/events', icon: Calendar },
        { name: 'Workshops', href: '/workshops', icon: Calendar },
        { name: 'FDPs', href: '/workshops#upcoming-workshops', icon: FileText },
      ])
    } else if (isEarlyYearStudent) {
      // Early year students: point to core learning pages that exist
      setSidebarItems([
        { name: 'Profile', href: '/profile', icon: BookOpen },
        { name: `Year ${studentYear} - Courses`, href: '/courses', icon: BookOpen },
        { name: 'Learn', href: '/learn', icon: FileText },
        { name: 'Workshops', href: '/workshops', icon: Calendar },
      ])
    } else {
      // Default for other authenticated users
      setSidebarItems([
        { name: 'Courses', href: '/courses', icon: BookOpen },
        { name: 'Events', href: '/events', icon: Calendar },
        { name: 'Jobs', href: '/jobs-portal', icon: Briefcase },
        { name: 'Blogs', href: '/blogs', icon: FileText },
      ])
    }
  }, [sidebarOpen])

  // persist preference
  useEffect(() => {
    try { localStorage.setItem('user_sidebar_open', sidebarOpen ? '1' : '0') } catch (e) {}
  }, [sidebarOpen])

  return (
    <div className={`hidden lg:flex fixed top-16 bottom-0 z-40 ${sidebarOpen ? 'w-56' : 'w-16'} flex-col transition-all duration-300 bg-white border-r border-gray-200 shadow-sm`}>
      <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} p-4 border-b border-gray-200`}>
        {sidebarOpen && (
          <div className="flex items-center">
            <div className="bg-blue-50 p-2 rounded-md">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-800">Explore</h2>
          </div>
        )}

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors">
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
              className={`group relative ${sidebarOpen ? 'flex items-center px-3' : 'flex flex-col items-center px-1'} py-2.5 text-sm font-medium rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 transition-all duration-200`}
            >
              <IconComponent className={`${sidebarOpen ? 'mr-3 h-5 w-5' : 'h-6 w-6'} transition-all`} />
              {sidebarOpen ? (
                item.name
              ) : (
                <span className="mt-1 text-xs text-center">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout shown when sidebar is expanded */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-t border-gray-200">
          <button
            onClick={() => {
              try { api.logout() } catch (e) {}
              try { window.dispatchEvent(new Event('auth-change')) } catch (e) {}
              window.location.href = "/"
            }}
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      )}

      {/* Small logout button when sidebar is collapsed */}
      {!sidebarOpen && (
        <div className="mt-auto flex items-center justify-center p-3 border-t border-gray-200 w-full">
          <button
            onClick={() => {
              try { api.logout() } catch (e) {}
              try { window.dispatchEvent(new Event('auth-change')) } catch (e) {}
              window.location.href = "/"
            }}
            title="Logout"
            aria-label="Logout"
            className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      )}

    </div>
  )
}
