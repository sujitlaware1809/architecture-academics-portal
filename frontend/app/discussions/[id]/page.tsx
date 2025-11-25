"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  Eye,
  User,
  Award
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Discussion {
  id: number
  title: string
  content: string
  category: string
  tags: string
  is_solved: boolean
  views_count: number
  replies_count: number
  likes_count: number
  author_id: number
  author: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  created_at: string
}

interface Reply {
  id: number
  content: string
  discussion_id: number
  author_id: number
  parent_id: number | null
  is_solution: boolean
  likes_count: number
  created_at: string
  author: {
    id: number
    first_name: string
    last_name: string
  }
  replies: Reply[]
}

export default function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [liked, setLiked] = useState(false)
  const [newReply, setNewReply] = useState("")
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [submittingReply, setSubmittingReply] = useState(false)

  useEffect(() => {
    const auth = api.isAuthenticated()
    setIsAuthenticated(auth)
    if (auth) {
      setCurrentUser(api.getStoredUser())
    }
    fetchDiscussion()
    fetchReplies()
  }, [id])

  const fetchDiscussion = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/discussions/${id}`)
      setDiscussion(response.data)
      if (isAuthenticated) {
        const likeStatus = await api.get(`/discussions/${id}/like/status`)
        setLiked(likeStatus.data.liked)
      }
    } catch (error) {
      console.error("Error fetching discussion:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async () => {
    try {
      const response = await api.get(`/discussions/${id}/replies`)
      setReplies(response.data)
    } catch (error) {
      console.error("Error fetching replies:", error)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated || !discussion) return
    try {
      await api.post(`/discussions/${discussion.id}/like`, {})
      setLiked(!liked)
      setDiscussion({
        ...discussion,
        likes_count: liked ? discussion.likes_count - 1 : discussion.likes_count + 1
      })
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleReplySubmit = async () => {
    if (!isAuthenticated || !discussion || !newReply.trim()) return
    
    try {
      setSubmittingReply(true)
      await api.post(`/discussions/${discussion.id}/replies`, {
        content: newReply,
        discussion_id: discussion.id,
        parent_id: replyTo
      })
      setNewReply("")
      setReplyTo(null)
      fetchReplies()
      setDiscussion({ ...discussion, replies_count: discussion.replies_count + 1 })
    } catch (error) {
      console.error("Error submitting reply:", error)
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleMarkSolution = async (replyId: number) => {
    if (!discussion) return
    try {
      await api.post(`/replies/${replyId}/mark-solution?discussion_id=${discussion.id}`, {})
      fetchDiscussion()
      fetchReplies()
    } catch (error) {
      console.error("Error marking solution:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) return "just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Discussion not found</h2>
          <Link href="/discussions">
            <Button>Back to Discussions</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/discussions">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Discussions
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Question Card */}
        <Card className="mb-6 shadow-lg border-l-4 border-blue-600">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {discussion.category}
                  </Badge>
                  {discussion.is_solved && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Solved
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {discussion.title}
                </h1>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                  {discussion.author.first_name[0]}{discussion.author.last_name[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {discussion.author.first_name} {discussion.author.last_name}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {formatDate(discussion.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={!isAuthenticated}
                  className={liked ? "text-blue-600" : ""}
                >
                  <ThumbsUp className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                  <span className="ml-1">{discussion.likes_count}</span>
                </Button>
                <div className="flex items-center gap-1 text-gray-500 text-sm px-2">
                  <Eye className="h-4 w-4" />
                  {discussion.views_count}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {discussion.content}
              </p>
            </div>

            {/* Tags */}
            {discussion.tags && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {discussion.tags.split(',').map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replies Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">
              {discussion.replies_count} {discussion.replies_count === 1 ? 'Reply' : 'Replies'}
            </h2>
          </CardHeader>
          <CardContent>
            {/* Reply Form */}
            {isAuthenticated ? (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <Textarea
                  placeholder="Share your thoughts or provide an answer..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="min-h-[120px] mb-3 bg-white"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleReplySubmit}
                    disabled={!newReply.trim() || submittingReply}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {submittingReply ? "Posting..." : "Post Reply"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-4">Sign in to reply to this discussion</p>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Replies List */}
            <div className="space-y-6">
              {replies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No replies yet. Be the first to answer!</p>
                </div>
              ) : (
                replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-6 rounded-lg border-2 ${
                      reply.is_solution
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {reply.is_solution && (
                      <div className="flex items-center gap-2 mb-4 text-green-700 font-semibold">
                        <Award className="h-5 w-5" />
                        <span>Accepted Solution</span>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {reply.author.first_name[0]}{reply.author.last_name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-gray-900">
                              {reply.author.first_name} {reply.author.last_name}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          {isAuthenticated &&
                            currentUser?.id === discussion.author_id &&
                            !discussion.is_solved &&
                            !reply.is_solution && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkSolution(reply.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Mark as Solution
                              </Button>
                            )}
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {reply.likes_count}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
