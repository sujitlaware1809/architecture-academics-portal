"use client"

import React, { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import UserSidebar from '@/components/user-sidebar'
import { usePathname } from 'next/navigation'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    setIsAuthenticated(api.isAuthenticated())
  }, [])

  // Listen for auth changes (login/logout) so sidebar can react immediately
  useEffect(() => {
    const onAuthChange = () => {
      const authState = api.isAuthenticated()
      setIsAuthenticated(authState)
      // if user just logged in, ensure sidebar is expanded on non-home pages
      if (authState && pathname !== '/') {
        setSidebarOpen(true)
      }
      // if logged out, collapse sidebar
      if (!authState) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('auth-change', onAuthChange)
    return () => window.removeEventListener('auth-change', onAuthChange)
  }, [pathname])

  useEffect(() => {
    if (!mounted) return

    try {
      const stored = localStorage.getItem('user_sidebar_open')
      if (stored !== null) {
        setSidebarOpen(stored === '1')
        return
      }
    } catch (e) {}

    // Show sidebar expanded on all pages except home for authenticated users
    const isHomePage = pathname === "/"
    setSidebarOpen(!isHomePage)
  }, [pathname, mounted])

  const isHomePage = pathname === "/"

  return (
    <div>
      {mounted && isAuthenticated && !isHomePage && (
        <UserSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      <div className={`transition-all duration-300 ${mounted && isAuthenticated && !isHomePage ? (sidebarOpen ? 'lg:ml-56' : 'lg:ml-16') : ''}`}>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
