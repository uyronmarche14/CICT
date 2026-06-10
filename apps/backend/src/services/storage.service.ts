import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import OrganizationFile from '../models/OrganizationFile';
import OrganizationStorageQuota from '../models/OrganizationStorageQuota';
import { recordActivity } from './activity.service';
import logger from '../utils/logger';

function buildFolderPath(organizationId: string, subfolder?: string): string {
  const parts = ['orgs', organizationId];
  if (subfolder) {parts.push(subfolder);}
  return parts.join('/');
}

function computeChecksum(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  folder: string
): Promise<{ publicId: string; url: string; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      },
      (error, result) => {
        if (error) {reject(error);}
        else if (result) {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            sizeBytes: result.bytes,
          });
        } else {reject(new Error('Cloudinary upload returned no result'));}
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error(`Failed to delete ${publicId} from Cloudinary:`, error);
  }
}

export async function uploadFile(input: {
  organizationId: string;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  folder?: string;
  visibility?: 'private' | 'organization' | 'public';
}): Promise<typeof OrganizationFile extends (new (...args: any[]) => infer R) ? R : any> {
  const {
    organizationId,
    buffer,
    fileName,
    mimeType,
    uploadedBy,
    folder: subfolder,
    visibility = 'organization',
  } = input;

  const quota = await OrganizationStorageQuota.findOne({ organizationId });
  if (!quota) {
    throw new Error(`No storage quota configured for organization ${organizationId}`);
  }

  const maxBytes = quota.maxFileSizeMb * 1024 * 1024;
  if (buffer.length > maxBytes) {
    throw new Error(`File exceeds maximum size of ${quota.maxFileSizeMb}MB`);
  }

  const storageLimitBytes = quota.storageLimitMb * 1024 * 1024;
  if (quota.usedStorageBytes + buffer.length > storageLimitBytes) {
    throw new Error('Organization storage quota exceeded');
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  if (monthStart.getTime() > 0) {
    const monthlyLimitBytes = quota.monthlyUploadLimitMb * 1024 * 1024;
    if (quota.usedUploadBytesThisMonth + buffer.length > monthlyLimitBytes) {
      throw new Error('Monthly upload quota exceeded');
    }
  }

  const folder = buildFolderPath(organizationId, subfolder);
  const checksum = computeChecksum(buffer);

  const { publicId, url, sizeBytes } = await uploadToCloudinary(buffer, fileName, folder);

  const fileRecord = await OrganizationFile.create({
    organizationId,
    provider: 'cloudinary',
    storageMode: 'platform_managed',
    folder,
    publicId,
    url,
    fileName,
    mimeType,
    sizeBytes,
    checksum,
    uploadedBy,
    visibility,
    lifecycleState: 'active',
  });

  quota.usedStorageBytes += sizeBytes;
  quota.usedUploadBytesThisMonth += sizeBytes;
  await quota.save();

  await recordActivity({
    organizationId,
    actorType: 'admin',
    actorId: uploadedBy,
    action: 'uploaded',
    entityType: 'file',
    entityId: String(fileRecord._id),
    entityLabel: fileName,
  });

  return fileRecord;
}

export async function deleteFile(fileId: string, organizationId: string): Promise<void> {
  const file = await OrganizationFile.findOne({ _id: fileId, organizationId });
  if (!file) {throw new Error('File not found');}

  file.lifecycleState = 'deleted';
  await file.save();

  await deleteFromCloudinary(file.publicId);

  await OrganizationStorageQuota.updateOne(
    { organizationId },
    { $inc: { usedStorageBytes: -file.sizeBytes } }
  );

  await recordActivity({
    organizationId,
    actorType: 'system',
    action: 'deleted',
    entityType: 'file',
    entityId: fileId,
    entityLabel: file.fileName,
  });
}

export async function getOrgFiles(
  organizationId: string,
  options?: { mimeType?: string; limit?: number; skip?: number }
): Promise<{ files: any[]; total: number }> {
  const query: Record<string, unknown> = {
    organizationId,
    lifecycleState: 'active',
  };
  if (options?.mimeType) {query.mimeType = { $regex: `^${options.mimeType}`, $options: 'i' };}

  const [files, total] = await Promise.all([
    OrganizationFile.find(query)
      .sort({ createdAt: -1 })
      .skip(options?.skip ?? 0)
      .limit(options?.limit ?? 50)
      .lean(),
    OrganizationFile.countDocuments(query),
  ]);

  return { files, total };
}

export async function getOrgQuota(organizationId: string): Promise<{
  quota: any;
  usagePercent: number;
  monthlyPercent: number;
}> {
  const quota = await OrganizationStorageQuota.findOne({ organizationId }).lean();
  if (!quota) {throw new Error('Quota not found');}

  const usagePercent = quota.storageLimitMb > 0
    ? (quota.usedStorageBytes / (quota.storageLimitMb * 1024 * 1024)) * 100
    : 0;
  const monthlyPercent = quota.monthlyUploadLimitMb > 0
    ? (quota.usedUploadBytesThisMonth / (quota.monthlyUploadLimitMb * 1024 * 1024)) * 100
    : 0;

  return { quota, usagePercent, monthlyPercent };
}
