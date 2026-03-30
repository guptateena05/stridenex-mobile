import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { LucideIcon } from 'lucide-react-native';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color: string;
}

export const StatsCard = ({ title, value, change, icon: Icon, color }: StatsCardProps) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={[styles.iconBox, { backgroundColor: color + '12' }]}>
        <Icon color={color} size={18} />
      </View>
      {change && (
        <View style={[styles.changeBadge, { backgroundColor: color + '10' }]}>
          <Text style={[styles.changeText, { color: color }]}>{change}</Text>
        </View>
      )}
    </View>
    <View style={styles.content}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
    {/* Subtle background icon for premium feel */}
    <View style={styles.bgIconContainer}>
       <Icon color={color} size={64} style={{ opacity: 0.03 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconBox: {
    padding: 8,
    borderRadius: 12,
  },
  content: {
    zIndex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  changeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bgIconContainer: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 0,
  }
});
