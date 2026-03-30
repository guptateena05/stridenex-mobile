import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Alert } from 'react-native';
import { LogOut, Bell, Menu, ChevronLeft } from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Logo from '@/assets/images/Logo.png';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export const DashboardHeader = ({ title, showMenu = true }: { title?: string, showMenu?: boolean }) => {
  const { logout, role } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
 
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

  let themeColor = colors.accent.DEFAULT;
  if (role === 'Mentor') themeColor = colors.success || '#10b981';
  else if (role === 'College') themeColor = colors.info || '#3b82f6';
  else if (role === 'Industry') themeColor = colors.primary.DEFAULT;

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
        <TouchableOpacity style={styles.iconBtn}>
          <Bell color={colors.navy} size={22} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
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
  }
});
