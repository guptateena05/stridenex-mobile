import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/Shared/Card';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Briefcase, Users, FileText, CheckCircle, ArrowRight } from 'lucide-react-native';

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

export const IndustryDashboardScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.welcomeText}>Welcome back, HR Manager!</Text>
      
      {/* <View style={styles.gridContainer}>
        <View style={styles.row}>
          <StatCard title="Active Job Posts" value="12" change="+2 this week" icon={Briefcase} color={colors.primary.DEFAULT} />
          <StatCard title="Total Applications" value="845" change="+120 new" icon={FileText} color={colors.accent.DEFAULT} />
        </View>
        <View style={styles.row}>
          <StatCard title="Candidates Shortlisted" value="64" change="Ready to interview" icon={Users} color={colors.info || '#3b82f6'} />
          <StatCard title="Hired Candidates" value="18" change="This quarter" icon={CheckCircle} color={colors.success || '#10b981'} />
        </View>
      </View>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Applications</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>
        
        <View style={styles.appRow}>
          <View style={styles.avatarBox}><Text style={styles.avatarTxt}>AS</Text></View>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Arjun Singh</Text>
            <Text style={styles.appRole}>Applied for Frontend Developer</Text>
            <Text style={styles.appMatch}>92% Match Score • Recommended</Text>
          </View>
          <View style={styles.actionBtn}>
            <ArrowRight color={colors.primary.DEFAULT} size={16} />
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.appRow}>
          <View style={[styles.avatarBox, { backgroundColor: colors.accent.DEFAULT }]}><Text style={styles.avatarTxt}>MK</Text></View>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Meera Kumar</Text>
            <Text style={styles.appRole}>Applied for Data Scientist Intern</Text>
            <Text style={styles.appMatch}>88% Match Score</Text>
          </View>
          <View style={styles.actionBtn}>
            <ArrowRight color={colors.primary.DEFAULT} size={16} />
          </View>
        </View>
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.navy }]}>
        <Text style={[styles.cardTitle, { color: '#fff' }]}>Pipeline Analytics</Text>
        <Text style={styles.analyticsSub}>Recruitment velocity is up 15%</Text>
        
        <View style={styles.funnelStage}>
          <View style={styles.funnelLabelRow}>
            <Text style={styles.funnelLabel}>Sourced (845)</Text>
            <Text style={styles.funnelPerc}>100%</Text>
          </View>
          <View style={styles.funnelBarBg}>
            <View style={[styles.funnelBarFill, { width: '100%', backgroundColor: colors.info || '#3b82f6' }]} />
          </View>
        </View>
        
        <View style={styles.funnelStage}>
          <View style={styles.funnelLabelRow}>
            <Text style={styles.funnelLabel}>Screened (310)</Text>
            <Text style={styles.funnelPerc}>36%</Text>
          </View>
          <View style={styles.funnelBarBg}>
            <View style={[styles.funnelBarFill, { width: '36%', backgroundColor: colors.accent.DEFAULT }]} />
          </View>
        </View>

        <View style={styles.funnelStage}>
          <View style={styles.funnelLabelRow}>
            <Text style={styles.funnelLabel}>Interviewed (64)</Text>
            <Text style={styles.funnelPerc}>7%</Text>
          </View>
          <View style={styles.funnelBarBg}>
            <View style={[styles.funnelBarFill, { width: '7%', backgroundColor: colors.success || '#10b981' }]} />
          </View>
        </View>
      </Card> */}
      
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
  viewAll: { fontSize: typography.fontSize.sm, color: colors.primary.DEFAULT, fontWeight: 'bold' },
  appRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm },
  avatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.info || '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarTxt: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  appInfo: { flex: 1 },
  appName: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.text.primary, marginBottom: 2 },
  appRole: { fontSize: typography.fontSize.xs, color: colors.text.secondary, marginBottom: 2 },
  appMatch: { fontSize: 10, color: colors.success || '#10b981', fontWeight: 'bold' },
  actionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: (colors.primary.DEFAULT) + '15', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  analyticsSub: { color: 'rgba(255,255,255,0.7)', fontSize: typography.fontSize.sm, marginBottom: spacing.lg },
  funnelStage: { marginBottom: spacing.md },
  funnelLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  funnelLabel: { color: '#fff', fontSize: typography.fontSize.sm, fontWeight: '500' },
  funnelPerc: { color: 'rgba(255,255,255,0.8)', fontSize: typography.fontSize.xs },
  funnelBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 },
  funnelBarFill: { height: '100%', borderRadius: 4 }
});
