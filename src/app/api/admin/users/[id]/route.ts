import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userId = params.id;

    // Check if user exists
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if trying to delete admin user
    if (user.role?.name === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin user' }, { status: 400 });
    }

    // Soft delete - move to deletedprofiles collection
    const deletedProfile = {
      ...user,
      deletedAt: new Date(),
      deletedBy: session.user.email,
      originalId: user._id
    };

    // Insert into deletedprofiles collection
    await db.collection('deletedprofiles').insertOne(deletedProfile);

    // Remove from users collection
    const result = await db.collection('users').deleteOne({ _id: userId });

    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userId = params.id;
    const updates = await request.json();

    // Check if user exists
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate updates - only allow certain fields to be updated
    const allowedUpdates: any = {};
    
    if (updates.isActive !== undefined) {
      allowedUpdates.isActive = updates.isActive;
    }
    
    if (updates.role && updates.role.name) {
      // Verify role exists
      const role = await db.collection('roles').findOne({ name: updates.role.name });
      if (!role) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      allowedUpdates.role = {
        name: role.name,
        displayName: role.displayName
      };
    }

    if (updates.username !== undefined) {
      allowedUpdates.username = updates.username;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Update user
    const result = await db.collection('users').updateOne(
      { _id: userId },
      { $set: allowedUpdates }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json({ 
        success: true, 
        message: 'User updated successfully',
        updates: allowedUpdates
      });
    } else {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
