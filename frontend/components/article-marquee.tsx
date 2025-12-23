"use client"

import React, { useRef, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, BookOpen } from "lucide-react"

interface Article {
  id: number
  title: string
  excerpt: string
  author: any
  created_at: string
  category: string
  estimated_read_time?: number
  readTime?: string
  featured_image?: string
  slug: string
  date?: string
  description?: string
}

interface ArticleMarqueeProps {
  articles: Article[]
  speed?: number
  direction?: 'left' | 'right'
}

export function ArticleMarquee({ articles, speed = 50, direction = 'left' }: ArticleMarqueeProps) {
  // Duplicate items to ensure smooth scrolling
  const items = articles.length < 5 ? [...articles, ...articles, ...articles] : [...articles, ...articles]

  const animationClass = direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'
  const animationClass2 = direction === 'left' ? 'animate-marquee2' : 'animate-marquee2-reverse'

  const containerRef = useRef<HTMLDivElement | null>(null)
  const primaryRef = useRef<HTMLDivElement | null>(null)
  const secondaryRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const pause = () => {
      if (primaryRef.current) primaryRef.current.style.animationPlayState = 'paused'
      if (secondaryRef.current) secondaryRef.current.style.animationPlayState = 'paused'
      // Temporarily disable group hover effects for marquee rows only
      container.querySelectorAll('[data-marquee-group]').forEach(g => g.classList.remove('group'))
    }
    const resume = () => {
      if (primaryRef.current) primaryRef.current.style.animationPlayState = 'running'
      if (secondaryRef.current) secondaryRef.current.style.animationPlayState = 'running'
      // Re-enable group hover effects for marquee rows only
      container.querySelectorAll('[data-marquee-group]').forEach(g => g.classList.add('group'))
    }

    // Pause when user interacts (mouse/touch/hover) to avoid jumpy resumes
    container.addEventListener('pointerenter', pause)
    container.addEventListener('pointerleave', resume)
    container.addEventListener('pointerdown', pause)
    container.addEventListener('pointerup', resume)
    container.addEventListener('touchstart', pause, { passive: true })
    container.addEventListener('touchend', resume)

    // Also pause when window/tab loses focus
    const handleVisibility = () => {
      if (document.hidden) pause()
      else resume()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      container.removeEventListener('pointerdown', pause)
      container.removeEventListener('touchstart', pause)
      container.removeEventListener('pointerup', resume)
      container.removeEventListener('pointerleave', resume)
      container.removeEventListener('touchend', resume)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden py-10 bg-white">
      <div className="relative flex overflow-hidden" data-marquee-group-wrapper>
        <div 
          ref={primaryRef}
          className={`flex ${animationClass} hover:[animation-play-state:paused] group`} data-marquee-group
          style={{ animationDuration: `${speed}s` }}
        >
          {items.map((article, idx) => (
            <ArticleCard key={`${article.id}-${idx}`} article={article} />
          ))}
        </div>
        <div 
          ref={secondaryRef}
          className={`flex absolute top-0 ${animationClass2} hover:[animation-play-state:paused] group`} data-marquee-group
          style={{ animationDuration: `${speed}s` }}
        >
          {items.map((article, idx) => (
            <ArticleCard key={`${article.id}-dup-${idx}`} article={article} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ArticleCard({ article }: { article: Article }) {
  // Get a direct image URL based on article ID
  const getImageUrl = (id: number) => {
    const imageIds = [
      "1487958449943-2429e8be8625", // Modern glass building
      "1518780664697-55e3ad13c0c6", // White geometric architecture
      "1511818966892-d5d671fb5ffe", // Glass tower
      "1486406146700-532a9ca61417", // Curved office building
      "1545324418-cc1a3fa10b86", // Contemporary design
      "1449824913935-59a10b8d2000", // Urban architecture
      "1558618047-3c8da1c04d0a", // Building facade
      "1513475382585-d06e58bcb0e6", // Modern structure
      "1495433167890-4c28362e931e", // Glass and steel
      "1520637836862-4d197d17c82a", // Residential building
      "1506905925346-21bda4d32df4", // Architectural detail
      "1486390227850-391b14cc8ac6", // Industrial design
      "1571055107559-3e67626fa8be", // Sustainable building
      "1493119554163-2e4e03da1aec", // Wooden architecture
      "1600607734281-634b740be46c", // Traditional architecture
      "1512917774080-9991f1c4c750", // Cultural center
      "1551818014-4dc9c99475ab", // Stadium architecture
      "1589808146437-c6bb1d9e2e72", // Library architecture
    ];
    // Use a better hash to ensure variety
    const hash = (id * 1973 + article.title.length * 37) % imageIds.length;
    const imageId = imageIds[hash];
    return `https://images.unsplash.com/photo-${imageId}?w=400&h=300&fit=crop&auto=format&q=75`;
  };

  return (
    <Link href={`/blogs/${article.slug}`} className="mx-4 w-[350px] flex-shrink-0 block h-full">
      <Card className="h-full border-2 border-gray-300 shadow-lg hover:shadow-2xl hover:border-blue-400 transition-all duration-300 group overflow-hidden bg-white">
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img 
            src={article.featured_image || getImageUrl(article.id)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('fallback')) {
                target.src = `https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop&auto=format&q=75&fallback=true`;
              }
            }}
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-blue-600 text-white shadow-lg border border-blue-700">
              {article.category}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-5">
          <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {article.title}
          </CardTitle>

          <CardDescription className="text-sm text-black line-clamp-2 mb-4">
            {article.excerpt || article.description || ''}
          </CardDescription>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">
                  {(() => {
                    const authorName = typeof article.author === 'string' 
                      ? article.author 
                      : article.author?.first_name 
                        ? `${article.author.first_name} ${article.author.last_name || ''}`.trim()
                        : article.author?.email?.split('@')[0] || 'A';
                    return authorName.split(' ').map((n: string) => n[0]).slice(0, 2).join('');
                  })()}
                </span>
              </div>
              <p className="text-xs font-medium text-black truncate max-w-[100px]">
                {(() => {
                  if (typeof article.author === 'string') return article.author;
                  if (article.author?.first_name) return `${article.author.first_name} ${article.author.last_name || ''}`.trim();
                  return 'Author';
                })()}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-black">
              <BookOpen className="h-3 w-3" />
              {article.readTime || `${article.estimated_read_time || 5} min`}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
