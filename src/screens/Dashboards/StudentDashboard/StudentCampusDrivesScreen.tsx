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
  RefreshControl,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import {
  Briefcase,
  CheckCircle2,
  Calendar,
  Clock,
  IndianRupee,
  X,
  Target,
  Trophy,
  GraduationCap,
  Info,
  Search,
  Building2,
  Check
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useAuth } from '@/context/AuthContext';
import { SwipeableRow, SwipeAction } from '@/components/Shared/SwipeableRow';
import { getCampusDriveList, applyOpportunity } from '@/api/student.services';

export const StudentCampusDrivesScreen = () => {
  const { userName } = useAuth();
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [successfullyApplied, setSuccessfullyApplied] = useState<string[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [search, setSearch] = useState("");

  // Load successfully applied drive IDs from AsyncStorage on mount
  useEffect(() => {
    const loadSavedApplications = async () => {
      try {
        const saved = await AsyncStorage.getItem(`applied_campus_drives_${userName}`);
        if (saved) {
          setSuccessfullyApplied(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Error loading applied drives from AsyncStorage:", err);
      }
    };
    loadSavedApplications();
    fetchDrivesData();
  }, [userName]);

  const fetchDrivesData = async (showRefresher = false) => {
    try {
      if (showRefresher) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await getCampusDriveList();
      const rawData = response?.data || response?.message?.data || response?.message || response || [];
      const driveList = Array.isArray(rawData) ? rawData : [];
      setDrives(driveList);
    } catch (err) {
      console.error("Error fetching campus drives:", err);
      Alert.alert("Error", "Failed to load campus drives.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApplyDrive = async (drive: any) => {
    if (!userName) {
      Alert.alert("Authentication Required", "Please log in to apply.");
      return;
    }

    try {
      setApplying(drive.name);
      const payload = {
        student: userName,
        opportunity_type: "Campus Drive",
        opportunity_name: drive.name,
        notes: "Applying to campus drive."
      };

      const response = await applyOpportunity(payload);

      // Check if successful (or duplicate warning 409)
      const isSuccess = response && (response.status === 200 || response.status === "200" || response.message?.status === 200 || response.message?.message?.includes("success"));
      const errMsg = response && typeof response.message === "object"
        ? response.message.message
        : response?.message;

      if (isSuccess || (errMsg && errMsg.toLowerCase().includes("already applied"))) {
        const updated = [...successfullyApplied, drive.name];
        setSuccessfullyApplied(updated);
        await AsyncStorage.setItem(`applied_campus_drives_${userName}`, JSON.stringify(updated));
        Alert.alert(
          "Success", 
          isSuccess 
            ? `Successfully applied for Campus Drive with ${drive.company || drive.name}!`
            : "You have already applied for this campus drive."
        );
      } else {
        Alert.alert("Error", errMsg || "Failed to apply. Please try again.");
      }
    } catch (err: any) {
      console.error("Application error:", err);
      Alert.alert("Error", err?.message || "Something went wrong. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  const filteredDrives = useMemo(() => {
    return drives.filter(drive => {
      const query = search.toLowerCase();
      const company = (drive.company || "").toLowerCase();
      const designation = (drive.job_title || drive.role || "").toLowerCase();
      const branch = (drive.branch || "").toLowerCase();
      return company.includes(query) || designation.includes(query) || branch.includes(query);
    });
  }, [drives, search]);

  const activeDrivesCount = useMemo(() => drives.filter(d => d.status !== "Closed").length, [drives]);
  const appliedDrivesCount = useMemo(() => successfullyApplied.length, [successfullyApplied]);

  if (loading && drives.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        <Text style={styles.loadingText}>Loading campus drives...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDrivesData(true)}
            colors={[colors.accent.DEFAULT]}
            tintColor={colors.accent.DEFAULT}
          />
        }
      >
        {/* Stats Summary cards */}
        <View style={styles.statsRow}>
          <StatsCard
            title="ACTIVE DRIVES"
            value={activeDrivesCount}
            icon={Briefcase}
            color="#FF9500"
          />
          <StatsCard
            title="APPLIED DRIVES"
            value={appliedDrivesCount}
            icon={CheckCircle2}
            color="#34C759"
          />
        </View>

        {/* Search Header */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            placeholder="Search drives, companies or roles..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Campus Recruitment Drives</Text>
        </View>

        {/* Drives List */}
        <View style={styles.listContainer}>
          {filteredDrives.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Building2 size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No campus drives found.</Text>
            </View>
          ) : (
            filteredDrives.map((drive, index) => {
              const hasApplied = successfullyApplied.includes(drive.name);
              const isClosed = drive.status?.toLowerCase() === 'closed';
              const roleTitle = drive.job_title || drive.role || "Placement Drive Opportunity";

              const actions: SwipeAction[] = [
                {
                  label: 'Details',
                  icon: Info,
                  color: '#2563EB',
                  bgColor: '#EFF6FF',
                  onPress: () => {
                    setSelectedDrive(drive);
                    setShowDetailsModal(true);
                  }
                }
              ];

              if (!isClosed && !hasApplied) {
                actions.push({
                  label: 'Apply',
                  icon: Briefcase,
                  color: '#FF6B00',
                  bgColor: '#FFEADB',
                  onPress: () => handleApplyDrive(drive)
                });
              }

              return (
                <Animated.View
                  key={drive.name || index}
                  entering={FadeInUp.delay(200 + index * 80)}
                >
                  <SwipeableRow actions={actions}>
                    <View style={styles.driveCard}>
                      <View style={styles.cardTop}>
                        <View style={styles.companyInfo}>
                          <View style={[styles.companyLogo, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                            <Text style={[styles.logoText, { color: '#7C3AED' }]}>
                              {(drive.company || drive.name || "C")[0]}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.jobTitle} numberOfLines={1}>
                              {roleTitle}
                            </Text>
                            <Text style={styles.companyName} numberOfLines={1}>
                              {drive.company || "Institution Partner"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Status Badges */}
                      <View style={styles.statusBadgesRow}>
                        <View style={[styles.statusTag, isClosed ? styles.statusClosed : styles.statusActive]}>
                          <Text style={isClosed ? styles.statusTagTextClosed : styles.statusTagTextActive}>
                            {drive.status || "Active"}
                          </Text>
                        </View>
                        {hasApplied && (
                          <View style={[styles.statusTag, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }]}>
                            <Text style={[styles.statusTagTextActive, { color: '#2E7D32' }]}>
                              Applied
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Info Badges */}
                      <View style={styles.badgeRow}>
                        <View style={[styles.infoBadge, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
                          <IndianRupee size={10} color="#16A34A" />
                          <Text style={[styles.badgeText, { color: '#16A34A', fontWeight: '700' }]}>
                            {drive.package_offered || drive.package || "As per industry"}
                          </Text>
                        </View>
                        <View style={styles.infoBadge}>
                          <Clock size={10} color="#64748B" />
                          <Text style={styles.badgeText}>{drive.job_type || "Full-Time"}</Text>
                        </View>
                        <View style={styles.infoBadge}>
                          <GraduationCap size={10} color="#64748B" />
                          <Text style={styles.badgeText}>Criteria: {drive.criteria || "All eligible"}</Text>
                        </View>
                      </View>

                      {/* Required Skills tags */}
                      {drive.required_skill && (
                        <View style={styles.skillsRow}>
                          {String(drive.required_skill).split(",").slice(0, 3).map((s: string, si: number) => (
                            <View key={si} style={styles.skillChip}>
                              <Text style={styles.skillChipText}>{s.trim()}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Buttons */}
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={styles.detailsButton}
                          onPress={() => {
                            setSelectedDrive(drive);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Text style={styles.detailsButtonText}>Details</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.applyButton,
                            (hasApplied || isClosed || applying === drive.name) && styles.disabledButton
                          ]}
                          disabled={hasApplied || isClosed || applying === drive.name}
                          onPress={() => handleApplyDrive(drive)}
                        >
                          {applying === drive.name ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.applyButtonText}>
                              {hasApplied ? "Applied" : "Apply Now"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </SwipeableRow>
                </Animated.View>
              );
            })
          )}
        </View>
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Details Modal */}
      {showDetailsModal && selectedDrive && (
        <Modal
          visible={showDetailsModal}
          animationType="slide"
          presentationStyle="overFullScreen"
          transparent={false}
          onRequestClose={() => setShowDetailsModal(false)}
        >
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <View style={[styles.modalIconBox, { backgroundColor: '#7C3AED' }]}>
                  <Building2 size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitleText} numberOfLines={1}>
                    {selectedDrive.job_title || selectedDrive.role || "Drive Information"}
                  </Text>
                  <Text style={styles.modalSubtitleText} numberOfLines={1}>
                    {selectedDrive.company || "Campus Recruitment Drive"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowDetailsModal(false)}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.detailsContentContainer}>
                {/* General Info Grid */}
                <Text style={styles.modalSectionLabel}>Drive Parameters</Text>
                <View style={styles.metaBoxContainer}>
                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconWrap, { backgroundColor: '#F0FDF4' }]}>
                      <IndianRupee size={16} color="#16A34A" />
                    </View>
                    <View>
                      <Text style={styles.metaLabelText}>PACKAGE OFFERED</Text>
                      <Text style={styles.metaValText}>{selectedDrive.package_offered || selectedDrive.package || "As per industry"}</Text>
                    </View>
                  </View>

                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconWrap, { backgroundColor: '#EFF6FF' }]}>
                      <Clock size={16} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.metaLabelText}>EMPLOYMENT TYPE</Text>
                      <Text style={styles.metaValText}>{selectedDrive.job_type || "Full-Time"}</Text>
                    </View>
                  </View>

                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconWrap, { backgroundColor: '#FFF7ED' }]}>
                      <Calendar size={16} color="#EA580C" />
                    </View>
                    <View>
                      <Text style={styles.metaLabelText}>DRIVE DATE</Text>
                      <Text style={styles.metaValText}>{selectedDrive.drive_date ? selectedDrive.drive_date.split(" ")[0] : "TBD"}</Text>
                    </View>
                  </View>

                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconWrap, { backgroundColor: '#FEF2F2' }]}>
                      <Clock size={16} color="#DC2626" />
                    </View>
                    <View>
                      <Text style={styles.metaLabelText}>REGISTRATION DEADLINE</Text>
                      <Text style={styles.metaValText}>{selectedDrive.registeration_deadline ? selectedDrive.registeration_deadline.split(" ")[0] : "TBD"}</Text>
                    </View>
                  </View>
                </View>

                {/* Criteria */}
                <Text style={styles.modalSectionLabel}>Eligibility Criteria</Text>
                <View style={styles.descCard}>
                  <Text style={styles.descCardText}>
                    {selectedDrive.criteria || "All students are eligible to register for this placement drive."}
                  </Text>
                </View>

                {/* Required Skills */}
                {selectedDrive.required_skill && (
                  <>
                    <Text style={styles.modalSectionLabel}>Required Skills</Text>
                    <View style={styles.skillsTagRow}>
                      {String(selectedDrive.required_skill).split(",").map((s: string, si: number) => (
                        <View key={si} style={styles.skillBadgeBox}>
                          <Text style={styles.skillBadgeText}>{s.trim()}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Eligible branches */}
                {selectedDrive.branches && (
                  <>
                    <Text style={styles.modalSectionLabel}>Target Branches</Text>
                    <View style={styles.skillsTagRow}>
                      {String(selectedDrive.branches).split(",").map((b: string, bi: number) => (
                        <View key={bi} style={[styles.skillBadgeBox, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                          <Text style={[styles.skillBadgeText, { color: '#0369A1' }]}>{b.trim()}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </ScrollView>

            {/* Footer action */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalApplyBtn,
                  (successfullyApplied.includes(selectedDrive.name) || selectedDrive.status?.toLowerCase() === 'closed' || applying === selectedDrive.name) && styles.disabledButton
                ]}
                disabled={successfullyApplied.includes(selectedDrive.name) || selectedDrive.status?.toLowerCase() === 'closed' || applying === selectedDrive.name}
                onPress={() => {
                  handleApplyDrive(selectedDrive);
                  setShowDetailsModal(false);
                }}
              >
                <Text style={[styles.modalApplyBtnText, successfullyApplied.includes(selectedDrive.name) && { color: '#64748B' }]}>
                  {successfullyApplied.includes(selectedDrive.name) ? "Applied" : "Apply Now"}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  listContainer: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  driveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  logoText: {
    fontSize: 18,
    fontWeight: '900',
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
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillChip: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  skillChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#FFEADB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalApplyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF6B00',
  },
});
