"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UploadCloud,
  Video,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react"

type CourseOption = {
  id: number
  title: string
}

type EnrollmentRow = {
  enrollment_id: number
  student_id: number
  student_name?: string | null
  student_email?: string | null
  enrolled_at?: string | null
  progress_percentage?: number
  last_accessed_at?: string | null
}

export default function ManageCoursesAdmin() {
  const [isAuth, setIsAuth] = useState(false)
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [loadingCourses, setLoadingCourses] = useState(true)

  // Students modal
  const [showStudents, setShowStudents] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [enrollments, setEnrollments] = useState<EnrollmentRow[] | null>(null)
  const [studentsError, setStudentsError] = useState<string | null>(null)

  // Material upload modal
  const [showMaterial, setShowMaterial] = useState(false)
  const [matTitle, setMatTitle] = useState("")
  const [matFile, setMatFile] = useState<File | null>(null)
  const [matUploading, setMatUploading] = useState(false)
  const [matMessage, setMatMessage] = useState<string | null>(null)

  // Video upload modal
  const [showVideo, setShowVideo] = useState(false)
  const [vidTitle, setVidTitle] = useState("")
  const [vidFile, setVidFile] = useState<File | null>(null)
  const [vidUploading, setVidUploading] = useState(false)
  const [vidMessage, setVidMessage] = useState<string | null>(null)

  useEffect(() => {
    setIsAuth(api.isAuthenticated())
    const loadCourses = async () => {
      setLoadingCourses(true)
      try {
        const res = await api.get("/api/courses")
        const opt: CourseOption[] = (res?.data || []).map((c: any) => ({ id: c.id, title: c.title }))
        setCourses(opt)
        if (opt.length && !selectedCourseId) setSelectedCourseId(opt[0].id)
      } catch (e) {
        console.error("Failed to load courses", e)
      } finally {
        setLoadingCourses(false)
      }
    }
    loadCourses()
  }, [])

  const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId) || null, [courses, selectedCourseId])

  const openStudents = async () => {
    if (!selectedCourseId) return
    setShowStudents(true)
    setStudentsLoading(true)
    setStudentsError(null)
    setEnrollments(null)
    try {
      const res = await api.get(`/api/admin/courses/${selectedCourseId}/enrollments`)
      setEnrollments(res?.data?.enrollments || [])
    } catch (e: any) {
      const status = e?.response?.status
      if (status === 403) setStudentsError("Not authorized. Only the course instructor or admin can view students.")
      else if (status === 404) setStudentsError("Enrollments endpoint not found on backend. Please update the API.")
      else setStudentsError("Failed to fetch students. Ensure backend is running and you are logged in.")
    } finally {
      setStudentsLoading(false)
    }
  }

  const uploadMultipart = async (url: string, form: FormData) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const res = await fetch(url, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    return res.json()
  }

  const submitMaterial = async () => {
    if (!selectedCourseId || !matFile || !matTitle) return
    setMatUploading(true)
    setMatMessage(null)
    try {
      const form = new FormData()
      form.append("title", matTitle)
      form.append("description", "")
      form.append("file", matFile)
      const data = await uploadMultipart(`http://localhost:8000/api/courses/${selectedCourseId}/materials/upload`, form)
      setMatMessage(`Uploaded. material_id=${data?.material_id ?? "n/a"}`)
      setMatTitle("")
      setMatFile(null)
    } catch (e: any) {
      setMatMessage(e?.message || "Upload failed")
    } finally {
      setMatUploading(false)
    }
  }

  const submitVideo = async () => {
    if (!selectedCourseId || !vidFile || !vidTitle) return
    setVidUploading(true)
    setVidMessage(null)
    try {
      const form = new FormData()
      form.append("title", vidTitle)
      form.append("file", vidFile)
      const data = await uploadMultipart(`http://localhost:8000/api/courses/${selectedCourseId}/videos/upload`, form)
      setVidMessage(`Uploaded. video_id=${data?.video_id ?? "n/a"}`)
      setVidTitle("")
      setVidFile(null)
    } catch (e: any) {
      setVidMessage(e?.message || "Upload failed")
    } finally {
      setVidUploading(false)
    }
  }

  if (!isAuth) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Admin – Course Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700">
              Please <Link className="text-blue-600 underline" href="/login?redirect=/admin/courses/manage">log in</Link> to manage courses.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin – Course Manager</h1>
        <div className="text-sm text-gray-500">Compact controls for students and uploads</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCourses ? (
            <div className="text-gray-600">Loading courses…</div>
          ) : courses.length === 0 ? (
            <div className="text-gray-600">No courses found.</div>
          ) : (
            <div className="flex flex-wrap gap-3 items-center">
              <select
                className="border rounded-md px-3 py-2"
                value={selectedCourseId ?? ""}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              {selectedCourse && (
                <Badge className="bg-purple-600 text-white">ID: {selectedCourse.id}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">View registered students and their details.</p>
            <Button disabled={!selectedCourseId} onClick={openStudents} className="w-full">View Students</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Upload Material</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">Small form for PDFs/notes.</p>
            <Button disabled={!selectedCourseId} onClick={() => setShowMaterial(true)} className="w-full">
              <UploadCloud className="h-4 w-4 mr-2" /> Upload
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> Upload Video</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">Quick video upload.</p>
            <Button disabled={!selectedCourseId} onClick={() => setShowVideo(true)} className="w-full">
              <UploadCloud className="h-4 w-4 mr-2" /> Upload
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Students Modal */}
      {showStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2 font-semibold"><Users className="h-5 w-5" /> Students</div>
              <button onClick={() => setShowStudents(false)} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {studentsLoading ? (
                <div className="text-gray-600">Loading…</div>
              ) : studentsError ? (
                <div className="flex items-start gap-2 text-red-600"><AlertCircle className="h-5 w-5 mt-0.5" /> {studentsError}</div>
              ) : !enrollments || enrollments.length === 0 ? (
                <div className="text-gray-600">No students found.</div>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((e) => (
                    <div key={e.enrollment_id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{e.student_name || `Student #${e.student_id}`}</div>
                          <div className="text-sm text-gray-600">{e.student_email}</div>
                        </div>
                        <Badge className="bg-green-600 text-white flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {Math.round(e.progress_percentage ?? 0)}%
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Enrolled: {e.enrolled_at || "n/a"} • Last access: {e.last_accessed_at || "n/a"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t flex justify-end">
              <Button variant="outline" onClick={() => setShowStudents(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Material Upload Modal */}
      {showMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2 font-semibold"><FileText className="h-5 w-5" /> Upload Material</div>
              <button onClick={() => setShowMaterial(false)} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <Input placeholder="Title" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} />
              <input type="file" onChange={(e) => setMatFile(e.target.files?.[0] || null)} />
              {matMessage && <div className="text-sm text-gray-700">{matMessage}</div>}
            </div>
            <div className="p-3 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMaterial(false)}>Cancel</Button>
              <Button onClick={submitMaterial} disabled={matUploading || !matTitle || !matFile}>
                {matUploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2 font-semibold"><Video className="h-5 w-5" /> Upload Video</div>
              <button onClick={() => setShowVideo(false)} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <Input placeholder="Title" value={vidTitle} onChange={(e) => setVidTitle(e.target.value)} />
              <input type="file" accept="video/*" onChange={(e) => setVidFile(e.target.files?.[0] || null)} />
              {vidMessage && <div className="text-sm text-gray-700">{vidMessage}</div>}
            </div>
            <div className="p-3 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowVideo(false)}>Cancel</Button>
              <Button onClick={submitVideo} disabled={vidUploading || !vidTitle || !vidFile}>
                {vidUploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
