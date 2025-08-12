import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// Archive folder configuration
const ARCHIVE_FOLDER = 'archived_accounts';

/**
 * Extract file ID from ImageKit URL
 * ImageKit file IDs are typically longer alphanumeric strings
 * Example URL: https://ik.imagekit.io/introvertani26/captioncraft_uploads/file_ABC123.jpg
 * Returns: The actual ImageKit file ID (not the filename part)
 */
export function extractImageKitFileId(url: string): string | null {
  try {
    // ImageKit URLs can have different structures
    // Let's try multiple extraction methods
    
    // Method 1: Extract from URL path (most reliable for ImageKit)
    const urlParts = url.split('/');
    
    // Look for segments that look like ImageKit file IDs (typically 20+ characters)
    for (let i = urlParts.length - 1; i >= 0; i--) {
      const segment = urlParts[i];
      // ImageKit file IDs are typically 20+ characters, alphanumeric with possible hyphens
      if (segment && /^[a-zA-Z0-9_-]{20,}$/.test(segment) && !segment.includes('.')) {
        console.log(`✅ Found ImageKit file ID in path: ${segment}`);
        return segment;
      }
    }
    
    // Method 2: Extract from filename (fallback)
    const filename = urlParts[urlParts.length - 1];
    if (filename) {
      // Remove file extension
      const nameWithoutExt = filename.split('.')[0];
      
      // Look for a long alphanumeric string that could be a file ID
      const fileIdMatch = nameWithoutExt.match(/([a-zA-Z0-9_-]{20,})/);
      if (fileIdMatch && fileIdMatch[1]) {
        console.log(`✅ Found ImageKit file ID in filename: ${fileIdMatch[1]}`);
        return fileIdMatch[1];
      }
    }
    
    // Method 3: Try to extract from the entire URL
    // Some ImageKit URLs have the file ID as a query parameter or in a different format
    const fullUrlMatch = url.match(/([a-zA-Z0-9_-]{20,})/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      console.log(`✅ Found potential ImageKit file ID in URL: ${fullUrlMatch[1]}`);
      return fullUrlMatch[1];
    }
    
    console.warn('Could not extract ImageKit file ID from URL:', url);
    console.warn('URL parts analyzed:', urlParts);
    return null;
  } catch (error) {
    console.error('Error extracting file ID from URL:', error);
    return null;
  }
}

/**
 * Extract file path and name from ImageKit URL
 * Returns: { path: string, fileName: string }
 */
export function extractImageKitPathAndName(url: string): { path: string; fileName: string } | null {
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const path = urlParts.slice(3, -1).join('/'); // Remove domain and endpoint, keep folder structure
    
    return { path, fileName };
  } catch (error) {
    console.error('Error extracting path and name from URL:', error);
    return null;
  }
}

/**
 * Move image to archive folder in ImageKit
 */
export async function moveImageToArchive(url: string, userId: string): Promise<{ success: boolean; newUrl?: string; error?: string }> {
  try {
    if (!url) {
      return { success: false, error: 'No URL provided for archiving' };
    }

    const fileId = extractImageKitFileId(url);
    if (!fileId) {
      return { success: false, error: 'Could not extract file ID from URL' };
    }

    const pathInfo = extractImageKitPathAndName(url);
    if (!pathInfo) {
      return { success: false, error: 'Could not extract path information from URL' };
    }

    // Create archive path with user ID for organization
    const archivePath = `${ARCHIVE_FOLDER}/${userId}/${pathInfo.path}`;
    const archiveFileName = `archived_${Date.now()}_${pathInfo.fileName}`;

    console.log(`📁 Moving image to archive: ${url} → ${archivePath}/${archiveFileName}`);

    // Copy file to archive location
    const copyResult = await imagekit.copyFile({
      sourceFilePath: `${pathInfo.path}/${pathInfo.fileName}`,
      destinationPath: `${archivePath}/${archiveFileName}`,
    });

    // Type guard to check if copyResult has fileId property
    if (copyResult && typeof copyResult === 'object' && 'fileId' in copyResult) {
      const fileIdValue = (copyResult as any).fileId;
      if (fileIdValue) {
        // Delete original file after successful copy
        await imagekit.deleteFile(fileId);
        
        // Construct new archive URL
        const newUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/${archivePath}/${archiveFileName}`;
        
        console.log(`✅ Successfully archived image: ${newUrl}`);
        return { success: true, newUrl };
      }
    }
    
    return { success: false, error: 'Failed to copy file to archive' };

  } catch (error: any) {
    console.error(`❌ Failed to archive image (${url}):`, error);
    return { success: false, error: error.message || 'Unknown error during archiving' };
  }
}

/**
 * Batch move multiple images to archive folder
 */
export async function batchMoveImagesToArchive(urls: string[], userId: string): Promise<{ 
  success: number; 
  failed: number; 
  archivedUrls: string[]; 
  errors: Array<{ url: string; error: string }> 
}> {
  let success = 0;
  let failed = 0;
  const archivedUrls: string[] = [];
  const errors: Array<{ url: string; error: string }> = [];
  
  console.log(`📁 Starting batch archiving of ${urls.length} images for user ${userId}`);
  
  for (const url of urls) {
    try {
      const result = await moveImageToArchive(url, userId);
      if (result.success && result.newUrl) {
        success++;
        archivedUrls.push(result.newUrl);
      } else {
        failed++;
        errors.push({ url, error: result.error || 'Unknown error' });
      }
    } catch (error: any) {
      failed++;
      errors.push({ url, error: error.message || 'Unknown error' });
      console.error(`Failed to archive image: ${url}`, error);
    }
  }
  
  console.log(`📊 Batch archiving complete: ${success} success, ${failed} failed`);
  return { success, failed, archivedUrls, errors };
}

/**
 * Delete image from ImageKit by file ID
 */
export async function deleteImageFromImageKit(fileId: string): Promise<boolean> {
  try {
    // Validate fileId format before making API call
    if (!fileId || typeof fileId !== 'string') {
      console.error('Invalid fileId provided for deletion:', fileId);
      return false;
    }
    
    // Check if fileId looks like a valid ImageKit file ID
    if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      console.error('Invalid fileId format for ImageKit deletion:', fileId);
      return false;
    }
    
    console.log(`🗑️ Attempting to delete image from ImageKit: ${fileId}`);
    
    await imagekit.deleteFile(fileId);
    
    console.log(`✅ Successfully deleted image from ImageKit: ${fileId}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to delete image from ImageKit (${fileId}):`, error);
    
    // Log specific error details for debugging
    if (error.message) {
      console.error(`Error message: ${error.message}`);
    }
    if (error.response?.data) {
      console.error(`API response:`, error.response.data);
    }
    
    // Don't throw error - we want to continue with database deletion even if ImageKit fails
    return false;
  }
}

/**
 * Delete image from ImageKit by URL
 */
export async function deleteImageFromImageKitByUrl(url: string): Promise<boolean> {
  if (!url) {
    console.log('No URL provided for ImageKit deletion');
    return false;
  }
  
  console.log(`🔍 Extracting file ID from URL: ${url}`);
  const fileId = extractImageKitFileId(url);
  
  if (!fileId) {
    console.error('Could not extract file ID from URL for deletion:', url);
    console.error('URL analysis failed - this may indicate an invalid ImageKit URL format');
    return false;
  }
  
  console.log(`📋 Extracted file ID: ${fileId}`);
  console.log(`🗑️ Proceeding with deletion using file ID: ${fileId}`);
  
  return await deleteImageFromImageKit(fileId);
}

/**
 * Batch delete multiple images from ImageKit
 */
export async function batchDeleteImagesFromImageKit(urls: string[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  
  console.log(`🗑️ Starting batch deletion of ${urls.length} images from ImageKit`);
  
  for (const url of urls) {
    try {
      const deleted = await deleteImageFromImageKitByUrl(url);
      if (deleted) {
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to delete image: ${url}`, error);
      failed++;
    }
  }
  
  console.log(`📊 Batch deletion complete: ${success} success, ${failed} failed`);
  return { success, failed };
}
