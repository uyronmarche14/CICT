import { useAuthStore } from '@/store/auth-store';

const mockSaveTokens = jest.fn().mockResolvedValue(undefined);
const mockClear = jest.fn().mockResolvedValue(undefined);

jest.mock('@/services/storage/secure-store', () => ({
  sessionStorage: {
    saveTokens: (...args: unknown[]) => mockSaveTokens(...args),
    clear: (...args: unknown[]) => mockClear(...args),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    student: null,
    status: 'hydrating',
  });
});

describe('auth-store', () => {
  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.student).toBeNull();
    expect(state.status).toBe('hydrating');
  });

  it('setHydrating() sets status to hydrating', () => {
    useAuthStore.getState().setHydrating();
    expect(useAuthStore.getState().status).toBe('hydrating');
  });

  it('setSession() saves tokens via sessionStorage and updates state', async () => {
    await useAuthStore.getState().setSession({
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
    expect(state.student).toMatchObject({ _id: 's1' });
    expect(state.status).toBe('authenticated');
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
      student: { _id: 's1', studentNumber: '001', firstName: 'A', lastName: 'B' },
      status: 'authenticated',
    });

    await useAuthStore.getState().clearSession();

    expect(mockClear).toHaveBeenCalled();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.student).toBeNull();
    expect(state.status).toBe('anonymous');
  });
});
