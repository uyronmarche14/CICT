import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, waitFor, http, HttpResponse, server } from '@/test/utils';
import StudentEventsPage from './page';

const API_URL = 'http://localhost:4000/api';

describe('StudentEventsPage', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<StudentEventsPage />);
    await waitFor(() => {
      expect(screen.getByText('Available Events')).toBeTruthy();
    });
  });

  it('shows loading state initially', async () => {
    let resolveQuery: (value: unknown) => void;
    const blocker = new Promise((r) => { resolveQuery = r; });

    server.use(
      http.get(`${API_URL}/student/events`, async () => {
        await blocker;
        return HttpResponse.json({
          success: true,
          data: { events: [] },
        });
      }),
    );

    renderWithProviders(<StudentEventsPage />);
    expect(document.querySelector('.animate-spin')).toBeTruthy();
    resolveQuery(null);
  });

  it('shows events when data loads', async () => {
    renderWithProviders(<StudentEventsPage />);
    await waitFor(() => {
      expect(screen.getByText('Student Test Event')).toBeTruthy();
    });
  });

  it('shows empty state when no events', async () => {
    server.use(
      http.get(`${API_URL}/student/events`, () => {
        return HttpResponse.json({
          success: true,
          data: { events: [] },
        });
      }),
    );

    renderWithProviders(<StudentEventsPage />);
    await waitFor(() => {
      expect(screen.getByText('No upcoming events available for you at the moment.')).toBeTruthy();
    });
  });

  it('shows error state on API failure', async () => {
    server.use(
      http.get(`${API_URL}/student/events`, () => {
        return HttpResponse.json({ success: false }, { status: 500 });
      }),
    );

    renderWithProviders(<StudentEventsPage />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load events. Please try again later.')).toBeTruthy();
    });
  });
});
