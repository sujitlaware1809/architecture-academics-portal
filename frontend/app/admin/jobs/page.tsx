'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, Briefcase, MapPin, DollarSign, Clock, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  salary_range: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  requirements: string;
  benefits: string;
  status: 'active' | 'closed' | 'draft';
  applications_count: number;
  posted_date: string;
  closing_date: string;
  created_at: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const { toast } = useToast();
  const pollSinceRef = useRef<string | null>(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [newAppCount, setNewAppCount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary_range: '',
    job_type: 'full-time' as Job['job_type'],
    experience_level: 'entry' as Job['experience_level'],
    requirements: '',
    benefits: '',
    status: 'active' as Job['status'],
    closing_date: ''
  });

  // Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      const token = api.getStoredToken();
      if (!token) throw new Error('Not authenticated');
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = new URL(`${base}/api/admin/jobs`);
      url.searchParams.set('skip', String(page * limit));
      url.searchParams.set('limit', String(limit));
      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        // Fallback mock data if backend is not available
        setJobs([
          {
            id: 1,
            title: "Senior Architect",
            company: "Metropolitan Design Group",
            description: "We are seeking a highly experienced Senior Architect to lead our residential and commercial projects. The ideal candidate will have a strong portfolio and excellent client management skills.",
            location: "New York, NY",
            salary_range: "$90,000 - $120,000",
            job_type: "full-time",
            experience_level: "senior",
            requirements: "Bachelor's degree in Architecture, 7+ years experience, Licensed Architect, Proficiency in AutoCAD, Revit, SketchUp",
            benefits: "Health insurance, 401k, Paid time off, Professional development opportunities",
            status: "active",
            applications_count: 12,
            posted_date: "2025-09-15",
            closing_date: "2025-10-15",
            created_at: "2025-09-15T10:00:00Z"
          },
          {
            id: 2,
            title: "Architectural Intern",
            company: "Green Building Solutions",
            description: "Summer internship opportunity for architecture students to work on sustainable building projects and gain hands-on experience.",
            location: "San Francisco, CA",
            salary_range: "$20 - $25/hour",
            job_type: "internship",
            experience_level: "entry",
            requirements: "Currently enrolled in Architecture program, Knowledge of CAD software, Interest in sustainable design",
            benefits: "Mentorship program, Portfolio development, Networking opportunities",
            status: "active",
            applications_count: 28,
            posted_date: "2025-09-10",
            closing_date: "2025-10-01",
            created_at: "2025-09-10T14:00:00Z"
          },
          {
            id: 3,
            title: "Project Manager - Construction",
            company: "Urban Development Corp",
            description: "Experienced project manager needed to oversee large-scale commercial construction projects from inception to completion.",
            location: "Chicago, IL",
            salary_range: "$75,000 - $95,000",
            job_type: "full-time",
            experience_level: "mid",
            requirements: "PMP certification preferred, 5+ years construction experience, Strong leadership skills",
            benefits: "Health insurance, Retirement plan, Company car, Performance bonuses",
            status: "closed",
            applications_count: 45,
            posted_date: "2025-08-20",
            closing_date: "2025-09-20",
            created_at: "2025-08-20T09:00:00Z"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, limit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = editingJob 
        ? `${base}/api/admin/jobs/${editingJob.id}`
        : `${base}/api/admin/jobs`;
      
      const method = editingJob ? 'PUT' : 'POST';
      
      const token = api.getStoredToken();
      if (!token) throw new Error('Not authenticated');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          posted_date: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingJob ? "Job updated successfully" : "Job posted successfully"
        });
        setIsDialogOpen(false);
        setEditingJob(null);
        resetForm();
        fetchJobs();
      } else {
        throw new Error('Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      description: '',
      location: '',
      salary_range: '',
      job_type: 'full-time',
      experience_level: 'entry',
      requirements: '',
      benefits: '',
      status: 'active',
      closing_date: ''
    });
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      salary_range: job.salary_range,
      job_type: job.job_type,
      experience_level: job.experience_level,
      requirements: job.requirements,
      benefits: job.benefits,
      status: job.status,
      closing_date: job.closing_date
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const token = api.getStoredToken();
      if (!token) throw new Error('Not authenticated');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Job deleted successfully"
        });
        fetchJobs();
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeColor = (jobType: Job['job_type']) => {
    switch (jobType) {
      case 'full-time': return 'bg-blue-100 text-blue-800';
      case 'part-time': return 'bg-purple-100 text-purple-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      case 'internship': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Management</h1>
          <p className="text-muted-foreground">Manage job postings and applications</p>
          {newAppCount > 0 && (
            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
              {newAppCount} new application{newAppCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingJob(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Edit Job' : 'Post New Job'}</DialogTitle>
              <DialogDescription>
                {editingJob ? 'Update job posting details' : 'Create a new job posting'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., New York, NY or Remote"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary_range">Salary Range (₹)</Label>
                  <Input
                    id="salary_range"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder="e.g., ₹6,00,000 - ₹8,00,000"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type</Label>
                  <select
                    id="job_type"
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value as Job['job_type'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <select
                    id="experience_level"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value as Job['experience_level'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List the key requirements and qualifications..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="List the benefits and perks offered..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closing_date">Application Deadline</Label>
                  <Input
                    id="closing_date"
                    type="date"
                    value={formData.closing_date}
                    onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Job['status'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingJob ? 'Update Job' : 'Post Job'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin notifications (polling) */}
      <AdminJobEvents onNewEvent={(ev) => {
        setNewAppCount(c => c + 1);
      }} pollSinceRef={pollSinceRef} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => j.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.reduce((sum, j) => sum + j.applications_count, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => {
                const jobDate = new Date(j.posted_date);
                const now = new Date();
                return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Job Postings</CardTitle>
          <CardDescription>
            Manage all job postings and their applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Details</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground">{job.salary_range}</div>
                    </div>
                  </TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="truncate max-w-xs">{job.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getJobTypeColor(job.job_type)}>
                      {job.job_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{job.applications_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      {new Date(job.closing_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
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
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Page {page + 1}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
            <select
              value={limit}
              onChange={(e) => { setPage(0); setLimit(Number(e.target.value)); }}
              className="ml-2 text-sm border rounded-md px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AdminJobEvents({ onNewEvent, pollSinceRef }: { onNewEvent: (ev: any) => void, pollSinceRef: React.MutableRefObject<string | null> }) {
  const { toast } = useToast();
  useEffect(() => {
    let mounted = true;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const tick = async () => {
      try {
        const token = api.getStoredToken();
        if (!token) return;
        const params = new URLSearchParams();
        if (pollSinceRef.current) params.set('since', pollSinceRef.current);
        const res = await fetch(`${base}/api/admin/jobs/applications/events?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const events = await res.json();
          if (events && events.length > 0) {
            const lastTs = events[events.length - 1]?.timestamp;
            if (lastTs) pollSinceRef.current = lastTs;
            events.forEach((ev: any) => {
              onNewEvent(ev);
              toast({ title: 'New Application', description: `Job #${ev.job_id} received a new application` });
            });
          }
        }
      } catch {}
    };
    const interval = setInterval(tick, 5000);
    tick();
    return () => { mounted = false; clearInterval(interval); };
  }, [onNewEvent, pollSinceRef]);
  return null;
}