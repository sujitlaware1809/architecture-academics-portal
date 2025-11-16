"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import EventForm from "../../components/event-form"
import { Loader2 } from "lucide-react"
import { getEventById } from "@/lib/api"

export default function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true)
        // Test that the API function exists
        await getEventById(id)
        setError("")
      } catch (err) {
        console.error("Failed to fetch event:", err)
        setError("Failed to load event details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchEvent()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <button 
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go Back
        </button>
      </div>
    )
  }

  return <EventForm isEditing={true} eventId={id} />
}
