"use client"

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const UserSidebar = dynamic(() => import('@/components/user-sidebar'), { ssr: false })

export default function UserSidebarClient() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_sidebar_open')
      if (stored !== null) {
        setSidebarOpen(stored === '1')
        setMounted(true)
        return
      }
    } catch (e) {}

    const dashboardPrefixes = ['/general-dashboard', '/dashboard', '/faculty-dashboard', '/recruiter-dashboard', '/nata-dashboard', '/admin']
    const shouldOpen = dashboardPrefixes.some(p => pathname?.startsWith(p))
    setSidebarOpen(shouldOpen)
    setMounted(true)
  }, [pathname])

  const sidebarRootClass = `hidden lg:flex fixed top-16 bottom-0 z-40 ${sidebarOpen ? 'w-56' : 'w-16'} flex-col transition-all duration-300 bg-white border-r border-gray-200 shadow-sm`

  if (!mounted) {
    return <div className={sidebarRootClass} aria-hidden />
  }

  return <UserSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
}
