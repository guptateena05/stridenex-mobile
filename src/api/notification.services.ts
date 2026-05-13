import { api } from "./api.services";

export const getNotifications = async (module: string) => {
  try {
    const response = await api.get(
      'method/stridenex_app.api_stridenex_app.notification.get_notifications',
      { params: { module } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (name: string) => {
  try {
    // Note: The user didn't provide a mark-as-read API, 
    // but typically it follows a similar pattern if needed.
    // We'll keep it as a placeholder or update it if the user provides it.
    const response = await api.post(
      'method/stridenex_app.api_stridenex_app.notification.mark_as_read',
      { name }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
