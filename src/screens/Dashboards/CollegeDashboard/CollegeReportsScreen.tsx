import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { 
  Download, FileText, BarChart, FileJson, 
  Zap, RefreshCcw, Clock, Briefcase,
  FileCheck2, ShieldCheck, ChevronRight
} from 'lucide-react-native';

import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const topStats = [
  { label: "Ready", value: "24", icon: FileCheck2, color: "#10B981" },
  { label: "Processing", value: "3", icon: RefreshCcw, color: "#F59E0B" },
  { label: "Scheduled", value: "12", icon: Clock, color: "#64748B" },
  { label: "Total", value: "184", icon: BarChart, color: "#10B981" }
];

const reports = [
  { id: "REP-001", target: "NEP 2020 Compliance Pack", desc: "HPC, ABC, OBE, Equity — all pillars with evidence", lastSync: "2h ago", formats: ["PDF", "Word"], status: "Ready", icon: BarChart, color: "#10B981" },
  { id: "REP-002", target: "UGC 2026 Equity Readiness", desc: "EOC status, grievance SLA, equity audit data", lastSync: "1d ago", formats: ["PDF"], status: "Pending", icon: FileText, color: "#F59E0B" },
  { id: "REP-003", target: "NAAC Self-Study Report Pack", desc: "Pre-formatted as per NAAC 2024 SSR template", lastSync: "2d ago", formats: ["Word", "PDF"], status: "Ready", icon: ShieldCheck, color: "#10B981" },
  { id: "REP-004", target: "ABC Credit Summary Report", desc: "Student-wise credit accumulation for NAD", lastSync: "1h ago", formats: ["Excel", "CSV"], status: "Ready", icon: FileJson, color: "#10B981" },
  { id: "REP-005", target: "OBE Attainment Analytics", desc: "Course-LO mapping and attainment levels", lastSync: "3d ago", formats: ["Excel"], status: "In Queue", icon: BarChart, color: "#64748B" },
  { id: "REP-006", target: "Holistic Progress Batch Export", desc: "Bulk HPC export — print-ready bundle", lastSync: "4h ago", formats: ["PDF (bulk)"], status: "Ready", icon: FileText, color: "#10B981" },
  { id: "REP-007", target: "Industry Collaboration MoU Report", desc: "Active partnerships, intern outcomes, co-curriculum", lastSync: "5h ago", formats: ["PDF"], status: "Ready", icon: Briefcase, color: "#10B981" },
  { id: "REP-008", target: "Grievance Resolution Report", desc: "Monthly stats, SLA compliance, anonymised data", lastSync: "1h ago", formats: ["PDF"], status: "Ready", icon: ShieldCheck, color: "#10B981" },
];

export const CollegeReportsScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <FileText size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>INSTITUTIONAL REPORTS</Text>
          </View>
          <Text style={styles.title}>Data Extraction</Text>
          <Text style={styles.subtitle}>Institutional compliance, academic and audit reports</Text>
        </Animated.View>

        {/* 4-in-a-row Stats */}
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

        {/* Analyst Insight Card */}
        <Card style={styles.insightCard}>
           <View style={styles.insightTop}>
              <View style={styles.insightIconBox}>
                 <Zap color="#059669" size={16} />
              </View>
              <View style={{ flex: 1 }}>
                 <Text style={styles.insightText}>Analyst Summary</Text>
                 <Text style={styles.insightMeta}>New **NAAC 2024 Template** is active. Automated mapping has been completed for Criteria 1.2 and 3.1. Ready for export.</Text>
              </View>
           </View>
        </Card>

        {/* Reports Ledger */}
        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>REPORT LEDGER</Text>
        </View>

        <Card style={styles.ledgerCard}>
           {reports.map((report, idx) => (
              <View key={idx} style={[styles.ledgerRow, idx === reports.length - 1 && styles.noBorder]}>
                 <View style={[styles.priorityIndicator, { backgroundColor: report.color }]} />
                 <View style={styles.ledgerMain}>
                    <View style={styles.ledgerHeaderRow}>
                       <Text style={styles.ledgerID}>{report.id}</Text>
                       <View style={[styles.typeBadge, { backgroundColor: report.color + '15' }]}>
                          <Text style={[styles.typeBadgeText, { color: report.color }]}>{report.status.toUpperCase()}</Text>
                       </View>
                    </View>
                    <Text style={styles.ledgerTask}>{report.target}</Text>
                    <View style={styles.ledgerMeta}>
                       <Text style={styles.ledgerDate}>Formats: {report.formats.join('/')}</Text>
                       <View style={styles.ledgerDot} />
                       <Text style={styles.ledgerDate}>Last Sync: {report.lastSync}</Text>
                    </View>
                 </View>
                 <TouchableOpacity style={[styles.actionIconBox, report.status === 'Ready' && { backgroundColor: '#D1FAE5', borderColor: '#D1FAE5' }]}>
                    <Download size={14} color={report.status === 'Ready' ? '#059669' : '#CBD5E1'} />
                 </TouchableOpacity>
              </View>
           ))}
        </Card>

        <View style={styles.actionRowGroup}>
           <TouchableOpacity style={styles.primaryActionBtn}>
              <Download size={16} color="#FFF" />
              <Text style={styles.primaryActionText}>Export Master Ledger</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.secondaryActionBtn}>
              <Text style={styles.secondaryActionText}>Schedule Bulk Sync</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 },
  header: { marginBottom: 24, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24 },

  insightCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', borderLeftWidth: 4, borderLeftColor: '#059669', marginBottom: 24 },
  insightTop: { flexDirection: 'row', gap: 12 },
  insightIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D1FAE5' },
  insightText: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  insightMeta: { fontSize: 11, color: '#64748B', lineHeight: 16, fontWeight: '500' },

  sectionTitleRow: { marginBottom: 12, marginTop: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1 },

  ledgerCard: { padding: 0, borderRadius: 20, backgroundColor: '#FFF', overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', borderLeftWidth: 4, borderLeftColor: '#059669' },
  ledgerRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  noBorder: { borderBottomWidth: 0 },
  priorityIndicator: { width: 3, height: 36, borderRadius: 2, marginRight: 12 },
  ledgerMain: { flex: 1 },
  ledgerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  ledgerID: { fontSize: 11, fontWeight: '800', color: '#94A3B8' },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 8, fontWeight: '800' },
  ledgerTask: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  ledgerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ledgerDate: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  ledgerDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1' },
  actionIconBox: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

  actionRowGroup: { gap: 12, marginTop: 8 },
  primaryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16 },
  primaryActionText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  secondaryActionBtn: { alignItems: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  secondaryActionText: { color: '#64748B', fontWeight: '700', fontSize: 14 },
});
