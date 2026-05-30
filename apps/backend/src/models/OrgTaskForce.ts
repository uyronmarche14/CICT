import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgTaskForceDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  participantOrgIds: string[];
  memberUserIds: mongoose.Types.ObjectId[];
  objectives: Array<{ text: string; completed: boolean }>;
  startDate: Date;
  endDate?: Date;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
}

const orgTaskForceSchema = new Schema<IOrgTaskForceDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
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
  },
  { timestamps: true }
);

const OrgTaskForce = mongoose.model<IOrgTaskForceDocument>('OrgTaskForce', orgTaskForceSchema);
export default OrgTaskForce;
