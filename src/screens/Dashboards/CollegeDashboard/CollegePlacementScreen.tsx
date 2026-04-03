import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Send, Star, Calendar, BarChart, Building2, TrendingUp, Award } from 'lucide-react-native';

const topMetrics = [
  { id: 1, title: 'Applications Sent', value: '847', icon: Send, color: colors.text.secondary },
  { id: 2, title: 'Shortlisted', value: '312', icon: Star, color: colors.warning },
  { id: 3, title: 'Interviews Scheduled', value: '156', icon: Calendar, color: colors.error },
  { id: 4, title: 'Offers Received', value: '98', icon: Star, color: colors.success },
];

const funnelData = [
  { label: 'Final Year Students', value: 680, width: '100%', color: colors.navy },
  { label: 'Eligible (Score ≥60)', value: 521, width: '80%', color: colors.success },
  { label: 'Applications Sent', value: 847, width: '100%', color: colors.primary.DEFAULT },
  { label: 'Shortlisted', value: 312, width: '50%', color: colors.warning },
  { label: 'Interviews Done', value: 156, width: '25%', color: colors.warning },
  { label: 'Offers Received', value: 98, width: '15%', color: colors.success },
];

const recruiters = [
  { name: 'TCS', offers: 24, icon: '🏢' },
  { name: 'Infosys', offers: 18, icon: '💻' },
  { name: 'Razorpay', offers: 8, icon: '💳' },
  { name: 'Zepto', offers: 5, icon: '⚡' },
];

const salaryBands = [
  { range: '<4 LPA', percentage: 12, color: colors.error },
  { range: '4-8 LPA', percentage: 38, color: colors.warning },
  { range: '8-15 LPA', percentage: 35, color: colors.success },
  { range: '15+ LPA', percentage: 15, color: colors.success },
];

export const CollegePlacementScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <TrendingUp size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>PLACEMENTS</Text>
          </View>
          <Text style={styles.title}>Placement Tracker</Text>
          <Text style={styles.subtitle}>Institutional placement funnel and drive performance</Text>
        </Animated.View>

        {/* Stats Row (4-in-a-row) */}
        <Animated.View entering={FadeInRight.delay(100)} style={styles.statsRow}>
          {topMetrics.map((stat, i) => (
             <StatsCard 
              key={i} 
              title={stat.title.split(' ')[0]} 
              value={stat.value} 
              icon={stat.icon} 
              color={i === 0 ? "#3B82F6" : i === 1 ? "#F59E0B" : i === 2 ? "#EF4444" : "#10B981"} 
            />
          ))}
        </Animated.View>

        {/* Placement Funnel */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <BarChart color="#64748B" size={18} />
            <Text style={styles.sectionTitle}>Placement Funnel 2024–25</Text>
          </View>
          <View style={styles.listContainer}>
            {funnelData.map((stage, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.listItemTextRow}>
                  <Text style={styles.listItemLabel}>{stage.label}</Text>
                  <Text style={styles.listItemValue}>{stage.value}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: stage.width as any, backgroundColor: stage.color }]} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Top Recruiters */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Building2 color="#64748B" size={18} />
            <Text style={styles.sectionTitle}>Top Recruiters</Text>
          </View>
          <View style={styles.listContainer}>
            {recruiters.map((r, idx) => (
              <View key={idx} style={[styles.entityRow, idx === recruiters.length - 1 && styles.noBorder]}>
                <View style={styles.entityIconBox}>
                  <Text style={{ fontSize: 16 }}>{r.icon}</Text>
                </View>
                <View style={styles.entityInfo}>
                  <Text style={styles.entityName}>{r.name}</Text>
                  <Text style={styles.entitySub}>Active Drive • Day 1</Text>
                </View>
                <View style={styles.entityStatus}>
                  <Text style={styles.entityStatusText}>{r.offers} offers</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Salary Bands & CTC */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Award color="#64748B" size={18} />
            <Text style={styles.sectionTitle}>Compensation Performance</Text>
          </View>
          
          <View style={styles.ctcHighlightCard}>
            <Text style={styles.ctcLabel}>AVERAGE CTC 2024–25</Text>
            <Text style={styles.ctcValue}>₹8.4 LPA</Text>
            <View style={styles.ctcBadge}>
               <TrendingUp size={10} color="#059669" />
               <Text style={styles.ctcBadgeText}>+12% Year-on-Year Growth</Text>
            </View>
          </View>

          <View style={[styles.listContainer, { marginTop: 24 }]}>
            <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>Salary Distribution</Text>
            {salaryBands.map((band, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.listItemTextRow}>
                  <Text style={styles.listItemLabel}>{band.range}</Text>
                  <Text style={styles.listItemValue}>{band.percentage}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${band.percentage}%`, backgroundColor: band.color }]} />
                </View>
              </View>
            ))}
          </View>
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  
  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24 },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  sectionSubtitle: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },

  listContainer: { gap: 16 },
  listItem: { gap: 8 },
  listItemTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listItemLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  listItemValue: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  entityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  entityIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  entityInfo: { flex: 1 },
  entityName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  entitySub: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  entityStatus: { alignItems: 'flex-end' },
  entityStatusText: { fontSize: 12, fontWeight: '800', color: '#059669' },

  ctcHighlightCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  ctcLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 8 },
  ctcValue: { fontSize: 32, fontWeight: '900', color: '#0F172A', letterSpacing: -1, marginBottom: 8 },
  ctcBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ctcBadgeText: { fontSize: 9, fontWeight: '800', color: '#059669' }
});
