import { api } from './client';

export type NotificationType =
  | 'SUPPORTED_OCCURRENCE_RESOLVED'
  | 'OCCURRENCE_COMMENTED'
  | 'OCCURRENCE_SUPPORTED'
  | 'PASSWORD_CHANGED';

export type ApiNotification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  occurrenceId: number | null;
  occurrence: {
    id: number;
    title: string;
    status: string;
    address: string | null;
  } | null;
  readAt: string | null;
  createdAt: string;
};

export async function getNotifications() {
  const { data } = await api.get<ApiNotification[]>('/notifications');
  return data;
}

export async function getUnreadNotificationCount() {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markNotificationAsRead(id: number) {
  const { data } = await api.patch<ApiNotification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsAsRead() {
  const { data } = await api.patch<{ updated: number }>('/notifications/read-all');
  return data;
}
