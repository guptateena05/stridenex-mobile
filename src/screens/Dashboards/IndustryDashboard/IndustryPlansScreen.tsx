import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { Check, FileText, Briefcase } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const billingHistory = [
  { id: 1, date: "Feb 1, 2025", desc: "Pro Plan — Monthly", amount: "₹299", status: "Paid" },
  { id: 2, date: "Jan 1, 2025", desc: "Pro Plan — Monthly", amount: "₹299", status: "Paid" },
  { id: 3, date: "Dec 1, 2024", desc: "Pro Plan — Monthly", amount: "₹299", status: "Paid" }
];

export const IndustryPlansScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
           <View style={styles.headerBadge}>
              <Briefcase size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>BILLING</Text>
           </View>
           <Text style={styles.title}>Subscription Plans</Text>
           <Text style={styles.subtitle}>Manage your employer branding and posting limitations</Text>
        </Animated.View>

        {/* Starter Plan */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.planCard}>
           <Text style={styles.planTitle}>Starter</Text>
           <View style={styles.priceRow}>
              <Text style={styles.priceValue}>₹4,999</Text>
              <Text style={styles.pricePeriod}>/mo</Text>
           </View>

           <View style={styles.featuresList}>
              {["50 students", "Basic analytics", "5 internship posts"].map((feature, idx) => (
                 <View key={idx} style={styles.featureRow}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                 </View>
              ))}
           </View>

           <TouchableOpacity style={styles.upgradeBtn}>
              <Text style={styles.upgradeBtnText}>Upgrade</Text>
           </TouchableOpacity>
        </Animated.View>

        {/* Institution Plan */}
        <Animated.View entering={FadeInUp.delay(300)} style={[styles.planCard, styles.planCardActive]}>
           <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
           </View>

           <Text style={[styles.planTitle, { color: colors.purple[600] }]}>Institution</Text>
           <View style={styles.priceRow}>
              <Text style={[styles.priceValue, { color: colors.purple[600] }]}>₹14,999</Text>
              <Text style={[styles.pricePeriod, { color: '#A855F7' }]}>/mo</Text>
           </View>

           <View style={styles.featuresList}>
              {[
                "Unlimited students", 
                "Full analytics + NEP reports", 
                "Unlimited postings", 
                "AI Employability scoring", 
                "NEP/UGC compliance dashboard", 
                "Grievance Engine"
              ].map((feature, idx) => (
                 <View key={idx} style={styles.featureRow}>
                    <Check size={16} color="#10B981" />
                    <Text style={[styles.featureText, { color: '#0F172A' }]}>{feature}</Text>
                 </View>
              ))}
           </View>

           <TouchableOpacity style={styles.currentPlanBtn}>
              <Text style={styles.currentPlanBtnText}>Current Plan</Text>
           </TouchableOpacity>
        </Animated.View>

        {/* Billing History */}
        <Animated.View entering={FadeInUp.delay(400)}>
           <Text style={styles.sectionTitle}>Billing History</Text>
           
           <View style={styles.billingList}>
              {billingHistory.map(item => (
                 <View key={item.id} style={styles.billingItem}>
                    <View style={styles.billingTopRow}>
                       <Text style={styles.billingDate}>{item.date}</Text>
                       <Text style={styles.billingAmount}>{item.amount}</Text>
                    </View>
                    <View style={styles.billingBottomRow}>
                       <Text style={styles.billingDesc}>{item.desc}</Text>
                       <View style={styles.billingActions}>
                          <View style={styles.statusBadge}>
                             <Text style={styles.statusText}>{item.status}</Text>
                          </View>
                          <TouchableOpacity style={styles.invoiceBtn}>
                             <FileText size={12} color="#64748B" />
                             <Text style={styles.invoiceBtnText}>PDF</Text>
                          </TouchableOpacity>
                       </View>
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
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  
  header: { marginBottom: 24, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(10, 128, 153, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },

  planCard: { backgroundColor: '#F8FAFC', padding: 24, borderRadius: 24, borderWidth: 1, borderLeftWidth: 4, borderLeftColor: '#94A3B8', borderColor: '#E2E8F0', marginBottom: 20 },
  planCardActive: { backgroundColor: '#FFF', borderColor: colors.purple[600], borderLeftWidth: 4, borderLeftColor: colors.purple[600], shadowColor: colors.purple[500], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 4 },
  
  currentBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: colors.purple[600], paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  currentBadgeText: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },

  planTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 24 },
  priceValue: { fontSize: 32, fontWeight: '900', color: '#334155' },
  pricePeriod: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },

  featuresList: { gap: 12, marginBottom: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, fontWeight: '600', color: '#475569' },

  upgradeBtn: { backgroundColor: colors.purple[600], paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: colors.purple[600], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  upgradeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  currentPlanBtn: { backgroundColor: '#F8FAFC', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  currentPlanBtnText: { color: '#475569', fontSize: 15, fontWeight: '800' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 16, marginTop: 16, paddingHorizontal: 4 },
  
  billingList: { gap: 12 },
  billingItem: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderLeftWidth: 3, borderLeftColor: colors.purple[600], borderColor: '#E2E8F0' },
  billingTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  billingDate: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  billingAmount: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
  billingBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billingDesc: { fontSize: 14, fontWeight: '600', color: '#334155' },
  billingActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: '#D1FAE5', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5 },
  invoiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  invoiceBtnText: { fontSize: 10, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },

  footerSpacer: { height: 40 }
});
