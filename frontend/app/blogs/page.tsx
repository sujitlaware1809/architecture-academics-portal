"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Search, MessageSquare, Heart, Eye, Clock, User, ChevronRight, TrendingUp, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Blog {
  id: number; title: string; excerpt: string; content: string; category: string; tags: string
  featured_image: string | null; is_featured: boolean; status: string
  views_count: number; likes_count: number; comments_count: number; slug: string; author_id: number
  author: { id: number; first_name: string; last_name: string; email: string }
  created_at: string; updated_at: string
}

interface User {
  id: number; email: string; first_name: string; last_name: string; role: string
}

const categories = [
  { value: "all", label: "All" }, { value: "Architecture News", label: "Architecture News" },
  { value: "Design Trends", label: "Design Trends" }, { value: "Sustainable Design", label: "Sustainable Design" },
  { value: "Technology", label: "Technology" }, { value: "Career Advice", label: "Career Advice" },
  { value: "Project Showcase", label: "Project Showcase" }, { value: "Education", label: "Education" },
  { value: "Industry Insights", label: "Industry Insights" }, { value: "General", label: "General" }
]

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showBlogDialog, setShowBlogDialog] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [blogForm, setBlogForm] = useState({ title: "", content: "", excerpt: "", category: "General", tags: "", status: "published" })
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null)

  useEffect(() => { fetchCurrentUser(); fetchBlogs() }, [])

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) { const response = await api.get("/auth/me"); setCurrentUser(response as User) }
    } catch (err) { console.error("Failed to fetch current user:", err) }
  }

  const fetchBlogs = async () => {
    try {
      setLoading(true); setError(null)
      const response = await api.get("/blogs")
      const blogsData = response as Blog[]
      setBlogs(blogsData)
      const featured = blogsData.find((blog: Blog) => blog.is_featured)
      setFeaturedBlog(featured || null)
    } catch (err: any) {
      console.error("Error fetching blogs:", err)
      setError(err.message || "Failed to fetch blogs")
    } finally { setLoading(false) }
  }

  const handleCreateBlog = () => {
    setEditingBlog(null)
    setBlogForm({ title: "", content: "", excerpt: "", category: "General", tags: "", status: "published" })
    setShowBlogDialog(true)
  }

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog)
    setBlogForm({ title: blog.title, content: blog.content, excerpt: blog.excerpt, category: blog.category, tags: blog.tags, status: blog.status })
    setShowBlogDialog(true)
  }

  const handleSubmitBlog = async () => {
    if (!blogForm.title || !blogForm.content) { alert("Please fill in title and content"); return }
    try {
      setSubmitting(true)
      if (editingBlog) { await api.put(`/blogs/${editingBlog.id}`, blogForm) }
      else { await api.post("/blogs", blogForm) }
      setShowBlogDialog(false); fetchBlogs()
    } catch (err: any) {
      console.error("Error saving blog:", err); alert(err.message || "Failed to save blog")
    } finally { setSubmitting(false) }
  }

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return
    try {
      await api.delete(`/blogs/${blogToDelete}`)
      setShowDeleteDialog(false); setBlogToDelete(null); fetchBlogs()
    } catch (err: any) {
      console.error("Error deleting blog:", err); alert(err.message || "Failed to delete blog")
    }
  }

  const confirmDeleteBlog = (blogId: number) => { setBlogToDelete(blogId); setShowDeleteDialog(true) }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = searchQuery === "" || blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) || blog.tags.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory
    return matchesSearch && matchesCategory && blog.status === "published"
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString); const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading blogs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchBlogs}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Architecture Insights & Inspiration</h1>
            <p className="text-xl text-blue-100 mb-8">Explore the latest trends, techniques, and stories from the world of architecture</p>
            <div className="flex gap-4 justify-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white text-gray-900" />
              </div>
              {currentUser && (
                <Button onClick={handleCreateBlog} className="bg-white text-blue-600 hover:bg-blue-50">
                  <Plus className="h-4 w-4 mr-2" />Write Article
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button key={category.value} variant={selectedCategory === category.value ? "default" : "outline"} size="sm"
                onClick={() => setSelectedCategory(category.value)} className="whitespace-nowrap">{category.label}</Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {featuredBlog && selectedCategory === "all" && searchQuery === "" && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-bold">Featured Article</h2>
            </div>
            <Link href={`/blogs/${featuredBlog.slug}`}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="bg-blue-100 text-blue-800">{featuredBlog.category}</Badge>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Featured</Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{featuredBlog.title}</h3>
                  <p className="text-gray-600 mb-6 text-lg">{featuredBlog.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{featuredBlog.author.first_name} {featuredBlog.author.last_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatDate(featuredBlog.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1"><Eye className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600">{featuredBlog.views_count}</span></div>
                      <div className="flex items-center gap-1"><Heart className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600">{featuredBlog.likes_count}</span></div>
                      <div className="flex items-center gap-1"><MessageSquare className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600">{featuredBlog.comments_count}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6">{selectedCategory === "all" ? "All Articles" : categories.find(c => c.value === selectedCategory)?.label}
            <span className="text-gray-400 font-normal ml-2">({filteredBlogs.length})</span>
          </h2>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No articles found</p>
            {currentUser && <Button onClick={handleCreateBlog}><Plus className="h-4 w-4 mr-2" />Write the first article</Button>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <Link href={`/blogs/${blog.slug}`}>
                  <div className="p-6">
                    <Badge className="mb-3 bg-blue-100 text-blue-800">{blog.category}</Badge>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-blue-600">{blog.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1"><User className="h-4 w-4" /><span>{blog.author.first_name} {blog.author.last_name}</span></div>
                      <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>{formatDate(blog.created_at)}</span></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1"><Eye className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600">{blog.views_count}</span></div>
                        <div className="flex items-center gap-1"><Heart className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600">{blog.likes_count}</span></div>
                        <div className="flex items-center gap-1"><MessageSquare className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600">{blog.comments_count}</span></div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
                {currentUser && blog.author_id === currentUser.id && (
                  <div className="px-6 pb-4 flex gap-2 border-t pt-4">
                    <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); handleEditBlog(blog) }}>
                      <Edit className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); confirmDeleteBlog(blog.id) }} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showBlogDialog} onOpenChange={setShowBlogDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? "Edit Article" : "Write New Article"}</DialogTitle>
            <DialogDescription>{editingBlog ? "Update your article details below" : "Share your knowledge and insights with the community"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="title">Title *</Label>
              <Input id="title" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} placeholder="Enter article title" />
            </div>
            <div><Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea id="excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} placeholder="Brief summary of your article" rows={2} />
            </div>
            <div><Label htmlFor="content">Content *</Label>
              <Textarea id="content" value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} placeholder="Write your article content here..." rows={10} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="category">Category</Label>
                <Select value={blogForm.category} onValueChange={(value: string) => setBlogForm({ ...blogForm, category: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.value !== "all").map((category) => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="status">Status</Label>
                <Select value={blogForm.status} onValueChange={(value: string) => setBlogForm({ ...blogForm, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label htmlFor="tags">Tags</Label>
              <Input id="tags" value={blogForm.tags} onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })} placeholder="Comma-separated tags (e.g., Design, Technology)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlogDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitBlog} disabled={submitting}>
              {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (editingBlog ? "Update Article" : "Publish Article")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete your article.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBlog} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
