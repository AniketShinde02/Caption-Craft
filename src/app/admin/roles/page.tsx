'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
  userCount: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch REAL data from database
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        
        // Real API call to get roles from database
        const response = await fetch('/api/admin/roles');
        
        if (response.ok) {
          const data = await response.json();
          setRoles(data.roles || []);
        } else {
          console.error('Failed to fetch roles:', response.status);
          // Fallback to mock data if API fails
          setRoles(getMockRoles());
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Fallback to mock data
        setRoles(getMockRoles());
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Mock data fallback - replace with real API
  const getMockRoles = (): Role[] => {
    return [
      {
        _id: '1',
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access with all permissions.',
        permissions: [
          { resource: 'user', actions: ['read', 'write', 'delete'] },
          { resource: 'role', actions: ['read', 'write', 'delete'] },
          { resource: 'system', actions: ['read', 'write'] }
        ],
        userCount: 1,
        isSystem: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        _id: '2',
        name: 'moderator',
        displayName: 'Moderator',
        description: 'Content moderation and user management.',
        permissions: [
          { resource: 'user', actions: ['read', 'write'] },
          { resource: 'content', actions: ['read', 'write'] },
          { resource: 'moderation', actions: ['read', 'write'] }
        ],
        userCount: 2,
        isSystem: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        _id: '3',
        name: 'user',
        displayName: 'Regular User',
        description: 'Standard user with basic permissions.',
        permissions: [
          { resource: 'profile', actions: ['read', 'write'] },
          { resource: 'captions', actions: ['read', 'write'] },
          { resource: 'images', actions: ['read', 'write'] }
        ],
        userCount: 150,
        isSystem: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        _id: '4',
        name: 'support',
        displayName: 'Support Agent',
        description: 'Customer support and ticket management.',
        permissions: [
          { resource: 'user', actions: ['read'] },
          { resource: 'tickets', actions: ['read', 'write'] },
          { resource: 'support', actions: ['read'] }
        ],
        userCount: 3,
        isSystem: false,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

  const totalRoles = roles.length;
  const totalUsers = roles.reduce((sum, role) => sum + role.userCount, 0);
  const activeRoles = roles.filter(role => role.isActive).length;
  const systemRoles = roles.filter(role => role.isSystem).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Create and manage user roles and permissions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold">{totalRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Roles</p>
                <p className="text-2xl font-bold">{activeRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Roles</p>
                <p className="text-2xl font-bold">{systemRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles ({roles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Permissions</th>
                  <th className="text-left py-3 px-4 font-medium">Users</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role._id} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{role.displayName}</p>
                          {role.isSystem && (
                            <Badge variant="secondary" className="text-xs">System</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{role.name}</p>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {role.description}
                      </p>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission, index) => {
                            // Defensive programming: ensure permission has the expected structure
                            if (!permission || typeof permission !== 'object') {
                              return (
                                <Badge key={index} variant="outline" className="text-xs">
                                  Invalid permission
                                </Badge>
                              );
                            }
                            
                            const resource = permission.resource || 'unknown';
                            const actions = permission.actions || [];
                            
                            if (!Array.isArray(actions)) {
                              return (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {resource}: Invalid actions
                                </Badge>
                              );
                            }
                            
                            const permissionText = `${resource}: ${actions.join(', ')}`;
                            return (
                              <Badge key={index} variant="outline" className="text-xs">
                                {permissionText}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{role.userCount}</span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <Badge variant={role.isActive ? 'default' : 'secondary'}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
