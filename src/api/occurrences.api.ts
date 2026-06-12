import { api } from './client';

export type OccurrenceStatus = 'IN_ANALYSIS' | 'RESOLVED' | 'REJECTED';

export type ApiOccurrence = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  status: OccurrenceStatus;
  anonymous: boolean;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  photos: string[];
  authorId: number | null;
  canEdit: boolean;
  supportCount: number;
  commentsCount: number;
  supportedByMe: boolean;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
};

export type ApiOccurrenceComment = {
  id: number;
  content: string;
  occurrenceId: number;
  userId: number;
  author: {
    id: number;
    name: string;
    image: string | null;
  };
  canEdit: boolean;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
};

export type OccurrencePayload = {
  title: string;
  description?: string;
  category: string;
  status?: OccurrenceStatus;
  anonymous?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  photos?: string[];
};

export type OccurrenceFilters = {
  search?: string;
  category?: string;
  status?: OccurrenceStatus;
};

export async function getOccurrences(filters?: OccurrenceFilters) {
  const { data } = await api.get<ApiOccurrence[]>('/occurrences', {
    params: filters,
  });

  return data;
}

export async function getSupportedOccurrences() {
  const { data } = await api.get<ApiOccurrence[]>('/occurrences/supported/me');
  return data;
}

export async function createOccurrence(payload: OccurrencePayload) {
  const { data } = await api.post<ApiOccurrence>('/occurrences', payload);
  return data;
}

export async function updateOccurrence(id: number, payload: Partial<OccurrencePayload>) {
  const { data } = await api.patch<ApiOccurrence>(`/occurrences/${id}`, payload);
  return data;
}

export async function deleteOccurrence(id: number) {
  const { data } = await api.delete<{ message: string }>(`/occurrences/${id}`);
  return data;
}

export async function toggleOccurrenceSupport(id: number) {
  const { data } = await api.post<{
    supported: boolean;
    occurrence: ApiOccurrence;
  }>(`/occurrences/${id}/support`);

  return data;
}

export async function getOccurrenceComments(occurrenceId: number) {
  const { data } = await api.get<ApiOccurrenceComment[]>(`/occurrences/${occurrenceId}/comments`);
  return data;
}

export async function createOccurrenceComment(occurrenceId: number, content: string) {
  const { data } = await api.post<ApiOccurrenceComment>(`/occurrences/${occurrenceId}/comments`, {
    content,
  });

  return data;
}

export async function updateOccurrenceComment(occurrenceId: number, commentId: number, content: string) {
  const { data } = await api.patch<ApiOccurrenceComment>(`/occurrences/${occurrenceId}/comments/${commentId}`, {
    content,
  });

  return data;
}

export async function deleteOccurrenceComment(occurrenceId: number, commentId: number) {
  const { data } = await api.delete<{ message: string }>(`/occurrences/${occurrenceId}/comments/${commentId}`);
  return data;
}
