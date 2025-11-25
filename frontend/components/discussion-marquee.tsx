"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Discussion {
  id: number
  title: string
  content: string
  excerpt?: string
  author: any
  category: string
  tags: string[] | string
  is_solved?: boolean
  solved?: boolean
  reply_count?: number
  replies?: number
  view_count?: number
  views?: number
  updated_at?: string
  lastActivity?: string
}

interface DiscussionMarqueeProps {
  discussions: Discussion[]
  speed?: number
}

export function DiscussionMarquee({ discussions, speed = 40, singleRow = false, direction = 'left' }: DiscussionMarqueeProps & { singleRow?: boolean, direction?: 'left' | 'right' }) {
  // If singleRow is true, use all discussions in one row
  // Otherwise split into two rows
  
  const row1 = singleRow ? discussions : discussions.slice(0, Math.ceil(discussions.length / 2))
  const row2 = singleRow ? [] : discussions.slice(Math.ceil(discussions.length / 2))

  // Duplicate items to ensure smooth scrolling
  const r1 = row1.length < 5 ? [...row1, ...row1, ...row1] : [...row1, ...row1]
  const r2 = row2.length < 5 ? [...row2, ...row2, ...row2] : [...row2, ...row2]

  const animationClass1 = direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'
  const animationClass1Dup = direction === 'left' ? 'animate-marquee2' : 'animate-marquee2-reverse'
  
  const animationClass2 = 'animate-marquee-reverse'
  const animationClass2Dup = 'animate-marquee2-reverse'

  return (
    <div className="relative w-full overflow-hidden py-10 bg-gradient-to-b from-white to-blue-50/30">
      {/* First Row */}
      <div className={`relative flex ${!singleRow ? 'mb-8' : ''} overflow-hidden group`}>
        <div 
          className={`flex ${animationClass1} hover:[animation-play-state:paused]`}
          style={{ animationDuration: `${speed}s` }}
        >
          {r1.map((discussion, idx) => (
            <DiscussionCard key={`${discussion.id}-1-${idx}`} discussion={discussion} />
          ))}
        </div>
        <div 
          className={`flex absolute top-0 ${animationClass1Dup} hover:[animation-play-state:paused]`}
          style={{ animationDuration: `${speed}s` }}
        >
          {r1.map((discussion, idx) => (
            <DiscussionCard key={`${discussion.id}-1-dup-${idx}`} discussion={discussion} />
          ))}
        </div>
      </div>

      {/* Second Row (only if not singleRow) */}
      {!singleRow && (
        <div className="relative flex overflow-hidden group">
          <div 
            className={`flex ${animationClass2} hover:[animation-play-state:paused]`}
            style={{ animationDuration: `${speed}s` }}
          >
            {r2.map((discussion, idx) => (
              <DiscussionCard key={`${discussion.id}-2-${idx}`} discussion={discussion} />
            ))}
          </div>
          <div 
            className={`flex absolute top-0 ${animationClass2Dup} hover:[animation-play-state:paused]`}
            style={{ animationDuration: `${speed}s` }}
          >
            {r2.map((discussion, idx) => (
              <DiscussionCard key={`${discussion.id}-2-dup-${idx}`} discussion={discussion} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DiscussionCard({ discussion }: { discussion: Discussion }) {
  // Helper to get author name
  const getAuthorName = (author: any) => {
    if (typeof author === 'string') return author
    if (author?.first_name) return `${author.first_name} ${author.last_name || ''}`.trim()
    return author?.email?.split('@')[0] || 'Unknown User'
  }

  // Helper to get initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }

  const authorName = getAuthorName(discussion.author)
  const initials = getInitials(authorName)

  return (
    <Link href={`/discussions/${discussion.id}`} className="mx-4 w-[350px] flex-shrink-0 block h-full">
      <Card className="h-full border-2 border-gray-300 shadow-lg hover:shadow-2xl hover:border-blue-400 transition-all duration-300 bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white">
              {initials}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{authorName}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-1 h-6 bg-blue-100 text-blue-800 border-2 border-blue-200 shadow-sm">
                  {discussion.category || 'General'}
                </Badge>
                <span className="text-xs text-black font-medium">
                  {discussion.updated_at ? new Date(discussion.updated_at).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-base group-hover:text-blue-600 transition-colors">
            {discussion.title}
          </h3>
          
          <p className="text-sm text-black line-clamp-3 mb-4 leading-relaxed">
            {discussion.excerpt || discussion.content}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <div className="flex items-center gap-4 text-xs text-black">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{discussion.replies || discussion.reply_count || 0} replies</span>
              </div>
              {(discussion.solved || discussion.is_solved) && (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  ✓ Solved
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
