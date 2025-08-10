import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { deleteImageFromImageKitByUrl } from '@/lib/imagekit-utils';

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

    // Delete existing image from ImageKit if it exists
    if (currentUser.image) {
      console.log(`🗑️ Deleting old profile image from ImageKit: ${currentUser.image}`);
      await deleteImageFromImageKitByUrl(currentUser.image);
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

    // Delete existing image from ImageKit if it exists
    if (currentUser.image) {
      console.log(`🗑️ Deleting profile image from ImageKit: ${currentUser.image}`);
      await deleteImageFromImageKitByUrl(currentUser.image);
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
      message: 'Profile image removed successfully'
    });

  } catch (error) {
    console.error('❌ Profile image removal error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
