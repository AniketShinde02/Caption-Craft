import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { deleteImageFromImageKitByUrl } from '@/lib/imagekit-utils';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' }, 
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Caption ID is required' }, 
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    // Find the post first to verify ownership
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Caption not found' }, 
        { status: 404 }
      );
    }

    // Verify that the user owns this caption
    if (post.user?.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You can only delete your own captions' }, 
        { status: 403 }
      );
    }

    // Delete associated image from ImageKit if it exists
    if (post.image) {
      console.log(`🗑️ Deleting image from ImageKit: ${post.image}`);
      await deleteImageFromImageKitByUrl(post.image);
    }

    // Delete the caption
    await Post.findByIdAndDelete(id);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Caption set deleted successfully',
        deletedId: id
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error deleting caption:', error);

    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'Invalid caption ID format' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' }, 
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Caption ID is required' }, 
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Caption not found' }, 
        { status: 404 }
      );
    }

    // Verify that the user owns this caption or make it accessible to all authenticated users
    if (post.user?.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You can only view your own captions' }, 
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, data: post }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching caption:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'Invalid caption ID format' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
