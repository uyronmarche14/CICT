import mongoose, { Schema, Document } from 'mongoose';

export interface IResourceRequestDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  providingOrgId?: string;
  resourceType: 'venue' | 'equipment' | 'budget' | 'personnel' | 'other';
  description: string;
  quantity?: number;
  dateNeeded?: Date;
  duration?: number;
  status: 'pending' | 'approved' | 'denied' | 'fulfilled' | 'cancelled';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  createdBy: mongoose.Types.ObjectId;
}

const resourceRequestSchema = new Schema<IResourceRequestDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    providingOrgId: { type: String, trim: true, lowercase: true },
    resourceType: {
      type: String,
      enum: ['venue', 'equipment', 'budget', 'personnel', 'other'],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    quantity: Number,
    dateNeeded: Date,
    duration: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'fulfilled', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

resourceRequestSchema.index({ organizationId: 1, status: 1 });
resourceRequestSchema.index({ providingOrgId: 1, status: 1 });

const ResourceRequest = mongoose.model<IResourceRequestDocument>('ResourceRequest', resourceRequestSchema);
export default ResourceRequest;
