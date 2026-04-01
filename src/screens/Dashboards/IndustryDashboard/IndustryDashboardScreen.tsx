import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuth } from '@/context/AuthContext';
import { RoleBannerWidget } from '@/components/dashboard/RoleBannerWidget';
import { 
  Users, 
  Briefcase, 
  Target, 
  Zap, 
  Sparkles, 
  Award, 
  ClipboardList,
  LayoutDashboard
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { StatsCard } from '@/components/dashboard/StatsCard';

const industryStats = [
  { id: 1, title: "SEARCHABLE STUDENTS", value: "12,840", icon: Users, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.08)" },
  { id: 2, title: "APPLICATIONS RECEIVED", value: "247", icon: ClipboardList, color: "#64748B", bg: "rgba(100, 116, 139, 0.08)" },
  { id: 3, title: "AVG SKILL MATCH", value: "89%", icon: Award, color: "#F97316", bg: "rgba(249, 115, 22, 0.08)" },
  { id: 4, title: "TIME TO SHORTLIST", value: "4.2d", icon: Zap, color: "#10B981", bg: "rgba(16, 185, 129, 0.08)" }
];

const topCandidates = [
  { id: 1, initials: "PS", bgColor: "#EF4444", name: "Priya Sharma", college: "VJTI Mumbai • CGPA 8.7", skills: ["Python", "ML", "SQL"], match: 94 },
  { id: 2, initials: "SP", bgColor: "#84CC16", name: "Sneha Patel", college: "COEP Pune • CGPA 8.4", skills: ["Python", "SQL"], match: 88 },
  { id: 3, initials: "AN", bgColor: "#22C55E", name: "Arjun Nair", college: "IIT Bombay • CGPA 9.1", skills: ["ML", "Python"], match: 82 }
];

const pipelineStages = [
  { stage: "New Applications", count: 87, color: "#1E293B", width: "100%" },
  { stage: "AI Pre-screened", count: 62, color: "#3B82F6", width: "75%" },
  { stage: "HR Shortlisted", count: 28, color: "#F97316", width: "40%" },
  { stage: "Interview Round 1", count: 14, color: "#FB923C", width: "20%" },
  { stage: "Final Round", count: 6, color: "#10B981", width: "10%" },
  { stage: "Offers Extended", count: 3, color: "#059669", width: "5%" }
];

export const IndustryDashboardScreen = () => {
  const { userFullName } = useAuth();
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
            <View style={styles.headerBadge}>
              <LayoutDashboard size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>DASHBOARD SUMMARY</Text>
            </View>
            <Text style={styles.title}>Overview</Text>
            <Text style={styles.subtitle}>Here is your recruitment overview today</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(150)} style={{ marginBottom: 24 }}>
            <RoleBannerWidget 
              fullName={userFullName || 'HR Team'} 
              date="Wednesday, 01 April"
              role="Industry Dashboard"
              progress={100}
              theme="purple"
            />
          </Animated.View>
        </View>

        {/* Stats Row */}
        <Animated.View entering={FadeInRight.delay(200)} style={styles.statsRow}>
          {industryStats.map((stat) => (
             <StatsCard 
               key={stat.id}
               title={stat.title} 
               value={stat.value} 
               icon={stat.icon} 
               color={stat.color} 
             />
          ))}
        </Animated.View>

        <View style={styles.contentBottom}>
          {/* Top Candidates */}
          <Animated.View entering={FadeInUp.delay(300)}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color={colors.purple[600]} />
              <Text style={styles.sectionTitle}>Top AI-Matched Candidates</Text>
            </View>

            <View style={styles.candidatesGrid}>
              {topCandidates.map((candidate, index) => (
                <View key={candidate.id} style={styles.candidateCard}>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>{candidate.match}%</Text>
                  </View>

                  <View style={styles.candidateTop}>
                    <View style={[styles.avatar, { backgroundColor: candidate.bgColor }]}>
                      <Text style={styles.avatarText}>{candidate.initials}</Text>
                    </View>
                    <View style={styles.candidateInfo}>
                      <Text style={styles.candidateName}>{candidate.name}</Text>
                      <Text style={styles.candidateCollege}>{candidate.college}</Text>
                      <View style={styles.skillsRow}>
                        {candidate.skills.map(skill => (
                          <View key={skill} style={styles.skillTag}>
                            <Text style={styles.skillTagText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>

                  <View style={styles.candidateActions}>
                    <TouchableOpacity style={styles.inviteBtn}>
                      <Sparkles size={14} color="#FFF" />
                      <Text style={styles.inviteBtnText}>Invite</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ledgerBtn}>
                      <Text style={styles.ledgerBtnText}>View Ledger</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Pipeline & Quick Actions */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.bottomSection}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Application Pipeline</Text>
              <View style={styles.pipelineContainer}>
                {pipelineStages.map((stage, idx) => (
                  <View key={idx} style={styles.pipelineRow}>
                    <Text style={styles.pipelineLabel}>{stage.stage}</Text>
                    <View style={styles.pipelineBarContainer}>
                      <View style={[styles.pipelineBarFill, { width: stage.width as any, backgroundColor: stage.color === '#F97316' || stage.color === '#FB923C' ? colors.purple[500] : stage.color }]} />
                    </View>
                    <Text style={styles.pipelineCount}>{stage.count}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.card, { marginTop: 16 }]}>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(147, 51, 234, 0.1)' }]}>
                  <Briefcase size={16} color={colors.purple[600]} />
                </View>
                <Text style={styles.actionBtnText}>Post New Internship</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Target size={16} color="#3B82F6" />
                </View>
                <Text style={styles.actionBtnText}>Post Live Project</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24 },
  contentBottom: { paddingHorizontal: 16, marginTop: 24 },
  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 16 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  candidatesGrid: { gap: 16, marginBottom: 32 },
  candidateCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1, position: 'relative' },
  matchBadge: { position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  matchBadgeText: { fontSize: 12, fontWeight: '800', color: '#059669' },
  candidateTop: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  candidateInfo: { flex: 1, paddingRight: 40 },
  candidateName: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  candidateCollege: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 8 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#DBEAFE' },
  skillTagText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  candidateActions: { flexDirection: 'row', gap: 12 },
  inviteBtn: { flex: 1, backgroundColor: colors.purple[600], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  inviteBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  ledgerBtn: { flex: 1, backgroundColor: '#F8FAFC', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  ledgerBtnText: { color: '#475569', fontSize: 13, fontWeight: '700' },
  bottomSection: { marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  pipelineContainer: { gap: 16 },
  pipelineRow: { flexDirection: 'row', alignItems: 'center' },
  pipelineLabel: { width: 110, fontSize: 12, fontWeight: '600', color: '#475569' },
  pipelineBarContainer: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginHorizontal: 12, overflow: 'hidden' },
  pipelineBarFill: { height: '100%', borderRadius: 3 },
  pipelineCount: { width: 24, textAlign: 'right', fontSize: 13, fontWeight: '800', color: '#1E293B' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  actionIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  footerSpacer: { height: 40 }
});
