# CICT Organization Storage and BYOK/BYOS Decision

## Document Information

| Field | Details |
|---|---|
| Project | CICT Portal |
| Document Type | Storage Architecture Decision and BYOK/BYOS Process |
| Last Updated | 2026-06-10 |
| Related Architecture | `../architecture/CICT_ORGANIZATION_SYSTEM_CONNECTION_ARCHITECTURE.md` |
| Related Plan | `CICT_ORGANIZATION_SYSTEM_IMPLEMENTATION_PLAN.md` |

---

## 1. Short Answer

Do not make BYOK/BYOS required now.

Use:

```txt
One MongoDB database
One platform-managed storage provider
Per-organization folders
Per-organization file metadata
Per-organization quotas
```

Add BYOK/BYOS only as an optional advanced feature later.

The best current option for this project is:

```txt
Platform-managed Cloudinary now
Storage abstraction now
Org quotas now
BYOS/BYOK-ready schema later
Actual org-owned storage keys only when a real org needs it
```

---

## 2. Terminology

The phrase BYOK can mean two different things.

| Term | Meaning | Relevance to CICT |
|---|---|---|
| BYOK | Bring Your Own Key, usually an encryption key controlled by the customer/organization | Not needed now unless CICT requires organization-owned encryption keys |
| BYOS | Bring Your Own Storage, meaning the organization provides its own storage account/bucket/cloud | More relevant if one org's files become too large for the shared free-tier storage |
| BYOP | Bring Your Own Provider, meaning the organization chooses Cloudinary, S3, R2, B2, etc. | Possible future version of BYOS |

For CICT, the practical concern is mostly BYOS/BYOP, not encryption BYOK.

---

## 3. Current Storage State

Current backend uploads use Cloudinary through `apps/backend/src/middleware/upload.ts`.

Current behavior:

- Cloudinary credentials come from backend environment variables.
- Multer uses memory storage.
- File size limit is currently 5 MB.
- Uploads are image-focused.
- Upload responses store URL/public ID back into module records.

This works for simple images, but it does not yet give the organization system:

- per-org storage quotas;
- per-org folder strategy;
- central file metadata;
- file attachment reuse;
- storage usage reporting;
- future provider switching;
- future BYOS/BYOK capability.

---

## 4. Why Not One MongoDB Per Organization

One MongoDB database per organization is not recommended now.

Problems:

- harder to run on free tier;
- harder to migrate and back up;
- harder to aggregate analytics across organizations;
- harder to support cross-org partnerships, task forces, shared content, and resource requests;
- harder to query admin dashboards;
- more code complexity for tenant resolution;
- every request needs dynamic database selection;
- indexes and migrations must run per database.

Better approach:

```txt
One database
organizationId on every org-owned record
compound indexes by organizationId
optional archive/export per org later
```

Per-org databases should only be reconsidered if there is a strict compliance requirement, a paid infrastructure budget, or a very large data scale where database isolation is truly needed.

---

## 5. Recommended Storage Architecture

### 5.1 Platform-Managed Storage

The default storage mode should be platform-managed.

```txt
CICT platform Cloudinary account
  orgs/cict-sc/...
  orgs/prog-club/...
  orgs/cybersec/...
```

MongoDB stores metadata only.

```ts
type OrganizationFile = {
  organizationId: string;
  provider: 'cloudinary';
  storageMode: 'platform_managed';
  folder: string;
  publicId: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string;
  uploadedBy: string;
  visibility: 'private' | 'organization' | 'public';
  attachedTo?: Array<{
    type: string;
    id: string;
    relation?: string;
  }>;
  lifecycleState: 'active' | 'archived' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
};
```

### 5.2 Per-Organization Quotas

Each organization should have configurable quota settings.

```ts
type OrganizationStorageQuota = {
  organizationId: string;
  storageLimitMb: number;
  monthlyUploadLimitMb: number;
  maxFileSizeMb: number;
  usedStorageBytes: number;
  usedUploadBytesThisMonth: number;
  allowedMimeTypes: string[];
  blockedMimeTypes: string[];
  updatedAt: Date;
};
```

Recommended free-tier defaults:

| Setting | Suggested Default |
|---|---:|
| Max image upload | 5 MB |
| Max document upload | 10 MB, if documents are added |
| Org storage quota | 100 MB per org initially |
| Monthly upload quota | 100 MB per org initially |
| Public profile image quota | Small and separate if needed |
| Retention for deleted files | Soft delete metadata immediately; provider delete after admin confirmation |

The exact values can be adjusted once real usage is observed.

### 5.3 Folder Convention

```txt
orgs/{organizationId}/profile/logo/
orgs/{organizationId}/profile/banner/
orgs/{organizationId}/gallery/
orgs/{organizationId}/events/{eventId}/
orgs/{organizationId}/meetings/{meetingId}/minutes/
orgs/{organizationId}/budget/{fiscalYear}/receipts/
orgs/{organizationId}/resource-requests/{requestId}/
orgs/{organizationId}/documents/
orgs/{organizationId}/shared-content/
```

### 5.4 Storage Service Abstraction

Add an internal storage service so modules do not call Cloudinary directly.

```ts
interface StorageProvider {
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  delete(input: StorageDeleteInput): Promise<void>;
  getUsage?(organizationId: string): Promise<StorageUsageResult>;
}

type StorageUploadInput = {
  organizationId: string;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  folder: string;
  visibility: 'private' | 'organization' | 'public';
  attachedTo?: Array<{ type: string; id: string; relation?: string }>;
};
```

Initial implementation:

```txt
StorageService
  -> checks quota
  -> chooses provider config
  -> uploads file
  -> creates OrganizationFile metadata
  -> writes OrganizationActivity
  -> returns normalized file object
```

---

## 6. Full BYOK/BYOS Process

This is the complete future process if the team decides an organization can bring its own storage provider or credentials.

### Step 1: Enable Feature Flag

BYOS should be feature-flagged.

```txt
orgStorageByos = disabled by default
```

Only super admins should enable it.

### Step 2: Choose Supported Provider

Start with one provider only if implemented.

Recommended order:

1. Cloudinary sub-account or separate Cloudinary cloud
2. Cloudflare R2
3. AWS S3
4. Backblaze B2

Do not support many providers at once in the first version.

### Step 3: Create Provider Settings Screen

Admin path example:

```txt
/admin/organizations/{orgId}/storage
```

Fields:

| Field | Purpose |
|---|---|
| provider | Cloudinary, R2, S3, B2 |
| storageMode | platform-managed or organization-managed |
| cloudName/bucketName | Provider storage target |
| region | Provider region if needed |
| folderPrefix | Base folder/prefix for the org |
| accessKey/apiKey | Provider credential |
| secretKey/apiSecret | Provider secret |
| testUploadEnabled | Whether setup can perform a test upload |

### Step 4: Validate Credentials

Before saving as active:

- upload a tiny test file;
- read the uploaded file metadata;
- delete the test file;
- verify folder permissions;
- verify allowed MIME handling;
- record validation result.

### Step 5: Encrypt Credentials

Never store provider secrets as plain text.

Recommended model:

```ts
type OrganizationStorageProviderConfig = {
  organizationId: string;
  provider: 'cloudinary' | 's3' | 'r2' | 'b2';
  storageMode: 'organization_managed';
  displayName: string;
  encryptedCredentials: {
    keyId: string;
    ciphertext: string;
    iv: string;
    authTag: string;
    algorithm: 'aes-256-gcm';
  };
  bucketOrCloudName: string;
  region?: string;
  folderPrefix: string;
  status: 'draft' | 'validating' | 'active' | 'failed' | 'disabled';
  lastValidatedAt?: Date;
  lastValidationError?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

The encryption master key should live only in environment variables:

```txt
STORAGE_CREDENTIALS_ENCRYPTION_KEY
```

### Step 6: Activate Provider

Activation should require:

- successful validation;
- super-admin permission;
- organization admin acknowledgement;
- clear warning that CICT cannot recover external provider credentials;
- fallback mode selected.

Fallback modes:

| Mode | Behavior |
|---|---|
| block_uploads | If org storage fails, reject uploads |
| fallback_to_platform | If org storage fails, use CICT platform storage |
| read_only_existing | Allow existing files, block new uploads |

Recommended default:

```txt
fallback_to_platform for non-sensitive files
block_uploads for private files
```

### Step 7: Route Uploads by Organization

Upload flow:

```txt
Request includes organizationId
  -> check user can upload for organization
  -> load active storage config
  -> if no org-managed config, use platform storage
  -> check quota
  -> upload to selected provider
  -> save OrganizationFile metadata
  -> write activity
```

### Step 8: Migration Option

If an org turns on BYOS later, existing files should not automatically move unless requested.

Migration modes:

| Mode | Behavior |
|---|---|
| new_files_only | Existing files stay in platform storage, new files use org storage |
| migrate_selected | Admin selects files to move |
| migrate_all | Background job moves all active files |

Recommended first version:

```txt
new_files_only
```

### Step 9: Rotation and Revocation

Provider credentials need lifecycle controls.

Required actions:

- rotate credentials;
- disable provider;
- revalidate provider;
- view last validation error;
- revoke and fallback to platform storage;
- audit who changed credentials.

### Step 10: Audit and Monitoring

Every storage config change should write:

- actor;
- organizationId;
- old provider status;
- new provider status;
- timestamp;
- validation result;
- reason if disabled.

Do not write raw secrets to logs.

---

## 7. Do We Need BYOK/BYOS Now?

Recommendation: no, not now.

Reasons:

- the current system is still stabilizing workflows and permissions;
- organization file usage is not yet measured;
- current uploads are mostly images;
- BYOS introduces credential security, validation, provider errors, support burden, and migration complexity;
- platform-managed storage with quotas solves the immediate free-tier risk more simply.

What should be implemented now instead:

1. central `OrganizationFile` metadata model;
2. per-org folder paths;
3. per-org quotas;
4. storage usage reporting;
5. storage abstraction over current Cloudinary upload;
6. activity logging for uploads/deletes;
7. admin warnings when org quota is close to limit.

This gives most of the benefit without BYOS complexity.

---

## 8. When BYOK/BYOS Becomes Worth It

Consider BYOS only if at least one of these becomes true:

| Trigger | Meaning |
|---|---|
| Storage limits are repeatedly exceeded | One or more organizations use enough media/docs to threaten platform storage limits |
| One org needs separate billing | The org has sponsor/funding and wants to pay for its own storage |
| Compliance demands separation | CICT needs file custody separated by organization |
| Large files become common | Videos, archives, design assets, or reports exceed shared quota |
| External partner requires it | A partner/sponsor requires files in their own bucket/account |

Until then, quotas and cleanup tools are the better first solution.

---

## 9. Storage Risk Controls

| Risk | Control |
|---|---|
| Free-tier storage runs out | Per-org quotas, warnings, cleanup dashboard |
| One org consumes all storage | Monthly upload limit and total quota |
| MongoDB grows from file storage | Store files in Cloudinary/object storage, metadata only in MongoDB |
| Lost provider credentials | Platform-managed default; encrypted BYOS credentials only if enabled |
| Orphaned files | Metadata lifecycle and scheduled orphan cleanup |
| Unsafe file types | MIME allowlist and file signature checks |
| Large memory uploads | Keep strict file size limits; consider streaming provider upload later |
| Broken external provider | BYOS validation and fallback mode |

---

## 10. Recommended Storage Roadmap

| Phase | Scope | BYOK/BYOS Status |
|---|---|---|
| Phase 1 | Platform-managed storage abstraction, org folders, org metadata, quotas | Not enabled |
| Phase 2 | Organization file manager and usage dashboard | Not enabled |
| Phase 3 | Storage provider config schema and encrypted credential support behind feature flag | Internal only |
| Phase 4 | BYOS pilot for one provider and one test organization | Optional pilot |
| Phase 5 | Migration tools, credential rotation, provider health checks | Production-ready optional feature |

---

## 11. Final Recommendation

Build for BYOK/BYOS compatibility, but do not launch BYOK/BYOS yet.

The best architecture is:

```txt
MongoDB:
  metadata, relationships, quotas, activity

Object storage:
  actual files

Organization scope:
  organizationId on every file and module record

Default storage:
  platform-managed Cloudinary

Future storage:
  optional organization-managed provider
```

This avoids overengineering while keeping the system ready if storage limits become a real operational problem.

