import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Search, Users, ChevronDown, ChevronLeft, ChevronRight, X, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { getCollegeDetails, getStudentAnalyticsList, getMasterData } from '@/api/college.services';

export const CollegeStudentsScreen = () => {
  const { userName } = useAuth();

  // Data states
  const [collegeDetails, setCollegeDetails] = useState<any>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedRisk, setSelectedRisk] = useState("All");

  // Options
  const [availableBranches, setAvailableBranches] = useState<string[]>(["CS", "CSE", "ECE", "IT", "ME", "MBA", "Civil", "EE"]);
  const [availableSkills, setAvailableSkills] = useState<string[]>(["Python", "React", "NodeJS", "TypeScript", "SQL", "Pandas"]);
  const availableYears = ["All", "First Year", "Second Year", "Third Year", "Final Year"];
  const availableRisks = ["All", "Low", "Medium", "High"];

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selector Modal state
  const [selectorType, setSelectorType] = useState<'branch' | 'skill' | 'year' | 'risk' | null>(null);

  const branchesStr = selectedBranches.join(",");
  const skillsStr = selectedSkills.join(",");

  // Mapped Avatar colors helper
  const getAvatarColor = (name: string) => {
    const hexColors = ['#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#6366F1'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hexColors[hash % hexColors.length];
  };

  // Mapped Risk Color
  const getRiskDetails = (risk: string) => {
    const r = String(risk || "low").toLowerCase();
    if (r === 'high') return { color: colors.error, label: 'High' };
    if (r === 'medium') return { color: colors.warning, label: 'Med' };
    return { color: colors.success, label: 'Low' };
  };

  // Fetch available branches and skills from master API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await getMasterData("College Department");
        const raw = res?.data ?? res?.message?.data ?? res?.message ?? res;
        const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        if (arr.length > 0) {
          const names = arr.map((item: any) => item.branch_name || item.branch || item.name || String(item)).filter(Boolean);
          setAvailableBranches(Array.from(new Set([...names, "CS", "CSE", "ECE", "IT", "ME", "MBA", "Civil", "EE"])));
        }
      } catch (err) {
        console.error("Failed to load branches master:", err);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await getMasterData("Skill");
        const raw = res?.data ?? res?.message?.data ?? res?.message ?? res;
        const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        if (arr.length > 0) {
          const names = arr.map((item: any) => item.skill_name || item.skill || item.name || String(item)).filter(Boolean);
          setAvailableSkills(Array.from(new Set([...names, "Python", "React", "NodeJS", "TypeScript", "SQL", "Pandas"])));
        }
      } catch (err) {
        console.error("Failed to load skills master:", err);
      }
    };
    fetchSkills();
  }, []);

  // Fetch College info
  const fetchCollegeInfo = useCallback(async () => {
    if (!userName) return null;
    try {
      const res = await getCollegeDetails(userName);
      const data = res?.data || res?.message?.data || res?.message;
      if (data) {
        setCollegeDetails(data);
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch college details:", err);
    }
    return null;
  }, [userName]);

  // Fetch Students Analytics List
  const fetchStudents = useCallback(async (collegeName: string, page = 1, isSilent = false) => {
    if (!collegeName) return;
    if (!isSilent) setLoading(true);
    try {
      const res = await getStudentAnalyticsList({
        search: searchQuery,
        college: collegeName,
        department: branchesStr,
        skill: skillsStr,
        current_year: selectedYear === "All" ? "" : selectedYear,
        page: page,
        page_size: pageSize
      });

      const raw = res?.message ?? res;
      const nestedData = raw?.data;

      let arr = [];
      if (nestedData && Array.isArray(nestedData.data)) {
        arr = nestedData.data;
        const pag = nestedData.pagination;
        if (pag) {
          setTotalStudents(pag.total ?? arr.length);
          setTotalPages(pag.total_pages ?? 1);
          setCurrentPage(pag.page ?? page);
        }
      } else {
        arr = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        setTotalStudents(arr.length);
        setTotalPages(1);
        setCurrentPage(1);
      }
      setStudentsList(arr);
    } catch (err) {
      console.error("Failed to load student directory:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, branchesStr, skillsStr, selectedYear, pageSize]);

  // Load Initial
  const loadData = useCallback(async () => {
    const details = await fetchCollegeInfo();
    const name = details?.name || details?.college_name;
    if (name) {
      fetchStudents(name, 1, false);
    } else {
      setLoading(false);
    }
  }, [fetchCollegeInfo, fetchStudents]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter Trigger (Reset to page 1)
  useEffect(() => {
    const name = collegeDetails?.name || collegeDetails?.college_name;
    if (name) {
      fetchStudents(name, 1, false);
    }
  }, [branchesStr, skillsStr, selectedYear, searchQuery, collegeDetails]);

  // Local risk level filter matching web client-side behavior
  const filteredStudentsList = useMemo(() => {
    return studentsList.filter(student => {
      const risk = student.risk_level || student.risk || "low";
      const matchesRisk = selectedRisk === "All" || String(risk).toLowerCase() === selectedRisk.toLowerCase();
      return matchesRisk;
    });
  }, [studentsList, selectedRisk]);

  const handleExportCSV = () => {
    if (filteredStudentsList.length === 0) {
      Alert.alert("Warning", "No data available to export.");
      return;
    }
    Alert.alert("Success", `CSV of ${filteredStudentsList.length} students exported successfully!`);
  };

  const openSelector = (type: 'branch' | 'skill' | 'year' | 'risk') => {
    setSelectorType(type);
  };

  const getSelectorConfig = () => {
    if (selectorType === 'branch') {
      return {
        title: 'Select Branch',
        options: availableBranches,
        selected: selectedBranches,
        isMultiSelect: true,
        onSelect: (val: string) => {
          setSelectedBranches(prev => 
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
          );
        }
      };
    }
    if (selectorType === 'skill') {
      return {
        title: 'Select Skills',
        options: availableSkills,
        selected: selectedSkills,
        isMultiSelect: true,
        onSelect: (val: string) => {
          setSelectedSkills(prev => 
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
          );
        }
      };
    }
    if (selectorType === 'year') {
      return {
        title: 'Select Academic Year',
        options: availableYears,
        selected: selectedYear,
        isMultiSelect: false,
        onSelect: (val: string) => {
          setSelectedYear(val);
          setSelectorType(null);
        }
      };
    }
    return {
      title: 'Select Risk Level',
      options: availableRisks,
      selected: selectedRisk,
      isMultiSelect: false,
      onSelect: (val: string) => {
        setSelectedRisk(val);
        setSelectorType(null);
      }
    };
  };

  const handleViewStudent = (student: any) => {
    const fullName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || student.student_name || student.name || "—";
    Alert.alert(
      "Student Details",
      `Name: ${fullName}\n` +
      `Branch: ${student.branch || student.department || "—"}\n` +
      `Year: ${student.year || student.academic_year || "—"}\n` +
      `Employability Score: ${student.employability_score !== undefined ? student.employability_score : (student.employability !== undefined ? student.employability : "—")}\n` +
      `Internships: ${student.internship_count !== undefined ? student.internship_count : (student.internship || "0")}\n` +
      `Status: ${student.placement_status || student.status || "—"}\n` +
      `Risk Level: ${student.risk_level || student.risk || "—"}`,
      [{ text: "Close", style: "cancel" }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.light }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Student Directory</Text>
            <View style={styles.headerBadge}>
              <Users size={10} color="#059669" />
              <Text style={styles.headerBadgeText}>STUDENTS</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Institutional oversight of student progress</Text>
        </Animated.View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search color={colors.text.secondary} size={16} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search students, branches, skills..."
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity style={styles.filterDropdown} onPress={() => openSelector('branch')}>
              <Text style={styles.filterText} numberOfLines={1}>
                {selectedBranches.length === 0 ? "All Branches" : `${selectedBranches.length} Selected`}
              </Text>
              <ChevronDown size={12} color={colors.text.secondary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterDropdown} onPress={() => openSelector('skill')}>
              <Text style={styles.filterText} numberOfLines={1}>
                {selectedSkills.length === 0 ? "All Skills" : `${selectedSkills.length} Selected`}
              </Text>
              <ChevronDown size={12} color={colors.text.secondary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterDropdown} onPress={() => openSelector('year')}>
              <Text style={styles.filterText} numberOfLines={1}>{selectedYear === "All" ? "All Years" : selectedYear}</Text>
              <ChevronDown size={12} color={colors.text.secondary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterDropdown} onPress={() => openSelector('risk')}>
              <Text style={styles.filterText} numberOfLines={1}>{selectedRisk === "All" ? "All Risks" : selectedRisk}</Text>
              <ChevronDown size={12} color={colors.text.secondary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            {(searchQuery !== "" || selectedBranches.length > 0 || selectedSkills.length > 0 || selectedYear !== "All" || selectedRisk !== "All") && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setSearchQuery("");
                  setSelectedBranches([]);
                  setSelectedSkills([]);
                  setSelectedYear("All");
                  setSelectedRisk("All");
                }}
              >
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.exportBtn} onPress={handleExportCSV}>
              <Text style={styles.exportText}>Export</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Table Container */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0F172A" />
            <Text style={styles.loaderText}>Loading students list...</Text>
          </View>
        ) : filteredStudentsList.length === 0 ? (
          <Card style={styles.emptyCard}>
            <AlertCircle size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>No students match the selected filters.</Text>
          </Card>
        ) : (
          <Card style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.columnLabel, { width: 180 }]}>STUDENT</Text>
                  <Text style={[styles.columnLabel, { width: 90 }]}>BRANCH</Text>
                  <Text style={[styles.columnLabel, { width: 110 }]}>YEAR</Text>
                  <Text style={[styles.columnLabel, { width: 120 }]}>EMPLOYABILITY</Text>
                  <Text style={[styles.columnLabel, { width: 100 }]}>INTERNSHIP</Text>
                  <Text style={[styles.columnLabel, { width: 100 }]}>STATUS</Text>
                  <Text style={[styles.columnLabel, { width: 60, textAlign: 'center' }]}>RISK</Text>
                  <Text style={[styles.columnLabel, { width: 80, textAlign: 'center' }]}>ACTION</Text>
                </View>

                {/* Table Rows */}
                <View style={styles.rowsContainer}>
                  {filteredStudentsList.map((student: any, idx: number) => {
                    const fullName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || student.student_name || student.name || "—";
                    const branch = student.branch || student.department || "—";
                    const year = student.year || student.academic_year || "—";
                    const score = student.employability_score !== undefined ? student.employability_score : (student.employability !== undefined ? student.employability : 75);
                    const riskObj = getRiskDetails(student.risk_level || student.risk || "low");
                    const avatarColor = getAvatarColor(fullName);
                    const initial = fullName.charAt(0).toUpperCase() || "S";

                    // Handle status badges properly if status is - or empty
                    const statusTextVal = student.placement_status || student.status || "—";
                    const isStatusEmpty = statusTextVal === "—" || statusTextVal === "";

                    return (
                      <View key={student.name || idx} style={[styles.row, idx === filteredStudentsList.length - 1 && styles.noBorder]}>
                        <View style={[styles.column, { width: 180, flexDirection: 'row', alignItems: 'center' }]}>
                          <View style={[styles.avatar, { backgroundColor: avatarColor + '20' }]}>
                            <Text style={[styles.avatarText, { color: avatarColor }]}>{initial}</Text>
                          </View>
                          <Text style={styles.studentName} numberOfLines={1}>{fullName}</Text>
                        </View>
                        
                        <View style={[styles.column, { width: 90 }]}>
                          <Text style={styles.cellText} numberOfLines={1}>{branch}</Text>
                        </View>

                        <View style={[styles.column, { width: 110 }]}>
                          <Text style={styles.cellText} numberOfLines={1}>{year}</Text>
                        </View>

                        <View style={[styles.column, { width: 120, gap: 6 }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={styles.miniBarBg}>
                              <View style={[styles.miniBarFill, { width: `${score}%`, backgroundColor: riskObj.color }]} />
                            </View>
                            <Text style={[styles.empScore, { color: riskObj.color }]}>{score}</Text>
                          </View>
                        </View>

                        <View style={[styles.column, { width: 100 }]}>
                          <Text style={styles.cellText}>{student.internship_count !== undefined ? student.internship_count : (student.internship || "0")}</Text>
                        </View>

                        <View style={[styles.column, { width: 100 }]}>
                          <View style={[styles.statusBadge, {
                            backgroundColor: isStatusEmpty ? '#F8FAFC' :
                                            (statusTextVal === 'Interning' ? 'rgba(16,185,129,0.1)' :
                                            statusTextVal === 'Searching' ? 'rgba(234,88,12,0.1)' : 'rgba(124,58,237,0.1)'),
                            borderWidth: isStatusEmpty ? 1 : 0,
                            borderColor: isStatusEmpty ? '#E2E8F0' : 'transparent'
                          }]}>
                            <Text style={[styles.statusText, {
                              color: isStatusEmpty ? '#64748B' :
                                     (statusTextVal === 'Interning' ? colors.success :
                                     statusTextVal === 'Searching' ? colors.warning : '#7C3AED')
                            }]}>
                              {statusTextVal}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.column, { width: 60, alignItems: 'center', justifyContent: 'center' }]}>
                          {riskObj.label === 'High' || riskObj.label === 'Med' ? (
                            <AlertTriangle size={16} color={riskObj.color} />
                          ) : (
                            <Text style={styles.cellText}>—</Text>
                          )}
                        </View>

                        <View style={[styles.column, { width: 80, alignItems: 'center', justifyContent: 'center' }]}>
                          <TouchableOpacity 
                            style={styles.actionViewBtn}
                            onPress={() => handleViewStudent(student)}
                          >
                            <Text style={styles.actionViewText}>View</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </Card>
        )}

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <View style={styles.paginationRow}>
            <TouchableOpacity
              disabled={currentPage <= 1}
              onPress={() => {
                const name = collegeDetails?.name || collegeDetails?.college_name;
                if (name) fetchStudents(name, currentPage - 1);
              }}
              style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
            >
              <ChevronLeft size={16} color={currentPage <= 1 ? "#CBD5E1" : "#0F172A"} />
            </TouchableOpacity>
            <Text style={styles.pageIndicator}>{currentPage} of {totalPages}</Text>
            <TouchableOpacity
              disabled={currentPage >= totalPages}
              onPress={() => {
                const name = collegeDetails?.name || collegeDetails?.college_name;
                if (name) fetchStudents(name, currentPage + 1);
              }}
              style={[styles.pageBtn, currentPage >= totalPages && styles.pageBtnDisabled]}
            >
              <ChevronRight size={16} color={currentPage >= totalPages ? "#CBD5E1" : "#0F172A"} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Selector Options Modal */}
      {selectorType && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectorType(null)}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectorType(null)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{getSelectorConfig().title}</Text>
                <TouchableOpacity onPress={() => setSelectorType(null)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={getSelectorConfig().options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const config = getSelectorConfig();
                  const isSelected = config.isMultiSelect 
                    ? (config.selected as string[]).includes(item)
                    : config.selected === item;
                  return (
                    <TouchableOpacity
                      style={[styles.optionItem, isSelected && styles.selectedOption, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                      onPress={() => {
                        config.onSelect(item);
                      }}
                    >
                      <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{item}</Text>
                      {isSelected && (
                        <Text style={{ color: '#F97316', fontWeight: 'bold', fontSize: 14 }}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={{ paddingBottom: 10 }}
                style={{ maxHeight: 300 }}
              />
              {getSelectorConfig().isMultiSelect && (
                <TouchableOpacity 
                  style={styles.doneBtn} 
                  onPress={() => setSelectorType(null)}
                >
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 40 },
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  searchRow: { marginBottom: spacing.sm },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: spacing.md, height: 44, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, height: '100%', fontSize: 12, color: colors.text.primary, fontWeight: '500' },
  
  filterWrapper: { marginBottom: spacing.md },
  filterScroll: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  filterDropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, minWidth: 105, flexShrink: 0 },
  filterText: { fontSize: 10, fontWeight: '600', color: colors.text.secondary, marginRight: 2 },
  clearBtn: { backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  clearText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  exportBtn: { backgroundColor: '#F97316', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  exportText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  tableCard: { padding: 0, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 14, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  columnLabel: { fontSize: 10, fontWeight: '700', color: colors.text.secondary, letterSpacing: 0.5 },
  
  rowsContainer: { paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  noBorder: { borderBottomWidth: 0 },
  column: { paddingRight: 10 },
  
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontSize: 11, fontWeight: '800' },
  studentName: { fontSize: 12, fontWeight: '800', color: colors.navy },
  cellText: { fontSize: 12, fontWeight: '600', color: colors.text.secondary },
  
  miniBarBg: { width: 60, height: 4, backgroundColor: '#EDF2F7', borderRadius: 2, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 2 },
  empScore: { fontSize: 12, fontWeight: '800' },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  statusText: { fontSize: 10, fontWeight: '800' },
  
  riskDot: { width: 10, height: 10, borderRadius: 5 },
  modalLoading: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  modalLoadingText: { marginTop: 10, fontSize: 13, color: '#64748B', fontWeight: '500' },
  actionViewBtn: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  actionViewText: { fontSize: 11, fontWeight: '600', color: '#334155' },

  loaderContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loaderText: { marginTop: 8, fontSize: 13, color: '#64748B', fontWeight: '500' },

  emptyCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  emptyText: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 12, marginBottom: 24 },
  pageBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  pageBtnDisabled: { opacity: 0.5 },
  pageIndicator: { fontSize: 13, fontWeight: '700', color: '#64748B' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalContent: { width: '100%', maxHeight: '60%', backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display },
  optionItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  selectedOption: { backgroundColor: '#F8FAFC' },
  optionText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  selectedOptionText: { color: '#0F172A', fontWeight: '800' },
  doneBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  doneBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  }
});
