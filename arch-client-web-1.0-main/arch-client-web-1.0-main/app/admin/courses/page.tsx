'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, BookOpen, Users, Clock, Eye, Video, FileText, Upload, PlayCircle, Download } from 'lucide-react';
// import { useToast } from '@/components/ui/use-toast';

interface CourseLesson {
  id: number;
  title: string;
  description?: string;
  video_url?: string;
  video_duration?: number; // in seconds
  order_index: number;
  is_free: boolean;
  transcript?: string;
  created_at: string;
  updated_at: string;
}

interface CourseMaterial {
  id: number;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  order_index: number;
  is_downloadable: boolean;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  max_students: number;
  is_trial: boolean;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  syllabus?: string;
  prerequisites?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  instructor_id?: number;
  enrolled_count: number;
  lessons?: CourseLesson[];
  materials?: CourseMaterial[];
  total_lessons?: number;
  total_duration?: number; // in seconds
}

export default function EnhancedAdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  // const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    level: 'beginner' as Course['level'],
    duration: '',
    max_students: 50,
    is_trial: true,
    start_date: '',
    end_date: '',
    syllabus: '',
    prerequisites: '',
    status: 'draft' as Course['status']
  });

  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    video_duration: 0,
    order_index: 1,
    is_free: false,
    transcript: ''
  });

  const [materialFormData, setMaterialFormData] = useState({
    title: '',
    description: '',
    file_type: '',
    order_index: 1,
    is_downloadable: true
  });

  // Mock data initialization
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: 1,
        title: "Architectural Design Fundamentals",
        description: "Comprehensive course covering the basics of architectural design including space planning, circulation, and design principles.",
        short_description: "Master the fundamentals of architectural design",
        level: "beginner",
        duration: "8 weeks",
        max_students: 50,
        is_trial: true,
        start_date: "2025-10-15T00:00:00Z",
        end_date: "2025-12-10T00:00:00Z",
        status: "published",
        created_at: "2025-09-01T00:00:00Z",
        updated_at: "2025-09-01T00:00:00Z",
        enrolled_count: 32,
        total_lessons: 12,
        total_duration: 7200, // 2 hours total
        lessons: [
          {
            id: 1,
            title: "Introduction to Architecture",
            description: "Overview of architectural history and basic principles",
            video_url: "/uploads/videos/lesson1.mp4",
            video_duration: 480, // 8 minutes
            order_index: 1,
            is_free: true,
            created_at: "2025-09-01T00:00:00Z",
            updated_at: "2025-09-01T00:00:00Z"
          },
          {
            id: 2,
            title: "Design Process & Methodology",
            description: "Understanding the architectural design process step by step",
            video_url: "/uploads/videos/lesson2.mp4",
            video_duration: 720, // 12 minutes
            order_index: 2,
            is_free: false,
            created_at: "2025-09-01T00:00:00Z",
            updated_at: "2025-09-01T00:00:00Z"
          },
          {
            id: 3,
            title: "Site Analysis & Context",
            description: "How to analyze building sites and context",
            video_url: "/uploads/videos/lesson3.mp4",
            video_duration: 600, // 10 minutes
            order_index: 3,
            is_free: false,
            created_at: "2025-09-01T00:00:00Z",
            updated_at: "2025-09-01T00:00:00Z"
          }
        ],
        materials: [
          {
            id: 1,
            title: "Course Syllabus",
            description: "Complete course outline and learning objectives",
            file_url: "/uploads/materials/syllabus.pdf",
            file_type: "pdf",
            file_size: 524288, // 512KB
            order_index: 1,
            is_downloadable: true,
            created_at: "2025-09-01T00:00:00Z"
          },
          {
            id: 2,
            title: "Architectural Drawing Standards",
            description: "Industry standard drawing conventions",
            file_url: "/uploads/materials/drawing_standards.pdf",
            file_type: "pdf",
            file_size: 1048576, // 1MB
            order_index: 2,
            is_downloadable: true,
            created_at: "2025-09-01T00:00:00Z"
          }
        ]
      },
      {
        id: 2,
        title: "Sustainable Architecture",
        description: "Comprehensive course on green building design and energy efficiency.",
        short_description: "Design eco-friendly buildings",
        level: "intermediate",
        duration: "12 weeks",
        max_students: 30,
        is_trial: true,
        start_date: "2025-11-01T00:00:00Z",
        end_date: "2026-01-24T00:00:00Z",
        status: "published",
        created_at: "2025-09-01T00:00:00Z",
        updated_at: "2025-09-01T00:00:00Z",
        enrolled_count: 18,
        total_lessons: 8,
        total_duration: 4800,
        lessons: [],
        materials: []
      }
    ];
    
    setCourses(mockCourses);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Mock API call
      console.log('Course saved successfully');
      alert(editingCourse ? "Course updated successfully" : "Course created successfully");
      setIsDialogOpen(false);
      setEditingCourse(null);
      resetForm();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive"
      });
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) return;

    try {
      setUploadProgress(0);
      
      // Simulate file upload progress
      if (videoFile) {
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 200);
      }

      // Mock API call
      setTimeout(() => {
        alert(editingLesson ? "Lesson updated successfully" : "Lesson created successfully");
        setIsLessonDialogOpen(false);
        setEditingLesson(null);
        resetLessonForm();
        setUploadProgress(0);
      }, 2000);

    } catch (error) {
      console.error('Error saving lesson:', error);
      alert("Failed to save lesson");
    }
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) return;

    try {
      setUploadProgress(0);
      
      // Simulate file upload progress
      if (materialFile) {
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 20;
          });
        }, 100);
      }

      // Mock API call
      setTimeout(() => {
        alert(editingMaterial ? "Material updated successfully" : "Material added successfully");
        setIsMaterialDialogOpen(false);
        setEditingMaterial(null);
        resetMaterialForm();
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Error saving material:', error);
      alert("Failed to save material");
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      short_description: '',
      level: 'beginner',
      duration: '',
      max_students: 50,
      is_trial: true,
      start_date: '',
      end_date: '',
      syllabus: '',
      prerequisites: '',
      status: 'draft'
    });
  };

  const resetLessonForm = () => {
    setLessonFormData({
      title: '',
      description: '',
      video_duration: 0,
      order_index: selectedCourse?.lessons ? selectedCourse.lessons.length + 1 : 1,
      is_free: false,
      transcript: ''
    });
    setVideoFile(null);
  };

  const resetMaterialForm = () => {
    setMaterialFormData({
      title: '',
      description: '',
      file_type: '',
      order_index: selectedCourse?.materials ? selectedCourse.materials.length + 1 : 1,
      is_downloadable: true
    });
    setMaterialFile(null);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      short_description: course.short_description || '',
      level: course.level,
      duration: course.duration,
      max_students: course.max_students,
      is_trial: course.is_trial,
      start_date: course.start_date ? course.start_date.split('T')[0] : '',
      end_date: course.end_date ? course.end_date.split('T')[0] : '',
      syllabus: course.syllabus || '',
      prerequisites: course.prerequisites || '',
      status: course.status
    });
    setIsDialogOpen(true);
  };

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'zip':
        return <Download className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button variant="outline" onClick={() => setSelectedCourse(null)} className="mb-2">
              ← Back to Courses
            </Button>
            <h1 className="text-3xl font-bold">{selectedCourse.title}</h1>
            <p className="text-muted-foreground">{selectedCourse.short_description}</p>
          </div>
        </div>

        {/* Course Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCourse.lessons?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedCourse.total_duration ? formatDuration(selectedCourse.total_duration) : '0:00'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCourse.enrolled_count}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Materials</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCourse.materials?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>📚 Course Lessons (Videos)</CardTitle>
                <CardDescription>Upload and manage 10-12 video lessons for this course</CardDescription>
              </div>
              <Button onClick={() => {
                setEditingLesson(null);
                resetLessonForm();
                setIsLessonDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Upload New Video
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Upload Instructions */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-500 rounded-full p-2">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-800 mb-1">🎬 Admin Video Upload Center</h4>
                  <p className="text-sm text-purple-700 mb-2">
                    This is where you upload course videos! Each course should have 10-12 videos (5-10 minutes each).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-purple-600">
                    <div>✅ First video automatically free (trial)</div>
                    <div>✅ MP4, AVI, MOV, WebM supported</div>
                    <div>✅ Max 500MB per video</div>
                    <div>✅ Automatic video player integration</div>
                  </div>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Free Preview</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCourse.lessons?.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>{lesson.order_index}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lesson.title}</div>
                        {lesson.description && (
                          <div className="text-sm text-muted-foreground">{lesson.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lesson.video_duration ? formatDuration(lesson.video_duration) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lesson.is_free ? 'default' : 'secondary'}>
                        {lesson.is_free ? 'Free' : 'Premium'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lesson.video_url ? (
                        <PlayCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Upload className="h-4 w-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingLesson(lesson);
                          setLessonFormData({
                            title: lesson.title,
                            description: lesson.description || '',
                            video_duration: lesson.video_duration || 0,
                            order_index: lesson.order_index,
                            is_free: lesson.is_free,
                            transcript: lesson.transcript || ''
                          });
                          setIsLessonDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Video Player Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>🎬 Video Preview & Player Test</CardTitle>
            <CardDescription>Test video playback and trial system functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Free Video Demo */}
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-green-800">🆓 Free Preview Video (Lesson 1)</h4>
                    <p className="text-sm text-green-600">Available to all users without subscription</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">FREE</Badge>
                </div>
                <div className="bg-gray-900 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center text-white">
                    <PlayCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>Sample Video Player</p>
                    <p className="text-sm opacity-75">Introduction to Architecture (8:00)</p>
                  </div>
                </div>
              </div>
              
              {/* Premium Video Demo */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-blue-800">🔒 Premium Video (Lesson 2+)</h4>
                    <p className="text-sm text-blue-600">Requires subscription to access</p>
                  </div>
                  <Badge variant="secondary">PREMIUM</Badge>
                </div>
                <div className="bg-gray-900 rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-blue-300">
                  <div className="text-center text-white">
                    <div className="h-12 w-12 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center">
                      🔒
                    </div>
                    <p>Subscription Required</p>
                    <p className="text-sm opacity-75">Design Process & Methodology (12:00)</p>
                    <Button size="sm" className="mt-2">Subscribe to Watch</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>Downloadable resources and documents</CardDescription>
              </div>
              <Button onClick={() => {
                setEditingMaterial(null);
                resetMaterialForm();
                setIsMaterialDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Downloadable</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCourse.materials?.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getFileTypeIcon(material.file_type)}
                        <div>
                          <div className="font-medium">{material.title}</div>
                          {material.description && (
                            <div className="text-sm text-muted-foreground">{material.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.file_type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      {material.file_size ? formatFileSize(material.file_size) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={material.is_downloadable ? 'default' : 'secondary'}>
                        {material.is_downloadable ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingMaterial(material);
                          setMaterialFormData({
                            title: material.title,
                            description: material.description || '',
                            file_type: material.file_type,
                            order_index: material.order_index,
                            is_downloadable: material.is_downloadable
                          });
                          setIsMaterialDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Lesson Dialog */}
        <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
              <DialogDescription>
                Create or edit a lesson with video content
              </DialogDescription>
              
              {/* Video Upload Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-green-800 mb-2">🎬 Video Upload Instructions</h4>
                <p className="text-sm text-green-700 mb-2">
                  <strong>This is where you upload course videos!</strong> Upload 10-12 videos per course (5-10 minutes each).
                </p>
                <p className="text-sm text-green-700">
                  Supported formats: MP4, AVI, MOV, WMV, FLV, WebM (Max: 500MB per video)
                </p>
              </div>
            </DialogHeader>
            
            <form onSubmit={handleLessonSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson_title">Lesson Title</Label>
                  <Input
                    id="lesson_title"
                    value={lessonFormData.title}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="order_index">Order</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={lessonFormData.order_index}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, order_index: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lesson_description">Description</Label>
                <Textarea
                  id="lesson_description"
                  value={lessonFormData.description}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="video_duration">Duration (seconds)</Label>
                  <Input
                    id="video_duration"
                    type="number"
                    value={lessonFormData.video_duration}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, video_duration: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={lessonFormData.is_free}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, is_free: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_free">Free Preview</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video_file">Video File</Label>
                <Input
                  id="video_file"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: MP4, AVI, MOV, WMV, FLV, WebM. Max size: 500MB
                </p>
                {videoFile && (
                  <div className="text-sm text-green-600">
                    Selected: {videoFile.name} ({formatFileSize(videoFile.size)})
                  </div>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <Label>Upload Progress</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">{uploadProgress}% uploaded</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="transcript">Transcript (Optional)</Label>
                <Textarea
                  id="transcript"
                  value={lessonFormData.transcript}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, transcript: e.target.value })}
                  placeholder="Video transcript for accessibility..."
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadProgress > 0 && uploadProgress < 100}>
                  {uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 
                   editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Material Dialog */}
        <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add New Material'}</DialogTitle>
              <DialogDescription>
                Add downloadable resources and documents
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleMaterialSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material_title">Material Title</Label>
                  <Input
                    id="material_title"
                    value={materialFormData.title}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="material_order">Order</Label>
                  <Input
                    id="material_order"
                    type="number"
                    value={materialFormData.order_index}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, order_index: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="material_description">Description</Label>
                <Textarea
                  id="material_description"
                  value={materialFormData.description}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="material_file">File</Label>
                <Input
                  id="material_file"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                  onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP. Max size: 100MB
                </p>
                {materialFile && (
                  <div className="text-sm text-green-600">
                    Selected: {materialFile.name} ({formatFileSize(materialFile.size)})
                  </div>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <Label>Upload Progress</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">{uploadProgress}% uploaded</p>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_downloadable"
                  checked={materialFormData.is_downloadable}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, is_downloadable: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_downloadable">Allow Download</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsMaterialDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadProgress > 0 && uploadProgress < 100}>
                  {uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 
                   editingMaterial ? 'Update Material' : 'Add Material'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Course Management</h1>
          <p className="text-muted-foreground">Manage courses, video lessons, and materials</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCourse(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
              <DialogDescription>
                {editingCourse ? 'Update course details' : 'Create a new course'}
              </DialogDescription>
              
              {/* Trial System Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-800 mb-2">📹 Free Trial System</h4>
                <p className="text-sm text-blue-700 mb-2">
                  All courses are FREE with trial access! First video of each course is always free for preview.
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Video Upload:</strong> After creating the course, go to "View Details" → "Lessons" tab to upload 10-12 videos (max 500MB each).
                </p>
              </div>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as Course['level'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.status === 'published').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + course.enrolled_count, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + (course.total_lessons || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            Manage your course catalog and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-muted-foreground">{course.short_description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {course.level}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.enrolled_count}</TableCell>
                  <TableCell>{course.total_lessons || 0}</TableCell>
                  <TableCell>
                    {course.total_duration ? formatDuration(course.total_duration) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={course.status === 'published' ? 'default' : 
                               course.status === 'draft' ? 'secondary' : 'destructive'}
                    >
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(course)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}