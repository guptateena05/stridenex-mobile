import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  RefreshControl,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import {
  MapPin,
  Clock,
  Zap,
  UserCheck,
  PhoneCall,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  LayoutDashboard,
  Target,
  X,
  ChevronDown,
  Briefcase,
  ChevronRight,
  FileText,
  Trophy
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useIndustry } from '@/context/IndustryContext';
import { getProjectApplicationList, getStudentByEmail, updateProjectApplicationStatus } from '@/api/industry.services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const pipelineColumns = [
  { id: "Applied", title: "Applied", color: '#1E293B', icon: FileText },
  { id: "Shortlisted", title: "Shortlisted", color: '#3B82F6', icon: UserCheck },
  { id: "Interview Scheduled", title: "Interview Scheduled", color: '#F97316', icon: PhoneCall },
  { id: "Rejected", title: "Rejected", color: '#EF4444', icon: XCircle },
  { id: "Selected", title: "Selected", color: '#10B981', icon: CheckCircle2 },
  { id: "Awarded", title: "Awarded", color: '#8B5CF6', icon: Trophy }
];

interface ProjectCandidate {
  id: string;
  name: string;
  student: string;
  project: string;
  status: string;
  applied_on: string;
  resume: string;
  initials: string;
  bgColor: string;
}

export const IndustryProjectPipelineScreen = ({ route, navigation }: any) => {
  const { industryData } = useIndustry();
  const projectParams = route?.params?.project;

  const [activeTab, setActiveTab] = useState("Applied");
  const [candidates, setCandidates] = useState<Record<string, ProjectCandidate[]>>({
    "Applied": [],
    "Shortlisted": [],
    "Interview Scheduled": [],
    "Rejected": [],
    "Selected": [],
    "Awarded": []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ProjectCandidate | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);

  const companyName = industryData?.company_name || industryData?.name || "";
  const projectFilter = projectParams?.name || projectParams?.project_name;
  const projectTitle = projectParams?.project_name || projectParams?.name;
  const tabScrollRef = useRef<ScrollView>(null);

  const fetchApplications = useCallback(async (name: string, projName?: string) => {
    try {
      if (!refreshing) setLoading(true);
      const response = await getProjectApplicationList(name, projName);

      const apiData = response?.message?.data || response?.data || [];

      if (Array.isArray(apiData)) {
        const newCandidates: Record<string, ProjectCandidate[]> = {
          "Applied": [],
          "Shortlisted": [],
          "Interview Scheduled": [],
          "Rejected": [],
          "Selected": [],
          "Awarded": []
        };

        apiData.forEach((app: any) => {
          const email = app.student || "Student";
          const initials = email.charAt(0).toUpperCase();
          const bgColors = ['#EF4444', '#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#8B5CF6'];
          const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];

          const candidate: ProjectCandidate = {
            id: app.name || Math.random().toString(),
            name: app.student_name || email.split('@')[0],
            student: app.student,
            project: app.project || "Unknown",
            status: app.status || "Applied",
            applied_on: app.applied_on ? new Date(app.applied_on).toLocaleDateString() : "N/A",
            resume: app.resume || "",
            initials: initials,
            bgColor: randomColor
          };

          if (newCandidates[candidate.status]) {
            newCandidates[candidate.status].push(candidate);
          } else {
            newCandidates["Applied"].push(candidate);
          }
        });

        setCandidates(newCandidates);
      }
    } catch (err: any) {
      console.error("Error fetching project applications:", err);
      // Handle 404 No Data Found gracefully
      if (err?.status === 404 || err?.message?.includes("404")) {
        setCandidates({
          "Applied": [],
          "Shortlisted": [],
          "Interview Scheduled": [],
          "Rejected": [],
          "Selected": [],
          "Awarded": []
        });
      } else {
        Alert.alert("Error", "Failed to fetch project applications");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (companyName && projectFilter) {
      fetchApplications(companyName, projectFilter);
    }
  }, [companyName, projectFilter, fetchApplications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications(companyName, projectFilter);
  };

  const handleCardClick = async (candidate: ProjectCandidate) => {
    setSelectedCandidate(candidate);
    setSelectedStatus(candidate.status);
    setIsModalOpen(true);
    setLoadingDetails(true);
    setStudentDetails(null);
    try {
      const response = await getStudentByEmail(candidate.student);
      const data = response?.message?.data || response?.data || response;
      if (data) {
        setStudentDetails(data);
      }
    } catch (err) {
      console.error("Failed to fetch student details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedCandidate) return;
    try {
      setUpdateStatusLoading(true);
      await updateProjectApplicationStatus({
        name: selectedCandidate.id,
        industry: companyName,
        status: selectedStatus
      });
      await fetchApplications(companyName, projectFilter);
      setSelectedCandidate(prev => prev ? { ...prev, status: selectedStatus } : null);
      Alert.alert("Success", `Status updated to ${selectedStatus}`);
      setIsModalOpen(false);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update status");
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  const formatAppliedDate = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(date.getTime())) return dateStr;

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${day} ${hours}:${minutes}:${seconds}-${month}-${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const openResume = (url: string) => {
    if (!url) return;
    Linking.openURL(url).catch(err => Alert.alert("Error", "Cannot open resume link"));
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple[600]} />
        <Text style={styles.loadingText}>SYNCING PROJECT PIPELINE...</Text>
      </View>
    );
  }

  const activeColor = pipelineColumns.find(c => c.id === activeTab)?.color || colors.purple[600];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Projects')} style={styles.backButton}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>Project Pipeline</Text>
          <View style={styles.headerBadge}>
            <Briefcase size={10} color={colors.purple[600]} />
            <Text style={styles.headerBadgeText}>R&D WORKFLOW</Text>
          </View>
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>{projectTitle || "All Projects"}</Text>
      </View>

      {/* Custom Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {pipelineColumns.map((col) => {
            const isActive = activeTab === col.id;
            return (
              <TouchableOpacity
                key={col.id}
                onPress={() => setActiveTab(col.id)}
                style={[
                  styles.tabItem,
                  isActive && { backgroundColor: `${col.color}15`, borderColor: col.color }
                ]}
              >
                <View style={[styles.tabDot, { backgroundColor: col.color }]} />
                <Text style={[
                  styles.tabText,
                  isActive && { color: col.color, fontWeight: '800' }
                ]}>{col.title}</Text>
                <View style={[
                  styles.tabCountBadge,
                  { backgroundColor: isActive ? col.color : '#E2E8F0' }
                ]}>
                  <Text style={[
                    styles.tabCountText,
                    { color: isActive ? '#FFF' : '#64748B' }
                  ]}>{candidates[col.id]?.length || 0}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content */}
      <Animated.ScrollView
        key={activeTab}
        entering={FadeInRight.duration(300)}
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColor} />
        }
      >
        <View style={styles.stageHero}>
          <View style={[styles.heroIconBox, { backgroundColor: `${activeColor}10` }]}>
            {React.createElement(pipelineColumns.find(c => c.id === activeTab)!.icon, { size: 24, color: activeColor })}
          </View>
          <View>
            <Text style={[styles.heroTitle, { color: activeColor }]}>{activeTab}</Text>
            <Text style={styles.heroSubtitle}>{candidates[activeTab]?.length || 0} applications in this stage</Text>
          </View>
        </View>

        <View style={styles.cardsList}>
          {candidates[activeTab]?.length > 0 ? (
            candidates[activeTab].map((candidate, cIdx) => (
              <Animated.View
                key={candidate.id}
                entering={FadeInUp.delay(cIdx * 50)}
              >
                <TouchableOpacity
                  style={styles.candidateCard}
                  onPress={() => handleCardClick(candidate)}
                >
                  <View style={styles.cardMain}>
                    <View style={[styles.avatar, { backgroundColor: candidate.bgColor }]}>
                      <Text style={styles.avatarText}>{candidate.initials}</Text>
                    </View>
                    <View style={styles.candidateInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.candidateName} numberOfLines={1}>{candidate.student}</Text>
                      </View>
                      <Text style={styles.projectText} numberOfLines={1}>Project: {candidate.project}</Text>
                    </View>
                    <ChevronRight size={18} color="#CBD5E1" />
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                      <Clock size={12} color="#64748B" />
                      <Text style={styles.footerText}>Applied on {candidate.applied_on}</Text>
                    </View>
                    {candidate.resume ? (
                      <View style={styles.resumeBadge}>
                        <FileText size={10} color="#3B82F6" />
                        <Text style={styles.resumeText}>Resume Attached</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Briefcase size={32} color="#E2E8F0" />
              </View>
              <Text style={styles.emptyStateTitle}>No Applications Yet</Text>
              <Text style={styles.emptyStateText}>Students applying for the project will appear here.</Text>
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Student Details Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <View style={[styles.modalAvatar, { backgroundColor: selectedCandidate?.bgColor || colors.purple[600] }]}>
                  <Text style={styles.modalAvatarText}>{selectedCandidate?.initials || "S"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>{selectedCandidate?.student || "Student Details"}</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>{selectedCandidate?.project || "Application Record"}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.detailsList}>
                <View style={styles.detailsCard}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>STUDENT</Text>
                    <Text style={styles.detailValue}>{selectedCandidate?.student || "N/A"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>PROJECT</Text>
                    <Text style={styles.detailValue}>{selectedCandidate?.project || "N/A"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>APPLIED ON</Text>
                    <Text style={styles.detailValue}>{formatAppliedDate(selectedCandidate?.applied_on || "")}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>RESUME</Text>
                    {selectedCandidate?.resume ? (
                      <TouchableOpacity onPress={() => openResume(selectedCandidate.resume)}>
                        <Text style={[styles.detailValue, { color: '#3B82F6' }]}>View Resume</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={[styles.detailValue, { color: '#94A3B8' }]}>Not provided</Text>
                    )}
                  </View>
                </View>

                <View style={styles.updateStatusSection}>
                  <View style={styles.sectionHeader}>
                    <Target size={16} color="#3B82F6" />
                    <Text style={styles.sectionHeaderText}>UPDATE PIPELINE STATUS</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.pickerTrigger}
                    onPress={() => setIsStatusPickerOpen(true)}
                  >
                    <Zap size={16} color="#64748B" />
                    <Text style={styles.pickerTriggerText}>{selectedStatus}</Text>
                    <ChevronDown size={16} color="#64748B" />
                  </TouchableOpacity>

                  {selectedStatus !== selectedCandidate?.status && (
                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={handleChangeStatus}
                      disabled={updateStatusLoading}
                    >
                      {updateStatusLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.confirmBtnText}>Confirm Status Change</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Status Picker Modal */}
      <Modal
        visible={isStatusPickerOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsStatusPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setIsStatusPickerOpen(false)}
        >
          <View style={styles.pickerContent}>
            <Text style={styles.pickerHeader}>Select Project Status</Text>
            {pipelineColumns.map((col) => (
              <TouchableOpacity
                key={col.id}
                style={[
                  styles.pickerItem,
                  selectedStatus === col.id && styles.pickerItemActive
                ]}
                onPress={() => {
                  setSelectedStatus(col.id);
                  setIsStatusPickerOpen(false);
                }}
              >
                <Text style={[
                  styles.pickerItemText,
                  selectedStatus === col.id && styles.pickerItemTextActive
                ]}>{col.title}</Text>
                {selectedStatus === col.id && <CheckCircle2 size={16} color={colors.purple[600]} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { marginTop: 12, fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1 },

  header: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  backButton: { marginRight: 12, padding: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(59, 130, 246, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 'auto' },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#3B82F6', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', flex: 1 },
  subtitle: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  tabsContainer: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#F8FAFC' },
  tabDot: { width: 6, height: 6, borderRadius: 3 },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tabCountBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tabCountText: { fontSize: 10, fontWeight: '800' },

  mainContent: { flex: 1 },
  stageHero: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, backgroundColor: '#FFF', marginBottom: 8 },
  heroIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 20, fontWeight: '800' },
  heroSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },

  cardsList: { padding: 16, gap: 16 },
  candidateCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  candidateInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  candidateName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  projectText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  resumeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#DBEAFE' },
  resumeText: { fontSize: 10, fontWeight: '700', color: '#3B82F6' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyStateTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '92%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, backgroundColor: '#101828' },
  modalHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  modalAvatar: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  modalAvatarText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  modalSubtitle: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginTop: 2 },
  closeBtn: { padding: 8 },

  modalBody: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  detailsList: { gap: 20 },
  detailsCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  detailValue: { fontSize: 14, fontWeight: '800', color: '#1E293B', textAlign: 'right', flex: 1, marginLeft: 20 },

  updateStatusSection: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionHeaderText: { fontSize: 11, fontWeight: '800', color: '#101828', letterSpacing: 0.5 },
  pickerTrigger: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  pickerTriggerText: { flex: 1, fontSize: 14, fontWeight: '800', color: '#1E293B' },
  confirmBtn: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 12, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  confirmBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  noDetails: { padding: 40, alignItems: 'center' },
  noDetailsText: { color: '#64748B', fontWeight: '600' },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  pickerContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 8 },
  pickerHeader: { fontSize: 16, fontWeight: '800', color: '#0F172A', padding: 20, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16 },
  pickerItemActive: { backgroundColor: 'rgba(59, 130, 246, 0.05)' },
  pickerItemText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  pickerItemTextActive: { color: '#3B82F6', fontWeight: '800' }
});
