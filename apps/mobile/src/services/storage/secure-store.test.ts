import { sessionStorage } from '@/services/storage/secure-store';

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sessionStorage', () => {
  describe('saveSession', () => {
    it('persists the versioned session object', async () => {
      await sessionStorage.saveSession({
        actorType: 'student',
        accessToken: 'at',
        refreshToken: 'rt',
        student: { _id: 's1', studentNumber: '001', firstName: 'A', lastName: 'B' },
      });

      expect(mockSetItemAsync).toHaveBeenCalledWith(
        'cict_mobile_session_v1',
        expect.stringContaining('"actorType":"student"'),
      );
    });
  });

  describe('getSession', () => {
    it('returns a parsed session when valid', async () => {
      mockGetItemAsync.mockResolvedValueOnce(
        JSON.stringify({
          actorType: 'student',
          accessToken: 'at',
          refreshToken: 'rt',
          student: { _id: 's1', studentNumber: '001', firstName: 'A', lastName: 'B' },
        }),
      );

      const result = await sessionStorage.getSession();

      expect(result).toMatchObject({ actorType: 'student', accessToken: 'at' });
    });

    it('returns null for malformed session data', async () => {
      mockGetItemAsync.mockResolvedValueOnce('not-json');

      const result = await sessionStorage.getSession();

      expect(result).toBeNull();
    });
  });

  describe('saveTokens', () => {
    it('calls SecureStore.setItemAsync for both keys', async () => {
      await sessionStorage.saveTokens({
        accessToken: 'at',
        refreshToken: 'rt',
      });

      expect(mockSetItemAsync).toHaveBeenCalledTimes(2);
      expect(mockSetItemAsync).toHaveBeenCalledWith(
        'cict_mobile_access_token',
        'at',
      );
      expect(mockSetItemAsync).toHaveBeenCalledWith(
        'cict_mobile_refresh_token',
        'rt',
      );
    });
  });

  describe('getTokens', () => {
    it('returns tokens when both exist', async () => {
      mockGetItemAsync.mockResolvedValueOnce('at').mockResolvedValueOnce('rt');

      const result = await sessionStorage.getTokens();

      expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    });

    it('returns null when access token is missing', async () => {
      mockGetItemAsync.mockResolvedValueOnce(null).mockResolvedValueOnce('rt');

      const result = await sessionStorage.getTokens();

      expect(result).toBeNull();
    });

    it('returns null when refresh token is missing', async () => {
      mockGetItemAsync.mockResolvedValueOnce('at').mockResolvedValueOnce(null);

      const result = await sessionStorage.getTokens();

      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('calls SecureStore.deleteItemAsync for token and session keys', async () => {
      await sessionStorage.clear();

      expect(mockDeleteItemAsync).toHaveBeenCalledTimes(3);
      expect(mockDeleteItemAsync).toHaveBeenCalledWith(
        'cict_mobile_access_token',
      );
      expect(mockDeleteItemAsync).toHaveBeenCalledWith(
        'cict_mobile_refresh_token',
      );
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('cict_mobile_session_v1');
    });
  });
});
