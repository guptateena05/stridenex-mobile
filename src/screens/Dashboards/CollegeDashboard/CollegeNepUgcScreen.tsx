import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { 
  FileText, Target, Users, BarChart, Briefcase, Calendar, 
  CheckSquare, Download, ShieldCheck, AlertCircle, Clock, 
  TrendingUp, FolderKanban, CheckCircle2, RefreshCcw, Link2,
  ChevronRight, ArrowUpRight, ShieldAlert, Award, Zap,
  Eye, ShieldOff, XCircle, AlertOctagon, AlertTriangle
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const complianceMetrics = [
  { id: 1, title: 'Holistic Cards', value: '62%', status: 'Action', color: '#F59E0B', icon: FileText },
  { id: 2, title: 'ABC Sync', value: '78%', status: 'Healthy', color: '#10B981', icon: Target },
  { id: 3, title: 'Equity (EOC)', value: '40%', status: 'Critical', color: '#EF4444', icon: Users },
  { id: 4, title: 'UDISE+', value: '85%', status: 'Healthy', color: '#10B981', icon: BarChart },
  { id: 5, title: 'OBE Mapping', value: '55%', status: 'Action', color: '#F59E0B', icon: Target },
  { id: 6, title: 'Grievance SLA', value: '48%', status: 'Action', color: '#F59E0B', icon: FileText },
  { id: 7, title: 'Faculty CPD', value: '74%', status: 'Healthy', color: '#10B981', icon: Users },
  { id: 8, title: 'NAAC Portfolio', value: '68%', status: 'Action', color: '#F59E0B', icon: Briefcase },
];

const quickActions = [
  { task: "Submit ABC credit data to DigiLocker", status: "Pending", color: "#64748B", icon: Target },
  { task: "Generate Holistic Progress Cards (batch)", status: "Ready", color: "#10B981", icon: FileText },
  { task: "Resolve 2 grievance cases (SLA at risk)", status: "Urgent", color: "#EF4444", icon: CheckSquare },
  { task: "Upload SWAYAM certificates", status: "Ready", color: "#10B981", icon: Briefcase },
];

const deadlines = [
  { id: 1, date: 'Mar 15', task: 'NAAC Self-Study Report Submission', priority: 'High', color: '#EF4444' },
  { id: 2, date: 'Mar 20', task: 'ABC Credit Data Portal Upload', priority: 'Medium', color: '#F59E0B' },
  { id: 3, date: 'Apr 1', task: 'UGC Equity Annual Report', priority: 'High', color: '#EF4444' },
  { id: 4, date: 'Apr 15', task: 'UDISE+ Data Finalization', priority: 'Medium', color: '#F59E0B' },
];

export const CollegeNepUgcScreen = ({ route }: any) => {
  const tab = route?.params?.tab || 'Dashboard';

  if (tab === 'NEP 2020') return <Nep2020View />;
  if (tab === 'UGC 2026') return <Ugc2026View />;
  if (tab === 'Grievance Engine') return <GrievanceEngineView />;
  if (tab === 'Portfolio Locker') return <PortfolioLockerView />;
  if (tab === 'ABC Credits') return <AbcCreditsView />;
  if (tab === 'Equity Audit') return <EquityAuditView />;
  if (tab === 'Reports' || tab === 'NEP Reports') return <ReportsView />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <ShieldCheck size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>REGULATORY COMPLIANCE</Text>
          </View>
          <View style={styles.headerTitleRow}>
            <View>
              <Text style={styles.title}>Compliance</Text>
              <Text style={styles.subtitle}>Institutional regulatory oversight & scoring</Text>
            </View>
            <TouchableOpacity style={styles.reportBtn}>
              <Download size={16} color="#FFF" />
              <Text style={styles.reportBtnText}>Report</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Score Banner */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <Card style={styles.scoreBannerLegacy}>
            <View style={styles.scoreContentLegacy}>
               <View style={styles.scoreCircleLegacy}>
                  <Text style={styles.scoreValueLegacy}>64</Text>
                  <Text style={styles.scoreLabelLegacy}>OVERALL</Text>
               </View>
               <View style={styles.scoreInfoLegacy}>
                  <Text style={styles.bannerTitleLegacy}>Institutional Score</Text>
                  <Text style={styles.bannerSubLegacy}>Aggregate compliance across NEP, UGC, and NAAC mandates.</Text>
                  <View style={styles.bannerTrendLegacy}>
                     <TrendingUp size={12} color="#10B981" />
                     <Text style={styles.trendTextLegacy}>+4.2% since last audit</Text>
                  </View>
               </View>
            </View>
          </Card>
        </Animated.View>

        {/* 4-in-a-row Stats */}
        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>CRITICAL PILLARS</Text>
        </View>

        <Animated.View entering={FadeInRight.delay(150)} style={styles.metricsGrid}>
          {complianceMetrics.map((stat, i) => (
             <View key={i} style={styles.metricWrapper}>
                <Card style={styles.metricCard}>
                   <View style={styles.metricTop}>
                      <View style={[styles.iconBox, { backgroundColor: stat.color + '10' }]}>
                         <stat.icon size={16} color={stat.color} />
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: stat.color + '15' }]}>
                         <Text style={[styles.statusBadgeText, { color: stat.color }]}>{stat.status.toUpperCase()}</Text>
                      </View>
                   </View>
                   <Text style={styles.metricVal}>{stat.value}</Text>
                   <Text style={styles.metricLabel} numberOfLines={1}>{stat.title}</Text>
                   <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: stat.value as any, backgroundColor: stat.color }]} />
                   </View>
                </Card>
             </View>
          ))}
        </Animated.View>



        {/* Quick Actions */}
        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        </View>

        <Card style={styles.ledgerCard}>
           {quickActions.map((action, idx) => (
              <View key={idx} style={[styles.ledgerRow, idx === quickActions.length - 1 && styles.noBorder]}>
                 <View style={[styles.iconBox, { backgroundColor: action.color + '10', marginRight: 12 }]}>
                    <action.icon size={16} color={action.color} />
                 </View>
                 <View style={styles.ledgerMain}>
                    <Text style={styles.ledgerTask}>{action.task}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: action.status === 'Ready' || action.status === 'Urgent' ? action.color + '15' : '#F1F5F9', marginTop: 4, alignSelf: 'flex-start' }]}>
                       <Text style={[styles.statusBadgeText, { color: action.status === 'Ready' || action.status === 'Urgent' ? action.color : '#64748B' }]}>{action.status.toUpperCase()}</Text>
                    </View>
                 </View>
                 <ChevronRight size={14} color="#CBD5E1" />
              </View>
           ))}
        </Card>

        {/* Upcoming Mandates Ledger */}
        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>UPCOMING MANDATES</Text>
        </View>

        <Card style={styles.ledgerCard}>
           {deadlines.map((item, idx) => (
              <View key={item.id} style={[styles.ledgerRow, idx === deadlines.length - 1 && styles.noBorder]}>
                 <View style={[styles.priorityIndicator, { backgroundColor: item.color }]} />
                 <View style={styles.ledgerMain}>
                    <Text style={styles.ledgerTask}>{item.task}</Text>
                    <View style={styles.ledgerMeta}>
                       <Calendar size={12} color="#64748B" />
                       <Text style={styles.ledgerDate}>Due {item.date}</Text>
                    </View>
                 </View>
                 <ChevronRight size={14} color="#CBD5E1" />
              </View>
           ))}
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  header: { marginBottom: 24 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#D1FAE5', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginBottom: 8 },
  headerBadgeText: { fontSize: 9, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  headerTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 2 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 6 },
  reportBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // Legacy Compliance styles
  scoreBannerLegacy: { padding: 20, borderRadius: 20, backgroundColor: '#0F172A', marginBottom: 12, borderWidth: 0 },
  scoreContentLegacy: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreCircleLegacy: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  scoreValueLegacy: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  scoreLabelLegacy: { fontSize: 8, fontWeight: '800', color: '#10B981' },
  scoreInfoLegacy: { flex: 1 },
  bannerTitleLegacy: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  bannerSubLegacy: { fontSize: 11, color: '#94A3B8', lineHeight: 15 },
  bannerTrendLegacy: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  trendTextLegacy: { fontSize: 10, fontWeight: '700', color: '#10B981' },

  scoreBanner: { borderRadius: 24, padding: 16 },
  scoreContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreGaugeContainer: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  scoreCircleLarge: { width: 70, height: 70, borderRadius: 35, borderWidth: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  scoreValueBig: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  scoreLabelSmall: { fontSize: 8, fontWeight: '800', color: '#64748B' },
  scoreInfo: { flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  bannerSub: { fontSize: 11, color: '#64748B', lineHeight: 15, fontWeight: '500' },
  statusBadgeRow: { flexDirection: 'row', marginTop: 8 },
  
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricValLarge: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  metricLabelLong: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  targetRow: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  targetLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8' },

  sectionValue: { fontSize: 11, fontWeight: '700', color: '#0F172A' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  impactValPremium: { fontSize: 16, fontWeight: '900' },
  progressBarWrapper: { marginTop: 10 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },

  primaryActionBtnWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#0F172A', paddingVertical: 18, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  primaryActionTextLarge: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  secondaryActionBtnWide: { alignItems: 'center', paddingVertical: 18, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', marginTop: 4 },
  secondaryActionTextLarge: { color: '#64748B', fontWeight: '800', fontSize: 15 },

  slaTimeBox: { width: 60, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#F8FAFC', paddingVertical: 8, borderRadius: 12 },

  // Section Headers
  sectionTitleRow: { marginBottom: 12, marginTop: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1 },

   // Metrics Grid
   metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
    metricWrapper: { width: '50%', paddingHorizontal: 4, marginBottom: 12 },
    metricCard: { padding: 16, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9' },
    metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    iconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    statusDot: { width: 4, height: 4, borderRadius: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusBadgeText: { fontSize: 8, fontWeight: '800' },
    metricVal: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
    metricLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', marginBottom: 12 },
    progressBar: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
   progressFill: { height: '100%', borderRadius: 2 },

  // Ledger Components
  ledgerCard: { padding: 0, borderRadius: 20, backgroundColor: '#FFF', overflow: 'hidden', marginBottom: 16 },
  ledgerRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  noBorder: { borderBottomWidth: 0 },
  priorityIndicator: { width: 3, height: 32, borderRadius: 2, marginRight: 12 },
  ledgerMain: { flex: 1 },
  ledgerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  ledgerTask: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  ledgerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ledgerDate: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  actionIconBox: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  progressBarSmall: { height: 3, backgroundColor: '#F1F5F9', borderRadius: 1.5, marginTop: 8, overflow: 'hidden' },

  // Sub-tab specific
  infoHighlightCard: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 16, backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A', marginBottom: 20 },
  infoHighlightTitle: { fontSize: 14, fontWeight: '800', color: '#92400E' },
  infoHighlightSub: { fontSize: 12, color: '#92400E', opacity: 0.8, lineHeight: 16 },
  
  statusStayedCard: { padding: 16, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 24 },
  statusStayedTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  statusStayedTitle: { fontSize: 14, fontWeight: '800', color: '#92400E' },
  statusStayedDesc: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  
  newBadgeFloating: { position: 'absolute', top: -8, right: 12, backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, zIndex: 10, shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  newBadgeText: { fontSize: 8, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },

  penaltyCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, backgroundColor: '#FFF', borderColor: '#FEE2E2', borderWidth: 1, borderRadius: 16 },
  penaltyIconColumn: { flexShrink: 0 },
  penaltyContent: { flex: 1 },
  penaltyTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  penaltyDesc: { fontSize: 11, color: '#64748B', fontWeight: '500', lineHeight: 15 },
  
  slaTimeVal: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  slaTimeUnit: { fontSize: 8, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  configBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F1F5F9' },
  configBtnText: { fontSize: 11, fontWeight: '700', color: '#475569' },

  // Grievance
  statsGridCompact: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 16 },
  statColCompact: { flex: 1, paddingHorizontal: 4 },
  statCardCompact: { padding: 12, borderRadius: 16, alignItems: 'center' },
  statIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValCompact: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  statLabelCompact: { fontSize: 9, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  
  helplineCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  helplineIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  helplineTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  helplineSub: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  
  ledgerID: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 9, fontWeight: '800' },
  ledgerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' },
  priorityLabel: { fontSize: 11, fontWeight: '700' },
  reviewBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  reviewBtnText: { fontSize: 11, fontWeight: '800', color: '#475569' },

  // Portfolio
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  portfolioCol: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },
  portfolioCard: { padding: 16, borderRadius: 20 },
  portfolioTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadgeSmall: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  statusBadgeTextSmall: { fontSize: 7, fontWeight: '800' },
  portfolioTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  portfolioNaac: { fontSize: 10, fontWeight: '800', color: '#64748B', marginBottom: 12 },
  portfolioStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  statValSmall: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  statLabelMini: { fontSize: 7, fontWeight: '800', color: '#94A3B8' },
  lockerInfoCard: { flexDirection: 'row', gap: 16, padding: 20, borderRadius: 20, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#D1FAE5', marginBottom: 24 },
  lockerInfoTitle: { fontSize: 15, fontWeight: '800', color: '#065F46' },
  lockerInfoSub: { fontSize: 12, color: '#065F46', opacity: 0.8, lineHeight: 18 },

  // ABC
  syncStatusRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  syncStatusCard: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#D1FAE5' },
  syncStatusVal: { fontSize: 22, fontWeight: '800', color: '#065F46' },
  syncStatusLabel: { fontSize: 8, fontWeight: '800', color: '#065F46', marginTop: 4 },
  apiConnectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  apiTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  apiSub: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  apiDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },

  // Equity
  equityGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginBottom: 16 },
  equityCol: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },
  equityCard: { padding: 16, borderRadius: 20, alignItems: 'center' },
  equityVal: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  equityLabel: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  equityDivider: { width: 20, height: 2, backgroundColor: '#F1F5F9', marginVertical: 8 },
  equityTarget: { fontSize: 9, fontWeight: '700', color: '#94A3B8' },
  impactRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  impactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  impactLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  impactVal: { fontSize: 14, fontWeight: '800' },
  progressBarLarge: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  actionRowGroup: { gap: 12, marginTop: 16 },
  primaryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 16 },
  primaryActionText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  secondaryActionBtn: { alignItems: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  secondaryActionText: { color: '#64748B', fontWeight: '700', fontSize: 14 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24 },
  insightCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20 },
  insightTop: { flexDirection: 'row', gap: 12 },
  insightIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  insightText: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  insightMeta: { fontSize: 11, color: '#64748B', lineHeight: 16, fontWeight: '500' },
});

const Nep2020View = () => {
  const pillars = [
    {
      title: "360° Holistic Progress Cards",
      docRef: "NEP 2020 §4.34",
      val: "62%",
      status: "Action Needed",
      color: "#F59E0B",
      icon: FileText,
      points: [
        { label: "Self-assessment module", status: "Done" },
        { label: "Faculty rubrics config", status: "Done" },
        { label: "Peer-assessment rollout", status: "Pending" },
        { label: "Psychomotor tracking", status: "Pending" }
      ]
    },
    {
      title: "Academic Bank of Credits (ABC)",
      docRef: "NEP 2020 §10.10",
      val: "78%",
      status: "On Track",
      color: "#10B981",
      icon: Target,
      points: [
        { label: "ABC API v2.1 connected", status: "Done" },
        { label: "Auto-sync on completion", status: "Done" },
        { label: "Cross-institution testing", status: "Pending" }
      ]
    },
    {
      title: "Outcome-Based Education (OBE)",
      docRef: "UGC OBE 2022",
      val: "55%",
      status: "Action Needed",
      color: "#F59E0B",
      icon: BarChart,
      points: [
        { label: "CSE course-LO mapping", status: "Done" },
        { label: "Attainment engine", status: "Done" },
        { label: "ECE/Mech mapping", status: "Pending" },
        { label: "Continuous reporting", status: "Pending" }
      ]
    }
  ];

  const alignments = [
    { dept: "Computer Science", mapped: "44/48", progress: 92, color: "#10B981" },
    { dept: "Electronics", mapped: "36/42", progress: 86, color: "#10B981" },
    { dept: "Mechanical", mapped: "28/38", progress: 74, color: "#F59E0B" },
    { dept: "Civil", mapped: "22/35", progress: 63, color: "#EF4444" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <FileText size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>NEP 2020 MANDATE</Text>
          </View>
          <Text style={styles.title}>Implementation Index</Text>
          <Text style={styles.subtitle}>Institutional alignment with NEP 2020 framework</Text>
        </Animated.View>

        {/* Implementation Index Banner */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <Card style={[styles.scoreBanner, { backgroundColor: '#F8FAFC', marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#0F172A', shadowOpacity: 0.05, elevation: 2 }]}>
            <View style={styles.scoreContent}>
               <View style={styles.scoreGaugeContainer}>
                  <View style={[styles.scoreCircleLarge, { borderColor: '#0F172A', borderWidth: 4 }]}>
                     <Text style={styles.scoreValueBig}>65</Text>
                     <Text style={styles.scoreLabelSmall}>ALIGN</Text>
                  </View>
               </View>
               <View style={styles.scoreInfo}>
                  <Text style={[styles.bannerTitle, { color: '#1E293B' }]}>Policy Alignment Index</Text>
                  <Text style={styles.bannerSub}>Institutional readiness across NEP 2020 core pillars.</Text>
                  <View style={styles.statusBadgeRow}>
                     <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
                        <CheckCircle2 size={10} color="#64748B" />
                        <Text style={[styles.statusBadgeText, { color: '#64748B', marginLeft: 4 }]}>AUDIT READY</Text>
                     </View>
                  </View>
               </View>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>CORE PILLARS</Text>
        </View>

        {pillars.map((p, i) => (
          <Animated.View key={i} entering={FadeInUp.delay(i * 100)}>
            <Card style={[styles.ledgerCard, { marginBottom: 16, borderLeftWidth: 1, borderColor: '#F1F5F9' }]}>
              <View style={{ padding: 16 }}>
                <View style={styles.ledgerHeaderRow}>
                   <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                         <View style={[styles.iconBox, { backgroundColor: '#F8FAFC', width: 32, height: 32 }]}>
                            <p.icon size={16} color={p.color} />
                         </View>
                         <Text style={styles.ledgerTask}>{p.title}</Text>
                      </View>
                      <Text style={[styles.headerBadgeText, { marginTop: 6, color: '#94A3B8', marginLeft: 42 }]}>{p.docRef}</Text>
                   </View>
                   <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.metricValLarge, { color: '#1E293B', fontSize: 18 }]}>{p.val}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9', marginTop: 4 }]}>
                         <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: p.color, marginRight: 6 }} />
                         <Text style={[styles.statusBadgeText, { color: '#64748B' }]}>{p.status.toUpperCase()}</Text>
                      </View>
                   </View>
                </View>

                <View style={[styles.progressBarSmall, { height: 3, marginVertical: 12, marginLeft: 42 }]}>
                   <View style={[styles.progressFill, { width: p.val as any, backgroundColor: p.color }]} />
                </View>

                <View style={{ gap: 8, marginTop: 4, marginLeft: 42 }}>
                  {p.points.map((point, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                       <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: point.status === 'Done' ? '#10B981' : '#CBD5E1' }} />
                       <Text style={[styles.ledgerDate, { flex: 1, color: point.status === 'Done' ? '#475569' : '#94A3B8' }]}>{point.label}</Text>
                       {point.status === 'Done' && <CheckCircle2 size={10} color="#10B981" />}
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>NHEQF ALIGNMENT BY DEPT</Text>
        </View>

        <Card style={styles.ledgerCard}>
           <View style={{ padding: 16 }}>
              {alignments.map((align, idx) => (
                 <View key={idx} style={{ marginBottom: 16 }}>
                    <View style={styles.impactHeader}>
                       <Text style={styles.impactLabel}>{align.dept}</Text>
                       <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[styles.impactValPremium, { color: align.color, fontSize: 14 }]}>{align.progress}%</Text>
                          <Text style={[styles.ledgerDate, { fontSize: 9 }]}>{align.mapped} mapped</Text>
                       </View>
                    </View>
                    <View style={[styles.progressBarLarge, { height: 3, marginTop: 8 }]}>
                       <View style={[styles.progressFill, { width: (align.progress + '%') as any, backgroundColor: align.color }]} />
                    </View>
                 </View>
              ))}
           </View>
        </Card>

        <Card style={[styles.insightCard, { marginTop: 20 }]}>
           <View style={styles.insightTop}>
              <View style={[styles.insightIconBox, { backgroundColor: '#FEF3C7' }]}>
                 <ShieldAlert color="#92400E" size={16} />
              </View>
              <View style={{ flex: 1 }}>
                 <Text style={[styles.insightText, { color: '#92400E' }]}>Regulatory Window Alert</Text>
                 <Text style={styles.insightMeta}>Upcoming audit window for Pillar 3 (OBE) opens on **April 15, 2025**. Institutional data readiness is currently at **74%**.</Text>
              </View>
           </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const Ugc2026View = () => {
  const setupItems = [
    {
      title: "Equal Opportunity Centre (EOC)",
      status: "Not Established",
      color: "#EF4444",
      icon: "🏛️",
      isNew: true,
      bullets: ["Central hub for equity policies", "Financial support for students"]
    },
    {
      title: "Equity Committee",
      status: "Partially Done",
      color: "#F59E0B",
      icon: Users,
      isNew: false,
      bullets: ["Monthly meeting cadence", "SC/ST/OBC/Women/PwD reps"]
    },
    {
      title: "Equity Squads",
      status: "Not Started",
      color: "#EF4444",
      icon: Eye,
      isNew: false,
      bullets: ["Mobile squads: labs, canteen", "Real-time violation reporting"]
    }
  ];

  const slas = [
    { time: "24h", desc: "Equity Committee Formation", status: "Healthy", color: "#10B981" },
    { time: "15d", desc: "Investigation Report Submission", status: "Target", color: "#F59E0B" },
    { time: "7d", desc: "Institutional Action Resolution", status: "Target", color: "#F59E0B" },
    { time: "30d", desc: "Regulatory Appeal Window", status: "Healthy", color: "#10B981" }
  ];

  const penalties = [
    { title: "Grants Debarment", desc: "UGC funding schemes suspended.", icon: ShieldOff, color: "#EF4444" },
    { title: "Degree Suspension", desc: "Right to award degrees revoked.", icon: Award, color: "#F59E0B" },
    { title: "Recognition Removal", desc: "Delisted from HEI list.", icon: XCircle, color: "#EF4444" },
    { title: "Legal Liability", desc: "Officers face criminal action.", icon: AlertOctagon, color: "#EF4444" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Award size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>UGC 2026 GUIDELINES</Text>
          </View>
          <Text style={styles.title}>Mandatory SLAs</Text>
          <Text style={styles.subtitle}>Institutional timeline monitoring for UGC 2026</Text>
        </Animated.View>

        <Card style={styles.statusStayedCard}>
           <View style={styles.statusStayedTop}>
              <ShieldAlert size={18} color="#92400E" />
              <Text style={styles.statusStayedTitle}>Legal Status: Stayed by Supreme Court</Text>
           </View>
           <Text style={styles.statusStayedDesc}>Stayed Jan 2026; 2012 Regulations remain in force. Proactive planning ensures no future disruption.</Text>
        </Card>

        {/* Setup Grid */}
        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>SETUP MANDATORY UNITS</Text>
        </View>

        <View style={{ gap: 16 }}>
           {setupItems.map((item, idx) => (
              <Animated.View key={idx} entering={FadeInUp.delay(idx * 100)}>
                 <Card style={[styles.ledgerCard, { borderLeftWidth: 4, borderLeftColor: item.color, position: 'relative', overflow: 'visible' }]}>
                    {item.isNew && (
                       <View style={styles.newBadgeFloating}>
                          <Text style={styles.newBadgeText}>NEW</Text>
                       </View>
                    )}
                    <View style={{ padding: 16 }}>
                       <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                             <View style={[styles.iconBox, { backgroundColor: '#F8FAFC', width: 36, height: 36 }]}>
                                {typeof item.icon === 'string' ? <Text style={{ fontSize: 16 }}>{item.icon}</Text> : <item.icon size={18} color="#64748B" />}
                             </View>
                             <Text style={[styles.ledgerTask, { flex: 1 }]} numberOfLines={1}>{item.title}</Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: item.color + '15', marginLeft: 8 }]}>
                             <Text style={[styles.statusBadgeText, { color: item.color }]}>{item.status.toUpperCase()}</Text>
                          </View>
                       </View>
                       <View style={{ paddingLeft: 48 }}>
                          {item.bullets.map((bullet, i) => (
                             <Text key={i} style={[styles.ledgerDate, { marginBottom: 4 }]}>• {bullet}</Text>
                          ))}
                          <TouchableOpacity style={[styles.configBtn, { alignSelf: 'flex-start', marginTop: 12, backgroundColor: '#0F172A' }]}>
                             <Text style={[styles.configBtnText, { color: '#FFF' }]}>Setup Now</Text>
                          </TouchableOpacity>
                       </View>
                    </View>
                 </Card>
              </Animated.View>
           ))}
        </View>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>MANDATORY SLA TIMELINES</Text>
        </View>

        <Card style={styles.ledgerCard}>
          {slas.map((sla, i) => (
            <View key={i} style={[styles.ledgerRow, i === slas.length - 1 && styles.noBorder]}>
              <View style={styles.slaTimeBox}>
                 <Text style={styles.slaTimeVal}>{sla.time}</Text>
              </View>
              <View style={styles.ledgerMain}>
                <Text style={styles.ledgerTask}>{sla.desc}</Text>
                <View style={styles.ledgerMeta}>
                   <View style={[styles.statusBadge, { backgroundColor: sla.color + '15' }]}>
                      <Text style={[styles.statusBadgeText, { color: sla.color }]}>{sla.status.toUpperCase()}</Text>
                   </View>
                </View>
              </View>
              <TouchableOpacity style={styles.configBtn}>
                 <Text style={styles.configBtnText}>Review</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        {/* Penalties Section */}
        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>PENALTIES FOR NON-COMPLIANCE</Text>
        </View>

        <View style={{ gap: 12 }}>
           {penalties.map((penalty, idx) => (
              <Animated.View key={idx} entering={FadeInRight.delay(idx * 100)}>
                 <Card style={styles.penaltyCard}>
                    <View style={styles.penaltyIconColumn}>
                       <View style={[styles.iconBox, { backgroundColor: '#FEF2F2', width: 40, height: 40 }]}>
                          {typeof penalty.icon === 'string' ? <Text style={{ fontSize: 18 }}>{penalty.icon}</Text> : <penalty.icon size={20} color="#EF4444" />}
                       </View>
                    </View>
                    <View style={styles.penaltyContent}>
                       <Text style={styles.penaltyTitle}>{penalty.title}</Text>
                       <Text style={styles.penaltyDesc}>{penalty.desc}</Text>
                    </View>
                    <ShieldAlert size={14} color="#EF4444" opacity={0.3} />
                 </Card>
              </Animated.View>
           ))}
        </View>
      </ScrollView>
    </View>
  );
};

const GrievanceEngineView = () => {
  const topStats = [
    { label: "Open", value: "4", icon: AlertCircle, color: "#EF4444" },
    { label: "At Risk", value: "2", icon: Clock, color: "#F59E0B" },
    { label: "Resolved", value: "18", icon: CheckCircle2, color: "#10B981" },
    { label: "Rate", value: "91%", icon: TrendingUp, color: "#3B82F6" }
  ];

  const analytics = [
    { label: 'Discrimination', value: '32%', color: '#EF4444' },
    { label: 'Academic Bias', value: '24%', color: '#F59E0B' },
    { label: 'Infrastructure', value: '20%', color: '#3B82F6' },
    { label: 'Hostel', value: '16%', color: '#10B981' },
  ];

  const chartData = [30, 45, 25, 60, 80, 40, 35];

  const grievances = [
    { id: "GRV-001", type: "Discrimination", status: "Review", risk: "CRITICAL", filed: "Feb 20", elapsed: "3d", color: "#EF4444" },
    { id: "GRV-002", type: "Hostel Facility", status: "Resolved", risk: "NONE", filed: "Feb 18", elapsed: "14d", color: "#10B981" },
    { id: "GRV-003", type: "Academic Bias", status: "Escalated", risk: "SLA AT RISK", filed: "Feb 15", elapsed: "18d", color: "#F59E0B" },
    { id: "GRV-004", type: "Infrastructure", status: "Pending", risk: "SLA AT RISK", filed: "Feb 22", elapsed: "1d", color: "#F59E0B" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <ShieldAlert size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>GRIEVANCE ENGINE</Text>
          </View>
          <Text style={styles.title}>Live Tracker</Text>
          <Text style={styles.subtitle}>Monitoring student & faculty grievance SLAs</Text>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(100)} style={styles.statsRow}>
          {topStats.map((stat, i) => (
             <StatsCard 
               key={i} 
               title={stat.label} 
               value={stat.value} 
               icon={stat.icon} 
               color={stat.color} 
             />
          ))}
        </Animated.View>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>GRIEVANCE ANALYTICS</Text>
        </View>

        <Card style={[styles.ledgerCard, { padding: 20 }]}>
           <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8, marginBottom: 20 }}>
              {chartData.map((h, i) => (
                 <View 
                    key={i} 
                    style={{ 
                       flex: 1, 
                       height: (h + '%') as any, 
                       backgroundColor: '#F59E0B', 
                       borderTopLeftRadius: 4, 
                       borderTopRightRadius: 4,
                       opacity: 0.8
                    }} 
                 />
              ))}
           </View>

           <View style={{ gap: 12 }}>
              {analytics.map((item, i) => (
                 <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={[styles.ledgerTask, { width: 100, fontSize: 12 }]}>{item.label}</Text>
                    <View style={[styles.progressBarLarge, { flex: 1, height: 6 }]}>
                       <View style={[styles.progressFill, { width: item.value as any, backgroundColor: item.color }]} />
                    </View>
                    <Text style={[styles.ledgerDate, { width: 30, textAlign: 'right' }]}>{item.value}</Text>
                 </View>
              ))}
           </View>
        </Card>

        <Card style={styles.helplineCard}>
           <View style={styles.helplineIcon}>
              <Text style={{ fontSize: 20 }}>📞</Text>
           </View>
           <View style={{ flex: 1 }}>
              <Text style={styles.helplineTitle}>24/7 Anonymous Helpline</Text>
              <Text style={styles.helplineSub}>Institutional: 1800-STIDNX</Text>
           </View>
           <CheckCircle2 color="#10B981" size={20} />
        </Card>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>REDRESSAL LEDGER</Text>
        </View>

        <Card style={styles.ledgerCard}>
           {grievances.map((grv, idx) => (
              <View key={idx} style={[styles.ledgerRow, idx === grievances.length - 1 && styles.noBorder]}>
                 <View style={styles.ledgerMain}>
                    <View style={styles.ledgerHeaderRow}>
                       <Text style={styles.ledgerID}>{grv.id}</Text>
                       <View style={[styles.typeBadge, { backgroundColor: grv.color + '15' }]}>
                          <Text style={[styles.typeBadgeText, { color: grv.color }]}>{grv.type.toUpperCase()}</Text>
                       </View>
                    </View>
                    <Text style={styles.ledgerTask}>{grv.status}</Text>
                    <View style={styles.ledgerMeta}>
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Clock size={10} color="#64748B" />
                          <Text style={styles.ledgerDate}>{grv.elapsed} elapsed</Text>
                       </View>
                       <View style={styles.ledgerDot} />
                       <Text style={[styles.typeBadgeText, { color: grv.risk === 'NONE' ? '#10B981' : '#EF4444' }]}>{grv.risk}</Text>
                    </View>
                 </View>
                 <TouchableOpacity style={styles.reviewBtn}>
                    <Text style={styles.reviewBtnText}>Review</Text>
                 </TouchableOpacity>
              </View>
           ))}
        </Card>
      </ScrollView>
    </View>
  );
};

const PortfolioLockerView = () => {
  const stats = [
    { label: "Assets", value: "4.2k", icon: FileText, color: "#10B981" },
    { label: "Storage", value: "62GB", icon: BarChart, color: "#10B981" },
    { label: "Synced", value: "98%", icon: RefreshCcw, color: "#10B981" },
    { label: "Queue", value: "14", icon: Clock, color: "#F59E0B" }
  ];

  const portfolios = [
    { title: "SWAYAM/MOOCs", naac: "C3.1", items: "1,240", size: "4.2 GB", status: "Synced", icon: Award, color: "#10B981" },
    { title: "Intern Reports", naac: "C1.2", items: "847", size: "12.8 GB", status: "Synced", icon: Briefcase, color: "#10B981" },
    { title: "Research Logs", naac: "C3.2", items: "312", size: "28.4 GB", status: "Syncing", icon: BarChart, color: "#F59E0B" },
    { title: "Certifications", naac: "C3.3", items: "2,104", size: "1.8 GB", status: "Synced", icon: ShieldCheck, color: "#10B981" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <FolderKanban size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>STRIDEX LOCKER</Text>
          </View>
          <Text style={styles.title}>Evidence Vault</Text>
          <Text style={styles.subtitle}>Immutable evidence storage mapped to NAAC criteria</Text>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(100)} style={styles.statsRow}>
          {stats.map((s, i) => (
             <StatsCard 
               key={i} 
               title={s.label} 
               value={s.value} 
               icon={s.icon} 
               color={s.color} 
             />
          ))}
        </Animated.View>

        <Card style={[styles.lockerInfoCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', padding: 16 }]}>
           <ShieldCheck size={18} color="#64748B" />
           <View style={{ flex: 1 }}>
              <Text style={[styles.lockerInfoTitle, { color: '#0F172A' }]}>Automated Hashing Active</Text>
              <Text style={styles.lockerInfoSub}>All evidence is auto-tagged and encrypted for integrity.</Text>
           </View>
           <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>ENCRYPTED</Text>
           </View>
        </Card>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>CRITERIA BUCKETS</Text>
        </View>

        <View style={styles.portfolioGrid}>
           {portfolios.map((item, idx) => (
              <View key={idx} style={styles.portfolioCol}>
                 <Card style={[styles.portfolioCard, { borderColor: '#F1F5F9', borderBottomWidth: 2, borderBottomColor: '#F1F5F9' }]}>
                    <View style={styles.portfolioTop}>
                       <View style={[styles.iconBox, { backgroundColor: '#F8FAFC', width: 32, height: 32, borderRadius: 8 }]}>
                          <item.icon size={16} color={item.status === 'Synced' ? '#64748B' : item.color} />
                       </View>
                       <View style={[styles.statusBadgeSmall, { backgroundColor: '#F1F5F9' }]}>
                          <Text style={[styles.statusBadgeTextSmall, { color: '#64748B' }]}>{item.status.toUpperCase()}</Text>
                       </View>
                    </View>
                    <Text style={[styles.portfolioTitle, { color: '#1E293B' }]} numberOfLines={1}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                       <Text style={[styles.portfolioNaac, { color: '#94A3B8' }]}>CRITERIA</Text>
                       <Text style={[styles.portfolioNaac, { fontWeight: '600', color: '#64748B' }]}>{item.naac}</Text>
                    </View>
                     <View style={styles.portfolioStats}>
                        <View>
                           <Text style={styles.statValSmall}>{item.items}</Text>
                           <Text style={styles.statLabelMini}>ASSETS</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                           <Text style={[styles.statValSmall, { color: '#1E293B' }]}>{item.size}</Text>
                           <Text style={styles.statLabelMini}>DATA</Text>
                        </View>
                     </View>
                 </Card>
              </View>
           ))}
        </View>
      </ScrollView>
    </View>
  );
};

const AbcCreditsView = () => {
  const departments = [
    { name: "Computer Science", registered: "420", credits: "8,420", exit: "12 students", sync: "Synced", syncColor: "#10B981" },
    { name: "Electronics", registered: "380", credits: "7,600", exit: "8 students", sync: "Synced", syncColor: "#10B981" },
    { name: "Mechanical", registered: "340", credits: "6,120", exit: "5 students", sync: "Synced", syncColor: "#10B981" },
    { name: "MBA", registered: "180", credits: "3,240", exit: "3 students", sync: "Issues", syncColor: "#F59E0B" },
    { name: "Civil", registered: "290", credits: "4,350", exit: "2 students", sync: "Synced", syncColor: "#10B981" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Target size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>ABC CREDIT SYNC</Text>
          </View>
          <Text style={styles.title}>Portal Integration</Text>
          <Text style={styles.subtitle}>Direct integration with DigiLocker and NAD portal</Text>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(100)} style={styles.statsRow}>
          <StatsCard title="Success" value="98.2%" icon={RefreshCcw} color="#10B981" />
          <StatsCard title="Credits" value="18.4k" icon={Link2} color="#10B981" />
          <StatsCard title="Batches" value="124" icon={CheckCircle2} color="#10B981" />
          <StatsCard title="Issues" value="41" icon={AlertCircle} color="#F59E0B" />
        </Animated.View>

        {/* Integration Status Banners */}
        <View style={{ gap: 12, marginBottom: 20 }}>
           <Card style={[styles.apiConnectionRow, { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9' }]}>
              <CheckCircle2 size={16} color="#10B981" />
              <View style={{ flex: 1 }}>
                 <Text style={[styles.apiTitle, { color: '#1E293B' }]}>API Protocol: Active</Text>
                 <Text style={[styles.apiSub, { color: '#64748B' }]}>NAD Endpoint v2.1 — Refreshed 2h ago</Text>
              </View>
              <View style={[styles.liveIndicator, { backgroundColor: '#10B981' }]} />
           </Card>
           
           <Card style={[styles.apiConnectionRow, { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9' }]}>
              <Zap size={16} color="#3B82F6" />
              <View style={{ flex: 1 }}>
                 <Text style={[styles.apiTitle, { color: '#1E293B' }]}>Automated Synchronization</Text>
                 <Text style={[styles.apiSub, { color: '#64748B' }]}>Course completion triggers active</Text>
              </View>
              <View style={[styles.liveIndicator, { backgroundColor: '#3B82F6' }]} />
           </Card>

           <TouchableOpacity style={[styles.apiConnectionRow, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }]}>
              <AlertCircle size={16} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                 <Text style={[styles.apiTitle, { color: '#92400E' }]}>Sync Exception: 41 Nodes</Text>
                 <Text style={[styles.apiSub, { color: '#D97706' }]}>Data mismatch detected in batch #84</Text>
              </View>
              <ChevronRight size={14} color="#F59E0B" />
           </TouchableOpacity>
        </View>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>DEPARTMENTAL STATUS</Text>
        </View>

        <Card style={styles.ledgerCard}>
           {departments.map((dept, idx) => (
              <View key={idx} style={[styles.ledgerRow, idx === departments.length - 1 && styles.noBorder]}>
                 <View style={styles.ledgerMain}>
                    <Text style={[styles.ledgerTask, { color: '#1E293B' }]}>{dept.name}</Text>
                    <View style={styles.ledgerMeta}>
                       <Text style={styles.ledgerDate}>Reg: {dept.registered}</Text>
                       <View style={styles.ledgerDot} />
                       <Text style={[styles.priorityLabel, { color: '#64748B' }]}>{dept.credits} Credits</Text>
                       <View style={styles.ledgerDot} />
                       <Text style={styles.ledgerDate}>{dept.exit} out</Text>
                    </View>
                 </View>
                 <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dept.syncColor, marginRight: 6 }} />
                    <Text style={[styles.statusBadgeText, { color: '#64748B' }]}>{dept.sync.toUpperCase()}</Text>
                 </View>
              </View>
           ))}
        </Card>
      </ScrollView>
    </View>
  );
};

const EquityAuditView = () => {
  const topStats = [
    { label: "SC Cluster", value: "12%", target: "Target: 15%", status: "Below target", icon: AlertCircle, color: "#F59E0B" },
    { label: "ST Cluster", value: "6.6%", target: "Target: 7.5%", status: "Below target", icon: AlertCircle, color: "#F59E0B" },
    { label: "OBC Pool", value: "30%", target: "Target: 27%", status: "Met target", icon: CheckCircle2, color: "#10B981" },
    { label: "PwD Acc.", value: "1.6%", target: "Target: 3%", status: "Below target", icon: AlertCircle, color: "#EF4444" }
  ];

  const indicators = [
    { label: "Admission Equity", progress: 68, color: "#F59E0B" },
    { label: "Hostel Fairness", progress: 82, color: "#10B981" },
    { label: "Scholarship Distribution", progress: 74, color: "#3B82F6" },
    { label: "Faculty Representation", progress: 45, color: "#EF4444" },
    { label: "Grievance Resolution", progress: 58, color: "#F59E0B" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <BarChart size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>EQUITY AUDIT 2025</Text>
          </View>
          <Text style={styles.title}>Diversity Score</Text>
          <Text style={styles.subtitle}>Institutional diversity and inclusion monitoring</Text>
        </Animated.View>

        {/* AI Analyst Insight Card */}
        <Animated.View entering={FadeInRight.delay(100)}>
           <Card style={[styles.insightCard, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
              <View style={styles.insightTop}>
                 <View style={[styles.insightIconBox, { backgroundColor: '#FFF' }]}>
                    <Zap color="#059669" size={16} />
                 </View>
                 <View style={{ flex: 1 }}>
                    <Text style={styles.insightText}>Equity Insight Summary</Text>
                    <Text style={styles.insightMeta}>The **Institutional Equity Index** has improved by **2.8%**. Critical gap identified in **Faculty Representation (45%)** and **PwD Access (1.6%)**. Corrective measures recommended.</Text>
                 </View>
              </View>
           </Card>
        </Animated.View>

        {/* Global Diversity Score Banner */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <Card style={[styles.scoreBanner, { backgroundColor: '#FFF', marginBottom: 24, padding: 20, borderTopWidth: 4, borderTopColor: '#F59E0B' }]}>
            <View style={styles.scoreContent}>
               <View style={styles.scoreGaugeContainer}>
                  <View style={[styles.scoreCircleLarge, { borderColor: '#F59E0B' }]}>
                     <Text style={styles.scoreValueBig}>72</Text>
                     <Text style={styles.scoreLabelSmall}>SCORE</Text>
                  </View>
               </View>
               <View style={styles.scoreInfo}>
                  <Text style={styles.bannerTitle}>Diversity Compliance</Text>
                  <Text style={styles.bannerSub}>Aggregate index across Admission, Faculty, and Facilities.</Text>
                  <View style={styles.statusBadgeRow}>
                     <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                        <TrendingUp size={10} color="#059669" />
                        <Text style={[styles.statusBadgeText, { color: '#059669', marginLeft: 4 }]}>ON TRACK</Text>
                     </View>
                  </View>
               </View>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.metricsGrid}>
          {topStats.map((stat, i) => (
             <View key={i} style={styles.metricWrapper}>
                <Card style={[styles.metricCard, { borderBottomWidth: 4, borderBottomColor: stat.color + '40' }]}>
                   <View style={styles.metricHeader}>
                      <View style={[styles.iconBox, { backgroundColor: stat.color + '10' }]}>
                         <stat.icon size={16} color={stat.color} />
                      </View>
                      {stat.status === 'Met target' ? <CheckCircle2 size={12} color="#10B981" /> : <AlertTriangle size={12} color={stat.color} />}
                   </View>
                   <Text style={[styles.metricValLarge, { color: '#0F172A', marginTop: 8 }]}>{stat.value}</Text>
                   <Text style={[styles.metricLabelLong, { color: '#64748B' }]}>{stat.label}</Text>
                   <View style={styles.targetRow}>
                      <Text style={styles.targetLabel}>{stat.target}</Text>
                   </View>
                </Card>
             </View>
          ))}
        </View>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>IMPACT INDICATORS</Text>
           <Text style={styles.sectionValue}>5 Metrics Tracked</Text>
        </View>

        <Card style={styles.ledgerCard}>
           <View style={{ padding: 16 }}>
              {indicators.map((ind, idx) => (
                 <View key={idx} style={{ marginBottom: 20 }}>
                    <View style={styles.impactHeader}>
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={[styles.dot, { backgroundColor: ind.progress < 50 ? '#EF4444' : ind.progress < 75 ? '#F59E0B' : '#10B981' }]} />
                          <Text style={styles.impactLabel}>{ind.label}</Text>
                       </View>
                       <Text style={[styles.impactValPremium, { color: ind.color }]}>{ind.progress}%</Text>
                    </View>
                    <View style={styles.progressBarWrapper}>
                       <View style={[styles.progressBarLarge, { height: 4, backgroundColor: '#F1F5F9' }]}>
                          <View style={[styles.progressFill, { width: (ind.progress + '%') as any, backgroundColor: ind.color }]} />
                       </View>
                    </View>
                 </View>
              ))}
              <View style={styles.footerRow}>
                 <Clock size={10} color="#94A3B8" />
                 <Text style={styles.footerText}>Certified Audit: March 12, 2024</Text>
              </View>
           </View>
        </Card>

        <View style={styles.actionRowGroup}>
           <TouchableOpacity style={styles.primaryActionBtnWide}>
              <Download size={18} color="#FFF" />
              <Text style={styles.primaryActionTextLarge}>Generate Equity Report</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.secondaryActionBtnWide}>
              <Text style={styles.secondaryActionTextLarge}>Export Audit Data (.xlsx)</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const ReportsView = () => {
  const reports = [
    { target: "NEP 2020 Compliance Report", desc: "HPC, ABC, OBE, Equity — all pillars", formats: "PDF / Word", status: "Ready", color: "#10B981", icon: BarChart },
    { target: "UGC 2026 Equity Readiness", desc: "EOC status, grievance SLA data", formats: "PDF", status: "Pending", color: "#F59E0B", icon: ShieldCheck },
    { target: "NAAC Self-Study Report Pack", desc: "Pre-formatted NAAC 2024 template", formats: "Word / PDF", status: "Ready", color: "#F59E0B", icon: FileText },
    { target: "ABC Credit Summary Report", desc: "Student-wise credit for NAD sub.", formats: "Excel / CSV", status: "Ready", color: "#10B981", icon: Target },
    { target: "OBE Attainment Analytics", desc: "Course-LO mapping by department", formats: "Excel", status: "Pending", color: "#EF4444", icon: BarChart },
    { target: "Holistic Progress Card Batch", desc: "Bulk generate HPC for all students", formats: "PDF (bulk)", status: "Ready", color: "#10B981", icon: Award },
    { target: "Industry MoU Report", desc: "Active partnerships, intern outcomes", formats: "PDF", status: "Ready", color: "#10B981", icon: Briefcase },
    { target: "Grievance Resolution Report", desc: "Monthly stats, SLA compliance data", formats: "PDF", status: "Ready", color: "#10B981", icon: CheckCircle2 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <FileText size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>DOCUMENT ENGINE</Text>
          </View>
          <Text style={styles.title}>Compliance Reports</Text>
          <Text style={styles.subtitle}>Generate and download regulatory documentation</Text>
        </Animated.View>

        <View style={{ gap: 16 }}>
           {reports.map((report, idx) => (
              <Animated.View key={idx} entering={FadeInUp.delay(idx * 50)}>
                 <Card style={styles.ledgerCard}>
                    <View style={{ padding: 16 }}>
                       <View style={{ flexDirection: 'row', gap: 16 }}>
                          <View style={[styles.iconBox, { backgroundColor: '#F8FAFC', width: 44, height: 44 }]}>
                             <report.icon size={20} color={report.status === 'Ready' ? report.color : '#64748B'} />
                          </View>
                          <View style={{ flex: 1 }}>
                             <Text style={styles.ledgerTask}>{report.target}</Text>
                             <Text style={styles.ledgerDate}>{report.desc}</Text>
                             
                             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                   <Text style={[styles.ledgerDate, { fontSize: 10, fontWeight: '700' }]}>{report.formats}</Text>
                                   <View style={[styles.statusBadge, { backgroundColor: report.color + '15' }]}>
                                      <Text style={[styles.statusBadgeText, { color: report.color }]}>{report.status.toUpperCase()}</Text>
                                   </View>
                                </View>
                                {report.status === 'Ready' ? (
                                   <TouchableOpacity style={[styles.configBtn, { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }]}>
                                      <Download size={12} color="#FFF" style={{ marginRight: 4 }} />
                                      <Text style={[styles.configBtnText, { color: '#FFF' }]}>Download</Text>
                                   </TouchableOpacity>
                                ) : (
                                   <TouchableOpacity style={styles.configBtn}>
                                      <Text style={styles.configBtnText}>Configure</Text>
                                   </TouchableOpacity>
                                )}
                             </View>
                          </View>
                       </View>
                    </View>
                 </Card>
              </Animated.View>
           ))}
        </View>
      </ScrollView>
    </View>
  );
};
