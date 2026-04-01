import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Quote, 
  Briefcase, 
  IndianRupee, 
  Rocket, 
  Sparkles, 
  ChevronRight, 
  Star, 
  Award, 
  TrendingUp,
  History
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Stories data
const stories = [
  { id: 1, name: "Riya Sharma", initials: "RS", college: "VJTI Mumbai", achievement: "SDE @ Google", package: "₹42 LPA", outcome: "Founded Fintech Startup Seed Funded", quote: "The Skill Ledger and AI coach helped me identify gaps early and fix them systematically.", avatarColor: "#9333EA", icon: Briefcase },
  { id: 2, name: "Arjun Mehta", initials: "AM", college: "COEP Pune", achievement: "ML Engineer @ Microsoft", package: "₹38 LPA", outcome: "Published 3 research papers", quote: "Path Finder mapped my startup journey. Mentor sessions with industry pros changed everything.", avatarColor: "#2563EB", icon: TrendingUp },
  { id: 3, name: "Priya Krishnan", initials: "PK", college: "BITS Pilani", achievement: "Product Manager @ Amazon", package: "₹45 LPA", outcome: "Launched 2 successful products", quote: "The community and mentorship helped me transition from engineering to product management.", avatarColor: "#10B981", icon: Rocket },
  { id: 4, name: "Siddharth Shah", initials: "SS", college: "IIT Bombay", achievement: "Data Scientist @ Microsoft", package: "₹36 LPA", outcome: "Built AI solution for healthcare", quote: "The AI coach identified my weak areas and recommended exactly what I needed to learn.", avatarColor: colors.accent.DEFAULT, icon: Award }
];

export const StudentStoriesScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <History size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>SUCCESS STORIES</Text>
          </View>
          <Text style={styles.title}>Stories</Text>
          <Text style={styles.subtitle}>Real outcomes from StrideNex students</Text>
        </Animated.View>

        {/* Stories List */}
        <View style={styles.listContainer}>
           {stories.map((story, index) => (
             <Animated.View 
               key={story.id} 
               entering={FadeInUp.delay(200 + index * 100)}
               style={styles.storyCard}
             >
                <View style={styles.cardHeader}>
                   <View style={styles.userInfo}>
                      <View style={[styles.avatar, { backgroundColor: story.avatarColor }]}>
                         <Text style={styles.avatarText}>{story.initials}</Text>
                      </View>
                      <View>
                         <Text style={styles.userName}>{story.name}</Text>
                         <Text style={styles.userCollege}>{story.college}</Text>
                      </View>
                   </View>
                   <View style={styles.successBadge}>
                      <Sparkles size={10} color={colors.accent.DEFAULT} />
                      <Text style={styles.successBadgeText}>Success Story</Text>
                   </View>
                </View>

                {/* Achievement & Package Row */}
                <View style={styles.statsRow}>
                   <View style={styles.statBox}>
                      <View style={styles.statHeader}>
                         <story.icon size={12} color={colors.accent.DEFAULT} />
                         <Text style={styles.statLabel}>Achievement</Text>
                      </View>
                      <Text style={styles.statValue}>{story.achievement}</Text>
                   </View>
                   {story.package && (
                     <View style={[styles.statBox, { backgroundColor: '#F0FDF4' }]}>
                        <View style={styles.statHeader}>
                           <IndianRupee size={12} color="#059669" />
                           <Text style={styles.statLabel}>Package</Text>
                        </View>
                        <Text style={[styles.statValue, { color: '#059669' }]}>{story.package}</Text>
                     </View>
                   )}
                </View>

                {/* Outcome Header */}
                <View style={styles.outcomeRow}>
                   <View style={styles.outcomeBadge}>
                      <Rocket size={10} color="#9333EA" />
                      <Text style={styles.outcomeBadgeText}>Outcome</Text>
                   </View>
                   <Text style={styles.outcomeText}>{story.outcome}</Text>
                </View>

                {/* Quote Box */}
                <View style={styles.quoteBox}>
                   <Quote size={20} color="rgba(255, 107, 0, 0.2)" style={styles.quoteIcon} />
                   <Text style={styles.quoteText}>"{story.quote}"</Text>
                </View>
             </Animated.View>
           ))}
        </View>

        {/* CTA Banner */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.ctaWrapper}>
           <View style={[styles.ctaBanner, { backgroundColor: '#FFEDD5' }]}>
              <Text style={styles.ctaTitle}>Your Success Story Starts Today</Text>
              <Text style={styles.ctaSubtitle}>Join 10,000+ students building their future on StrideNex</Text>
              
              <TouchableOpacity style={styles.startPathButton}>
                 <Text style={styles.startPathButtonText}>Start Your Path</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.viewAllButton}>
                 <Text style={styles.viewAllText}>View All Stories</Text>
                 <ChevronRight size={14} color={colors.accent.DEFAULT} />
              </TouchableOpacity>
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
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  headerBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.accent.DEFAULT,
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
  
  listContainer: { gap: 16, marginBottom: 32 },
  storyCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  userCollege: { fontSize: 12, fontWeight: '500', color: '#64748B' },
  successBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255, 107, 0, 0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.15)' },
  successBadgeText: { fontSize: 10, fontWeight: '700', color: colors.accent.DEFAULT },
  
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  statValue: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  
  outcomeRow: { marginBottom: 16 },
  outcomeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(147, 51, 234, 0.15)' },
  outcomeBadgeText: { fontSize: 9, fontWeight: '700', color: '#9333EA' },
  outcomeText: { fontSize: 13, color: '#334155', fontWeight: '600' },
  
  quoteBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, position: 'relative', marginTop: 4 },
  quoteIcon: { position: 'absolute', top: 12, left: 12 },
  quoteText: { fontSize: 13, color: '#475569', fontStyle: 'italic', fontWeight: '500', lineHeight: 20, paddingLeft: 24 },
  
  ctaWrapper: { overflow: 'hidden', borderRadius: 24, borderWidth: 1, borderColor: '#FFEDD5' },
  ctaBanner: { padding: 24, alignItems: 'center' },
  ctaTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
  ctaSubtitle: { fontSize: 13, color: '#475569', fontWeight: '500', marginBottom: 24, textAlign: 'center', paddingHorizontal: 16 },
  startPathButton: { width: '100%', backgroundColor: colors.accent.DEFAULT, paddingVertical: 16, borderRadius: 14, alignItems: 'center', shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, marginBottom: 12 },
  startPathButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  viewAllButton: { width: '100%', flexDirection: 'row', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#FDBA74', alignItems: 'center', gap: 6 },
  viewAllText: { color: colors.accent.DEFAULT, fontSize: 14, fontWeight: '800' },

  footerSpacer: { height: 40 }
});
