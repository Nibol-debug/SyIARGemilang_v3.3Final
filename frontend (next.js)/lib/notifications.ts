import { apiRequest } from './api';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface NotificationMeta {
  total: number;
  page: number;
  limit: number;
  last_page: number;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: NotificationMeta;
}

export async function getNotifications(page: number = 1, limit: number = 10): Promise<NotificationsResponse> {
  return apiRequest(`/notifications?page=${page}&limit=${limit}`);
}

export async function getUnreadNotifications(limit: number = 5): Promise<Notification[]> {
  return apiRequest(`/notifications/unread?limit=${limit}`);
}

export async function getUnreadCount(): Promise<{ count: number }> {
  return apiRequest('/notifications/unread-count');
}

export async function markAsRead(id: string): Promise<Notification> {
  return apiRequest(`/notifications/${id}/mark-as-read`, {
    method: 'PATCH',
  });
}

export async function markAllAsRead(): Promise<void> {
  return apiRequest('/notifications/mark-all-as-read', {
    method: 'POST',
  });
}

export async function deleteNotification(id: string): Promise<void> {
  return apiRequest(`/notifications/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteAllNotifications(): Promise<void> {
  return apiRequest('/notifications', {
    method: 'DELETE',
  });
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'payment':
      return '💰';
    case 'exam':
      return '📝';
    case 'announcement':
      return '📢';
    case 'attendance':
      return '📅';
    case 'ppdb':
      return '🎓';
    default:
      return '🔔';
  }
}

export function getNotificationColor(type: string): string {
  switch (type) {
    case 'payment':
      return 'bg-green-100 border-green-300';
    case 'exam':
      return 'bg-blue-100 border-blue-300';
    case 'announcement':
      return 'bg-purple-100 border-purple-300';
    case 'attendance':
      return 'bg-orange-100 border-orange-300';
    case 'ppdb':
      return 'bg-pink-100 border-pink-300';
    default:
      return 'bg-gray-100 border-gray-300';
  }
}
