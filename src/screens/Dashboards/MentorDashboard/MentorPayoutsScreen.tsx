import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Banknote, 
  ArrowUpRight, 
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  List,
  Target,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const payoutHistory = [
  { id: '1', month: "February 2025", sessions: 18, gross: "₹21,600", feePercent: "15%", feeAmount: "-₹3,240", net: "₹18,360", status: "Processing", date: "Mar 1, 2025" },
  { id: '2', month: "January 2025", sessions: 22, gross: "₹26,400", feePercent: "15%", feeAmount: "-₹3,960", net: "₹22,440", status: "Paid", date: "Feb 1, 2025" },
  { id: '3', month: "December 2024", sessions: 16, gross: "₹19,200", feePercent: "15%", feeAmount: "-₹2,880", net: "₹16,320", status: "Paid", date: "Jan 1, 2025" },
  { id: '4', month: "November 2024", sessions: 19, gross: "₹22,800", feePercent: "15%", feeAmount: "-₹3,420", net: "₹19,380", status: "Paid", date: "Dec 1, 2024" }
];

const commissionWorks = [
  { title: "AI Matching", desc: "We surface your profile to the right students.", icon: Target },
  { title: "Payment Processing", desc: "Razorpay auto-invoicing and bank transfers.", icon: Wallet },
  { title: "Trust & Safety", desc: "Background verify & fraud prevention.", icon: ShieldCheck },
  { title: "Platform Infra", desc: "Video sessions, schedulers, analytics.", icon: BarChart3 },
  { title: "Marketing", desc: "Appear in college searches & suggestions.", icon: TrendingUp },
  { title: "Rewards", desc: "Top mentors (4.8+) get lower commission.", icon: Award },
];

export const MentorPayoutsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Banknote size={10} color="#4c1d95" />
            <Text style={styles.headerBadgeText}>EARNINGS & BILLING</Text>
          </View>
          <Text style={styles.title}>Payouts</Text>
          <Text style={styles.subtitle}>Track your revenue, commissions, and bank settlements</Text>
        </Animated.View>

        {/* Hero Banner with Lifetime Stats */}
        <Animated.View entering={FadeInUp.delay(100)} style={[styles.heroCard, { backgroundColor: '#1e1b4b' }]}>
          <Text style={styles.heroTitle}>Payout & Earnings Transparency</Text>
          <Text style={styles.heroSub}>Track every rupee — gross earned, commission deducted, and net transferred to your bank.</Text>
          
          {/* Commission Tiers */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiersScroll}>
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
          </ScrollView>

          {/* Lifetime Summary Blocks */}
          <View style={styles.lifetimeBox}>
            <Text style={styles.ltValue}>₹2,84,400</Text>
            <Text style={styles.ltLabel}>LIFETIME EARNED</Text>
          </View>
          <View style={styles.lifetimeBox}>
            <Text style={styles.ltValue}>₹42,660</Text>
            <Text style={styles.ltLabel}>LIFETIME COMMISSION</Text>
          </View>
          <View style={styles.lifetimeBox}>
            <Text style={[styles.ltValue, { color: '#34D399' }]}>₹2,41,740</Text>
            <Text style={styles.ltLabel}>LIFETIME NET PAYOUT</Text>
          </View>
        </Animated.View>

        {/* Middle Summary Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.middleScroll}>
          <Animated.View entering={FadeInRight.delay(150)} style={[styles.summaryCard, { borderTopColor: '#F97316' }]}>
            <Text style={styles.summaryLabel}>PENDING PAYOUT (FEB)</Text>
            <Text style={styles.summaryValue}>₹18,360</Text>
            <View style={styles.summaryFooter}>
              <Clock size={12} color="#EF4444" />
              <Text style={[styles.summaryStatus, { color: '#EF4444' }]}>Releases Mar 1</Text>
            </View>
          </Animated.View>
          
          <Animated.View entering={FadeInRight.delay(200)} style={[styles.summaryCard, { borderTopColor: '#10B981' }]}>
            <Text style={styles.summaryLabel}>LAST PAID (JAN)</Text>
            <Text style={styles.summaryValue}>₹22,440</Text>
            <View style={styles.summaryFooter}>
              <CheckCircle2 size={12} color="#10B981" />
              <Text style={[styles.summaryStatus, { color: '#10B981' }]}>Paid Feb 1</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(250)} style={[styles.summaryCard, { borderTopColor: '#3B82F6' }]}>
            <Text style={styles.summaryLabel}>Q1 2025 TOTAL</Text>
            <Text style={styles.summaryValue}>₹63,240</Text>
            <View style={styles.summaryFooter}>
              <ArrowUpRight size={12} color="#10B981" />
              <Text style={[styles.summaryStatus, { color: '#10B981' }]}>+22% vs Q4</Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Payout History Mobile View */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <List size={16} color="#F97316" />
            <Text style={styles.sectionTitle}>Payout History Breakdown</Text>
          </View>
          <View style={styles.tableList}>
            {payoutHistory.map((row) => (
              <View key={row.id} style={styles.tableRowContainer}>
                <View style={styles.tHeaderRow}>
                  <Text style={styles.tMonth}>{row.month}</Text>
                  <View style={[styles.statusPill, row.status === 'Paid' ? styles.statusPaid : styles.statusProc]}>
                    <Text style={[styles.statusText, row.status === 'Paid' ? styles.statusTextPaid : styles.statusTextProc]}>{row.status}</Text>
                  </View>
                </View>
                
                <View style={styles.tDetailGrid}>
                   <View style={styles.tStat}>
                     <Text style={styles.tStatLabel}>Sessions</Text>
                     <Text style={styles.tStatVal}>{row.sessions}</Text>
                   </View>
                   <View style={styles.tStat}>
                     <Text style={styles.tStatLabel}>Gross</Text>
                     <Text style={styles.tStatVal}>{row.gross}</Text>
                   </View>
                   <View style={styles.tStat}>
                     <Text style={styles.tStatLabel}>Fee ({row.feePercent})</Text>
                     <Text style={[styles.tStatVal, { color: '#EF4444' }]}>{row.feeAmount}</Text>
                   </View>
                   <View style={styles.tStat}>
                     <Text style={styles.tStatLabel}>Net Payout</Text>
                     <Text style={[styles.tStatVal, { color: '#10B981', fontSize: 13 }]}>{row.net}</Text>
                   </View>
                </View>
                <Text style={styles.tFooterText}>Processed: {row.date} • Sent to Bank</Text>
              </View>
            ))}
          </View>
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
  
  header: { marginBottom: 20, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },

  heroCard: { borderRadius: 24, padding: 24, marginBottom: 20 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18, marginBottom: 16 },
  
  tiersScroll: { gap: 8, marginBottom: 20 },
  tierBox: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  tierVal: { fontSize: 16, fontWeight: '900', color: '#FB923C', textAlign: 'center' },
  tierDesc: { fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },

  lifetimeBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  ltValue: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  ltLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: 0.5 },

  middleScroll: { gap: 12, marginBottom: 24, paddingBottom: 4 },
  summaryCard: { backgroundColor: '#FFF', width: 180, padding: 16, borderRadius: 16, borderTopWidth: 4, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  summaryLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  summaryFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summaryStatus: { fontSize: 11, fontWeight: '700' },

  sectionContainer: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#F8FAFC' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },

  tableList: { paddingHorizontal: 16 },
  tableRowContainer: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tMonth: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusPaid: { backgroundColor: '#ECFDF5' },
  statusProc: { backgroundColor: '#FFF7ED' },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  statusTextPaid: { color: '#059669' },
  statusTextProc: { color: '#EA580C' },

  tDetailGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tStat: { flex: 1 },
  tStatLabel: { fontSize: 10, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  tStatVal: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  tFooterText: { fontSize: 10, color: '#94A3B8', fontStyle: 'italic' },

  gridContainer: { padding: 16, gap: 16 },
  gridItem: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  gridItemTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  gridItemDesc: { fontSize: 11, color: '#64748B', lineHeight: 16 },

  footerSpacer: { height: 40 }
});
