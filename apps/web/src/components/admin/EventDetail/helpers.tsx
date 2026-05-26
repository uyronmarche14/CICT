import { Badge } from '@/components/ui/badge';
import { getScanResultBadge as getCentralScanResultBadge } from '@/utils/badge-helpers';

export const PAGE_SIZE = 15;

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'registered', label: 'Registered' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'reserved', label: 'Reserved' },
];

export const SCAN_RESULT_OPTIONS = [
  { value: 'all', label: 'All Results' },
  { value: 'success', label: 'Success' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'not_registered', label: 'Not Registered' },
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'invalid_qr', label: 'Invalid QR' },
  { value: 'event_full', label: 'Event Full' },
  { value: 'registration_closed', label: 'Registration Closed' },
];

export const SCAN_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'entry', label: 'QR Scan' },
  { value: 'manual', label: 'Manual' },
];

export function getStatusBadge(status: string) {
  switch (status) {
    case 'registered': return <Badge className="bg-green-600">Registered</Badge>;
    case 'checked_in': return <Badge className="bg-blue-600">Checked In</Badge>;
    case 'cancelled': return <Badge variant="secondary">Cancelled</Badge>;
    case 'reserved': return <Badge variant="outline">Reserved</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export function getScanResultBadge(result: string) {
  return getCentralScanResultBadge(result);
}

export function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}
