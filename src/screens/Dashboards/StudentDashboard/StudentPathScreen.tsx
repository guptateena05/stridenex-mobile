import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  ChevronRight, 
  Zap, 
  LayoutDashboard,
  Cpu,
  Database,
  LineChart
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const roadmap = [
  { title: "Python Fundamentals", subtitle: "Complete Python Basics course", date: "Jan 12", status: "completed" },
  { title: "Data Structures & Algo", subtitle: "DSA + 30 LeetCode problems", date: "Jan 28", status: "completed" },
  { title: "SQL & Database Design", subtitle: "Advanced SQL + 2 projects", date: "Feb 5", status: "completed" },
  { title: "Machine Learning Basics", subtitle: "Sklearn, Pandas - Active", date: "Due Mar 1", status: "active" },
  { title: "ML Capstone Project", subtitle: "Industry live project submission", date: "Mar 30", status: "upcoming" },
  { title: "Data Science Internship", subtitle: "Apply to shortlisted companies", date: "Apr-Jun", status: "upcoming" },
];

const alternatePaths = [
  { 
    title: "ML Engineer", 
    fit: "88%", 
    skills: ["Python", "TF", "MLOps"], 
    color: "#EF4444", 
    icon: Cpu 
  },
  { 
    title: "Data Analyst", 
    fit: "82%", 
    skills: ["SQL", "Excel", "Tableau"], 
    color: "#3B82F6", 
    icon: Database 
  },
  { 
    title: "AI Researcher", 
    fit: "71%", 
    skills: ["ML", "Maths", "Papers"], 
    color: "#8B5CF6", 
    icon: LineChart 
  },
];

export const StudentPathScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Target size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>STRATEGIC JOURNEY</Text>
          </View>
          <Text style={styles.title}>Your Path</Text>
          <Text style={styles.subtitle}>Curated roadmap based on your goals</Text>
        </Animated.View>

        {/* Active Path Roadmap Card */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.premiumCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitle}>
              <View style={[styles.titleIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Target size={16} color="#2563EB" />
              </View>
              <Text style={styles.sectionTitle}>Active: Data Scientist</Text>
            </View>
            <TouchableOpacity style={styles.expandButton}>
              <Text style={styles.expandText}>OVERVIEW</Text>
              <ChevronRight size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
               <Text style={styles.progressLabel}>Current Progress</Text>
               <Text style={styles.progressValue}>58%</Text>
            </View>
            <View style={styles.progressBarBg}>
               <Animated.View 
                 style={[styles.progressBarFill, { width: '58%' }]} 
               />
            </View>
            <View style={styles.progressFooter}>
               <TrendingUp size={12} color="#64748B" />
               <Text style={styles.progressFooterText}>Est. completion: Apr 2025</Text>
            </View>
          </View>

          <View style={styles.timelineContainer}>
            {roadmap.map((step, idx) => (
              <View key={idx} style={[styles.timelineItem, step.status === 'upcoming' && styles.upcomingStep]}>
                <View style={styles.timelineLeft}>
                   <View style={[styles.timelineDotContainer, step.status === 'upcoming' && styles.upcomingDot]}>
                      {step.status === 'completed' ? (
                        <CheckCircle2 size={18} color="#10B981" />
                      ) : step.status === 'active' ? (
                        <View style={styles.activeDotOutline}>
                           <View style={styles.activeDotInner} />
                        </View>
                      ) : (
                        <Circle size={18} color="#CBD5E1" />
                      )}
                   </View>
                   {idx < roadmap.length - 1 && <View style={styles.timelineConnector} />}
                </View>
                <View style={styles.timelineRight}>
                   <View style={styles.stepHeader}>
                      <Text style={[styles.stepTitle, step.status === 'active' && styles.activeStepTitle]}>{step.title}</Text>
                      <Text style={styles.stepDate}>{step.date}</Text>
                   </View>
                   <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* AI Suggestion Card */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.aiCard}>
          <View style={styles.aiCardHeader}>
             <Text style={styles.aiEmoji}>🤖</Text>
             <Text style={styles.aiTitle}>AI Path Suggetions</Text>
          </View>
          <View style={styles.aiContentCard}>
             <View style={styles.aiGlow} />
             <Text style={styles.aiContentText}>
               Based on your psychometric profile, add <Text style={styles.aiHighlight}>Feature Engineering</Text> next — it will boost your ML project quality by ~30%.
             </Text>
             <View style={styles.aiActions}>
                <TouchableOpacity style={styles.aiButtonPrimary}>
                   <Text style={styles.aiButtonTextPrimary}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.aiButtonSecondary}>
                   <Text style={styles.aiButtonTextSecondary}>Other Paths</Text>
                </TouchableOpacity>
             </View>
          </View>
        </Animated.View>

        {/* Alternate Paths */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitleSimple}>Alternate Paths</Text>
        </View>

        {alternatePaths.map((path, index) => (
          <Animated.View 
            key={index} 
            entering={FadeInRight.delay(400 + index * 100)}
            style={styles.pathItemCard}
          >
             <View style={styles.pathItemLeft}>
                 <View style={[styles.pathIconContainer, { backgroundColor: `${path.color}10` }]}>
                    <path.icon size={20} color={path.color} />
                 </View>
                 <View style={styles.pathItemInfo}>
                    <Text style={styles.pathItemTitle}>{path.title}</Text>
                    <View style={styles.skillBadgeRow}>
                       {path.skills.map((skill, si) => (
                         <View key={si} style={styles.skillBadge}>
                            <Text style={styles.skillBadgeText}>{skill}</Text>
                         </View>
                       ))}
                    </View>
                 </View>
             </View>
             <View style={styles.pathItemRight}>
                <Text style={[styles.fitScore, { color: path.color }]}>{path.fit}</Text>
                <Text style={styles.fitLabel}>FIT SCORE</Text>
             </View>
          </Animated.View>
        ))}

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
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
  premiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  expandText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.accent.DEFAULT,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressFooterText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 60,
  },
  upcomingStep: {
    opacity: 0.5,
  },
  upcomingDot: {
    opacity: 0.3,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
  },
  timelineDotContainer: {
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
  },
  activeDotOutline: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: '#F1F5F9',
    marginTop: -2,
    marginBottom: -2,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  activeStepTitle: {
    color: '#1E293B',
    fontWeight: '800',
  },
  stepDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  aiEmoji: {
    fontSize: 18,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  aiContentCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  aiGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  aiContentText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '500',
  },
  aiHighlight: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  aiActions: {
    flexDirection: 'row',
    gap: 12,
  },
  aiButtonPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.accent.DEFAULT,
    borderRadius: 8,
  },
  aiButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  aiButtonSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  aiButtonTextSecondary: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sectionTitleSimple: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pathItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pathItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pathIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathItemInfo: {
    flex: 1,
  },
  pathItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  skillBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  skillBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  skillBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  pathItemRight: {
    alignItems: 'flex-end',
  },
  fitScore: {
    fontSize: 16,
    fontWeight: '900',
  },
  fitLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 2,
  },
  footerSpacer: {
    height: 40,
  }
});
