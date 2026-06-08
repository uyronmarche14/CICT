import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, waitFor, http, HttpResponse, server } from '@/test/utils';
import StudentProfilePage from './page';

const API_URL = 'http://localhost:4000/api';

const mockStudent = {
  _id: 'student-1',
  studentNumber: '2020-00001',
  firstName: 'Test',
  lastName: 'Student',
  email: 'test@example.com',
};

vi.mock('@/context/StudentAuthContext', () => ({
  StudentAuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useStudentAuth: () => ({
    student: mockStudent,
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('StudentProfilePage', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<StudentProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeTruthy();
    });
  });

  it('shows student profile data', () => {
    renderWithProviders(<StudentProfilePage />);
    expect(screen.getByText('Test Student')).toBeTruthy();
    expect(screen.getByText('2020-00001')).toBeTruthy();
  });

  it('shows student email', () => {
    renderWithProviders(<StudentProfilePage />);
    expect(screen.getByText('test@example.com')).toBeTruthy();
  });

  it('shows memberships heading', async () => {
    renderWithProviders(<StudentProfilePage />);
    expect(screen.getByText('My Memberships')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('Member')).toBeTruthy();
    });
  });

  it('shows empty memberships when none', async () => {
    server.use(
      http.get(`${API_URL}/student/memberships`, () => {
        return HttpResponse.json({
          success: true,
          data: { memberships: [] },
        });
      }),
    );

    renderWithProviders(<StudentProfilePage />);
    await waitFor(() => {
      expect(screen.getByText("You haven't joined any organizations yet.")).toBeTruthy();
    });
  });
});
