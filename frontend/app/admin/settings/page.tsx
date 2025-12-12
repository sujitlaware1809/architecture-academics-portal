'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Database, Mail, Shield, Globe, Upload, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

interface AppSettings {
  site_name: string;
  site_description: string;
  site_url: string;
  admin_email: string;
  contact_email: string;
  support_email: string;
  enable_registrations: boolean;
  enable_email_notifications: boolean;
  max_file_upload_size: number; // in MB
  allowed_file_types: string[];
  maintenance_mode: boolean;
  maintenance_message: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_use_tls: boolean;
  database_backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  max_course_enrollments: number;
  session_timeout: number; // in minutes
  api_rate_limit: number; // requests per minute
}

interface SystemInfo {
  version: string;
  uptime: string;
  database_size: string;
  storage_used: string;
  total_users: number;
  active_sessions: number;
  last_backup: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    site_name: 'Architecture Academics',
    site_description: 'Platform for architecture education and career development',
    site_url: 'https://architectureacademics.com',
    admin_email: 'admin@architecture-academics.online',
    contact_email: 'contact@architectureacademics.com',
    support_email: 'support@architectureacademics.com',
    enable_registrations: true,
    enable_email_notifications: true,
    max_file_upload_size: 10,
    allowed_file_types: ['pdf', 'doc', 'docx', 'jpg', 'png', 'gif'],
    maintenance_mode: false,
    maintenance_message: 'We are currently performing scheduled maintenance. Please check back later.',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_use_tls: true,
    database_backup_enabled: true,
    backup_frequency: 'daily',
    max_course_enrollments: 100,
    session_timeout: 30,
    api_rate_limit: 100
  });

  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    version: '1.0.0',
    uptime: '7 days, 14 hours',
    database_size: '245 MB',
    storage_used: '1.2 GB',
    total_users: 1247,
    active_sessions: 23,
    last_backup: '2025-09-19T02:00:00Z'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch settings from backend
  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings');
      
      const data = response.data;
      console.log('Fetched settings from backend:', data);
      // Merge fetched settings with default settings to ensure all properties exist
      setSettings(prevSettings => ({
        ...prevSettings,
        ...data.settings,
        // Ensure allowed_file_types is always an array
        allowed_file_types: data.settings?.allowed_file_types || prevSettings.allowed_file_types
      }));
      setSystemInfo(data.system_info || systemInfo);
      
      // If backend is not available, use mock data (already set above)
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please login as admin to access settings",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/api/admin/settings', settings);

      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      await api.post('/api/admin/backup', {});

      toast({
        title: "Success",
        description: "Database backup initiated"
      });
      fetchSettings(); // Refresh system info
    } catch (error: any) {
      console.error('Error initiating backup:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to initiate backup",
        variant: "destructive"
      });
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
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure application settings and system preferences</p>
        </div>
        
        <Button onClick={handleSubmit} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Version</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.version}</div>
            <p className="text-xs text-muted-foreground">Current release</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.uptime}</div>
            <p className="text-xs text-muted-foreground">System running</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.active_sessions}</div>
            <p className="text-xs text-muted-foreground">Current sessions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.database_size}</div>
            <p className="text-xs text-muted-foreground">Storage used</p>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic application configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_url">Site URL</Label>
                <Input
                  id="site_url"
                  value={settings.site_url}
                  onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin_email">Admin Email</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={settings.admin_email}
                  onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="support_email">Support Email</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Feature Settings
            </CardTitle>
            <CardDescription>
              Enable or disable application features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enable_registrations"
                checked={settings.enable_registrations}
                onChange={(e) => setSettings({ ...settings, enable_registrations: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="enable_registrations">Enable User Registrations</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enable_email_notifications"
                checked={settings.enable_email_notifications}
                onChange={(e) => setSettings({ ...settings, enable_email_notifications: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="enable_email_notifications">Enable Email Notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="maintenance_mode"
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
              {settings.maintenance_mode && (
                <Badge variant="destructive">Active</Badge>
              )}
            </div>
            
            {settings.maintenance_mode && (
              <div className="space-y-2">
                <Label htmlFor="maintenance_message">Maintenance Message</Label>
                <Textarea
                  id="maintenance_message"
                  value={settings.maintenance_message}
                  onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Upload Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              File Upload Settings
            </CardTitle>
            <CardDescription>
              Configure file upload restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_file_upload_size">Max File Size (MB)</Label>
                <Input
                  id="max_file_upload_size"
                  type="number"
                  value={settings.max_file_upload_size}
                  onChange={(e) => setSettings({ ...settings, max_file_upload_size: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowed_file_types">Allowed File Types</Label>
                <Input
                  id="allowed_file_types"
                  value={settings.allowed_file_types?.join(', ') || ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    allowed_file_types: e.target.value.split(', ').map(type => type.trim()).filter(type => type.length > 0)
                  })}
                  placeholder="pdf, doc, docx, jpg, png"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Settings
            </CardTitle>
            <CardDescription>
              Configure SMTP settings for email delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  value={settings.smtp_host}
                  onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_username">SMTP Username</Label>
                <Input
                  id="smtp_username"
                  value={settings.smtp_username}
                  onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp_password">SMTP Password</Label>
                <Input
                  id="smtp_password"
                  type="password"
                  value={settings.smtp_password}
                  onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="smtp_use_tls"
                checked={settings.smtp_use_tls}
                onChange={(e) => setSettings({ ...settings, smtp_use_tls: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="smtp_use_tls">Use TLS</Label>
            </div>
          </CardContent>
        </Card>

        {/* Backup & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Backup & Security
            </CardTitle>
            <CardDescription>
              Database backup and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Database Backups</div>
                <div className="text-sm text-muted-foreground">
                  Last backup: {new Date(systemInfo.last_backup).toLocaleString()}
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handleBackupNow}>
                Backup Now
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="database_backup_enabled"
                checked={settings.database_backup_enabled}
                onChange={(e) => setSettings({ ...settings, database_backup_enabled: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="database_backup_enabled">Enable Automatic Backups</Label>
            </div>
            
            {settings.database_backup_enabled && (
              <div className="space-y-2">
                <Label htmlFor="backup_frequency">Backup Frequency</Label>
                <select
                  id="backup_frequency"
                  value={settings.backup_frequency}
                  onChange={(e) => setSettings({ ...settings, backup_frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={settings.session_timeout}
                  onChange={(e) => setSettings({ ...settings, session_timeout: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api_rate_limit">API Rate Limit (req/min)</Label>
                <Input
                  id="api_rate_limit"
                  type="number"
                  value={settings.api_rate_limit}
                  onChange={(e) => setSettings({ ...settings, api_rate_limit: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_course_enrollments">Max Course Enrollments</Label>
                <Input
                  id="max_course_enrollments"
                  type="number"
                  value={settings.max_course_enrollments}
                  onChange={(e) => setSettings({ ...settings, max_course_enrollments: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}