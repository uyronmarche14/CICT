import mongoose, { Schema } from 'mongoose';
import { IOrganizationStorageQuota } from '../types';

const organizationStorageQuotaSchema = new Schema<IOrganizationStorageQuota>(
  {
    organizationId: { type: String, required: true, unique: true, lowercase: true },
    storageLimitMb: { type: Number, default: 100 },
    monthlyUploadLimitMb: { type: Number, default: 100 },
    maxFileSizeMb: { type: Number, default: 5 },
    usedStorageBytes: { type: Number, default: 0 },
    usedUploadBytesThisMonth: { type: Number, default: 0 },
    allowedMimeTypes: [{ type: String }],
    blockedMimeTypes: [{ type: String }],
  },
  { timestamps: true }
);

const OrganizationStorageQuota = mongoose.model<IOrganizationStorageQuota>(
  'OrganizationStorageQuota',
  organizationStorageQuotaSchema
);

export default OrganizationStorageQuota;
