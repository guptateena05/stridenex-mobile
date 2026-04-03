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
  ChevronRight, ArrowUpRight, ShieldAlert, Award, Zap
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const complianceMetrics = [
  { id: 1, title: 'Holistic', value: '62%', status: 'Action', color: '#F59E0B', icon: FileText },
  { id: 2, title: 'ABC Sync', value: '78%', status: 'Healthy', color: '#10B981', icon: Target },
  { id: 3, title: 'Equity', value: '40%', status: 'Critical', color: '#EF4444', icon: Users },
  { id: 4, title: 'UDISE+', value: '85%', status: 'Healthy', color: '#10B981', icon: BarChart },
];

const deadlines = [
  { id: 1, date: 'Mar 15', task: 'NAAC Self-Study Report Submission', priority: 'High', color: '#EF4444' },
  { id: 2, date: 'Mar 20', task: 'ABC Credit Data Portal Upload', priority: 'Medium', color: '#F59E0B' }
];

export const CollegeNepUgcScreen = ({ route }: any) => {
  const tab = route?.params?.tab || 'Dashboard';

  if (tab === 'NEP 2020') return <Nep2020View />;
  if (tab === 'UGC 2026') return <Ugc2026View />;
  if (tab === 'Grievance Engine') return <GrievanceEngineView />;
  if (tab === 'Portfolio Locker') return <PortfolioLockerView />;
  if (tab === 'ABC Credits') return <AbcCreditsView />;
  if (tab === 'Equity Audit') return <EquityAuditView />;

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
          <Card style={styles.scoreBanner}>
            <View style={styles.scoreContent}>
               <View style={styles.scoreCircle}>
                  <Text style={styles.scoreValue}>64</Text>
                  <Text style={styles.scoreLabel}>OVERALL</Text>
               </View>
               <View style={styles.scoreInfo}>
                  <Text style={styles.bannerTitle}>Institutional Score</Text>
                  <Text style={styles.bannerSub}>Aggregate compliance across NEP, UGC, and NAAC mandates.</Text>
                  <View style={styles.bannerTrend}>
                     <TrendingUp size={12} color="#10B981" />
                     <Text style={styles.trendText}>+4.2% since last audit</Text>
                  </View>
               </View>
            </View>
          </Card>
        </Animated.View>

        {/* 4-in-a-row Stats */}
        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>CRITICAL PILLARS</Text>
        </View>

        <Animated.View entering={FadeInRight.delay(150)} style={styles.statsRow}>
          {complianceMetrics.map((stat, i) => (
             <StatsCard 
               key={i} 
               title={stat.title} 
               value={stat.value} 
               icon={stat.icon} 
               color={stat.color} 
             />
          ))}
        </Animated.View>

        {/* Analyst Insight Card */}
        <Card style={styles.insightCard}>
           <View style={styles.insightTop}>
              <View style={styles.insightIconBox}>
                 <Zap color="#059669" size={16} />
              </View>
              <View style={{ flex: 1 }}>
                 <Text style={styles.insightText}>Analyst Recommendation</Text>
                 <Text style={styles.insightMeta}>Immediate update required for **Pillar 3 (Equity)**. Compliance gap detected in EOC committee formation.</Text>
              </View>
           </View>
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

  // Score Banner
  scoreBanner: { padding: 20, borderRadius: 20, backgroundColor: '#0F172A', marginBottom: 24, borderWidth: 0 },
  scoreContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  scoreValue: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  scoreLabel: { fontSize: 8, fontWeight: '800', color: '#10B981' },
  scoreInfo: { flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  bannerSub: { fontSize: 11, color: '#94A3B8', lineHeight: 15 },
  bannerTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  trendText: { fontSize: 10, fontWeight: '700', color: '#10B981' },

  // Section Headers
  sectionTitleRow: { marginBottom: 12, marginTop: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1 },

  // Metrics Grid
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  metricWrapper: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },
  metricCard: { padding: 16, borderRadius: 20, backgroundColor: '#FFF' },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
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
  metricValLarge: { fontSize: 16, fontWeight: '800' },
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
  
  slaTimeBox: { width: 50, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#F8FAFC', paddingVertical: 8, borderRadius: 12 },
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
  progressBarLarge: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
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
    { title: "Progress Cards", val: "62%", status: "Action", color: "#F59E0B", icon: FileText },
    { title: "Credits Bank", val: "78%", status: "Healthy", color: "#10B981", icon: Target },
    { title: "OBE System", val: "55%", status: "Issue", color: "#F59E0B", icon: BarChart },
    { title: "Equity Score", val: "40%", status: "Critical", color: "#EF4444", icon: Users }
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <FileText size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>NEP 2020 MANDATE</Text>
          </View>
          <Text style={styles.title}>National Policy</Text>
          <Text style={styles.subtitle}>Institutional compliance with NEP 2020 core pillars</Text>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(100)} style={styles.statsRow}>
          {pillars.map((p, i) => (
             <StatsCard 
               key={i} 
               title={p.title.split(' ')[0]} 
               value={p.val} 
               icon={p.icon} 
               color={p.color} 
             />
          ))}
        </Animated.View>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>COMPLIANCE LEDGER</Text>
        </View>

        <Card style={styles.ledgerCard}>
          {pillars.map((p, i) => (
            <View key={i} style={[styles.ledgerRow, i === pillars.length - 1 && styles.noBorder]}>
              <View style={[styles.priorityIndicator, { backgroundColor: p.color }]} />
              <View style={styles.ledgerMain}>
                <View style={styles.ledgerHeaderRow}>
                   <Text style={styles.ledgerTask}>{p.title}</Text>
                   <Text style={[styles.metricValLarge, { color: '#1E293B' }]}>{p.val}</Text>
                </View>
                <View style={styles.ledgerMeta}>
                   <View style={[styles.statusBadge, { backgroundColor: p.color + '15' }]}>
                      <Text style={[styles.statusBadgeText, { color: p.color }]}>{p.status.toUpperCase()}</Text>
                   </View>
                   <Text style={styles.ledgerDate}>Target: 100% Compliance</Text>
                </View>
                <View style={styles.progressBarSmall}>
                   <View style={[styles.progressFill, { width: p.val as any, backgroundColor: p.color }]} />
                </View>
              </View>
              <TouchableOpacity style={styles.actionIconBox}>
                 <ArrowUpRight size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        <Card style={styles.infoHighlightCard}>
           <ShieldAlert size={20} color="#92400E" />
           <View style={{ flex: 1 }}>
              <Text style={styles.infoHighlightTitle}>Regulatory Alert</Text>
              <Text style={styles.infoHighlightSub}>Upcoming audit window for Pillar 3 (OBE) opens on April 15, 2025. Ensure all data is ready.</Text>
           </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const Ugc2026View = () => {
  const slas = [
    { time: "24 Hours", desc: "Equity Committee Formation", status: "Healthy", color: "#10B981" },
    { time: "15 Days", desc: "Investigation Report Submission", status: "Target", color: "#F59E0B" },
    { time: "7 Days", desc: "Institutional Action Resolution", status: "Target", color: "#F59E0B" },
    { time: "30 Days", desc: "Regulatory Appeal Window", status: "Healthy", color: "#10B981" }
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
              <Text style={styles.statusStayedTitle}>Legal Status: Stayed by SC</Text>
           </View>
           <Text style={styles.statusStayedDesc}>Current mandates are under supreme court stay until Aug 2025. Proactive planning is recommended.</Text>
        </Card>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>TIMELINE LEDGER</Text>
        </View>

        <Card style={styles.ledgerCard}>
          {slas.map((sla, i) => (
            <View key={i} style={[styles.ledgerRow, i === slas.length - 1 && styles.noBorder]}>
              <View style={styles.slaTimeBox}>
                 <Text style={styles.slaTimeVal}>{sla.time.split(' ')[0]}</Text>
                 <Text style={styles.slaTimeUnit}>{sla.time.split(' ')[1]}</Text>
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
      </ScrollView>
    </View>
  );
};

const GrievanceEngineView = () => {
  const topStats = [
    { label: "Open", value: "4", icon: AlertCircle, color: "#EF4444" },
    { label: "At Risk", value: "2", icon: Clock, color: "#F59E0B" },
    { label: "Resolved", value: "18", icon: CheckSquare, color: "#10B981" },
    { label: "Uptime", value: "91%", icon: TrendingUp, color: "#10B981" }
  ];

  const grievances = [
    { id: "GRV-001", type: "Discrimination", status: "Review", risk: "Critical", filed: "Feb 20", elapsed: "3d", color: "#F59E0B" },
    { id: "GRV-002", type: "Hostel Facility", status: "Resolved", risk: "None", filed: "Feb 18", elapsed: "14d", color: "#10B981" },
    { id: "GRV-003", type: "Academic Bias", status: "Escalated", risk: "SLA At Risk", filed: "Feb 15", elapsed: "18d", color: "#EF4444" },
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
                       <Text style={styles.ledgerDate}>Filed: {grv.filed}</Text>
                       <View style={styles.ledgerDot} />
                       <Text style={[styles.priorityLabel, { color: grv.elapsed === '3d' ? '#F59E0B' : '#64748B' }]}>{grv.elapsed} elapsed</Text>
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
    { title: "SWAYAM/MOOCs", naac: "C3.1", items: "1,240", status: "Synced", icon: Award, color: "#10B981" },
    { title: "Intern Reports", naac: "C1.2", items: "847", status: "Synced", icon: Briefcase, color: "#10B981" },
    { title: "Research Logs", naac: "C3.2", items: "312", status: "Syncing", icon: BarChart, color: "#F59E0B" },
    { title: "Certifications", naac: "C3.3", items: "2,104", status: "Synced", icon: ShieldCheck, color: "#10B981" },
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

        <Card style={styles.lockerInfoCard}>
           <ShieldCheck size={20} color="#065F46" />
           <View style={{ flex: 1 }}>
              <Text style={styles.lockerInfoTitle}>Automated Hashing Active</Text>
              <Text style={styles.lockerInfoSub}>All evidence is auto-tagged and encrypted for institutional integrity.</Text>
           </View>
        </Card>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>CRITERIA BUCKETS</Text>
        </View>

        <View style={styles.portfolioGrid}>
           {portfolios.map((item, idx) => (
              <View key={idx} style={styles.portfolioCol}>
                 <Card style={styles.portfolioCard}>
                    <View style={styles.portfolioTop}>
                       <View style={[styles.iconBox, { backgroundColor: item.color + '10' }]}>
                          <item.icon size={16} color={item.color} />
                       </View>
                       <View style={[styles.statusBadgeSmall, { backgroundColor: item.color + '15' }]}>
                          <Text style={[styles.statusBadgeTextSmall, { color: item.color }]}>{item.status.toUpperCase()}</Text>
                       </View>
                    </View>
                    <Text style={styles.portfolioTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.portfolioNaac}>NAAC: {item.naac}</Text>
                    <View style={styles.portfolioStats}>
                       <View>
                          <Text style={styles.statValSmall}>{item.items}</Text>
                          <Text style={styles.statLabelMini}>FILES</Text>
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
    { name: "Computer Science", registered: "420", credits: "8,420", sync: "Healthy", color: "#10B981" },
    { name: "Electronics", registered: "380", credits: "7,600", sync: "Healthy", color: "#10B981" },
    { name: "MBA", registered: "180", credits: "3,240", sync: "Audit", color: "#F59E0B" },
    { name: "Mechanical", registered: "340", credits: "6,120", sync: "Healthy", color: "#10B981" },
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

        <Card style={styles.ledgerCard}>
           <View style={styles.apiConnectionRow}>
              <CheckCircle2 size={16} color="#10B981" />
              <View style={{ flex: 1 }}>
                 <Text style={styles.apiTitle}>NAD API Connected</Text>
                 <Text style={styles.apiSub}>v2.1 — Last healthy sync 2h ago</Text>
              </View>
              <View style={styles.liveIndicator} />
           </View>
           <View style={styles.apiDivider} />
           <TouchableOpacity style={styles.apiConnectionRow}>
              <AlertCircle size={16} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                 <Text style={styles.apiTitle}>41 Pending Syncs</Text>
                 <Text style={styles.apiSub}>Mismatch detected in batch #84</Text>
              </View>
              <ChevronRight size={14} color="#CBD5E1" />
           </TouchableOpacity>
        </Card>

        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>DEPARTMENTAL STATUS</Text>
        </View>

        <Card style={styles.ledgerCard}>
           {departments.map((dept, idx) => (
              <View key={idx} style={[styles.ledgerRow, idx === departments.length - 1 && styles.noBorder]}>
                 <View style={styles.ledgerMain}>
                    <Text style={styles.ledgerTask}>{dept.name}</Text>
                    <View style={styles.ledgerMeta}>
                       <Text style={styles.ledgerDate}>Reg: {dept.registered}</Text>
                       <View style={styles.ledgerDot} />
                       <Text style={[styles.priorityLabel, { color: '#059669' }]}>{dept.credits} Credits</Text>
                    </View>
                 </View>
                 <View style={[styles.statusBadge, { backgroundColor: dept.color + '15' }]}>
                    <Text style={[styles.statusBadgeText, { color: dept.color }]}>{dept.sync.toUpperCase()}</Text>
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
    { label: "SC Cluster", value: "12%", icon: Users, color: "#F59E0B" },
    { label: "ST Cluster", value: "6.6%", icon: Users, color: "#F59E0B" },
    { label: "OBC Pool", value: "30%", icon: Users, color: "#10B981" },
    { label: "PwD Acc.", value: "1.6%", icon: ShieldCheck, color: "#EF4444" }
  ];

  const indicators = [
    { label: "Admission Equity", progress: 68, color: "#EF4444" },
    { label: "Hostel Fairness", progress: 82, color: "#10B981" },
    { label: "Faculty Multi-diversity", progress: 45, color: "#EF4444" },
    { label: "Barrier-Free Infrastructure", progress: 58, color: "#F59E0B" },
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
           <Text style={styles.sectionLabel}>IMPACT INDICATORS</Text>
        </View>

        <Card style={styles.ledgerCard}>
           {indicators.map((ind, idx) => (
              <View key={idx} style={[styles.impactRow, idx === indicators.length - 1 && styles.noBorder]}>
                 <View style={styles.impactHeader}>
                    <Text style={styles.impactLabel}>{ind.label}</Text>
                    <Text style={[styles.impactVal, { color: ind.color }]}>{ind.progress}%</Text>
                 </View>
                 <View style={styles.progressBarLarge}>
                    <View style={[styles.progressFill, { width: (ind.progress + '%') as any, backgroundColor: ind.color }]} />
                 </View>
              </View>
           ))}
        </Card>

        <View style={styles.actionRowGroup}>
           <TouchableOpacity style={styles.primaryActionBtn}>
              <Download size={16} color="#FFF" />
              <Text style={styles.primaryActionText}>Generate UGC Report</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.secondaryActionBtn}>
              <Text style={styles.secondaryActionText}>Export to Excel</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
