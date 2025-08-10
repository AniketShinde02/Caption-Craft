import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const PASSWORD_HISTORY_LIMIT = 5;

export async function POST(req: Request) {
  try {
    const { email, token, newPassword } = await req.json();
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    if (!email || !token || !newPassword || !strong.test(newPassword)) {
      return NextResponse.json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } }).select('+password +passwordHistory');
    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    // Prevent reuse against current and history
    if (await bcrypt.compare(newPassword, user.password)) {
      return NextResponse.json({ message: 'You cannot reuse your previous password. Please choose a different one.' }, { status: 400 });
    }
    if (Array.isArray((user as any).passwordHistory)) {
      for (const oldHash of (user as any).passwordHistory) {
        if (await bcrypt.compare(newPassword, oldHash)) {
          return NextResponse.json({ message: 'You cannot reuse a previously used password. Please choose a new one.' }, { status: 400 });
        }
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    (user as any).passwordHistory = [user.password, ...((user as any).passwordHistory || [])].slice(0, PASSWORD_HISTORY_LIMIT);
    user.password = newHash;

    // Single-use token: clear regardless after a successful reset
    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Reset-password error:', e);
    return NextResponse.json({ message: 'Failed to reset password' }, { status: 500 });
  }
}
