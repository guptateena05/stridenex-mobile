import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/Shared/Card';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Users, Clock, DollarSign, Star, Calendar } from 'lucide-react-native';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <View style={[styles.statCard, { borderBottomColor: color }]}>
    <View style={styles.statHeader}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={16} />
      </View>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    {change && (
      <View style={styles.changeBadge}>
        <Text style={styles.changeText}>{change}</Text>
      </View>
    )}
  </View>
);

export const MentorDashboardScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.welcomeText}>Welcome back, Mentor!</Text>
      
      <View style={styles.gridContainer}>
        <View style={styles.row}>
          <StatCard title="Total Students" value="48" change="+3 this week" icon={Users} color={colors.success || '#10b981'} />
          <StatCard title="Active Sessions" value="12" change="4 upcoming" icon={Clock} color={colors.accent.DEFAULT} />
        </View>
        <View style={styles.row}>
          <StatCard title="Revenue" value="₹24k" change="+12% this month" icon={DollarSign} color={colors.primary.DEFAULT} />
          <StatCard title="Average Rating" value="4.9" change="From 120 reviews" icon={Star} color={colors.warning || '#f59e0b'} />
        </View>
      </View>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Upcoming Sessions</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>
        
        <View style={styles.sessionItem}>
          <View style={styles.sessionDateBox}>
            <Text style={styles.sessionDateDay}>28</Text>
            <Text style={styles.sessionDateMonth}>Feb</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionStudent}>Rahul Sharma</Text>
            <Text style={styles.sessionTopic}>Mock Interview - Software Eng.</Text>
            <View style={styles.sessionTimeRow}>
              <Calendar size={12} color={colors.text.secondary} />
              <Text style={styles.sessionTimeText}> Tomorrow, 4:00 PM</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sessionItem}>
          <View style={styles.sessionDateBox}>
            <Text style={styles.sessionDateDay}>01</Text>
            <Text style={styles.sessionDateMonth}>Mar</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionStudent}>Priya Patel</Text>
            <Text style={styles.sessionTopic}>Resume Review</Text>
            <View style={styles.sessionTimeRow}>
              <Calendar size={12} color={colors.text.secondary} />
              <Text style={styles.sessionTimeText}> Friday, 10:00 AM</Text>
            </View>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Recent Payouts</Text>
        <View style={styles.payoutRow}>
          <View>
            <Text style={styles.payoutTitle}>February Settlement</Text>
            <Text style={styles.payoutDate}>Processed on Feb 25, 2024</Text>
          </View>
          <Text style={styles.payoutAmt}>₹18,500</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.payoutRow}>
          <View>
            <Text style={styles.payoutTitle}>January Settlement</Text>
            <Text style={styles.payoutDate}>Processed on Jan 26, 2024</Text>
          </View>
          <Text style={styles.payoutAmt}>₹22,100</Text>
        </View>
      </Card>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light || '#fcfcfc' },
  content: { padding: spacing.md, paddingBottom: 40 },
  welcomeText: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.navy, marginBottom: spacing.lg, fontFamily: typography.fontFamily.display },
  gridContainer: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: borderRadius.xl, padding: spacing.md, marginHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderBottomWidth: 3 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  statTitle: { fontSize: typography.fontSize.xs, color: colors.text.secondary, flex: 1 },
  iconBox: { padding: 4, borderRadius: 6 },
  statValue: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.navy, marginBottom: 4 },
  changeBadge: { backgroundColor: colors.background.light || '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  changeText: { fontSize: 10, color: colors.text.secondary, fontWeight: '500' },
  card: { marginBottom: spacing.md, padding: spacing.md, borderRadius: borderRadius.xl, backgroundColor: '#fff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.navy, fontFamily: typography.fontFamily.display },
  viewAll: { fontSize: typography.fontSize.sm, color: colors.success || '#10b981', fontWeight: 'bold' },
  sessionItem: { flexDirection: 'row', marginBottom: spacing.md, alignItems: 'center' },
  sessionDateBox: { width: 50, height: 50, borderRadius: 8, backgroundColor: (colors.success || '#10b981') + '15', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  sessionDateDay: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.success || '#10b981' },
  sessionDateMonth: { fontSize: 10, color: colors.success || '#10b981', textTransform: 'uppercase', fontWeight: 'bold' },
  sessionInfo: { flex: 1 },
  sessionStudent: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.text.primary, marginBottom: 2 },
  sessionTopic: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: 4 },
  sessionTimeRow: { flexDirection: 'row', alignItems: 'center' },
  sessionTimeText: { fontSize: 11, color: colors.text.secondary, fontWeight: '500' },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  payoutTitle: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.text.primary, marginBottom: 2 },
  payoutDate: { fontSize: 11, color: colors.text.secondary },
  payoutAmt: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.success || '#10b981' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm }
});
