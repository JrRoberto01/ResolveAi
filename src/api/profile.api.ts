import { getUser, User } from './auth.api';
import { api } from './client';
import { ApiOccurrence, getOccurrences, getSupportedOccurrences } from './occurrences.api';

export type ProfileOccurrence = ApiOccurrence;

export type ProfileSummary = {
  user: User & {
    city?: string | null;
    state?: string | null;
    createdAt?: string | null;
  };
  stats: {
    occurrences: number;
    supports: number;
  };
  occurrences: ProfileOccurrence[];
};

export type PublicProfileAuthor = {
  id: number;
  name: string;
  image?: string | null;
};

export async function getProfile(): Promise<ProfileSummary> {
  const [user, occurrences, supportedOccurrences] = await Promise.all([
    getUser(),
    getOccurrences(),
    getSupportedOccurrences(),
  ]);

  const userOccurrences = occurrences.filter((occurrence) => (
    occurrence.authorId === user.id || occurrence.canEdit
  ));

  return {
    user,
    stats: {
      occurrences: userOccurrences.length,
      supports: supportedOccurrences.length,
    },
    occurrences: userOccurrences,
  };
}

export async function getPublicProfile(author: PublicProfileAuthor): Promise<ProfileSummary> {
  const occurrences = await getOccurrences();
  const userOccurrences = occurrences.filter((occurrence) => occurrence.authorId === author.id);
  let publicUser: Partial<User> & { city?: string | null; state?: string | null; createdAt?: string | null } = {};

  try {
    const { data } = await api.get<Partial<User> & { city?: string | null; state?: string | null; createdAt?: string | null }>(
      `/users/${author.id}`,
    );
    publicUser = data;
  } catch {
    publicUser = {};
  }

  return {
    user: {
      id: author.id,
      name: publicUser.name ?? author.name,
      email: publicUser.email ?? '',
      image: publicUser.image ?? author.image ?? '',
      points: publicUser.points ?? 0,
      score: publicUser.score ?? 0,
      group: publicUser.group,
      city: publicUser.city,
      state: publicUser.state,
      createdAt: publicUser.createdAt,
    },
    stats: {
      occurrences: userOccurrences.length,
      supports: userOccurrences.reduce((total, occurrence) => total + occurrence.supportCount, 0),
    },
    occurrences: userOccurrences,
  };
}

export async function updateProfileImage(image: string): Promise<User> {
  const { data } = await api.patch<User>('/auth/me', { image });
  return data;
}

export async function updateProfileName(name: string): Promise<User> {
  const { data } = await api.patch<User>('/auth/me', { name });
  return data;
}

export async function updateProfilePassword(currentPassword: string, password: string) {
  const { data } = await api.patch<{ message?: string }>('/auth/me', {
    currentPassword,
    password,
  });

  return data;
}
