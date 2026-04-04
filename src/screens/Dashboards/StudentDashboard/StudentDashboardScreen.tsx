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

import { Svg, Defs, LinearGradient as SvgGradient, Stop, Rect, Circle } from 'react-native-svg';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

export const StudentDashboardScreen = () => {
  const { userFullName, role } = useAuth();

  const stats = [
    { title: 'Score', value: '73/100', icon: TrendingUp, color: colors.accent.DEFAULT },
    { title: 'Goal', value: '58%', icon: Award, color: colors.primary.DEFAULT },
    { title: 'Active', value: '3', icon: Briefcase, color: colors.info || '#3b82f6' },
    { title: 'Sessions', value: '12', icon: Bot, color: colors.success || '#10b981' },
  ];

  const skills = [
    { name: 'Python', percentage: 78 },
    { name: 'SQL', percentage: 85 },
    { name: 'ML', percentage: 61 },
    { name: 'Viz', percentage: 55 },
  ];

  const alerts = [
    { type: 'warning' as const, message: 'Upcoming Deadline', detail: 'Razorpay • 3 days left' },
    { type: 'success' as const, message: 'Project Approved', detail: 'TCS • Interview: Feb 28' },
  ];

  const agenda = [
    { icon: 'education', text: 'ML Module Ch.2 — Today' },
    { icon: 'call', text: 'Mentor call — Feb 27 4PM' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200)}>
          <RoleBannerWidget 
            fullName={userFullName || 'John Smith'} 
            date="Monday, 30 March"
            role={role || 'Student Dashboard'}
            progress={78}
          />
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
        </View>

        <Animated.View entering={FadeInRight.delay(300)} style={styles.statsGrid}>
          {stats.map((stat, i) => (
             <View key={i} style={styles.statWrapper}>
                <StatsCard {...stat} />
             </View>
          ))}
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Strategic Learning</Text>
        </View>

        <Animated.View entering={FadeInUp.delay(400)}>
          <LearningActivityHeatmap data={{ lessons: 142, problems: 287, studyTime: 168 }} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)}>
          <AICoachCard 
            message="Your SQL velocity is impressive. 🚀 You've unlocked the next 'Strategic Learning' path."
            task="Optimize Ch.4 Joins + solving 3 advanced queries."
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)}>
          <SkillsCard skills={skills} />
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Communications</Text>
        </View>

        <Animated.View entering={FadeInUp.delay(700)}>
          <AlertsAgendaCard alerts={alerts} agenda={agenda} />
        </Animated.View>
        
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
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  userNameText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
    letterSpacing: -1,
  },
  todayText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
  },
  sectionHeader: {
    marginBottom: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    paddingVertical: 4,
  },
  statWrapper: {
    width: '25%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  footerSpacer: {
    height: 60,
  }
});
