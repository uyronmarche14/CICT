import mongoose, { Schema } from 'mongoose';
import { IOrganizationMembership } from '../types';

const membershipHistoryEntrySchema = new Schema(
  {
    field: { type: String, required: true },
    oldValue: String,
    newValue: String,
    changedBy: String,
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const membershipContributionSchema = new Schema(
  {
    type: { type: String, required: true },
    description: { type: String, required: true },
    hours: Number,
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const organizationMembershipSchema = new Schema<IOrganizationMembership>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    organizationId: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    memberType: {
      type: String,
      enum: ['officer', 'general', 'alumni', 'honorary', 'advisor'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['applied', 'invited', 'active', 'inactive', 'alumni', 'rejected', 'resigned'],
      default: 'active',
    },
    appliedAt: Date,
    invitedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    resignedAt: Date,
    startDate: Date,
    endDate: Date,
    academicYear: String,
    semester: String,
    notes: String,
    history: [membershipHistoryEntrySchema],
    contributions: [membershipContributionSchema],
  },
  {
    timestamps: true,
  }
);

organizationMembershipSchema.index({ studentId: 1, organizationId: 1 }, { unique: true });

export default mongoose.model<IOrganizationMembership>(
  'OrganizationMembership',
  organizationMembershipSchema
);
