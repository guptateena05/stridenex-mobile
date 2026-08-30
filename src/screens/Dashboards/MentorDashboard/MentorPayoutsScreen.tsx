import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Banknote, 
  ArrowUpRight, 
  Clock,
  CheckCircle2,
  BarChart3,
  List,
  Target,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Award,
  FileText
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { getMentorDashboardData } from '@/api/mentor.services';

interface PayoutRecord {
  month: string;
  sessions: number;
  gross_raw: number;
  gross: string;
  feePercent: string;
  feeAmount: string;
  net_raw: number;
  net: string;
  status: string;
  date: string;
}

interface ApiResponse {
  lifetime: {
    gross: string;
    commission: string;
    net: string;
  };
  summary: {
    pending_payout: string;
    last_paid: string;
  };
  history: PayoutRecord[];
}

function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function getLatestQuarterTotal(history: PayoutRecord[]): { label: string; total: number } | null {
  if (!history || history.length === 0) return null;

  const latestEntry = history[0];
  if (!latestEntry || !latestEntry.month) return null;

  const parts = latestEntry.month.split(" ");
  if (parts.length !== 2) return null;

  const monthName = parts[0];
  const year = parseInt(parts[1], 10);
  if (isNaN(year)) return null;

  const quarterMonths: Record<string, { quarter: number; months: string[] }> = {
    "January": { quarter: 1, months: ["January", "February", "March"] },
    "February": { quarter: 1, months: ["January", "February", "March"] },
    "March": { quarter: 1, months: ["January", "February", "March"] },
    "April": { quarter: 2, months: ["April", "May", "June"] },
    "May": { quarter: 2, months: ["April", "May", "June"] },
    "June": { quarter: 2, months: ["April", "May", "June"] },
    "July": { quarter: 3, months: ["July", "August", "September"] },
    "August": { quarter: 3, months: ["July", "August", "September"] },
    "September": { quarter: 3, months: ["July", "August", "September"] },
    "October": { quarter: 4, months: ["October", "November", "December"] },
    "November": { quarter: 4, months: ["October", "November", "December"] },
    "December": { quarter: 4, months: ["October", "November", "December"] },
  };

  const qInfo = quarterMonths[monthName];
  if (!qInfo) return null;

  const total = history
    .filter((row) => {
      const rowParts = row.month?.split(" ");
      return (
        rowParts?.length === 2 &&
        qInfo.months.includes(rowParts[0]) &&
        parseInt(rowParts[1], 10) === year
      );
    })
    .reduce((sum, row) => sum + (row.gross_raw ?? 0), 0);

  return {
    label: `Q${qInfo.quarter} ${year}`,
    total,
  };
}

const commissionWorks = [
  { title: "AI Matching", desc: "We surface your profile to the right students.", icon: Target },
  { title: "Payment Processing", desc: "Razorpay auto-invoicing and bank transfers.", icon: Wallet },
  { title: "Trust & Safety", desc: "Background verify & fraud prevention.", icon: ShieldCheck },
  { title: "Platform Infra", desc: "Video sessions, schedulers, analytics.", icon: BarChart3 },
  { title: "Marketing", desc: "Appear in college searches & suggestions.", icon: TrendingUp },
  { title: "Rewards", desc: "Top mentors (4.8+) get lower commission.", icon: Award },
];

export const MentorPayoutsScreen = () => {
  const { userName } = useAuth();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userName) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMentorDashboardData(userName);
        setData(res);
      } catch (error) {
        console.error("Failed to fetch payout data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userName]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const history = data?.history ?? [];
  const qInfo = getLatestQuarterTotal(history);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Payouts</Text>
            <View style={styles.headerBadge}>
              <Banknote size={10} color="#4c1d95" />
              <Text style={styles.headerBadgeText}>EARNINGS & BILLING</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Track your revenue, commissions, and bank settlements</Text>
        </Animated.View>

        {/* Hero Banner with Lifetime Stats */}
        <Animated.View entering={FadeInUp.delay(100)} style={[styles.heroCard, { backgroundColor: '#1e1b4b' }]}>
          <Text style={styles.heroTitle}>Payout & Earnings Transparency</Text>
          <Text style={styles.heroSub}>Track every rupee — gross earned, commission deducted, and net transferred to your bank.</Text>
          
          {/* Commission Tiers */}
          <View style={styles.tiersContainer}>
            <View style={styles.tierBox}>
              <Text style={styles.tierVal}>15%</Text>
              <Text style={styles.tierDesc}>Standard</Text>
            </View>
            <View style={styles.tierBox}>
              <Text style={styles.tierVal}>12%</Text>
              <Text style={styles.tierDesc}>Above ₹50k/mo</Text>
            </View>
            <View style={styles.tierBox}>
              <Text style={styles.tierVal}>10%</Text>
              <Text style={styles.tierDesc}>Above ₹1L/mo</Text>
            </View>
          </View>

          {/* Lifetime Summary Blocks */}
          <View style={styles.lifetimeGrid}>
            <View style={styles.lifetimeBoxFull}>
              <Text style={[styles.ltValue, { color: '#34D399', fontSize: 28 }]}>{data?.lifetime?.net ?? "—"}</Text>
              <Text style={styles.ltLabel}>LIFETIME NET PAYOUT</Text>
            </View>
            <View style={styles.lifetimeRow}>
              <View style={styles.lifetimeBoxHalf}>
                <Text style={styles.ltValueSmall}>{data?.lifetime?.gross ?? "—"}</Text>
                <Text style={styles.ltLabelSmall}>LIFETIME EARNED</Text>
              </View>
              <View style={styles.lifetimeBoxHalf}>
                <Text style={[styles.ltValueSmall, { color: '#F87171' }]}>{data?.lifetime?.commission ?? "—"}</Text>
                <Text style={styles.ltLabelSmall}>LIFETIME COMMISSION</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Middle Summary Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.middleScroll}>
          <Animated.View entering={FadeInRight.delay(150)} style={[styles.summaryCard, { borderTopColor: '#F97316' }]}>
            <Text style={styles.summaryLabel}>PENDING PAYOUT</Text>
            <Text style={styles.summaryValue}>{data?.summary?.pending_payout ?? "—"}</Text>
            <View style={styles.summaryFooter}>
              <Clock size={12} color="#EF4444" />
              <Text style={[styles.summaryStatus, { color: '#EF4444' }]}>Processing</Text>
            </View>
          </Animated.View>
          
          <Animated.View entering={FadeInRight.delay(200)} style={[styles.summaryCard, { borderTopColor: '#10B981' }]}>
            <Text style={styles.summaryLabel}>LAST PAID</Text>
            <Text style={styles.summaryValue}>{data?.summary?.last_paid ?? "—"}</Text>
            <View style={styles.summaryFooter}>
              <CheckCircle2 size={12} color="#10B981" />
              <Text style={[styles.summaryStatus, { color: '#10B981' }]}>Paid</Text>
            </View>
          </Animated.View>

          {qInfo && qInfo.total > 0 && (
            <Animated.View entering={FadeInRight.delay(250)} style={[styles.summaryCard, { borderTopColor: '#3B82F6' }]}>
              <Text style={styles.summaryLabel}>{qInfo.label.toUpperCase()} TOTAL</Text>
              <Text style={styles.summaryValue}>{formatINR(qInfo.total)}</Text>
              <View style={styles.summaryFooter}>
                <ArrowUpRight size={12} color="#10B981" />
                <Text style={[styles.summaryStatus, { color: '#10B981' }]}>Gross earned</Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Payout History Mobile View */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <List size={16} color="#F97316" />
            <Text style={styles.sectionTitle}>Payout History Breakdown</Text>
          </View>
          
          {history.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={32} color="#CBD5E1" />
              <Text style={{ marginTop: 12, fontSize: 14, fontWeight: '600', color: '#64748B' }}>No payout records yet</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>Your payout history will appear here once sessions are completed.</Text>
            </View>
          ) : (
            <View style={styles.tableList}>
              {history.map((row, idx) => (
                <View key={idx} style={styles.payoutCard}>
                  <View style={styles.payoutCardHeader}>
                    <View style={styles.payoutCardTitleRow}>
                      <Text style={styles.payoutMonthText}>{row.month}</Text>
                      <View style={[styles.statusPill, row.status === 'Paid' ? styles.statusPaid : styles.statusProc]}>
                        <Text style={[styles.statusText, row.status === 'Paid' ? styles.statusTextPaid : styles.statusTextProc]}>{row.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.payoutDateText}>Processed: {row.date} • Sent to Bank</Text>
                  </View>
                  
                  <View style={styles.payoutCardBody}>
                    <View style={styles.payoutDetailItem}>
                      <Text style={styles.payoutDetailLabel}>Sessions</Text>
                      <Text style={styles.payoutDetailValue}>{row.sessions}</Text>
                    </View>
                    <View style={styles.payoutDetailItem}>
                      <Text style={styles.payoutDetailLabel}>Gross</Text>
                      <Text style={styles.payoutDetailValue}>{row.gross}</Text>
                    </View>
                    <View style={styles.payoutDetailItem}>
                      <Text style={styles.payoutDetailLabel}>Fee</Text>
                      <Text style={[styles.payoutDetailValue, { color: '#EF4444' }]}>{row.feeAmount}</Text>
                    </View>
                    <View style={styles.payoutDetailItemNet}>
                      <Text style={styles.payoutDetailLabel}>Net Payout</Text>
                      <Text style={styles.payoutNetValue}>{row.net}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* How Commission Works */}
        <Animated.View entering={FadeInUp.delay(350)} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Target size={16} color="#EAB308" />
            <Text style={styles.sectionTitle}>How Commission Works</Text>
          </View>
          <View style={styles.gridContainer}>
             {commissionWorks.map((item, idx) => (
               <View key={idx} style={styles.gridItem}>
                 <item.icon size={20} color="#94A3B8" />
                 <View style={{ flex: 1 }}>
                   <Text style={styles.gridItemTitle}>{item.title}</Text>
                   <Text style={styles.gridItemDesc}>{item.desc}</Text>
                 </View>
               </View>
             ))}
          </View>
        </Animated.View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  heroCard: { borderRadius: 24, padding: 24, marginBottom: 20 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18, marginBottom: 16 },
  
  tiersContainer: { flexDirection: 'row', gap: 8, marginBottom: 20, width: '100%', justifyContent: 'space-between' },
  tierBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 4, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  tierVal: { fontSize: 16, fontWeight: '900', color: '#FB923C', textAlign: 'center' },
  tierDesc: { fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },

  lifetimeGrid: { gap: 12, marginTop: 10, width: '100%' },
  lifetimeBoxFull: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', width: '100%' },
  lifetimeRow: { flexDirection: 'row', gap: 12, width: '100%' },
  lifetimeBoxHalf: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  ltValue: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  ltLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: 0.5 },
  ltValueSmall: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  ltLabelSmall: { fontSize: 8, fontWeight: '800', color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: 0.5 },

  middleScroll: { gap: 12, marginBottom: 24, paddingBottom: 4 },
  summaryCard: { backgroundColor: '#FFF', width: 180, padding: 16, borderRadius: 16, borderTopWidth: 4, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  summaryLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  summaryFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summaryStatus: { fontSize: 11, fontWeight: '700' },

  sectionContainer: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#F8FAFC' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },

  tableList: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },
  payoutCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  payoutCardHeader: {
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  payoutCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  payoutMonthText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  payoutDateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  payoutCardBody: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-between'
  },
  payoutDetailItem: {
    flex: 1,
  },
  payoutDetailItemNet: {
    flex: 1.2,
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    paddingLeft: 12,
  },
  payoutDetailLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  payoutDetailValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  payoutNetValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#10B981',
  },

  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusPaid: { backgroundColor: '#ECFDF5' },
  statusProc: { backgroundColor: '#FFF7ED' },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  statusTextPaid: { color: '#059669' },
  statusTextProc: { color: '#EA580C' },

  gridContainer: { padding: 16, gap: 16 },
  gridItem: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  gridItemTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  gridItemDesc: { fontSize: 11, color: '#64748B', lineHeight: 16 },

  footerSpacer: { height: 40 }
});
