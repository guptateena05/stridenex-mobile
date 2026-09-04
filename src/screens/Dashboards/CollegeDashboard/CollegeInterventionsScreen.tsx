import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AlertTriangle, Target, Users, TrendingUp, GraduationCap, Bell, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { getCollegeDetails, getLowEmployabilityStudents } from '@/api/college.services';

const LIMIT = 20;

export const CollegeInterventionsScreen = () => {
  const { userName } = useAuth();
  
  const [collegeName, setCollegeName] = useState<string>('');
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [totalCritical, setTotalCritical] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchInitialData = useCallback(async (isRefresh = false, targetPage = 1) => {
    if (!userName) return;
    if (!isRefresh && targetPage === 1) setLoading(true);
    if (targetPage > 1) setLoadingMore(true);

    try {
      let cName = collegeName;
      if (!cName) {
        const collegeRes = await getCollegeDetails(userName);
        const data = collegeRes?.data || collegeRes?.message?.data || collegeRes?.message;
        if (data) {
          cName = data.college_name || data.name;
          if (cName) setCollegeName(cName);
        }
      }

      if (!cName) {
        console.warn("College name not found");
        return;
      }

      const offset = (targetPage - 1) * LIMIT;
      const studentsRes = await getLowEmployabilityStudents(cName, LIMIT, offset);
      const raw = studentsRes?.data ?? studentsRes?.message?.data ?? studentsRes?.message ?? studentsRes;
      
      if (raw && typeof raw === 'object') {
        const list = Array.isArray(raw.students) ? raw.students : [];
        setStudentsList(list);
        setTotalCritical(raw.total || 0);
      } else if (Array.isArray(raw)) {
        setStudentsList(raw);
        setTotalCritical(raw.length);
      }
      
      setPage(targetPage);

    } catch (err) {
      console.error("Error fetching interventions data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [userName, collegeName]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInitialData(true, 1);
  }, [fetchInitialData]);

  const getInitials = (name: string) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colorsList = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorsList[Math.abs(hash) % colorsList.length];
  };

  const totalPages = Math.ceil(totalCritical / LIMIT) || 1;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent.DEFAULT]} />
        }
      >
        {/* Screen Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={[styles.headerRow, { flexWrap: 'wrap', gap: 8 }]}>
            <View style={{ flex: 1, minWidth: 180 }}>
              <View style={[styles.headerBadge, { alignSelf: 'flex-start', marginBottom: 4 }]}>
                <AlertTriangle size={10} color="#059669" />
                <Text style={styles.headerBadgeText}>INTERVENTIONS</Text>
              </View>
              <Text style={styles.title}>At-Risk Students</Text>
            </View>
          </View>
        </Animated.View>

        {/* Top Summary Cards (4 in a row) */}
        <View style={styles.cardsRow}>
          {/* ACTIVE Card */}
          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.summaryCard}>
            <View style={[styles.iconBg, { backgroundColor: '#EFF6FF' }]}>
              <Users size={20} color="#3B82F6" />
            </View>
            <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>{totalCritical}</Text>
            <Text style={styles.cardLabel}>ACTIVE</Text>
          </Animated.View>

          {/* AVG Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.summaryCard}>
            <View style={[styles.iconBg, { backgroundColor: '#ECFDF5' }]}>
              <TrendingUp size={20} color="#10B981" />
            </View>
            <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>0.8</Text>
            <Text style={styles.cardLabel}>AVG</Text>
          </Animated.View>

          {/* AT-RISK Card */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.summaryCard}>
            <View style={[styles.iconBg, { backgroundColor: '#FEF2F2' }]}>
              <AlertTriangle size={20} color="#EF4444" />
            </View>
            <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>{totalCritical}</Text>
            <Text style={styles.cardLabel}>AT-RISK</Text>
          </Animated.View>

          {/* NEW Card */}
          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.summaryCard}>
            <View style={[styles.iconBg, { backgroundColor: '#FFFBEB' }]}>
              <GraduationCap size={20} color="#F59E0B" />
            </View>
            <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>0</Text>
            <Text style={styles.cardLabel}>NEW</Text>
          </Animated.View>
        </View>

        {/* List Header */}
        <View style={styles.listHeader}>
          <AlertTriangle size={16} color="#EF4444" />
          <Text style={styles.listTitle}>Critical Students — Immediate Action</Text>
        </View>

        {loadingMore ? (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          </View>
        ) : (
          <>
            {studentsList.map((student, index) => (
              <Animated.View 
                key={student.email || student.name || index}
                entering={FadeInUp.delay((index % LIMIT) * 50).duration(400)}
                style={styles.studentItem}
              >
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(student.student_name || 'Student') }]}>
                  <Text style={styles.avatarText}>{getInitials(student.student_name)}</Text>
                </View>
                <View style={styles.studentInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.studentName} numberOfLines={1}>{student.student_name}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Critical Student</Text>
                    </View>
                  </View>
                  <Text style={styles.scoreText}>
                    Employability Score: <Text style={styles.scoreValue}>{student.employability_score}</Text>
                  </Text>
                </View>
              </Animated.View>
            ))}
            
            {studentsList.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No critical students found.</Text>
              </View>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  disabled={page <= 1}
                  onPress={() => fetchInitialData(false, page - 1)}
                  style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                >
                  <ChevronLeft size={16} color={page <= 1 ? "#CBD5E1" : "#0F172A"} />
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>{page} of {totalPages}</Text>
                <TouchableOpacity
                  disabled={page >= totalPages}
                  onPress={() => fetchInitialData(false, page + 1)}
                  style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                >
                  <ChevronRight size={16} color={page >= totalPages ? "#CBD5E1" : "#0F172A"} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingMoreContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  
  // Header styles
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  headerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
  },

  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  studentInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  scoreText: {
    fontSize: 13,
    color: '#64748B',
  },
  scoreValue: {
    fontWeight: '800',
    color: '#EF4444',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // Pagination controls
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});
