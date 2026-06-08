const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
}));

import { sessionStorage } from '@/services/storage/secure-store';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sessionStorage', () => {
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
    it('calls SecureStore.deleteItemAsync for both keys', async () => {
      await sessionStorage.clear();

      expect(mockDeleteItemAsync).toHaveBeenCalledTimes(2);
      expect(mockDeleteItemAsync).toHaveBeenCalledWith(
        'cict_mobile_access_token',
      );
      expect(mockDeleteItemAsync).toHaveBeenCalledWith(
        'cict_mobile_refresh_token',
      );
    });
  });
});
