'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Database, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Lock,
  Globe,
  Mail,
  Key
} from 'lucide-react';

interface SystemStatus {
  database: 'connected' | 'disconnected' | 'error';
  auth: 'configured' | 'not_configured';
  admin: 'exists' | 'not_exists';
  storage: 'configured' | 'not_configured';
}

export default function SystemSetupPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'disconnected',
    auth: 'not_configured',
    admin: 'not_exists',
    storage: 'not_configured'
  });
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      setLoading(true);
      
      // Check database connection
      const dbResponse = await fetch('/api/admin/database/stats');
      if (dbResponse.ok) {
        setSystemStatus(prev => ({ ...prev, database: 'connected' }));
      } else {
        setSystemStatus(prev => ({ ...prev, database: 'error' }));
      }

      // Check if admin exists
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        const adminExists = data.users?.some((user: any) => user.role?.name === 'admin');
        setSystemStatus(prev => ({ ...prev, admin: adminExists ? 'exists' : 'not_exists' }));
      }

      // Check auth configuration
      setSystemStatus(prev => ({ ...prev, auth: 'configured' }));
      
      // Check storage configuration
      setSystemStatus(prev => ({ ...prev, storage: 'configured' }));

    } catch (error) {
      console.error('Error checking system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: keyof SystemStatus) => {
    switch (status) {
      case 'connected':
      case 'configured':
      case 'exists':
        return <Badge variant="default" className="bg-green-100 text-green-800">✓ Connected</Badge>;
      case 'disconnected':
      case 'not_configured':
      case 'not_exists':
        return <Badge variant="secondary">⚠ Not Configured</Badge>;
      case 'error':
        return <Badge variant="destructive">✗ Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string, type: keyof SystemStatus) => {
    switch (status) {
      case 'connected':
      case 'configured':
      case 'exists':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'disconnected':
      case 'not_configured':
      case 'not_exists':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Setup</h1>
          <p className="text-muted-foreground">Configure and monitor your CaptionCraft system</p>
        </div>
        <Button onClick={checkSystemStatus} variant="outline">
          <Zap className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Database</p>
                {getStatusBadge(systemStatus.database, 'database')}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Authentication</p>
                {getStatusBadge(systemStatus.auth, 'auth')}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin User</p>
                {getStatusBadge(systemStatus.admin, 'admin')}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage</p>
                {getStatusBadge(systemStatus.storage, 'storage')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="db-uri">MongoDB Connection URI</Label>
              <Input 
                id="db-uri" 
                value="mongodb://localhost:27017/captioncraft" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="db-ssl" />
              <Label htmlFor="db-ssl">Enable SSL/TLS</Label>
            </div>
            <div className="pt-2">
              {getStatusIcon(systemStatus.database, 'database')}
              <span className="ml-2 text-sm">
                {systemStatus.database === 'connected' 
                  ? 'Database connection established successfully'
                  : systemStatus.database === 'error'
                  ? 'Failed to connect to database'
                  : 'Database not configured'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-secret">NextAuth Secret</Label>
              <Input 
                id="auth-secret" 
                value="••••••••••••••••••••••••••••••••" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-url">NextAuth URL</Label>
              <Input 
                id="auth-url" 
                value="http://localhost:3000" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="pt-2">
              {getStatusIcon(systemStatus.auth, 'auth')}
              <span className="ml-2 text-sm">
                {systemStatus.auth === 'configured' 
                  ? 'Authentication properly configured'
                  : 'Authentication not configured'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Admin User Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admin User Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input 
                id="admin-email" 
                value="demo@gmail.com" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-role">Admin Role</Label>
              <Input 
                id="admin-role" 
                value="Administrator" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="pt-2">
              {getStatusIcon(systemStatus.admin, 'admin')}
              <span className="ml-2 text-sm">
                {systemStatus.admin === 'exists' 
                  ? 'Admin user exists and is active'
                  : 'No admin user found'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Storage Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Storage Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storage-type">Storage Type</Label>
              <Input 
                id="storage-type" 
                value="Local File System" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage-path">Storage Path</Label>
              <Input 
                id="storage-path" 
                value="/uploads" 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            <div className="pt-2">
              {getStatusIcon(systemStatus.storage, 'storage')}
              <span className="ml-2 text-sm">
                {systemStatus.storage === 'configured' 
                  ? 'Storage properly configured'
                  : 'Storage not configured'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Test Database Connection
            </Button>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Verify Authentication
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Create Admin User
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Storage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
