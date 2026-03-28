import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  AuthSession,
  clearAuthSession,
  getAuthSession,
  getToken,
  setAuthSession,
} from "../auth/tokenStorage";

// usar http://192.168.10.132:3000 na Maquina Real
// usar http://10.0.2.2:3000 no Android emulator
const API_BASE_URL = "http://192.168.10.132:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let onUnauthorized: null | (() => Promise<void> | void) = null;
let refreshPromise: Promise<AuthSession | null> | null = null;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export function setOnUnauthorized(handler: () => Promise<void> | void) {
  onUnauthorized = handler;
}

export async function refreshAuthSession(sessionOverride?: AuthSession) {
  const currentSession = sessionOverride ?? await getAuthSession();

  if (!currentSession?.refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { data } = await refreshApi.post<{
          accessToken: string;
          refreshToken?: string;
        }>("/auth/refresh", {
          refreshToken: currentSession.refreshToken,
        });

        const nextSession = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? currentSession.refreshToken,
        } satisfies AuthSession;

        await setAuthSession(nextSession);
        api.defaults.headers.common.Authorization = `Bearer ${nextSession.accessToken}`;
        return nextSession;
      } catch {
        await clearAuthSession();
        delete api.defaults.headers.common.Authorization;
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (status === 401) {
      const url = (originalRequest?.url ?? "").toLowerCase();
      const isAuthRoute =
        url.includes("/auth/signin") ||
        url.includes("/auth/signup") ||
        url.includes("/auth/refresh");

      if (!isAuthRoute && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        const nextSession = await refreshAuthSession();

        if (nextSession) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextSession.accessToken}`;
          return api(originalRequest);
        }
      }

      if (!isAuthRoute) {
        await onUnauthorized?.();
      }
    }

    if (error.response) {
      const message =
        error.response.data?.message ??
        error.response.data?.error ??
        `Erro HTTP ${status}`;

      (error as any).friendlyMessage = message;
      return Promise.reject(error);
    }

    if (error.request) {
      return Promise.reject(new Error("Erro de comunicação com o servidor"));
    }

    return Promise.reject(new Error("Erro inesperado"));
  },
);
