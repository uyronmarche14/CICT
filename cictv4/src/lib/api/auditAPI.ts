import { apiFetch } from './apiFetch';
import { AuditLogs } from '@/types/AuditLogs';
import { Paginated } from '@/types/Paginated';

const ROUTE_PREFIX = '/audit';

export type AuditLogsFilters = {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
};

export type AuditSummaryItem = {
  _id: string;
  severityBreakdown: Array<{
    severity: string;
    count: number;
  }>;
  totalCount: number;
};

export type AuditSummary = AuditSummaryItem[];

export function getAuditLogs(
  page: number,
  limit: number,
  filters?: AuditLogsFilters,
  search?: string
): Promise<Paginated<AuditLogs>> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (search) {
    params.append('search', search);
  }

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
  }

  return apiFetch<Paginated<AuditLogs>>(`${ROUTE_PREFIX}/logs?${params}`, {
    method: 'GET',
  });
}

export function getAuditSummary(
  filters?: AuditLogsFilters
): Promise<AuditSummary> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
  }

  return apiFetch<AuditSummary>(`${ROUTE_PREFIX}/summary?${params}`, {
    method: 'GET',
  });
}

export function getAuditLogById(logId: string): Promise<AuditLogs> {
  return apiFetch<AuditLogs>(`${ROUTE_PREFIX}/logs/${logId}`, {
    method: 'GET',
  });
}
