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
  LayoutDashboard,
  UserCheck,
  CheckCircle2,
  GraduationCap,
  Building2,
  MessageSquare,
  TrendingUp
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



const initialPipelineStages = [
  { stage: "Applied", count: 0, color: "#1E293B", apiKey: "Applied" },
  { stage: "Shortlisted", count: 0, color: "#3B82F6", apiKey: "Shortlisted" },
  { stage: "Tech Interview", count: 0, color: "#FB923C", apiKey: "Tech Interview" },
  { stage: "Final", count: 0, color: "#10B981", apiKey: "Final" },
  { stage: "HR", count: 0, color: "#F97316", apiKey: "HR" },
  { stage: "Rejected", count: 0, color: "#EF4444", apiKey: "Rejected" },
  { stage: "Selected", count: 0, color: "#059669", apiKey: "Selected" },
  { stage: "Accepted", count: 0, color: "#0D9488", apiKey: "Accepted" }
];

export const IndustryDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { userFullName, userImage } = useAuth();
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
    { id: 1, title: "SEARCHABLE STUDENTS", value: "0", icon: Users, color: "#0A8099", bg: "rgba(10, 128, 153, 0.08)" },
    { id: 2, title: "APPLICATIONS RECEIVED", value: loadingPipeline ? "..." : appliedCount.toString(), icon: ClipboardList, color: "#64748B", bg: "rgba(100, 116, 139, 0.08)" },
    { id: 3, title: "AVG SKILL MATCH", value: "0%", icon: Award, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" },
    { id: 4, title: "TIME TO SHORTLIST", value: "0d", icon: Zap, color: "#16A34A", bg: "rgba(22, 163, 74, 0.08)" }
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
              date={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              role="Industry Dashboard"
              imageUrl={userImage}
              onEditPress={() => navigation.navigate('Company Profile')}
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


          {/* Pipeline & Quick Actions */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.bottomSection}>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Application Pipeline</Text>
                {loadingPipeline && <ActivityIndicator size="small" color={colors.purple[600]} />}
              </View>
              <View style={styles.pipelineContainer}>
                {pipelineData.map((stage: any, idx) => {
                  let StageIcon = ClipboardList;
                  if (idx === 1) StageIcon = Sparkles;
                  else if (idx === 2) StageIcon = UserCheck;
                  else if (idx === 3) StageIcon = MessageSquare;
                  else if (idx === 4) StageIcon = Award;
                  else if (idx === 5) StageIcon = CheckCircle2;

                  return (
                    <View key={idx} style={styles.pipelineRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: 125 }}>
                        <StageIcon size={12} color="#64748B" />
                        <Text style={styles.pipelineLabel} numberOfLines={1}>{stage.stage}</Text>
                      </View>
                      <View style={styles.pipelineBarContainer}>
                        <View style={[styles.pipelineBarFill, { width: stage.width || '5%', backgroundColor: colors.purple[600] }]} />
                      </View>
                      <Text style={styles.pipelineCount}>{stage.count}</Text>
                    </View>
                  );
                })}
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
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Job Profiles', { openForm: true })}>
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                  <Briefcase size={16} color="#F97316" />
                </View>
                <Text style={styles.actionBtnText}>Post Job Profile</Text>
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

  bottomSection: { marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  pipelineContainer: { gap: 16 },
  pipelineRow: { flexDirection: 'row', alignItems: 'center' },
  pipelineLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  pipelineBarContainer: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, marginHorizontal: 12, overflow: 'hidden' },
  pipelineBarFill: { height: '100%', borderRadius: 4 },
  pipelineCount: { width: 24, textAlign: 'right', fontSize: 13, fontWeight: '800', color: '#1E293B' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  actionIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  footerSpacer: { height: 40 }
});
