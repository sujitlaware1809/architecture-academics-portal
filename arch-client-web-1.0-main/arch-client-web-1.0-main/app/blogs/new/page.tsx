"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const categories = [
  "Architecture News",
  "Design Trends",
  "Sustainable Design",
  "Technology",
  "Career Advice",
  "Project Showcase",
  "Education",
  "Industry Insights",
  "General",
]

export default function NewBlogPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "General",
    tags: "",
    is_featured: false,
    status: "published"
  })
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }
    if (!formData.content.trim()) {
      setError("Content is required")
      return
    }

    try {
      setSubmitting(true)
      setError("")
      
      const response = await api.post("/blogs", formData)
      
      // Redirect to the new blog
      if (response.data.slug) {
        router.push(`/blogs/${response.data.slug}`)
      } else {
        router.push("/blogs")
      }
    } catch (err: any) {
      console.error("Error creating blog:", err)
      setError(err.response?.data?.detail || "Failed to create blog. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    setError("")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blogs">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blogs
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreview(!preview)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {preview ? "Edit" : "Preview"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !formData.title.trim() || !formData.content.trim()}
                className="bg-gray-900 hover:bg-gray-800 text-white gap-2"
              >
                <Save className="h-4 w-4" />
                {submitting ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {!preview ? (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Input
                type="text"
                placeholder="Article Title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="text-4xl font-bold border-0 focus:ring-0 px-0 placeholder:text-gray-300"
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <Textarea
                placeholder="Write a compelling excerpt (optional but recommended)..."
                value={formData.excerpt}
                onChange={(e) => handleChange("excerpt", e.target.value)}
                className="text-lg border-0 focus:ring-0 px-0 placeholder:text-gray-400 resize-none"
                rows={2}
              />
            </div>

            {/* Category & Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <Input
                    type="text"
                    placeholder="architecture, design, sustainability (comma-separated)"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Add tags separated by commas
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.is_featured}
                    onChange={(e) => handleChange("is_featured", e.target.checked)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">
                    Mark as featured post
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content
              </label>
              <Textarea
                placeholder="Tell your story...

Use markdown-style formatting:
# Main Heading
## Sub Heading
**Bold text**
- Bullet points

Write multiple paragraphs separated by blank lines."
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                className="min-h-[400px] text-lg leading-relaxed"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Supports basic markdown formatting. Minimum 100 characters recommended.
              </p>
            </div>
          </form>
        ) : (
          // Preview Mode
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {formData.title || "Untitled Article"}
            </h1>

            {formData.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {formData.excerpt}
              </p>
            )}

            <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gray-200">
              <Badge variant="secondary">{formData.category}</Badge>
              {formData.is_featured && (
                <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              {formData.content.split('\n').map((paragraph, idx) => {
                if (paragraph.startsWith('##')) {
                  return (
                    <h2 key={idx} className="text-3xl font-bold text-gray-900 mt-12 mb-4">
                      {paragraph.replace(/^##\s*/, '')}
                    </h2>
                  )
                } else if (paragraph.startsWith('#')) {
                  return (
                    <h1 key={idx} className="text-4xl font-bold text-gray-900 mt-16 mb-6">
                      {paragraph.replace(/^#\s*/, '')}
                    </h1>
                  )
                } else if (paragraph.startsWith('-')) {
                  return (
                    <li key={idx} className="text-lg text-gray-700 mb-2 ml-6 leading-relaxed">
                      {paragraph.replace(/^-\s*/, '')}
                    </li>
                  )
                } else if (paragraph.startsWith('**')) {
                  return (
                    <p key={idx} className="text-lg text-gray-900 font-semibold mb-4 leading-relaxed">
                      {paragraph.replace(/\*\*/g, '')}
                    </p>
                  )
                } else if (paragraph.trim()) {
                  return (
                    <p key={idx} className="text-lg text-gray-700 mb-6 leading-relaxed">
                      {paragraph}
                    </p>
                  )
                }
                return null
              })}
            </div>

            {formData.tags && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.split(',').map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
