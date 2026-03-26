import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LogOut, Bell } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export const DashboardHeader = ({ title = 'StrideNex' }: { title?: string }) => {
  const { logout, role } = useAuth();
  const insets = useSafeAreaInsets();

  let themeColor = colors.accent.DEFAULT;
  if (role === 'Mentor') themeColor = colors.success || '#10b981';
  else if (role === 'College') themeColor = colors.info || '#3b82f6';
  else if (role === 'Industry') themeColor = colors.primary.DEFAULT;

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 20 : 10, height: 60 + (insets.top > 0 ? insets.top : 20) }]}>
      <View style={styles.leftSection}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>SN</Text>
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
        <TouchableOpacity style={styles.iconBtn} onPress={logout}>
          <LogOut color={colors.error} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: typography.fontFamily.display,
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
