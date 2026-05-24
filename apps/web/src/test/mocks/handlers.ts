import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:5000/api';

export const mockEvent = {
  _id: 'event-1',
  title: 'Test Event',
  description: 'A test event description',
  bodyHtml: '<p>Test event content</p>',
  excerpt: 'Test event excerpt',
  organizer: {
    _id: 'organizer-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  ownerType: 'system',
  organizationId: null,
  organizationName: null,
  startDate: '2030-01-01T09:00:00.000Z',
  endDate: '2030-01-01T11:00:00.000Z',
  location: 'Test Location',
  status: 'published',
  attendees: [],
  maxAttendees: 100,
  registeredCount: 0,
  checkedInCount: 0,
  allowWalkIns: false,
  approvalSummary: undefined,
  processInstanceId: null,
  coverImage: undefined,
  gallery: [],
  sections: [],
  schedule: [],
  tags: [],
  isRegistrationOpen: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const mockNews = {
  _id: 'news-1',
  title: 'Test News',
  bodyHtml: '<p>Test content</p>',
  excerpt: 'Test excerpt',
  author: {
    _id: 'user-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
  },
  ownerType: 'system',
  organizationId: null,
  organizationName: null,
  status: 'published',
  tags: [],
  coverImage: undefined,
  gallery: [],
  sections: [],
  publishedAt: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const mockAnnouncement = {
  _id: 'announcement-1',
  title: 'Test Announcement',
  bodyHtml: '<p>Test content</p>',
  priority: 'normal',
  type: 'general',
  author: {
    _id: 'user-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
  },
  ownerType: 'system',
  organizationId: null,
  organizationName: null,
  isActive: true,
  targetAudience: ['all'],
  gallery: [],
  sections: [],
  tags: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const mockUser = {
  _id: 'user-1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  permissions: ['manage_all'],
  organizationAssignments: [],
  visibleAdminModules: ['dashboard', 'events', 'news', 'announcements', 'roles', 'users', 'faq', 'logs'],
};

export const handlers = [
  // News
  http.get(`${API_URL}/news`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        news: [mockNews],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      },
    });
  }),

  http.get(`${API_URL}/news/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { news: { ...mockNews, _id: params.id } },
    });
  }),

  // Announcements
  http.get(`${API_URL}/announcements`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        announcements: [mockAnnouncement],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      },
    });
  }),

  http.get(`${API_URL}/public/announcements`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        announcements: [mockAnnouncement],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      },
    });
  }),

  // Events
  http.get(`${API_URL}/events`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        events: [mockEvent],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      },
    });
  }),

  http.get(`${API_URL}/events/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { event: { ...mockEvent, _id: params.id } },
    });
  }),

  http.post(`${API_URL}/events`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { event: { ...mockEvent, ...(body as object), _id: 'event-new' } },
    });
  }),

  http.put(`${API_URL}/events/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { event: { ...mockEvent, ...(body as object) } },
    });
  }),

  http.delete(`${API_URL}/events/:id`, () => {
    return HttpResponse.json({ success: true, data: {} });
  }),

  http.patch(`${API_URL}/events/:id/publish`, () => {
    return HttpResponse.json({
      success: true,
      data: { event: { ...mockEvent, status: 'published' } },
    });
  }),

  http.patch(`${API_URL}/events/:id/submit`, () => {
    return HttpResponse.json({
      success: true,
      data: { event: { ...mockEvent, status: 'pending_approval' } },
    });
  }),

  http.patch(`${API_URL}/events/:id/approve`, () => {
    return HttpResponse.json({
      success: true,
      data: { event: { ...mockEvent, status: 'approved' } },
    });
  }),

  http.patch(`${API_URL}/events/:id/reject`, () => {
    return HttpResponse.json({
      success: true,
      data: { event: { ...mockEvent, status: 'rejected' } },
    });
  }),

  http.patch(`${API_URL}/events/:id/cancel`, () => {
    return HttpResponse.json({
      success: true,
      data: { event: { ...mockEvent, status: 'cancelled' } },
    });
  }),

  http.patch(`${API_URL}/events/:id/complete`, () => {
    return HttpResponse.json({
      success: true,
      data: { event: { ...mockEvent, status: 'completed' } },
    });
  }),

  // Auth
  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: { user: mockUser },
    });
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true, data: {} });
  }),

  http.get(`${API_URL}/auth/profile`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: mockUser,
        permissions: ['manage_all'],
        canAccessAdmin: true,
      },
    });
  }),

  // Student Auth
  http.post(`${API_URL}/student/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        student: {
          _id: 'student-1',
          studentNumber: '2020-00001',
          firstName: 'Test',
          lastName: 'Student',
          email: 'test@example.com',
          programId: 'program-1',
          yearLevelId: 'year-1',
          sectionId: 'section-1',
          status: 'active',
          isActive: true,
          qrVersion: 1,
        },
      },
    });
  }),

  http.get(`${API_URL}/student/profile`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        student: {
          _id: 'student-1',
          studentNumber: '2020-00001',
          firstName: 'Test',
          lastName: 'Student',
          email: 'test@example.com',
          programId: 'program-1',
          yearLevelId: 'year-1',
          sectionId: 'section-1',
          status: 'active',
          isActive: true,
          qrVersion: 1,
        },
      },
    });
  }),

  http.post(`${API_URL}/student/auth/logout`, () => {
    return HttpResponse.json({ success: true, data: {} });
  }),

  http.post(`${API_URL}/student/auth/refresh`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'refreshed-access-token',
        refreshToken: 'refreshed-refresh-token',
      },
    });
  }),
];
