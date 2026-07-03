import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
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
import { useNavigation } from '@react-navigation/native';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useIndustry } from '@/context/IndustryContext';
import { getApplicationStatusCount } from '@/api/industry.services';

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

const initialPipelineStages = [
  { stage: "New Applications", count: 0, color: "#1E293B", apiKey: "Applied" },
  { stage: "AI Pre-screened", count: 0, color: "#3B82F6", apiKey: "Shortlisted" },
  { stage: "HR Shortlisted", count: 0, color: "#F97316", apiKey: "HR" },
  { stage: "Interview Round 1", count: 0, color: "#FB923C", apiKey: "Tech Interview" },
  { stage: "Final Round", count: 0, color: "#10B981", apiKey: "Final" },
  { stage: "Offers Extended", count: 0, color: "#059669", apiKey: "Selected" }
];

export const IndustryDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { userFullName } = useAuth();
  const { industryData, refreshIndustryData } = useIndustry();
  const [pipelineData, setPipelineData] = React.useState(initialPipelineStages);
  const [appliedCount, setAppliedCount] = React.useState(0);
  const [loadingPipeline, setLoadingPipeline] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshIndustryData();
    await fetchPipelineCounts();
    setRefreshing(false);
  }, [refreshIndustryData]);

  const fetchPipelineCounts = React.useCallback(async () => {
    const companyName = industryData?.company_name || industryData?.name;
    if (!companyName) return;

    try {
      setLoadingPipeline(true);
      const response = await getApplicationStatusCount(companyName);
      const apiData = response?.message?.data || response?.data?.data || response?.data || response?.message || {};

      // Update total applied count
      setAppliedCount(Number(apiData["Applied"]) || 0);

      // Calculate max count for relative widths (funnel effect)
      const counts = Object.values(apiData).map(v => Number(v) || 0);
      const maxCount = Math.max(...counts, 1);

      const updatedStages = initialPipelineStages.map(stage => {
        const count = Number(apiData[stage.apiKey]) || 0;
        return {
          ...stage,
          count,
          width: `${Math.max((count / maxCount) * 100, 5)}%` as any
        };
      });

      setPipelineData(updatedStages);
    } catch (err) {
      console.error("Error fetching pipeline counts:", err);
    } finally {
      setLoadingPipeline(false);
    }
  }, [industryData]);

  React.useEffect(() => {
    fetchPipelineCounts();
  }, [fetchPipelineCounts]);

  const dynamicStats = React.useMemo(() => [
    { id: 1, title: "SEARCHABLE STUDENTS", value: "12,840", icon: Users, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.08)" },
    { id: 2, title: "APPLICATIONS RECEIVED", value: loadingPipeline ? "..." : appliedCount.toString(), icon: ClipboardList, color: "#64748B", bg: "rgba(100, 116, 139, 0.08)" },
    { id: 3, title: "AVG SKILL MATCH", value: "89%", icon: Award, color: "#F97316", bg: "rgba(249, 115, 22, 0.08)" },
    { id: 4, title: "TIME TO SHORTLIST", value: "4.2d", icon: Zap, color: "#10B981", bg: "rgba(16, 185, 129, 0.08)" }
  ], [loadingPipeline, appliedCount]);
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Overview</Text>
              <View style={styles.headerBadge}>
                <LayoutDashboard size={10} color={colors.purple[600]} />
                <Text style={styles.headerBadgeText}>DASHBOARD SUMMARY</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Here is your recruitment overview today</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(150)} style={{ marginBottom: 12 }}>
            <RoleBannerWidget 
              fullName={userFullName || 'HR Team'} 
              date="Wednesday, 01 April"
              role="Industry Dashboard"
              progress={100}
              theme="purple"
            />
          </Animated.View>
        </View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInRight.delay(200)} style={styles.statsGrid}>
          {dynamicStats.map((stat) => (
             <View key={stat.id} style={styles.statWrapper}>
               <StatsCard 
                 title={stat.title} 
                 value={stat.value} 
                 icon={stat.icon} 
                 color={stat.color} 
               />
             </View>
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
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Application Pipeline</Text>
                {loadingPipeline && <ActivityIndicator size="small" color={colors.purple[600]} />}
              </View>
              <View style={styles.pipelineContainer}>
                {pipelineData.map((stage: any, idx) => (
                  <View key={idx} style={styles.pipelineRow}>
                    <Text style={styles.pipelineLabel}>{stage.stage}</Text>
                    <View style={styles.pipelineBarContainer}>
                      <View style={[styles.pipelineBarFill, { width: stage.width || '5%', backgroundColor: stage.color === '#F97316' || stage.color === '#FB923C' ? colors.purple[500] : stage.color }]} />
                    </View>
                    <Text style={styles.pipelineCount}>{stage.count}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.card, { marginTop: 16 }]}>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Internships', { openForm: true })}>
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(10, 128, 153, 0.1)' }]}>
                  <Briefcase size={16} color={colors.purple[600]} />
                </View>
                <Text style={styles.actionBtnText}>Post New Internship</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Projects', { openForm: true })}>
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
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(10, 128, 153, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -2,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  statWrapper: {
    width: '25%',
    paddingHorizontal: 0,
    marginBottom: 8,
  },

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
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
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
