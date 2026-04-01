import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { SkillsRadarChart } from '@/components/dashboard/SkillsRadarChart';
import { OverallSkillScore } from '@/components/dashboard/OverallSkillScore';
import { SkillLedgerList } from '@/components/dashboard/SkillLedgerList';
import { Award, FileText, ShieldCheck, Target, Factory, TrendingUp, Zap, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const radarData = [
  { subject: 'Python', value: 90, fullMark: 100 },
  { subject: 'ML', value: 70, fullMark: 100 },
  { subject: 'SQL', value: 85, fullMark: 100 },
  { subject: 'Comm', value: 65, fullMark: 100 },
  { subject: 'Problem', value: 80, fullMark: 100 },
  { subject: 'Data Viz', value: 75, fullMark: 100 },
];

const ledgerStats = [
  { label: 'Total Skills', value: '14', icon: Target, color: '#EF4444', bg: '#FEF2F2' },
  { label: 'AI Verified', value: '6', icon: ShieldCheck, color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'Mentor Endorsed', value: '4', icon: Award, color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Industry Endorsed', value: '2', icon: Factory, color: '#8B5CF6', bg: '#F5F3FF' },
  { label: 'Evidence Items', value: '23', icon: FileText, color: '#64748B', bg: '#F8FAFC' },
];

export const StudentSkillsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Zap size={10} color={colors.accent.DEFAULT} fill={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>PRO ANALYST MODE</Text>
          </View>
          <Text style={styles.title}>Skills Pulse</Text>
          <Text style={styles.subtitle}>Real-time verification & competency ledger</Text>
        </Animated.View>

        {/* Skill Radar Section */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.premiumCard}>
          <View style={styles.cardHeader}>
             <View style={styles.cardHeaderTitle}>
                <TrendingUp size={16} color={colors.accent.DEFAULT} />
                <Text style={styles.sectionTitle}>Skill Radar</Text>
             </View>
             <TouchableOpacity style={styles.expandButton}>
                <Text style={styles.expandText}>FULL VIEW</Text>
                <ChevronRight size={14} color="#94A3B8" />
             </TouchableOpacity>
          </View>
          
          <View style={styles.radarContainer}>
            <SkillsRadarChart data={radarData} size={220} />
          </View>

          <View style={styles.insightBox}>
             <View style={styles.insightIconContainer}>
                <Zap size={14} color={colors.accent.DEFAULT} />
             </View>
             <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Dominant: Technical Core</Text>
                <Text style={styles.insightText}>You are in the top 12% for Python & SQL proficiency in this cohort.</Text>
             </View>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.row}>
          <Animated.View entering={FadeInUp.delay(300)} style={[styles.premiumCard, styles.halfCard]}>
            <Text style={styles.miniTitle}>LEDGER STATS</Text>
            <View style={styles.statsList}>
              {ledgerStats.map((stat, i) => (
                <View key={i} style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                    <stat.icon size={11} color={stat.color} />
                  </View>
                  <View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={[styles.premiumCard, styles.halfCard, { justifyContent: 'center' }]}>
            <Text style={[styles.miniTitle, { alignSelf: 'flex-start', position: 'absolute', top: 16, left: 16 }]}>OVERALL</Text>
            <OverallSkillScore score={73} size={92} strokeWidth={8} />
          </Animated.View>
        </View>

        {/* Skill Ledger List */}
        <Animated.View entering={FadeInUp.delay(500)}>
          <SkillLedgerList />
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
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  cardHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  miniTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  insightText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfCard: {
    flex: 1,
  },
  statsList: {
    gap: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  footerSpacer: {
    height: 40,
  }
});
