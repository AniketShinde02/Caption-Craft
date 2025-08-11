import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(
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
    const profileId = params.id;

    // Find the archived profile
    const archivedProfile = await db.collection('deletedprofiles').findOne({
      _id: profileId
    });

    if (!archivedProfile) {
      return NextResponse.json(
        { error: 'Archived profile not found' }, 
        { status: 404 }
      );
    }

    // Update the recovery status
    await db.collection('deletedprofiles').updateOne(
      { _id: profileId },
      { 
        $set: { 
          recoveryStatus: 'approved',
          recoveryRequested: true,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Profile recovery approved' 
    });

  } catch (error) {
    console.error('Error recovering profile:', error);
    return NextResponse.json(
      { error: 'Failed to recover profile' }, 
      { status: 500 }
    );
  }
}
