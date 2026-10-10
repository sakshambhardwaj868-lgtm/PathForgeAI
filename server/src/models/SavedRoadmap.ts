import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISavedRoadmap extends Document {
  userId: Types.ObjectId;
  roadmapId: string;
  targetRole: string;
  targetCompanyType: string;
  experienceLevel: string;
  weeklyCommitmentHours: number;
  totalEstimatedWeeks: number;
  source: string;
  phases: any[];
  intermediateRoles: any[];
  milestones: any[];
  edges: any[];
  metrics?: any;
  createdAt: Date;
  updatedAt: Date;
}

const savedRoadmapSchema = new Schema<ISavedRoadmap>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roadmapId: {
      type: String,
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    targetCompanyType: {
      type: String,
      default: 'Tech Company',
    },
    experienceLevel: {
      type: String,
      default: 'Beginner',
    },
    weeklyCommitmentHours: {
      type: Number,
      default: 15,
    },
    totalEstimatedWeeks: {
      type: Number,
      default: 12,
    },
    source: {
      type: String,
      default: 'live_ai',
    },
    phases: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    intermediateRoles: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    milestones: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    edges: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    metrics: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for fast queries by user and creation date
savedRoadmapSchema.index({ userId: 1, createdAt: -1 });
savedRoadmapSchema.index({ userId: 1, roadmapId: 1 });

export const SavedRoadmap = mongoose.model<ISavedRoadmap>('SavedRoadmap', savedRoadmapSchema);
