import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateCaptions } from '@/ai/flows/generate-caption';
import { isAIConfigured } from '@/ai/genkit';
import { getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Check if AI service is configured
    if (!isAIConfigured()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'AI service is not properly configured. Please contact support.',
          type: 'ai_config_error'
        },
        { status: 503 }
      );
    }

    // Get session for authenticated users
    const session = await getServerSession(authOptions);
    
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Parse request body
    const body = await request.json();
    const { mood, description, imageUrl } = body;

    // Validate required fields
    if (!mood) {
      return NextResponse.json(
        { success: false, message: 'Mood is required' },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Caption generation request from ${session?.user?.email || 'anonymous'} (IP: ${clientIP})`);

    // Call the AI flow with rate limiting
    const result = await generateCaptions({
      mood,
      description,
      imageUrl,
      userId: session?.user?.id,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Caption generation API error:', error);
    
    // Check if it's a rate limit error
    if (error.message?.includes('limit') || error.message?.includes('quota')) {
      return NextResponse.json(
        { 
          success: false, 
          message: error.message,
          type: 'rate_limit_error'
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Check if it's an AI configuration error
    if (error.message?.includes('AI service is not properly configured')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'AI service is temporarily unavailable. Please try again later.',
          type: 'ai_service_error'
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to generate captions. Please try again.'
      },
      { status: 500 }
    );
  }
}
