"use client"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function ArchitectDashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
}
