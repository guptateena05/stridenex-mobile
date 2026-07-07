import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, FlatList, TextInput, Alert } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { AlertTriangle, TrendingDown, Target, Zap, Brain, ChevronDown, Search, X, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { getCollegeDetails, getLowEmployabilityStudents, assignStudentMentor, getMasterData } from '@/api/college.services';

const recommendations = [
  { icon: "📚", text: "Bulk-enroll CSE 3rd Year in Data bootcamp", subject: "84 students", impact: "+15 avg score" },
  { icon: "🤝", text: "Peer mentors for at-risk 4th year", subject: "47 students", impact: "Improve retention" },
  { icon: "🎤", text: "AI mock-interview sessions", subject: "52 students", impact: "+20% offer rate" },
];

export const CollegeInterventionsScreen = () => {
  const { userName } = useAuth();
  
  const [collegeDetails, setCollegeDetails] = useState<any>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [mentorsList, setMentorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Selected mentor per student email/name
  const [selectedMentors, setSelectedMentors] = useState<Record<string, any>>({});
  // Assigning status per student email/name
  const [assigningMap, setAssigningMap] = useState<Record<string, boolean>>({});

  // Mentor search & selection modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Toggle active tab (Critical Students vs AI Recommendations)
  const [activeTab, setActiveTab] = useState<'students' | 'recommendations'>('students');

  // Fetch college details, students list, and mentors list
  const fetchDetailsAndData = useCallback(async (isRefresh = false) => {
    if (!userName) return;
    if (!isRefresh) setLoading(true);
    try {
      const collegeRes = await getCollegeDetails(userName);
      const data = collegeRes?.data || collegeRes?.message?.data || collegeRes?.message;
      if (data) {
        setCollegeDetails(data);
        const collegeName = data.name || data.college_name || userName;

        const [studentsRes, mentorsRes] = await Promise.allSettled([
          getLowEmployabilityStudents(collegeName),
          getMasterData("Mentor")
        ]);

        if (studentsRes.status === "fulfilled") {
          const raw = studentsRes.value?.data ?? studentsRes.value?.message?.data ?? studentsRes.value?.message ?? studentsRes.value;
          const list = Array.isArray(raw?.students) ? raw.students : (Array.isArray(raw) ? raw : []);
          setStudentsList(list);
        } else {
          console.error("Failed to load low employability students:", studentsRes.reason);
        }

        if (mentorsRes.status === "fulfilled") {
          const raw = mentorsRes.value?.data ?? mentorsRes.value?.message?.data ?? mentorsRes.value?.message ?? mentorsRes.value;
          const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
          setMentorsList(arr);
        } else {
          console.error("Failed to load mentors:", mentorsRes.reason);
        }
      }
    } catch (err) {
      console.error("Error fetching interventions data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchDetailsAndData();
  }, [fetchDetailsAndData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDetailsAndData(true);
  }, [fetchDetailsAndData]);

  // Assign a mentor to a student
  const handleAssignMentor = async (student: any) => {
    const studentId = student.email || student.name;
    const selectedMentor = selectedMentors[studentId];
    if (!studentId || !selectedMentor) return;

    try {
      setAssigningMap(prev => ({ ...prev, [studentId]: true }));
      await assignStudentMentor({
        student: studentId,
        mentor: selectedMentor.name
      });
      
      Alert.alert("Success", "Mentor assigned successfully!");
      fetchDetailsAndData(true);
    } catch (err: any) {
      console.error("Failed to assign mentor:", err);
      Alert.alert("Error", err?.message || "Failed to assign mentor. Please try again.");
    } finally {
      setAssigningMap(prev => ({ ...prev, [studentId]: false }));
    }
  };

  // Deterministic avatar colors
  const getAvatarColor = (name: string) => {
    const hexColors = ['#2563EB', '#10B981', '#B45309', '#7C3AED', '#DB2777', '#E11D48', '#0284C7', '#4F46E5'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hexColors[hash % hexColors.length];
  };

  // Filter mentors based on search input
  const filteredMentors = useMemo(() => {
    return mentorsList.filter(m => {
      const name = (m.mentor_name || m.full_name || m.name || '').toLowerCase();
      const email = (m.name || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [mentorsList, searchTerm]);

  // Top metric card metrics
  const displayMetrics = useMemo(() => {
    return [
      { id: 1, title: 'Critical Risk <40', value: loading ? '...' : String(studentsList.length), icon: AlertTriangle, color: colors.error },
      { id: 2, title: 'High Risk 40-55', value: '96', icon: AlertTriangle, color: colors.warning },
      { id: 3, title: 'Declining Progress', value: '128', icon: TrendingDown, color: colors.success },
      { id: 4, title: 'Placement-Ready', value: '312', icon: Target, color: colors.success },
    ];
  }, [loading, studentsList.length]);

  // Modal view for selecting a mentor
  const renderMentorSelectModal = () => {
    if (!activeStudent) return null;
    const studentId = activeStudent.email || activeStudent.name;

    return (
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsModalOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Mentor</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBarContainer}>
              <Search size={16} color="#64748B" style={styles.searchIcon} />
              <TextInput
                placeholder="Search by name or email..."
                placeholderTextColor="#94A3B8"
                style={styles.searchBarInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredMentors}
              keyExtractor={(item) => item.name}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => {
                const isSelected = selectedMentors[studentId]?.name === item.name;
                const displayName = item.mentor_name || item.full_name || item.name;
                
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.selectedOption]}
                    onPress={() => {
                      setSelectedMentors(prev => ({ ...prev, [studentId]: item }));
                      setIsModalOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <View style={styles.optionTextContainer}>
                      <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                        {displayName}
                      </Text>
                      {item.mentor_name || item.full_name ? (
                        <Text style={styles.optionSubText}>{item.name}</Text>
                      ) : null}
                    </View>
                    {isSelected && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No mentors found</Text>
                </View>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF6B00"]} />
        }
      >
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Student Actions</Text>
            <View style={styles.headerBadge}>
              <Zap size={10} color="#059669" />
              <Text style={styles.headerBadgeText}>INTERVENTIONS</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Oversight of at-risk students and AI plans</Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInRight.delay(100)} style={styles.statsRow}>
          {displayMetrics.map((stat, i) => (
             <StatsCard 
              key={i} 
              title={stat.title.split(' ')[0]} 
              value={stat.value} 
              icon={stat.icon} 
              color={stat.color} 
            />
          ))}
        </Animated.View>

        {/* Segmented Tab Switcher */}
        <Animated.View entering={FadeInUp.delay(120)} style={styles.tabSwitcherContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'students' && styles.activeTabBtn]}
            onPress={() => setActiveTab('students')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'students' && styles.activeTabBtnText]}>
              Critical Students ({loading ? '...' : studentsList.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'recommendations' && styles.activeTabBtn]}
            onPress={() => setActiveTab('recommendations')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'recommendations' && styles.activeTabBtnText]}>
              AI Recommendations ({recommendations.length})
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {activeTab === 'students' ? (
          <Animated.View key="students-tab" entering={FadeInUp.duration(250)}>
            {/* Critical Students Card */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <AlertTriangle color="#EF4444" size={18} />
                <Text style={styles.sectionTitle}>Critical Students — Immediate Action</Text>
              </View>

              <View style={styles.listContainer}>
                {loading && !refreshing ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#FF6B00" />
                    <Text style={styles.loaderText}>Loading critical students...</Text>
                  </View>
                ) : studentsList.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No critical students found</Text>
                  </View>
                ) : (
                  studentsList.map((student, idx) => {
                    const fullName = student.student_name || student.name || student.email || "—";
                    const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    const score = student.employability_score !== undefined ? student.employability_score : 0;
                    const studentId = student.email || student.name;
                    const selectedMentor = selectedMentors[studentId];
                    const isAssignActive = !!selectedMentor;

                    let badgeText = "Critical";
                    let subtitle1 = "Student";
                    let showSubtitle1 = true;

                    if (!student.course) {
                      if (idx % 3 === 1) {
                        badgeText = "Critical Student";
                        showSubtitle1 = false;
                      } else if (idx % 3 === 2) {
                        badgeText = "";
                        subtitle1 = "Critical Student";
                        showSubtitle1 = true;
                      } else {
                        badgeText = "Critical";
                        subtitle1 = "Student";
                        showSubtitle1 = true;
                      }
                    } else {
                      badgeText = "Critical";
                      subtitle1 = student.course;
                      showSubtitle1 = true;
                    }

                    const avatarColor = getAvatarColor(fullName);

                    return (
                      <View key={studentId || idx} style={[styles.studentRow, idx === studentsList.length - 1 && styles.noBorder]}>
                        
                        {/* Left: Avatar & Info */}
                        <View style={styles.leftSection}>
                          <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                            <Text style={styles.avatarCircleText}>{initials}</Text>
                          </View>
                          <View style={styles.infoBlock}>
                            <View style={styles.nameRow}>
                              <Text style={styles.studentName} numberOfLines={1}>{fullName}</Text>
                              {badgeText ? (
                                <View style={styles.badgeContainer}>
                                  <Text style={styles.badgeText}>{badgeText}</Text>
                                </View>
                              ) : null}
                            </View>
                            {showSubtitle1 && (
                              <Text style={styles.studentSubtitle} numberOfLines={1}>{subtitle1}</Text>
                            )}
                            <Text style={styles.employabilityText}>
                              Employability Score: <Text style={styles.scoreNumber}>{score}</Text>
                            </Text>
                          </View>
                        </View>

                        {/* Right: Dropdown & Assign button */}
                        <View style={styles.rightSection}>
                          <TouchableOpacity 
                            style={styles.dropdownBtn}
                            onPress={() => {
                              setActiveStudent(student);
                              setIsModalOpen(true);
                            }}
                          >
                            <Text style={styles.dropdownBtnText} numberOfLines={1}>
                              {selectedMentor ? selectedMentor.name : "Select Mentor"}
                            </Text>
                            <ChevronDown size={12} color="#64748B" />
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={[
                              styles.assignBtn,
                              isAssignActive ? styles.assignBtnActive : styles.assignBtnInactive
                            ]}
                            disabled={!isAssignActive || assigningMap[studentId]}
                            onPress={() => handleAssignMentor(student)}
                          >
                            <Text style={styles.assignBtnText}>
                              {assigningMap[studentId] ? "..." : "Assign"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              <TouchableOpacity style={styles.viewMoreBtn}>
                 <Text style={styles.viewMoreText}>View All Critical Students</Text>
                 <ChevronRight size={14} color="#64748B" />
              </TouchableOpacity>
            </Card>
          </Animated.View>
        ) : (
          <Animated.View key="recommendations-tab" entering={FadeInUp.duration(250)}>
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
          </Animated.View>
        )}

      </ScrollView>
      {renderMentorSelectModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24 },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4, borderLeftColor: '#059669' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },

  listContainer: { gap: 16 },
  
  studentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1.1, marginRight: 8 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarCircleText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  
  infoBlock: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  studentName: { fontSize: 13, fontWeight: '800', color: '#1E293B', maxWidth: 100 },
  
  badgeContainer: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '600', color: '#64748B' },
  
  studentSubtitle: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  employabilityText: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  scoreNumber: { color: '#EF4444', fontWeight: '700' },
  
  rightSection: { flexDirection: 'row', alignItems: 'center', flex: 1.9, gap: 8 },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#CBD5E1', flex: 1 },
  dropdownBtnText: { fontSize: 11, fontWeight: '600', color: '#334155', marginRight: 4, flex: 1 },
  
  assignBtn: { width: 70, height: 36, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  assignBtnActive: { backgroundColor: '#FF6B00' },
  assignBtnInactive: { backgroundColor: '#FFB288' },
  assignBtnText: { fontSize: 12, fontWeight: '800', color: '#FFF' },

  loaderContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  loaderText: { fontSize: 12, color: '#64748B', marginTop: 6, fontWeight: '500' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  emptyText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  viewMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 4 },
  viewMoreText: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  insightCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', borderLeftWidth: 4, borderLeftColor: '#059669' },
  insightTop: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  insightIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  insightInfo: { flex: 1 },
  insightText: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  insightMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaBadge: { backgroundColor: '#FFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  metaBadgeText: { fontSize: 9, fontWeight: '800', color: '#64748B' },
  impactText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  execBtn: { backgroundColor: '#0F172A', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  execBtnText: { fontSize: 12, fontWeight: '800', color: '#FFF' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalContent: { width: '100%', maxHeight: '60%', backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display },
  
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 40, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchBarInput: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '500', height: '100%' },
  
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  selectedOption: { backgroundColor: '#F8FAFC' },
  optionTextContainer: { flex: 1 },
  optionText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  selectedOptionText: { color: '#0F172A', fontWeight: '800' },
  optionSubText: { fontSize: 11, color: '#64748B', marginTop: 1 },
  checkMark: { color: '#FF6B00', fontWeight: 'bold', fontSize: 14 },

  // Tab Switcher Styles
  tabSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeTabBtn: {
    backgroundColor: '#FFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabBtnText: {
    color: '#0F172A',
  }
});
