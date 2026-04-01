import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { Eye, Briefcase, Zap, IndianRupee, LayoutDashboard } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { StatsCard } from '@/components/dashboard/StatsCard';

const { width } = Dimensions.get('window');

const analyticsStats = [
  { id: 1, title: "PROFILE VIEWS", value: "48.2K", icon: Eye, color: "#3B82F6" },
  { id: 2, title: "APPLICATIONS", value: "247", icon: Briefcase, color: "#64748B" },
  { id: 3, title: "AVG TIME (DS)", value: "4.2d", icon: Zap, color: "#10B981" },
  { id: 4, title: "COST SAVED", value: "₹2.4L", icon: IndianRupee, color: "#059669" }
];

const applicationsByRole = [
  { role: "Backend", count: 78 },
  { role: "Analytics", count: 54 },
  { role: "ML", count: 41 },
  { role: "Design", count: 19 },
  { role: "Fintech", count: 55 }
];

const maxAppCount = Math.max(...applicationsByRole.map(r => r.count));

const skillDistribution = [
  { skill: "Python", percentage: 78, color: "#F97316" },
  { skill: "SQL", percentage: 65, color: "#2563EB" },
  { skill: "Machine Learning", percentage: 42, color: "#10B981" },
  { skill: "React", percentage: 38, color: "#A855F7" },
  { skill: "Go", percentage: 18, color: "#EF4444" }
];

const collegeROI = [
  { id: 1, college: "IIT Bombay", applications: 32, shortlisted: 18, hired: 5, conversion: "28%", match: "91%", ctc: "₹18.5 L", matchColor: "#F97316" },
  { id: 2, college: "VJTI Mumbai", applications: 48, shortlisted: 22, hired: 7, conversion: "15%", match: "87%", ctc: "₹12.0 L", matchColor: "#FB923C" },
  { id: 3, college: "COEP Pune", applications: 38, shortlisted: 14, hired: 3, conversion: "8%", match: "84%", ctc: "₹10.5 L", matchColor: "#FB923C" },
  { id: 4, college: "NIT Warangal", applications: 27, shortlisted: 11, hired: 2, conversion: "7%", match: "82%", ctc: "₹15.0 L", matchColor: "#3B82F6" },
];

export const IndustryAnalyticsScreen = () => {
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
              <LayoutDashboard size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>INSIGHTS</Text>
           </View>
           <Text style={styles.title}>Analytics</Text>
           <Text style={styles.subtitle}>Track your employer brand performance</Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.statsRow}>
           {analyticsStats.map((stat, i) => (
             <StatsCard key={i} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
           ))}
        </Animated.View>

        {/* Applications By Role Chart representation */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.card}>
           <Text style={styles.cardTitle}>Applications by Role</Text>
           
           <View style={styles.barChartContainer}>
              <View style={styles.yAxis}>
                 <Text style={styles.yAxisText}>80</Text>
                 <Text style={styles.yAxisText}>60</Text>
                 <Text style={styles.yAxisText}>40</Text>
                 <Text style={styles.yAxisText}>20</Text>
                 <Text style={styles.yAxisText}>0</Text>
              </View>

              <View style={styles.chartArea}>
                 {/* Grid lines */}
                 {[0, 25, 50, 75, 100].map(pt => (
                    <View key={pt} style={[styles.gridLine, { bottom: `${pt}%` }]} />
                 ))}
                 
                 <View style={styles.barsRow}>
                    {applicationsByRole.map(item => {
                       const heightPercent = (item.count / maxAppCount) * 100;
                       return (
                          <View key={item.role} style={styles.barWrapper}>
                             <View style={styles.barTrack}>
                                <View style={[styles.barFill, { height: `${heightPercent}%`, backgroundColor: colors.purple[600] }]} />
                             </View>
                             <Text style={styles.barLabel}>{item.role}</Text>
                          </View>
                       );
                    })}
                 </View>
              </View>
           </View>
        </Animated.View>

        {/* Skill Distribution */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.card}>
           <Text style={styles.cardTitle}>Skill Distribution in Applicant Pool</Text>
           <View style={styles.skillsList}>
              {skillDistribution.map(item => (
                 <View key={item.skill} style={styles.skillItem}>
                    <View style={styles.skillTopRow}>
                       <Text style={styles.skillName}>{item.skill}</Text>
                       <Text style={[styles.skillPercent, { color: item.color }]}>{item.percentage}%</Text>
                    </View>
                    <View style={styles.skillTrack}>
                       <View style={[styles.skillFill, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                    </View>
                 </View>
              ))}
           </View>
        </Animated.View>

        {/* College ROI list */}
        <Animated.View entering={FadeInUp.delay(400)}>
           <Text style={styles.sectionTitle}>College ROI — Where Best Hires Come From</Text>
           
           {collegeROI.map(college => (
              <View key={college.id} style={styles.collegeCard}>
                 <View style={styles.collegeHeader}>
                    <Text style={styles.collegeName}>{college.college}</Text>
                    <View style={styles.matchBadge}>
                       <Text style={[styles.matchText, { color: college.matchColor }]}>{college.match} Match</Text>
                    </View>
                 </View>

                 <View style={styles.collegeGrid}>
                    <View style={styles.collegeStat}>
                       <Text style={styles.cStatValue}>{college.applications}</Text>
                       <Text style={styles.cStatLabel}>Apps</Text>
                    </View>
                    <View style={styles.collegeStat}>
                       <Text style={[styles.cStatValue, { color: '#3B82F6' }]}>{college.shortlisted}</Text>
                       <Text style={styles.cStatLabel}>Shortlisted</Text>
                    </View>
                    <View style={styles.collegeStat}>
                       <Text style={[styles.cStatValue, { color: '#10B981' }]}>{college.hired}</Text>
                       <Text style={styles.cStatLabel}>Hired</Text>
                    </View>
                    <View style={styles.collegeStat}>
                       <Text style={[styles.cStatValue, { fontSize: 13, alignSelf: 'center', marginTop: 2 }]}>{college.conversion}</Text>
                       <Text style={styles.cStatLabel}>Conversion</Text>
                    </View>
                 </View>

                 <View style={styles.ctcRow}>
                    <Text style={styles.ctcLabel}>Avg CTC</Text>
                    <Text style={styles.ctcValue}>{college.ctc}</Text>
                 </View>
              </View>
           ))}
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

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24 },

  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 20 },

  barChartContainer: { flexDirection: 'row', height: 200 },
  yAxis: { width: 30, justifyContent: 'space-between', paddingBottom: 24, paddingRight: 8 },
  yAxisText: { fontSize: 10, fontWeight: '600', color: '#94A3B8', textAlign: 'right' },
  chartArea: { flex: 1, position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#F1F5F9', zIndex: 0 },
  barsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: 24, zIndex: 1 },
  barWrapper: { alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: 30 },
  barTrack: { height: '100%', width: 24, justifyContent: 'flex-end' },
  barFill: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  barLabel: { position: 'absolute', bottom: -20, width: 50, textAlign: 'center', fontSize: 9, fontWeight: '700', color: '#64748B', left: -10 },

  skillsList: { gap: 16 },
  skillItem: {},
  skillTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  skillName: { fontSize: 13, fontWeight: '700', color: '#334155' },
  skillPercent: { fontSize: 13, fontWeight: '800' },
  skillTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  skillFill: { height: '100%', borderRadius: 4 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 16, paddingHorizontal: 4 },
  
  collegeCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderBottomWidth: 3, borderColor: '#E2E8F0', marginBottom: 12 },
  collegeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  collegeName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  matchBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F1F5F9', borderRadius: 8 },
  matchText: { fontSize: 11, fontWeight: '800' },
  
  collegeGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  collegeStat: { alignItems: 'center', width: '22%' },
  cStatValue: { fontSize: 16, fontWeight: '900', color: '#475569', marginBottom: 2 },
  cStatLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },

  ctcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#D1FAE5' },
  ctcLabel: { fontSize: 11, fontWeight: '800', color: '#059669', textTransform: 'uppercase' },
  ctcValue: { fontSize: 14, fontWeight: '900', color: '#059669' },

  footerSpacer: { height: 40 }
});
