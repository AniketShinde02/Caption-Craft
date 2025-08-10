import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import DeletedProfile from '@/models/DeletedProfile';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { blockCredentials, getClientIP } from '@/lib/rate-limit';

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' }, 
      { status: 401 }
    );
  }

  await dbConnect();

  try {
    const { reason } = await req.json();
    
    // Get request headers for audit purposes
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || getClientIP(req);
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Start a database transaction
    const userId = session.user.id;

    // Fetch user data
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' }, 
        { status: 404 }
      );
    }

    // Fetch all user's posts/captions
    const userPosts = await Post.find({ user: userId });

    // Prepare archived user data (exclude sensitive fields like password)
    const userDataToArchive = {
      email: user.email,
      username: user.username,
      title: user.title,
      bio: user.bio,
      image: user.image,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
    };

    // Prepare posts data for archiving
    const postsDataToArchive = userPosts.map(post => ({
      _id: post._id.toString(),
      caption: post.caption,
      image: post.image,
      createdAt: post.createdAt,
    }));

    // Create archived profile record
    const archivedProfile = new DeletedProfile({
      originalUserId: userId,
      userData: userDataToArchive,
      postsData: postsDataToArchive,
      deletionReason: reason,
      deletedBy: userId,
      ipAddress,
      userAgent,
    });

    await archivedProfile.save();

    // Delete all user's posts
    await Post.deleteMany({ user: userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    // 🚫 Block credentials to prevent immediate re-registration abuse
    await blockCredentials(
      user.email, 
      'account_deletion_abuse', 
      ipAddress, 
      userAgent
    );

    // Log the deletion for administrative purposes
    console.log(`User account deleted: ${user.email} (ID: ${userId}) at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully. Your data has been archived according to our data retention policy.',
      archiveId: archivedProfile._id,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting user account:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to delete account. Please try again later.' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' }, 
      { status: 401 }
    );
  }

  try {
    const { email, confirmEmail } = await req.json();

    // Verify the user is trying to delete their own account
    if (email !== session.user.email || email !== confirmEmail) {
      return NextResponse.json(
        { success: false, message: 'Email confirmation does not match' }, 
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch user data to show preview of what will be deleted
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' }, 
        { status: 404 }
      );
    }

    const userPosts = await Post.find({ user: session.user.id });

    return NextResponse.json({
      success: true,
      preview: {
        accountEmail: user.email,
        username: user.username || 'Not set',
        totalCaptions: userPosts.length,
        accountCreated: user.createdAt,
        lastActivity: userPosts.length > 0 ? userPosts[0].createdAt : user.createdAt,
      },
      message: 'Account deletion preview generated. You can proceed with deletion.',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error generating deletion preview:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to generate deletion preview' }, 
      { status: 500 }
    );
  }
}
