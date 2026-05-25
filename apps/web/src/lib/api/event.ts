import api from './axios';
import type {
  ContentOwnerType,
  MediaAsset,
  ContentSection,
  EventScheduleItem,
  ApprovalSummary,
  SpeakerItem,
  AttachmentItem,
  VenueDetails,
} from '@/types';

export type EventMutationPayload = {
  title: string;
  bodyHtml: string;
  description?: string;
  excerpt: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees?: number;
  tags?: string[];
  isRegistrationOpen?: boolean;
  allowWalkIns?: boolean;
  registrationCloseAt?: string;
  targetProgramIds?: string[];
  targetYearLevelIds?: string[];
  targetSectionIds?: string[];
  ownerType?: ContentOwnerType;
  organizationId?: string | null;
  coverImage?: MediaAsset;
  imageUrl?: string;
  imageId?: string;
  gallery?: MediaAsset[];
  sections?: ContentSection[];
  schedule?: EventScheduleItem[];
  registrationUrl?: string;
  registrationDeadline?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  hostOrganizationIds?: string[];
  coHostOrganizationIds?: string[];
  speakerItems?: SpeakerItem[];
  audience?: string;
  eligibility?: string;
  feeLabel?: string;
  certificateInfo?: string;
  venueDetails?: VenueDetails;
  mapUrl?: string;
  meetingUrl?: string;
  requirements?: string;
  attachmentItems?: AttachmentItem[];
  posterCaption?: string;
};

export interface Event {
  _id: string;
  title: string;
  description?: string;
  bodyHtml: string;
  excerpt: string;
  organizer: {
    id?: string;
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  ownerType: ContentOwnerType;
  organizationId?: string | null;
  organizationName?: string | null;
  startDate: string;
  endDate: string;
  location: string;
  status:
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'published'
    | 'cancelled'
    | 'completed';
  attendees: Array<string | { id?: string; _id?: string }>;
  maxAttendees: number;
  registeredCount?: number;
  checkedInCount?: number;
  registrationCloseAt?: string;
  allowWalkIns?: boolean;
  targetProgramIds?: string[];
  targetYearLevelIds?: string[];
  targetSectionIds?: string[];
  approvalSummary?: ApprovalSummary;
  processInstanceId?: string | null;
  coverImage?: MediaAsset;
  gallery: MediaAsset[];
  sections: ContentSection[];
  schedule: EventScheduleItem[];
  imageUrl?: string;
  tags: string[];
  isRegistrationOpen: boolean;
  registrationUrl?: string;
  registrationDeadline?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  hostOrganizationIds?: string[];
  coHostOrganizationIds?: string[];
  speakerItems?: SpeakerItem[];
  audience?: string;
  eligibility?: string;
  feeLabel?: string;
  certificateInfo?: string;
  venueDetails?: VenueDetails;
  mapUrl?: string;
  meetingUrl?: string;
  requirements?: string;
  attachmentItems?: AttachmentItem[];
  posterCaption?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventsResponse {
  success: boolean;
  data: {
    events: Event[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface SingleEventResponse {
  success: boolean;
  data: {
    event: Event;
    relatedNews?: Array<{ _id: string; title: string; excerpt?: string; publishedAt?: string }>;
    relatedAnnouncements?: Array<{ _id: string; title: string; subtype?: string }>;
  };
}

export const eventAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    upcoming?: boolean;
    ownerType?: ContentOwnerType | 'all';
    organizationId?: string;
  }) => {
    const response = await api.get<EventsResponse>('/events', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<SingleEventResponse>(`/events/${id}`);
    return response.data;
  },

  create: async (data: EventMutationPayload) => {
    // For FormData (image upload)
    const response = await api.post<SingleEventResponse>('/events', data);
    return response.data;
  },

  update: async (id: string, data: EventMutationPayload) => {
    const response = await api.put<SingleEventResponse>(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.patch<SingleEventResponse>(`/events/${id}/publish`);
    return response.data;
  },

  submit: async (id: string, payload?: { comment?: string }) => {
    const response = await api.patch<SingleEventResponse>(`/events/${id}/submit`, payload ?? {});
    return response.data;
  },

  approve: async (id: string, payload?: { comment?: string }) => {
    const response = await api.patch<SingleEventResponse>(`/events/${id}/approve`, payload ?? {});
    return response.data;
  },

  reject: async (id: string, payload: { reason: string; comment?: string }) => {
    const response = await api.patch<SingleEventResponse>(`/events/${id}/reject`, payload);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.patch<SingleEventResponse>(`/events/${id}/cancel`);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await api.patch<SingleEventResponse>(`/events/${id}/complete`);
    return response.data;
  },
};
