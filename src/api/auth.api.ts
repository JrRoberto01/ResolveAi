import { api } from './client';

export enum UserGroup {
  DEFAULT = 'DEFAULT',
  PRO = 'PRO',
  ADMIN = 'ADMIN',
}

export type User = {
  id: number;
  name: string;
  email: string;
  image: string;
  points: number;
  score: number;
  group?: UserGroup;
};

export type SignInPayload = { email: string; password: string };
export type SignUpPayload = { name: string; email: string; password: string };
export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function getUser(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  const { data } = await api.post<SignInResponse>('/auth/signin', payload);
  return data;
}

export async function signUp(payload: SignUpPayload) {
  const { data } = await api.post('/auth/signup', payload);
  return data;
}
