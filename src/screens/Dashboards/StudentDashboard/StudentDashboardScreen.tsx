import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/context/AuthContext';
import { RoleBannerWidget } from '@/components/dashboard/RoleBannerWidget';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LearningActivityHeatmap } from '@/components/dashboard/LearningActivityHeatmap';
import { AICoachCard } from '@/components/dashboard/AICoachCard';
import { SkillsCard } from '@/components/dashboard/SkillsCard';
import { AlertsAgendaCard } from '@/components/dashboard/AlertsAgendaCard';
import { TrendingUp, Award, Briefcase, Bot } from 'lucide-react-native';

export const StudentDashboardScreen = () => {
  const { userFullName, role } = useAuth();

  const stats = [
    { title: 'Employability Score', value: '73/100', change: '+8 this month', icon: TrendingUp, color: colors.accent.DEFAULT },
    { title: 'Path Completion', value: '58%', change: '+12 this week', icon: Award, color: colors.primary.DEFAULT },
    { title: 'Applications Sent', value: '3', change: '1 shortlisted', icon: Briefcase, color: colors.info || '#3b82f6' },
    { title: 'AI Sessions', value: '12', change: '+4 assessments', icon: Bot, color: colors.success || '#10b981' },
  ];

  const skills = [
    { name: 'Python', percentage: 78 },
    { name: 'SQL', percentage: 85 },
    { name: 'Machine Learning', percentage: 61 },
    { name: 'Data Visualization', percentage: 55 },
    { name: 'Problem Solving', percentage: 80 },
  ];

  const alerts = [
    { type: 'warning' as const, message: 'Razorpay deadline in 3 days', detail: 'Your match: 76% — apply now' },
    { type: 'success' as const, message: 'Shortlisted at TCS iON!', detail: 'Interview: Feb 28, 3:00 PM' },
    { type: 'danger' as const, message: 'Habit Risk: LinkedIn', detail: '2 consecutive misses — streak at risk!' },
  ];

  const agenda = [
    { icon: 'education', text: 'ML Module Ch.2 — due Feb 25' },
    { icon: 'call', text: 'Mentor: Kavya Reddy — Feb 27 4PM' },
    { icon: 'write', text: 'AI Assessment: ML — Feb 28' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userNameText}>{userFullName || 'John Smith'}! 👋</Text>
        </View>

        <RoleBannerWidget 
          role={(role as any) || 'Student'} 
          fullName={userFullName || 'John Smith'} 
          subtitle="B.Tech CSE • 3rd Year • VJTI Mumbai"
          progress={78}
        />

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatsCard {...stats[0]} />
            <StatsCard {...stats[1]} />
          </View>
          <View style={styles.statsRow}>
            <StatsCard {...stats[2]} />
            <StatsCard {...stats[3]} />
          </View>
        </View>

        <LearningActivityHeatmap data={{ lessons: 142, problems: 287, studyTime: 168 }} />

        <AICoachCard 
          message="Great SQL progress! 🚀 You are top 15% in your cohort. Start your ML module next."
          task="Sklearn Ch.2 (45 min) + solve 2 classification problems."
        />

        <View style={styles.gridRow}>
           <SkillsCard skills={skills} />
        </View>

        <AlertsAgendaCard alerts={alerts} agenda={agenda} />
        
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
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
    paddingHorizontal: 4,
  },
  welcomeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: typography.fontFamily.display,
  },
  statsGrid: {
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginHorizontal: -4,
  },
  gridRow: {
    marginBottom: spacing.sm,
  },
  footerSpacer: {
    height: spacing.xl,
  }
});
