"use client"

import React, { useEffect, useRef, useState } from "react"
import VideoPlayer from "@/components/video-player"
import { api } from "@/lib/api"

type CoursePlayerProps = {
  lessonId: number
  lessonTitle: string
  videoStreamUrl?: string // full URL to /api/lessons/{id}/video-stream
  enrollmentId?: number
}

export default function CoursePlayer({ lessonId, lessonTitle, videoStreamUrl, enrollmentId }: CoursePlayerProps) {
  const saveTimer = useRef<number | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const saveProgress = async (currentTime: number, completed: boolean) => {
    if (!enrollmentId) return
    try {
      const token = api.getStoredToken()
      const form = new FormData()
      form.append('lesson_id', String(lessonId))
      form.append('enrollment_id', String(enrollmentId))
      form.append('current_time', String(Math.floor(currentTime)))
      form.append('completed', String(completed))

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        body: form,
      })
      setLastSaved(new Date())
    } catch (err) {
      console.error('Failed to save progress', err)
    }
  }

  // debounce periodic save
  const handleProgress = (currentTime: number, duration: number) => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current)
    }
    // save every 6 seconds of inactivity
    saveTimer.current = window.setTimeout(() => {
      const completed = duration > 0 && currentTime / duration > 0.98
      saveProgress(currentTime, completed)
    }, 6000)
  }

  const handleComplete = () => {
    // on video complete, save with completed=true
    saveProgress(Number.MAX_SAFE_INTEGER, true)
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [])

  return (
    <div>
      <VideoPlayer src={videoStreamUrl || ''} title={lessonTitle} onProgress={handleProgress} onComplete={handleComplete} controls />
      <div className="text-xs text-gray-500 mt-2">{lastSaved ? `Progress saved ${lastSaved.toLocaleTimeString()}` : 'Progress not yet saved'}</div>
    </div>
  )
}
