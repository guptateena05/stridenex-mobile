import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Alert, Modal, FlatList, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { LogOut, Bell, Menu, ChevronLeft, X, Circle, Info, CheckCircle2, Clock } from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Logo from '@/assets/images/Logo.png';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { getNotifications, markNotificationAsSeen } from '@/api/notification.services';
import Animated, { FadeInRight, FadeInUp, FadeIn } from 'react-native-reanimated';

export const DashboardHeader = ({ title, showMenu = true }: { title?: string, showMenu?: boolean }) => {
  const { logout, role, userName } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const cleanNotificationMessage = (content: string) => {
    if (!content) return "";
    let clean = content.replace(/<[^>]*>/g, '');
    clean = clean.replace(/\n\s+/g, '\n').trim();
    return clean;
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const email = userName || '';
      const response = await getNotifications(email);

      const list = response?.message?.data || [];
      setNotifications(list);

      // Count unread status: read === 0 is unread
      const unread = list.filter((n: any) => n.read === 0).length;
      setUnreadCount(unread);
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleMarkRead = async (item: any) => {
    if (item.read === 1) return;
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.name === item.name ? { ...n, read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Attempt API call if exists
      await markNotificationAsSeen(item.name, userName || "").catch(() => { });
    } catch (error) {
      console.log("Error marking as read:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: logout
        }
      ]
    );
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const renderNotificationItem = ({ item, index }: { item: any, index: number }) => {
    const isUnread = item.read === 0;
    return (
      <Animated.View entering={FadeInRight.delay(index * 50)}>
        <TouchableOpacity
          style={[styles.notificationItem, !isUnread && styles.readItem]}
          onPress={() => handleMarkRead(item)}
        >
          <View style={styles.notifIconBox}>
            {isUnread ? (
              <Circle size={10} color={colors.primary.DEFAULT} fill={colors.primary.DEFAULT} />
            ) : (
              <CheckCircle2 size={16} color="#94A3B8" />
            )}
          </View>
          <View style={styles.notifContent}>
            <Text style={[styles.notifTitle, isUnread && styles.boldText]}>{item.subject || 'Notification'}</Text>
            <Text style={styles.notifMsg}>{cleanNotificationMessage(item.email_content)}</Text>
            <View style={styles.notifFooter}>
              <Clock size={10} color="#94A3B8" />
              <Text style={styles.notifTime}>{item.creation?.split(' ')[0] || 'Recently'}</Text>
            </View>
          </View>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.iconBtn} onPress={toggleNotifications}>
          <Bell color={colors.navy} size={22} />
          {unreadCount > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowNotifications(false)}>
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[styles.popoverDialog, { marginTop: 45 + insets.top, marginRight: 12 }]}
          >
            <View style={styles.popoverHeader}>
              <Text style={styles.popoverTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.popoverLoading}>
                <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
              </View>
            ) : notifications.length > 0 ? (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.popoverList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.popoverEmpty}>
                <Bell size={24} color="#CBD5E1" />
                <Text style={styles.popoverEmptyText}>No notifications</Text>
              </View>
            )}
          </Animated.View>
        </Pressable>
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
    padding: spacing.sm,
    marginLeft: spacing.xs,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  popoverDialog: {
    width: 280,
    maxHeight: 400,
    backgroundColor: '#fff',
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
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  popoverTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  popoverList: {
    padding: spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: '#FFF',
    marginBottom: spacing.xs,
  },
  readItem: {
    opacity: 0.7,
  },
  unreadItem: {
    backgroundColor: 'rgba(255, 107, 0, 0.03)',
  },
  notifIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    marginTop: 4,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    color: colors.navy,
    marginBottom: 2,
  },
  notifMsg: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  notifFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  boldText: {
    fontWeight: 'bold',
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
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  }
});
