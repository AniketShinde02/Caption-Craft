import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });

    await dbConnect();
    const user = await User.findOne({ email });

    // Always return success to avoid revealing whether the email exists
    if (!user) return NextResponse.json({ success: true });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Dynamically determine the base URL from the request
    // This will work in both development and production
    const url = new URL(req.url);
    const baseUrl = process.env.NEXTAUTH_URL || 
                   process.env.NEXT_PUBLIC_APP_URL || 
                   `${url.protocol}//${url.host}`;
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Forgot-password error:', e);
    return NextResponse.json({ message: 'Failed to send reset link' }, { status: 500 });
  }
}
