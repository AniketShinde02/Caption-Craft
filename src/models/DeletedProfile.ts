import mongoose, { Schema, Document } from 'mongoose';

export interface IDeletedProfile extends Document {
  originalUserId: string;
  userData: {
    email: string;
    username?: string;
    title?: string;
    bio?: string;
    image?: string;
    createdAt: Date;
    emailVerified?: Date;
  };
  postsData: Array<{
    _id: string;
    caption: string;
    image?: string;
    createdAt: Date;
  }>;
  deletionReason?: string;
  deletedAt: Date;
  deletedBy: string; // User ID who initiated the deletion
  ipAddress?: string;
  userAgent?: string;
}

const DeletedProfileSchema: Schema = new Schema({
  originalUserId: {
    type: String,
    required: true,
    index: true,
  },
  userData: {
    email: { type: String, required: true },
    username: String,
    title: String,
    bio: String,
    image: String,
    createdAt: Date,
    emailVerified: Date,
  },
  postsData: [{
    _id: String,
    caption: String,
    image: String,
    createdAt: Date,
  }],
  deletionReason: {
    type: String,
    maxlength: 500,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
  deletedBy: {
    type: String,
    required: true,
  },
  ipAddress: String,
  userAgent: String,
}, {
  // Add indexes for efficient querying
  indexes: [
    { originalUserId: 1 },
    { deletedAt: 1 },
    { 'userData.email': 1 }
  ]
});

// Add a TTL index to automatically delete archived profiles after a certain period (optional)
// Uncomment the line below if you want to automatically delete archived data after 2 years
// DeletedProfileSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

export default mongoose.models.DeletedProfile || mongoose.model<IDeletedProfile>('DeletedProfile', DeletedProfileSchema);
