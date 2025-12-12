"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mail, Send, User, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: number
  sender_id: number
  recipient_id: number
  subject: string
  content: string
  is_read: boolean
  created_at: string
  sender: {
    first_name: string
    last_name: string
    email: string
    role: string
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  
  const getUserRole = (u: any) => {
    if (!u) return "";
    if (typeof u.role === "string") return u.role;
    if (typeof u.role === "object" && u.role !== null && "value" in u.role) return u.role.value;
    return "";
  }
  
  // Compose state
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState("")
  const [sendSuccess, setSendSuccess] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user")
    
    if (!token) {
      router.push("/login")
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchMessages(token)
  }, [router])

  const fetchMessages = async (token: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Failed to fetch messages", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendError("")
    setSendSuccess("")

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_email: recipientEmail,
          subject,
          content
        })
      })

      if (response.ok) {
        setSendSuccess("Message sent successfully!")
        setRecipientEmail("")
        setSubject("")
        setContent("")
        setTimeout(() => setIsComposeOpen(false), 2000)
      } else {
        const data = await response.json()
        setSendError(data.detail || "Failed to send message")
      }
    } catch (error) {
      setSendError("An error occurred while sending the message")
    } finally {
      setSending(false)
    }
  }

  const markAsRead = async (message: Message) => {
    if (message.is_read) return

    try {
      const token = localStorage.getItem("access_token")
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${message.id}/read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      // Update local state
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, is_read: true } : m
      ))
      
      // Trigger header update
      window.dispatchEvent(new Event('message-read'))
    } catch (error) {
      console.error("Failed to mark message as read", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Manage your communications</p>
          </div>
          
          {user && (getUserRole(user) === "ADMIN" || getUserRole(user) === "RECRUITER") && (
            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Send className="h-4 w-4 mr-2" />
                  Compose Message
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Send New Message</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSendMessage} className="space-y-4 mt-4">
                  {sendError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {sendError}
                    </div>
                  )}
                  {sendSuccess && (
                    <div className="p-3 bg-green-50 text-green-600 text-sm rounded-md flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {sendSuccess}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient Email</label>
                    <Input 
                      placeholder="user@example.com" 
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input 
                      placeholder="Message subject" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea 
                      placeholder="Type your message here..." 
                      className="min-h-[150px]"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={sending}>
                      {sending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message)
                    markAsRead(message)
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedMessage?.id === message.id 
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200" 
                      : message.is_read 
                        ? "bg-white border-gray-200" 
                        : "bg-white border-l-4 border-l-blue-500 border-y-gray-200 border-r-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${message.is_read ? "bg-transparent" : "bg-blue-500"}`} />
                      <span className="font-semibold text-sm text-gray-900">
                        {message.sender?.first_name} {message.sender?.last_name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 mb-1 truncate">
                    {message.subject || "No Subject"}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {message.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="h-full min-h-[500px]">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{selectedMessage.subject || "No Subject"}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>From: </span>
                        <span className="font-medium text-gray-900">
                          {selectedMessage.sender?.first_name} {selectedMessage.sender?.last_name}
                        </span>
                        <span className="text-gray-400">&lt;{selectedMessage.sender?.email}&gt;</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                      <Clock className="h-3 w-3" />
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
                    {selectedMessage.content}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full min-h-[500px] bg-white rounded-lg border border-gray-200 border-dashed flex flex-col items-center justify-center text-gray-400">
                <Mail className="h-16 w-16 mb-4 opacity-20" />
                <p>Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
