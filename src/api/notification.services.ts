import { api } from "./api.services";

export interface Notification {
  name: string;
  subject: string;
  type?: string;
  email_content: string | null;
  document_type?: string;
  document_name?: string;
  from_user?: string;
  creation: string;
  read: number;
}

export interface NotificationResponse {
  message: {
    status?: string;
    user?: string;
    unread_count?: number;
    count?: number;
    data: Notification[];
  };
}

export const getNotifications = async (ownerEmail: string): Promise<NotificationResponse> => {
  try {
    const response = await api.get(
      `method/stridenex_app.api_stridenex_app.notification.get_notifications?owner_email=${encodeURIComponent(ownerEmail)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string, ownerEmail: string): Promise<void> => {
  try {
    await api.post(
      `method/stridenex_app.api_stridenex_app.notification.mark_as_seen?notification_name=${encodeURIComponent(notificationId)}&owner_email=${encodeURIComponent(ownerEmail)}`
    );
  } catch (postErr: any) {
    if (postErr?.response?.status === 405) {
      await api.get(
        `method/stridenex_app.api_stridenex_app.notification.mark_as_seen?notification_name=${encodeURIComponent(notificationId)}&owner_email=${encodeURIComponent(ownerEmail)}`
      );
    } else {
      console.error("Error marking notification as read:", postErr);
      throw postErr;
    }
  }
};

// Backwards-compatible alias for existing callers
export const markNotificationAsSeen = markNotificationAsRead;

export const markAllNotificationsAsRead = async (ownerEmail: string): Promise<void> => {
  try {
    await api.post(
      `method/stridenex_app.api_stridenex_app.notification.mark_all_as_seen?owner_email=${encodeURIComponent(ownerEmail)}`
    );
  } catch (postErr: any) {
    if (postErr?.response?.status === 405) {
      await api.get(
        `method/stridenex_app.api_stridenex_app.notification.mark_all_as_seen?owner_email=${encodeURIComponent(ownerEmail)}`
      );
    } else {
      console.error("Error marking all notifications as read:", postErr);
      throw postErr;
    }
  }
};
