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
  Alert
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
  LayoutDashboard,
  Target,
  X,
  ChevronDown,
  Mail,
  ChevronRight
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight, Layout, SlideInRight } from 'react-native-reanimated';
import { useIndustry } from '@/context/IndustryContext';
import { getStudentApplicationList, getStudentByEmail, updateApplicationStatus } from '@/api/industry.services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const pipelineColumns = [
  { id: "Applied", title: "Applied", color: '#1E293B', icon: Mail },
  { id: "Shortlisted", title: "Shortlisted", color: '#3B82F6', icon: UserCheck },
  { id: "Tech Interview", title: "Tech Interview", color: '#F97316', icon: PhoneCall },
  { id: "HR", title: "HR", color: '#8B5CF6', icon: PhoneCall },
  { id: "Rejected", title: "Rejected", color: '#EF4444', icon: XCircle },
  { id: "Selected", title: "Selected", color: '#10B981', icon: CheckCircle2 }
];

interface Candidate {
  id: string;
  name: string;
  owner: string;
  status: string;
  studentEmail: string;
  internship: string;
  college: string;
  applied_on: string;
  match: number;
  initials: string;
  bgColor: string;
}

export const IndustryPipelineScreen = () => {
  const { industryData } = useIndustry();
  const [activeTab, setActiveTab] = useState("Applied");
  const [candidates, setCandidates] = useState<Record<string, Candidate[]>>({
    "Applied": [],
    "Shortlisted": [],
    "Tech Interview": [],
    "HR": [],
    "Rejected": [],
    "Selected": [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);

  const companyName = industryData?.company_name || "";
  const tabScrollRef = useRef<ScrollView>(null);

  const fetchApplications = useCallback(async (name: string) => {
    try {
      if (!refreshing) setLoading(true);
      const response = await getStudentApplicationList(name);
      
      const apiData = response?.data || response?.message?.data || [];

      if (Array.isArray(apiData)) {
        const newCandidates: Record<string, Candidate[]> = {
          "Applied": [],
          "Shortlisted": [],
          "Tech Interview": [],
          "HR": [],
          "Rejected": [],
          "Selected": [],
        };

        apiData.forEach((app: any) => {
          const email = app.student || "Student";
          const initials = email.charAt(0).toUpperCase();
          const bgColors = ['#EF4444', '#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#8B5CF6'];
          const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];

          const candidate: Candidate = {
            id: app.name || Math.random().toString(),
            name: app.student_name || email.split('@')[0],
            owner: app.owner || app.modified_by || "Unknown",
            status: app.status || "Applied",
            studentEmail: app.student,
            internship: app.internship || "Unknown",
            initials: initials,
            bgColor: randomColor,
            college: app.college || "N/A",
            applied_on: app.applied_on ? new Date(app.applied_on).toLocaleDateString() : "N/A",
            match: Math.round(app.match_score) || 0
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
      console.error("Error fetching applications:", err);
      if (err?.status === 404 || err?.message?.includes("404")) {
        setCandidates({
          "Applied": [],
          "Shortlisted": [],
          "Tech Interview": [],
          "HR": [],
          "Rejected": [],
          "Selected": [],
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (companyName) {
      fetchApplications(companyName);
    }
  }, [companyName, fetchApplications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications(companyName);
  };

  const handleCardClick = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setSelectedStatus(candidate.status);
    setIsModalOpen(true);
    setLoadingDetails(true);
    setStudentDetails(null);
    try {
      const response = await getStudentByEmail(candidate.studentEmail);
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
      await updateApplicationStatus(selectedCandidate.id, selectedStatus);
      await fetchApplications(companyName);
      setSelectedCandidate(prev => prev ? { ...prev, status: selectedStatus } : null);
      Alert.alert("Success", `Status updated to ${selectedStatus}`);
      setIsModalOpen(false);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update status");
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple[600]} />
        <Text style={styles.loadingText}>SYNCING PIPELINE...</Text>
      </View>
    );
  }

  const activeColor = pipelineColumns.find(c => c.id === activeTab)?.color || colors.purple[600];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Pipeline</Text>
          <View style={styles.headerBadge}>
            <LayoutDashboard size={10} color={colors.purple[600]} />
            <Text style={styles.headerBadgeText}>CANDIDATE WORKFLOW</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Manage your talent acquisition funnel</Text>
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
            <Text style={styles.heroSubtitle}>{candidates[activeTab]?.length || 0} candidates in this stage</Text>
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
                        <Text style={styles.candidateName} numberOfLines={1}>{candidate.name}</Text>
                        <View style={styles.matchBadge}>
                          <Text style={styles.matchText}>{candidate.match}% Match</Text>
                        </View>
                      </View>
                      <Text style={styles.candidateEmail} numberOfLines={1}>{candidate.studentEmail}</Text>
                      
                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <MapPin size={12} color="#94A3B8" />
                          <Text style={styles.metaText} numberOfLines={1}>{candidate.college}</Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={18} color="#CBD5E1" />
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                      <Clock size={12} color="#64748B" />
                      <Text style={styles.footerText}>Applied on {candidate.applied_on}</Text>
                    </View>
                    <View style={styles.ownerBadge}>
                      <Text style={styles.ownerText}>Owner: {candidate.owner}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Mail size={32} color="#E2E8F0" />
              </View>
              <Text style={styles.emptyStateTitle}>No Candidates Yet</Text>
              <Text style={styles.emptyStateText}>Applications in the '{activeTab}' stage will appear here.</Text>
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
                <View>
                  <Text style={styles.modalTitle}>{selectedCandidate?.name || "Student Details"}</Text>
                  <Text style={styles.modalSubtitle}>{selectedCandidate?.college || "Application Record"}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {loadingDetails ? (
                <View style={styles.detailsLoading}>
                  <ActivityIndicator color={colors.purple[600]} />
                </View>
              ) : studentDetails ? (
                <View style={styles.detailsList}>
                  <View style={styles.detailsCard}>
                    {[
                      { label: "Email", value: studentDetails.name },
                      { label: "First Name", value: studentDetails.first_name },
                      { label: "Last Name", value: studentDetails.last_name },
                      { label: "College", value: studentDetails.college },
                      { label: "Stream", value: studentDetails.stream },
                      { label: "Course", value: studentDetails.course },
                    ].map((item, idx) => (
                      <View key={idx} style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{item.label}</Text>
                        <Text style={styles.detailValue}>{item.value || "N/A"}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.updateStatusSection}>
                    <View style={styles.sectionHeader}>
                      <Target size={16} color="#F97316" />
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
              ) : (
                <View style={styles.noDetails}>
                  <Text style={styles.noDetailsText}>No details found for this student.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

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
              <Text style={styles.pickerHeader}>Select Status</Text>
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
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { marginTop: 12, fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1 },
  
  header: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(10, 128, 153, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display },
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
  matchBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  matchText: { fontSize: 10, fontWeight: '800', color: '#059669' },
  candidateEmail: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  ownerBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  ownerText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyStateTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '92%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  modalAvatar: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  modalAvatarText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 2 },
  closeBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },

  modalBody: { flex: 1, padding: 20 },
  detailsLoading: { padding: 40, alignItems: 'center' },
  detailsList: { gap: 20 },
  detailsCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 14, fontWeight: '800', color: '#1E293B', textAlign: 'right', flex: 1, marginLeft: 20 },
  
  updateStatusSection: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionHeaderText: { fontSize: 11, fontWeight: '800', color: '#1E293B', letterSpacing: 0.5 },
  pickerTrigger: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  pickerTriggerText: { flex: 1, fontSize: 14, fontWeight: '800', color: '#1E293B' },
  confirmBtn: { backgroundColor: '#F97316', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 12, shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  confirmBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  noDetails: { padding: 40, alignItems: 'center' },
  noDetailsText: { color: '#64748B', fontWeight: '600' },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  pickerContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 8 },
  pickerHeader: { fontSize: 16, fontWeight: '800', color: '#0F172A', padding: 20, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16 },
  pickerItemActive: { backgroundColor: 'rgba(10, 128, 153, 0.05)' },
  pickerItemText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  pickerItemTextActive: { color: colors.purple[600], fontWeight: '800' }
});
