"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { auth, type User } from "@/lib/auth"
import { LoginRequiredButton } from "@/components/login-required"
import { 
  BookOpen, Clock, Users, Star, Play, FileText, Award, 
  CheckCircle, Calendar, Target, TrendingUp, Download,
  Video, PenTool, Ruler, Palette, Building2, Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NATACourse {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  rating: number
  studentsEnrolled: number
  lessonsCount: number
  certificateIncluded: boolean
  moodleUrl?: string
  thumbnail: string
  category: 'Drawing' | 'Mathematics' | 'General Aptitude' | 'Full Course'
  skills: string[]
  syllabus: {
    module: string
    topics: string[]
    duration: string
  }[]
  features: string[]
}

export default function NATACoursesPage() {
  const [courses, setCourses] = useState<NATACourse[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [loading, setLoading] = useState(true)

  // Sample NATA courses data
  const sampleCourses: NATACourse[] = [
    {
      id: 1,
      title: "NATA Drawing Fundamentals",
      description: "Master the art of architectural drawing with comprehensive techniques for NATA preparation",
      instructor: "Prof. Arjun Mehta",
      duration: "8 weeks",
      difficulty: 'Beginner',
      rating: 4.8,
      studentsEnrolled: 1250,
      lessonsCount: 45,
      certificateIncluded: true,
      moodleUrl: "https://moodle.architectureacademics.com/course/nata-drawing",
      thumbnail: "/api/placeholder/400/250",
      category: 'Drawing',
      skills: ['Perspective Drawing', 'Sketching', 'Geometric Construction', 'Shading'],
      syllabus: [
        {
          module: "Basic Drawing Techniques",
          topics: ["Line Drawing", "Basic Shapes", "Proportions", "Hand-eye Coordination"],
          duration: "2 weeks"
        },
        {
          module: "Perspective Drawing",
          topics: ["One-point Perspective", "Two-point Perspective", "Three-point Perspective"],
          duration: "2 weeks"
        },
        {
          module: "Architectural Elements",
          topics: ["Building Components", "Structural Elements", "Landscape Elements"],
          duration: "2 weeks"
        },
        {
          module: "Advanced Techniques",
          topics: ["Shading & Rendering", "Texture Studies", "Composition", "Speed Drawing"],
          duration: "2 weeks"
        }
      ],
      features: [
        "Live interactive sessions",
        "Personal feedback on drawings",
        "Practice worksheets",
        "Mock test papers",
        "Moodle LMS access"
      ]
    },
    {
      id: 2,
      title: "NATA Mathematics Mastery",
      description: "Complete mathematics preparation covering all NATA syllabus topics with solved examples",
      instructor: "Dr. Priya Sharma",
      duration: "6 weeks",
      difficulty: 'Intermediate',
      rating: 4.7,
      studentsEnrolled: 980,
      lessonsCount: 32,
      certificateIncluded: true,
      moodleUrl: "https://moodle.architectureacademics.com/course/nata-mathematics",
      thumbnail: "/api/placeholder/400/250",
      category: 'Mathematics',
      skills: ['Algebra', 'Geometry', 'Trigonometry', 'Coordinate Geometry'],
      syllabus: [
        {
          module: "Algebra & Number Systems",
          topics: ["Linear Equations", "Quadratic Equations", "Logarithms", "Progressions"],
          duration: "1.5 weeks"
        },
        {
          module: "Geometry",
          topics: ["Triangles", "Circles", "Polygons", "Mensuration"],
          duration: "2 weeks"
        },
        {
          module: "Trigonometry",
          topics: ["Ratios", "Identities", "Heights & Distances", "Applications"],
          duration: "1.5 weeks"
        },
        {
          module: "Coordinate Geometry",
          topics: ["Straight Lines", "Circles", "Parabola", "Distance Formula"],
          duration: "1 week"
        }
      ],
      features: [
        "Video lectures with animations",
        "Step-by-step solutions",
        "Practice questions bank",
        "Weekly assessments",
        "Doubt clearing sessions"
      ]
    },
    {
      id: 3,
      title: "NATA General Aptitude & Reasoning",
      description: "Enhance logical reasoning, visual perception and general aptitude skills for NATA success",
      instructor: "Mr. Karan Singh",
      duration: "4 weeks",
      difficulty: 'Beginner',
      rating: 4.6,
      studentsEnrolled: 675,
      lessonsCount: 28,
      certificateIncluded: true,
      moodleUrl: "https://moodle.architectureacademics.com/course/nata-aptitude",
      thumbnail: "/api/placeholder/400/250",
      category: 'General Aptitude',
      skills: ['Logical Reasoning', 'Visual Perception', 'Spatial Ability', 'Pattern Recognition'],
      syllabus: [
        {
          module: "Logical Reasoning",
          topics: ["Analogies", "Classification", "Series", "Coding-Decoding"],
          duration: "1 week"
        },
        {
          module: "Visual Perception",
          topics: ["Pattern Recognition", "Figure Completion", "Mirror Images", "Hidden Figures"],
          duration: "1 week"
        },
        {
          module: "Spatial Ability",
          topics: ["3D Visualization", "Rotation", "Reflection", "Cross-sections"],
          duration: "1 week"
        },
        {
          module: "General Aptitude",
          topics: ["Data Interpretation", "Quantitative Comparison", "Problem Solving"],
          duration: "1 week"
        }
      ],
      features: [
        "Interactive visual exercises",
        "Timed practice tests",
        "Performance analytics",
        "Mobile app access",
        "Progress tracking"
      ]
    },
    {
      id: 4,
      title: "Complete NATA Preparation Course",
      description: "Comprehensive 12-week program covering all NATA subjects with mock tests and personal mentoring",
      instructor: "Team Architecture Academics",
      duration: "12 weeks",
      difficulty: 'Advanced',
      rating: 4.9,
      studentsEnrolled: 2100,
      lessonsCount: 120,
      certificateIncluded: true,
      moodleUrl: "https://moodle.architectureacademics.com/course/complete-nata",
      thumbnail: "/api/placeholder/400/250",
      category: 'Full Course',
      skills: ['All NATA Skills', 'Test Strategy', 'Time Management', 'Exam Psychology'],
      syllabus: [
        {
          module: "Foundation Phase",
          topics: ["NATA Overview", "Study Plan", "Basic Skills Assessment"],
          duration: "1 week"
        },
        {
          module: "Drawing Intensive",
          topics: ["All Drawing Modules", "Portfolio Development", "Speed Training"],
          duration: "5 weeks"
        },
        {
          module: "Mathematics Deep Dive",
          topics: ["Complete Syllabus", "Problem Solving Techniques", "Formula Sheets"],
          duration: "3 weeks"
        },
        {
          module: "Aptitude & Mock Tests",
          topics: ["Reasoning Skills", "Full Length Tests", "Analysis & Improvement"],
          duration: "3 weeks"
        }
      ],
      features: [
        "Personal mentor assignment",
        "Weekly one-on-one sessions",
        "Full-length mock tests",
        "Performance analysis reports",
        "Admission guidance",
        "Complete Moodle course access"
      ]
    }
  ]

  const categories = ['All', 'Drawing', 'Mathematics', 'General Aptitude', 'Full Course']

  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call
      setCourses(sampleCourses)
      
      // Fetch current user
      if (auth.isAuthenticated()) {
        const user = await auth.getCurrentUser()
        setCurrentUser(user)
      }
      
      setLoading(false)
    }

    fetchData()
  }, [])

  const filteredCourses = selectedCategory === 'All' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory)

  const handleEnrollCourse = (course: NATACourse) => {
    if (!currentUser) {
      window.location.href = `/login?redirect=${encodeURIComponent('/nata-courses')}`
      return
    }

    // Redirect to Moodle course or enrollment page
    if (course.moodleUrl) {
      window.open(course.moodleUrl, '_blank')
    } else {
      // Handle enrollment logic
      alert(`Enrolling in ${course.title}. This will integrate with Moodle LMS.`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NATA courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              NATA Preparation Courses
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Master the National Aptitude Test in Architecture with our comprehensive, 
              Moodle-integrated courses designed by industry experts
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Award className="h-8 w-8 text-yellow-300 mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Expert Instructors</h3>
                <p className="text-sm text-blue-100">Learn from experienced architects and educators</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Target className="h-8 w-8 text-green-300 mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Focused Curriculum</h3>
                <p className="text-sm text-blue-100">Syllabus designed specifically for NATA success</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <TrendingUp className="h-8 w-8 text-orange-300 mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Proven Results</h3>
                <p className="text-sm text-blue-100">95% of our students clear NATA on first attempt</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Categories */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="px-6 py-2"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white text-gray-900 font-semibold">
                    {course.category}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/20 text-white backdrop-blur-sm">
                    {course.difficulty}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessonsCount} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.studentsEnrolled}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-gray-500 text-sm">({course.studentsEnrolled} students)</span>
                  </div>
                  {course.certificateIncluded && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Award className="h-3 w-3 mr-1" />
                      Certificate
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {course.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {course.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{course.skills.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <LoginRequiredButton
                    onClick={() => handleEnrollCourse(course)}
                    action="enroll in courses"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {course.moodleUrl ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Access on Moodle
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Enroll Now
                      </>
                    )}
                  </LoginRequiredButton>
                  
                  <Link href={`/nata-courses/${course.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Moodle Integration Info */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-6 shadow-lg">
              <Lightbulb className="h-8 w-8 text-green-600 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powered by Moodle LMS
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Our NATA courses are integrated with Moodle Learning Management System, 
              providing you with a seamless, interactive learning experience with 
              progress tracking, assignments, and community features.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Video className="h-8 w-8 text-blue-600 mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Interactive Content</h3>
                <p className="text-sm text-gray-600">Video lectures, quizzes, and assignments</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <TrendingUp className="h-8 w-8 text-green-600 mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Progress Tracking</h3>
                <p className="text-sm text-gray-600">Monitor your learning journey and improvements</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Users className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Community Learning</h3>
                <p className="text-sm text-gray-600">Connect with peers and instructors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}