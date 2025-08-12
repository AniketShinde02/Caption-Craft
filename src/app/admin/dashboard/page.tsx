'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Shield, 
  Archive, 
  FileText, 
  Settings, 
  LogOut, 
  MessageSquare, 
  AlertTriangle, 
  Database, 
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  Edit,
  Lock,
  Unlock,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  archivedProfiles: number;
  totalCaptions: number;
  recoveryRequests: number;
  systemAlerts: number;
  lastBackup: string;
  databaseStatus: string;
  imageStorageStatus: string;
  aiServicesStatus: string;
  trends: {
    totalUsers: string;
    activeUsers: string;
    archivedProfiles: string;
    totalCaptions: string;
    recoveryRequests: string;
    systemAlerts: string;
  };
  realTimeData: {
    onlineUsers: number;
    activeSessions: number;
    pendingActions: number;
    systemLoad: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'user_created' | 'user_deleted' | 'caption_generated' | 'system_alert' | 'role_updated';
    description: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  userRoles: Array<{
    id: string;
    name: string;
    color: string;
    permissions: Array<{
      resource: string;
      actions: string[];
    }>;
    userCount: number;
  }>;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActivity, setFilteredActivity] = useState<DashboardStats['recentActivity']>([]);

  // Check if user is authenticated as admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated' || session?.user?.role?.name !== 'admin') {
      router.push('/setup');
      return;
    }

    fetchDashboardStats();
    // Set up real-time updates
    const interval = setInterval(fetchDashboardStats, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [session, status, router]);

  // Filter activity based on search query
  useEffect(() => {
    if (!stats?.recentActivity) return;
    
    if (!searchQuery.trim()) {
      setFilteredActivity(stats.recentActivity);
      return;
    }
    
    const filtered = stats.recentActivity.filter(activity =>
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredActivity(filtered);
  }, [searchQuery, stats?.recentActivity]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/setup');
  };

  const handleRoleManagement = () => {
    router.push('/admin/roles');
  };

  const handleUserManagement = () => {
    router.push('/admin/users');
  };

  const handleDataRecovery = () => {
    router.push('/admin/data-recovery');
  };

  const handleSystemSettings = () => {
    router.push('/admin/settings');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created': return <UserCheck className="w-4 h-4" />;
      case 'user_deleted': return <UserX className="w-4 h-4" />;
      case 'caption_generated': return <FileText className="w-4 h-4" />;
      case 'system_alert': return <AlertTriangle className="w-4 h-4" />;
      case 'role_updated': return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role?.name !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header with Quick Actions - Mobile First */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Welcome back, {session?.user?.email}! Here's your system overview.
          </p>
          {session.user.isSuperAdmin && (
            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 mt-2">
              👑 Super Admin
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button onClick={handleRoleManagement} className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Manage Roles</span>
            <span className="sm:hidden">Roles</span>
          </Button>
          <Button onClick={handleUserManagement} variant="outline" className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">Users</span>
          </Button>
          <Button onClick={handleDataRecovery} variant="outline" className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Data Recovery</span>
            <span className="sm:hidden">Recovery</span>
          </Button>
          <Button onClick={handleSystemSettings} variant="outline" className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Settings</span>
          </Button>
        </div>
      </div>

      {/* Real-time Status Bar - Mobile First */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-800">Online Users</p>
                <p className="text-lg sm:text-2xl font-bold text-green-900">{stats?.realTimeData?.onlineUsers || 0}</p>
              </div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-800">Active Sessions</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900">{stats?.realTimeData?.activeSessions || 0}</p>
              </div>
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-800">Pending Actions</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-900">{stats?.realTimeData?.pendingActions || 0}</p>
              </div>
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-orange-800">System Load</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-900">{stats?.realTimeData?.systemLoad || 0}%</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8">
                <Progress value={stats?.realTimeData?.systemLoad || 0} className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats Grid - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              {stats?.trends?.totalUsers?.includes('+') ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <p className="text-xs text-muted-foreground">
                {stats?.trends?.totalUsers || '+12% from last month'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Users</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              {stats?.trends?.activeUsers?.includes('+') ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <p className="text-xs text-muted-foreground">
                {stats?.trends?.activeUsers || '+8% from last month'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Captions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.totalCaptions || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              {stats?.trends?.totalCaptions?.includes('+') ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <p className="text-xs text-muted-foreground">
                {stats?.trends?.totalCaptions || '+25% from last month'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Recovery Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.recoveryRequests || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.trends?.recoveryRequests || '2 new from last month'}
            </p>
            {stats?.recoveryRequests > 0 && (
              <Button size="sm" variant="outline" className="mt-2 w-full h-8 sm:h-9 text-xs" onClick={handleDataRecovery}>
                Review Requests
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">System Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.systemAlerts || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.trends?.systemAlerts || '1 critical from last month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Archived Profiles</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.archivedProfiles || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.trends?.archivedProfiles || '+3 from last month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Management Section - Mobile First */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">Role Management</CardTitle>
              <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
            </div>
            <Button onClick={handleRoleManagement} className="flex items-center gap-2 h-10 sm:h-9 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Role</span>
              <span className="sm:hidden">New Role</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.userRoles?.map((role) => (
              <div key={role.id} className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" 
                    style={{ backgroundColor: role.color }}
                  ></div>
                  <h3 className="font-semibold text-sm sm:text-base">{role.name}</h3>
                  <Badge variant="secondary" className="text-xs">{role.userCount} users</Badge>
                </div>
                <div className="space-y-2">
                  {role.permissions.slice(0, 3).map((permission, index) => {
                    // Defensive programming: ensure permission has the expected structure
                    if (!permission || typeof permission !== 'object') {
                      return (
                        <div key={index} className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          Invalid permission
                        </div>
                      );
                    }
                    
                    const resource = permission.resource || 'unknown';
                    const actions = permission.actions || [];
                    
                    if (!Array.isArray(actions)) {
                      return (
                        <div key={index} className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          {resource}: Invalid actions
                        </div>
                      );
                    }
                    
                    return (
                      <div key={index} className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        {resource} ({actions.join(', ')})
                      </div>
                    );
                  })}
                  {role.permissions.length > 3 && (
                    <p className="text-xs text-gray-500">+{role.permissions.length - 3} more permissions</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 h-8 sm:h-9 text-xs">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8 sm:h-9 text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No roles created yet</p>
                <Button onClick={handleRoleManagement} className="mt-3 h-10 sm:h-9">
                  Create First Role
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & System Status - Mobile First */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
                <p className="text-sm text-muted-foreground">Latest system events and user actions</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg text-sm w-32 sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button size="sm" variant="outline" onClick={fetchDashboardStats} className="h-8 sm:h-9">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredActivity?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getSeverityColor(activity.severity)} variant="outline">
                        {activity.severity}
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">System Status</CardTitle>
            <p className="text-sm text-muted-foreground">Current system health and performance</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">Database</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {stats?.databaseStatus || 'Healthy'}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">Image Storage</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {stats?.imageStorageStatus || 'Online'}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">AI Services</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {stats?.aiServicesStatus || 'Active'}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">Last Backup</span>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {stats?.lastBackup ? new Date(stats.lastBackup).toLocaleString() : '2 hours ago'}
                </span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">System Load</span>
                  <span className="text-sm text-gray-600">{stats?.realTimeData?.systemLoad || 0}%</span>
                </div>
                <Progress value={stats?.realTimeData?.systemLoad || 0} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile First */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">Common administrative tasks</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Button 
              onClick={handleRoleManagement}
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              <Shield className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">Role Management</span>
              <span className="sm:hidden">Roles</span>
            </Button>
            
            <Button 
              onClick={handleUserManagement}
              variant="outline"
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              <Users className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">User Management</span>
              <span className="sm:hidden">Users</span>
            </Button>
            
            <Button 
              onClick={handleDataRecovery}
              variant="outline"
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              <Archive className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">Data Recovery</span>
              <span className="sm:hidden">Recovery</span>
            </Button>
            
            <Button 
              onClick={handleSystemSettings}
              variant="outline"
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              <Settings className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">System Settings</span>
              <span className="sm:hidden">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions - Mobile First */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 sm:pt-6 border-t">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="outline" onClick={fetchDashboardStats} className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Data</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 h-10 sm:h-9 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
        
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 h-10 sm:h-9 text-sm w-full sm:w-auto">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">Logout</span>
        </Button>
      </div>
    </div>
  );
}
