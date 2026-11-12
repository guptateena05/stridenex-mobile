import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Pressable,
  Dimensions,
  RefreshControl,
  Linking
} from 'react-native';
import {
  LogOut,
  Bell,
  BellRing,
  Menu,
  ChevronLeft,
  X,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import Logo from '@/assets/images/Logo.png';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification
} from '@/api/notification.services';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const POPOVER_WIDTH = Math.min(SCREEN_WIDTH - 24, 390);

const isHtmlContent = (content?: string | null): boolean => {
  if (!content) return false;
  return /<[a-z][\s\S]*>/i.test(content);
};

const preprocessHtml = (rawHtml: string): string => {
  if (!rawHtml) return "";
  let processed = rawHtml;

  // Replace relative image URLs with absolute URLs
  processed = processed.replace(
    /(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi,
    (match, p1, url, p3) => {
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return match;
      }
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      return `${p1}https://devstridenex.quantcloud.in${cleanPath}${p3}`;
    }
  );

  // Replace background-image: url(...)
  processed = processed.replace(
    /url\(["']?([^"')]+)["']?\)/gi,
    (match, url) => {
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return match;
      }
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      return `url("https://devstridenex.quantcloud.in${cleanPath}")`;
    }
  );

  // Replace relative anchor links with absolute URLs
  processed = processed.replace(
    /(<a[^>]+href=["'])([^"']+)(["'][^>]*>)/gi,
    (match, p1, url, p3) => {
      if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('#') ||
        url.startsWith('javascript:')
      ) {
        return match;
      }
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      return `${p1}https://devstridenex.quantcloud.in${cleanPath}${p3}`;
    }
  );

  return processed;
};

const NotificationHtmlView = ({ html }: { html: string }) => {
  const [webViewHeight, setWebViewHeight] = useState(380);

  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background-color: transparent;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 13px;
            line-height: 19px;
            -webkit-text-size-adjust: 100%;
          }
          body {
            padding: 4px 2px;
          }
          p {
            margin: 0 0 6px 0;
            color: #1e293b;
            font-size: 13px;
            line-height: 19px;
          }
          strong, b {
            color: #0f0fbd;
            font-weight: 600;
          }
          table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse;
          }
          td, th {
            max-width: 100% !important;
            word-break: break-word;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            margin: 0 auto;
          }
          a {
            text-decoration: none;
          }
          .btn, button, a[style*="background"] {
            display: inline-block;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div id="html-root">${preprocessHtml(html)}</div>
        <script>
          function reportHeight() {
            var root = document.getElementById('html-root');
            var h = root ? Math.max(root.scrollHeight, root.offsetHeight) : document.body.scrollHeight;
            if (h > 0) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HEIGHT', height: h }));
            }
          }
          window.addEventListener('load', reportHeight);
          document.addEventListener('DOMContentLoaded', reportHeight);
          setTimeout(reportHeight, 150);
          setTimeout(reportHeight, 500);
          setTimeout(reportHeight, 1200);
          setTimeout(reportHeight, 2500);

          // Handle link clicks cleanly via postMessage to prevent WKWebView auto-redirect
          document.addEventListener('click', function(e) {
            var el = e.target;
            while (el && el !== document.body) {
              if (el.tagName && el.tagName.toLowerCase() === 'a' && el.href) {
                e.preventDefault();
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LINK_PRESS', url: el.href }));
                return;
              }
              el = el.parentElement;
            }
          }, true);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.htmlViewContainer, { height: webViewHeight }]}>
      <WebView
        originWhitelist={['*']}
        source={{
          html: wrappedHtml,
        }}
        style={{
          width: '100%',
          height: webViewHeight,
          backgroundColor: 'transparent'
        }}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data?.type === 'HEIGHT' && typeof data.height === 'number') {
              const newH = Math.max(140, Math.ceil(data.height) + 16);
              setWebViewHeight(newH);
            } else if (data?.type === 'LINK_PRESS' && typeof data.url === 'string') {
              const url = data.url;
              if (url && !url.startsWith('javascript:')) {
                Linking.openURL(url).catch((err) => {
                  console.error('Error opening notification link:', err);
                });
              }
            }
          } catch (e) {
            // ignore
          }
        }}
        onShouldStartLoadWithRequest={(request) => {
          // Allow about:blank, data URLs, and initial loads
          if (
            !request.url ||
            request.url === 'about:blank' ||
            request.url.startsWith('about:') ||
            request.url.startsWith('data:')
          ) {
            return true;
          }

          // If user explicitly clicked a link inside the WebView
          if (request.navigationType === 'click') {
            if (!request.url.startsWith('javascript:')) {
              Linking.openURL(request.url).catch((err) => {
                console.error('Error opening notification link:', err);
              });
            }
            return false;
          }

          // Allow non-click requests (initial render, subresources)
          return true;
        }}
      />
    </View>
  );
};

export const DashboardHeader = ({
  title,
  showMenu = true
}: {
  title?: string;
  showMenu?: boolean;
}) => {
  const { logout, role, userName } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [effectiveEmail, setEffectiveEmail] = useState<string>(userName || '');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Resolve user email from userName or stored userEmail in AsyncStorage
  useEffect(() => {
    let isMounted = true;
    if (userName) {
      setEffectiveEmail(userName);
    } else {
      AsyncStorage.getItem('userEmail')
        .then((stored) => {
          if (isMounted && stored) setEffectiveEmail(stored);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [userName]);

  const cleanNotificationMessage = (content?: string | null) => {
    if (!content) return "";
    let clean = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    clean = clean.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    clean = clean.replace(/<img[^>]*>/gi, '');
    clean = clean.replace(/<[^>]*>/g, ' ');
    clean = clean.replace(/&nbsp;/g, ' ');
    clean = clean.replace(/&amp;/g, '&');
    clean = clean.replace(/&quot;/g, '"');
    clean = clean.replace(/&#39;/g, "'");
    clean = clean.replace(/&lt;/g, '<');
    clean = clean.replace(/&gt;/g, '>');
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (subject?: string) => {
    const s = subject?.toLowerCase() || '';
    if (s.includes('event')) {
      return <CheckCircle2 size={16} color="#3B82F6" />;
    } else if (s.includes('warning') || s.includes('alert')) {
      return <AlertTriangle size={16} color="#F59E0B" />;
    } else if (s.includes('error') || s.includes('failed')) {
      return <XCircle size={16} color="#EF4444" />;
    } else if (s.includes('success') || s.includes('completed')) {
      return <CheckCircle2 size={16} color="#10B981" />;
    }
    return <Info size={16} color="#3B82F6" />;
  };

  const fetchNotifications = useCallback(async (isPullRefresh = false) => {
    if (!effectiveEmail) return;
    if (isPullRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await getNotifications(effectiveEmail, 20, 0);
      const notificationsData = response?.message?.data || [];
      setNotifications(notificationsData);
      setUnreadCount(
        response?.message?.unread_count ??
        notificationsData.filter((n: any) => n.read === 0).length
      );
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [effectiveEmail]);

  const fetchNotificationCount = useCallback(async () => {
    if (!effectiveEmail) return;
    try {
      const response = await getNotifications(effectiveEmail, 20, 0);
      const notificationsData = response?.message?.data || [];
      setUnreadCount(
        response?.message?.unread_count ??
        notificationsData.filter((n: any) => n.read === 0).length
      );
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  }, [effectiveEmail]);

  // Initial count fetch on mount
  useEffect(() => {
    if (effectiveEmail) {
      fetchNotificationCount();
    }
  }, [effectiveEmail, fetchNotificationCount]);

  // Fetch full notifications whenever popover opens
  useEffect(() => {
    if (showNotifications && effectiveEmail) {
      fetchNotifications();
    }
  }, [showNotifications, effectiveEmail, fetchNotifications]);

  // Periodic polling every 30s (matches web behavior)
  useEffect(() => {
    if (!effectiveEmail) return;
    const interval = setInterval(() => {
      if (showNotifications) {
        fetchNotifications();
      } else {
        fetchNotificationCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [showNotifications, effectiveEmail, fetchNotifications, fetchNotificationCount]);

  const toggleNotifications = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!effectiveEmail) return;
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.name === notificationId ? { ...n, read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await markNotificationAsRead(notificationId, effectiveEmail);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!effectiveEmail) return;
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
      setUnreadCount(0);
      await markAllNotificationsAsRead(effectiveEmail);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const renderNotificationItem = ({ item, index }: { item: Notification; index: number }) => {
    const isUnread = item.read === 0;
    const hasHtml = isHtmlContent(item.email_content);
    const cleanedMsg = !hasHtml ? cleanNotificationMessage(item.email_content) : "";

    return (
      <Animated.View entering={FadeInRight.delay(index * 30)}>
        <View
          style={[styles.notificationItem, isUnread && styles.unreadItem]}
        >
          <View style={styles.notifIconBox}>
            {getNotificationIcon(item.subject)}
          </View>

          <View style={styles.notifContent}>
            <View style={styles.notifHeaderRow}>
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={0.7}
                onPress={() => isUnread && handleMarkAsRead(item.name)}
              >
                <Text
                  style={[styles.notifTitle, isUnread && styles.unreadText]}
                  numberOfLines={2}
                >
                  {item.subject || 'Notification'}
                </Text>
              </TouchableOpacity>
              {isUnread && (
                <TouchableOpacity
                  style={styles.itemCheckBtn}
                  onPress={() => {
                    handleMarkAsRead(item.name);
                  }}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityLabel="Mark as read"
                >
                  <Check size={12} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {hasHtml ? (
              <NotificationHtmlView html={item.email_content!} />
            ) : cleanedMsg ? (
              <Text style={styles.notifMsg}>
                {cleanedMsg}
              </Text>
            ) : null}

            <View style={styles.notifFooter}>
              <Clock size={11} color="#94A3B8" />
              <Text style={styles.notifTime}>{formatTime(item.creation)}</Text>
              {isUnread && <View style={styles.blueDot} />}
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10), height: 70 + insets.top }]}>
      <View style={styles.leftSection}>
        {showMenu ? (
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={openDrawer}
            activeOpacity={0.7}
          >
            <Menu color={colors.navy} size={24} />
          </TouchableOpacity>
        ) : navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft color={colors.navy} size={24} />
          </TouchableOpacity>
        )}

        <Image
          source={Logo}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={toggleNotifications}
          activeOpacity={0.7}
        >
          {unreadCount > 0 ? (
            <BellRing color={colors.navy} size={22} />
          ) : (
            <Bell color={colors.navy} size={22} />
          )}
          {unreadCount > 0 && (
            <View
              style={[
                styles.unreadBadge,
                unreadCount > 99 && { minWidth: 32, right: -8 }
              ]}
            >
              <Text
                style={styles.unreadBadgeText}
                allowFontScaling={false}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Notifications Popover Dropdown Modal */}
      <Modal
        visible={showNotifications}
        transparent={true}
        statusBarTranslucent={true}
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowNotifications(false)}
          />
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[
              styles.popoverDialog,
              { marginTop: insets.top + 54, marginRight: 12 }
            ]}
          >
            {/* Header matching Web */}
            <View style={styles.popoverHeader}>
              <View style={styles.headerLeft}>
                <Bell size={18} color="#0F172A" />
                <Text style={styles.popoverTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.unreadHeaderPill}>
                    <Text style={styles.unreadHeaderPillText}>
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.headerRight}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={handleMarkAllAsRead}
                    style={styles.headerActionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Mark all as read"
                  >
                    <CheckCheck size={18} color="#64748B" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setShowNotifications(false)}
                  style={styles.headerActionBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Close"
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notification List / Loading / Empty */}
            {loading && !refreshing ? (
              <View style={styles.popoverLoading}>
                <ActivityIndicator size="small" color="#2563EB" />
              </View>
            ) : notifications.length > 0 ? (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.popoverList}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                style={styles.listContainer}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => fetchNotifications(true)}
                    colors={['#2563EB']}
                  />
                }
              />
            ) : (
              <View style={styles.popoverEmpty}>
                <Bell size={32} color="#CBD5E1" />
                <Text style={styles.popoverEmptyText}>No notifications</Text>
                <Text style={styles.popoverEmptySub}>You're all caught up!</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Logging Out Modal */}
      <Modal visible={isLoggingOut} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loggingOutText}>Logging out...</Text>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '85%', alignItems: 'center' }}>
            <LogOut size={40} color="#DC2626" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#1E293B' }}>
              Confirm Logout
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 18 }}>
              Are you sure you want to log out of your account?
            </Text>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{ flex: 1, marginRight: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' }}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={{ color: '#64748B', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, marginLeft: 8, backgroundColor: '#DC2626', padding: 12, borderRadius: 12, alignItems: 'center' }}
                onPress={confirmLogout}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 10,
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
  },
  menuBtn: {
    marginRight: spacing.md,
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    height: 40,
    width: 120,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    marginLeft: spacing.xs,
    position: 'relative',
    overflow: 'visible',
  },
  unreadBadge: {
    position: 'absolute',
    top: -1,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 19,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  popoverDialog: {
    width: POPOVER_WIDTH,
    maxHeight: Math.min(SCREEN_HEIGHT * 0.8, 620),
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  popoverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  popoverTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  unreadHeaderPill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadHeaderPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    maxHeight: Math.min(SCREEN_HEIGHT * 0.72, 540),
  },
  popoverList: {
    paddingVertical: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    backgroundColor: '#FFFFFF',
  },
  unreadItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  notifIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 3,
  },
  unreadText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  htmlViewContainer: {
    width: '100%',
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  notifMsg: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 6,
  },
  notifFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginLeft: 4,
  },
  itemCheckBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  popoverLoading: {
    padding: 40,
    alignItems: 'center',
  },
  popoverEmpty: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popoverEmptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  popoverEmptySub: {
    marginTop: 4,
    fontSize: 12,
    color: '#94A3B8',
  },
  loaderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loggingOutText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  }
});
