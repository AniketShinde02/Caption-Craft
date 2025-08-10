
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email.',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password.'],
    minlength: 6,
    select: false, // Important to not expose password by default
  },
  // Store hashes of previously used passwords to prevent reuse
  passwordHistory: {
    type: [String],
    default: [],
    select: false,
  },
  username: {
    type: String,
    default: null,
    trim: true,
  },
  title: {
    type: String,
    default: null,
    trim: true,
  },
  bio: {
    type: String,
    default: null,
    trim: true,
  },
  emailVerified: {
    type: Date,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  // Password reset support
  resetPasswordToken: {
    type: String,
    default: null,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
