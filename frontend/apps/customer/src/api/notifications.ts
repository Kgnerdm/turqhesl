import { api } from './axios';

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_status_changed'
  | 'booking_cancelled'
  | 'booking_new'
  | 'provider_verified'
  | 'provider_rejected'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'system';

export interface AppNotification {
  id: number;
  notification_type: NotificationType;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  data: AppNotification[];
  unread_count: number;
}

export const listNotifications = async (
  unreadOnly = false,
  limit = 20,
): Promise<NotificationListResponse> => {
  const { data } = await api.get<NotificationListResponse>('/notifications/', {
    params: { ...(unreadOnly ? { unread: 'true' } : {}), limit },
  });
  return data;
};

export const getUnreadCount = async (): Promise<number> => {
  const { data } = await api.get<{ unread_count: number }>('/notifications/unread-count/');
  return data.unread_count;
};

export const markRead = async (id: number): Promise<AppNotification> => {
  const { data } = await api.post<AppNotification>(`/notifications/${id}/mark-read/`);
  return data;
};

export const markAllRead = async (): Promise<{ marked_read: number }> => {
  const { data } = await api.post<{ marked_read: number }>('/notifications/mark-all-read/');
  return data;
};
