import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgMentorshipDocument extends Document {
  mentorOrgId: string;
  menteeOrgId: string;
  focusAreas: string[];
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'cancelled';
  meetings: Array<{ date: Date; notes?: string }>;
  createdBy: mongoose.Types.ObjectId;
}

const orgMentorshipSchema = new Schema<IOrgMentorshipDocument>(
  {
    mentorOrgId: { type: String, required: true, trim: true, lowercase: true },
    menteeOrgId: { type: String, required: true, trim: true, lowercase: true },
    focusAreas: [{ type: String, trim: true }],
    startDate: { type: Date, required: true },
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    meetings: [{ date: { type: Date, required: true }, notes: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

orgMentorshipSchema.index({ mentorOrgId: 1, menteeOrgId: 1 }, { unique: true });

const OrgMentorship = mongoose.model<IOrgMentorshipDocument>('OrgMentorship', orgMentorshipSchema);
export default OrgMentorship;
