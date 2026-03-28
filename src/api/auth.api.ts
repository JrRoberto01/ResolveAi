import { api } from "./client";

export enum UserGroup {
    DEFAULT = "DEFAULT",
    PRO = "PRO",
    ADMIN = "ADMIN",
}

export type User = {
    id: number,
    name: string,
    email: string,
    image: string,
    points: number,
    score: number,
    group?: UserGroup,
};

export type UpdateUser = {
    name?: string;
    email?: string;
    image?: string;
    password?: string;
    points?: number;
    score?: number;
    group?: UserGroup;
}

export type SignInPayload = { email: string; password: string };
export type SignUpPayload = { name: string; email: string; password: string };
export type UpdateUserResponse = { user: User }

export type GetUserResponse = { user: User }
type SignInResponse = { accessToken: string };

export async function getUser(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
}

export async function updateUser(id: number, payload: UpdateUser): Promise<UpdateUserResponse> {
    const { data } = await api.patch<UpdateUserResponse>(`/auth/${id}`, payload);
    return data
}

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
    const { data } = await api.post<SignInResponse>("/auth/signin", payload);
    return data;
}

export async function signUp(payload: SignUpPayload) {
    const { data } = await api.post("/auth/signup", payload);
    return data;
}