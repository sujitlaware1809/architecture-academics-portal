import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, FileText, BookOpen, Upload, PlayCircle } from 'lucide-react';

export default function CourseTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Enhanced Course Management System</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Complete video course platform with lesson management and file uploads
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <Video className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle>Video Lessons</CardTitle>
            <CardDescription>
              Upload and manage video lessons with duration tracking and progress monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Support for multiple video formats</li>
              <li>• Custom video player with controls</li>
              <li>• Progress tracking</li>
              <li>• Free preview options</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-green-500 mb-2" />
            <CardTitle>Course Materials</CardTitle>
            <CardDescription>
              Attach downloadable resources, PDFs, and course documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• PDF, DOC, PPT support</li>
              <li>• File size management</li>
              <li>• Download controls</li>
              <li>• Organized by order</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 text-indigo-500 mb-2" />
            <CardTitle>Course Management</CardTitle>
            <CardDescription>
              Complete course administration with detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Student enrollment tracking</li>
              <li>• Course duration analysis</li>
              <li>• Lesson ordering</li>
              <li>• Status management</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sample Course Preview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sample Course: Architectural Design Fundamentals</CardTitle>
          <CardDescription>
            12 video lessons • 2 hours total • 32 enrolled students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Recent Lessons</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 border rounded">
                  <PlayCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Introduction to Architecture</div>
                    <div className="text-xs text-muted-foreground">8:00 • Free Preview</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 border rounded">
                  <PlayCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Design Process & Methodology</div>
                    <div className="text-xs text-muted-foreground">12:00 • Premium</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 border rounded">
                  <PlayCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Site Analysis & Context</div>
                    <div className="text-xs text-muted-foreground">10:00 • Premium</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Course Materials</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 border rounded">
                  <FileText className="h-4 w-4 text-red-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Course Syllabus</div>
                    <div className="text-xs text-muted-foreground">PDF • 512 KB</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 border rounded">
                  <FileText className="h-4 w-4 text-red-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Drawing Standards</div>
                    <div className="text-xs text-muted-foreground">PDF • 1 MB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="text-center space-x-4">
        <Button asChild size="lg">
          <Link href="/admin/courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Original Admin Courses
          </Link>
        </Button>
        
        <Button asChild variant="outline" size="lg">
          <Link href="/admin/courses/enhanced-page">
            <Video className="h-4 w-4 mr-2" />
            Enhanced Course Manager
          </Link>
        </Button>
        
        <Button asChild variant="outline" size="lg">
          <Link href="http://localhost:8000/docs" target="_blank">
            <Upload className="h-4 w-4 mr-2" />
            API Documentation
          </Link>
        </Button>
      </div>

      {/* Backend Features */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Backend Features Implemented</CardTitle>
          <CardDescription>
            Complete API endpoints for video course management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Database Models</h4>
              <ul className="text-sm space-y-1">
                <li>✅ CourseLesson with video_url and duration</li>
                <li>✅ CourseMaterial with file management</li>
                <li>✅ LessonProgress tracking</li>
                <li>✅ Order management for lessons/materials</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">API Endpoints</h4>
              <ul className="text-sm space-y-1">
                <li>✅ /courses/&#123;id&#125;/lessons (CRUD operations)</li>
                <li>✅ /courses/&#123;id&#125;/materials (File uploads)</li>
                <li>✅ Video upload with 500MB limit</li>
                <li>✅ Static file serving for videos/materials</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sample Data Initialized</CardTitle>
          <CardDescription>
            Ready-to-use course with lessons and materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-muted-foreground">Sample Lessons</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-muted-foreground">Course Materials</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">2h</div>
                <div className="text-sm text-muted-foreground">Total Duration</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}