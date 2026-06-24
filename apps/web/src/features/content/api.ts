import { announcementAPI } from '@/lib/api/announcements';
import { eventAPI } from '@/lib/api/event';
import { newsAPI } from '@/lib/api/news';
import type { ContentOwnerType, NewsStatus } from '@/types';

export type ContentListParams = {
  page?: number;
  limit?: number;
  status?: NewsStatus | string;
  search?: string;
  ownerType?: ContentOwnerType | string;
  organizationId?: string;
};

export type AnnouncementListParams = ContentListParams & {
  type?: string;
  publicOnly?: boolean;
};

export const contentFeatureAPI = {
  news: {
    list: (params?: ContentListParams) => newsAPI.getAll(params),
    detail: (id: string) => newsAPI.getById(id),
    create: newsAPI.create,
    update: newsAPI.update,
    remove: newsAPI.delete,
    submit: newsAPI.submit,
    approve: newsAPI.approve,
    reject: newsAPI.reject,
    publish: newsAPI.publish,
    archive: newsAPI.archive,
  },
  announcements: {
    list: (params?: AnnouncementListParams) =>
      params?.publicOnly
        ? announcementAPI.getPublic(params)
        : announcementAPI.getAll(params),
    detail: (id: string) => announcementAPI.getById(id),
    publicDetail: (id: string) => announcementAPI.getPublicById(id),
    create: announcementAPI.create,
    update: announcementAPI.update,
    remove: announcementAPI.delete,
    submit: announcementAPI.submit,
    approve: announcementAPI.approve,
    reject: announcementAPI.reject,
    publish: announcementAPI.publish,
    archive: announcementAPI.archive,
  },
  events: {
    list: eventAPI.getAll,
    detail: eventAPI.getById,
    create: eventAPI.create,
    update: eventAPI.update,
    remove: eventAPI.delete,
    submit: eventAPI.submit,
    approve: eventAPI.approve,
    reject: eventAPI.reject,
    publish: eventAPI.publish,
    cancel: eventAPI.cancel,
    complete: eventAPI.complete,
  },
};
