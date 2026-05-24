import { ContentOwnerType } from '@/types';

type Ownable = {
  ownerType: ContentOwnerType | string;
  organizationName?: string | null;
  organizationId?: string | null;
};

export const getOwnershipLabel = (item: Ownable, systemLabel = 'System') => {
  if (item.ownerType === ContentOwnerType.SYSTEM || item.ownerType === 'system') {
    return systemLabel;
  }

  return item.organizationName || item.organizationId || 'Organization';
};
