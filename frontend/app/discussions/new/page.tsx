"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { ArrowLeft, Send, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const categories = [
  "General Discussion",
  "Design Help",
  "Technical Questions",
  "Career Advice",
  "Software & Tools",
  "Education & Learning",
  "Project Feedback",
  "Industry News",
  "Networking",
]

export default function NewDiscussionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General Discussion",
    tags: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError("Question title is required")
      return
    }
    if (!formData.content.trim()) {
      setError("Question details are required")
      return
    }

    try {
      setSubmitting(true)
      setError("")
      
      const response = await api.post("/discussions", formData)
      
      // Redirect to the new discussion
      if (response.data.id) {
        router.push(`/discussions/${response.data.id}`)
      } else {
        router.push("/discussions")
      }
    } catch (err: any) {
      console.error("Error creating discussion:", err)
      setError(err.response?.data?.detail || "Failed to create discussion. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    setError("")
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "General Discussion": "bg-gray-100 text-gray-800",
      "Design Help": "bg-blue-100 text-blue-800",
      "Technical Questions": "bg-blue-100 text-blue-800",
      "Career Advice": "bg-green-100 text-green-800",
      "Software & Tools": "bg-indigo-100 text-indigo-800",
      "Education & Learning": "bg-yellow-100 text-yellow-800",
      "Project Feedback": "bg-sky-100 text-sky-800",
      "Industry News": "bg-red-100 text-red-800",
      "Networking": "bg-teal-100 text-teal-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/discussions">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ask a Question</h1>
                <p className="text-sm text-gray-600">Get help from the community</p>
              </div>
            </div>
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Tips Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Tips for asking a good question:</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ Be specific and clear about your problem</li>
              <li>✓ Provide relevant context and details</li>
              <li>✓ Choose the right category for your question</li>
              <li>✓ Use descriptive tags to help others find your question</li>
              <li>✓ Be respectful and follow community guidelines</li>
            </ul>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., How do I integrate sustainable design in urban projects?"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="text-lg"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be specific and concise. A good title helps others understand your question quickly.
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Details <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Provide more details about your question...

What have you tried so far?
What are the specific challenges you're facing?
Any relevant context or background information?"
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  className="min-h-[200px] text-base"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Include all relevant details that will help others understand and answer your question.
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <Badge className={getCategoryColor(formData.category)}>
                    {formData.category}
                  </Badge>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="BIM, Revit, sustainability, design (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add relevant tags to help others find your question. Separate with commas.
                </p>
              </div>

              {/* Preview Tags */}
              {formData.tags && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.split(',').map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href="/discussions">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting || !formData.title.trim() || !formData.content.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Posting..." : "Post Question"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <div className="mt-6 text-center text-sm text-gray-500">
          By posting, you agree to our community guidelines and code of conduct.
        </div>
      </div>
    </div>
  )
}
