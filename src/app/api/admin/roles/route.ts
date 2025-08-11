import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Get all roles from the roles collection
    const roles = await db.collection('roles').find({}).toArray();
    
    console.log('Raw roles from database:', JSON.stringify(roles, null, 2));

    // Transform the data to match our interface
    const transformedRoles = roles.map(role => ({
      _id: role._id.toString(),
      name: role.name,
      displayName: role.displayName || role.name,
      description: role.description || `Role: ${role.name}`,
      permissions: role.permissions || [],
      userCount: role.userCount || 0,
      isSystem: role.isSystem || false,
      isActive: role.isActive !== false,
      createdAt: role.createdAt || role.created_at || new Date().toISOString()
    }));
    
    console.log('Transformed roles:', JSON.stringify(transformedRoles, null, 2));

    return NextResponse.json({ 
      success: true, 
      roles: transformedRoles 
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' }, 
      { status: 500 }
    );
  }
}
