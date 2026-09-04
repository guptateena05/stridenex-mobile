import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Award,
  Sparkles,
  CheckCircle,
  Crown,
  Clock,
  Zap,
  AlertCircle,
  ShoppingBag,
  CalendarDays,
  Server,
  Video,
  Users,
  ChevronDown,
  ChevronUp,
  IndianRupee
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { 
  getBillingPackagesByType, 
  getUserSubscriptionDashboard 
} from '@/api/student.services';

interface BillingPackage {
  package_name: string;
  amount: number;
  package_type: string;
  no_of_days: number;
  no_of_users?: number | string;
  app?: string;
  app_name?: string;
  features: string[];
}

function calcRemainingDays(expiryDateStr: string): number {
  try {
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

async function handleSelectPlan(
  plan: BillingPackage,
  customerEmail: string,
  setRedirectingPlan: (p: string | null) => void
) {
  setRedirectingPlan(plan.package_name);
  try {
    const fromSite = "devstridenex.quantcloud.in";
    const billingUrl = "https://uat-dev.stridenex.ai";

    // Use URLSearchParams to ensure identical query parameter encoding as web (e.g. + for spaces)
    const paymentParams = new URLSearchParams({
      from_site: fromSite,
      frontend_url: "http://localhost:3000",
      pkg_name: plan.package_name || "",
      pkg_type: plan.package_type || "",
      pkg_app: plan.app_name || plan.app || "",
      pkg_users: plan.no_of_users !== undefined && plan.no_of_users !== null ? String(plan.no_of_users) : "",
      pkg_days: plan.no_of_days !== undefined && plan.no_of_days !== null ? String(plan.no_of_days) : "",
      pkg_amount: plan.amount !== undefined && plan.amount !== null ? String(plan.amount) : "",
      account_type: "Mentor",
      customer_email: customerEmail || "",
    });

    // Use standard URL constructor to correctly resolve page path relative to base billing domain
    const proceedPaymentUrlObj = new URL("proceedpayment.html", billingUrl);
    const proceedPaymentUrl = `${proceedPaymentUrlObj.origin}${proceedPaymentUrlObj.pathname}?${paymentParams.toString()}`;

    console.log("Proceeding to payment URL on mobile for mentor:", proceedPaymentUrl);

    const supported = await Linking.canOpenURL(proceedPaymentUrl);
    if (supported) {
      await Linking.openURL(proceedPaymentUrl);
    } else {
      Alert.alert("Error", "Unable to open payment link in browser.");
    }
  } catch (err: any) {
    console.error("Payment redirect failed:", err);
    Alert.alert("Error", err.message || "Failed to initiate payment. Please try again.");
  } finally {
    setRedirectingPlan(null);
  }
}

const ActivePlanSection = ({ plan }: { plan: any }) => {
  const isPaid = plan.kind === "paid";
  const isTokenBased = plan.kind === "free" && plan.data.package_type === "Token Based";

  const expiryDateStr = isPaid
    ? plan.data.expiry_date
    : plan.data.to_date ?? "";
  
  const remaining = expiryDateStr ? calcRemainingDays(expiryDateStr) : null;
  const isExpired = remaining === 0 && !isTokenBased;

  const packageName = isPaid
    ? plan.data.package_name
    : plan.data.package_name;
  
  const packageType = isPaid
    ? plan.data.package_type
    : plan.data.package_type;
  
  const isFree = plan.kind === "free" && plan.data.source === "active_package";

  if (isExpired) {
    return (
      <View style={styles.expiredPlanContainer}>
        <View style={styles.planBannerLeft}>
          <View style={[styles.planBannerIconBg, styles.expiredIconBg]}>
            <AlertCircle size={20} color="#EF4444" />
          </View>
          <View style={styles.planBannerTextContainer}>
            <View style={styles.badgeRow}>
              <View style={styles.expiredBadge}>
                <View style={styles.pulseDotRed} />
                <Text style={styles.expiredBadgeText}>Expired</Text>
              </View>
              <Text style={styles.bannerPlanName}>{packageName}</Text>
            </View>
            <Text style={styles.bannerSubtitle}>Your package has expired. Please renew below.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.activePlanContainer}>
      <View style={styles.planBannerLeft}>
        <View style={[styles.planBannerIconBg, styles.activeIconBg]}>
          <Crown size={20} color="#10B981" />
        </View>
        <View style={styles.planBannerTextContainer}>
          <View style={styles.badgeRow}>
            <View style={styles.activeBadge}>
              <View style={styles.pulseDotGreen} />
              <Text style={styles.activeBadgeText}>Active Plan</Text>
            </View>
            <Text style={styles.bannerPlanName}>{packageName}</Text>
            {isFree && (
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>Free</Text>
              </View>
            )}
          </View>
          
          <View style={styles.bannerMetaRow}>
            {packageType ? (
              <View style={styles.packageTypeBadge}>
                <Text style={styles.packageTypeText}>{packageType}</Text>
              </View>
            ) : null}

            {isTokenBased ? (
              <View style={styles.metaRowDetail}>
                <Zap size={12} color="#10B981" />
                <Text style={styles.metaDetailText}>
                  {plan.data.remaining_tokens ?? 0} / {plan.data.total_tokens ?? 0} tokens
                </Text>
              </View>
            ) : (
              remaining !== null && (
                <View style={styles.metaRowDetail}>
                  <Clock size={12} color="#10B981" />
                  <Text style={styles.metaDetailText}>{remaining} days remaining</Text>
                </View>
              )
            )}

            {expiryDateStr && !isTokenBased ? (
              <Text style={styles.expiryDateText}>
                Expires: {formatDate(expiryDateStr)}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

const SummaryCards = ({ dashboard }: { dashboard: any }) => {
  const { summary } = dashboard;
  if (!summary) return null;

  const cards = [
    {
      label: "Current Plan",
      value: summary.current_package ?? "No Active Plan",
      icon: <Crown size={16} color="#4c1d95" />,
      borderColor: '#C4B5FD',
      bgColor: '#F5F3FF',
    },
    {
      label: "Total Spent",
      value: `₹${(summary.total_spent ?? 0).toLocaleString("en-IN")}`,
      icon: <IndianRupee size={16} color="#4c1d95" />,
      borderColor: '#C4B5FD',
      bgColor: '#F5F3FF',
    },
    {
      label: "Purchases",
      value: String(summary.total_purchases ?? 0),
      icon: <ShoppingBag size={16} color="#4c1d95" />,
      borderColor: '#C4B5FD',
      bgColor: '#F5F3FF',
    },
  ];

  return (
    <View style={styles.summaryContainer}>
      {cards.map((card) => (
        <View
          key={card.label}
          style={[styles.summaryCard, { borderColor: card.borderColor, backgroundColor: card.bgColor }]}
        >
          <View style={styles.summaryHeader}>
            {card.icon}
            <Text style={styles.summaryLabel} numberOfLines={1}>{card.label}</Text>
          </View>
          <Text style={styles.summaryValue} numberOfLines={1}>{card.value}</Text>
        </View>
      ))}
    </View>
  );
};

const BillingHistoryList = ({ dashboard }: { dashboard: any }) => {
  const history = dashboard.history || [];
  const sorted = [...history].sort((a, b) => {
    const dateDiff = new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (b.sales_invoice_no ?? "").localeCompare(
      a.sales_invoice_no ?? "",
      undefined,
      { numeric: true, sensitivity: "base" }
    );
  });

  const [showAllSubs, setShowAllSubs] = useState(false);
  const visibleSubs = showAllSubs ? sorted : sorted.slice(0, 3);
  const hasMore = sorted.length > 3;

  if (sorted.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Server size={28} color="#94A3B8" />
        <Text style={styles.emptyText}>No billing history found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.historySection}>
      <View style={styles.historyList}>
        {visibleSubs.map((entry) => (
          <View key={entry.name || entry.sales_invoice_no} style={styles.subscriptionHistoryCard}>
            <View style={[styles.cardSideStrip, entry.is_active ? styles.stripActive : styles.stripInactive]} />
            <View style={styles.historyCardBody}>
              <View style={styles.historyCardLeft}>
                <View style={styles.historyCardTitleRow}>
                  <Text style={styles.historyCardTitle} numberOfLines={1}>{entry.package_name}</Text>
                  {entry.is_active && (
                    <View style={styles.activeStatusBadge}>
                      <Text style={styles.activeStatusText}>Active</Text>
                    </View>
                  )}
                  <View style={[styles.paymentStatusBadge, entry.payment_status === "Paid" ? styles.paidBadge : styles.unpaidBadge]}>
                    <Text style={[styles.paymentStatusText, entry.payment_status === "Paid" ? styles.paidText : styles.unpaidText]}>
                      {entry.payment_status}
                    </Text>
                  </View>
                </View>

                {entry.package_type ? (
                  <View style={styles.historyCardTypeBadge}>
                    <Text style={styles.historyCardTypeText}>{entry.package_type}</Text>
                  </View>
                ) : null}

                <View style={styles.historyDatesRow}>
                  <View style={styles.dateItem}>
                    <CalendarDays size={10} color="#64748B" />
                    <Text style={styles.dateLabel}>Purchased: {formatDate(entry.purchase_date)}</Text>
                  </View>
                  {entry.expiry_date ? (
                    <View style={styles.dateItem}>
                      <Clock size={10} color="#64748B" />
                      <Text style={styles.dateLabel}>Valid till: {formatDate(entry.expiry_date)}</Text>
                    </View>
                  ) : null}
                </View>
                {entry.sales_invoice_no ? (
                  <Text style={styles.invoiceNoText}>Invoice: #{entry.sales_invoice_no}</Text>
                ) : null}
              </View>
              <View style={styles.historyCardRight}>
                <Text style={styles.amountText}>₹{(entry.amount ?? 0).toLocaleString("en-IN")}</Text>
                {entry.discount > 0 ? (
                  <Text style={styles.discountText}>Off: ₹{entry.discount.toLocaleString("en-IN")}</Text>
                ) : null}
              </View>
            </View>
          </View>
        ))}
      </View>

      {hasMore && (
        <TouchableOpacity
          onPress={() => setShowAllSubs(!showAllSubs)}
          style={styles.showMoreBtn}
          activeOpacity={0.8}
        >
          {showAllSubs ? (
            <View style={styles.btnRow}>
              <ChevronUp size={14} color="#4c1d95" />
              <Text style={styles.showMoreBtnText}>Show less</Text>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <ChevronDown size={14} color="#4c1d95" />
              <Text style={styles.showMoreBtnText}>Show all {sorted.length} records</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export const MentorPlansScreen = () => {
  const { userName } = useAuth();
  const [packages, setPackages] = useState<BillingPackage[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectingPlan, setRedirectingPlan] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [packagesRes, dashboardRes] = await Promise.allSettled([
        getBillingPackagesByType("Mentor"),
        getUserSubscriptionDashboard(),
      ]);

      if (packagesRes.status === "fulfilled") {
        const res = packagesRes.value;
        const data = res?.message?.data || res?.data || [];
        setPackages(data);
      } else {
        console.warn("Failed to fetch packages on mobile", packagesRes.reason);
        setPackages([]);
      }

      if (dashboardRes.status === "fulfilled") {
        setDashboard(dashboardRes.value);
      } else {
        console.warn("Failed to fetch subscription dashboard on mobile:", dashboardRes.reason);
      }
    } catch (err: any) {
      console.error("Failed to fetch billing data on mobile:", err);
      setError(err.message || "Failed to load plans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userName]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4c1d95" />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <AlertCircle size={40} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.tryAgainButton} onPress={fetchData}>
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayPlan = dashboard?.active_subscription
    ? { kind: "paid", data: dashboard.active_subscription }
    : dashboard?.current_plan
      ? { kind: "free", data: dashboard.current_plan }
      : null;

  const hasActiveOrHistory =
    !!displayPlan ||
    !!dashboard?.summary?.current_package ||
    (!!dashboard?.history && dashboard.history.length > 0);

  if (packages.length === 0 && !hasActiveOrHistory) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Crown size={40} color="#94A3B8" />
          <Text style={styles.emptyText}>No plans available for your account type.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const maxAmount = packages.length > 0 ? Math.max(...packages.map((p) => p.amount)) : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Award size={10} color="#4c1d95" />
            <Text style={styles.headerBadgeText}>SUBSCRIPTION</Text>
          </View>
          <Text style={styles.title}>Plans & Billing</Text>
          <Text style={styles.subtitle}>Manage your mentorship subscription</Text>
        </Animated.View>

        {/* 1. Active / Expired Plan Banner */}
        {displayPlan && (
          <Animated.View entering={FadeInUp.delay(150)} style={{ marginBottom: 20 }}>
            <ActivePlanSection plan={displayPlan} />
          </Animated.View>
        )}

        {/* 2. Choose Your Plan */}
        {packages.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Animated.View entering={FadeInUp.delay(200)}>
              <Text style={styles.chooseTitle}>Choose Your Plan</Text>
              <Text style={styles.chooseSubtitle}>
                Select a plan that best suits you. All plans include access to the Mentor dashboard.
              </Text>
            </Animated.View>

            <View style={styles.listContainer}>
              {packages.map((plan, index) => {
                const isPopular = plan.amount === maxAmount && packages.length > 1;
                return (
                  <Animated.View 
                    key={plan.package_name} 
                    entering={FadeInRight.delay(250 + index * 100)}
                    style={[
                      styles.planCard, 
                      isPopular && styles.planCardPopular
                    ]}
                  >
                    {isPopular && (
                      <View style={styles.popularBadgeWrapper}>
                        <View style={styles.popularBadge}>
                          <Sparkles size={10} color="#FFFFFF" />
                          <Text style={styles.popularBadgeText}>Best Value</Text>
                        </View>
                      </View>
                    )}

                    <Text style={styles.planName}>{plan.package_name}</Text>
                    
                    <View style={styles.priceRow}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <Text style={styles.priceValue}>{plan.amount.toLocaleString("en-IN")}</Text>
                      {plan.no_of_days > 0 && (
                        <Text style={styles.pricePeriod}>/ {plan.no_of_days} days</Text>
                      )}
                    </View>

                    <View style={styles.metaBadgeRow}>
                      {plan.package_type ? (
                        <View style={styles.pillBadge}>
                          <Text style={styles.pillBadgeText}>{plan.package_type}</Text>
                        </View>
                      ) : null}
                      {plan.app_name ? (
                        <View style={[styles.pillBadge, { backgroundColor: '#F5F3FF', borderColor: '#C4B5FD' }]}>
                          <Text style={[styles.pillBadgeText, { color: '#6d28d9' }]}>{plan.app_name}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Features */}
                    {plan.features && plan.features.length > 0 ? (
                      <View style={styles.featuresContainer}>
                        {plan.features.map((feature, idx) => (
                          <View key={idx} style={styles.featureItem}>
                            <CheckCircle size={14} color="#4c1d95" />
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.noFeaturesWrapper}>
                        <Text style={styles.noFeaturesText}>No features listed</Text>
                      </View>
                    )}

                    {/* CTA Button */}
                    <TouchableOpacity 
                      style={[
                        styles.ctaButton, 
                        isPopular ? styles.ctaButtonPopular : styles.ctaButtonOutline
                      ]}
                      onPress={() => handleSelectPlan(plan, userName || "", setRedirectingPlan)}
                      disabled={redirectingPlan !== null}
                      activeOpacity={0.8}
                    >
                      {redirectingPlan === plan.package_name ? (
                        <View style={styles.btnRow}>
                          <ActivityIndicator size="small" color={isPopular ? "#FFFFFF" : "#4c1d95"} />
                          <Text style={[
                            styles.ctaButtonText, 
                            isPopular ? styles.ctaButtonTextPopular : styles.ctaButtonTextOutline,
                            { marginLeft: 6 }
                          ]}>Redirecting...</Text>
                        </View>
                      ) : (
                        <View style={styles.btnRow}>
                          <Zap size={14} color={isPopular ? "#FFFFFF" : "#4c1d95"} />
                          <Text style={[
                            styles.ctaButtonText, 
                            isPopular ? styles.ctaButtonTextPopular : styles.ctaButtonTextOutline,
                            { marginLeft: 6 }
                          ]}>Get Started</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        )}

        {/* 3. Summary Cards (Total Spent, Purchases, etc. Below Plan Cards) */}
        {dashboard && (
          <Animated.View entering={FadeInUp.delay(300)} style={{ marginBottom: 24 }}>
            <Text style={styles.sectionHeaderTitle}>Summary</Text>
            <SummaryCards dashboard={dashboard} />
          </Animated.View>
        )}

        {/* 4. Billing History (Below Summary Cards) */}
        {dashboard && (
          <View>
            <Text style={styles.sectionHeaderTitle}>Billing History</Text>
            <Animated.View entering={FadeInUp.delay(350)} style={{ marginBottom: 12 }}>
              <BillingHistoryList dashboard={dashboard} />
            </Animated.View>
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 110 },
  header: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76, 29, 149, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  headerBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#4c1d95',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },

  emptyBox: { padding: 40, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1.5, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  emptyText: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 10, textAlign: 'center' },
  
  listContainer: { gap: 16, marginBottom: 16, marginTop: 12 },
  planCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, borderWidth: 1.5, borderColor: '#F1F5F9', borderLeftWidth: 4, borderLeftColor: '#4c1d95', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  planCardPopular: { borderColor: '#C4B5FD', backgroundColor: '#F5F3FF', borderLeftColor: '#4c1d95' },
  
  popularBadgeWrapper: { position: 'absolute', top: -10, left: 24, zIndex: 10 },
  popularBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#4c1d95', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, shadowColor: '#4c1d95', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  popularBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  
  planName: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 12 },
  currencySymbol: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  priceValue: { fontSize: 32, fontWeight: '900', color: '#1E293B', letterSpacing: -1 },
  pricePeriod: { fontSize: 13, color: '#64748B', fontWeight: '600', marginLeft: 2 },
  
  metaBadgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  pillBadge: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  pillBadgeText: { fontSize: 9, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },

  featuresContainer: { gap: 12, marginBottom: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureText: { fontSize: 13, color: '#475569', fontWeight: '500', flex: 1, lineHeight: 18 },
  
  noFeaturesWrapper: { justifyContent: 'center', alignItems: 'center', paddingVertical: 12, marginBottom: 16 },
  noFeaturesText: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic' },

  ctaButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  ctaButtonPopular: { backgroundColor: '#4c1d95', shadowColor: '#4c1d95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  ctaButtonOutline: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0' },
  ctaButtonText: { fontSize: 13, fontWeight: '800' },
  ctaButtonTextPopular: { color: '#FFFFFF' },
  ctaButtonTextOutline: { color: '#4c1d95' },
  
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

  expiredPlanContainer: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  activePlanContainer: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' },
  planBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planBannerIconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  expiredIconBg: { backgroundColor: '#FEE2E2' },
  activeIconBg: { backgroundColor: '#D1FAE5' },
  planBannerTextContainer: { flex: 1, gap: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  expiredBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  pulseDotRed: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  expiredBadgeText: { fontSize: 9, fontWeight: '700', color: '#B91C1C', textTransform: 'uppercase' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', borderWidth: 1, borderColor: '#6EE7B7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  pulseDotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  activeBadgeText: { fontSize: 9, fontWeight: '700', color: '#047857', textTransform: 'uppercase' },
  freeBadge: { backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 },
  freeBadgeText: { fontSize: 9, fontWeight: '700', color: '#475569', textTransform: 'uppercase' },
  bannerPlanName: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  bannerSubtitle: { fontSize: 11, color: '#64748B' },
  bannerMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  packageTypeBadge: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
  packageTypeText: { fontSize: 9, fontWeight: '600', color: '#64748B' },
  metaRowDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaDetailText: { fontSize: 11, fontWeight: '600', color: '#065F46' },
  expiryDateText: { fontSize: 11, color: '#64748B' },

  chooseTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  chooseSubtitle: { fontSize: 12, color: '#64748B', marginBottom: 8, lineHeight: 16 },

  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 20 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  summaryLabel: { fontSize: 9, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  summaryValue: { fontSize: 13, fontWeight: '800', color: '#0F172A' },

  sectionHeaderTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: '#64748B', marginTop: 12, fontWeight: '600' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center', marginTop: 12, marginBottom: 16, fontWeight: '600' },
  tryAgainButton: { backgroundColor: '#4c1d95', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  tryAgainText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },

  historySection: {},
  historyList: { gap: 10 },
  subscriptionHistoryCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', flexDirection: 'row' },
  cardSideStrip: { width: 3 },
  stripActive: { backgroundColor: '#4c1d95' },
  stripInactive: { backgroundColor: '#CBD5E1' },
  historyCardBody: { flex: 1, padding: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  historyCardLeft: { flex: 1, gap: 4 },
  historyCardTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  historyCardTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', maxWidth: '60%' },
  activeStatusBadge: { backgroundColor: '#4c1d95', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  activeStatusText: { fontSize: 8, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase' },
  paymentStatusBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  paidBadge: { backgroundColor: '#E0F2FE' },
  unpaidBadge: { backgroundColor: '#FEF3C7' },
  paymentStatusText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  paidText: { color: '#0369A1' },
  unpaidText: { color: '#B45309' },
  historyCardTypeBadge: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, alignSelf: 'flex-start' },
  historyCardTypeText: { fontSize: 9, fontWeight: '600', color: '#64748B' },
  historyDatesRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 2 },
  dateItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateLabel: { fontSize: 10, color: '#64748B', fontWeight: '500' },
  invoiceNoText: { fontSize: 10, color: '#94A3B8' },
  historyCardRight: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 60 },
  amountText: { fontSize: 14, fontWeight: '900', color: '#1E293B' },
  discountText: { fontSize: 9, color: '#94A3B8', marginTop: 1 },
  showMoreBtn: { marginTop: 12, width: '100%', backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#C4B5FD', borderRadius: 12, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
  showMoreBtnText: { fontSize: 11, fontWeight: '700', color: '#4c1d95' },

  footerSpacer: { height: 40 }
});
