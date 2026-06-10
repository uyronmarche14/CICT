import mongoose, { Schema } from 'mongoose';
import { IOrganizationActivity } from '../types';

const organizationActivitySchema = new Schema<IOrganizationActivity>(
  {
    organizationId: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    actorType: {
      type: String,
      enum: ['admin', 'student', 'system'],
      required: true,
    },
    actorId: { type: String },
    actorName: { type: String },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    entityLabel: { type: String },
    sourceType: { type: String },
    sourceId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

organizationActivitySchema.index({ organizationId: 1, createdAt: -1 });
organizationActivitySchema.index({ organizationId: 1, entityType: 1 });
organizationActivitySchema.index({ organizationId: 1, action: 1, createdAt: -1 });

const OrganizationActivity = mongoose.model<IOrganizationActivity>(
  'OrganizationActivity',
  organizationActivitySchema
);

export default OrganizationActivity;
