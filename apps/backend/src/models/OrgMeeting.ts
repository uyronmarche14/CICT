import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgMeetingDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  agenda: Array<{ topic: string; duration?: number; presenter?: string }>;
  date: Date;
  duration: number;
  location?: string;
  meetingUrl?: string;
  attendees: Array<{
    memberId?: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    rsvp: 'pending' | 'accepted' | 'declined';
  }>;
  minutes?: string;
  actionItems: Array<{
    text: string;
    assigneeId?: mongoose.Types.ObjectId;
    dueDate?: Date;
    status: 'open' | 'in_progress' | 'completed';
  }>;
  createdBy: mongoose.Types.ObjectId;
}

const orgMeetingSchema = new Schema<IOrgMeetingDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    agenda: [{ topic: { type: String, required: true }, duration: Number, presenter: String }],
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    location: { type: String, trim: true },
    meetingUrl: { type: String, trim: true },
    attendees: [{
      memberId: { type: Schema.Types.ObjectId, ref: 'OrganizationMember' },
      name: { type: String, required: true },
      email: String,
      rsvp: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    }],
    minutes: { type: String },
    actionItems: [{
      text: { type: String, required: true },
      assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
      dueDate: Date,
      status: { type: String, enum: ['open', 'in_progress', 'completed'], default: 'open' },
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

orgMeetingSchema.index({ organizationId: 1, date: -1 });

const OrgMeeting = mongoose.model<IOrgMeetingDocument>('OrgMeeting', orgMeetingSchema);
export default OrgMeeting;
