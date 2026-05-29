import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgTaskDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
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
}

const orgTaskSchema = new Schema<IOrgTaskDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
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
  },
  { timestamps: true }
);

orgTaskSchema.index({ organizationId: 1, status: 1 });
orgTaskSchema.index({ organizationId: 1, assigneeIds: 1 });
orgTaskSchema.index({ organizationId: 1, category: 1 });

const OrgTask = mongoose.model<IOrgTaskDocument>('OrgTask', orgTaskSchema);
export default OrgTask;
