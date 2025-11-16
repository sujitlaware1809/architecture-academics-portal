"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Edit,
  Trash2,
  Send,
  ThumbsUp,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Blog {
  id: number
  title: string
  excerpt: string
  content: string
  category: string
  tags: string
  featured_image: string | null
  is_featured: boolean
  status: string
  views_count: number
  likes_count: number
  comments_count: number
  slug: string
  author_id: number
  author: {
    id: number
    first_name: string
    last_name: string
    email: string
    bio?: string
  }
  created_at: string
  updated_at: string
}

interface Comment {
  id: number
  content: string
  blog_id: number
  author_id: number
  parent_id: number | null
  likes_count: number
  created_at: string
  updated_at: string
  author: {
    id: number
    first_name: string
    last_name: string
  }
  replies: Comment[]
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [liked, setLiked] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    const auth = api.isAuthenticated()
    setIsAuthenticated(auth)
    if (auth) {
      setCurrentUser(api.getStoredUser())
    }
    fetchBlog()
    fetchComments()
  }, [slug])

  useEffect(() => {
    if (blog && isAuthenticated) {
      checkLikeStatus()
    }
  }, [blog, isAuthenticated])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/blogs/slug/${slug}`)
      setBlog(response.data)
    } catch (error) {
      console.error("Error fetching blog:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await api.get(`/blogs/${slug}/comments`)
      setComments(response.data)
    } catch (error: any) {
      // Get blog ID first, then fetch comments
      try {
        const blogResponse = await api.get(`/blogs/slug/${slug}`)
        if (blogResponse.data) {
          const commentsResponse = await api.get(`/blogs/${blogResponse.data.id}/comments`)
          setComments(commentsResponse.data)
        }
      } catch (err) {
        console.error("Error fetching comments:", err)
      }
    }
  }

  const checkLikeStatus = async () => {
    if (!blog || !isAuthenticated) return
    try {
      const response = await api.get(`/blogs/${blog.id}/like/status`)
      setLiked(response.data.liked)
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    try {
      const response = await api.post(`/blogs/${blog?.id}/like`, {})
      setLiked(response.data.liked)
      
      // Update blog likes count
      if (blog) {
        setBlog({
          ...blog,
          likes_count: response.data.likes_count
        })
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!newComment.trim()) return

    try {
      setSubmittingComment(true)
      await api.post(`/blogs/${blog?.id}/comments`, {
        blog_id: blog?.id,
        content: newComment,
        parent_id: null
      })
      
      setNewComment("")
      fetchComments()
      
      // Update comment count
      if (blog) {
        setBlog({
          ...blog,
          comments_count: blog.comments_count + 1
        })
      }
    } catch (error) {
      console.error("Error posting comment:", error)
      alert("Failed to post comment. Please try again.")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReplySubmit = async (parentId: number) => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!replyContent.trim()) return

    try {
      await api.post(`/blogs/${blog?.id}/comments`, {
        blog_id: blog?.id,
        content: replyContent,
        parent_id: parentId
      })
      
      setReplyContent("")
      setReplyTo(null)
      fetchComments()
    } catch (error) {
      console.error("Error posting reply:", error)
      alert("Failed to post reply. Please try again.")
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await api.delete(`/comments/${commentId}`)
      fetchComments()
      
      // Update comment count
      if (blog) {
        setBlog({
          ...blog,
          comments_count: blog.comments_count - 1
        })
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Failed to delete comment.")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return formatDate(dateString)
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Architecture News": "bg-blue-100 text-blue-700 border-blue-200",
      "Design Trends": "bg-purple-100 text-purple-700 border-purple-200",
      "Sustainable Design": "bg-green-100 text-green-700 border-green-200",
      "Technology": "bg-cyan-100 text-cyan-700 border-cyan-200",
      "Career Advice": "bg-orange-100 text-orange-700 border-orange-200",
      "Project Showcase": "bg-pink-100 text-pink-700 border-pink-200",
      "Education": "bg-indigo-100 text-indigo-700 border-indigo-200",
      "Industry Insights": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "General": "bg-gray-100 text-gray-700 border-gray-200",
    }
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isAuthor = currentUser && comment.author_id === currentUser.id
    const canDelete = isAuthor || (currentUser && currentUser.role === "ADMIN")

    return (
      <div key={comment.id} className={`${depth > 0 ? "ml-12 mt-4" : "mb-6"}`}>
        <Card className="border-l-4 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {comment.author.first_name[0]}{comment.author.last_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {comment.author.first_name} {comment.author.last_name}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(comment.created_at)}
                  </p>
                </div>
              </div>
              
              {canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {comment.likes_count}
              </Button>
              
              {isAuthenticated && depth < 2 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              )}
            </div>

            {/* Reply Input */}
            {replyTo === comment.id && (
              <div className="mt-4 flex gap-2">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReplySubmit(comment.id)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyTo(null)
                      setReplyContent("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h2>
            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
            <Link href="/blogs-discussions">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blogs-discussions">
            <Button variant="ghost" className="text-gray-600 hover:text-purple-600">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Blog Header */}
        <article>
          <header className="mb-8">
            <Badge className={`mb-4 ${getCategoryColor(blog.category)}`}>
              {blog.category}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {blog.author.first_name[0]}{blog.author.last_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {blog.author.first_name} {blog.author.last_name}
                  </p>
                  <p className="text-sm text-gray-500">Author</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(blog.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {blog.views_count} views
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleLike}
                variant={liked ? "default" : "outline"}
                className={liked ? "bg-red-500 hover:bg-red-600" : ""}
              >
                <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
                {blog.likes_count} Likes
              </Button>

              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                {blog.comments_count} Comments
              </Button>

              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              {currentUser && blog.author_id === currentUser.id && (
                <>
                  <Button variant="outline" className="ml-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {blog.featured_image && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Blog Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {blog.content}
            </div>
          </div>

          {/* Tags */}
          {blog.tags && (
            <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-gray-200">
              {blog.tags.split(",").map((tag, index) => (
                <Badge key={index} variant="outline" className="text-purple-600 border-purple-300">
                  #{tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </article>

        {/* Comments Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            Discussion ({blog.comments_count})
          </h2>

          {/* New Comment Form */}
          {isAuthenticated ? (
            <Card className="mb-8 border-2 border-purple-200">
              <CardContent className="pt-6">
                <Textarea
                  placeholder="Join the discussion... Share your thoughts, ask questions, or provide insights."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[120px] mb-4"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setNewComment("")}
                    disabled={!newComment.trim()}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim() || submittingComment}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 border-2 border-gray-200">
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Join the Discussion
                </h3>
                <p className="text-gray-600 mb-4">
                  Please sign in to comment and engage with the community
                </p>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
                    Sign In to Comment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div>
            {comments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No comments yet
                  </h3>
                  <p className="text-gray-600">
                    Be the first to start the discussion!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {comments.map(comment => renderComment(comment))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
