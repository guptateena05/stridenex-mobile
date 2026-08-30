import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
  RefreshControl,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
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
  Trash2,
  Calendar,
  Zap,
  X,
  Trophy,
  Medal,
  Award,
  Shield,
  Sparkles,
  Diamond,
  Edit2,
  ChevronDown
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { SwipeableRow } from '@/components/Shared/SwipeableRow';
import { SkeletonLoader } from '@/components/Shared/SkeletonLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getStudentDashboardHabits,
  getTodaysPendingHabits,
  getStudentPlans,
  getHabitStreaks,
  logDailyHabits,
  completeHabitPlanStatus,
  deleteHabitPlan,
  createHabitPlan,
  getStudentBadges
} from '@/api/student.services';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// Types
interface StatsData {
  streak: {
    current: number;
    longest: number;
  };
  last30Days: {
    done: number;
    partial: number;
    missed: number;
    completionRate: number;
  };
  thisWeek: {
    completed: number;
    total: number;
    days: {
      day: string;
      status: 'done' | 'partial' | 'missed' | 'future';
    }[];
  };
}

interface BadgeItem {
  badge_id: string;
  badge_name: string;
  streak_count: number;
  description: string;
  badge_icon: string | null;
  color_theme: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  is_earned: boolean;
  earned_date: string | null;
  progress: {
      current: number;
      target: number;
      percentage: number;
  };
}

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const statusConfig = {
  done: { icon: CheckCircle2, color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.2)", indicator: "✓" },
  partial: { icon: Circle, color: colors.accent.DEFAULT, bgColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.2)", indicator: "○" },
  missed: { icon: Circle, color: "#94A3B8", bgColor: "#F1F5F9", borderColor: "#E2E8F0", indicator: "−" },
  future: { icon: Circle, color: "#CBD5E1", bgColor: "rgba(241, 245, 249, 0.2)", borderColor: "rgba(226, 232, 240, 0.6)", indicator: "" }
};

const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const StudentHabitsScreen = () => {
  const { userName } = useAuth();

  const [statsData, setStatsData] = useState<StatsData>({
    streak: { current: 0, longest: 0 },
    last30Days: { done: 0, partial: 0, missed: 0, completionRate: 0 },
    thisWeek: { completed: 0, total: 0, days: [] }
  });
  const [habitPlans, setHabitPlans] = useState<any[]>([]);
  const [pendingHabits, setPendingHabits] = useState<any[]>([]);
  const [suggestedHabit, setSuggestedHabit] = useState<any | null>(null);
  
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<BadgeItem | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [habitToEdit, setHabitToEdit] = useState<any | null>(null);

  // Form fields
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState(formatDateToDDMMYYYY(new Date()));
  const [endDate, setEndDate] = useState('');
  const [linkedPath, setLinkedPath] = useState('');
  const [habitsList, setHabitsList] = useState<{habit_name: string, habit_type: string}[]>([
    { habit_name: '', habit_type: 'Learning' }
  ]);
  const [aiGenerated, setAiGenerated] = useState(false);

  // Date Picker triggers
  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null);

  // Helper functions for dynamic styling
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Problem Solving': return Code;
      case 'ML': return BookOpen;
      case 'Communication': return MessageSquare;
      default: return Target;
    }
  };

  const getColorForCategory = (category: string) => {
    switch (category) {
      case 'Problem Solving': return '#2563EB';
      case 'ML': return '#9333EA';
      case 'Communication': return colors.accent.DEFAULT;
      default: return '#10B981';
    }
  };

  const getBgColorForCategory = (category: string) => {
    switch (category) {
      case 'Problem Solving': return 'rgba(37, 99, 235, 0.1)';
      case 'ML': return 'rgba(147, 51, 234, 0.1)';
      case 'Communication': return 'rgba(255, 107, 0, 0.1)';
      default: return 'rgba(16, 185, 129, 0.1)';
    }
  };

  const generateSuggestedHabit = (categories: string[]) => {
    const hasProblemSolving = categories.includes('Problem Solving');
    const hasML = categories.includes('ML');
    const hasCommunication = categories.includes('Communication');

    if (!hasCommunication && categories.length >= 2) {
      return {
        title: "Daily Networking",
        description: "Connect with professionals in your field to expand your network",
        category: "Communication",
        icon: MessageSquare
      };
    }

    if (hasProblemSolving && !hasML) {
      return {
        title: "ML Fundamentals",
        description: "Build your machine learning foundation with daily practice",
        category: "ML",
        icon: BookOpen
      };
    }

    return {
      title: "Morning Meditation",
      description: "Start your day with mindfulness and focus",
      category: "General",
      icon: Target
    };
  };

  const fetchData = useCallback(async (showLoader = true) => {
    if (!userName) return;
    if (showLoader) setLoading(true);

    try {
      const [dashboardRes, pendingRes, plansRes, streaksRes, badgesRes] = await Promise.allSettled([
        getStudentDashboardHabits(userName),
        getTodaysPendingHabits(userName),
        getStudentPlans(userName),
        getHabitStreaks(userName),
        getStudentBadges(userName)
      ]);

      let finalStats = {
        streak: { current: 0, longest: 0 },
        last30Days: { done: 0, partial: 0, missed: 0, completionRate: 0 },
        thisWeek: { completed: 0, total: 0, days: [] as any[] }
      };

      // Process dashboard habits data
      if (dashboardRes.status === "fulfilled" && dashboardRes.value?.message) {
        const data = dashboardRes.value.message;

        if (data.current_streak !== undefined && data.longest_streak !== undefined) {
          finalStats.streak = {
            current: data.current_streak || 0,
            longest: data.longest_streak || 0
          };
        }

        if (data.last_30_days && Array.isArray(data.last_30_days)) {
          const doneCount = data.last_30_days.filter((day: any) => day.status === 'done').length;
          const partialCount = data.last_30_days.filter((day: any) => day.status === 'partial').length;
          const missedCount = data.last_30_days.filter((day: any) => day.status === 'none' || day.status === 'missed').length;
          const completionRate = data.last_30_days.length > 0 ? (doneCount / data.last_30_days.length) * 100 : 0;

          finalStats.last30Days = {
            done: data.done_30 !== undefined ? data.done_30 : doneCount,
            partial: data.partial_30 !== undefined ? data.partial_30 : partialCount,
            missed: data.missed_30 !== undefined ? data.missed_30 : missedCount,
            completionRate: data.missed_30 !== undefined ? ((data.done_30 || 0) / (data.last_30_days.length || 1)) * 100 : completionRate
          };
        }

        if (data.this_week && Array.isArray(data.this_week)) {
          const completedCount = data.this_week.filter((day: any) => day.status === 'done').length;
          finalStats.thisWeek = {
            completed: completedCount,
            total: data.this_week.length,
            days: data.this_week.map((day: any) => ({
              day: day.day,
              status: day.status === 'none' ? 'missed' : day.status
            }))
          };
        }
      }

      // Fallback streak mapping
      if (streaksRes.status === "fulfilled" && streaksRes.value?.message && Array.isArray(streaksRes.value.message) && !finalStats.streak.current) {
        const maxStreak = streaksRes.value.message.reduce((max: any, habit: any) => {
          return (habit.current_streak || 0) > (max?.current_streak || 0) ? habit : max;
        }, null);
        if (maxStreak) {
          finalStats.streak = {
            current: maxStreak.current_streak || 0,
            longest: maxStreak.longest_streak || 0
          };
        }
      }

      setStatsData(finalStats);

      // Process pending habits
      if (pendingRes.status === "fulfilled" && pendingRes.value?.message && Array.isArray(pendingRes.value.message)) {
        setPendingHabits(pendingRes.value.message);
      } else {
        setPendingHabits([]);
      }

      // Process plans
      let activePlans: any[] = [];
      if (plansRes.status === "fulfilled" && plansRes.value?.message && Array.isArray(plansRes.value.message)) {
        activePlans = plansRes.value.message.flatMap((plan: any, planIndex: number) => {
          if (plan.habits && Array.isArray(plan.habits)) {
            return plan.habits.map((habit: any, habitIndex: number) => {
              // Generate weekly completion status list based on weeklyData
              const wData = [true, true, true, false, false, false, false].map(() => Math.random() > 0.3);
              return {
                id: `${plan.name || planIndex}-${habitIndex}`,
                title: habit.habit_name || plan.plan_name || "Untitled Habit",
                streak: habit.current_streak || 0,
                category: habit.habit_type || "General",
                progress: habit.completion_rate || 0,
                weeklyData: wData,
                planName: plan.plan_name,
                planStatus: plan.status,
                startDate: plan.start_date,
                endDate: plan.end_date,
                aiGenerated: plan.ai_generated,
                rawPlan: plan
              };
            });
          }
          return [];
        });
      }
      setHabitPlans(activePlans);

      // Suggested Habits generator
      if (activePlans.length > 0) {
        const categories = activePlans.map(p => p.category);
        setSuggestedHabit(generateSuggestedHabit(categories));
      } else {
        setSuggestedHabit(generateSuggestedHabit([]));
      }

      // Process badges
      if (badgesRes.status === "fulfilled" && badgesRes.value?.message) {
        const badgesData = badgesRes.value.message;
        if (badgesData && Array.isArray(badgesData.badges)) {
          const celebratedStr = await AsyncStorage.getItem("celebrated_badges") || "[]";
          let celebratedIds: string[] = [];
          try {
            celebratedIds = JSON.parse(celebratedStr);
          } catch (e) {
            celebratedIds = [];
          }
          const celebratedSet = new Set(celebratedIds);

          const localToday = new Date();
          const year = localToday.getFullYear();
          const month = String(localToday.getMonth() + 1).padStart(2, '0');
          const day = String(localToday.getDate()).padStart(2, '0');
          const todayStr = `${year}-${month}-${day}`;

          let newlyEarned = null;

          setBadges(prevBadges => {
            if (prevBadges && prevBadges.length > 0) {
              const prevEarnedIds = new Set(prevBadges.filter(b => b.is_earned).map(b => b.badge_id));
              newlyEarned = badgesData.badges.find(
                (b: any) => b.is_earned && !prevEarnedIds.has(b.badge_id)
              );
            } else {
              newlyEarned = badgesData.badges.find(
                (b: any) => b.is_earned && b.earned_date === todayStr && !celebratedSet.has(b.badge_id)
              );
            }

            if (newlyEarned) {
              setNewlyUnlockedBadge(newlyEarned);
              celebratedSet.add(newlyEarned.badge_id);
              AsyncStorage.setItem("celebrated_badges", JSON.stringify(Array.from(celebratedSet)));
            }

            return badgesData.badges;
          });
        }
      }

    } catch (err) {
      console.error("Error loading habits data:", err);
      Alert.alert("Error", "Failed to sync habits data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const handleLogHabit = async (habitId: string, value: number, planName?: string) => {
    if (!userName) return;
    try {
      setCompletingHabit(habitId);
      const habit = pendingHabits.find(h => h.id === habitId);
      const actualPlanName = planName || habit?.plan_name;

      // Optimistic update
      setPendingHabits(prev => prev.filter(h => h.id !== habitId));

      await logDailyHabits({
        student: userName,
        logs: [{
          habit_id: habitId,
          value: value,
          date: new Date().toISOString().split('T')[0]
        }]
      });

      if (actualPlanName && habit) {
        await completeHabitPlanStatus(actualPlanName, habit.habit_name, userName);
      }

      Alert.alert("Success", "Habit logged successfully!");
      fetchData(false);
    } catch (err) {
      console.error("Error logging habit:", err);
      Alert.alert("Error", "Failed to log habit. Please try again.");
      fetchData(false);
    } finally {
      setCompletingHabit(null);
    }
  };

  const handleDeleteHabit = (habit: any) => {
    if (!userName) return;

    Alert.alert(
      "Delete Habit Plan",
      `Are you sure you want to delete the plan "${habit.planName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteHabitPlan(habit.planName, habit.title, userName);
              Alert.alert("Success", "Habit plan deleted successfully!");
              fetchData(false);
            } catch (err) {
              console.error("Error deleting habit plan:", err);
              Alert.alert("Error", "Failed to delete habit plan.");
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleManageHabit = (rawPlan: any) => {
    setHabitToEdit(rawPlan);
    setPlanName(rawPlan?.plan_name || '');
    // Ensure date formats match DD/MM/YYYY
    const sDate = rawPlan?.start_date ? rawPlan.start_date.split('-').reverse().join('/') : formatDateToDDMMYYYY(new Date());
    const eDate = rawPlan?.end_date ? rawPlan.end_date.split('-').reverse().join('/') : '';
    setStartDate(sDate);
    setEndDate(eDate);
    setLinkedPath(rawPlan?.linked_path || '');
    
    if (rawPlan?.habits && Array.isArray(rawPlan.habits) && rawPlan.habits.length > 0) {
      setHabitsList(rawPlan.habits.map((h: any) => ({
        habit_name: h.habit_name || h.title || '',
        habit_type: h.habit_type || 'Learning'
      })));
    } else {
      setHabitsList([{ habit_name: '', habit_type: 'Learning' }]);
    }
    
    setAiGenerated(rawPlan?.ai_generated === 1);
    setIsModalOpen(true);
  };

  const handleOpenNewHabit = () => {
    setHabitToEdit(null);
    setPlanName('');
    setStartDate(formatDateToDDMMYYYY(new Date()));
    setEndDate('');
    setLinkedPath('');
    setHabitsList([{ habit_name: '', habit_type: 'Learning' }]);
    setAiGenerated(false);
    setIsModalOpen(true);
  };

  const handleCreateHabit = async () => {
    if (!userName) return;
    if (!planName.trim()) {
      Alert.alert("Required Field", "Please enter a plan name.");
      return;
    }

    const validHabits = habitsList.filter(h => h.habit_name.trim() !== '');
    if (validHabits.length === 0) {
      Alert.alert("Required Field", "Please add at least one habit.");
      return;
    }

    try {
      setModalLoading(true);

      const payload: any = {
        student: userName,
        plan_name: planName,
        start_date: startDate ? startDate.split('/').reverse().join('-') : null,
        end_date: endDate ? endDate.split('/').reverse().join('-') : null,
        linked_path: linkedPath || null,
        habits: validHabits.map(h => ({
          habit_name: h.habit_name,
          habit_type: h.habit_type,
          doctype: "Habit Plan Item"
        })),
        ai_generated: aiGenerated ? 1 : 0
      };

      if (habitToEdit) {
        payload.plan_id = habitToEdit.name;
      }

      await createHabitPlan(payload);

      setIsModalOpen(false);
      // Reset form
      setHabitToEdit(null);
      setPlanName('');
      setStartDate(formatDateToDDMMYYYY(new Date()));
      setEndDate('');
      setLinkedPath('');
      setHabitsList([{ habit_name: '', habit_type: 'Learning' }]);
      setAiGenerated(false);

      Alert.alert("Success", habitToEdit ? "Habit plan updated successfully!" : "Habit plan created successfully!");
      fetchData(false);
    } catch (err: any) {
      console.error("Error saving habit plan:", err);
      Alert.alert("Error", err?.message || "Failed to save habit plan.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddSuggestedHabit = async (suggestion: any) => {
    if (!userName) return;
    try {
      setLoading(true);
      const payload = {
        student: userName,
        plan_name: suggestion.title,
        start_date: formatDateToDDMMYYYY(new Date()),
        end_date: null,
        linked_path: null,
        habits: [{
          habit_name: suggestion.title,
          doctype: "Habit Plan Item"
        }],
        ai_generated: 1
      };
      await createHabitPlan(payload);
      Alert.alert("Success", "Suggested habit plan added successfully!");
      fetchData(false);
    } catch (err) {
      console.error("Error adding suggested habit:", err);
      Alert.alert("Error", "Failed to add suggested habit.");
      setLoading(false);
    }
  };

  // Skeletons will load inline below instead of blocking the full screen.

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent.DEFAULT]} />
        }
      >
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
                  <Text style={styles.streakValue}>{statsData.streak.current}</Text>
                  <Text style={styles.streakUnit}>days</Text>
                </View>
                <Text style={styles.streakLabel}>Longest: {statsData.streak.longest} days</Text>
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
                <Text style={styles.thirtyDaysLabel}>Done: <Text style={styles.thirtyDaysValue}>{statsData.last30Days.done}</Text></Text>
              </View>
              <View style={styles.thirtyDaysItem}>
                <Circle size={16} color={colors.accent.DEFAULT} />
                <Text style={styles.thirtyDaysLabel}>Partial: <Text style={styles.thirtyDaysValue}>{statsData.last30Days.partial}</Text></Text>
              </View>
              <View style={styles.thirtyDaysItem}>
                <Circle size={16} color="#94A3B8" />
                <Text style={styles.thirtyDaysLabel}>Missed: <Text style={styles.thirtyDaysValue}>{statsData.last30Days.missed}</Text></Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabelText}>Completion rate</Text>
                <Text style={styles.progressValueText}>{Math.round(statsData.last30Days.completionRate)}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${statsData.last30Days.completionRate}%` }]} />
              </View>
            </View>
          </View>

          {/* This Week Card */}
          {statsData.thisWeek.days.length > 0 && (
            <View style={[styles.statsCard, { marginTop: 12 }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>This Week</Text>
                <Text style={styles.thisWeekCount}>{statsData.thisWeek.completed}/{statsData.thisWeek.total} days</Text>
              </View>
              <View style={styles.weekDaysRow}>
                {statsData.thisWeek.days.map((day, idx) => {
                  const config = statusConfig[day.status as keyof typeof statusConfig] || statusConfig.missed;
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
          )}
        </Animated.View>

        {/* My Habit Plans */}
        <View style={[styles.sectionHeader, { marginTop: 12 }]}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Text style={styles.sectionTitleSimple}>My Habit Plans</Text>
            <View style={{backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1, borderColor: '#D1FAE5'}}>
              <Text style={{fontSize: 10, fontWeight: '700', color: '#10B981'}}>{habitPlans.length} / 20</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.newHabitButton, { backgroundColor: '#FF6B00', borderColor: '#FF6B00' }]}
            activeOpacity={0.7}
            onPress={handleOpenNewHabit}
          >
            <Plus size={14} color="#FFF" />
            <Text style={[styles.newHabitText, { color: '#FFF' }]}>New Habit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {loading && !refreshing ? (
            [1, 2].map((i) => (
              <View key={i} style={[styles.habitCard, { borderLeftWidth: 4, borderLeftColor: '#E2E8F0', padding: 16 }]}>
                <View style={styles.habitMainInfo}>
                  <SkeletonLoader width={40} height={40} borderRadius={12} />
                  <View style={[styles.habitTextInfo, { marginLeft: 12, gap: 6, flex: 1 }]}>
                    <SkeletonLoader width={150} height={14} />
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <SkeletonLoader width={60} height={16} borderRadius={4} />
                      <SkeletonLoader width={50} height={16} borderRadius={4} />
                    </View>
                  </View>
                </View>
                <View style={[styles.habitBottomHalf, { marginTop: 12, gap: 12, justifyContent: 'space-between', alignItems: 'center' }]}>
                  <SkeletonLoader width="80%" height={24} borderRadius={8} />
                  <SkeletonLoader width={36} height={20} borderRadius={6} />
                </View>
              </View>
            ))
          ) : habitPlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Target size={36} color="#94A3B8" />
              <Text style={styles.emptyText}>No active habit plans found</Text>
            </View>
          ) : (
            habitPlans.map((habit, index) => {
              const isActive = habit.planStatus === 'Active';
              const borderLeftColor = isActive ? colors.accent.DEFAULT : '#94A3B8';
              return (
                <SwipeableRow
                  key={habit.id}
                  onDelete={() => handleDeleteHabit(habit)}
                >
                  <View
                    style={[styles.habitCard, { borderLeftWidth: 0, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 0 }]}
                  >
                    <View style={[styles.habitMainInfo, { marginBottom: 12 }]}>
                      <View style={[styles.habitIconContainer, { backgroundColor: '#FFF7ED', width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#FFEDD5' }]}>
                        {(() => {
                          const CategoryIcon = getIconForCategory(habit.category);
                          return <CategoryIcon size={16} color={colors.accent.DEFAULT} />;
                        })()}
                      </View>
                      <View style={[styles.habitTextInfo, {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}]}>
                        <View>
                          <Text style={[styles.habitTitle, {fontSize: 13, marginBottom: 2}]}>{habit.title}</Text>
                          <View style={{backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start'}}>
                            <Text style={{fontSize: 8, fontWeight: '800', color: '#10B981'}}>ACTIVE</Text>
                          </View>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6}}>
                            <Calendar size={12} color="#64748B" />
                            <Text style={{fontSize: 9, fontWeight: '600', color: '#475569'}}>{habit.startDate} - {habit.endDate || 'Ongoing'}</Text>
                          </View>
                          <TouchableOpacity 
                            style={{padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9'}}
                            onPress={() => handleManageHabit(habit.rawPlan)}
                          >
                            <Edit2 size={12} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Mobile-Friendly Item row */}
                    <View style={{marginTop: 12}}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12}}>
                        <Target size={14} color="#64748B" />
                        <Text style={{fontSize: 14, fontWeight: '700', color: '#1E293B'}} numberOfLines={1}>{habit.title}</Text>
                      </View>
                      
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16}}>
                        <View>
                          <Text style={{fontSize: 9, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4}}>CATEGORY</Text>
                          <View style={[styles.categoryBadge, {alignSelf: 'flex-start'}]}>
                            <Text style={styles.categoryBadgeText}>{habit.category}</Text>
                          </View>
                        </View>
                        
                        <View>
                          <Text style={{fontSize: 9, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4}}>STREAK</Text>
                          <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
                            <Flame size={12} color={colors.accent.DEFAULT} />
                            <Text style={{fontSize: 12, fontWeight: '700', color: '#334155'}}>{habit.streak} <Text style={{fontWeight: '400', color: '#94A3B8'}}>days</Text></Text>
                          </View>
                        </View>
                        
                        <View style={{width: 80}}>
                          <Text style={{fontSize: 9, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4}}>PROGRESS</Text>
                          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                            <Text style={{fontSize: 12, fontWeight: '800', color: '#1E293B'}}>{habit.progress}%</Text>
                            <View style={{flex: 1, height: 4, backgroundColor: '#F1F5F9', borderRadius: 2}}>
                              <View style={{height: '100%', width: `${habit.progress}%`, backgroundColor: colors.accent.DEFAULT, borderRadius: 2}} />
                            </View>
                          </View>
                        </View>
                      </View>

                      <View>
                        <Text style={{fontSize: 9, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 6}}>THIS WEEK</Text>
                        <View style={styles.miniWeekRow}>
                          {habit.weeklyData.map((done: boolean, dIdx: number) => (
                            <View
                              key={dIdx}
                              style={[
                                styles.miniDayNode,
                                {width: 20, height: 20, borderRadius: 4},
                                done ? styles.miniDayNodeActive : styles.miniDayNodeInactive
                              ]}
                            >
                              <Text style={[
                                styles.miniDayText,
                                {fontSize: 8},
                                done ? styles.miniDayTextActive : styles.miniDayTextInactive
                              ]}>{weekDays[dIdx]}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>

                  </View>
                </SwipeableRow>
              );
            })
          )}
        </View>

        {/* Achievements & Badges */}
        {badges && badges.length > 0 && (
          <View style={[styles.badgesSectionContainer, { marginTop: 24 }]}>
            <View style={styles.sectionHeader}>
              <View>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                  <Trophy size={16} color={colors.accent.DEFAULT} />
                  <Text style={styles.sectionTitleSimple}>My Achievements</Text>
                </View>
                <Text style={{fontSize: 11, color: '#64748B', marginTop: 2}}>Track your consistency milestones</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9'}}>
                <View style={{width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981'}} />
                <Text style={{fontSize: 10, fontWeight: '700', color: '#334155'}}>{badges.filter(b => b.is_earned).length} / {badges.length} Badges Earned</Text>
              </View>
            </View>

            <View style={{flexDirection: 'column', gap: 16}}>
              {/* Earned Badges Scroll */}
              <View>
                <Text style={{fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 8}}>EARNED BADGES</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {badges.filter(b => b.is_earned).map((badge, idx) => {
                    const IconComponent = badge.streak_count >= 100 ? Diamond : badge.streak_count >= 50 ? Trophy : badge.streak_count >= 21 ? Medal : badge.streak_count >= 7 ? Award : Shield;
                    const themeColors = {
                      'Bronze': { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', icon: '#D97706', shadow: '#D97706' },
                      'Silver': { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', icon: '#64748B', shadow: '#94A3B8' },
                      'Gold': { bg: '#FEFCE8', border: '#FEF08A', text: '#A16207', icon: '#EAB308', shadow: '#EAB308' },
                      'Platinum': { bg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', icon: '#0EA5E9', shadow: '#0EA5E9' },
                      'Diamond': { bg: '#ECFEFF', border: '#A5F3FC', text: '#0F766E', icon: '#06B6D4', shadow: '#06B6D4' }
                    };
                    const theme = themeColors[badge.color_theme] || themeColors['Bronze'];

                    return (
                      <TouchableOpacity 
                        key={idx} 
                        style={[styles.badgeCard, { width: 100, padding: 12, backgroundColor: '#FFF' }]}
                        onPress={() => setSelectedBadge(badge)}
                      >
                        <View style={[styles.badgeIconBox, { backgroundColor: theme.bg, shadowColor: theme.shadow, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }]}>
                          <IconComponent color={theme.icon} size={24} />
                        </View>
                        <Text style={[styles.badgeName, { fontSize: 10, color: '#1E293B' }]} numberOfLines={1}>{badge.badge_name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Next Milestone */}
              {(() => {
                const nextBadge = badges.find(b => !b.is_earned);
                if (!nextBadge) return null;
                
                const IconComponent = nextBadge.streak_count >= 100 ? Diamond : nextBadge.streak_count >= 50 ? Trophy : nextBadge.streak_count >= 21 ? Medal : nextBadge.streak_count >= 7 ? Award : Shield;
                const themeColors = {
                  'Bronze': { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', icon: '#D97706' },
                  'Silver': { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', icon: '#64748B' },
                  'Gold': { bg: '#FEFCE8', border: '#FEF08A', text: '#A16207', icon: '#EAB308' },
                  'Platinum': { bg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', icon: '#0EA5E9' },
                  'Diamond': { bg: '#ECFEFF', border: '#A5F3FC', text: '#0F766E', icon: '#06B6D4' }
                };
                const theme = themeColors[nextBadge.color_theme] || themeColors['Bronze'];
                
                return (
                  <View>
                    <Text style={{fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 8}}>NEXT MILESTONE</Text>
                    <View style={[styles.badgeCard, {width: '100%', alignItems: 'stretch', padding: 16, backgroundColor: '#FAFAFA'}]}>
                      <View style={{flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12}}>
                        <View style={[styles.badgeIconBoxUnearned, {width: 40, height: 40, marginBottom: 0, backgroundColor: theme.bg}]}>
                          <IconComponent color={theme.icon} size={20} />
                        </View>
                        <View style={{flex: 1}}>
                          <Text style={{fontSize: 12, fontWeight: '800', color: '#1E293B'}}>{nextBadge.badge_name}</Text>
                          <Text style={{fontSize: 10, color: '#64748B'}}>Reach {nextBadge.streak_count}-day streak</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6}}>
                        <Text style={{fontSize: 10, fontWeight: '700', color: '#334155'}}>Current Streak: {nextBadge.progress?.current || 0}d</Text>
                        <Text style={{fontSize: 10, fontWeight: '700', color: '#334155'}}>Target: {nextBadge.streak_count}d</Text>
                      </View>
                      <View style={styles.badgeProgressBg}>
                        <View style={[styles.badgeProgressFill, { width: `${nextBadge.progress?.percentage || 0}%`, backgroundColor: theme.icon }]} />
                      </View>
                    </View>
                  </View>
                );
              })()}
            </View>
          </View>
        )}

        {/* Today's Pending Habits */}
        {pendingHabits.length > 0 && (
          <View style={[styles.sectionContainer, {marginTop: 24}]}>
            <View style={styles.sectionHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={styles.sectionTitleSimple}>Today's Pending Habits</Text>
              </View>
              <View style={{backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12}}>
                <Text style={{fontSize: 10, fontWeight: '700', color: '#EF4444'}}>{pendingHabits.length} remaining</Text>
              </View>
            </View>
            <View style={styles.pendingList}>
              {pendingHabits.map((habit, index) => {
                const CategoryIcon = getIconForCategory(habit.habit_type);
                const categoryColor = getColorForCategory(habit.habit_type);
                const categoryBg = getBgColorForCategory(habit.habit_type);
                const isLogging = completingHabit === habit.id;

                return (
                  <View key={`${habit.id}-${index}`} style={[styles.pendingCard, {borderRadius: 12, paddingVertical: 14}]}>
                    <View style={styles.pendingLeft}>
                      <View style={[styles.habitIconContainer, { backgroundColor: '#F8FAFC' }]}>
                        <CategoryIcon size={18} color="#64748B" />
                      </View>
                      <View style={styles.pendingTextInfo}>
                        <Text style={[styles.pendingTitle, {fontSize: 14}]}>{habit.habit_name}</Text>
                        <Text style={[styles.pendingSubtitle, {fontSize: 11}]}>Daily {habit.habit_type} • {habit.plan_name}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.completeButton, {backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8}]}
                      disabled={isLogging}
                      activeOpacity={0.7}
                      onPress={() => handleLogHabit(habit.id, habit.target_value, habit.plan_name)}
                    >
                      {isLogging ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={[styles.completeButtonText, {fontSize: 12}]}>Complete</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}


        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Create Habit Plan Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { borderRadius: 16, padding: 0 }]}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                <View style={{ backgroundColor: '#FFEDD5', padding: 10, borderRadius: 12 }}>
                  <Target size={20} color="#FF6B00" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>{habitToEdit ? "Edit Habit Plan" : "Create New Habit Plan"}</Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Set up a new habit to track your progress</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={{ padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Modal Form Scroll */}
            <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              {/* Plan Name */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>PLAN NAME *</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FFF' }}>
                  <Target size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: '#1E293B' }}
                    value={planName}
                    onChangeText={setPlanName}
                    placeholder="e.g., Daily Coding Challenge"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Dates Row */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>START DATE *</Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 12, backgroundColor: '#FFF' }}
                    onPress={() => setActiveDatePicker('start')}
                  >
                    <Calendar size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, color: '#1E293B', flex: 1 }} numberOfLines={1} adjustsFontSizeToFit>{startDate}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>END DATE</Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 12, backgroundColor: '#FFF' }}
                    onPress={() => setActiveDatePicker('end')}
                  >
                    <Calendar size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, color: endDate ? '#1E293B' : '#94A3B8', flex: 1 }} numberOfLines={1} adjustsFontSizeToFit>{endDate || 'DD/MM/YYYY'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dynamic Habits list */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>HABITS *</Text>
                {habitsList.map((habit, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#FFF' }}>
                      <View style={{ paddingLeft: 12 }}>
                        <Target size={16} color="#94A3B8" />
                      </View>
                      <TextInput
                        style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: '#1E293B' }}
                        value={habit.habit_name}
                        onChangeText={(val) => {
                          const newHabits = [...habitsList];
                          newHabits[index].habit_name = val;
                          setHabitsList(newHabits);
                        }}
                        placeholder="Enter habit name"
                        placeholderTextColor="#94A3B8"
                      />
                      <View style={{ width: 1, height: 20, backgroundColor: '#E2E8F0' }} />
                      
                      {/* Simple mock dropdown for Category */}
                      <TouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 6 }}
                        onPress={() => {
                          // Toggle between valid types for simplicity
                          const types = ["Learning", "Physical", "Mindfulness", "Networking", "Building"];
                          const curIdx = types.indexOf(habit.habit_type);
                          const nextType = types[(curIdx + 1) % types.length];
                          const newHabits = [...habitsList];
                          newHabits[index].habit_type = nextType;
                          setHabitsList(newHabits);
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#475569' }} numberOfLines={1}>{habit.habit_type}</Text>
                        <ChevronDown size={14} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                    
                    {habitsList.length > 1 && (
                      <TouchableOpacity
                        style={{ padding: 10 }}
                        onPress={() => {
                          const newHabits = habitsList.filter((_, i) => i !== index);
                          setHabitsList(newHabits);
                        }}
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FF6B00', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 4 }}
                  onPress={() => setHabitsList([...habitsList, { habit_name: '', habit_type: 'Learning' }])}
                >
                  <Plus size={14} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>Add Habit</Text>
                </TouchableOpacity>
              </View>
              
              <View style={{height: 40}} />
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' }}
                onPress={() => setIsModalOpen(false)}
                disabled={modalLoading}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#475569' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#0F172A' }}
                onPress={handleCreateHabit}
                disabled={modalLoading}
              >
                {modalLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Edit2 size={16} color="#FFF" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>Save Changes</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Newly Unlocked Badge Modal */}
      <Modal
        visible={!!newlyUnlockedBadge}
        transparent
        animationType="fade"
      >
        <View style={styles.badgeModalOverlay}>
          <View style={styles.badgeModalContent}>
            {newlyUnlockedBadge && (
              <>
                <View style={[styles.badgeModalIconBox, { backgroundColor: '#FEFCE8', shadowColor: '#EAB308' }]}>
                  {newlyUnlockedBadge.streak_count >= 100 ? <Diamond color="#06B6D4" size={48} /> : 
                   newlyUnlockedBadge.streak_count >= 50 ? <Trophy color="#EAB308" size={48} /> : 
                   newlyUnlockedBadge.streak_count >= 21 ? <Medal color="#64748B" size={48} /> : 
                   newlyUnlockedBadge.streak_count >= 7 ? <Award color="#D97706" size={48} /> : 
                   <Shield color="#0EA5E9" size={48} />}
                </View>
                <Text style={styles.badgeModalSubtitle}>NEW ACHIEVEMENT!</Text>
                <Text style={styles.badgeModalTitle}>{newlyUnlockedBadge.badge_name}</Text>
                <Text style={styles.badgeModalStreak}>{newlyUnlockedBadge.streak_count}-Day Streak Milestone</Text>
                
                <View style={styles.badgeModalDescBox}>
                  <Text style={styles.badgeModalDesc}>"{newlyUnlockedBadge.description}"</Text>
                </View>

                <TouchableOpacity 
                  style={styles.badgeModalBtn}
                  onPress={() => setNewlyUnlockedBadge(null)}
                >
                  <Text style={styles.badgeModalBtnText}>Awesome! Keep it up</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Selected Badge Detail Modal */}
      <Modal
        visible={!!selectedBadge}
        transparent
        animationType="slide"
      >
        <View style={styles.badgeModalOverlay}>
          <View style={styles.badgeModalContent}>
            <TouchableOpacity 
              style={styles.badgeModalClose}
              onPress={() => setSelectedBadge(null)}
            >
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>

            {selectedBadge && (
              <>
                <View style={[styles.badgeModalIconBox, { backgroundColor: '#F8FAFC', shadowColor: '#64748B' }]}>
                  {selectedBadge.streak_count >= 100 ? <Diamond color="#06B6D4" size={48} /> : 
                   selectedBadge.streak_count >= 50 ? <Trophy color="#EAB308" size={48} /> : 
                   selectedBadge.streak_count >= 21 ? <Medal color="#64748B" size={48} /> : 
                   selectedBadge.streak_count >= 7 ? <Award color="#D97706" size={48} /> : 
                   <Shield color="#0EA5E9" size={48} />}
                </View>
                <Text style={styles.badgeModalSubtitle}>EARNED BADGE</Text>
                <Text style={styles.badgeModalTitle}>{selectedBadge.badge_name}</Text>
                <Text style={styles.badgeModalStreak}>{selectedBadge.streak_count}-Day Streak Milestone</Text>
                
                <View style={styles.badgeModalDescBox}>
                  <Text style={styles.badgeModalDesc}>"{selectedBadge.description}"</Text>
                </View>

                {selectedBadge.earned_date && (
                  <View style={styles.badgeModalDateBox}>
                    <Sparkles size={14} color="#059669" />
                    <Text style={styles.badgeModalDateText}>Unlocked on {selectedBadge.earned_date}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.badgeModalBtn, { backgroundColor: '#0F172A' }]}
                  onPress={() => setSelectedBadge(null)}
                >
                  <Text style={styles.badgeModalBtnText}>Close View</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* DateTime Picker Modal */}
      <DateTimePickerModal
        isVisible={activeDatePicker !== null}
        mode="date"
        onConfirm={(date) => {
          const formatted = formatDateToDDMMYYYY(date);
          if (activeDatePicker === 'start') {
            setStartDate(formatted);
          } else if (activeDatePicker === 'end') {
            setEndDate(formatted);
          }
          setActiveDatePicker(null);
        }}
        onCancel={() => setActiveDatePicker(null)}
      />
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

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: '#64748B', fontWeight: '500', fontStyle: 'italic' },

  statsCardContainer: { marginBottom: 20 },
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

  sectionContainer: { marginTop: 12, marginBottom: 24, paddingHorizontal: 4 },
  pendingList: { gap: 10, marginTop: 10 },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1
  },
  pendingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pendingTextInfo: { flex: 1 },
  pendingTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  pendingSubtitle: { fontSize: 10, color: '#64748B', marginTop: 2 },
  completeButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 75
  },
  completeButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitleSimple: { fontSize: 14, fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5 },
  newHabitButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  newHabitText: { fontSize: 11, fontWeight: '700', color: '#64748B' },

  listContainer: { gap: 14 },
  emptyContainer: { padding: 32, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1.5, borderColor: '#F1F5F9' },
  emptyText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  habitCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  habitMainInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  habitIconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  habitTextInfo: { flex: 1 },
  habitTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  habitTagsRow: { flexDirection: 'row', gap: 8 },
  categoryBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  categoryBadgeText: { fontSize: 9, fontWeight: '700', color: '#64748B' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255, 107, 0, 0.05)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  streakBadgeText: { fontSize: 9, fontWeight: '700', color: '#334155' },
  deleteHabitBtn: { padding: 8, borderRadius: 8, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },

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

  suggestedContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 16,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
    borderColor: '#FFEDD5',
    marginTop: 24,
    marginBottom: 10
  },
  suggestedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  suggestedHeading: { fontSize: 11, fontWeight: '800', color: colors.accent.DEFAULT, textTransform: 'uppercase', letterSpacing: 0.5 },
  suggestedTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  suggestedDescription: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 12 },
  suggestedAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accent.DEFAULT,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 16
  },
  suggestedAddBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: Dimensions.get('window').height * 0.85
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalHeaderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalMainTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 11, color: '#64748B', marginTop: 1 },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },

  modalForm: { marginTop: 16 },
  formGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1E293B',
    backgroundColor: '#FAFAFA'
  },
  formRow: { flexDirection: 'row', gap: 12 },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA'
  },
  dateText: { fontSize: 13, color: '#475569', fontWeight: '500' },

  habitInputRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  removeHabitBtn: { padding: 8, marginLeft: 4 },
  addHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6
  },
  addHabitBtnText: { fontSize: 11, fontWeight: '700', color: '#64748B' },

  aiToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginVertical: 16
  },
  aiToggleLabelBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiToggleLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B' },

  modalButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCancelBtnText: { color: '#475569', fontSize: 13, fontWeight: '700' },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: colors.accent.DEFAULT,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalSubmitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  badgesSectionContainer: {
    marginBottom: 20,
    marginTop: 10
  },
  badgeCard: {
    width: 140,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  badgeCardUnearned: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.8
  },
  badgeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  badgeIconBoxUnearned: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8
  },
  badgeNameUnearned: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8
  },
  badgeStreakBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeStreakText: {
    fontSize: 10,
    fontWeight: '800'
  },
  badgeTargetText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4
  },
  badgeProgressBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2
  },
  badgeProgressFill: {
    height: '100%',
    backgroundColor: '#94A3B8',
    borderRadius: 2
  },

  badgeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  badgeModalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  badgeModalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC'
  },
  badgeModalIconBox: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    transform: [{ rotate: '3deg' }]
  },
  badgeModalSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 4
  },
  badgeModalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4
  },
  badgeModalStreak: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16
  },
  badgeModalDescBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    marginBottom: 20
  },
  badgeModalDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  badgeModalDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    marginBottom: 20
  },
  badgeModalDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
  },
  badgeModalBtn: {
    width: '100%',
    backgroundColor: colors.accent.DEFAULT,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  badgeModalBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800'
  },

  footerSpacer: { height: 40 }
});
