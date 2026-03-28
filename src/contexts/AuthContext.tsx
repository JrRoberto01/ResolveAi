import * as LocalAuthentication from "expo-local-authentication";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    signIn as signInApi,
    SignInPayload,
    SignInResponse,
    signUp as signUpApi,
    SignUpPayload,
} from "../api/auth.api";
import { api, refreshAuthSession, setOnUnauthorized } from "../api/client";
import {
    AuthSession,
    clearAuthSession,
    clearBiometricCredentials,
    getAuthSession,
    getBiometricCredentials,
    hasBiometricCredentials,
    setAuthSession,
    setBiometricCredentials,
} from "../auth/tokenStorage";

type SignOutOptions = {
    clearBiometric?: boolean;
};

type AuthContextValue = {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isBiometricAvailable: boolean;
    isBiometricEnabled: boolean;
    isAuthRedirectPaused: boolean;
    pauseAuthRedirect: () => void;
    resumeAuthRedirect: () => void;
    shouldOfferBiometricEnrollment: () => Promise<boolean>;
    signIn: (payload: SignInPayload) => Promise<void>;
    signInWithBiometrics: () => Promise<void>;
    signUp: (payload: SignUpPayload) => Promise<void>;
    enableBiometricLogin: (payload: SignInPayload) => Promise<boolean>;
    signOut: (options?: SignOutOptions) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isJwtExpired(token: string, bufferInSeconds = 15) {
    try {
        const [, payload] = token.split(".");

        if (!payload) {
            return true;
        }

        const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
        const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=");
        const decodedPayload = JSON.parse(atob(paddedPayload)) as { exp?: number };

        if (!decodedPayload.exp) {
            return true;
        }

        return decodedPayload.exp <= Math.floor(Date.now() / 1000) + bufferInSeconds;
    } catch {
        return true;
    }
}

const applySessionToClient = (session: AuthSession) => {
    api.defaults.headers.common.Authorization = `Bearer ${session.accessToken}`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isAuthRedirectPaused, setIsAuthRedirectPaused] = useState(false);

    function pauseAuthRedirect() {
        setIsAuthRedirectPaused(true);
    }

    function resumeAuthRedirect() {
        setIsAuthRedirectPaused(false);
    }

    async function refreshBiometricState() {
        const [hasHardware, isEnrolled, hasStoredBiometricCredentials] = await Promise.all([
            LocalAuthentication.hasHardwareAsync(),
            LocalAuthentication.isEnrolledAsync(),
            hasBiometricCredentials(),
        ]);

        const biometricReady = hasHardware && isEnrolled;
        setIsBiometricAvailable(biometricReady);
        setIsBiometricEnabled(biometricReady && hasStoredBiometricCredentials);

        return {
            biometricReady,
            hasStoredBiometricCredentials,
        };
    }

    async function shouldOfferBiometricEnrollment() {
        const { biometricReady, hasStoredBiometricCredentials } = await refreshBiometricState();

        return biometricReady && !hasStoredBiometricCredentials;
    }

    async function applySession(session: AuthSession) {
        await setAuthSession(session);
        setTokenState(session.accessToken);
        applySessionToClient(session);
    }

    async function signOut(options?: SignOutOptions) {
        await clearAuthSession();

        if (options?.clearBiometric) {
            await clearBiometricCredentials();
            setIsBiometricEnabled(false);
        }

        setTokenState(null);
        setIsAuthRedirectPaused(false);
        delete api.defaults.headers.common.Authorization;
    }

    useEffect(() => {
        (async () => {
            try {
                const [storedSession] = await Promise.all([
                    getAuthSession(),
                    refreshBiometricState(),
                ]);

                if (!storedSession) {
                    setTokenState(null);
                    return;
                }

                if (!isJwtExpired(storedSession.accessToken)) {
                    setTokenState(storedSession.accessToken);
                    applySessionToClient(storedSession);
                    return;
                }

                const refreshedSession = await refreshAuthSession(storedSession);

                if (refreshedSession) {
                    setTokenState(refreshedSession.accessToken);
                    applySessionToClient(refreshedSession);
                    return;
                }

                setTokenState(null);
            } finally {
                setIsLoading(false);
            }
        })();

        setOnUnauthorized(() => signOut());
    }, []);

    async function signIn(payload: SignInPayload) {
        const result: SignInResponse = await signInApi(payload);

        const session = {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        } satisfies AuthSession;

        await applySession(session);
    }

    async function signUp(payload: SignUpPayload) {
        await signUpApi(payload);
    }

    async function signInWithBiometrics() {
        const { biometricReady } = await refreshBiometricState();

        if (!biometricReady) {
            throw new Error("Login com biometria não está disponível neste dispositivo.");
        }

        const biometricCredentials = await getBiometricCredentials();

        if (!biometricCredentials) {
            setIsBiometricEnabled(false);
            throw new Error("O login com biometria ainda não foi ativado nesta conta.");
        }

        try {
            const result: SignInResponse = await signInApi(biometricCredentials);
            await applySession({
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });
        } catch (error: any) {
            if (error?.response?.status === 401) {
                await clearBiometricCredentials();
                setIsBiometricEnabled(false);
                throw new Error("Suas credenciais biométricas expiraram. Faça login com e-mail e senha para ativá-las novamente.");
            }

            throw error;
        }
    }

    async function enableBiometricLogin(payload: SignInPayload) {
        const activeSession = await getAuthSession();
        const { biometricReady } = await refreshBiometricState();

        if (!activeSession) {
            throw new Error("Faça login primeiro para ativar a biometria.");
        }

        if (!biometricReady) {
            throw new Error("Nenhuma biometria cadastrada foi encontrada neste dispositivo.");
        }

        await setBiometricCredentials({
            email: payload.email.trim(),
            password: payload.password,
        });

        setIsBiometricEnabled(true);

        return true;
    }

    const value = useMemo<AuthContextValue>(() => ({
        token,
        isAuthenticated: !!token,
        isLoading,
        isBiometricAvailable,
        isBiometricEnabled,
        isAuthRedirectPaused,
        pauseAuthRedirect,
        resumeAuthRedirect,
        shouldOfferBiometricEnrollment,
        signIn,
        signInWithBiometrics,
        signUp,
        enableBiometricLogin,
        signOut,
    }), [token, isLoading, isBiometricAvailable, isBiometricEnabled, isAuthRedirectPaused]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
    return ctx;
}
