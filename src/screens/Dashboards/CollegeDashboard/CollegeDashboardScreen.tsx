import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/Shared/Card';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Users, Building2, Briefcase, Award } from 'lucide-react-native';

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

export const CollegeDashboardScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.welcomeText}>Welcome back</Text>
      
      {/* <View style={styles.gridContainer}>
        <View style={styles.row}>
          <StatCard title="Total Students" value="2,450" change="98% onboarded" icon={Users} color={colors.info || '#3b82f6'} />
          <StatCard title="Students Placed" value="845" change="+120 this month" icon={Award} color={colors.success || '#10b981'} />
        </View>
        <View style={styles.row}>
          <StatCard title="Active Recruiters" value="64" change="+12 new partners" icon={Building2} color={colors.primary.DEFAULT} />
          <StatCard title="Avg Package" value="₹6.8L" change="+15% YoY" icon={Briefcase} color={colors.accent.DEFAULT} />
        </View>
      </View>

      <Card style={[styles.card, { backgroundColor: colors.navy }]}>
        <View style={styles.nepHeader}>
          <View>
            <Text style={styles.nepTitle}>NEP & UGC Compliance</Text>
            <Text style={styles.nepSub}>Your institutional score</Text>
          </View>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>82</Text>
            <Text style={styles.scoreTotal}>/100</Text>
          </View>
        </View>
        <Text style={styles.nepDetail}>
          Your college is highly compliant. Next step: Implement "ABC Credits" integration for all 2nd-year students.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Recent Partner Recruiters</Text>
        <View style={styles.recruiterRow}>
          <View style={[styles.recruiterLogo, { backgroundColor: '#FF0000' }]}><Text style={styles.logoTxt}>TCS</Text></View>
          <View style={styles.recInfo}>
            <Text style={styles.recName}>Tata Consultancy Services</Text>
            <Text style={styles.recDetail}>Hiring: 150 B.Tech Grads</Text>
          </View>
          <Text style={styles.statusBadge}>Active</Text>
        </View>
        
        <View style={styles.recruiterRow}>
          <View style={[styles.recruiterLogo, { backgroundColor: '#0052CC' }]}><Text style={styles.logoTxt}>INFY</Text></View>
          <View style={styles.recInfo}>
            <Text style={styles.recName}>Infosys</Text>
            <Text style={styles.recDetail}>Hiring: 80 MCA Grads</Text>
          </View>
          <Text style={styles.statusBadge}>Active</Text>
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
  nepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  nepTitle: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: 'bold', fontFamily: typography.fontFamily.display },
  nepSub: { color: 'rgba(255,255,255,0.7)', fontSize: typography.fontSize.sm, marginTop: 2 },
  scoreCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: colors.info || '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  scoreText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scoreTotal: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: -2 },
  nepDetail: { color: 'rgba(255,255,255,0.9)', fontSize: typography.fontSize.sm, lineHeight: 20 },
  cardTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.navy, marginBottom: spacing.md, fontFamily: typography.fontFamily.display },
  recruiterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  recruiterLogo: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  logoTxt: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  recInfo: { flex: 1 },
  recName: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.text.primary, marginBottom: 2 },
  recDetail: { fontSize: typography.fontSize.xs, color: colors.text.secondary },
  statusBadge: { backgroundColor: (colors.success || '#10b981') + '20', color: colors.success || '#10b981', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }
});
