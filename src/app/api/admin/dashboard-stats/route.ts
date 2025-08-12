import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user?.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Fetch real-time data
    const [
      totalUsers,
      activeUsers,
      archivedProfiles,
      totalCaptions,
      recoveryRequests,
      systemAlerts
    ] = await Promise.all([
      db.collection('users').countDocuments({ isDeleted: { $ne: true } }),
      db.collection('users').countDocuments({ 
        isDeleted: { $ne: true }, 
        lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }),
      db.collection('deletedprofiles').countDocuments(),
      db.collection('posts').countDocuments(),
      db.collection('datarecoveryrequests').countDocuments({ status: 'pending' }),
      // For now, we'll simulate system alerts based on various conditions
      Promise.resolve(0) // Placeholder for actual system alerts
    ]);

    // Calculate real trends based on actual data
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const [
      lastMonthUsers,
      lastMonthCaptions,
      lastMonthRecovery,
      lastWeekUsers,
      lastWeekCaptions
    ] = await Promise.all([
      db.collection('users').countDocuments({ 
        createdAt: { $gte: lastMonth },
        isDeleted: { $ne: true }
      }),
      db.collection('posts').countDocuments({ 
        createdAt: { $gte: lastMonth }
      }),
      db.collection('datarecoveryrequests').countDocuments({ 
        createdAt: { $gte: lastMonth }
      }),
      db.collection('users').countDocuments({ 
        createdAt: { $gte: lastWeek },
        isDeleted: { $ne: true }
      }),
      db.collection('posts').countDocuments({ 
        createdAt: { $gte: lastWeek }
      })
    ]);

    // Calculate percentage changes
    const userGrowth = lastMonthUsers > 0 ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100) : 0;
    const captionGrowth = lastMonthCaptions > 0 ? Math.round(((totalCaptions - lastMonthCaptions) / lastMonthCaptions) * 100) : 0;
    
    const trends = {
      totalUsers: userGrowth >= 0 ? `+${userGrowth}% from last month` : `${userGrowth}% from last month`,
      activeUsers: lastWeekUsers > 0 ? `+${lastWeekUsers} new this week` : 'No new users this week',
      archivedProfiles: archivedProfiles > 0 ? `${archivedProfiles} total archived` : 'No archived profiles',
      totalCaptions: captionGrowth >= 0 ? `+${captionGrowth}% from last month` : `${captionGrowth}% from last month`,
      recoveryRequests: recoveryRequests > 0 ? `${recoveryRequests} pending requests` : 'No pending requests',
      systemAlerts: systemAlerts > 0 ? `${systemAlerts} active alerts` : 'No active alerts'
    };

    // Get real-time data from actual server state
    const realTimeData = {
      onlineUsers: await db.collection('users').countDocuments({ 
        lastActivityAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Active in last 5 minutes
        isDeleted: { $ne: true }
      }),
      activeSessions: await db.collection('sessions').countDocuments({ 
        expires: { $gt: new Date() }
      }).catch(() => 0), // Fallback if sessions collection doesn't exist
      pendingActions: recoveryRequests + systemAlerts, // Real pending actions
      systemLoad: Math.round((await db.collection('users').countDocuments()) / 100 * 100) // Simple load calculation
    };

    // Get recent activity from database
    const recentActivity = await db.collection('posts')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
      .then(posts => posts.map(post => ({
        id: post._id.toString(),
        type: 'caption_generated' as const,
        description: `Caption generated for image`,
        timestamp: post.createdAt || new Date().toISOString(),
        severity: 'low' as const
      })));

    // Get user roles with real counts
    const roles = await db.collection('roles').find({}).toArray();
    const userRoles = await Promise.all(
      roles.map(async (role) => {
        const userCount = await db.collection('users').countDocuments({ 
          'role.name': role.name,
          isDeleted: { $ne: true }
        });
        return {
          id: role._id.toString(),
          name: role.displayName || role.name,
          color: role.name === 'admin' ? 'bg-red-500' : 'bg-blue-500',
          permissions: role.permissions || [],
          userCount
        };
      })
    );

    // Get real system status
    const databaseStatus = await db.admin().ping().then(() => 'Healthy').catch(() => 'Warning');
    
    // Check actual backup status from backups collection
    const lastBackupDoc = await db.collection('backups')
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .next();
    
    const lastBackup = lastBackupDoc ? lastBackupDoc.createdAt.toISOString() : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const backupStatus = lastBackupDoc ? 'success' : 'warning';
    
    // Check image storage status (you can implement actual storage health checks)
    const imageStorageStatus = 'Online'; // Placeholder - implement actual storage health check
    
    // Check AI services status
    const aiServicesStatus = 'Active'; // Placeholder - implement actual AI service health check

    const stats = {
      totalUsers,
      activeUsers,
      archivedProfiles,
      totalCaptions,
      recoveryRequests,
      systemAlerts,
      lastBackup,
      databaseStatus,
      imageStorageStatus,
      aiServicesStatus,
      trends,
      realTimeData,
      recentActivity,
      userRoles
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
