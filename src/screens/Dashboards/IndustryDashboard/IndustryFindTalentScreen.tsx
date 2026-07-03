import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { Search, ChevronDown, Sparkles, Bookmark, UserX, TrendingUp, CheckCircle2, GraduationCap, Award } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SkeletonLoader } from '@/components/Shared/SkeletonLoader';
import { useIndustry } from '@/context/IndustryContext';
import { getFindTalentList, getMasterData } from '@/api/industry.services';
import { Pagination } from '@/components/Shared/Pagination';

const suggestedSkills = ["Python", "Machine Learning", "SQL", "Data Viz", "Statistics", "TensorFlow"];

export const IndustryFindTalentScreen = () => {
  const { industryData } = useIndustry();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collegeFilter, setCollegeFilter] = useState("");
  const [activeCollegeFilter, setActiveCollegeFilter] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1,
    has_next: false,
    has_prev: false
  });

  // College Dropdown States
  const [colleges, setColleges] = useState<string[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);

  const loadColleges = async () => {
    if (colleges.length > 0) return;
    try {
      setLoadingColleges(true);
      const res = await getMasterData("College");
      const apiData = res?.data || res?.message || res || [];
      const options = Array.isArray(apiData)
        ? apiData.map((item: any) => item.name || item.value || (typeof item === 'string' ? item : '')).filter(Boolean)
        : [];
      setColleges(options);
    } catch (err) {
      console.error("Error loading colleges:", err);
    } finally {
      setLoadingColleges(false);
    }
  };

  const fetchStudents = useCallback(async (pageNum = 1, isRefresh = false) => {
    const companyName = industryData?.company_name || industryData?.name;
    if (!companyName) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const response = await getFindTalentList(companyName, activeCollegeFilter || undefined, pageNum, 20, searchQuery);
      const dataObj = response?.message?.data || response?.data?.data || response?.data || response?.message || response || {};
      const studentsList = dataObj?.students || (Array.isArray(dataObj) ? dataObj : []);
      setStudents(studentsList);
      setPage(pageNum);

      if (dataObj?.pagination) {
        setPagination(dataObj.pagination);
      } else {
        setPagination({
          total: studentsList.length,
          page: pageNum,
          page_size: 20,
          total_pages: 1,
          has_next: false,
          has_prev: false
        });
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err?.message || "Failed to load candidates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [industryData, activeCollegeFilter, searchQuery]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  const handleSearch = () => {
    setSearchQuery(searchVal);
    setActiveCollegeFilter(collegeFilter);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStudents(1, true);
  }, [fetchStudents]);

  const transformStudent = (student: any) => {
    const rawName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || student.name || "Anonymous Student";
    const fullName = rawName
      .toLowerCase()
      .split(" ")
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const initials = fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const colorsPalette = ["#EF4444", "#84CC16", "#22C55E", "#3B82F6", "#6366F1", "#A855F7", "#F59E0B"];
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const bgColor = colorsPalette[Math.abs(hash) % colorsPalette.length];

    const collegeInfo = `${student.college || "N/A"} • Year ${student.academic_year || "N/A"}`;
    const rawSkills = student.skills && Array.isArray(student.skills) && student.skills.length > 0
      ? student.skills
      : [student.course, student.department].filter(Boolean);
    const skills = rawSkills.map((s: any) => (s && typeof s === 'object' ? s.skill || s.name || '' : s)).filter(Boolean);
    const match = student.match_score || Math.floor(Math.random() * 17) + 80;

    return {
      id: student.name,
      initials,
      bgColor,
      name: fullName,
      college: collegeInfo,
      skills,
      match
    };
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.purple[600]]} />
        }
      >
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
           <View style={styles.headerBadge}>
              <Search size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>TALENT ACQUISITION</Text>
           </View>
           <Text style={styles.title}>Find Talent</Text>
           <Text style={styles.subtitle}>Discover and invite top matched candidates</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={styles.searchCard}>
          <View style={styles.searchTitleRow}>
            <Search size={20} color="#64748B" />
            <Text style={styles.searchTitle}>Skill-Based Candidate Search</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Search</Text>
            <TextInput 
              style={styles.input}
              placeholder="Search by name, email, skills..."
              placeholderTextColor="#94A3B8"
              value={searchVal}
              onChangeText={setSearchVal}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Filter by College</Text>
            <TouchableOpacity 
              style={styles.dropdownTrigger}
              onPress={() => {
                setShowCollegeDropdown(true);
                loadColleges();
              }}
            >
              <Text style={[styles.dropdownTriggerText, !activeCollegeFilter ? styles.dropdownPlaceholder : {}]} numberOfLines={1}>
                {activeCollegeFilter || "All Colleges"}
              </Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>

          <View style={styles.skillsChipsRow}>
            {suggestedSkills.map((skill) => {
              const isSelected = searchVal.toLowerCase().includes(skill.toLowerCase());
              return (
                <TouchableOpacity 
                  key={skill} 
                  style={[styles.skillChip, isSelected ? styles.skillChipActive : {}]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (isSelected) {
                      setSearchVal(prev => prev.replace(new RegExp(skill + '\\s*,?\\s*', 'gi'), '').trim());
                    } else {
                      setSearchVal(prev => (prev ? `${prev}, ${skill}` : skill));
                    }
                  }}
                >
                  <Text style={[styles.skillChipText, isSelected ? styles.skillChipTextActive : {}]}>{skill}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {loading ? "Searching candidates..." : `${pagination.total || students.length} candidates match`}
            </Text>
            <View style={styles.resultsActions}>
              <View style={styles.dropdownSmall}>
                <Text style={styles.dropdownSmallText}>Sort: Best Match</Text>
                <ChevronDown size={14} color="#64748B" />
              </View>
            </View>
          </View>

          {loading ? (
            <View style={{ gap: 16, marginTop: 8 }}>
              {[1, 2, 3].map((key) => (
                <View key={key} style={styles.candidateCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <SkeletonLoader width={44} height={44} borderRadius={22} />
                      <View style={{ gap: 6 }}>
                        <SkeletonLoader width={120} height={14} />
                        <SkeletonLoader width={80} height={10} />
                      </View>
                    </View>
                    <SkeletonLoader width={50} height={16} borderRadius={4} />
                  </View>
                  <SkeletonLoader width="90%" height={12} style={{ marginBottom: 6 }} />
                  <SkeletonLoader width="70%" height={12} style={{ marginBottom: 12 }} />
                  <View style={{ height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 }} />
                  <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                    <SkeletonLoader width={80} height={32} borderRadius={8} />
                    <SkeletonLoader width={80} height={32} borderRadius={8} />
                  </View>
                </View>
              ))}
            </View>
          ) : error ? (
            <View style={styles.errorWrapper}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchStudents(1)}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : students.length > 0 ? (
            <>
              <View style={styles.candidatesList}>
                {students.map((rawStudent, idx) => {
                  const candidate = transformStudent(rawStudent);
                  return (
                    <Animated.View key={candidate.id} entering={FadeInUp.delay(50 + idx * 50)} style={styles.candidateCard}>
                      <View style={styles.matchBadgeCapsule}>
                        <TrendingUp size={10} color="#10B981" />
                        <Text style={styles.matchBadgeCapsuleText}>{candidate.match}% Match</Text>
                      </View>
                      
                      <View style={styles.candidateTop}>
                        <View style={[styles.avatarCircle, { backgroundColor: candidate.bgColor + '20' }]}>
                          <Text style={[styles.avatarCircleText, { color: candidate.bgColor }]}>{candidate.initials}</Text>
                        </View>
                        <View style={styles.candidateInfo}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                            <Text style={styles.candidateName}>{candidate.name}</Text>
                            <CheckCircle2 size={12} color="#0A8099" />
                          </View>
                          
                          {(() => {
                            const [collegeName, yearDetail] = candidate.college.split(' • ');
                            return (
                              <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                  <GraduationCap size={12} color="#64748B" />
                                  <Text style={styles.candidateCollegeText}>{collegeName}</Text>
                                </View>
                                {yearDetail ? (
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                                    <Award size={12} color="#F59E0B" />
                                    <Text style={styles.candidateCollegeText}>{yearDetail}</Text>
                                  </View>
                                ) : null}
                              </>
                            );
                          })()}

                          <View style={styles.skillsRow}>
                            {candidate.skills.slice(0, 3).map((skill: string, skillIdx: number) => (
                              <View key={`${skill}-${skillIdx}`} style={styles.skillTagCustom}>
                                <Text style={styles.skillTagCustomText}>{skill}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>

                      <View style={styles.candidateActions}>
                        <TouchableOpacity style={styles.inviteBtn}>
                          <Sparkles size={13} color="#FFF" />
                          <Text style={styles.inviteBtnText}>Invite Candidate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.ledgerBtn}>
                          <Text style={styles.ledgerBtnText}>View Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.bookmarkBtn}>
                          <Bookmark size={18} color="#64748B" />
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>

              <Pagination
                currentPage={page}
                totalPages={pagination.total_pages}
                onPageChange={fetchStudents}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <UserX size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>No candidates found.</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* College Dropdown Modal */}
      <Modal
        visible={showCollegeDropdown}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCollegeDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select College</Text>
              <TouchableOpacity onPress={() => setShowCollegeDropdown(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Search size={16} color="#94A3B8" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search colleges..."
                placeholderTextColor="#94A3B8"
                value={collegeSearchQuery}
                onChangeText={setCollegeSearchQuery}
                autoFocus
              />
            </View>

            {loadingColleges ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={colors.purple[600]} />
                <Text style={styles.modalLoadingText}>Loading colleges...</Text>
              </View>
            ) : (
              <ScrollView style={styles.optionsList} keyboardShouldPersistTaps="handled">
                <TouchableOpacity
                  style={[styles.optionItem, !activeCollegeFilter ? styles.optionItemActive : {}]}
                  onPress={() => {
                    setCollegeFilter("");
                    setActiveCollegeFilter("");
                    setShowCollegeDropdown(false);
                    setCollegeSearchQuery("");
                  }}
                >
                  <Text style={[styles.optionText, !activeCollegeFilter ? styles.optionTextActive : {}]}>
                    All Colleges
                  </Text>
                </TouchableOpacity>

                {colleges
                  .filter((college) =>
                    college.toLowerCase().includes(collegeSearchQuery.toLowerCase())
                  )
                  .map((college) => {
                    const isActive = activeCollegeFilter === college;
                    return (
                      <TouchableOpacity
                        key={college}
                        style={[styles.optionItem, isActive ? styles.optionItemActive : {}]}
                        onPress={() => {
                          setCollegeFilter(college);
                          setActiveCollegeFilter(college);
                          setShowCollegeDropdown(false);
                          setCollegeSearchQuery("");
                        }}
                      >
                        <Text style={[styles.optionText, isActive ? styles.optionTextActive : {}]}>
                          {college}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  
  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(10, 128, 153, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },

  searchCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 24 },
  searchTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  searchTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A', fontWeight: '500' },
  searchBtn: { backgroundColor: colors.purple[600], paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20, shadowColor: colors.purple[600], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  searchBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  skillsChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  skillChipActive: { backgroundColor: '#F1F5F9', borderColor: '#F1F5F9' },
  skillChipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  skillChipTextActive: { color: '#334155' },

  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  resultsTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  resultsActions: { flexDirection: 'row', gap: 8 },
  dropdownSmall: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  dropdownSmallText: { fontSize: 12, color: '#475569', fontWeight: '600' },

  candidatesList: { gap: 16 },
  candidateCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4, borderLeftColor: '#0A8099', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1, position: 'relative' },
  matchBadgeCapsule: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, position: 'absolute', top: 14, right: 14 },
  matchBadgeCapsuleText: { fontSize: 10, fontWeight: '800', color: '#059669' },
  candidateTop: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarCircleText: { fontSize: 16, fontWeight: '800' },
  candidateInfo: { flex: 1, paddingRight: 70 },
  candidateName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  candidateCollegeText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  skillTagCustom: { backgroundColor: '#E6F5F8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#BCE3EB' },
  skillTagCustomText: { fontSize: 10, fontWeight: '700', color: '#0A8099' },
  candidateActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 14 },
  inviteBtn: { flex: 1, backgroundColor: '#0A8099', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  inviteBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  ledgerBtn: { flex: 1, backgroundColor: '#F8FAFC', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  ledgerBtnText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  bookmarkBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  
  loadingWrapper: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B', fontWeight: '500' },
  errorWrapper: { paddingVertical: 30, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 14, color: '#EF4444', fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.purple[600], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  emptyContainer: { backgroundColor: '#FFF', borderRadius: 20, padding: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 10 },
  emptyText: { marginTop: 12, fontSize: 13, color: '#64748B', fontWeight: '500' },

  footerSpacer: { height: 40 },

  // College Dropdown specific styles
  dropdownTrigger: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14 
  },
  dropdownTriggerText: { 
    fontSize: 15, 
    color: '#0F172A', 
    fontWeight: '500', 
    flex: 1, 
    marginRight: 8 
  },
  dropdownPlaceholder: { 
    color: '#94A3B8' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    maxHeight: '80%', 
    minHeight: '50%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  modalTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#1E293B', 
    fontFamily: typography.fontFamily.display 
  },
  closeBtn: { 
    paddingVertical: 4, 
    paddingHorizontal: 8 
  },
  closeBtnText: { 
    color: colors.purple[600], 
    fontSize: 14, 
    fontWeight: '700' 
  },
  modalSearchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    margin: 16, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  modalSearchIcon: { 
    marginRight: 8 
  },
  modalSearchInput: { 
    flex: 1, 
    height: 44, 
    fontSize: 14, 
    color: '#0F172A', 
    fontWeight: '500' 
  },
  optionsList: { 
    flex: 1, 
    paddingHorizontal: 16, 
    marginBottom: 20 
  },
  optionItem: { 
    paddingVertical: 14, 
    paddingHorizontal: 12, 
    borderRadius: 10, 
    marginBottom: 4 
  },
  optionItemActive: { 
    backgroundColor: 'rgba(10, 128, 153, 0.08)' 
  },
  optionText: { 
    fontSize: 14, 
    color: '#475569', 
    fontWeight: '500' 
  },
  optionTextActive: { 
    color: colors.purple[600], 
    fontWeight: '700' 
  },
  modalLoading: { 
    paddingVertical: 40, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  modalLoadingText: { 
    marginTop: 10, 
    fontSize: 13, 
    color: '#64748B', 
    fontWeight: '500' 
  }
});
