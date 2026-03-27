import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Alert } from 'react-native';
import { LogOut, Bell, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import circularLogo from '@/assets/images/circularLogo.jpg';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export const DashboardHeader = ({ title = 'StrideNex' }: { title?: string }) => {
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

  let themeColor = colors.accent.DEFAULT;
  if (role === 'Mentor') themeColor = colors.success || '#10b981';
  else if (role === 'College') themeColor = colors.info || '#3b82f6';
  else if (role === 'Industry') themeColor = colors.primary.DEFAULT;

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 20 : 10, height: 60 + (insets.top > 0 ? insets.top : 20) }]}>
      <View style={styles.leftSection}>
        {navigation.canGoBack() && (
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft color={colors.navy} size={24} />
          </TouchableOpacity>
        )}
        <View style={styles.logoBox}>
          <Image 
            source={circularLogo} 
            style={styles.logoImage} 
            resizeMode="cover" 
          />
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.roleBadge, { color: themeColor }]}>{role}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconBtn}>
          <Bell color={colors.text.secondary} size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
          <LogOut color={colors.error} size={20} />
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
    backgroundColor: 'rgba(15, 15, 189, 0.05)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 18, // Circular
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    fontFamily: typography.fontFamily.display,
    lineHeight: 20,
  },
  roleBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  }
});
