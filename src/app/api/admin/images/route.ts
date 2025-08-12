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

    // Get all images from the posts collection (assuming images are stored with posts)
    const posts = await db.collection('posts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Transform posts data to image items
    const images = posts.map(post => ({
      id: post._id.toString(),
      filename: post.imageUrl ? post.imageUrl.split('/').pop() : 'unknown.jpg',
      originalName: post.imageUrl ? post.imageUrl.split('/').pop() : 'unknown.jpg',
      size: post.imageSize || 'Unknown',
      dimensions: post.imageDimensions || 'Unknown',
      format: post.imageUrl ? post.imageUrl.split('.').pop()?.toUpperCase() : 'Unknown',
      uploadedBy: post.userEmail || post.userId || 'Unknown',
      uploadedAt: post.createdAt || new Date().toISOString(),
      status: post.moderationStatus || 'pending',
      tags: post.tags || [],
      url: post.imageUrl || '',
      thumbnailUrl: post.thumbnailUrl || post.imageUrl || '',
      moderationNotes: post.moderationNotes || '',
      flaggedReason: post.flaggedReason || '',
      storageLocation: 'primary',
      accessCount: post.viewCount || 0,
      lastAccessed: post.updatedAt || post.createdAt || new Date().toISOString()
    }));

    // Calculate real storage metrics
    const totalImages = images.length;
    const totalSize = images.reduce((acc, img) => {
      const size = parseFloat(img.size.replace(' MB', '').replace(' KB', '')) || 0;
      return acc + size;
    }, 0);
    
    const usedStorage = `${totalSize.toFixed(1)} MB`;
    const availableStorage = '45.8 GB'; // This should come from actual storage service
    const storagePercentage = Math.round((totalSize / (45.8 * 1024)) * 100);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const imagesToday = images.filter(img => new Date(img.uploadedAt) >= today).length;
    const imagesThisWeek = images.filter(img => new Date(img.uploadedAt) >= thisWeek).length;
    const imagesThisMonth = images.filter(img => new Date(img.uploadedAt) >= thisMonth).length;
    
    const averageImageSize = totalImages > 0 ? `${(totalSize / totalImages).toFixed(1)} MB` : '0 MB';

    const storageMetrics = {
      totalImages,
      totalSize: usedStorage,
      usedStorage,
      availableStorage,
      storagePercentage,
      imagesToday,
      imagesThisWeek,
      imagesThisMonth,
      averageImageSize
    };

    // Calculate moderation queue
    const moderationQueue = {
      pending: images.filter(img => img.status === 'pending').length,
      flagged: images.filter(img => img.status === 'flagged').length,
      rejected: images.filter(img => img.status === 'rejected').length,
      approved: images.filter(img => img.status === 'approved').length
    };

    return NextResponse.json({
      success: true,
      images,
      storageMetrics,
      moderationQueue
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
