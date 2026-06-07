import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgTaskForceDocument extends Document {
  organizationId: string;
  name: string;
  description?: string;
  participantOrgIds: string[];
  memberUserIds: mongoose.Types.ObjectId[];
  objectives: Array<{ text: string; completed: boolean }>;
  startDate: Date;
  endDate?: Date;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  partnershipId?: mongoose.Types.ObjectId;
  linkedEventIds: mongoose.Types.ObjectId[];
  linkedTaskIds: mongoose.Types.ObjectId[];
  linkedMeetingIds: mongoose.Types.ObjectId[];
  statusHistory: Array<{ status: string; changedBy: string | mongoose.Types.ObjectId; changedAt: Date; reason?: string }>;
  outcome?: {
    deliverables?: string;
    completionNotes?: string;
  };
}

const orgTaskForceSchema = new Schema<IOrgTaskForceDocument>(
  {
    organizationId: { type: String, required: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    participantOrgIds: [{ type: String, trim: true, lowercase: true }],
    memberUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    objectives: [{ text: { type: String, required: true }, completed: { type: Boolean, default: false } }],
    startDate: { type: Date, required: true },
    endDate: Date,
    status: {
      type: String,
      enum: ['planning', 'active', 'completed', 'cancelled'],
      default: 'planning',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partnershipId: { type: Schema.Types.ObjectId, ref: 'OrgPartnership' },
    linkedEventIds: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    linkedTaskIds: [{ type: Schema.Types.ObjectId, ref: 'OrgTask' }],
    linkedMeetingIds: [{ type: Schema.Types.ObjectId, ref: 'OrgMeeting' }],
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        changedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    outcome: {
      deliverables: String,
      completionNotes: String,
    },
  },
  { timestamps: true }
);

const OrgTaskForce = mongoose.model<IOrgTaskForceDocument>('OrgTaskForce', orgTaskForceSchema);
export default OrgTaskForce;
