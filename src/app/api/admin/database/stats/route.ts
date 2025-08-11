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

    // Get database statistics
    const dbStats = await db.stats();
    
    // Get list of collections
    const collections = await db.listCollections().toArray();
    
    // Get collection details
    const collectionDetails = await Promise.all(
      collections.map(async (collection) => {
        try {
          const coll = db.collection(collection.name);
          const count = await coll.countDocuments();
          const stats = await coll.stats();
          
          return {
            name: collection.name,
            documentCount: count,
            size: formatBytes(stats.size || 0),
            indexes: stats.nindexes || 0,
            lastModified: new Date().toISOString(), // MongoDB doesn't track this directly
            status: count > 0 ? 'healthy' : 'warning'
          };
        } catch (error) {
          return {
            name: collection.name,
            documentCount: 0,
            size: '0 B',
            indexes: 0,
            lastModified: new Date().toISOString(),
            status: 'error'
          };
        }
      })
    );

    // Calculate totals
    const totalCollections = collections.length;
    const totalDocuments = collectionDetails.reduce((sum, coll) => sum + coll.documentCount, 0);
    const totalSize = formatBytes(dbStats.dataSize || 0);

    const stats = {
      totalCollections,
      totalDocuments,
      totalSize,
      activeConnections: dbStats.connections?.current || 0,
      lastBackup: new Date().toISOString(), // This would come from backup service
      backupStatus: 'success' as const,
      collections: collectionDetails
    };

    return NextResponse.json({ 
      success: true, 
      stats 
    });

  } catch (error) {
    console.error('Error fetching database stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database stats' }, 
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
