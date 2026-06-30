import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Modal,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Briefcase, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  TrendingUp,
  X,
  Target,
  Trophy,
  Info,
  ArrowRight
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useAuth } from '@/context/AuthContext';
import { 
  getStudentProjectList, 
  createStudentProjectEnrollment, 
  getStudentByEmail 
} from '@/api/student.services';

export const StudentProjectsScreen = () => {
  const { userName } = useAuth();
  
  // Data list
  const [projects, setProjects] = useState<any[]>([]);
  
  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  
  // Details Modal
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Cached student profile info
  const [studentProfile, setStudentProfile] = useState<any>(null);

  // Fetch student profile details (course, department, etc.) to use as query filters
  const fetchStudentProfile = async () => {
    if (!userName) return null;
    try {
      const response = await getStudentByEmail(userName);
      const profile = response?.message?.data || response?.data || response || {};
      setStudentProfile(profile);
      return profile;
    } catch (err) {
      console.error("Error fetching student profile:", err);
      return null;
    }
  };

  // Fetch Projects list
  const fetchProjectsData = async (profileData?: any) => {
    try {
      const profile = profileData || studentProfile || {};
      const response = await getStudentProjectList(
        userName || undefined,
        profile.course || null,
        profile.department || null,
        profile.current_year || profile.academic_year || null
      );
      const data = response?.message?.data?.projects || response?.data?.projects || response?.message?.data || response?.data || response || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // Load all data
  const loadData = useCallback(async (showIndicator = true) => {
    if (showIndicator) setLoading(true);
    
    // First retrieve the profile so we get course/dept filters
    const profile = await fetchStudentProfile();
    
    // Fetch lists
    await fetchProjectsData(profile);
    
    setLoading(false);
  }, [userName]);

  useEffect(() => {
    loadData();
  }, [userName]);

  const onRefresh = async () => {
    setRefreshing(true);
    const profile = await fetchStudentProfile();
    await fetchProjectsData(profile);
    setRefreshing(false);
  };

  // Enroll in Project handler
  const handleEnrollProject = async (project: any) => {
    if (!userName) {
      Alert.alert("Authentication Required", "Please log in to enroll.");
      return;
    }

    try {
      setApplying(project.name);
      const payload = {
        student: userName,
        project: project.name,
        industry: project.industry || "",
        status: "Applied",
        applied_on: new Date().toISOString().slice(0, 19).replace("T", " "),
        resume: null,
        match_score: 0.0,
        notes: "Enrolled from Student Dashboard",
      };

      const response = await createStudentProjectEnrollment(payload);

      if (response && (response.status === 200 || response.status === "200" || response.message?.status === 200)) {
        Alert.alert("Success", `Successfully applied/enrolled in ${project.project_name || 'the project'}!`);
        loadData(false);
      } else {
        Alert.alert("Error", response?.message || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.error("Enrollment error:", err);
      Alert.alert("Error", err?.message || "Something went wrong. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  const projectStats = useMemo(() => [
    { id: 1, title: "AVAILABLE", value: projects.length, icon: Briefcase, color: colors.accent.DEFAULT },
    { id: 2, title: "APPLIED", value: projects.filter(p => p.applied_status && p.applied_status !== "Not Applied").length, icon: Target, color: "#3B82F6" },
    { id: 3, title: "COMPLETED", value: projects.filter(p => p.status === "Completed").length, icon: CheckCircle2, color: "#10B981" },
    { id: 4, title: "CREDITS", value: 0, icon: Trophy, color: "#8B5CF6" },
  ], [projects]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        <Text style={styles.loadingText}>Fetching projects...</Text>
      </SafeAreaView>
    );
  }

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
            <Briefcase size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>INDUSTRY RESEARCH & DEV</Text>
          </View>
          <Text style={styles.title}>Industrial Projects</Text>
          <Text style={styles.subtitle}>Contribute to industry-level codebases</Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInRight.delay(200)} style={styles.statsRow}>
          {projectStats.map((stat) => (
            <StatsCard 
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </Animated.View>

        {/* Matching Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleSimple}>Open Projects</Text>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <TrendingUp size={14} color="#64748B" />
            <Text style={styles.filterText}>Relevance</Text>
          </TouchableOpacity>
        </View>

        {/* Listings */}
        <View style={styles.listContainer}>
          {projects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Briefcase size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No matching projects found.</Text>
            </View>
          ) : (
            projects.map((project, index) => {
              const isClosed = project.status?.toLowerCase() === 'disabled' || project.status?.toLowerCase() === 'disable';
              const hasApplied = project.applied_status && project.applied_status !== "Not Applied";
              const isCurrentApplying = applying === project.name;

              return (
                <Animated.View 
                  key={project.name || index} 
                  entering={FadeInUp.delay(300 + index * 100)}
                  style={styles.projectCard}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.companyInfo}>
                      <View style={[styles.companyLogo, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                        <Briefcase size={20} color="#2563EB" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle} numberOfLines={1}>
                          {project.project_name ? project.project_name.trim() : "Project Name"}
                        </Text>
                        <Text style={styles.companyName} numberOfLines={1}>
                          {project.industry || "Industry Partner"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statusBadgesRow}>
                    {isClosed ? (
                      <View style={[styles.statusTag, styles.statusClosed]}>
                        <Text style={styles.statusTagTextClosed}>Disabled</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusTag, styles.statusActive]}>
                        <Text style={styles.statusTagTextActive}>Active</Text>
                      </View>
                    )}
                    
                    {hasApplied && (
                      <View style={[styles.statusTag, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                        <Text style={[styles.statusTagTextActive, { color: '#2563EB' }]}>
                          {project.applied_status}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.projectDesc} numberOfLines={2}>
                    {project.description || "Contribute to real-world industrial projects and build your portfolio."}
                  </Text>

                  <View style={styles.badgeRow}>
                    <View style={styles.infoBadge}>
                      <Clock size={10} color="#64748B" />
                      <Text style={styles.badgeText}>{project.duration} Days</Text>
                    </View>
                    <View style={styles.infoBadge}>
                      <Calendar size={10} color="#64748B" />
                      <Text style={styles.badgeText}>
                        Deadline: {project.application_deadline ? project.application_deadline.split("-").reverse().join("/") : "Open"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={[
                        styles.applyButton,
                        (isClosed || hasApplied) && styles.disabledButton,
                        isCurrentApplying && styles.disabledButton
                      ]}
                      disabled={isClosed || hasApplied || isCurrentApplying}
                      activeOpacity={0.7}
                      onPress={() => handleEnrollProject(project)}
                    >
                      {isCurrentApplying ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.applyButtonText}>
                          {hasApplied ? 'Applied' : isClosed ? 'Disabled' : 'Apply Now'}
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.detailsButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedProject(project);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Text style={styles.detailsButtonText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })
          )}
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Details modal */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={showDetailsModal} 
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <View style={styles.modalIconBox}>
                  <Briefcase size={22} color="#fff" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.modalTitleText} numberOfLines={1}>
                    {selectedProject?.project_name || 'Project Details'}
                  </Text>
                  <Text style={styles.modalSubtitleText} numberOfLines={1}>
                    {selectedProject?.industry || 'Industry Partner'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setShowDetailsModal(false)} 
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Scrollable details content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.detailsContentContainer}>
                
                {/* Meta details list */}
                <Text style={styles.modalSectionLabel}>Overview Details</Text>
                <View style={styles.metaBoxContainer}>
                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconWrap, { backgroundColor: '#EFF6FF' }]}>
                      <Clock size={16} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.metaLabelText}>DURATION</Text>
                      <Text style={styles.metaValText}>{selectedProject?.duration} Days</Text>
                    </View>
                  </View>

                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconWrap, { backgroundColor: '#FFFBEB' }]}>
                      <Calendar size={16} color="#D97706" />
                    </View>
                    <View>
                      <Text style={styles.metaLabelText}>APPLICATION DEADLINE</Text>
                      <Text style={styles.metaValText}>
                        {selectedProject?.application_deadline ? selectedProject.application_deadline.split("-").reverse().join("/") : 'Open'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconWrap, { backgroundColor: '#F5F3FF' }]}>
                      <Calendar size={16} color="#7C3AED" />
                    </View>
                    <View>
                      <Text style={styles.metaLabelText}>PROJECT PERIOD</Text>
                      <Text style={styles.metaValText}>
                        {selectedProject?.start_date ? selectedProject.start_date.split("-").reverse().join("/") : 'TBA'} — {selectedProject?.end_date ? selectedProject.end_date.split("-").reverse().join("/") : 'TBA'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* About description */}
                <Text style={styles.modalSectionLabel}>About</Text>
                <View style={styles.descCard}>
                  <Text style={styles.descCardText}>
                    {selectedProject?.description || "Contribute to real-world industrial projects and build your portfolio with top industry mentors."}
                  </Text>
                </View>

                {/* Eligibility requirements */}
                <Text style={styles.modalSectionLabel}>Eligibility & Openings</Text>
                <View style={styles.metaGrid}>
                  <View style={styles.gridCard}>
                    <Text style={styles.metaLabelText}>ELIGIBILITY</Text>
                    <Text style={styles.gridValText}>
                      {selectedProject?.eligibility || "Open to all relevant backgrounds."}
                    </Text>
                  </View>
                  <View style={styles.gridCard}>
                    <Text style={styles.metaLabelText}>OPENINGS</Text>
                    <Text style={styles.gridValText}>
                      {selectedProject?.openings || 1} candidates
                    </Text>
                  </View>
                </View>

                {/* Skills requirement */}
                {selectedProject?.skills && Array.isArray(selectedProject.skills) && selectedProject.skills.length > 0 && (
                  <>
                    <Text style={styles.modalSectionLabel}>Skills Required</Text>
                    <View style={styles.skillsTagRow}>
                      {selectedProject.skills.map((s: any, sIdx: number) => (
                        <View key={sIdx} style={styles.skillBadgeBox}>
                          <Text style={styles.skillBadgeText}>{s.skill}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </ScrollView>

            {/* Footer action buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setShowDetailsModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                activeOpacity={0.7}
                disabled={selectedProject?.status?.toLowerCase() === 'disabled' || selectedProject?.status?.toLowerCase() === 'disable' || (selectedProject?.applied_status && selectedProject.applied_status !== "Not Applied")}
                onPress={() => {
                  handleEnrollProject(selectedProject);
                  setShowDetailsModal(false);
                }}
                style={[
                  styles.modalApplyBtn,
                  (selectedProject?.status?.toLowerCase() === 'disabled' || selectedProject?.status?.toLowerCase() === 'disable' || (selectedProject?.applied_status && selectedProject.applied_status !== "Not Applied")) && styles.disabledButton
                ]}
              >
                <Text style={styles.modalApplyBtnText}>
                  {selectedProject?.applied_status && selectedProject.applied_status !== "Not Applied" ? 'Applied' : 'Apply Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 12,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleSimple: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  listContainer: {
    gap: 16,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    borderRadius: 24,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  statusBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statusTag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  statusTagTextActive: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
  },
  statusClosed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  statusTagTextClosed: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  projectDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.accent.DEFAULT,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  footerSpacer: {
    height: 40,
  },
  // Modal layout
  modalOverlay: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
  },
  modalScroll: {
    paddingBottom: 40,
  },
  detailsContentContainer: {
    padding: 20,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  metaBoxContainer: {
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabelText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metaValText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  descCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descCardText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 18,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridValText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadgeBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalApplyBtn: {
    flex: 2,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalApplyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
