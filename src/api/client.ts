import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getToken } from "../auth/tokenStorage";

// usar http://192.168.10.132:3000 na Maquina Real
// usar http://10.0.2.2:3000 no Android emulator
export const api = axios.create({
    baseURL: "http://192.168.10.132:3000",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

let onUnauthorized: null | (() => Promise<void> | void) = null;

export function setOnUnauthorized(handler: () => Promise<void> | void) {
    onUnauthorized = handler;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<any>) => {
        const status = error.response?.status;

        if (status === 401) {
            const url = (error.config?.url ?? "").toLowerCase();
            const isAuthRoute =
                url.includes("/auth/signin") ||
                url.includes("/auth/signup");

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
    }
);