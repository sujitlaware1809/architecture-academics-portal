'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Workshop {
  id: number;
  title: string;
  description: string;
  instructor: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registered_users: number;
  created_at: string;
}

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    date: '',
    time: '',
    location: '',
    capacity: 0,
    price: 0,
    status: 'upcoming' as Workshop['status']
  });

  // Fetch workshops from backend
  const fetchWorkshops = async () => {
    try {
      const response = await fetch('/api/admin/workshops');
      if (response.ok) {
        const data = await response.json();
        setWorkshops(data);
      } else {
        // Fallback mock data if backend is not available
        setWorkshops([
          {
            id: 1,
            title: "Sustainable Architecture Design",
            description: "Learn about eco-friendly building practices and sustainable design principles.",
            instructor: "Dr. Sarah Wilson",
            date: "2025-10-15",
            time: "10:00",
            location: "Virtual",
            capacity: 50,
            price: 299,
            status: "upcoming",
            registered_users: 23,
            created_at: "2025-09-01T10:00:00Z"
          },
          {
            id: 2,
            title: "3D Modeling with Revit",
            description: "Master advanced 3D modeling techniques using Autodesk Revit.",
            instructor: "Prof. Michael Chen",
            date: "2025-10-22",
            time: "14:00",
            location: "Room 101, Architecture Building",
            capacity: 30,
            price: 399,
            status: "upcoming",
            registered_users: 18,
            created_at: "2025-09-05T14:00:00Z"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
      toast({
        title: "Error",
        description: "Failed to fetch workshops",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingWorkshop 
        ? `/api/admin/workshops/${editingWorkshop.id}`
        : '/api/admin/workshops';
      
      const method = editingWorkshop ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingWorkshop ? "Workshop updated successfully" : "Workshop created successfully"
        });
        setIsDialogOpen(false);
        setEditingWorkshop(null);
        setFormData({
          title: '',
          description: '',
          instructor: '',
          date: '',
          time: '',
          location: '',
          capacity: 0,
          price: 0,
          status: 'upcoming'
        });
        fetchWorkshops();
      } else {
        throw new Error('Failed to save workshop');
      }
    } catch (error) {
      console.error('Error saving workshop:', error);
      toast({
        title: "Error",
        description: "Failed to save workshop",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      description: workshop.description,
      instructor: workshop.instructor,
      date: workshop.date,
      time: workshop.time,
      location: workshop.location,
      capacity: workshop.capacity,
      price: workshop.price,
      status: workshop.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workshop?')) return;

    try {
      const response = await fetch(`/api/admin/workshops/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Workshop deleted successfully"
        });
        fetchWorkshops();
      } else {
        throw new Error('Failed to delete workshop');
      }
    } catch (error) {
      console.error('Error deleting workshop:', error);
      toast({
        title: "Error",
        description: "Failed to delete workshop",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: Workshop['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold">Workshop Management</h1>
          <p className="text-muted-foreground">Manage workshops, instructors, and registrations</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingWorkshop(null);
              setFormData({
                title: '',
                description: '',
                instructor: '',
                date: '',
                time: '',
                location: '',
                capacity: 0,
                price: 0,
                status: 'upcoming'
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Workshop
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingWorkshop ? 'Edit Workshop' : 'Add New Workshop'}</DialogTitle>
              <DialogDescription>
                {editingWorkshop ? 'Update workshop details' : 'Create a new workshop for students'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Room 101 or Virtual"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Workshop['status'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingWorkshop ? 'Update Workshop' : 'Create Workshop'}
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
            <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workshops.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workshops.filter(w => w.status === 'upcoming').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workshops.reduce((sum, w) => sum + w.registered_users, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${workshops.reduce((sum, w) => sum + (w.price * w.registered_users), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workshops Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Workshops</CardTitle>
          <CardDescription>
            Manage all workshops and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workshops.map((workshop) => (
                <TableRow key={workshop.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{workshop.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {workshop.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{workshop.instructor}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <div>
                        <div>{new Date(workshop.date).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">{workshop.time}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="truncate max-w-xs">{workshop.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{workshop.registered_users}/{workshop.capacity}</span>
                    </div>
                  </TableCell>
                  <TableCell>${workshop.price}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(workshop.status)}>
                      {workshop.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(workshop)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(workshop.id)}
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