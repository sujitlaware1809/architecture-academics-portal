"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Bookmark
} from "lucide-react"
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
  views_count: number
  likes_count: number
  comments_count: number
  slug: string
  author: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  created_at: string
}

interface Comment {
  id: number
  content: string
  author_id: number
  created_at: string
  likes_count: number
  author: {
    id: number
    first_name: string
    last_name: string
  }
  replies: Comment[]
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [liked, setLiked] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated())
    fetchBlog()
    fetchComments()
  }, [params.slug])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/blogs/slug/${params.slug}`)
      setBlog(response.data)
      if (isAuthenticated) {
        const likeStatus = await api.get(`/blogs/${response.data.id}/like/status`)
        setLiked(likeStatus.data.liked)
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await api.get(`/blogs/slug/${params.slug}`)
      const blogData = response.data
      const commentsResponse = await api.get(`/blogs/${blogData.id}/comments`)
      setComments(commentsResponse.data)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated || !blog) return
    try {
      await api.post(`/blogs/${blog.id}/like`, {})
      setLiked(!liked)
      setBlog({
        ...blog,
        likes_count: liked ? blog.likes_count - 1 : blog.likes_count + 1
      })
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleCommentSubmit = async () => {
    if (!isAuthenticated || !blog || !newComment.trim()) return
    
    try {
      setSubmittingComment(true)
      await api.post(`/blogs/${blog.id}/comments`, { content: newComment })
      setNewComment("")
      fetchComments()
      setBlog({ ...blog, comments_count: blog.comments_count + 1 })
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} min read`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog not found</h2>
          <Link href="/blogs">
            <Button variant="outline">Back to Blogs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blogs">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {blog.title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {blog.excerpt}
        </p>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
              {blog.author.first_name[0]}{blog.author.last_name[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {blog.author.first_name} {blog.author.last_name}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{formatDate(blog.created_at)}</span>
                <span>·</span>
                <span>{getReadingTime(blog.content)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={liked ? "text-red-600" : ""}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              <span className="ml-1">{blog.likes_count}</span>
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-5 w-5" />
              <span className="ml-1">{blog.comments_count}</span>
            </Button>
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-8">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {blog.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-16">
          {blog.content.split('\n').map((paragraph, idx) => {
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

        {/* Tags */}
        {blog.tags && (
          <div className="mb-12 pb-12 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {blog.tags.split(',').map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-sm px-3 py-1">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Responses ({blog.comments_count})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <div className="mb-12">
              <Textarea
                placeholder="What are your thoughts?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[120px] text-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 resize-none"
              />
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim() || submittingComment}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                >
                  {submittingComment ? "Publishing..." : "Respond"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-12 p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-4">Sign in to leave a response</p>
              <Link href="/login">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-8">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No responses yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-8">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {comment.author.first_name[0]}{comment.author.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {comment.author.first_name} {comment.author.last_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 gap-1">
                          <Heart className="h-4 w-4" />
                          {comment.likes_count}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
