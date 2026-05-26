import { Badge } from '@/components/ui/badge';
import { CheckCircle, UserCheck, AlertCircle } from 'lucide-react';
import type { NewsStatus, AnnouncementPriority, ProcessInstanceStatus } from '@/types';

export function getContentStatusBadge(status: string | NewsStatus | undefined | null) {
  const config: Record<string, { label: string; className: string }> = {
    published: { label: 'Published', className: 'bg-green-500' },
    draft: { label: 'Draft', className: 'bg-secondary' },
    pending_approval: { label: 'Pending Approval', className: 'bg-amber-500' },
    approved: { label: 'Approved', className: 'bg-blue-600' },
    rejected: { label: 'Rejected', className: 'bg-red-600' },
    archived: { label: 'Archived', className: 'bg-gray-500' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-500' },
    completed: { label: 'Completed', className: '' },
  };

  const match = status ? config[status] : undefined;
  if (!match) {
    return <Badge variant="outline">{status?.replace(/_/g, ' ') ?? 'Unknown'}</Badge>;
  }

  return (
    <Badge className={match.className || undefined}>
      {match.label}
    </Badge>
  );
}

export function getPriorityBadge(priority: AnnouncementPriority | string) {
  switch (priority) {
    case 'urgent':
      return <Badge variant="destructive">Urgent</Badge>;
    case 'high':
      return <Badge className="bg-orange-500">High</Badge>;
    case 'medium':
      return <Badge className="bg-blue-500">Medium</Badge>;
    case 'low':
      return <Badge variant="secondary">Low</Badge>;
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
}

export function getEventStatusBadge(status: string) {
  const config: Record<string, { label: string; className?: string }> = {
    published: { label: 'Published' },
    draft: { label: 'Draft' },
    pending_approval: { label: 'Pending Approval', className: 'bg-amber-500' },
    approved: { label: 'Approved', className: 'bg-blue-600' },
    rejected: { label: 'Rejected', className: 'bg-red-600' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-500' },
    completed: { label: 'Completed' },
  };

  const match = config[status];
  if (!match) {
    return <Badge variant="outline">{status.replace(/_/g, ' ')}</Badge>;
  }

  return (
    <Badge className={match.className || undefined}>
      {match.label}
    </Badge>
  );
}

export function getRegistrationBadge(isOpen: boolean | undefined | null) {
  return (
    <Badge variant={isOpen ? 'default' : 'secondary'}>
      {isOpen ? 'Yes' : 'No'}
    </Badge>
  );
}

export function getScanResultBadge(result: string) {
  switch (result) {
    case 'success':
      return <Badge className="bg-green-600 text-lg px-4 py-2"><CheckCircle className="w-5 h-5 mr-2" /> Checked In</Badge>;
    case 'duplicate':
      return <Badge className="bg-blue-600 text-lg px-4 py-2"><UserCheck className="w-5 h-5 mr-2" /> Already Checked In</Badge>;
    case 'invalid_qr':
      return <Badge className="bg-red-600 text-lg px-4 py-2"><AlertCircle className="w-5 h-5 mr-2" /> Invalid QR</Badge>;
    case 'not_registered':
      return <Badge variant="secondary" className="text-lg px-4 py-2">Not Registered</Badge>;
    case 'not_eligible':
      return <Badge className="bg-orange-600 text-lg px-4 py-2">Not Eligible</Badge>;
    case 'event_full':
      return <Badge className="bg-red-600 text-lg px-4 py-2">Event Full</Badge>;
    case 'registration_closed':
      return <Badge className="bg-red-600 text-lg px-4 py-2">Registration Closed</Badge>;
    default:
      return <Badge variant="outline">{result}</Badge>;
  }
}

export function getFeatureBadge(featured?: boolean, pinned?: boolean) {
  return (
    <>
      {featured && <Badge className="bg-amber-500">Featured</Badge>}
      {pinned && <Badge className="bg-purple-500">Pinned</Badge>}
    </>
  );
}

export function getStudentStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-green-600' },
    pending: { label: 'Pending', className: 'bg-amber-500' },
    inactive: { label: 'Inactive', className: 'bg-secondary' },
    suspended: { label: 'Suspended', className: 'bg-red-600' },
  };

  const match = config[status];
  if (match) {
    return <Badge className={match.className}>{match.label}</Badge>;
  }

  return <Badge variant="secondary">{status}</Badge>;
}

export function getProcessStatusBadge(status: ProcessInstanceStatus | string) {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    active: { label: 'Active', variant: 'default' },
    completed: { label: 'Completed', variant: 'outline' },
    archived: { label: 'Archived', variant: 'destructive' },
  };

  const match = config[status];
  if (match) {
    return <Badge variant={match.variant}>{match.label}</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
}

export function getMembershipStatusBadge(status: string) {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { label: 'Active', variant: 'default' },
    applied: { label: 'Applied', variant: 'secondary' },
    invited: { label: 'Invited', variant: 'secondary' },
    inactive: { label: 'Inactive', variant: 'outline' },
    alumni: { label: 'Alumni', variant: 'outline' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    resigned: { label: 'Resigned', variant: 'outline' },
  };

  const info = config[status] ?? { label: status, variant: 'outline' as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export function getMemberTypeLabel(memberType: string) {
  const map: Record<string, string> = {
    officer: 'Officer',
    general: 'General',
    alumni: 'Alumni',
    honorary: 'Honorary',
    advisor: 'Advisor',
  };
  return map[memberType] ?? memberType;
}
