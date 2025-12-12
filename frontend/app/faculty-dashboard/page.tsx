"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  BookOpen, 
  Calendar, 
  Briefcase, 
  Award,
  User,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  FileText,
  GraduationCap
} from "lucide-react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LineChartSimple from "@/components/charts/LineChartSimple"
import DonutChart from "@/components/charts/DonutChart"
import BarChartSimple from "@/components/charts/BarChartSimple"
import { DashboardSection } from "@/components/dashboard-section"

export default function FacultyDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Mock data for now - replace with actual API calls
  const [events, setEvents] = useState<any[]>([])
  const [workshops, setWorkshops] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [discussions, setDiscussions] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    enrolled_courses: 0,
    completed_courses: 0,
    registered_events: 0,
    registered_workshops: 0,
    job_applications: 0
  })
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [quickBlogs, setQuickBlogs] = useState<any[]>([])
  const [quickCompetitions, setQuickCompetitions] = useState<any[]>([])
  const [blogTimeseries, setBlogTimeseries] = useState<any[]>([])
  const [engagementTimeseries, setEngagementTimeseries] = useState<any[]>([])
  const [userCompetitionRank, setUserCompetitionRank] = useState<any>(null)

  // Fallback competition info to show when API returns no data
  const fallbackCompetition = {
    title: 'Inter-College Design Challenge 2025',
    user_participations: 3,
    rank: 3,
    total_users: 120,
    percentile: 97,
  }

  // Fallback timeseries (7 days) to show a small sparkline when no engagement data
  const fallbackSeries = (() => {
    const days = 7
    const arr: any[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (days - 1 - i))
      arr.push({ date: d.toISOString(), score: i === days - 1 ? fallbackCompetition.user_participations : 0 })
    }
    return arr
  })()

  // Derived display values (use backend values when valid, otherwise fallback)
  const displayUserParticipations = (userCompetitionRank && typeof userCompetitionRank.user_participations === 'number') ? userCompetitionRank.user_participations : fallbackCompetition.user_participations
  const displayRankValue = (userCompetitionRank && typeof userCompetitionRank.rank === 'number') ? userCompetitionRank.rank : fallbackCompetition.rank
  const displayTotalUsers = (userCompetitionRank && typeof userCompetitionRank.total_users === 'number') ? userCompetitionRank.total_users : fallbackCompetition.total_users
  const displayPercentile = (userCompetitionRank && typeof userCompetitionRank.percentile === 'number') ? userCompetitionRank.percentile : fallbackCompetition.percentile

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    // Fetch dashboard data from backend for this user
    const fetchDashboard = async () => {
      try {
        // Use central api helper which attaches Authorization header
        const resp = await api.get('/users/dashboard')
        const data = resp?.data || resp
        setStats(data.stats || {})
        setEnrolledCourses(data.enrolled_courses || [])

        // Fetch analytics and lists in parallel
        const p = [
          api.get('/analytics/blog-views', { params: { limit: 5 } }).catch(() => ({ data: [] })),
          api.get('/analytics/competitions', { params: { limit: 5 } }).catch(() => ({ data: [] })),
          api.get('/analytics/blog-timeseries', { params: { days: 14 } }).catch(() => ({ data: [] })),
          api.get('/analytics/engagement-timeseries', { params: { days: 14 } }).catch(() => ({ data: [] })),
          api.get('/analytics/competition-rank').catch(() => ({ data: null })),
          api.get('/events', { params: { limit: 10 } }).catch(() => ({ data: [] })),
          api.get('/workshops', { params: { limit: 10 } }).catch(() => ({ data: [] })),
          api.get('/jobs', { params: { limit: 10 } }).catch(() => ({ data: [] })),
        ]

        const results = await Promise.all(p)
        const blogsResp = results[0]?.data || []
        const compsResp = results[1]?.data || []
        const blogSeriesResp = results[2]?.data || []
        const engagementSeriesResp = results[3]?.data || []
        const rankResp = results[4]?.data || null
        const eventsResp = results[5]?.data || []
        const workshopsResp = results[6]?.data || []
        const jobsResp = results[7]?.data || []

        setEvents(eventsResp)
        setWorkshops(workshopsResp)
        setJobs(jobsResp)
        // Use competitions endpoint for discussions/competitions list fallback
        setDiscussions(data.recent_activity ? data.recent_activity.filter((r:any) => r.type === 'discussion') : [])

        // store quick-access datasets on state via local refs
        setQuickBlogs(blogsResp)
        setQuickCompetitions(compsResp)
        // timeseries
        setBlogTimeseries(blogSeriesResp)
        setEngagementTimeseries(engagementSeriesResp)
        setUserCompetitionRank(rankResp)
      } catch (err) {
        console.error('Dashboard fetch error', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [router])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // compute a profile/profession progress value (0-100)
  const displayProfileProgress = (() => {
    const p = user?.profession_progress
    if (typeof p === 'number') return Math.min(100, Math.max(0, Math.round(p)))
    // for students, derive from completed/enrolled courses when available
    if (user?.user_type === 'student') {
      const completed = stats?.completed_courses ?? 0
      const enrolled = stats?.enrolled_courses ?? 0
      if (enrolled > 0) return Math.min(100, Math.round((completed / enrolled) * 100))
      return 0
    }
    // fallback default
    return 40
  })()
  return (
    <div className="space-y-6 container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100 border-t-4 border-indigo-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-full p-1 bg-gray-50 border border-gray-100">
                {user.profile_image_url ? (
                  <div className="h-full w-full rounded-full overflow-hidden">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_image_url}`} 
                      alt={user.first_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <span className="text-2xl font-bold text-gray-500">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : "F"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1 text-gray-900">
                Welcome back, {user.first_name}!
              </h1>
              <p className="text-gray-500 font-medium">Manage your academic activities</p>
            </div>
          </div>

          {/* profile progress + edit button */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center">
                <svg className="-rotate-90" width="64" height="64" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="36" cy="36" r="30" stroke="#f3f4f6" strokeWidth="6" />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    stroke="#7c3aed"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.PI * 2 * 30}`}
                    strokeDashoffset={`${Math.PI * 2 * 30 * (1 - (displayProfileProgress / 100))}`}
                    style={{ transition: 'stroke-dashoffset 600ms ease' }}
                  />
                </svg>
                <div className="absolute text-sm font-semibold">
                  <span>{displayProfileProgress}%</span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">{user.profession ?? (user.user_type === 'student' ? 'Student' : 'Profile')}</div>
            </div>

            <div>
              <Link href="/profile">
                <Button variant="secondary" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-0">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2">
        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Events */}
          <DashboardSection
            title="Events"
            accentColor="border-blue-500"
            icon={<Calendar className="h-5 w-5 text-blue-600" />}
            description="Upcoming events"
            viewAllLink="/faculty-dashboard/events"
            viewAllText="View All"
            items={events}
            renderItem={(event) => (
              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-blue-50/50 transition-all border border-transparent hover:border-blue-100">
                <div className="h-12 w-12 rounded-xl bg-white border border-blue-100 shadow-sm flex flex-col items-center justify-center text-blue-600 flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider">OCT</span>
                  <span className="text-lg font-bold leading-none">24</span>
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <h4 className="font-semibold text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">{event.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-blue-100 text-blue-600 bg-blue-50/30">Webinar</Badge>
                  </div>
                </div>
              </div>
            )}
            emptyMessage="No upcoming events"
          />

          {/* Workshops / FDPs */}
          <DashboardSection
            title="Workshops & FDPs"
            accentColor="border-indigo-500"
            icon={<Award className="h-5 w-5 text-indigo-600" />}
            description="Professional development"
            viewAllLink="/faculty-dashboard/workshops"
            viewAllText="View All"
            items={workshops}
            renderItem={(workshop) => (
              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100">
                <div className="h-12 w-12 rounded-xl bg-white border border-indigo-100 shadow-sm flex flex-col items-center justify-center text-indigo-600 flex-shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <h4 className="font-semibold text-gray-900 truncate text-sm group-hover:text-indigo-600 transition-colors">{workshop.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-indigo-100 text-indigo-600 bg-indigo-50/30">FDP</Badge>
                  </div>
                </div>
              </div>
            )}
            emptyMessage="No workshops or FDPs"
          />

          {/* Jobs */}
          <DashboardSection
            title="Jobs"
            accentColor="border-emerald-500"
            icon={<Briefcase className="h-5 w-5 text-emerald-600" />}
            description="Career opportunities"
            viewAllLink="/faculty-dashboard/jobs"
            viewAllText="View All"
            items={jobs}
            renderItem={(job) => (
              <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-emerald-50/50 transition-all border border-transparent hover:border-emerald-100">
                <div className="h-12 w-12 rounded-xl bg-white border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-emerald-600 flex-shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <h4 className="font-semibold text-gray-900 truncate text-sm group-hover:text-emerald-600 transition-colors">{job.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-emerald-100 text-emerald-600 bg-emerald-50/30">Full Time</Badge>
                  </div>
                </div>
              </div>
            )}
            emptyMessage="No job postings"
          />

          {/* Discussions */}
          <DashboardSection
            title="Discussions"
            accentColor="border-orange-500"
            icon={<MessageSquare className="h-5 w-5 text-orange-600" />}
            description="Join conversations"
            viewAllLink="/faculty-dashboard/discussions"
            viewAllText="View All"
            items={discussions}
            renderItem={(discussion) => (
              <div className="p-4 rounded-xl bg-gray-50/50 hover:bg-orange-50/30 transition-all border border-transparent hover:border-orange-100 group">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 font-bold text-xs">
                    U
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate text-sm">{discussion.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{discussion.content}</p>
                  </div>
                </div>
              </div>
            )}
            emptyMessage="No discussions"
          />
        </div>

        {/* Quick Access Title Blocks (clickable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/blogs" className="block">
            <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer rounded-lg border-2 border-t-4 border-gray-200 border-t-blue-500 hover:border-blue-400 bg-white hover:shadow-blue-200">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Blogs</h3>
                  <p className="text-xs text-gray-500 mt-1">Read and share articles</p>
                </div>
                <div className="text-xs text-blue-600 font-medium mt-3">View All →</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/events?filter=competition" className="block">
            <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer rounded-lg border-2 border-t-4 border-gray-200 border-t-purple-500 hover:border-purple-400 bg-white hover:shadow-purple-200">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Competitions</h3>
                  <p className="text-xs text-gray-500 mt-1">Participate and track</p>
                </div>
                <div className="text-xs text-purple-600 font-medium mt-3">View All →</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/expert-talks" className="block">
            <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer rounded-lg border-2 border-t-4 border-gray-200 border-t-orange-500 hover:border-orange-400 bg-white hover:shadow-orange-200">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Expert Talks</h3>
                  <p className="text-xs text-gray-500 mt-1">Upcoming expert talks & sessions</p>
                </div>
                <div className="text-xs text-orange-600 font-medium mt-3">View All →</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/surveys" className="block">
            <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer rounded-lg border-2 border-t-4 border-gray-200 border-t-pink-500 hover:border-pink-400 bg-white hover:shadow-pink-200">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Surveys</h3>
                  <p className="text-xs text-gray-500 mt-1">Feedback & polls</p>
                </div>
                <div className="text-xs text-pink-600 font-medium mt-3">View All →</div>
              </CardContent>
            </Card>
          </Link>
        </div>
        {/* Three analytics cards: Blog Views, Competition Activity, Your Competition Rank */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blog Views - show individual blogs */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-sky-500">
            <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-sky-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Blog Views</CardTitle>
                </div>
                <CardDescription className="text-sm font-medium pl-1">Your published blogs</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {quickBlogs && quickBlogs.length > 0 ? (
                <div className="space-y-3">
                  {quickBlogs.slice(0, 3).map((blog: any, index: number) => (
                    <div key={index} className="p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{blog.title || `Blog ${index + 1}`}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{blog.view_count || 0} views</span>
                        <span className="text-xs text-sky-600 font-medium">{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No blogs published yet</div>
              )}
            </CardContent>
          </Card>

          {/* Engagement Activity - Bar Chart */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-emerald-500">
            <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-emerald-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Your Engagement</CardTitle>
                </div>
                <CardDescription className="text-sm font-medium pl-1">Activity breakdown</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <BarChartSimple 
                labels={["Events", "Workshops"]} 
                values={[stats.registered_events || 0, stats.registered_workshops || 0]} 
              />
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs">
                <span className="text-gray-600">Total Activity: <span className="font-bold">{(stats.registered_events || 0) + (stats.registered_workshops || 0)}</span></span>
                <span className="text-gray-600">Most Active: <span className="font-bold text-emerald-600">{(stats.registered_events || 0) > (stats.registered_workshops || 0) ? 'Events' : 'Workshops'}</span></span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Tip: Diversify your activities for a well-rounded experience</p>
            </CardContent>
          </Card>

          {/* User Competition Rank */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-violet-500 rounded-2xl">
            <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-violet-600">
                    <User className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Your Competition Rank</CardTitle>
                </div>
                <CardDescription className="text-sm font-medium pl-1">Participation rank among peers</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-center gap-6">
                <div className="w-28">
                  <div style={{ height: 100 }}>
                    <LineChartSimple
                      data={(engagementTimeseries && engagementTimeseries.length > 0) ? engagementTimeseries.map((d:any) => d.score) : fallbackSeries.map((d:any) => d.score)}
                      labels={(engagementTimeseries && engagementTimeseries.length > 0) ? engagementTimeseries.map((d:any) => new Date(d.date).toLocaleDateString()) : fallbackSeries.map((d:any) => new Date(d.date).toLocaleDateString())}
                      dataLabel="Activity"
                      compact
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <div className="text-sm text-gray-500">Competitions participated</div>
                    <div className="text-3xl font-bold">{displayUserParticipations}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Rank</div>
                    <div className="text-lg font-semibold">{`${displayRankValue} / ${displayTotalUsers}`}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Percentile</div>
                    <div className="text-lg font-semibold text-violet-600">Top {displayPercentile}%</div>
                  </div>
                  {/* show top competition title; fallback to a hardcoded example when API returns nothing */}
                  <div className="mt-2 text-sm text-gray-500">
                    <div className="font-medium text-gray-700">Top competition</div>
                    <div className="truncate" title={(quickCompetitions && quickCompetitions.length > 0) ? quickCompetitions[0].title : fallbackCompetition.title}>
                      {(quickCompetitions && quickCompetitions.length > 0) ? quickCompetitions[0].title : fallbackCompetition.title}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Quick Access card removed per request; title blocks above replace it */}
      </div>
    </div>
  )
}
