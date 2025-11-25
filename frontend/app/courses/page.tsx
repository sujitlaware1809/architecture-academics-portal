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
import { LoginRequiredButton } from "@/components/login-required"

// mockCourses removed: page now fetches courses from backend via api.get('/courses')

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<FilterOptions>({
    category: "",
    difficulty: "",
    price: ""
  });

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      try {
        const response = await api.get('/courses')
        if (response.data) {
          // Transform backend data to match frontend interface
          const transformedCourses = response.data.map((course: any) => ({
            id: course.id,
            title: course.title,
            description: course.description || '',
            // Use a reliable online placeholder to avoid 404s when image_url is missing
            thumbnail: course.image_url || `https://via.placeholder.com/800x450.png?text=${encodeURIComponent('Course Image')}`,
            tags: [course.level || 'beginner'], // Use level as primary tag
            rating: 4.5, // Default rating
            students: course.enrolled_count || 0,
            duration: course.duration || '8 weeks',
            lastUpdated: course.updated_at || course.created_at,
            isFree: !course.price || course.price === 0,
            hasFreePreview: course.has_free_preview || false,
            totalLessons: course.total_lessons || 0,
            freeLessons: course.has_free_preview ? 1 : 0,
            isNew: false, // Can be calculated based on created_at
            isTrending: false,
            syllabus: course.syllabus ? [course.syllabus] : [],
            lessons: []
          }))
          setCourses(transformedCourses)
          setFilteredCourses(transformedCourses)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourses()
  }, [])

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

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!api.isAuthenticated()) {
        setEnrolledCourseIds(new Set());
        return;
      }
      
      try {
        const response = await api.get('/enrollments/my-courses');
        if (response && response.data) {
          const enrolledIds = new Set<number>(response.data.map((enrollment: any) => Number(enrollment.course_id)));
          setEnrolledCourseIds(enrolledIds);
          console.log('✅ Enrolled courses loaded:', enrolledIds.size, 'courses');
        } else {
          setEnrolledCourseIds(new Set());
        }
      } catch (error: any) {
        // Don't spam console with errors if backend is down
        if (error?.message?.includes('fetch') || error?.message?.includes('Failed to fetch')) {
          console.warn('⚠️ Could not connect to backend. Make sure backend server is running on port 8000');
        } else if (error?.response?.status !== 404) {
          console.error('Error fetching enrolled courses:', error);
        }
        // Set empty set so page still works
        setEnrolledCourseIds(new Set());
      }
    };

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchEnrolledCourses();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Apply filters and search
    let result = [...courses];

    // Apply search query
    if (searchQuery) {
      result = result.filter(
        course => 
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(course => 
        (course.tags || []).some(tag => tag.toLowerCase() === filters.category.toLowerCase())
      );
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      result = result.filter(course => 
        (course.tags || []).some(tag => tag.toLowerCase() === filters.difficulty.toLowerCase())
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 font-serif">
              Explore Premium Courses
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
              Discover world-class architecture courses taught by industry experts. Learn at your own pace.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="#course-catalog"
                className="inline-flex items-center px-6 py-3 rounded-full bg-white text-indigo-600 font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 duration-300"
              >
                Browse Courses
              </a>
              <Link
                href="/video-demo"
                className="inline-flex items-center px-6 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 duration-300"
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Demo Video
              </Link>
              <Link
                href="/profile/my-courses"
                className="inline-flex items-center px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 duration-300"
              >
                <Users className="h-4 w-4 mr-2" />
                My Courses
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <article key={course.id} className="group cursor-pointer h-full">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-cyan-100">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
                    
                    {/* Status Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {enrolledCourseIds.has(course.id) && (
                        <Badge className="bg-green-500 text-white hover:bg-green-600">✓ Enrolled</Badge>
                      )}
                      {course.isNew && (
                        <Badge className="bg-blue-500 text-white hover:bg-blue-600">✨ New</Badge>
                      )}
                      {course.isTrending && (
                        <Badge className="bg-blue-500 text-white hover:bg-blue-600">🔥 Trending</Badge>
                      )}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      {renderStars(course.rating)}
                      <span className="text-xs font-medium text-gray-700 ml-1">{course.rating}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(course.tags || []).slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2 flex-1">
                      {course.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {course.students.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-3.5 w-3.5" />
                        {course.totalLessons} lessons
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {enrolledCourseIds.has(course.id) ? (
                        <Link 
                          href={`/courses/${course.id}/learn`}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-colors text-center text-sm flex items-center justify-center gap-2"
                        >
                          <PlayCircle className="h-4 w-4" />
                          View Course
                        </Link>
                      ) : (
                        <>
                          <button 
                            onClick={() => openCourseModal(course)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                          >
                            Preview
                          </button>
                          <Link 
                            href={`/courses/${course.id}`}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors text-center text-sm flex items-center justify-center gap-2"
                          >
                            <PlayCircle className="h-4 w-4" />
                            Get Free Trial
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Faculty/Instructor Section */}
      <section className="bg-gradient-to-r from-blue-100 to-indigo-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">
            Are You an Architecture Instructor?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
            Share your knowledge and expertise with students around the world. Create engaging courses and help shape the next generation of architects.
          </p>
          <LoginRequiredButton
            onClick={() => window.location.href = "/create-course"}
            action="create courses"
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 duration-300"
          >
            Create a Course
          </LoginRequiredButton>
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
                <div className="font-bold text-lg">
                  <span className="text-blue-600">{selectedCourse.totalLessons} Total Lessons</span>
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AI</span>
                  </div>
                  <div>
                    <h4 className="font-medium">AI-Powered Architecture Course</h4>
                    <p className="text-sm text-gray-600">Comprehensive curriculum designed by AI</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-8">
                <button className="flex-grow bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-md font-bold hover:from-blue-700 hover:to-cyan-700 transition-colors">
                  Enroll in Course
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
    </div>
  );
}
