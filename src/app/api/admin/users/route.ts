import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { canManageAdmins, isSuperAdmin } from '@/lib/init-admin';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage admins (super admin or has permission)
    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { db } = await connectToDatabase();

    // Get all users from the users collection
    const users = await db.collection('users').find({}).toArray();

    // Transform the data to match our interface
    const transformedUsers = users.map(user => ({
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role || { name: 'user', displayName: 'Regular User' },
      createdAt: user.createdAt || user.created_at,
      lastLogin: user.lastLogin || user.last_login,
      isActive: user.isActive !== false
    }));

    return NextResponse.json({ 
      success: true, 
      users: transformedUsers 
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    );
  }
}
