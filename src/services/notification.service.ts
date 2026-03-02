import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { NotificationsResponse, UserNotification } from "@/types/notification";

export interface NotificationFilters {
  per_page?: number;
  unread_only?: boolean;
}

export const notificationService = {
  getAll: async (filters?: NotificationFilters): Promise<NotificationsResponse> => {
    const params = new URLSearchParams();
    if (filters?.per_page) params.append("per_page", filters.per_page.toString());
    if (filters?.unread_only) params.append("unread_only", "true");

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.notifications.list}?${queryString}`
      : API_ENDPOINTS.notifications.list;

    const response = await api.get<NotificationsResponse>(url);
    return response.data;
  },

  markAsRead: async (id: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(API_ENDPOINTS.notifications.markAsRead(id));
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(API_ENDPOINTS.notifications.markAllAsRead);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(API_ENDPOINTS.notifications.delete(id));
    return response.data;
  },
};

