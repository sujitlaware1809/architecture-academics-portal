"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = () => {
      if (!api.isAuthenticated()) {
        router.push("/login")
        return
      }
      setUser(api.getStoredUser())
      fetchNotifications()
    }
    checkAuth()
  }, [router])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("access_token")
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ))
      // Trigger header update
      window.dispatchEvent(new Event('auth-change'))
    } catch (error) {
      console.error("Failed to mark as read", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token")
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      // Trigger header update
      window.dispatchEvent(new Event('auth-change'))
    } catch (error) {
      console.error("Failed to mark all as read", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-gray-600">Stay updated with your latest activities</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <Button onClick={markAllAsRead} variant="outline" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
                <p className="text-gray-500 mt-1">We'll notify you when something important happens.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${!notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full flex-shrink-0 ${!notification.is_read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-base font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(notification.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      {notification.link && (
                        <Button 
                          variant="link" 
                          className="p-0 h-auto mt-2 text-blue-600" 
                          onClick={() => router.push(notification.link)}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
