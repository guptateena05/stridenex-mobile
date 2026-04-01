import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Flame,
  CheckCircle2,
  Circle,
  Target,
  BookOpen,
  MessageSquare,
  Code,
  Plus,
  TrendingUp
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

// Types and Data
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const habitPlans = [
  { id: 1, title: "Solve 2 LeetCode Problems", streak: 18, category: "Problem Solving", icon: Code, color: "#2563EB", bgColor: "rgba(37, 99, 235, 0.1)", progress: 85, weeklyData: [true, true, true, true, false, true, false] },
  { id: 2, title: "Read ML Research Paper", streak: 7, category: "ML", icon: BookOpen, color: "#9333EA", bgColor: "rgba(147, 51, 234, 0.1)", progress: 60, weeklyData: [true, false, true, true, false, false, true] },
  { id: 3, title: "Update LinkedIn / Network", streak: 3, category: "Communication", icon: MessageSquare, color: colors.accent.DEFAULT, bgColor: "rgba(255, 107, 0, 0.1)", progress: 40, weeklyData: [false, true, false, true, false, false, false] },
  { id: 4, title: "Watch Study Shorts", streak: 12, category: "Various", icon: Target, color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)", progress: 75, weeklyData: [true, true, true, false, true, true, false] }
];

const statusConfig = {
  done: { icon: CheckCircle2, color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.2)", indicator: "✓" },
  partial: { icon: Circle, color: colors.accent.DEFAULT, bgColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.2)", indicator: "○" },
  missed: { icon: Circle, color: "#94A3B8", bgColor: "#F1F5F9", borderColor: "#E2E8F0", indicator: "−" }
};

const thisWeekStats = [
  { day: 'Mon', status: 'done' as const },
  { day: 'Tue', status: 'done' as const },
  { day: 'Wed', status: 'done' as const },
  { day: 'Thu', status: 'partial' as const },
  { day: 'Fri', status: 'missed' as const },
  { day: 'Sat', status: 'done' as const },
  { day: 'Sun', status: 'missed' as const }
];

export const StudentHabitsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Flame size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>DAILY DISCIPLINE</Text>
          </View>
          <Text style={styles.title}>Habits</Text>
          <Text style={styles.subtitle}>Track your daily progress & streaks</Text>
        </Animated.View>

        {/* Top Stats Cards */}
        <Animated.View entering={FadeInRight.delay(200)} style={styles.statsCardContainer}>
          {/* Streak Card */}
          <View style={styles.statsCard}>
            <View style={styles.cardHeaderRow}>
               <Text style={styles.cardTitle}>Streak</Text>
            </View>
            <View style={styles.streakContent}>
               <View style={styles.flameIconBox}>
                  <Flame size={24} color={colors.accent.DEFAULT} />
               </View>
               <View>
                  <View style={styles.streakValueRow}>
                     <Text style={styles.streakValue}>18</Text>
                     <Text style={styles.streakUnit}>days</Text>
                  </View>
                  <Text style={styles.streakLabel}>Longest: 24 days</Text>
               </View>
            </View>
          </View>

          {/* Last 30 Days Card */}
          <View style={[styles.statsCard, { marginTop: 12 }]}>
            <View style={styles.cardHeaderRow}>
               <Text style={styles.cardTitle}>Last 30 Days</Text>
            </View>
            <View style={styles.thirtyDaysRow}>
               <View style={styles.thirtyDaysItem}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text style={styles.thirtyDaysLabel}>Done: <Text style={styles.thirtyDaysValue}>24</Text></Text>
               </View>
               <View style={styles.thirtyDaysItem}>
                  <Circle size={16} color={colors.accent.DEFAULT} />
                  <Text style={styles.thirtyDaysLabel}>Partial: <Text style={styles.thirtyDaysValue}>4</Text></Text>
               </View>
               <View style={styles.thirtyDaysItem}>
                  <Circle size={16} color="#94A3B8" />
                  <Text style={styles.thirtyDaysLabel}>Missed: <Text style={styles.thirtyDaysValue}>2</Text></Text>
               </View>
            </View>
            <View style={styles.progressContainer}>
               <View style={styles.progressHeader}>
                  <Text style={styles.progressLabelText}>Completion rate</Text>
                  <Text style={styles.progressValueText}>80%</Text>
               </View>
               <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '80%' }]} />
               </View>
            </View>
          </View>

          {/* This Week Card */}
          <View style={[styles.statsCard, { marginTop: 12 }]}>
            <View style={styles.cardHeaderRow}>
               <Text style={styles.cardTitle}>This Week</Text>
               <Text style={styles.thisWeekCount}>5/7 days</Text>
            </View>
            <View style={styles.weekDaysRow}>
               {thisWeekStats.map((day, idx) => {
                 const config = statusConfig[day.status];
                 return (
                   <View key={idx} style={styles.dayCol}>
                     <Text style={styles.dayName}>{day.day[0]}</Text>
                     <View style={[styles.dayCircle, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
                        <Text style={[styles.dayIndicator, { color: config.color }]}>{config.indicator}</Text>
                     </View>
                   </View>
                 );
               })}
            </View>
          </View>
        </Animated.View>

        {/* My Habit Plans */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitleSimple}>My Habit Plans</Text>
           <TouchableOpacity style={styles.newHabitButton}>
              <Plus size={12} color="#64748B" />
              <Text style={styles.newHabitText}>New Habit</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
           {habitPlans.map((habit, index) => (
             <Animated.View 
               key={habit.id} 
               entering={FadeInUp.delay(300 + index * 100)}
               style={styles.habitCard}
             >
                <View style={styles.habitMainInfo}>
                   <View style={[styles.habitIconContainer, { backgroundColor: habit.bgColor }]}>
                      <habit.icon size={20} color={habit.color} />
                   </View>
                   <View style={styles.habitTextInfo}>
                      <Text style={styles.habitTitle}>{habit.title}</Text>
                      <View style={styles.habitTagsRow}>
                         <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{habit.category}</Text>
                         </View>
                         <View style={styles.streakBadge}>
                            <Flame size={10} color={colors.accent.DEFAULT} />
                            <Text style={styles.streakBadgeText}>{habit.streak} days</Text>
                         </View>
                      </View>
                   </View>
                </View>

                {/* Mini Tracker & Progress */}
                <View style={styles.habitBottomHalf}>
                   <View style={styles.miniWeekRow}>
                      {habit.weeklyData.map((done, dIdx) => (
                        <View 
                          key={dIdx} 
                          style={[
                            styles.miniDayNode, 
                            done ? styles.miniDayNodeActive : styles.miniDayNodeInactive
                          ]}
                        >
                           <Text style={[
                             styles.miniDayText,
                             done ? styles.miniDayTextActive : styles.miniDayTextInactive
                           ]}>{weekDays[dIdx]}</Text>
                        </View>
                      ))}
                   </View>
                   <View style={styles.miniProgressBox}>
                      <Text style={styles.miniProgressText}>{habit.progress}%</Text>
                   </View>
                </View>
             </Animated.View>
           ))}
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
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
  
  statsCardContainer: { marginBottom: 28 },
  statsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  
  streakContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  flameIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 107, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
  streakValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  streakValue: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  streakUnit: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  streakLabel: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  thirtyDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  thirtyDaysItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  thirtyDaysLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  thirtyDaysValue: { fontWeight: '700', color: '#1E293B' },
  progressContainer: { marginTop: 4, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabelText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  progressValueText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  
  thisWeekCount: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayName: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  dayIndicator: { fontSize: 14, fontWeight: '800' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitleSimple: { fontSize: 14, fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5 },
  newHabitButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  newHabitText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  
  listContainer: { gap: 14 },
  habitCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  habitMainInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  habitIconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  habitTextInfo: { flex: 1 },
  habitTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  habitTagsRow: { flexDirection: 'row', gap: 8 },
  categoryBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  categoryBadgeText: { fontSize: 9, fontWeight: '700', color: '#64748B' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255, 107, 0, 0.05)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  streakBadgeText: { fontSize: 9, fontWeight: '700', color: '#334155' },
  
  habitBottomHalf: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  miniWeekRow: { flexDirection: 'row', gap: 6 },
  miniDayNode: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  miniDayNodeActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
  miniDayNodeInactive: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9' },
  miniDayText: { fontSize: 9, fontWeight: '800' },
  miniDayTextActive: { color: '#059669' },
  miniDayTextInactive: { color: '#94A3B8' },
  
  miniProgressBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniProgressText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },

  footerSpacer: { height: 40 }
});
