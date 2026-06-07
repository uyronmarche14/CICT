import { describe, expect, it, beforeEach } from 'vitest';
import { eventAPI, type EventMutationPayload } from './event';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:4000/api';

describe('eventAPI', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('getAll() returns paginated events', async () => {
    const result = await eventAPI.getAll({ page: 1, limit: 10 });
    expect(result.success).toBe(true);
    expect(result.data.events).toHaveLength(1);
    expect(result.data.pagination.total).toBe(1);
  });

  it('getById() returns single event', async () => {
    const result = await eventAPI.getById('event-1');
    expect(result.success).toBe(true);
    expect(result.data.event._id).toBe('event-1');
  });

  it('create() sends payload and returns created event', async () => {
    const payload = {
      title: 'New Event',
      bodyHtml: '<p>Content</p>',
      excerpt: 'Excerpt',
      startDate: '2030-06-01T09:00:00.000Z',
      endDate: '2030-06-01T11:00:00.000Z',
      location: 'Room 101',
      tags: ['tech'],
    };

    const result = await eventAPI.create(payload);
    expect(result.success).toBe(true);
    expect(result.data.event._id).toBe('event-new');
  });

  it('update() sends payload and returns updated event', async () => {
    const result = await eventAPI.update('event-1', { title: 'Updated' } as EventMutationPayload);
    expect(result.success).toBe(true);
  });

  it('delete() removes event', async () => {
    const result = await eventAPI.delete('event-1');
    expect(result.success).toBe(true);
  });

  it('publish() changes status to published', async () => {
    const result = await eventAPI.publish('event-1');
    expect(result.data.event.status).toBe('published');
  });

  it('submit() changes status to pending_approval', async () => {
    const result = await eventAPI.submit('event-1');
    expect(result.data.event.status).toBe('pending_approval');
  });

  it('approve() changes status to approved', async () => {
    const result = await eventAPI.approve('event-1');
    expect(result.data.event.status).toBe('approved');
  });

  it('reject() changes status to rejected', async () => {
    const result = await eventAPI.reject('event-1', { reason: 'Not suitable' });
    expect(result.data.event.status).toBe('rejected');
  });

  it('cancel() changes status to cancelled', async () => {
    const result = await eventAPI.cancel('event-1');
    expect(result.data.event.status).toBe('cancelled');
  });

  it('complete() changes status to completed', async () => {
    const result = await eventAPI.complete('event-1');
    expect(result.data.event.status).toBe('completed');
  });

  it('handles API errors gracefully', async () => {
    server.use(
      http.get(`${API_URL}/events`, () => {
        return HttpResponse.json({ success: false, data: { events: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } } }, { status: 500 });
      })
    );

    await expect(eventAPI.getAll()).rejects.toThrow();
  });
});
