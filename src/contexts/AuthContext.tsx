import * as LocalAuthentication from "expo-local-authentication";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    signIn as signInApi,
    SignInPayload,
    signUp as signUpApi,
    SignUpPayload,
} from "../api/auth.api";
import { api, setOnUnauthorized } from "../api/client";
import {
    clearToken,
    getBiometricToken,
    getToken,
    hasBiometricToken,
    setBiometricToken,
    setToken,
} from "../auth/tokenStorage";

type AuthContextValue = {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isBiometricAvailable: boolean;
    isBiometricEnabled: boolean;
    signIn: (payload: SignInPayload) => Promise<void>;
    signInWithBiometrics: () => Promise<void>;
    signUp: (payload: SignUpPayload) => Promise<void>;
    enableBiometricLogin: () => Promise<boolean>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

    async function applySession(accessToken: string) {
        await setToken(accessToken);
        setTokenState(accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }

    async function signOut() {
        await clearToken();
        setTokenState(null);
        delete api.defaults.headers.common.Authorization;
    }

    useEffect(() => {
        (async () => {
            try {
                const [storedToken, hasHardware, isEnrolled, hasStoredBiometricToken] = await Promise.all([
                    getToken(),
                    LocalAuthentication.hasHardwareAsync(),
                    LocalAuthentication.isEnrolledAsync(),
                    hasBiometricToken(),
                ]);

                setTokenState(storedToken ?? null);
                if (storedToken) {
                    api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
                }

                const biometricReady = hasHardware && isEnrolled;
                setIsBiometricAvailable(biometricReady);
                setIsBiometricEnabled(biometricReady && hasStoredBiometricToken);
            } finally {
                setIsLoading(false);
            }
        })();

        setOnUnauthorized(() => signOut());
    }, []);

    async function signIn(payload: SignInPayload) {
        const result = await signInApi(payload);

        const accessToken =
            (result as any)?.accessToken ??
            (result as any)?.data?.accessToken;

        await applySession(accessToken);
    }

    async function signUp(payload: SignUpPayload) {
        await signUpApi(payload);
    }

    async function signInWithBiometrics() {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            setIsBiometricAvailable(false);
            setIsBiometricEnabled(false);
            throw new Error("Login com biometria não está disponível neste dispositivo.");
        }

        const biometricToken = await getBiometricToken();

        if (!biometricToken) {
            setIsBiometricAvailable(true);
            setIsBiometricEnabled(false);
            throw new Error("O login com biometria ainda não foi ativado nesta conta.");
        }

        await applySession(biometricToken);
    }

    async function enableBiometricLogin() {
        const activeToken = token ?? await getToken();

        if (!activeToken) {
            throw new Error("Faça login primeiro para ativar a biometria.");
        }

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            setIsBiometricAvailable(false);
            setIsBiometricEnabled(false);
            throw new Error("Nenhuma biometria cadastrada foi encontrada neste dispositivo.");
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Confirme sua biometria para ativar o login rápido",
            fallbackLabel: "Usar senha do dispositivo",
            cancelLabel: "Cancelar",
        });

        if (!result.success) {
            return false;
        }

        await setBiometricToken(activeToken);
        setIsBiometricAvailable(true);
        setIsBiometricEnabled(true);

        return true;
    }

    const value = useMemo<AuthContextValue>(() => ({
        token,
        isAuthenticated: !!token,
        isLoading,
        isBiometricAvailable,
        isBiometricEnabled,
        signIn,
        signInWithBiometrics,
        signUp,
        enableBiometricLogin,
        signOut,
    }), [token, isLoading, isBiometricAvailable, isBiometricEnabled]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
    return ctx;
}
