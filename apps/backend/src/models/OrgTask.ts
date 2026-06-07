import mongoose, { Schema, Document } from 'mongoose';

export interface IStatusHistoryEntry {
  status: string;
  changedBy: string | mongoose.Types.ObjectId;
  changedAt: Date;
  reason?: string;
}

export interface IOrgTaskDocument extends Document {
  organizationId: string;
  title: string;
  description?: string;
  assigneeIds: mongoose.Types.ObjectId[];
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  category?: string;
  tags: string[];
  attachments: Array<{ name: string; url: string; type: string }>;
  checklist: Array<{ text: string; completed: boolean }>;
  createdBy: mongoose.Types.ObjectId;
  statusHistory: IStatusHistoryEntry[];
  meetingId?: mongoose.Types.ObjectId;
  actionItemIndex?: number;
  committee?: string;
  officerPosition?: string;
  fiscalYear?: string;
  semester?: string;
  processInstanceId?: mongoose.Types.ObjectId;
}

const orgTaskSchema = new Schema<IOrgTaskDocument>(
  {
    organizationId: { type: String, required: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assigneeIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    dueDate: Date,
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    attachments: [{ name: String, url: String, type: String }],
    checklist: [{ text: { type: String, required: true }, completed: { type: Boolean, default: false } }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        changedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    meetingId: { type: Schema.Types.ObjectId, ref: 'OrgMeeting' },
    actionItemIndex: Number,
    committee: { type: String, trim: true },
    officerPosition: { type: String, trim: true },
    fiscalYear: { type: String, trim: true },
    semester: { type: String, trim: true },
    processInstanceId: { type: Schema.Types.ObjectId, ref: 'ProcessInstance' },
  },
  { timestamps: true }
);

orgTaskSchema.index({ organizationId: 1, status: 1 });
orgTaskSchema.index({ organizationId: 1, assigneeIds: 1 });
orgTaskSchema.index({ organizationId: 1, category: 1 });

const OrgTask = mongoose.model<IOrgTaskDocument>('OrgTask', orgTaskSchema);
export default OrgTask;
