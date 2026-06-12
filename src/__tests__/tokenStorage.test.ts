import * as SecureStore from 'expo-secure-store';
import {
  clearAuthSession,
  clearBiometricCredentials,
  getAuthSession,
  getBiometricCredentials,
  getToken,
  hasBiometricCredentials,
  setAuthSession,
  setBiometricCredentials,
} from '../auth/tokenStorage';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const mockedSecureStore = jest.mocked(SecureStore);

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores access and refresh tokens', async () => {
    await setAuthSession({ accessToken: 'access-123', refreshToken: 'refresh-123' });

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'access-123');
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('refresh_token', 'refresh-123');
  });

  it('returns a complete auth session only when both tokens exist', async () => {
    mockedSecureStore.getItemAsync
      .mockResolvedValueOnce('access-123')
      .mockResolvedValueOnce('refresh-123');

    await expect(getAuthSession()).resolves.toEqual({
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
    });

    mockedSecureStore.getItemAsync.mockResolvedValueOnce('access-123').mockResolvedValueOnce(null);

    await expect(getAuthSession()).resolves.toBeNull();
  });

  it('clears auth session tokens', async () => {
    await clearAuthSession();

    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
  });

  it('reads only the access token with getToken', async () => {
    mockedSecureStore.getItemAsync.mockResolvedValueOnce('access-123');

    await expect(getToken()).resolves.toBe('access-123');
    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith('access_token');
  });

  it('stores, reads and clears biometric credentials', async () => {
    await setBiometricCredentials({ email: 'user@email.com', password: 'secret' });

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      'biometric_credentials',
      JSON.stringify({ email: 'user@email.com', password: 'secret' }),
      expect.objectContaining({ requireAuthentication: true }),
    );
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('biometric_enabled', 'true');

    mockedSecureStore.getItemAsync.mockResolvedValueOnce(
      JSON.stringify({ email: 'user@email.com', password: 'secret' }),
    );

    await expect(getBiometricCredentials()).resolves.toEqual({
      email: 'user@email.com',
      password: 'secret',
    });

    mockedSecureStore.getItemAsync.mockResolvedValueOnce('true');
    await expect(hasBiometricCredentials()).resolves.toBe(true);

    await clearBiometricCredentials();
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('biometric_credentials');
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('biometric_enabled');
  });
});
