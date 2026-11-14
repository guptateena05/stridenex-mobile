import {
  Platform,
  PermissionsAndroid,
  Alert,
  DeviceEventEmitter,
  AppState,
  AppStateStatus,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  setBackgroundMessageHandler as setFirebaseBackgroundHandler,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
  AuthorizationStatus,
  RemoteMessage,
} from '@react-native-firebase/messaging';
import { registerDeviceToken } from '@/api/notification.services';

// Storage keys for caching and deduplication
export const FCM_TOKEN_STORAGE_KEY = 'fcm_device_token';
export const FCM_LAST_SYNCED_TOKEN_KEY = 'fcm_last_synced_token';
export const FCM_LAST_SYNCED_USER_KEY = 'fcm_last_synced_user';
export const FCM_PENDING_SYNC_KEY = 'fcm_pending_sync';

// Concurrency lock to avoid parallel duplicate registrations
let isSyncInProgress = false;

// Active listeners references
let tokenRefreshUnsubscribe: (() => void) | null = null;
let appStateSubscription: { remove: () => void } | null = null;

/**
 * Safely retrieve the Firebase Messaging instance.
 * Returns null if the native binary has not yet been rebuilt with Firebase modules.
 */
export const getSafeMessaging = () => {
  try {
    return getMessaging();
  } catch (err) {
    // Native module not registered in the currently running binary
    return null;
  }
};

/**
 * Request notification permissions from the user.
 * Android 13+ (API 33+) requires runtime POST_NOTIFICATIONS permission.
 * iOS requires APNs authorization via Firebase Messaging.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Enable Notifications',
            message:
              'StrideNex needs notification permissions to keep you updated on courses, events, and jobs.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    if (Platform.OS === 'ios') {
      const messaging = getSafeMessaging();
      if (!messaging) return false;

      const authStatus = await requestPermission(messaging, {
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      });

      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      console.log(
        '[Push] iOS Notification permission status:',
        authStatus,
        'enabled:',
        enabled
      );
      return enabled;
    }

    return false;
  } catch (error) {
    console.error('[Push] Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * 1 & 2. Retrieve existing FCM device token without generating a new one.
 * - Checks local cache first.
 * - Uses getToken(messaging) which returns the current persistent token.
 * - Caches the token locally in AsyncStorage.
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const messaging = getSafeMessaging();
    if (!messaging) {
      return await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    }

    if (Platform.OS === 'ios') {
      try {
        const isRegistered = await isDeviceRegisteredForRemoteMessages(messaging);
        if (!isRegistered) {
          await registerDeviceForRemoteMessages(messaging);
          console.log('[Push] iOS device successfully registered for remote messages');
        }
      } catch (regError) {
        console.warn('[Push] iOS registerDeviceForRemoteMessages warning:', regError);
      }
    }

    // getToken() returns the existing device token from Firebase; does not generate a new one
    const token = await getToken(messaging);
    if (token) {
      console.log('[Push] Existing FCM Device Token retrieved:', token);
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      return token;
    }

    return await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn('[Push] Error retrieving FCM device token:', error);
    return await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  }
};

/**
 * 2, 3, 5 & 6. Synchronize the FCM token with the backend server.
 * - Deduplicates: Compares activeToken with lastSyncedToken AND email with lastSyncedUser.
 * - If the same user logs in again on the same device with the same token: SKIPS API call (0 duplicate calls).
 * - Only calls save_device_token if:
 *     a) Token is not yet registered,
 *     b) Token has changed (e.g. refreshed), or
 *     c) A different user has logged in on this device.
 * - Retries up to 3 times on transient network failures.
 */
export const syncTokenWithBackend = async (
  token?: string | null,
  userEmail?: string
): Promise<boolean> => {
  if (isSyncInProgress) {
    console.log('[Push] Token sync already in progress. Skipping parallel call.');
    return false;
  }

  isSyncInProgress = true;
  try {
    const activeToken =
      token ||
      (await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY)) ||
      (await getFcmToken());

    if (!activeToken) {
      console.log('[Push] No FCM token available to sync.');
      return false;
    }

    const email =
      userEmail ||
      (await AsyncStorage.getItem('userName')) ||
      (await AsyncStorage.getItem('userEmail')) ||
      '';

    const storedAuthToken = await AsyncStorage.getItem('token');

    // Only register device token if user is authenticated and has a valid email
    if (!email || !storedAuthToken || storedAuthToken === 'dummy-token') {
      console.log(
        '[Push] User is not authenticated. Skipping device token registration.'
      );
      return false;
    }

    // Requirement 2, 3 & 5: Compare with previously stored token and user
    const lastSyncedToken = await AsyncStorage.getItem(FCM_LAST_SYNCED_TOKEN_KEY);
    const lastSyncedUser = await AsyncStorage.getItem(FCM_LAST_SYNCED_USER_KEY);

    if (activeToken === lastSyncedToken && email === lastSyncedUser) {
      console.log(
        `[Push] Token already registered for ${email} on this device. Reusing existing registration (0 API calls).`
      );
      return true;
    }

    console.log(
      `[Push] Registration required (previous user: "${lastSyncedUser || 'none'}", current user: "${email}"). Calling save_device_token...`
    );

    // Graceful retry with backoff for network resilience
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1500, 3000, 6000];
    let syncSuccess = false;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `[Push] Registering device token (attempt ${attempt}/${MAX_RETRIES}) for user: ${email}`
        );
        const registered = await registerDeviceToken(activeToken, email);
        if (registered) {
          syncSuccess = true;
          break;
        }
      } catch (err: any) {
        console.warn(
          `[Push] Token registration attempt ${attempt}/${MAX_RETRIES} failed:`,
          err?.message || err
        );
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(() => resolve(null), RETRY_DELAYS[attempt - 1])
          );
        }
      }
    }

    if (syncSuccess) {
      // Record last successfully synced token & user
      await AsyncStorage.setItem(FCM_LAST_SYNCED_TOKEN_KEY, activeToken);
      await AsyncStorage.setItem(FCM_LAST_SYNCED_USER_KEY, email);
      await AsyncStorage.removeItem(FCM_PENDING_SYNC_KEY);
      console.log(
        `[Push] Token successfully registered and stored for ${email}.`
      );
      return true;
    } else {
      await AsyncStorage.setItem(FCM_PENDING_SYNC_KEY, 'true');
      console.warn(
        '[Push] All registration attempts failed. Flagged pending sync for retry.'
      );
      return false;
    }
  } catch (error) {
    console.warn('[Push] Unexpected error during token synchronization:', error);
    return false;
  } finally {
    isSyncInProgress = false;
  }
};

/**
 * 1, 2 & 5. Post-login helper:
 * - Ensures permission.
 * - Retrieves existing FCM token without generating a new one.
 * - Reuses existing backend registration if the same user is logging in on the same device.
 */
export const handlePostLoginFcmToken = async (
  userEmail?: string
): Promise<string | null> => {
  try {
    console.log('[Push] Post-login: Checking existing FCM token for user:', userEmail);
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('[Push] Notification permission not granted upon login');
      return null;
    }

    const token = await getFcmToken();
    if (token) {
      // syncTokenWithBackend will check if already registered for this user and skip API call if unchanged
      await syncTokenWithBackend(token, userEmail);
    }

    setupTokenRefreshListener(userEmail);

    return token;
  } catch (err) {
    console.warn('[Push] Error handling post-login FCM token:', err);
    return null;
  }
};

/**
 * 4. Use messaging().onTokenRefresh() to register a new token only when FCM actually refreshes it.
 */
export const setupTokenRefreshListener = (userEmail?: string): (() => void) => {
  try {
    if (tokenRefreshUnsubscribe) {
      tokenRefreshUnsubscribe();
      tokenRefreshUnsubscribe = null;
    }

    const messaging = getSafeMessaging();
    if (!messaging) return () => {};

    tokenRefreshUnsubscribe = onTokenRefresh(messaging, async (newToken: string) => {
      console.log('[Push] FCM token refresh event received:', newToken);

      const previousToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      if (previousToken === newToken) {
        console.log('[Push] Refreshed token is identical to cached token. No-op.');
        return;
      }

      console.log('[Push] FCM token has changed. Updating stored token and backend registration...');
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, newToken);

      // Register the updated token with the backend
      await syncTokenWithBackend(newToken, userEmail);
    });

    return tokenRefreshUnsubscribe;
  } catch (error) {
    console.warn('[Push] Error setting up token refresh listener:', error);
    return () => {};
  }
};

/**
 * 5. On logout:
 * - Detaches active listeners.
 * - Does NOT delete the token on Firebase servers or wipe local caches,
 *   enabling the same user to log back in without creating duplicate registrations.
 */
export const handleLogoutPushCleanup = async (): Promise<void> => {
  try {
    console.log('[Push] Logging out: detaching push notification listeners...');

    // Detach token refresh listener while logged out
    if (tokenRefreshUnsubscribe) {
      tokenRefreshUnsubscribe();
      tokenRefreshUnsubscribe = null;
    }

    // Detach AppState listener while logged out
    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }

    // We intentionally keep FCM_TOKEN_STORAGE_KEY, FCM_LAST_SYNCED_TOKEN_KEY, and
    // FCM_LAST_SYNCED_USER_KEY in AsyncStorage so that if the same user logs in again
    // on this device, the existing registration is reused without extra API calls.
    console.log('[Push] Logout cleanup complete. Device token preserved for re-login reuse.');
  } catch (err) {
    console.warn('[Push] Error during logout token cleanup:', err);
  }
};

/**
 * 7. Retry any pending token sync that failed previously (e.g. device was offline or server was unavailable).
 */
export const retryPendingTokenSync = async (userEmail?: string): Promise<void> => {
  try {
    const isPending = await AsyncStorage.getItem(FCM_PENDING_SYNC_KEY);
    const token = await AsyncStorage.getItem('token');
    const email =
      userEmail ||
      (await AsyncStorage.getItem('userName')) ||
      (await AsyncStorage.getItem('userEmail'));

    if (isPending === 'true' && token && token !== 'dummy-token' && email) {
      console.log('[Push] Retrying pending token sync for authenticated user...');
      await syncTokenWithBackend(undefined, email);
    }
  } catch (err) {
    console.warn('[Push] Error retrying pending token sync:', err);
  }
};

/**
 * 7. Set up AppState change listener to automatically retry pending syncs when app resumes to foreground.
 */
export const setupAppStateRetryListener = (userEmail?: string): (() => void) => {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }

  appStateSubscription = AppState.addEventListener(
    'change',
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        retryPendingTokenSync(userEmail);
      }
    }
  );

  return () => {
    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }
  };
};

/**
 * Set up foreground notification listener.
 * Emits 'NOTIFICATION_RECEIVED' event so UI badges / lists refresh automatically,
 * and shows an in-app Alert if notification has a title and body.
 */
export const setupForegroundListener = (
  onNotification?: (message: RemoteMessage) => void
): (() => void) => {
  try {
    const messaging = getSafeMessaging();
    if (!messaging) return () => {};

    const unsubscribe = onMessage(messaging, async (remoteMessage: RemoteMessage) => {
      console.log('[Push] Foreground notification received:', remoteMessage);

      // Notify dashboard/header components to refresh notification counts
      DeviceEventEmitter.emit('NOTIFICATION_RECEIVED', remoteMessage);

      if (onNotification) {
        onNotification(remoteMessage);
      } else if (remoteMessage.notification?.title || remoteMessage.notification?.body) {
        Alert.alert(
          remoteMessage.notification?.title || 'StrideNex Notification',
          remoteMessage.notification?.body || '',
          [{ text: 'OK', style: 'default' }]
        );
      }
    });

    return unsubscribe;
  } catch (error) {
    console.warn('[Push] Error setting up foreground message listener:', error);
    return () => {};
  }
};

/**
 * Set up background and quit-state notification opened listeners.
 * Invoked when user taps a notification from background or when launching app from quit state.
 */
export const setupNotificationOpenedListener = (
  onNotificationOpened: (message: RemoteMessage) => void
): (() => void) => {
  try {
    const messaging = getSafeMessaging();
    if (!messaging) return () => {};

    // Check if app was opened from quit state by tapping a notification
    getInitialNotification(messaging)
      .then((remoteMessage: RemoteMessage | null) => {
        if (remoteMessage) {
          console.log('[Push] App opened from quit state via notification:', remoteMessage);
          onNotificationOpened(remoteMessage);
        }
      })
      .catch((err) => console.warn('[Push] Error getting initial notification:', err));

    // Listen for notification taps when app is in background
    const unsubscribe = onNotificationOpenedApp(messaging, (remoteMessage: RemoteMessage) => {
      console.log('[Push] App opened from background via notification:', remoteMessage);
      onNotificationOpened(remoteMessage);
    });

    return unsubscribe;
  } catch (error) {
    console.warn('[Push] Error setting up notification opened listener:', error);
    return () => {};
  }
};

/**
 * Background message handler to be registered in index.js outside React component tree.
 */
export const setBackgroundMessageHandler = (): void => {
  try {
    const messaging = getSafeMessaging();
    if (!messaging) return;

    setFirebaseBackgroundHandler(messaging, async (remoteMessage: RemoteMessage) => {
      console.log('[Push] Background notification received:', remoteMessage.messageId);
    });
  } catch (error) {
    console.warn('[Push] Error setting background message handler:', error);
  }
};

/**
 * Full push notification initialization helper.
 * Requests permission, retrieves FCM token, syncs with backend, and binds all listeners.
 */
export const initializePushNotifications = async (
  userEmail?: string,
  onNotificationOpened?: (message: RemoteMessage) => void
): Promise<string | null> => {
  try {
    const messaging = getSafeMessaging();
    if (!messaging) {
      console.log(
        '[Push] Native Firebase module not present in current binary; will activate once app binary is recompiled.'
      );
      return null;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('[Push] Notification permission not granted');
      return null;
    }

    const token = await getFcmToken();
    if (token) {
      await syncTokenWithBackend(token, userEmail);
    }

    setupTokenRefreshListener(userEmail);
    setupAppStateRetryListener(userEmail);

    if (onNotificationOpened) {
      setupNotificationOpenedListener(onNotificationOpened);
    }

    return token;
  } catch (error) {
    console.error('[Push] Failed to initialize push notifications:', error);
    return null;
  }
};
