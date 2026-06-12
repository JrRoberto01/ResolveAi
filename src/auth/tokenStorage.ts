import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export type AuthSession = {
    accessToken: string;
    refreshToken: string;
};

export type BiometricCredentials = {
    email: string;
    password: string;
};

export async function setAuthSession(session: AuthSession) {
    await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken),
    ]);
}

export async function getAuthSession() {
    const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    if (!accessToken || !refreshToken) {
        return null;
    }

    return {
        accessToken,
        refreshToken,
    } satisfies AuthSession;
}

export async function clearAuthSession() {
    await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
}

export async function getToken() {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function setBiometricCredentials(credentials: BiometricCredentials) {
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials), {
        requireAuthentication: true,
        authenticationPrompt: 'Faça Login ativar o login com biometria',
    });

    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
}

export async function getBiometricCredentials() {
    const credentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY, {
        requireAuthentication: true,
        authenticationPrompt: 'Faça Login para entrar com biometria',
    });

    if (!credentials) {
        return null;
    }

    return JSON.parse(credentials) as BiometricCredentials;
}

export async function hasBiometricCredentials() {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
}

export async function clearBiometricCredentials() {
    await Promise.all([
        SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY),
        SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY),
    ]);
}
