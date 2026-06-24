import { useAuthStore } from '@/store/auth-store';

const mockSaveTokens = jest.fn().mockResolvedValue(undefined);
const mockSaveSession = jest.fn().mockResolvedValue(undefined);
const mockClear = jest.fn().mockResolvedValue(undefined);

jest.mock('@/services/storage/secure-store', () => ({
  sessionStorage: {
    saveSession: (...args: unknown[]) => mockSaveSession(...args),
    saveTokens: (...args: unknown[]) => mockSaveTokens(...args),
    clear: (...args: unknown[]) => mockClear(...args),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    actorType: null,
    student: null,
    adminProfile: null,
    session: null,
    status: 'hydrating',
  });
});

describe('auth-store', () => {
  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.actorType).toBeNull();
    expect(state.student).toBeNull();
    expect(state.adminProfile).toBeNull();
    expect(state.session).toBeNull();
    expect(state.status).toBe('hydrating');
  });

  it('setHydrating() sets status to hydrating', () => {
    useAuthStore.getState().setHydrating();
    expect(useAuthStore.getState().status).toBe('hydrating');
  });

  it('setSession() saves tokens via sessionStorage and updates state', async () => {
    await useAuthStore.getState().setSession({
      actorType: 'student',
      accessToken: 'at',
      refreshToken: 'rt',
      student: { _id: 's1', studentNumber: '001', firstName: 'A', lastName: 'B' },
    });

    expect(mockSaveSession).toHaveBeenCalledWith({
      actorType: 'student',
      accessToken: 'at',
      refreshToken: 'rt',
      student: { _id: 's1', studentNumber: '001', firstName: 'A', lastName: 'B' },
    });
    expect(mockSaveTokens).toHaveBeenCalledWith({
      accessToken: 'at',
      refreshToken: 'rt',
    });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('at');
    expect(state.refreshToken).toBe('rt');
    expect(state.actorType).toBe('student');
    expect(state.student).toMatchObject({ _id: 's1' });
    expect(state.adminProfile).toBeNull();
    expect(state.status).toBe('authenticated');
  });

  it('setSession() supports admin sessions', async () => {
    const profile = {
      user: {
        id: 'u1',
        email: 'admin@example.com',
        firstName: 'Ada',
        lastName: 'Admin',
        role: 'full_admin',
        baseRoleLabel: 'Full Admin',
        effectiveRoleLabel: 'Full Admin',
        effectiveRoleKind: 'system',
        effectivePermissions: [],
        canAccessAdmin: true,
        organizationAssignments: [],
        isActive: true,
      },
      permissions: [],
      canAccessAdmin: true,
    } as any;

    await useAuthStore.getState().setSession({
      actorType: 'admin',
      accessToken: 'admin-at',
      refreshToken: 'admin-rt',
      profile,
    });

    const state = useAuthStore.getState();
    expect(state.actorType).toBe('admin');
    expect(state.student).toBeNull();
    expect(state.adminProfile).toBe(profile);
  });

  it('updateStudent() updates the student field', () => {
    useAuthStore.getState().updateStudent({
      _id: 's2', studentNumber: '002', firstName: 'X', lastName: 'Y',
    });

    expect(useAuthStore.getState().student).toMatchObject({ _id: 's2' });
  });

  it('clearSession() clears tokens, student, sets status anonymous', async () => {
    useAuthStore.setState({
      accessToken: 'at',
      refreshToken: 'rt',
      actorType: 'student',
      student: { _id: 's1', studentNumber: '001', firstName: 'A', lastName: 'B' },
      adminProfile: null,
      session: {
        actorType: 'student',
        accessToken: 'at',
        refreshToken: 'rt',
        student: { _id: 's1', studentNumber: '001', firstName: 'A', lastName: 'B' },
      },
      status: 'authenticated',
    });

    await useAuthStore.getState().clearSession();

    expect(mockClear).toHaveBeenCalled();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.actorType).toBeNull();
    expect(state.student).toBeNull();
    expect(state.adminProfile).toBeNull();
    expect(state.session).toBeNull();
    expect(state.status).toBe('anonymous');
  });
});
