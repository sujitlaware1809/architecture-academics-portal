'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, MessageSquare, CheckCircle, Pin, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { format } from 'date-fns';

interface User {
  id: number;
  full_name: string;
  email: string;
}

interface Discussion {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  views: number;
  is_solved: boolean;
  is_pinned: boolean;
  author: User;
  replies_count?: number;
}

export default function AdminDiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/discussions');
      if (Array.isArray(response.data)) {
        setDiscussions(response.data);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch discussions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) return;

    try {
      await api.delete(`/api/discussions/${id}`);
      toast({
        title: "Success",
        description: "Discussion deleted successfully"
      });
      fetchDiscussions();
    } catch (error: any) {
      console.error('Error deleting discussion:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete discussion",
        variant: "destructive"
      });
    }
  };

  const handleTogglePin = async (discussion: Discussion) => {
    try {
      await api.put(`/api/discussions/${discussion.id}`, {
        is_pinned: !discussion.is_pinned
      });
      toast({
        title: "Success",
        description: `Discussion ${discussion.is_pinned ? 'unpinned' : 'pinned'} successfully`
      });
      fetchDiscussions();
    } catch (error: any) {
      console.error('Error updating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to update discussion",
        variant: "destructive"
      });
    }
  };

  const filteredDiscussions = discussions.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.author.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Discussions</h1>
          <p className="text-muted-foreground">Manage community discussions</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions by title, author, or category..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Discussions</CardTitle>
          <CardDescription>List of all discussions posted by users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscussions.map((discussion) => (
                <TableRow key={discussion.id}>
                  <TableCell className="font-medium max-w-xs truncate" title={discussion.title}>
                    {discussion.title}
                  </TableCell>
                  <TableCell>{discussion.author.full_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{discussion.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-muted-foreground space-x-2">
                      <span title="Views">{discussion.views} views</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(discussion.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {discussion.is_solved && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" /> Solved
                        </Badge>
                      )}
                      {discussion.is_pinned && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          <Pin className="h-3 w-3 mr-1" /> Pinned
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={discussion.is_pinned ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTogglePin(discussion)}
                        title={discussion.is_pinned ? "Unpin" : "Pin"}
                      >
                        <Pin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(discussion.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDiscussions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No discussions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
