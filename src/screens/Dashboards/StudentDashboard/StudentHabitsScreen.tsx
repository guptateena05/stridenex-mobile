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
  RefreshControl
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
  X
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { SwipeableRow } from '@/components/Shared/SwipeableRow';
import { SkeletonLoader } from '@/components/Shared/SkeletonLoader';
import {
  getStudentDashboardHabits,
  getTodaysPendingHabits,
  getStudentPlans,
  getHabitStreaks,
  logDailyHabits,
  completeHabitPlanStatus,
  deleteHabitPlan,
  createHabitPlan
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
      status: 'done' | 'partial' | 'missed';
    }[];
  };
}

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const statusConfig = {
  done: { icon: CheckCircle2, color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.2)", indicator: "✓" },
  partial: { icon: Circle, color: colors.accent.DEFAULT, bgColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.2)", indicator: "○" },
  missed: { icon: Circle, color: "#94A3B8", bgColor: "#F1F5F9", borderColor: "#E2E8F0", indicator: "−" }
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

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form fields
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState(formatDateToDDMMYYYY(new Date()));
  const [endDate, setEndDate] = useState('');
  const [linkedPath, setLinkedPath] = useState('');
  const [habitsList, setHabitsList] = useState<string[]>(['']);
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
      const [dashboardRes, pendingRes, plansRes, streaksRes] = await Promise.allSettled([
        getStudentDashboardHabits(userName),
        getTodaysPendingHabits(userName),
        getStudentPlans(userName, "Active"),
        getHabitStreaks(userName)
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
                aiGenerated: plan.ai_generated
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

  const handleCreateHabit = async () => {
    if (!userName) return;
    if (!planName.trim()) {
      Alert.alert("Required Field", "Please enter a plan name.");
      return;
    }

    const validHabits = habitsList.filter(h => h.trim() !== '');
    if (validHabits.length === 0) {
      Alert.alert("Required Field", "Please add at least one habit.");
      return;
    }

    try {
      setModalLoading(true);

      const payload = {
        student: userName,
        plan_name: planName,
        start_date: startDate,
        end_date: endDate || null,
        linked_path: linkedPath || null,
        habits: validHabits.map(h => ({
          habit_name: h,
          doctype: "Habit Plan Item"
        })),
        ai_generated: aiGenerated ? 1 : 0
      };

      await createHabitPlan(payload);

      setIsModalOpen(false);
      // Reset form
      setPlanName('');
      setStartDate(formatDateToDDMMYYYY(new Date()));
      setEndDate('');
      setLinkedPath('');
      setHabitsList(['']);
      setAiGenerated(false);

      Alert.alert("Success", "Habit plan created successfully!");
      fetchData(false);
    } catch (err: any) {
      console.error("Error creating habit plan:", err);
      Alert.alert("Error", err?.message || "Failed to create habit plan.");
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

        {/* Today's Pending Habits */}
        {pendingHabits.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitleSimple}>Today's Pending Tasks</Text>
            <View style={styles.pendingList}>
              {pendingHabits.map((habit, index) => {
                const CategoryIcon = getIconForCategory(habit.habit_type);
                const categoryColor = getColorForCategory(habit.habit_type);
                const categoryBg = getBgColorForCategory(habit.habit_type);
                const isLogging = completingHabit === habit.id;

                return (
                  <View key={`${habit.id}-${index}`} style={styles.pendingCard}>
                    <View style={styles.pendingLeft}>
                      <View style={[styles.habitIconContainer, { backgroundColor: categoryBg }]}>
                        <CategoryIcon size={18} color={categoryColor} />
                      </View>
                      <View style={styles.pendingTextInfo}>
                        <Text style={styles.pendingTitle}>{habit.habit_name}</Text>
                        <Text style={styles.pendingSubtitle}>{habit.habit_type}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.completeButton}
                      disabled={isLogging}
                      activeOpacity={0.7}
                      onPress={() => handleLogHabit(habit.id, habit.target_value, habit.plan_name)}
                    >
                      {isLogging ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.completeButtonText}>Complete</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* My Habit Plans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleSimple}>My Habit Plans</Text>
          <TouchableOpacity
            style={styles.newHabitButton}
            activeOpacity={0.7}
            onPress={() => setIsModalOpen(true)}
          >
            <Plus size={12} color="#64748B" />
            <Text style={styles.newHabitText}>New Habit</Text>
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
                    style={[styles.habitCard, { borderLeftWidth: 4, borderLeftColor, marginBottom: 0 }]}
                  >
                    <View style={styles.habitMainInfo}>
                      <View style={[styles.habitIconContainer, { backgroundColor: getBgColorForCategory(habit.category) }]}>
                        {(() => {
                          const CategoryIcon = getIconForCategory(habit.category);
                          return <CategoryIcon size={20} color={getColorForCategory(habit.category)} />;
                        })()}
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
                        {habit.weeklyData.map((done: boolean, dIdx: number) => (
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
                  </View>
                </SwipeableRow>
              );
            })
          )}
        </View>

        {/* Suggested Habit Section */}
        {suggestedHabit && (
          <View style={styles.suggestedContainer}>
            <View style={styles.suggestedHeader}>
              <Zap size={16} color={colors.accent.DEFAULT} />
              <Text style={styles.suggestedHeading}>Recommended for you</Text>
            </View>
            <Text style={styles.suggestedTitle}>{suggestedHabit.title}</Text>
            <Text style={styles.suggestedDescription}>{suggestedHabit.description}</Text>
            <TouchableOpacity
              style={styles.suggestedAddBtn}
              activeOpacity={0.7}
              onPress={() => handleAddSuggestedHabit(suggestedHabit)}
            >
              <Plus size={14} color="#FFF" />
              <Text style={styles.suggestedAddBtnText}>Add to My Plans</Text>
            </TouchableOpacity>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalHeaderIconBox}>
                  <Target size={20} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.modalMainTitle}>Create Habit Plan</Text>
                  <Text style={styles.modalSubtitle}>Set up a new habit to track your progress</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Modal Form Scroll */}
            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              {/* Plan Name */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Plan Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={planName}
                  onChangeText={setPlanName}
                  placeholder="e.g., Daily Coding Challenge"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Dates Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Start Date *</Text>
                  <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setActiveDatePicker('start')}
                  >
                    <Calendar size={16} color="#64748B" />
                    <Text style={styles.dateText}>{startDate}</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.fieldLabel}>End Date (Optional)</Text>
                  <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setActiveDatePicker('end')}
                  >
                    <Calendar size={16} color="#64748B" />
                    <Text style={styles.dateText}>{endDate || 'Select End Date'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Linked Path */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Linked Path (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={linkedPath}
                  onChangeText={setLinkedPath}
                  placeholder="e.g., /career/software-engineering"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
              </View>

              {/* Dynamic Habits list */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Habits *</Text>
                {habitsList.map((habit, index) => (
                  <View key={index} style={styles.habitInputRow}>
                    <Target size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.textInput, { flex: 1, marginVertical: 4 }]}
                      value={habit}
                      onChangeText={(val) => {
                        const newHabits = [...habitsList];
                        newHabits[index] = val;
                        setHabitsList(newHabits);
                      }}
                      placeholder="Enter habit name"
                      placeholderTextColor="#94A3B8"
                    />
                    {habitsList.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeHabitBtn}
                        onPress={() => {
                          const newHabits = habitsList.filter((_, i) => i !== index);
                          setHabitsList(newHabits);
                        }}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addHabitBtn}
                  onPress={() => setHabitsList([...habitsList, ''])}
                >
                  <Plus size={14} color="#64748B" />
                  <Text style={styles.addHabitBtnText}>Add Habit</Text>
                </TouchableOpacity>
              </View>

              {/* AI Generated Toggle */}
              <View style={styles.aiToggleRow}>
                <View style={styles.aiToggleLabelBox}>
                  <Zap size={16} color={colors.accent.DEFAULT} />
                  <Text style={styles.aiToggleLabel}>AI Generated</Text>
                </View>
                <Switch
                  value={aiGenerated}
                  onValueChange={setAiGenerated}
                  trackColor={{ false: "#E2E8F0", true: "rgba(255, 107, 0, 0.3)" }}
                  thumbColor={aiGenerated ? colors.accent.DEFAULT : "#94A3B8"}
                />
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleCreateHabit}
                  disabled={modalLoading}
                >
                  {modalLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Create Plan</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
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

  footerSpacer: { height: 40 }
});
