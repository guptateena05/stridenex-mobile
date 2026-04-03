import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { AlertTriangle, TrendingDown, Target, Zap, UserPlus, Brain, ChevronRight } from 'lucide-react-native';

const metricCards = [
  { id: 1, title: 'Critical Risk <40', value: '47', icon: AlertTriangle, color: colors.error },
  { id: 2, title: 'High Risk 40-55', value: '96', icon: AlertTriangle, color: colors.warning },
  { id: 3, title: 'Declining Progress', value: '128', icon: TrendingDown, color: colors.success },
  { id: 4, title: 'Placement-Ready', value: '312', icon: Target, color: colors.success },
];

const criticalStudents = [
  { id: "RM", name: "Rahul Mehta", detail: "ECE 4th", statValue: "54", color: colors.error },
  { id: "VS", name: "Vikram Singh", detail: "ME 4th", statValue: "42", color: colors.error },
  { id: "PS", name: "Priya Sharma", detail: "CSE 3rd", statValue: "87", color: colors.success },
];

const recommendations = [
  { icon: "📚", text: "Bulk-enroll CSE 3rd Year in Data bootcamp", subject: "84 students", impact: "+15 avg score" },
  { icon: "🤝", text: "Peer mentors for at-risk 4th year", subject: "47 students", impact: "Improve retention" },
  { icon: "🎤", text: "AI mock-interview sessions", subject: "52 students", impact: "+20% offer rate" },
];

export const CollegeInterventionsScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Zap size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>INTERVENTIONS</Text>
          </View>
          <Text style={styles.title}>Student Actions</Text>
          <Text style={styles.subtitle}>Direct oversight of at-risk students and AI-driven plans</Text>
        </Animated.View>

        {/* Stats Row (4-in-a-row) */}
        <Animated.View entering={FadeInRight.delay(100)} style={styles.statsRow}>
          {metricCards.map((stat, i) => (
             <StatsCard 
              key={i} 
              title={stat.title.split(' ')[0]} 
              value={stat.value} 
              icon={stat.icon} 
              color={stat.color} 
            />
          ))}
        </Animated.View>

        {/* Critical Students */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <AlertTriangle color="#EF4444" size={18} />
            <Text style={styles.sectionTitle}>Critical Risk — Immediate Action</Text>
          </View>
          <View style={styles.listContainer}>
            {criticalStudents.map((s, idx) => (
              <View key={idx} style={[styles.entityRow, idx === criticalStudents.length - 1 && styles.noBorder]}>
                <View style={[styles.avatar, { backgroundColor: s.color + '10' }]}>
                  <Text style={[styles.avatarText, { color: s.color }]}>{s.id}</Text>
                </View>
                <View style={styles.entityInfo}>
                  <Text style={styles.entityName}>{s.name}</Text>
                  <Text style={styles.entitySub}>{s.detail} • Risk: <Text style={{ color: s.color, fontWeight: '800' }}>{s.statValue}%</Text></Text>
                </View>
                <View style={styles.actionGroup}>
                  <TouchableOpacity style={styles.iconBtn}>
                    <UserPlus size={14} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#FEE2E2', borderColor: '#FEE2E2' }]}>
                    <Brain size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.viewMoreBtn}>
             <Text style={styles.viewMoreText}>View All Critical Students</Text>
             <ChevronRight size={14} color="#64748B" />
          </TouchableOpacity>
        </Card>

        {/* AI Recommendations */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Brain color="#059669" size={18} />
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
          </View>
          <View style={styles.listContainer}>
            {recommendations.map((rec, idx) => (
              <View key={idx} style={styles.insightCard}>
                 <View style={styles.insightTop}>
                    <View style={styles.insightIconBox}>
                       <Text style={{ fontSize: 16 }}>{rec.icon}</Text>
                    </View>
                    <View style={styles.insightInfo}>
                       <Text style={styles.insightText}>{rec.text}</Text>
                       <View style={styles.insightMeta}>
                          <View style={styles.metaBadge}>
                             <Text style={styles.metaBadgeText}>{rec.subject}</Text>
                          </View>
                          <Text style={styles.impactText}>Est. Impact: <Text style={{ color: '#059669' }}>{rec.impact}</Text></Text>
                       </View>
                    </View>
                 </View>
                 <TouchableOpacity style={styles.execBtn}>
                    <Text style={styles.execBtnText}>Execute Action</Text>
                 </TouchableOpacity>
              </View>
            ))}
          </View>
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  
  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24 },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },

  listContainer: { gap: 16 },
  entityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  avatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 12, fontWeight: '800' },
  entityInfo: { flex: 1 },
  entityName: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  entitySub: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  actionGroup: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  
  viewMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 4 },
  viewMoreText: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  insightCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  insightTop: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  insightIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  insightInfo: { flex: 1 },
  insightText: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  insightMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaBadge: { backgroundColor: '#FFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  metaBadgeText: { fontSize: 9, fontWeight: '800', color: '#64748B' },
  impactText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  execBtn: { backgroundColor: '#0F172A', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  execBtnText: { fontSize: 12, fontWeight: '800', color: '#FFF' }
});
