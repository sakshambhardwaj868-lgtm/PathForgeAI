import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoadmapShare extends Document {
  roadmapId: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  tokenPrefix: string;
  label?: string;
  expiresAt?: Date | null;
  isRevoked: boolean;
  revokedAt?: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const roadmapShareSchema = new Schema<IRoadmapShare>(
  {
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedRoadmap',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tokenPrefix: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: 'Shared Career Roadmap',
      trim: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.tokenHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for querying a user's shares for a specific roadmap
roadmapShareSchema.index({ roadmapId: 1, userId: 1, isRevoked: 1 });
roadmapShareSchema.index({ userId: 1, createdAt: -1 });

export const RoadmapShare = mongoose.model<IRoadmapShare>('RoadmapShare', roadmapShareSchema);
