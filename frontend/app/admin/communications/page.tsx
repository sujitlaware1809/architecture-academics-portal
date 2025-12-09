'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { Bell, Mail, MessageSquare, Send, Users } from 'lucide-react';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export default function AdminCommunicationsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Notification Form State
  const [notificationForm, setNotificationForm] = useState({
    recipient_id: 'all',
    title: '',
    message: '',
    link: ''
  });

  // Email Form State
  const [emailForm, setEmailForm] = useState({
    recipient_id: 'all',
    subject: '',
    body: ''
  });

  // Message Form State
  const [messageForm, setMessageForm] = useState({
    recipient_email: '',
    subject: '',
    content: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...notificationForm,
        recipient_id: notificationForm.recipient_id === 'all' ? null : Number(notificationForm.recipient_id)
      };
      
      await api.post('/api/notifications/send', payload);
      
      toast({
        title: "Success",
        description: "Notification sent successfully"
      });
      
      setNotificationForm({
        recipient_id: 'all',
        title: '',
        message: '',
        link: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to send notification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...emailForm,
        recipient_id: emailForm.recipient_id === 'all' ? null : Number(emailForm.recipient_id)
      };
      
      await api.post('/api/notifications/send-email', payload);
      
      toast({
        title: "Success",
        description: "Email queued for sending"
      });
      
      setEmailForm({
        recipient_id: 'all',
        subject: '',
        body: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/messages', messageForm);
      
      toast({
        title: "Success",
        description: "Message sent successfully"
      });
      
      setMessageForm({
        recipient_email: '',
        subject: '',
        content: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communications</h1>
        <p className="text-muted-foreground">Send notifications, emails, and messages to users</p>
      </div>

      <Tabs defaultValue="notification" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notification" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Push Notification
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="message" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Direct Message
          </TabsTrigger>
        </TabsList>

        {/* Push Notification Tab */}
        <TabsContent value="notification">
          <Card>
            <CardHeader>
              <CardTitle>Send Push Notification</CardTitle>
              <CardDescription>Send an in-app notification to users</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Select 
                    value={notificationForm.recipient_id} 
                    onValueChange={(val) => setNotificationForm({...notificationForm, recipient_id: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                    placeholder="Notification Title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea 
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                    placeholder="Notification content..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Link (Optional)</Label>
                  <Input 
                    value={notificationForm.link}
                    onChange={(e) => setNotificationForm({...notificationForm, link: e.target.value})}
                    placeholder="/dashboard/courses"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Send Email</CardTitle>
              <CardDescription>Send an email to users</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Select 
                    value={emailForm.recipient_id} 
                    onValueChange={(val) => setEmailForm({...emailForm, recipient_id: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input 
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                    placeholder="Email Subject"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea 
                    value={emailForm.body}
                    onChange={(e) => setEmailForm({...emailForm, body: e.target.value})}
                    placeholder="Email content..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Direct Message Tab */}
        <TabsContent value="message">
          <Card>
            <CardHeader>
              <CardTitle>Send Direct Message</CardTitle>
              <CardDescription>Send a direct message to a specific user</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Select 
                    value={messageForm.recipient_email} 
                    onValueChange={(val) => setMessageForm({...messageForm, recipient_email: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.email}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input 
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                    placeholder="Message Subject"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea 
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                    placeholder="Message content..."
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
