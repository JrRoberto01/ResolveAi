import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "access_token"; // (adicionar isso em um .env no futuro)
const BIOMETRIC_TOKEN_KEY = "biometric_access_token";
const BIOMETRIC_ENABLED_KEY = "biometric_enabled";

export async function setToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function setBiometricToken(token: string) {
    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token, {
        requireAuthentication: true,
        authenticationPrompt: "Autentique-se para ativar o login com biometria",
    });
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
}

export async function getBiometricToken() {
    return await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY, {
        requireAuthentication: true,
        authenticationPrompt: "Autentique-se para entrar com biometria",
    });
}

export async function hasBiometricToken() {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === "true";
}

export async function clearBiometricToken() {
    await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
}
