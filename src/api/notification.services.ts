import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, BASE_URL } from "./api.services";

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

export const getNotifications = async (
  ownerEmail: string,
  limit: number = 20,
  unreadOnly: 0 | 1 = 0
): Promise<NotificationResponse> => {
  try {
    const response = await api.get(
      `method/stridenex_app.api_stridenex_app.notification.get_notifications?owner_email=${encodeURIComponent(ownerEmail)}&limit=${limit}&unread_only=${unreadOnly}`
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

export const registerDeviceToken = async (
  fcmToken: string,
  ownerEmail?: string
): Promise<boolean> => {
  try {
    const effectiveEmail =
      ownerEmail ||
      (await AsyncStorage.getItem("userName")) ||
      (await AsyncStorage.getItem("userEmail")) ||
      "";

    const storedToken = await AsyncStorage.getItem("token");

    // Guard: Do not register if user is not logged in / email is empty
    if (!effectiveEmail || !storedToken || storedToken === "dummy-token") {
      console.log("[save_device_token] User is not logged in. Skipping API call.");
      return false;
    }

    const payload: {
      fcm_token: string;
      platform: string;
      owner_email: string;
    } = {
      fcm_token: fcmToken,
      platform: Platform.OS, // "android" or "ios"
      owner_email: effectiveEmail,
    };

    console.log("==========================================");
    console.log("[save_device_token] CALLING API:");
    console.log("[save_device_token] URL:", `${BASE_URL}method/stridenex_app.api_stridenex_app.notification.save_device_token`);
    console.log("[save_device_token] PAYLOAD:", JSON.stringify(payload, null, 2));
    console.log("==========================================");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `token ${storedToken.trim()}`,
    };

    const response = await api.post(
      "method/stridenex_app.api_stridenex_app.notification.save_device_token",
      payload,
      { headers }
    );

    console.log("[save_device_token] SUCCESS RESPONSE:", response?.data);
    return true;
  } catch (error: any) {
    console.warn(
      "[save_device_token] Failed to register device token with backend:",
      error?.response?.data || error?.message || error
    );
    throw error;
  }
};

export const unregisterDeviceToken = async (
  fcmToken?: string,
  ownerEmail?: string
): Promise<boolean> => {
  try {
    const effectiveEmail =
      ownerEmail ||
      (await AsyncStorage.getItem("userName")) ||
      (await AsyncStorage.getItem("userEmail")) ||
      "";

    if (!fcmToken) return false;

    const payload = {
      fcm_token: fcmToken,
      platform: Platform.OS,
      owner_email: effectiveEmail,
    };

    console.log("[unregisterDeviceToken] De-registering device token for user:", effectiveEmail || "anonymous");

    const storedToken = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (storedToken) {
      headers["Authorization"] = `token ${storedToken.trim()}`;
    }

    try {
      await api.post(
        "method/stridenex_app.api_stridenex_app.notification.delete_device_token",
        payload,
        { headers }
      );
    } catch {
      // Backend may not implement delete_device_token; graceful fallback
    }
    return true;
  } catch (error: any) {
    console.warn("[unregisterDeviceToken] Error unregistering token:", error?.message || error);
    return false;
  }
};
