"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function NewCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [level, setLevel] = useState('beginner')
  const [duration, setDuration] = useState('')
  const [maxStudents, setMaxStudents] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!title || !description || !duration) {
      setError('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    try {
      const courseData = {
        title,
        description,
        short_description: shortDescription || description.substring(0, 150),
        level,
        duration,
        max_students: maxStudents
        // status is automatically set to 'published' by backend
      }
      
      const res = await api.post('/api/admin/courses', courseData)
      if (res && res.data) {
        router.push('/admin/courses')
      }
    } catch (err: any) {
      console.error('Failed to create course', err)
      setError(err.response?.data?.detail || 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Course</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full border p-2 rounded" 
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Short Description</label>
          <input 
            value={shortDescription} 
            onChange={(e) => setShortDescription(e.target.value)} 
            className="w-full border p-2 rounded"
            placeholder="Brief overview (optional)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Full Description *</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full border p-2 rounded" 
            rows={6}
            required
          ></textarea>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Level *</label>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)} 
              className="w-full border p-2 rounded"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Duration *</label>
            <input 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              className="w-full border p-2 rounded"
              placeholder="e.g., 8 weeks, 3 months"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Max Students</label>
          <input 
            type="number" 
            value={maxStudents} 
            onChange={(e) => setMaxStudents(parseInt(e.target.value))} 
            className="w-full border p-2 rounded"
            min="1"
          />
          <p className="text-xs text-gray-500 mt-1">Course will be published automatically and visible to students</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
