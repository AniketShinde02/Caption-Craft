import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// Helper function to retry ImageKit upload
async function uploadWithRetry(uploadParams: any, maxRetries = 3): Promise<any> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ImageKit upload attempt ${attempt}/${maxRetries}`);
      const response = await imagekit.upload(uploadParams);
      console.log(`✅ ImageKit upload successful on attempt ${attempt}`);
      return response;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ ImageKit upload attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Invalid file type. Please upload an image.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File too large. Please upload an image smaller than 10MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const fileExtension = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;

    console.log(`📤 Starting ImageKit upload for file: ${uniqueFileName} (${file.size} bytes)`);

    const uploadParams = {
      file: buffer,
      fileName: uniqueFileName,
      folder: '/captioncraft_uploads/',
      useUniqueFileName: true,
      overwriteFile: false,
    };

    // Use retry logic for ImageKit upload
    const response = await uploadWithRetry(uploadParams, 3);

    console.log(`🎉 ImageKit upload completed successfully: ${response.url}`);
    return NextResponse.json({ success: true, url: response.url }, { status: 200 });

  } catch (error: any) {
    console.error('💥 Final ImageKit Upload Error:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Upload failed. Please try again.';
    
    if (error.message?.includes('contact support@imagekit.io')) {
      errorMessage = 'ImageKit service temporarily unavailable. Please try again in a moment.';
    } else if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Upload timeout. Please try with a smaller image.';
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
