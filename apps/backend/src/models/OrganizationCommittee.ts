import mongoose, { Schema } from 'mongoose';
import { IOrganizationCommittee } from '../types';

const committeeSchema = new Schema<IOrganizationCommittee>(
  {
    organizationId: { type: String, required: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    headMembershipId: { type: String },
    memberIds: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

committeeSchema.index({ organizationId: 1, status: 1 });

const OrganizationCommittee = mongoose.model<IOrganizationCommittee>('OrganizationCommittee', committeeSchema);

export default OrganizationCommittee;
