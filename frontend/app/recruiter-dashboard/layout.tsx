"use client"

import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function RecruiterDashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - No Sidebar */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
}
