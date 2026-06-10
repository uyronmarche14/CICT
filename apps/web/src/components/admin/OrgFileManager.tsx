'use client';

import { Loader2, FileIcon, ImageIcon, Trash2, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrgFiles, useOrgQuota } from '@/hooks/use-org-files';
import { format } from 'date-fns';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return ImageIcon;
  return FileIcon;
}

export function OrgFileManager({ orgId }: { orgId: string }) {
  const { data: filesData, isLoading: filesLoading } = useOrgFiles(orgId);
  const { data: quota, isLoading: quotaLoading } = useOrgQuota(orgId);

  const files = filesData?.files ?? [];
  const total = filesData?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Quota Card */}
      {!quotaLoading && quota && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">
                    {formatBytes(quota.quota.usedStorageBytes)} / {quota.quota.storageLimitMb} MB
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      quota.usagePercent > 90 ? 'bg-red-500' :
                      quota.usagePercent > 70 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(quota.usagePercent, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Monthly uploads</span>
                  <span className="font-medium">
                    {formatBytes(quota.quota.usedUploadBytesThisMonth)} / {quota.quota.monthlyUploadLimitMb} MB
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      quota.monthlyPercent > 90 ? 'bg-red-500' :
                      quota.monthlyPercent > 70 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(quota.monthlyPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Files ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No files uploaded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => {
                const Icon = getFileIcon(file.mimeType);
                return (
                  <div key={file._id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(file.sizeBytes)} · {format(new Date(file.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {file.visibility}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        asChild
                      >
                        <a href={file.url} target="_blank" rel="noopener noreferrer" title="Download">
                          <FileIcon className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
