export interface AuditLogUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuditLogs {
  _id: string;
  user?: AuditLogUser | null;
  action: string;
  resource: string;
  resourceId?: string;
  details?: {
    method?: string;
    path?: string;
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  } | unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
