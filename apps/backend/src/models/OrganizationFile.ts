import mongoose, { Schema } from 'mongoose';
import { IOrganizationFile } from '../types';

const organizationFileSchema = new Schema<IOrganizationFile>(
  {
    organizationId: { type: String, required: true, lowercase: true },
    provider: { type: String, enum: ['cloudinary', 's3', 'r2', 'b2', 'local_dev'], default: 'cloudinary' },
    storageMode: { type: String, enum: ['platform_managed', 'organization_managed'], default: 'platform_managed' },
    folder: { type: String, required: true },
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    checksum: { type: String },
    uploadedBy: { type: String, required: true },
    visibility: { type: String, enum: ['private', 'organization', 'public'], default: 'organization' },
    attachedTo: [{
      type: { type: String },
      id: { type: String },
      relation: { type: String },
    }],
    lifecycleState: { type: String, enum: ['active', 'archived', 'deleted'], default: 'active' },
  },
  { timestamps: true }
);

organizationFileSchema.index({ organizationId: 1, createdAt: -1 });
organizationFileSchema.index({ organizationId: 1, lifecycleState: 1 });
organizationFileSchema.index({ organizationId: 1, mimeType: 1 });

const OrganizationFile = mongoose.model<IOrganizationFile>('OrganizationFile', organizationFileSchema);

export default OrganizationFile;
