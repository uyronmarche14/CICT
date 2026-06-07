import mongoose, { Schema } from 'mongoose';
import { IActivityLog } from '../types';

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: String,
      ref: 'User',
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    resource: {
      type: String,
      required: [true, 'Resource is required'],
      trim: true,
    },
    resourceId: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    actorType: {
      type: String,
      enum: ['admin', 'student', 'system'],
    },
    actorId: {
      type: String,
    },
    studentId: {
      type: String,
    },
    eventId: {
      type: String,
    },
    organizationId: {
      type: String,
    },
    outcome: {
      type: String,
      enum: ['success', 'failure', 'denied', 'duplicate'],
    },
    severity: {
      type: String,
      enum: ['info', 'warn', 'critical'],
    },
    reasonCode: {
      type: String,
    },
    correlationId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ resource: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ organizationId: 1, createdAt: -1 });

const ACTIVITY_LOG_TTL_DAYS = parseInt(process.env.ACTIVITY_LOG_TTL_DAYS || '90', 10);
const ACTIVITY_LOG_TTL_SECONDS = ACTIVITY_LOG_TTL_DAYS * 24 * 60 * 60;

activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: ACTIVITY_LOG_TTL_SECONDS });

const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

export default ActivityLog;
