"use client"

import { VideoPlayer } from '@/components/ui/video-player'
import Link from 'next/link'
import { ArrowLeft, Play, Star, Users, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function VideoDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/courses"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
            <div className="h-6 border-l border-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Video Demo - AWS Architecture Course</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <VideoPlayer
                src="/AWS.mp4"
                title="AWS Architecture Fundamentals"
                className="aspect-video"
                controls={true}
              />
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-green-500 hover:bg-green-600">
                    FREE PREVIEW
                  </Badge>
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    AI-Powered Course
                  </Badge>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Introduction to AWS Architecture
                </h2>
                
                <p className="text-gray-700 mb-4">
                  This is a demo video showing how our video player works with the AWS.mp4 file. 
                  In this lesson, you'll learn the fundamental concepts of AWS architecture and 
                  how it applies to modern architectural design and construction management.
                </p>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8 Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>1,234 Students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>15:30 Duration</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Features */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Video Player Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Play className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Custom Controls</h4>
                    <p className="text-sm text-gray-600">Play, pause, skip, and fullscreen controls</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Progress Tracking</h4>
                    <p className="text-sm text-gray-600">Visual progress bar and time display</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Professional Quality</h4>
                    <p className="text-sm text-gray-600">High-quality video streaming</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Responsive Design</h4>
                    <p className="text-sm text-gray-600">Works on all devices and screen sizes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Course Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Level:</span>
                  <span className="ml-2 text-sm text-gray-900">Beginner</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Duration:</span>
                  <span className="ml-2 text-sm text-gray-900">12 weeks</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Language:</span>
                  <span className="ml-2 text-sm text-gray-900">English</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Total Lessons:</span>
                  <span className="ml-2 text-sm text-gray-900">15 lessons</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Free Lessons:</span>
                  <span className="ml-2 text-sm text-green-600 font-medium">1 lesson</span>
                </div>
              </div>
            </div>

            {/* Demo Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Demo Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/courses"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors text-center block"
                >
                  View All Courses
                </Link>
                
                <Link
                  href="/courses/1"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors text-center block"
                >
                  View Full Course
                </Link>
                
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors">
                  Download Demo Video
                </button>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Technical Details</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>File:</strong> AWS.mp4</p>
                <p><strong>Location:</strong> /public/AWS.mp4</p>
                <p><strong>Player:</strong> Custom React Video Player</p>
                <p><strong>Features:</strong> Custom controls, progress tracking, fullscreen</p>
                <p><strong>Responsive:</strong> Works on all devices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}