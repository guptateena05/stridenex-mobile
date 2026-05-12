import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card } from '@/components/Shared/Card';
import { RoleBannerWidget } from '@/components/dashboard/RoleBannerWidget';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Building2,
  Target,
  Database,
  MessageSquare,
  LayoutDashboard,
  Cloud,
  Activity,
  Award,
  Briefcase,
  Clock
} from 'lucide-react-native';

const collegeStats = [
  { id: 1, title: 'ACTIVE STUDENTS', value: '2,847', label: 'this sem', change: '+124', icon: Users, isPositive: true },
  { id: 2, title: 'AVG EMPLOYABILITY', value: '78', label: 'vs last sem', change: '+6', icon: TrendingUp, isPositive: true },
  { id: 3, title: 'AT-RISK STUDENTS', value: '143', label: 'need action', change: '-12', icon: AlertTriangle, isPositive: false },
  { id: 4, title: 'INDUSTRY PARTNERS', value: '38', label: 'this month', change: '+5', icon: Building2, isPositive: true }
];

const actionItems = [
  { id: 1, title: '47 students with score <50', subtitle: 'Graduation risk — immediate intervention', icon: AlertTriangle, color: colors.error },
  { id: 2, title: 'NEP Internship: 68% (target 80%)', subtitle: '342 students need placement by April', icon: Target, color: colors.warning },
  { id: 3, title: '38 new internships posted this week', subtitle: 'TCS, Infosys, Razorpay, Zepto', icon: Briefcase, color: colors.success },
  { id: 4, title: 'UGC Grievance Response Due', subtitle: '2 cases require 24hr committee meeting', icon: Clock, color: colors.error }
];

const branchData = [
  { label: 'Computer Science', value: 420, color: '#10B981', progress: 100 },
  { label: 'Electronics', value: 380, color: '#10B981', progress: 90 },
  { label: 'Mechanical', value: 340, color: '#10B981', progress: 80 },
  { label: 'Civil', value: 290, color: '#F59E0B', progress: 70 },
  { label: 'MBA', value: 180, color: '#10B981', progress: 45 },
  { label: 'Chemical', value: 240, color: '#10B981', progress: 60 },
];

const empDistribution = [
  { label: 'Excellent (85-100)', value: 620, percent: '22%', color: '#10B981' },
  { label: 'Good (70-84)', value: 1140, percent: '40%', color: '#10B981' },
  { label: 'Average (55-69)', value: 740, percent: '26%', color: '#10B981' },
  { label: 'At-Risk (<55)', value: 347, percent: '12%', color: '#F59E0B' },
];

const skillGaps = [
  { label: 'Data Analysis', value: '62% lack this', progress: 62, icon: Database, color: colors.success },
  { label: 'Cloud Computing', value: '74% lack this', progress: 74, icon: Cloud, color: colors.success },
  { label: 'Communication', value: '38% lack this', progress: 38, icon: MessageSquare, color: colors.warning },
  { label: 'Project Management', value: '55% lack this', progress: 55, icon: LayoutDashboard, color: colors.success },
];

const growthData = [
  { val: 25, label: 'Apr' }, { val: 32, label: 'May' }, { val: 38, label: 'Jun' },
  { val: 45, label: 'Jul' }, { val: 52, label: 'Aug' }, { val: 58, label: 'Sep' },
  { val: 62, label: 'Oct' }, { val: 68, label: 'Nov' }, { val: 75, label: 'Dec' },
  { val: 82, label: 'Jan' }, { val: 88, label: 'Feb' }, { val: 95, label: 'Mar' }
];

export const CollegeOverviewScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Overview</Text>
            <View style={styles.headerBadge}>
              <LayoutDashboard size={10} color="#059669" />
              <Text style={styles.headerBadgeText}>ANALYTICS SUMMARY</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Direct institutional oversight and metrics</Text>
        </Animated.View>

        <View style={{ marginBottom: 12 }}>
          <RoleBannerWidget 
            role="College Administrator"
            fullName="Mohan Kumar" 
            theme="college"
            date={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} 
            progress={75} 
          />
        </View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInRight.delay(150)} style={styles.statsGrid}>
          {collegeStats.map((stat, i) => (
             <View key={i} style={styles.statWrapper}>
                <StatsCard 
                  title={stat.title.split(' ')[0]} 
                  value={stat.value} 
                  icon={stat.icon} 
                  color={i === 0 ? "#3B82F6" : i === 1 ? "#10B981" : i === 2 ? "#EF4444" : "#F59E0B"} 
                />
             </View>
          ))}
        </Animated.View>

        {/* Distribution Section (Full Width) */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color="#64748B" />
            <Text style={styles.sectionTitle}>Employability Distribution</Text>
          </View>
          <View style={styles.listContainer}>
            {empDistribution.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.listItemTextRow}>
                  <Text style={styles.listItemLabel}>{item.label}</Text>
                  <Text style={styles.listItemValue}>{item.value} ({item.percent})</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: item.percent as any, backgroundColor: item.color }]} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Performance Section (Full Width) */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Award size={18} color="#64748B" />
            <Text style={styles.sectionTitle}>Branch-wise Performance</Text>
          </View>
          <View style={styles.listContainer}>
            {branchData.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.listItemTextRow}>
                  <Text style={styles.listItemLabel}>{item.label}</Text>
                  <Text style={styles.listItemValue}>{item.value} students</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Action Required & Skill Gaps Stack */}
        <Card style={styles.actionCard}>
           <View style={styles.sectionHeader}>
             <AlertTriangle size={18} color={colors.error} />
             <Text style={styles.sectionTitle}>Action Required</Text>
           </View>
           {actionItems.map((item, index) => (
             <View key={item.id} style={[styles.actionRow, index === actionItems.length - 1 && styles.noBorder]}>
               <View style={[styles.actionIconBox, { backgroundColor: item.color + '10' }]}>
                 <item.icon color={item.color} size={18} />
               </View>
               <View style={styles.actionInfo}>
                 <Text style={styles.actionTitle}>{item.title}</Text>
                 <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
               </View>
             </View>
           ))}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Database size={18} color="#64748B" />
            <Text style={styles.sectionTitle}>Top Skill Gaps</Text>
          </View>
          <View style={styles.listContainer}>
            {skillGaps.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.skillRowMain}>
                   <View style={styles.skillLabelGroup}>
                      <item.icon size={14} color="#64748B" />
                      <Text style={styles.listItemLabel}>{item.label}</Text>
                   </View>
                   <View style={[styles.skillBadge, { backgroundColor: item.color + '10' }]}>
                      <Text style={[styles.skillBadgeText, { color: item.color }]}>{item.progress}% lack this</Text>
                   </View>
                </View>
                <View style={[styles.progressBarBg, { height: 4 }]}>
                  <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Growth Trend Bar Chart */}
        <Card style={[styles.sectionCard, { marginBottom: 40 }]}>
          <View style={styles.flexRowBetween}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Student Onboarding Growth</Text>
             </View>
             <Text style={styles.viewDetailsText}>Details ›</Text>
          </View>
          <View style={styles.chartContainer}>
             {growthData.map((d, idx) => (
               <View key={idx} style={styles.chartCol}>
                  <View style={[styles.chartBar, { height: `${d.val}%`, backgroundColor: colors.navy + '20' }]} />
                  <Text style={styles.chartLabel}>{d.label}</Text>
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
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    paddingVertical: 4,
  },
  statWrapper: {
    width: '25%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  listContainer: { gap: 16 },
  listItem: { gap: 8 },
  listItemTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listItemLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  listItemValue: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  actionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  actionIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  actionSubtitle: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  skillRowMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  skillBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  skillBadgeText: { fontSize: 10, fontWeight: '800' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, paddingTop: 20 },
  chartCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  chartBar: { width: '50%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabel: { fontSize: 9, color: '#64748B', marginTop: 8, fontWeight: '700' },
  viewDetailsText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  flexRowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
