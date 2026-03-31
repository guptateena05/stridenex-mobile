import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  BookOpen,
  Sparkles,
  CheckCircle,
  Download
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

// Plans data
const plans = [
  { id: 1, name: "Basic", price: "0", period: "/month", features: ["Basic skill tracking", "Community access", "5 mentor sessions/year"], isCurrent: false, buttonText: "Upgrade", isPopular: false },
  { id: 2, name: "Pro", price: "299", period: "/month", features: ["Everything in Basic", "AI Coach insights", "Unlimited mentor sessions", "Skill ledger export"], isCurrent: true, isPopular: true, buttonText: "Current Plan" },
  { id: 3, name: "Elite", price: "499", period: "/month", features: ["Everything in Pro", "1-on-1 career coaching", "Resume review", "Mock interviews"], isCurrent: false, buttonText: "Upgrade", isPopular: false }
];

// Billing history data
const billingHistory = [
  { id: 1, date: "Feb 1, 2025", description: "Pro Plan – Monthly", amount: "₹299", status: "Paid", hasInvoice: true },
  { id: 2, date: "Jan 1, 2025", description: "Pro Plan – Monthly", amount: "₹299", status: "Paid", hasInvoice: false },
  { id: 3, date: "Dec 1, 2024", description: "Pro Plan – Monthly", amount: "₹299", status: "Paid", hasInvoice: false }
];

export const StudentPlansScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <BookOpen size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>SUBSCRIPTION</Text>
          </View>
          <Text style={styles.title}>Plans</Text>
          <Text style={styles.subtitle}>Manage your StrideNex membership</Text>
        </Animated.View>

        {/* Plans List */}
        <View style={styles.listContainer}>
           {plans.map((plan, index) => (
             <Animated.View 
               key={plan.id} 
               entering={FadeInRight.delay(200 + index * 100)}
               style={[
                 styles.planCard, 
                 plan.isPopular && styles.planCardPopular
               ]}
             >
                {/* Optional Popular Tag */}
                {plan.isPopular && (
                  <View style={styles.popularBadgeWrapper}>
                     <View style={styles.popularBadge}>
                        <Sparkles size={10} color="#FFFFFF" />
                        <Text style={styles.popularBadgeText}>Popular</Text>
                     </View>
                  </View>
                )}

                <Text style={styles.planName}>{plan.name}</Text>
                
                <View style={styles.priceRow}>
                   <Text style={styles.currencySymbol}>₹</Text>
                   <Text style={styles.priceValue}>{plan.price}</Text>
                   <Text style={styles.pricePeriod}>{plan.period}</Text>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                   {plan.features.map((feature, idx) => (
                     <View key={idx} style={styles.featureItem}>
                        <CheckCircle size={14} color="#10B981" />
                        <Text style={styles.featureText}>{feature}</Text>
                     </View>
                   ))}
                </View>

                {/* CTA Button */}
                <TouchableOpacity 
                  style={[
                    styles.ctaButton, 
                    plan.isPopular ? styles.ctaButtonPopular : styles.ctaButtonOutline
                  ]}
                >
                   <Text style={[
                     styles.ctaButtonText, 
                     plan.isPopular ? styles.ctaButtonTextPopular : styles.ctaButtonTextOutline
                   ]}>{plan.buttonText}</Text>
                </TouchableOpacity>
             </Animated.View>
           ))}
        </View>

        {/* Billing History */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitleSimple}>Billing History</Text>
        </View>

        <Animated.View entering={FadeInUp.delay(500)} style={styles.billingContainer}>
           {billingHistory.map((record, index) => (
             <View key={record.id} style={styles.billingRow}>
                <View style={styles.billingLeft}>
                   <Text style={styles.billingDesc}>{record.description}</Text>
                   <View style={styles.billingMetaRow}>
                      <Text style={styles.billingDate}>{record.date}</Text>
                      <View style={styles.billingStatusBadge}>
                         <Text style={styles.billingStatusText}>{record.status}</Text>
                      </View>
                   </View>
                </View>
                <View style={styles.billingRight}>
                   <Text style={styles.billingAmount}>{record.amount}</Text>
                   {record.hasInvoice ? (
                     <TouchableOpacity style={styles.invoiceButton}>
                        <Download size={12} color={colors.accent.DEFAULT} />
                        <Text style={styles.invoiceText}>PDF</Text>
                     </TouchableOpacity>
                   ) : (
                     <Text style={styles.noInvoiceText}>—</Text>
                   )}
                </View>
             </View>
           ))}
        </Animated.View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  header: { marginBottom: 24, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255, 107, 0, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 8 },
  headerBadgeText: { fontSize: 9, fontWeight: '900', color: colors.accent.DEFAULT, letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '900', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#64748B', fontWeight: '600', marginTop: 4 },
  
  listContainer: { gap: 16, marginBottom: 32 },
  planCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  planCardPopular: { borderColor: '#FDBA74', backgroundColor: '#FFF7ED' },
  
  popularBadgeWrapper: { position: 'absolute', top: -10, left: 24, zIndex: 10 },
  popularBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accent.DEFAULT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  popularBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  
  planName: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 20 },
  currencySymbol: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  priceValue: { fontSize: 36, fontWeight: '900', color: '#1E293B', letterSpacing: -1 },
  pricePeriod: { fontSize: 13, color: '#64748B', fontWeight: '600', marginLeft: 2 },
  
  featuresContainer: { gap: 12, marginBottom: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureText: { fontSize: 13, color: '#475569', fontWeight: '500', flex: 1, lineHeight: 18 },
  
  ctaButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  ctaButtonPopular: { backgroundColor: colors.accent.DEFAULT, shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  ctaButtonOutline: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#F1F5F9' },
  ctaButtonText: { fontSize: 13, fontWeight: '800' },
  ctaButtonTextPopular: { color: '#FFFFFF' },
  ctaButtonTextOutline: { color: '#64748B' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitleSimple: { fontSize: 14, fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  billingContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1.5, borderColor: '#F1F5F9' },
  billingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  billingLeft: { flex: 1, paddingRight: 10 },
  billingDesc: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  billingMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  billingDate: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  billingStatusBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  billingStatusText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
  
  billingRight: { alignItems: 'flex-end', gap: 8 },
  billingAmount: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  invoiceButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255, 107, 0, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  invoiceText: { fontSize: 10, fontWeight: '700', color: colors.accent.DEFAULT },
  noInvoiceText: { fontSize: 12, color: '#CBD5E1', fontWeight: '800', paddingRight: 10 },

  footerSpacer: { height: 40 }
});
