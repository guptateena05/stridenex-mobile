import { api } from "./api.services";

export const getNotifications = async (ownerEmail: string) => {
  try {
    const response = await api.get(
      'method/stridenex_app.api_stridenex_app.notification.get_notifications',
      { params: { owner_email: ownerEmail } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationAsSeen = async (notificationName: string, ownerEmail: string) => {
  try {
    const response = await api.get(
      'method/stridenex_app.api_stridenex_app.notification.mark_as_seen',
      { params: { notification_name: notificationName, owner_email: ownerEmail } }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as seen:", error);
    throw error;
  }
};
