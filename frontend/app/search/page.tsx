"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { 
  Search, 
  BookOpen, 
  Briefcase, 
  FileText, 
  Calendar, 
  GraduationCap,
  ArrowRight,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface SearchResult {
  id: number
  type: string
  title: string
  description: string
  url: string
  image: string | null
}

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") || ""
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await api.get(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.data) {
        setResults(res.data)
      }
    } catch (err) {
      console.error("Search failed", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "Course":
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case "NATA Course":
        return <GraduationCap className="h-5 w-5 text-yellow-500" />
      case "Job":
        return <Briefcase className="h-5 w-5 text-green-500" />
      case "Blog":
        return <FileText className="h-5 w-5 text-purple-500" />
      case "Event":
        return <Calendar className="h-5 w-5 text-red-500" />
      default:
        return <Search className="h-5 w-5 text-gray-500" />
    }
  }

  const getColorForType = (type: string) => {
    switch (type) {
      case "Course":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200"
      case "NATA Course":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
      case "Job":
        return "bg-green-100 text-green-700 hover:bg-green-200"
      case "Blog":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200"
      case "Event":
        return "bg-red-100 text-red-700 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 font-serif">
              Search Results
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Found {results.length} results for "{initialQuery}"
            </p>
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-pattern-dots"></div>
          <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-pattern-dots"></div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for courses, jobs, blogs, events..."
                className="pl-10 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:shadow-lg">
              Search
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {hasSearched && results.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We couldn't find anything matching "{initialQuery}". Try checking for typos or using different keywords.
                </p>
              </div>
            ) : (
              results.map((result) => (
                <Link href={result.url} key={`${result.type}-${result.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500 group bg-white/80 backdrop-blur-sm hover:bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-5">
                        <div className={`p-3 rounded-xl shadow-sm transition-colors duration-300 ${getColorForType(result.type).replace('text-', 'bg-').replace('100', '50')}`}>
                          {getIconForType(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className={`${getColorForType(result.type)} border-0 font-medium px-2.5 py-0.5`}>
                              {result.type}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                            {result.title}
                          </h3>
                          <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                            {result.description}
                          </p>
                          <div className="flex items-center text-blue-600 text-sm font-semibold group/link">
                            View Details
                            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
