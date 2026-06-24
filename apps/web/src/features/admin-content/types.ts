import type { ContentOwnerType, NewsStatus, Permission } from '@/types';

export type AdminContentKind = 'news' | 'announcement' | 'event';

export type ContentWorkflowAction =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'archive'
  | 'delete';

export type ContentListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: NewsStatus | 'all';
  ownerType?: ContentOwnerType | 'all';
  organizationId?: string | 'all';
  category?: string | 'all';
  featured?: 'all' | 'featured' | 'not_featured';
  subtype?: string | 'all';
  ctaFilter?: 'all' | 'has_cta' | 'no_cta';
};

export type ContentWorkflowConfig = {
  kind: AdminContentKind;
  listQueryKey: readonly unknown[];
  permissions: Partial<Record<ContentWorkflowAction, Permission>>;
};
