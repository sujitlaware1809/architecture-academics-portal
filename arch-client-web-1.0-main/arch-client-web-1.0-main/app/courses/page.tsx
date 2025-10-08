"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"
import "./courses.css"
import {
  Search,
  Filter,
  X,
  Star,
  StarHalf,
  ChevronDown,
  Users,
  Clock,
  Calendar,
  Bookmark,
  MessageSquare,
  Tag,
  PlayCircle,
  Lock,
  Play,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock course data with FREE trial system
const mockCourses = [
  {
    id: 1,
    title: "Fundamentals of Architectural Design",
    description: "Learn the fundamental principles of architectural design including composition, form, space, and structure. This course covers both theoretical concepts and practical applications.",
    thumbnail: "/placeholder.jpg",
    tags: ["Beginner", "Design", "Theory"],
    rating: 4.5,
    students: 1243,
    duration: "12 weeks",
    lastUpdated: "August 2025",
    isFree: true,
    hasFreePreview: true,
    totalLessons: 12,
    freeLessons: 1,
    isNew: true,
    isTrending: true,
    syllabus: [
      "Introduction to Architectural Principles (FREE PREVIEW)",
      "Form and Space Analysis",
      "Structural Concepts",
      "Design Process Methodology",
      "Case Studies of Influential Buildings"
    ],
    lessons: [
      {
        id: 1,
        title: "Introduction to Architectural Principles",
        duration: "15:30",
        isFree: true,
        videoUrl: "/AWS.mp4",
        description: "FREE PREVIEW - Learn the fundamental principles that guide architectural design"
      },
      {
        id: 2,
        title: "Form and Space Analysis",
        duration: "12:45",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Understanding how form and space interact in architectural design"
      },
      {
        id: 3,
        title: "Structural Concepts",
        duration: "18:20",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Basic structural principles for architects"
      },
      {
        id: 4,
        title: "Design Process Methodology",
        duration: "14:10",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Step-by-step approach to architectural design"
      },
      {
        id: 5,
        title: "Case Studies of Influential Buildings",
        duration: "20:15",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Analysis of iconic architectural works"
      }
    ]
  },
  {
    id: 2,
    title: "Sustainable Architecture: Green Building Design",
    description: "Explore sustainable design principles and green building practices. Learn how to integrate environmentally responsible approaches into architectural projects.",
    thumbnail: "/placeholder.jpg",
    tags: ["Intermediate", "Sustainability", "Green Design"],
    rating: 4.8,
    students: 856,
    duration: "8 weeks",
    lastUpdated: "September 2025",
    isFree: true,
    hasFreePreview: true,
    totalLessons: 10,
    freeLessons: 1,
    isNew: false,
    isTrending: true,
    syllabus: [
      "Principles of Sustainable Design (FREE PREVIEW)",
      "Energy Efficiency in Buildings",
      "Sustainable Materials and Resources",
      "Water Conservation Strategies",
      "LEED Certification Process"
    ],
    lessons: [
      {
        id: 1,
        title: "Principles of Sustainable Design",
        duration: "16:45",
        isFree: true,
        videoUrl: "/AWS.mp4",
        description: "FREE PREVIEW - Introduction to sustainable architecture principles"
      },
      {
        id: 2,
        title: "Energy Efficiency in Buildings",
        duration: "19:30",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Strategies for creating energy-efficient buildings"
      },
      {
        id: 3,
        title: "Sustainable Materials and Resources",
        duration: "14:20",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Choosing eco-friendly building materials"
      },
      {
        id: 4,
        title: "Water Conservation Strategies",
        duration: "13:15",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Implementing water-saving systems in buildings"
      },
      {
        id: 5,
        title: "LEED Certification Process",
        duration: "22:10",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Understanding and achieving LEED certification"
      }
    ]
  },
  {
    id: 3,
    title: "Digital Modeling for Architects",
    description: "Master digital modeling tools essential for modern architectural practice. Covers 3D modeling, rendering, and digital presentation techniques.",
    thumbnail: "/placeholder.jpg",
    tags: ["Advanced", "Digital Tools", "3D Modeling"],
    rating: 4.2,
    students: 721,
    duration: "10 weeks",
    lastUpdated: "July 2025",
    isFree: true,
    hasFreePreview: true,
    totalLessons: 15,
    freeLessons: 1,
    isNew: false,
    isTrending: false,
    syllabus: [
      "Introduction to 3D Modeling Software (FREE PREVIEW)",
      "Advanced Modeling Techniques",
      "Material Application and Texturing",
      "Lighting and Rendering",
      "Portfolio-Ready Presentation Methods"
    ],
    lessons: [
      {
        id: 1,
        title: "Introduction to 3D Modeling Software",
        duration: "18:40",
        isFree: true,
        videoUrl: "/AWS.mp4",
        description: "FREE PREVIEW - Getting started with 3D modeling tools"
      },
      {
        id: 2,
        title: "Advanced Modeling Techniques",
        duration: "25:15",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Master complex modeling workflows"
      },
      {
        id: 3,
        title: "Material Application and Texturing",
        duration: "20:30",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Creating realistic materials and textures"
      },
      {
        id: 4,
        title: "Lighting and Rendering",
        duration: "22:45",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Professional lighting and rendering techniques"
      },
      {
        id: 5,
        title: "Portfolio-Ready Presentation Methods",
        duration: "17:20",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Creating stunning architectural presentations"
      }
    ]
  },
  {
    id: 4,
    title: "Introduction to Urban Planning",
    description: "Explore the fundamentals of urban planning and design. Learn about city development patterns, zoning, public spaces, and sustainable urban strategies.",
    thumbnail: "/placeholder.jpg",
    tags: ["Beginner", "Urban Design", "Planning"],
    rating: 4.6,
    students: 932,
    duration: "9 weeks",
    lastUpdated: "August 2025",
    isFree: true,
    hasFreePreview: true,
    totalLessons: 8,
    freeLessons: 2,
    isNew: true,
    isTrending: false,
    syllabus: [
      "History of Urban Development (FREE)",
      "City Planning Principles (FREE)",
      "Zoning and Land Use",
      "Transportation Systems",
      "Community Development Strategies"
    ],
    lessons: [
      {
        id: 1,
        title: "History of Urban Development",
        duration: "14:25",
        isFree: true,
        videoUrl: "/AWS.mp4",
        description: "FREE - Evolution of urban planning through history"
      },
      {
        id: 2,
        title: "City Planning Principles",
        duration: "16:50",
        isFree: true,
        videoUrl: "/AWS.mp4",
        description: "FREE - Core principles of effective city planning"
      },
      {
        id: 3,
        title: "Zoning and Land Use",
        duration: "19:30",
        isFree: false,
        videoUrl: "/AWS.mp4",
        description: "Understanding zoning laws and land use planning"
      }
    ]
  },
  {
    id: 5,
    title: "Architectural History: Ancient to Modern",
    description: "A comprehensive journey through architectural history, from ancient civilizations to contemporary movements. Analyze key buildings and understand their cultural context.",
    thumbnail: "/placeholder.jpg",
    tags: ["Intermediate", "History", "Theory"],
    rating: 4.9,
    students: 1587,
    duration: "14 weeks",
    lastUpdated: "June 2025",
    isFree: false,
    hasFreePreview: true,
    totalLessons: 16,
    freeLessons: 1,
    isNew: false,
    isTrending: true,
    syllabus: [
      "Ancient Architectural Traditions (FREE)",
      "Classical and Renaissance Architecture",
      "Industrial Revolution and Modern Movement",
      "Postmodernism and Contemporary Trends",
      "Critical Analysis of Historical Buildings"
    ],
    lessons: [
      {
        id: 1,
        title: "Ancient Architectural Traditions",
        duration: "21:15",
        isFree: true,
        videoUrl: "/AWS.mp4",
        description: "FREE - Exploring ancient architectural styles and techniques"
      }
    ]
  },
  {
    id: 6,
    title: "Architectural Drawing and Visualization",
    description: "Develop essential drawing and visualization skills for architectural representation. Covers both traditional hand drawing and digital visualization techniques.",
    thumbnail: "/placeholder.jpg",
    tags: ["Beginner", "Drawing", "Visualization"],
    rating: 4.3,
    students: 645,
    duration: "8 weeks",
    lastUpdated: "September 2025",
    isFree: false,
    hasFreePreview: true,
    totalLessons: 10,
    freeLessons: 1,
    isNew: false,
    isTrending: false,
    syllabus: [
      "Fundamentals of Architectural Drawing (FREE)",
      "Perspective and Spatial Representation",
      "Technical Drawing and Standards",
      "Digital Visualization Techniques",
      "Presentation Methods for Clients"
    ],
    lessons: [
      {
        id: 1,
        title: "Fundamentals of Architectural Drawing",
        duration: "17:30",
        isFree: true,
        videoUrl: "/AWS.mp4",
        description: "FREE - Basic drawing techniques for architects"
      }
    ]
  },
  {
    id: 7,
    title: "Construction Management for Architects",
    description: "Learn the principles of construction management from an architectural perspective. Covers project planning, scheduling, budgeting, and site management.",
    thumbnail: "/placeholder.jpg",
    tags: ["Advanced", "Construction", "Management"],
    rating: 4.7,
    students: 512,
    duration: "10 weeks",
    lastUpdated: "July 2025",
    isFree: false,
    hasFreePreview: true,
    totalLessons: 12,
    freeLessons: 1,
    isNew: true,
    isTrending: false,
    syllabus: [
      "Project Planning and Organization (FREE)",
      "Cost Estimation and Budgeting",
      "Construction Scheduling",
      "Contract Administration",
      "Site Management and Safety"
    ],
    lessons: [
      {
        id: 1,
        title: "Project Planning and Organization",
        duration: "19:45",
        isFree: true,
        videoUrl: "/AWS.mp4",
        description: "FREE - Essential project planning for construction management"
      }
    ]
  },
  {
    id: 8,
    title: "Architectural Acoustics",
    description: "Understand the principles of architectural acoustics and their application in building design. Learn to create spaces with optimal sound performance.",
    thumbnail: "/placeholder.jpg",
    tags: ["Intermediate", "Acoustics", "Specialized"],
    rating: 4.4,
    students: 387,
    duration: "6 weeks",
    lastUpdated: "August 2025",
    isFree: false,
    hasFreePreview: true,
    totalLessons: 8,
    freeLessons: 1,
    isNew: false,
    isTrending: false,
    syllabus: [
      "Fundamentals of Sound and Acoustics (FREE)",
      "Room Acoustics and Design",
      "Sound Isolation Techniques",
      "Mechanical System Noise Control",
      "Acoustic Modeling and Testing"
    ],
    lessons: [
      {
        id: 1,
        title: "Fundamentals of Sound and Acoustics",
        duration: "16:20",
        isFree: true,
        videoUrl: "/AWS.mp4",
        description: "FREE - Basic principles of sound and acoustic design"
      }
    ]
  }
];

// Types
interface Lesson {
  id: number;
  title: string;
  duration: string;
  isFree: boolean;
  videoUrl: string;
  description?: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  rating: number;
  students: number;
  duration: string;
  lastUpdated: string;
  isFree: boolean;
  hasFreePreview: boolean;
  totalLessons: number;
  freeLessons: number;
  isNew: boolean;
  isTrending: boolean;
  syllabus: string[];
  lessons: Lesson[];
}

interface FilterOptions {
  category: string;
  difficulty: string;
  price: string;
}

export default function CoursesPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: "",
    difficulty: "",
    price: ""
  });

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = api.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const userData = api.getStoredUser();
        setUser(userData);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...courses];

    // Apply search query
    if (searchQuery) {
      result = result.filter(
        course => 
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(course => 
        course.tags.some(tag => tag.toLowerCase() === filters.category.toLowerCase())
      );
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      result = result.filter(course => 
        course.tags.some(tag => tag.toLowerCase() === filters.difficulty.toLowerCase())
      );
    }

    // Apply price filter
    if (filters.price === "free") {
      result = result.filter(course => course.isFree);
    } else if (filters.price === "paid") {
      result = result.filter(course => !course.isFree);
    }

    setFilteredCourses(result);
  }, [searchQuery, filters, courses]);

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === prev[filterType] ? "" : value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      difficulty: "",
      price: ""
    });
    setSearchQuery("");
  };

  const openCourseModal = (course: Course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const closeCourseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 font-serif">
              Learn Anytime, Anywhere
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Discover world-class architecture courses taught by industry experts
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="#course-catalog"
                className="inline-flex items-center px-6 py-3 rounded-full bg-white text-blue-600 font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 duration-300"
              >
                Browse Courses
              </a>
              <Link
                href="/video-demo"
                className="inline-flex items-center px-6 py-3 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 duration-300"
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Demo Video
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-pattern-dots"></div>
          <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-pattern-dots"></div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white shadow-md rounded-lg -mt-10 max-w-6xl mx-auto z-20 relative p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {/* Search bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search courses, topics, or instructors..."
              className="pl-10 h-12 text-base border-gray-300 focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Filter */}
            <div className="relative">
              <button className={`flex items-center px-4 py-2 rounded-full text-sm ${filters.category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'} hover:bg-blue-100 hover:text-blue-800 transition-colors`}>
                <Tag className="mr-2 h-4 w-4" />
                <span className="mr-1">Category:</span>
                <span className="font-medium">{filters.category || 'All'}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-2 hidden group-hover:block">
                {['Design', 'Theory', 'Sustainability', 'Digital Tools', 'Urban Design', 'History', 'Drawing', 'Construction', 'Acoustics'].map(category => (
                  <button
                    key={category}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${filters.category === category ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                    onClick={() => handleFilterChange('category', category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
              <button className={`flex items-center px-4 py-2 rounded-full text-sm ${filters.difficulty ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'} hover:bg-blue-100 hover:text-blue-800 transition-colors`}>
                <Users className="mr-2 h-4 w-4" />
                <span className="mr-1">Level:</span>
                <span className="font-medium">{filters.difficulty || 'All'}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-2 hidden group-hover:block">
                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                  <button
                    key={level}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${filters.difficulty === level ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                    onClick={() => handleFilterChange('difficulty', level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="relative">
              <button className={`flex items-center px-4 py-2 rounded-full text-sm ${filters.price ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'} hover:bg-blue-100 hover:text-blue-800 transition-colors`}>
                <span className="mr-1">Price:</span>
                <span className="font-medium">{filters.price === 'free' ? 'Free' : filters.price === 'paid' ? 'Paid' : 'All'}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-2 hidden group-hover:block">
                {['free', 'paid'].map(price => (
                  <button
                    key={price}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${filters.price === price ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                    onClick={() => handleFilterChange('price', price)}
                  >
                    {price === 'free' ? 'Free' : 'Paid'}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            {(filters.category || filters.difficulty || filters.price || searchQuery) && (
              <button
                onClick={resetFilters}
                className="flex items-center px-4 py-2 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                <X className="mr-1 h-4 w-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Course Catalog Section */}
      <section id="course-catalog" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 font-serif text-center">
          Architecture Course Catalog
        </h2>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">No courses match your search criteria.</p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course) => (
              <Card 
                key={course.id} 
                className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 group border-gray-200"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-0 left-0 p-2 flex flex-col gap-1">
                    {course.isNew && (
                      <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
                    )}
                    {course.isTrending && (
                      <Badge className="bg-purple-500 hover:bg-purple-600">Trending</Badge>
                    )}
                    {course.isFree && (
                      <Badge className="bg-green-500 hover:bg-green-600">Free</Badge>
                    )}
                    {!course.isFree && course.hasFreePreview && (
                      <Badge className="bg-orange-500 hover:bg-orange-600">
                        {course.freeLessons} Free Lesson{course.freeLessons > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex gap-1.5 mb-2">
                    {renderStars(course.rating)}
                    <span className="text-sm text-gray-600 ml-1">({course.rating})</span>
                  </div>
                  <CardTitle className="text-lg font-bold leading-tight hover:text-blue-600 transition-colors cursor-pointer" onClick={() => openCourseModal(course)}>
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4 flex-grow">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {course.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {course.description}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="font-semibold text-purple-700">
                    {course.isFree ? (
                      <span className="text-green-600">FREE COURSE</span>
                    ) : (
                      <span>{course.freeLessons} Free + Premium</span>
                    )}
                  </div>
                </CardFooter>
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openCourseModal(course)}
                      className="flex-grow bg-white text-purple-600 py-2 rounded-md font-medium hover:bg-purple-50 transition-colors"
                    >
                      Preview
                    </button>
                    <Link 
                      href={`/courses/${course.id}`}
                      className="flex-grow bg-white text-purple-600 py-2 rounded-md font-medium hover:bg-purple-50 transition-colors text-center"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Faculty/Instructor Section */}
      <section className="bg-gradient-to-r from-blue-100 to-purple-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">
            Are You an Architecture Instructor?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
            Share your knowledge and expertise with students around the world. Create engaging courses and help shape the next generation of architects.
          </p>
          <Link
            href={isAuthenticated ? "/create-course" : "/login?redirect=/create-course"}
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 duration-300"
          >
            Create a Course
          </Link>
        </div>
      </section>

      {/* Course Detail Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-64">
              <Image
                src={selectedCourse.thumbnail}
                alt={selectedCourse.title}
                fill
                className="object-cover rounded-t-lg"
              />
              <button 
                onClick={closeCourseModal}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <div className="flex gap-1.5 mb-2">
                  {renderStars(selectedCourse.rating)}
                  <span className="text-sm text-white ml-1">({selectedCourse.rating})</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedCourse.title}</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{selectedCourse.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{selectedCourse.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Last updated: {selectedCourse.lastUpdated}</span>
                </div>
                <div className="flex-grow"></div>
                <div className="font-bold text-lg text-purple-700">
                  {selectedCourse.isFree ? (
                    <span className="text-green-600">FREE COURSE</span>
                  ) : (
                    <span>{selectedCourse.freeLessons} Free Lessons + Premium Access</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">About this course</h3>
                <p className="text-gray-700">{selectedCourse.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">What you'll learn</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCourse.syllabus.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <div className="rounded-full bg-blue-100 p-0.5 mt-0.5">
                        <svg className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Course Type</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AI</span>
                  </div>
                  <div>
                    <h4 className="font-medium">AI-Powered Architecture Course</h4>
                    <p className="text-sm text-gray-600">Comprehensive curriculum designed by AI</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-8">
                <button className="flex-grow bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-md font-bold hover:from-purple-700 hover:to-blue-700 transition-colors">
                  {selectedCourse.isFree ? 'Start Free Course' : `Start with ${selectedCourse.freeLessons} Free Lesson${selectedCourse.freeLessons > 1 ? 's' : ''}`}
                </button>
                <button className="bg-white border border-gray-300 px-4 py-3 rounded-md hover:bg-gray-50 transition-colors">
                  <Bookmark className="h-5 w-5 text-gray-600" />
                </button>
                <button className="bg-white border border-gray-300 px-4 py-3 rounded-md hover:bg-gray-50 transition-colors">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Architecture Academics</h3>
              <p className="text-gray-400 text-sm">
                Providing quality architecture education for students and professionals worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="/courses" className="text-gray-400 hover:text-white transition-colors">All Courses</a></li>
                <li><a href="/instructors" className="text-gray-400 hover:text-white transition-colors">Instructors</a></li>
                <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">My Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="/support" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                <li><a href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
              <p className="text-gray-400 text-sm">
                Subscribe to our newsletter for updates
              </p>
              <div className="mt-2 flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-grow bg-gray-700 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors">
                  Submit
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Architecture Academics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
