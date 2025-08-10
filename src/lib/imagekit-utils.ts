import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

/**
 * Extract file ID from ImageKit URL
 * Example URL: https://ik.imagekit.io/introvertani26/captioncraft_uploads/file_ABC123.jpg
 * Returns: ABC123 (the unique identifier)
 */
export function extractImageKitFileId(url: string): string | null {
  try {
    // ImageKit URL pattern: https://ik.imagekit.io/{endpoint}/{path}/{filename}_{fileId}.{extension}
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1]; // Get the last part (filename)
    
    // Extract file ID from filename (format: originalname_fileId.extension)
    const fileIdMatch = filename.match(/_([a-zA-Z0-9_-]+)\./);
    
    if (fileIdMatch && fileIdMatch[1]) {
      return fileIdMatch[1];
    }
    
    // Fallback: try to extract from URL query parameters or different patterns
    console.warn('Could not extract file ID from ImageKit URL:', url);
    return null;
  } catch (error) {
    console.error('Error extracting file ID from URL:', error);
    return null;
  }
}

/**
 * Delete image from ImageKit by file ID
 */
export async function deleteImageFromImageKit(fileId: string): Promise<boolean> {
  try {
    console.log(`🗑️ Attempting to delete image from ImageKit: ${fileId}`);
    
    await imagekit.deleteFile(fileId);
    
    console.log(`✅ Successfully deleted image from ImageKit: ${fileId}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to delete image from ImageKit (${fileId}):`, error);
    
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
  
  const fileId = extractImageKitFileId(url);
  if (!fileId) {
    console.error('Could not extract file ID from URL for deletion:', url);
    return false;
  }
  
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
