export type StorageProvider = 'cloudinary' | 's3' | 'r2' | 'b2' | 'local_dev';
export type StorageMode = 'platform_managed' | 'organization_managed';
export type FileVisibility = 'private' | 'organization' | 'public';
export type FileLifecycleState = 'active' | 'archived' | 'deleted';

export type OrganizationFileRecord = {
  organizationId: string;
  provider: StorageProvider;
  storageMode: StorageMode;
  folder: string;
  publicId: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string;
  uploadedBy: string;
  visibility: FileVisibility;
  attachedTo?: Array<{ type: string; id: string; relation?: string }>;
  lifecycleState: FileLifecycleState;
  createdAt: string;
};

export type OrganizationStorageQuota = {
  organizationId: string;
  storageLimitMb: number;
  monthlyUploadLimitMb: number;
  maxFileSizeMb: number;
  usedStorageBytes: number;
  usedUploadBytesThisMonth: number;
  allowedMimeTypes: string[];
};
