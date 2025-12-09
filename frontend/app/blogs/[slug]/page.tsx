"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Share2, 
  Bookmark,
  MessageSquare,
  ThumbsUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  }
  created_at: string
  updated_at: string
  read_time_minutes?: number
}

// Simple Markdown Parser Component
const MarkdownContent = ({ content }: { content: string }) => {
  // This is a very basic parser. For production, use react-markdown
  const renderContent = (text: string) => {
    if (!text) return null;
    
    // Split by double newlines for paragraphs
    const blocks = text.split(/\n\n+/);
    
    return blocks.map((block, index) => {
      // Headers
      if (block.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-gray-900">{block.replace('# ', '')}</h1>
      }
      if (block.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-900">{block.replace('## ', '')}</h2>
      }
      if (block.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-gray-900">{block.replace('### ', '')}</h3>
      }
      
      // Lists
      if (block.includes('\n- ')) {
        const items = block.split('\n- ').filter(item => item.trim());
        // Handle first item if it starts with "- "
        if (items[0].startsWith('- ')) items[0] = items[0].replace('- ', '');
        
        return (
          <ul key={index} className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\- /, '')}</li>
            ))}
          </ul>
        )
      }
      
      // Bold text (simple replacement)
      const parseBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/);
        return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
          }
          return part;
        });
      };

      return <p key={index} className="mb-6 text-gray-700 leading-relaxed text-lg">{parseBold(block)}</p>
    });
  };

  return <div className="prose prose-lg max-w-none">{renderContent(content)}</div>
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiBase}/api/blogs/slug/${slug}`)
        
        if (!response.ok) {
          throw new Error('Blog post not found')
        }
        
        const data = await response.json()
        setBlog(data)
      } catch (err) {
        console.error("Error fetching blog:", err)
        setError("Failed to load article")
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getBlogImage = (blog: Blog) => {
    if (blog.featured_image) return blog.featured_image
    return `https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&auto=format&fit=crop&q=80`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-6" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <p className="text-gray-600 mb-8">The article you are looking for might have been removed or is temporarily unavailable.</p>
          <Link href="/blogs">
            <Button>Back to Articles</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header / Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/blogs" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="font-medium">Back to Articles</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600">
              <Bookmark className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <article className="container mx-auto px-4 max-w-4xl pt-12">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              {blog.category.replace('_', ' ')}
            </Badge>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500 font-medium">{blog.read_time_minutes || 5} min read</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {blog.excerpt}
          </p>
          
          <div className="flex items-center justify-between py-6 border-t border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-gray-200">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {blog.author.first_name[0]}{blog.author.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {blog.author.first_name} {blog.author.last_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatDate(blog.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <MessageSquare size={16} />
                <span>{blog.comments_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp size={16} />
                <span>{blog.likes_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-12 shadow-lg">
          <Image
            src={getBlogImage(blog)}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Content */}
        <div className="mb-16">
          <MarkdownContent content={blog.content} />
        </div>

        {/* Tags */}
        {blog.tags && (
          <div className="mb-12">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.split(',').map(tag => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-12" />

        {/* Author Bio Box */}
        <div className="bg-gray-50 rounded-xl p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-blue-600 text-white text-xl">
              {blog.author.first_name[0]}{blog.author.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              About {blog.author.first_name} {blog.author.last_name}
            </h3>
            <p className="text-gray-600 mb-4">
              Senior Architect and Educator with a passion for sustainable design and architectural history. 
              Dedicated to helping the next generation of architects succeed.
            </p>
            <Button variant="outline" size="sm">View Profile</Button>
          </div>
        </div>
      </article>
    </div>
  )
}
