import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { typography } from '@/theme/typography';
import { Card } from '@/components/Shared/Card';
import { Check, CreditCard, Clock, ChevronRight, FileDown } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const billingHistory = [
  { date: "Feb 1, 2025", desc: "Institution Plan — Monthly", amount: "₹14,999", status: "Paid" },
  { date: "Jan 1, 2025", desc: "Institution Plan — Monthly", amount: "₹14,999", status: "Paid" },
  { date: "Dec 1, 2024", desc: "Institution Plan — Monthly", amount: "₹14,999", status: "Paid" }
];

export const CollegePlansScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <CreditCard size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>PLAN & BILLING</Text>
          </View>
          <Text style={styles.title}>Subscription</Text>
          <Text style={styles.subtitle}>Manage your institution's tier and billing history</Text>
        </Animated.View>

        {/* Active Plan Card (Institution) */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <Card style={[styles.planCard, styles.activePlanCard]}>
            <View style={styles.planHeader}>
               <View>
                  <Text style={styles.planLabel}>ACTIVE PLAN</Text>
                  <Text style={styles.planName}>Institution Pro</Text>
               </View>
               <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>CURRENT</Text>
               </View>
            </View>

            <View style={styles.priceContainer}>
               <Text style={styles.priceValue}>₹14,999</Text>
               <Text style={styles.pricePeriod}>/month</Text>
            </View>

            <View style={styles.featuresList}>
               <View style={styles.featureRow}>
                  <View style={styles.checkIcon}><Check size={12} color="#059669" /></View>
                  <Text style={styles.featureText}>Unlimited student profiles</Text>
               </View>
               <View style={styles.featureRow}>
                  <View style={styles.checkIcon}><Check size={12} color="#059669" /></View>
                  <Text style={styles.featureText}>Full NEP & UGC compliance suite</Text>
               </View>
               <View style={styles.featureRow}>
                  <View style={styles.checkIcon}><Check size={12} color="#059669" /></View>
                  <Text style={styles.featureText}>Premium recruiter access</Text>
               </View>
               <View style={styles.featureRow}>
                  <View style={styles.checkIcon}><Check size={12} color="#059669" /></View>
                  <Text style={styles.featureText}>AI Skill Gap personalized analysis</Text>
               </View>
            </View>

            <TouchableOpacity style={styles.manageBtn}>
               <Text style={styles.manageBtnText}>Manage Subscription</Text>
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Change Plan Section */}
        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>AVAILABLE UPGRADES</Text>
        </View>

        <Card style={styles.upgradeCard}>
           <View style={styles.upgradeTop}>
              <View style={styles.upgradeIconBox}>
                 <Text style={{ fontSize: 20 }}>🏢</Text>
              </View>
              <View style={{ flex: 1 }}>
                 <Text style={styles.upgradeTitle}>Starter Tier</Text>
                 <Text style={styles.upgradeSub}>Up to 500 students • Basic Analytics</Text>
              </View>
              <Text style={styles.upgradePrice}>₹4,999</Text>
           </View>
           <TouchableOpacity style={styles.downgradeBtn}>
              <Text style={styles.downgradeBtnText}>Downgrade to Starter</Text>
           </TouchableOpacity>
        </Card>

        {/* Billing History Ledger */}
        <Card style={styles.ledgerCard}>
          <View style={styles.ledgerHeader}>
            <Clock color="#64748B" size={18} />
            <Text style={styles.ledgerTitle}>Transaction History</Text>
          </View>

          <View style={styles.listContainer}>
            {billingHistory.map((item, idx) => (
              <View key={idx} style={[styles.ledgerRow, idx === billingHistory.length - 1 && styles.noBorder]}>
                <View style={styles.ledgerMain}>
                   <Text style={styles.ledgerDate}>{item.date}</Text>
                   <Text style={styles.ledgerDesc}>{item.desc}</Text>
                </View>
                <View style={styles.ledgerSide}>
                   <Text style={styles.ledgerAmount}>{item.amount}</Text>
                   <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{item.status}</Text>
                   </View>
                </View>
                <TouchableOpacity style={styles.downloadBtn}>
                   <FileDown size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.viewInvoicesBtn}>
             <Text style={styles.viewInvoicesText}>Fetch All Invoices</Text>
             <ChevronRight size={14} color="#94A3B8" />
          </TouchableOpacity>
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  
  header: { marginBottom: 24, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  planCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4, borderLeftColor: '#059669' },
  activePlanCard: { borderColor: '#059669', borderWidth: 2 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  planLabel: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 1, marginBottom: 4 },
  planName: { fontSize: 20, fontWeight: '800', color: '#1E293B', fontFamily: typography.fontFamily.display },
  activeBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669' },

  priceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 24 },
  priceValue: { fontSize: 32, fontWeight: '800', color: '#0F172A' },
  pricePeriod: { fontSize: 14, fontWeight: '600', color: '#64748B' },

  featuresList: { gap: 16, marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkIcon: { width: 20, height: 20, borderRadius: 6, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 14, fontWeight: '600', color: '#475569' },

  manageBtn: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  manageBtnText: { fontSize: 14, fontWeight: '800', color: '#FFF' },

  sectionTitleRow: { marginBottom: 12, paddingHorizontal: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },

  upgradeCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4, borderLeftColor: '#059669' },
  upgradeTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  upgradeIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  upgradeTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  upgradeSub: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  upgradePrice: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  downgradeBtn: { width: '100%', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  downgradeBtnText: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  ledgerCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4, borderLeftColor: '#059669' },
  ledgerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  ledgerTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },

  listContainer: { gap: 0 },
  ledgerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  ledgerMain: { flex: 1 },
  ledgerDate: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  ledgerDesc: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  ledgerSide: { alignItems: 'flex-end', marginRight: 16 },
  ledgerAmount: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  statusBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 8, fontWeight: '800', color: '#059669' },
  downloadBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },

  viewInvoicesBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 4 },
  viewInvoicesText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' }
});
