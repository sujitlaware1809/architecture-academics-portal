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
import { Edit, Trash2, Plus, Calendar, MapPin, Users, DollarSign, Eye, Mail, User, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

interface Workshop {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  date: string;
  duration: number;  // Hours
  max_participants: number;
  price: number;
  currency: string;
  location?: string;
  image_url?: string;
  requirements?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registered_count: number;
  instructor_id?: number;
  created_at: string;
  updated_at: string;
}

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedWorkshopRegistrations, setSelectedWorkshopRegistrations] = useState<any>(null);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    date: '',
    duration: 2,
    location: '',
    max_participants: 30,
    price: 0,
    currency: 'INR',
    requirements: '',
    status: 'upcoming' as Workshop['status']
  });

  // Fetch workshops from backend
  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/workshops');
      if (response.data) {
        setWorkshops(response.data);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
      setError('Failed to fetch workshops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        duration: Number(formData.duration),
        max_participants: Number(formData.max_participants),
        price: Number(formData.price)
      };

      if (editingWorkshop) {
        await api.put(`/admin/workshops/${editingWorkshop.id}`, payload);
      } else {
        await api.post('/api/admin/workshops', payload);
      }

      toast({
        title: "Success",
        description: editingWorkshop ? "Workshop updated successfully" : "Workshop created successfully"
      });
      setIsDialogOpen(false);
      setEditingWorkshop(null);
      setFormData({
        title: '',
        description: '',
        short_description: '',
        date: '',
        duration: 2,
        location: '',
        max_participants: 30,
        price: 0,
        currency: 'INR',
        requirements: '',
        status: 'upcoming'
      });
      fetchWorkshops();
    } catch (err: any) {
      console.error('Error saving workshop:', err);
      setError(err.response?.data?.detail || 'Failed to save workshop');
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to save workshop",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      description: workshop.description,
      short_description: workshop.short_description || '',
      date: new Date(workshop.date).toISOString().slice(0, 16),
      duration: workshop.duration,
      location: workshop.location || '',
      max_participants: workshop.max_participants,
      price: workshop.price,
      currency: workshop.currency || 'INR',
      requirements: workshop.requirements || '',
      status: workshop.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workshop?')) return;

    try {
      await api.delete(`/admin/workshops/${id}`);
      toast({
        title: "Success",
        description: "Workshop deleted successfully"
      });
      fetchWorkshops();
    } catch (err: any) {
      console.error('Error deleting workshop:', err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to delete workshop",
        variant: "destructive"
      });
    }
  };

  const handleViewRegistrations = async (workshop: Workshop) => {
    setLoadingRegistrations(true);
    setShowRegistrations(true);
    try {
      const response = await api.get(`/admin/workshops/${workshop.id}/registrations`);
      setSelectedWorkshopRegistrations(response.data);
    } catch (err: any) {
      console.error("Error fetching registrations:", err);
      setError(err.response?.data?.detail || "Failed to load registrations");
    } finally {
      setLoadingRegistrations(false);
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
                short_description: '',
                date: '',
                duration: 2,
                location: '',
                max_participants: 30,
                price: 0,
                currency: 'INR',
                requirements: '',
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
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief summary for cards"
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
                  <Label htmlFor="date">Date & Time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
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
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (optional)</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Prerequisites or requirements for participants"
                  rows={3}
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
              {workshops.reduce((sum, w) => sum + (w.registered_count || 0), 0)}
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
              ₹{workshops.reduce((sum, w) => sum + (w.price * (w.registered_count || 0)), 0).toLocaleString()}
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
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Registrations</TableHead>
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
                        {workshop.short_description || workshop.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <div>
                        <div>{new Date(workshop.date).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(workshop.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {workshop.duration}h
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="truncate max-w-xs">{workshop.location || 'TBD'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{workshop.registered_count || 0}/{workshop.max_participants}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {workshop.currency === 'INR' ? '₹' : workshop.currency === 'EUR' ? '€' : '$'}
                    {workshop.price.toLocaleString()}
                  </TableCell>
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
                        onClick={() => handleViewRegistrations(workshop)}
                        title="View Registrations"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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

      {/* Registrations Modal */}
      {showRegistrations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Workshop Registrations
                  </h2>
                  {selectedWorkshopRegistrations && (
                    <p className="text-gray-600 mt-1">
                      {selectedWorkshopRegistrations.workshop_title}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowRegistrations(false);
                    setSelectedWorkshopRegistrations(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {loadingRegistrations ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : selectedWorkshopRegistrations?.registrations?.length > 0 ? (
                <div>
                  <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-900">
                      <span className="font-semibold">Total Registrations:</span>{" "}
                      {selectedWorkshopRegistrations.total_registrations}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Registered At
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Attended
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedWorkshopRegistrations.registrations.map((reg: any) => (
                          <tr
                            key={reg.registration_id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {reg.user.full_name || `${reg.user.first_name} ${reg.user.last_name}`}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">
                                  {reg.user.email}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600">
                                {new Date(reg.registered_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {reg.attended ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No registrations yet</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Users who register for this workshop will appear here
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRegistrations(false);
                  setSelectedWorkshopRegistrations(null);
                }}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}