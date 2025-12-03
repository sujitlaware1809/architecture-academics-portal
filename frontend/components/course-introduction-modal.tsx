"use client"

import { X, Play, Users, Clock, Calendar, BookOpen, Award, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CourseIntroductionModalProps {
  course: {
    id: number
    title: string
    description: string
    thumbnail: string
    rating: number
    students: number
    duration: string
    lastUpdated: string
    totalLessons: number
    syllabus: string[]
    tags: string[]
    isFree: boolean
  }
  isOpen: boolean
  onClose: () => void
}

export function CourseIntroductionModal({ course, isOpen, onClose }: CourseIntroductionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[60] bg-white/20 backdrop-blur-md text-white rounded-full p-2.5 hover:bg-white/30 transition-all hover:scale-110 border border-white/40 shadow-lg"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Image */}
        <div className="relative h-72 overflow-hidden rounded-t-xl">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          {/* Course Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {course.tags?.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} className="bg-white/20 text-white backdrop-blur-sm border-white/40 text-xs font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{course.title}</h2>
            <div className="flex items-center gap-4 text-white/90 text-sm drop-shadow">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {course.students.toLocaleString()} students
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {course.totalLessons} lessons
              </span>
            </div>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="px-8 py-6 bg-gradient-to-br from-slate-100 via-teal-50 to-slate-50 border-b-2 border-teal-200">
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
            <Link 
              href={`/courses/${course.id}`}
              className="flex-1 bg-gradient-to-r from-slate-700 via-teal-600 to-slate-800 text-white py-4 px-8 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-[1.02] text-center flex items-center justify-center gap-3 group"
            >
              <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
              View Course Details
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Introduction Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-6 w-6 text-teal-600" />
              Course Introduction
            </h3>
            <p className="text-gray-700 leading-relaxed text-base mb-5">
              {course.description}
            </p>
            <div className="bg-gradient-to-r from-teal-50 via-slate-50 to-teal-50 border-l-4 border-teal-600 p-5 rounded-r-xl shadow-sm">
              <p className="text-teal-900 text-base flex items-start gap-2">
                <span className="text-2xl">🎓</span>
                <span className="flex-1">
                  This comprehensive course will guide you through all essential concepts and practical applications. 
                  Start your learning journey today!
                </span>
              </p>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-5">What You'll Learn</h3>
            <div className="space-y-3">
              {course.syllabus && course.syllabus.length > 0 ? (
                course.syllabus.slice(0, 6).map((item, index) => {
                  // Parse weekly schedule format: "Week X-Y: Topic1 Week Z: Topic2"
                  const weekPattern = /Week\s+(\d+(?:\s*-\s*\d+)?)\s*:\s*([^W]+?)(?=\s+Week\s+\d+|$)/gi;
                  const matches = [...item.matchAll(weekPattern)];
                  
                  if (matches.length > 0) {
                    // Format as weekly schedule card
                    return (
                      <div key={index} className="p-5 rounded-xl bg-gradient-to-br from-slate-50 via-teal-50 to-slate-50 border-l-4 border-teal-600 shadow-md hover:shadow-lg transition-all">
                        <div className="space-y-3">
                          {matches.map((match, wIdx) => {
                            const weekNum = match[1].trim();
                            const content = match[2].trim();
                            return (
                              <div key={wIdx} className="flex items-start gap-3">
                                <div className="flex items-center gap-2.5 min-w-[90px]">
                                  <div className="rounded-full bg-gradient-to-br from-slate-600 to-teal-600 p-1 shadow-sm">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                  </div>
                                  <span className="font-bold text-teal-700 text-base">Week {weekNum}</span>
                                </div>
                                <span className="text-gray-700 text-base leading-relaxed flex-1">{content}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  
                  // Default format for non-weekly items
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all border border-slate-200 shadow-sm hover:shadow-md">
                      <div className="rounded-full bg-gradient-to-br from-slate-600 to-teal-600 p-1.5 mt-0.5 flex-shrink-0 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700 text-base leading-relaxed">{item}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 italic text-sm p-4 text-center bg-slate-50 rounded-lg">
                  Comprehensive curriculum covering all essential topics
                </div>
              )}
            </div>
          </div>

          {/* Course Stats */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-5">Course Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 p-7 bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 rounded-2xl border-2 border-teal-200 shadow-md">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700 mb-1">{course.totalLessons}</div>
                <div className="text-xs text-gray-600 font-medium">Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-1">{course.duration}</div>
                <div className="text-xs text-gray-600 font-medium">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-600 mb-1">{course.rating.toFixed(1)}⭐</div>
                <div className="text-xs text-gray-600 font-medium">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-700 mb-1">{course.students.toLocaleString()}</div>
                <div className="text-xs text-gray-600 font-medium">Students</div>
              </div>
            </div>
          </div>

          {/* Free Preview Notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ✨ Watch the introduction video for free! 
              {!course.isFree && " Subscribe to access all course content."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
