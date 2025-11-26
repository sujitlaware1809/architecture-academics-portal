"use client"

import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"

interface Notification {
  id: number
  title: string
  message: string
  read: boolean
  created_at: string
}

export default function NotificationBar({ userId }: { userId: number }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showBar, setShowBar] = useState(true)

  useEffect(() => {
    // TODO: Replace with real API call
    setNotifications([
      {
        id: 1,
        title: "Welcome!",
        message: "You have 2 new course recommendations.",
        read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Event Reminder",
        message: "Don't forget the upcoming workshop tomorrow.",
        read: false,
        created_at: new Date().toISOString(),
      },
    ])
  }, [userId])

  if (!showBar || notifications.length === 0) return null

  return (
    <div className="w-full bg-blue-50 border-b border-blue-200 py-2 px-4 flex items-center gap-4 shadow-sm">
      <Bell className="text-blue-600 mr-2" />
      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
        {notifications.filter(n => !n.read).map(n => (
          <span key={n.id} className="text-sm text-blue-900 font-medium">
            <span className="font-bold">{n.title}:</span> {n.message}
          </span>
        ))}
      </div>
      <button
        className="ml-2 text-blue-400 hover:text-blue-700"
        onClick={() => setShowBar(false)}
        title="Dismiss notifications"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}