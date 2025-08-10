import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Environment Variables Test',
    env: {
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'undefined',
      IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || 'undefined'
    }
  });
}
