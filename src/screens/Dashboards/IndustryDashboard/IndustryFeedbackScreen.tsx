import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Star, 
  ThumbsUp,
  BarChart3,
  Lightbulb,
  Lock,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { StatsCard } from '@/components/dashboard/StatsCard';

const feedbackReviews = [
  {
    id: 1,
    student: "Anonymous Student",
    role: "AI Fraud Detection Internship • Jan-Mar 2025",
    text: "Great technical mentorship and collaborative team culture. Projects were impactful and real. Compensation could improve for interns.",
    rating: 5,
    date: "Mar 10, 2025",
    tags: ["Good Mentorship", "Real Projects", "Inclusive Culture"],
    breakdown: { mentorship: "4/5", culture: "5/5", learning: "4/5", compensation: "3/5", worklife: "4/5" }
  },
  {
    id: 2,
    student: "Anonymous Student",
    role: "Payments Dashboard Internship • Oct-Dec 2024",
    text: "Exceptional learning experience. The manager was incredibly supportive and the team treated me as a full member from day one.",
    rating: 5,
    date: "Jan 5, 2025",
    tags: ["Excellent Culture", "Growth Focused", "Highly Recommend"],
    breakdown: { mentorship: "5/5", culture: "5/5", learning: "5/5", compensation: "4/5", worklife: "5/5" }
  },
  {
    id: 3,
    student: "Anonymous Student",
    role: "Data Science Project • Aug-Oct 2024",
    text: "Decent experience overall. The initial onboarding was slow and tools access took 2 weeks. Once set up, the work was interesting but could be better structured.",
    rating: 3,
    date: "Nov 2, 2024",
    tags: ["Needs Better Onboarding", "Good Team", "Average Pay"],
    breakdown: { mentorship: "3/5", culture: "4/5", learning: "3/5", compensation: "3/5", worklife: "3/5" }
  }
];

export const IndustryFeedbackScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
           <View style={styles.headerBadge}>
              <Star size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>INTERN FEEDBACK</Text>
           </View>
           <Text style={styles.title}>Feedback Reviews</Text>
           <Text style={styles.subtitle}>Analyze student experience and satisfaction</Text>
        </Animated.View>

        {/* Policy Banner */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.policyBanner}>
           <View style={styles.lockIconBox}>
              <Lock size={20} color="#3B82F6" />
           </View>
           <Text style={styles.policyText}>
              <Text style={styles.policyBoldText}>Anonymous Feedback Policy: </Text>
              All reviews are strictly anonymised. Student identities remain hidden. These insights help you improve the intern experience.
           </Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.statsRow}>
           <StatsCard title="OVERALL RATING" value="4.0/5" icon={Star} color="#F97316" />
           <StatsCard title="TOTAL REVIEWS" value="4" icon={FileText} color="#3B82F6" />
           <StatsCard title="RECOMMEND" value="92%" icon={ThumbsUp} color="#10B981" />
           <StatsCard title="RATING TREND" value="+0.4" icon={TrendingUp} color="#EF4444" />
        </Animated.View>

        {/* Actionable Insights */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.insightsCard}>
           <View style={styles.insightsHeader}>
              <View style={styles.insightIconBox}>
                 <Lightbulb size={16} color="#FFF" />
              </View>
              <Text style={styles.insightsTitle}>Actionable Insights</Text>
           </View>
           
           <View style={styles.insightsList}>
              <View style={styles.insightRow}>
                 <View style={[styles.insightDot, { backgroundColor: '#10B981' }]} />
                 <Text style={styles.insightText}>
                    <Text style={{fontWeight: '800', color: '#0F172A'}}>Strong Points: </Text>
                    Culture & Tech Mentorship are top-rated areas.
                 </Text>
              </View>
              <View style={styles.insightRow}>
                 <View style={[styles.insightDot, { backgroundColor: '#F97316' }]} />
                 <Text style={styles.insightText}>
                    <Text style={{fontWeight: '800', color: '#0F172A'}}>Opportunity: </Text>
                    Onboarding speed and tool access latency needs work.
                 </Text>
              </View>
           </View>
        </Animated.View>

        {/* Rating Distribution */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.distributionCard}>
           <Text style={styles.distributionTitle}>Rating Distribution</Text>
           <View style={styles.distributionList}>
              {[5,4,3,2,1].map((stars, idx) => {
                 const percent = [25, 50, 25, 0, 0][idx];
                 const count = [1, 2, 1, 0, 0][idx];
                 return (
                    <View key={idx} style={styles.distributionRow}>
                       <View style={styles.starCol}>
                          <Text style={styles.starText}>{stars}</Text>
                          <Star size={12} color="#F59E0B" fill="#F59E0B" />
                       </View>
                       <View style={styles.barBg}>
                          <View style={[styles.barFill, { width: `${percent}%` }]} />
                       </View>
                       <Text style={styles.countText}>{count}</Text>
                    </View>
                 );
              })}
           </View>
        </Animated.View>

        {/* Reviews List */}
        <Animated.View entering={FadeInUp.delay(500)}>
           <View style={styles.reviewsSectionHeader}>
              <Users size={20} color="#6366F1" />
              <Text style={styles.reviewsTitle}>Student Reviews</Text>
           </View>

           <View style={styles.reviewsList}>
              {feedbackReviews.map(review => (
                 <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                       <View style={styles.reviewerInfo}>
                          <View style={styles.reviewerAvatar}>
                             <Users size={20} color="#6366F1" />
                          </View>
                          <View>
                             <View style={styles.reviewerNameRow}>
                                <Text style={styles.reviewerName}>Anonymous Intern</Text>
                                <View style={styles.hiddenBadge}>
                                   <Text style={styles.hiddenBadgeText}>HIDDEN</Text>
                                </View>
                             </View>
                             <View style={styles.roleBadge}>
                                <Text style={styles.roleText}>{review.role}</Text>
                             </View>
                          </View>
                       </View>
                       
                       <View style={styles.reviewMeta}>
                          <View style={styles.starsRow}>
                             {[1,2,3,4,5].map(s => (
                                <Star key={s} size={12} color={s <= review.rating ? "#F59E0B" : "#E2E8F0"} fill={s <= review.rating ? "#F59E0B" : "transparent"} />
                             ))}
                          </View>
                          <Text style={styles.reviewDate}>{review.date}</Text>
                       </View>
                    </View>

                    <Text style={styles.reviewText}>"{review.text}"</Text>

                    <View style={styles.tagsRow}>
                       {review.tags.map(tag => (
                          <View key={tag} style={styles.tagPill}>
                             <Text style={styles.tagText}>{tag}</Text>
                          </View>
                       ))}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.breakdownGrid}>
                       {Object.entries(review.breakdown).map(([key, val]) => (
                          <View key={key} style={styles.breakdownItem}>
                             <Text style={styles.breakdownValue}>{val}</Text>
                             <Text style={styles.breakdownLabel}>{key}</Text>
                          </View>
                       ))}
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
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },

  policyBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#EFF6FF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#DBEAFE', marginBottom: 24 },
  lockIconBox: { width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  policyText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 20, fontWeight: '500' },
  policyBoldText: { color: '#2563EB', fontWeight: '800' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24 },

  insightsCard: { backgroundColor: '#EEF2FF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E0E7FF', marginBottom: 24 },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  insightIconBox: { width: 32, height: 32, backgroundColor: '#6366F1', borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  insightsTitle: { fontSize: 12, fontWeight: '800', color: '#4338CA', textTransform: 'uppercase', letterSpacing: 1 },
  insightsList: { gap: 12 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  insightDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  insightText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 20 },

  distributionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  distributionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  distributionList: { gap: 12 },
  distributionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  starCol: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 32 },
  starText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  barBg: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
  countText: { width: 24, textAlign: 'right', fontSize: 12, fontWeight: '800', color: '#1E293B' },

  reviewsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4, marginBottom: 16 },
  reviewsTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  
  reviewsList: { gap: 16 },
  reviewCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  reviewerInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  reviewerAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  reviewerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  reviewerName: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  hiddenBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#DBEAFE' },
  hiddenBadgeText: { fontSize: 9, fontWeight: '900', color: '#2563EB', letterSpacing: 0.5 },
  roleBadge: { backgroundColor: '#F8FAFC', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  roleText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  
  reviewMeta: { alignItems: 'flex-end', gap: 4 },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewDate: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase' },

  reviewText: { fontSize: 14, color: '#334155', fontWeight: '500', lineHeight: 22, marginBottom: 20, paddingLeft: 16, borderLeftWidth: 2, borderLeftColor: '#6366F1' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tagPill: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  tagText: { fontSize: 10, fontWeight: '800', color: '#475569' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },

  breakdownGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  breakdownItem: { alignItems: 'center', width: '30%' },
  breakdownValue: { fontSize: 16, fontWeight: '900', color: '#6366F1', marginBottom: 2 },
  breakdownLabel: { fontSize: 9, fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },

  footerSpacer: { height: 40 }
});
