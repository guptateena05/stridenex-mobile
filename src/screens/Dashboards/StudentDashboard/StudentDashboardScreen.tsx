import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/Shared/Card';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { TrendingUp, Award, Briefcase, Bot, Bell } from 'lucide-react-native';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <View style={[styles.statCard, { borderBottomColor: color }]}>
    <View style={styles.statHeader}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={16} />
      </View>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    {change && (
      <View style={styles.changeBadge}>
        <Text style={styles.changeText}>{change}</Text>
      </View>
    )}
  </View>
);

export const StudentDashboardScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.welcomeText}>Welcome back, Student!</Text>
      
      {/* <View style={styles.gridContainer}>
        <View style={styles.row}>
          <StatCard title="Employability Score" value="73/100" change="+8 this month" icon={TrendingUp} color={colors.accent.DEFAULT} />
          <StatCard title="Path Completion" value="58%" change="+12 this week" icon={Award} color={colors.primary.DEFAULT} />
        </View>
        <View style={styles.row}>
          <StatCard title="Applications Sent" value="3" change="1 shortlisted" icon={Briefcase} color={colors.info || '#3b82f6'} />
          <StatCard title="AI Sessions" value="12" change="+4 assessments" icon={Bot} color={colors.success || '#10b981'} />
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Learning Activity</Text>
        <View style={styles.heatmapMock}>
          {Array.from({length: 28}).map((_, i) => (
            <View key={i} style={[styles.heatBox, { opacity: Math.max(0.1, Math.random()) }]} />
          ))}
        </View>
        <Text style={styles.cardSubText}>42 Lessons | 87 Problems Solved | 68 Hrs</Text>
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.navy }]}>
        <View style={styles.coachHeader}>
          <Bot color="#fff" size={24} />
          <Text style={styles.coachTitle}>AI Career Coach</Text>
        </View>
        <Text style={styles.coachText}>
          Great SQL progress! 🚀 You are top 15% in your cohort. Start your ML module next.
        </Text>
        <View style={styles.taskBox}>
          <Text style={styles.taskText}>Task: Sklearn Ch.2 + solve 2 problems.</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Top Skills</Text>
        <View style={styles.skillRow}>
          <Text style={styles.skillName}>Python</Text>
          <View style={styles.skillBarBg}>
            <View style={[styles.skillBarFill, { width: '78%', backgroundColor: colors.accent.DEFAULT }]} />
          </View>
          <Text style={styles.skillPerc}>78%</Text>
        </View>
        <View style={styles.skillRow}>
          <Text style={styles.skillName}>SQL</Text>
          <View style={styles.skillBarBg}>
            <View style={[styles.skillBarFill, { width: '85%', backgroundColor: colors.primary.DEFAULT }]} />
          </View>
          <Text style={styles.skillPerc}>85%</Text>
        </View>
        <View style={styles.skillRow}>
          <Text style={styles.skillName}>ML</Text>
          <View style={styles.skillBarBg}>
            <View style={[styles.skillBarFill, { width: '61%', backgroundColor: colors.info || '#3b82f6' }]} />
          </View>
          <Text style={styles.skillPerc}>61%</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.alertsHeader}>
          <Bell color={colors.navy} size={20} />
          <Text style={styles.cardTitle}> Alerts & Agenda</Text>
        </View>
        <View style={[styles.alertItem, { borderLeftColor: colors.warning || '#f59e0b' }]}>
          <Text style={styles.alertTitle}>Razorpay deadline in 3 days</Text>
          <Text style={styles.alertSub}>Your match: 76% — apply now</Text>
        </View>
        <View style={[styles.alertItem, { borderLeftColor: colors.success || '#10b981' }]}>
          <Text style={styles.alertTitle}>Shortlisted at TCS iON!</Text>
          <Text style={styles.alertSub}>Interview: Feb 28, 3:00 PM</Text>
        </View>
      </Card> */}
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light || '#fcfcfc' },
  content: { padding: spacing.md, paddingBottom: 40 },
  welcomeText: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.navy, marginBottom: spacing.lg, fontFamily: typography.fontFamily.display },
  gridContainer: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: borderRadius.xl, padding: spacing.md, marginHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderBottomWidth: 3 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  statTitle: { fontSize: typography.fontSize.xs, color: colors.text.secondary, flex: 1 },
  iconBox: { padding: 4, borderRadius: 6 },
  statValue: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.navy, marginBottom: 4 },
  changeBadge: { backgroundColor: colors.background.light || '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  changeText: { fontSize: 10, color: colors.text.secondary, fontWeight: '500' },
  card: { marginBottom: spacing.md, padding: spacing.md, borderRadius: borderRadius.xl, backgroundColor: '#fff' },
  cardTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.navy, marginBottom: spacing.md, fontFamily: typography.fontFamily.display },
  cardSubText: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: spacing.md, textAlign: 'center' },
  heatmapMock: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  heatBox: { width: '12%', aspectRatio: 1, backgroundColor: colors.accent.DEFAULT, borderRadius: 4 },
  coachHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  coachTitle: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: 'bold', marginLeft: spacing.md, fontFamily: typography.fontFamily.display },
  coachText: { color: 'rgba(255,255,255,0.9)', fontSize: typography.fontSize.sm, lineHeight: 22 },
  taskBox: { backgroundColor: 'rgba(255,255,255,0.15)', padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.lg },
  taskText: { color: '#fff', fontSize: typography.fontSize.sm, fontWeight: 'bold' },
  skillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  skillName: { width: 50, fontSize: typography.fontSize.sm, color: colors.text.primary, fontWeight: '500' },
  skillBarBg: { flex: 1, height: 8, backgroundColor: colors.background.light || '#f1f5f9', borderRadius: 4, marginHorizontal: spacing.sm },
  skillBarFill: { height: '100%', borderRadius: 4 },
  skillPerc: { width: 30, fontSize: typography.fontSize.xs, color: colors.text.secondary, textAlign: 'right', fontWeight: 'bold' },
  alertsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  alertItem: { backgroundColor: colors.background.light || '#f1f5f9', padding: spacing.md, borderRadius: borderRadius.md, borderLeftWidth: 4, marginBottom: spacing.sm },
  alertTitle: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.text.primary, marginBottom: 2 },
  alertSub: { fontSize: typography.fontSize.xs, color: colors.text.secondary }
});
