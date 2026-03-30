import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { TrendingUp, Flame, Check, GraduationCap } from 'lucide-react-native';

interface RoleBannerWidgetProps {
  role: 'Student' | 'Mentor' | 'College' | 'Industry';
  fullName: string;
  subtitle: string;
  progress: number;
}

export const RoleBannerWidget = ({ role, fullName, subtitle, progress }: RoleBannerWidgetProps) => {
  const getInitials = (name: string) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.content}>
        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{getInitials(fullName)}</Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role.toUpperCase()}</Text>
            </View>
            <Text style={styles.fullName}>{fullName || 'Student'}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>73</Text>
              <TrendingUp size={14} color={colors.accent.DEFAULT} />
            </View>
            <Text style={styles.metricLabel}>EMPLOYABILITY</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>18</Text>
              <Flame size={14} color="#f97316" />
            </View>
            <Text style={styles.metricLabel}>DAY STREAK</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>6</Text>
              <Check size={14} color={colors.success} />
            </View>
            <Text style={styles.metricLabel}>VERIFIED</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Profile Completeness</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a1929', // Deep navy
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle2: {
    position: 'absolute',
    bottom: -30,
    left: '20%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  content: {
    zIndex: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  roleText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  fullName: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    fontFamily: typography.fontFamily.display,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    color: '#fff',
    fontSize: typography.fontSize.base,
    fontWeight: 'bold',
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
  },
  progressSection: {
    marginTop: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '500',
  },
  progressValue: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent.DEFAULT,
    borderRadius: 3,
  },
});
