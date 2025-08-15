import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { archiveCloudinaryImage, extractCloudinaryPublicId } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get current user to access existing image URL
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Archive existing image from Cloudinary if it exists
    if (currentUser.image) {
      console.log(`📁 Archiving old profile image: ${currentUser.image}`);
      try {
        // Extract public ID from Cloudinary URL
        const publicId = extractCloudinaryPublicId(currentUser.image);
        if (publicId) {
          const archiveResult = await archiveCloudinaryImage(publicId, session.user.id);
          if (archiveResult.success) {
            console.log(`✅ Old profile image archived successfully: ${archiveResult.archivedId}`);
          } else {
            console.warn(`⚠️ Failed to archive old profile image: ${archiveResult.error}`);
          }
        } else {
          console.warn(`⚠️ Could not extract public ID from URL: ${currentUser.image}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to archive old profile image: ${error.message}`);
        // Continue with update even if archiving fails
      }
    }

    // Update user's profile image
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { image: imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ Profile image updated for user:', session.user.email);

    return NextResponse.json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        imageUrl: updatedUser.image
      }
    });

  } catch (error) {
    console.error('❌ Profile image update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get current user to access existing image URL
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Archive existing image from Cloudinary if it exists
    if (currentUser.image) {
      console.log(`📁 Archiving profile image: ${currentUser.image}`);
      try {
        // Extract public ID from Cloudinary URL
        const publicId = extractCloudinaryPublicId(currentUser.image);
        if (publicId) {
          const archiveResult = await archiveCloudinaryImage(publicId, session.user.id);
          if (archiveResult.success) {
            console.log(`✅ Profile image archived successfully: ${archiveResult.archivedId}`);
          } else {
            console.warn(`⚠️ Failed to archive profile image: ${archiveResult.error}`);
          }
        } else {
          console.warn(`⚠️ Could not extract public ID from URL: ${currentUser.image}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to archive profile image: ${error.message}`);
        // Continue with removal even if archiving fails
      }
    }

    // Remove user's profile image
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { image: null },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ Profile image removed for user:', session.user.email);

    return NextResponse.json({
      success: true,
      message: 'Profile image removed successfully',
      note: 'Previous image has been safely archived'
    });

  } catch (error) {
    console.error('❌ Profile image removal error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
