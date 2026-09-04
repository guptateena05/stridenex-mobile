import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator, 
  Alert, 
  Modal, 
  Linking, 
  TextInput, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Inbox, 
  Clock, 
  X, 
  Check, 
  MessageSquare, 
  ShieldCheck, 
  Link2, 
  UserPlus, 
  CheckCircle, 
  AlertCircle,
  Calendar
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { 
  getPendingRequests, 
  getMentorPendingVerifications, 
  suggestAltTime, 
  acceptRequest, 
  declineRequest, 
  verifyAndEndorseSkill, 
  rejectSkillEvidence 
} from '@/api/mentor.services';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Tabs } from '@/components/Shared/Tabs';
import { Pagination } from '@/components/Shared/Pagination';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const BASE_DOMAIN = "https://devstridenex.quantcloud.in";

export const MentorRequestsScreen = () => {
  const { userName } = useAuth();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'bookings' | 'verifications'>('bookings');

  const initialTab = route.params?.initialTab;

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      navigation.setParams({ initialTab: undefined });
    }
  }, [initialTab, navigation]);

  // Booking Requests States
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsPage, setRequestsPage] = useState<number>(1);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);

  // Verification Queue States
  const [verifyQueue, setVerifyQueue] = useState<any[]>([]);
  const [verifyQueuePage, setVerifyQueuePage] = useState<number>(1);
  const [totalPendingCount, setTotalPendingCount] = useState<number>(0);
  const [loadingVerify, setLoadingVerify] = useState(true);
  const [processingEvidenceName, setProcessingEvidenceName] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null);

  // Suggest Alt Time Modal States
  const [altTimeModalOpen, setAltTimeModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [altDate, setAltDate] = useState("");
  const [altTime, setAltTime] = useState("");
  const [submittingAlt, setSubmittingAlt] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  // Global Refresh state
  const [refreshing, setRefreshing] = useState(false);

  const ITEMS_PER_PAGE = 5;

  // Helpers
  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getAvatarColors = (name: string) => {
    const schemes = [
      { bg: "#FCE7F3", text: "#BE185D" },
      { bg: "#EFF6FF", text: "#2563EB" }, // Standard Blue matching RK in reference image
      { bg: "#D1FAE5", text: "#047857" },
      { bg: "#F3E8FF", text: "#7E22CE" },
      { bg: "#FEF3C7", text: "#D97706" }
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return schemes[Math.abs(hash) % schemes.length];
  };

  const formatDateTime = (dateString?: string, timeString?: string) => {
    if (!dateString) return 'Flexible / TBD';
    try {
      const dateObj = new Date(dateString);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      let formattedTime = '';
      if (timeString) {
        const [hours, minutes] = timeString.split(':');
        if (hours && minutes) {
          const hour = parseInt(hours, 10);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          formattedTime = ` · ${hour12}:${minutes} ${ampm}`;
        }
      }
      return `${formattedDate}${formattedTime}`;
    } catch (e) {
      return dateString || "";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  // API Fetching handlers
  const fetchRequests = useCallback(async (isSilent = false) => {
    if (!userName) return;
    if (!isSilent) setLoadingRequests(true);
    try {
      const response = await getPendingRequests(userName);
      let list = [];
      if (response?.message?.records && Array.isArray(response.message.records)) {
        list = response.message.records;
      } else if (Array.isArray(response?.message)) {
        list = response.message;
      }
      setRequests(list);
    } catch (err) {
      console.error("Failed to fetch booking requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  }, [userName]);

  const fetchVerifyQueue = useCallback(async (isSilent = false) => {
    if (!userName) return;
    if (!isSilent) setLoadingVerify(true);
    try {
      const response = await getMentorPendingVerifications(userName, 0);
      if (response?.message) {
        setVerifyQueue(response.message.records || []);
        setTotalPendingCount(response.message.total_pending_count || 0);
      } else {
        setVerifyQueue([]);
        setTotalPendingCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch verification queue:", err);
    } finally {
      setLoadingVerify(false);
    }
  }, [userName]);

  const fetchData = useCallback(async (isSilent = false) => {
    await Promise.all([
      fetchRequests(isSilent),
      fetchVerifyQueue(isSilent)
    ]);
  }, [fetchRequests, fetchVerifyQueue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  }, [fetchData]);

  // Actions
  const handleAcceptRequest = async (req: any) => {
    try {
      setAcceptingId(req.name);
      await acceptRequest({
        booking_name: req.name,
        from_time: req.from_time,
        to_time: req.to_time
      });
      Alert.alert("Success", "Request accepted successfully.");
      fetchRequests(true);
    } catch (err: any) {
      console.error("Failed to accept request:", err);
      Alert.alert("Error", err?.message || "Failed to accept request.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeclineRequest = async (req: any) => {
    try {
      setDecliningId(req.name);
      await declineRequest({
        booking_name: req.name
      });
      Alert.alert("Success", "Request declined successfully.");
      fetchRequests(true);
    } catch (err: any) {
      console.error("Failed to decline request:", err);
      Alert.alert("Error", err?.message || "Failed to decline request.");
    } finally {
      setDecliningId(null);
    }
  };

  const handleVerifyAndEndorse = async (evidenceName: string) => {
    try {
      setProcessingEvidenceName(evidenceName);
      setActionType('verify');
      await verifyAndEndorseSkill(evidenceName);
      Alert.alert("Success", "Skill verified and endorsed successfully.");
      fetchVerifyQueue(true);
    } catch (err: any) {
      console.error("Failed to verify skill:", err);
      Alert.alert("Error", err?.message || "Failed to verify and endorse skill.");
    } finally {
      setProcessingEvidenceName(null);
      setActionType(null);
    }
  };

  const handleRejectEvidence = async (evidenceName: string) => {
    try {
      setProcessingEvidenceName(evidenceName);
      setActionType('reject');
      await rejectSkillEvidence(evidenceName);
      Alert.alert("Success", "Skill evidence rejected.");
      fetchVerifyQueue(true);
    } catch (err: any) {
      console.error("Failed to reject skill evidence:", err);
      Alert.alert("Error", err?.message || "Failed to reject skill evidence.");
    } finally {
      setProcessingEvidenceName(null);
      setActionType(null);
    }
  };

  // Suggest Alt Time handlers
  const openAltTimeModal = (req: any) => {
    setSelectedReq(req);
    setAltDate("");
    setAltTime("");
    setAltTimeModalOpen(true);
  };

  const handleSuggestAltTime = async () => {
    if (!altDate || !altTime || !selectedReq) return;
    try {
      setSubmittingAlt(true);
      const [day, month, year] = altDate.split('-');
      const formattedDate = `${year}-${month}-${day}`;
      const formattedTime = altTime.split(':').length === 2 ? `${altTime}:00` : altTime;

      await suggestAltTime({
        booking_name: selectedReq.name,
        alt_date: formattedDate,
        alt_time: formattedTime
      });
      setAltTimeModalOpen(false);
      Alert.alert("Success", "Alternate time suggested successfully.");
      fetchRequests(true);
    } catch (err: any) {
      console.error("Failed to suggest alternate time:", err);
      Alert.alert("Error", err?.message || "Failed to suggest alternate time.");
    } finally {
      setSubmittingAlt(false);
    }
  };

  const handleDateConfirm = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    setAltDate(`${day}-${month}-${year}`);
    setDatePickerVisible(false);
  };

  const handleTimeConfirm = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setAltTime(`${hours}:${minutes}`);
    setTimePickerVisible(false);
  };

  // Pagination states
  const totalRequestsPages = Math.ceil(requests.length / ITEMS_PER_PAGE) || 1;
  const paginatedRequests = useMemo(() => {
    const startIndex = (requestsPage - 1) * ITEMS_PER_PAGE;
    return requests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [requests, requestsPage]);

  const totalVerifyPages = Math.ceil(verifyQueue.length / ITEMS_PER_PAGE) || 1;
  const paginatedVerifyQueue = useMemo(() => {
    const startIndex = (verifyQueuePage - 1) * ITEMS_PER_PAGE;
    return verifyQueue.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [verifyQueue, verifyQueuePage]);

  const summaryStats = useMemo(() => [
    { label: "Pending Requests", value: requests.length, icon: UserPlus, color: "#EF4444" },
    { label: "Pending Skills", value: totalPendingCount, icon: ShieldCheck, color: "#F59E0B" },
    { label: "Approved (Month)", value: 31, icon: CheckCircle, color: "#10B981" }
  ], [requests.length, totalPendingCount]);

  const tabOptions = [
    { label: `Requests (${requests.length})`, value: 'bookings' },
    { label: `Verifications (${totalPendingCount})`, value: 'verifications' }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4c1d95"]} />
        }
      >
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Inbox</Text>
            <View style={styles.headerBadge}>
              <Inbox size={10} color="#4c1d95" />
              <Text style={styles.headerBadgeText}>MEETING REQUESTS</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Review and manage student session and skill requests</Text>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {summaryStats.map((stat, i) => (
            <StatsCard 
              key={i} 
              title={stat.label} 
              value={stat.value} 
              icon={stat.icon} 
              color={stat.color} 
            />
          ))}
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsWrapper}>
          <Tabs 
            tabs={tabOptions} 
            activeTab={activeTab} 
            onTabChange={(val: any) => setActiveTab(val)} 
          />
        </View>

        {/* Tab Content rendering */}
        {activeTab === 'bookings' ? (
          <View style={styles.tabContentWrapper}>
            <Text style={styles.sectionHeader}>Session Booking Requests — Action Required</Text>
            {loadingRequests && requests.length === 0 ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color="#4c1d95" />
                <Text style={styles.loadingText}>Fetching booking requests...</Text>
              </View>
            ) : paginatedRequests.length > 0 ? (
              <View style={styles.list}>
                {paginatedRequests.map((req, i) => {
                  const name = req.student_name || "Student";
                  const avatarColor = getAvatarColors(name);
                  const isHighPriority = req.priority?.toLowerCase() === 'high';

                  return (
                    <Animated.View key={req.name} entering={FadeInUp.delay(100 + i * 50)} style={styles.requestCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.userIntro}>
                          <View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
                            <Text style={[styles.avatarText, { color: avatarColor.text }]}>{getInitials(name)}</Text>
                          </View>
                          <View style={styles.userMeta}>
                            <Text style={styles.userName}>{name}</Text>
                            <Text style={styles.userTopic} numberOfLines={1}>{req.topic}</Text>
                          </View>
                        </View>
                        <View style={[styles.priorityBadge, { backgroundColor: isHighPriority ? '#FEF2F2' : '#FEF3C7' }]}>
                          <Text style={[styles.priorityText, { color: isHighPriority ? '#DC2626' : '#D97706' }]}>
                            {`${req.priority || 'Normal'} priority`.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailsRow}>
                        <View style={styles.dateBadge}>
                          <Calendar size={12} color="#1E40AF" />
                          <Text style={styles.dateBadgeText}>
                            {formatDateTime(req.session_date, req.from_time)}
                          </Text>
                        </View>
                        <View style={styles.typeBadge}>
                          <Text style={styles.typeBadgeText}>{req.session_type}</Text>
                        </View>
                      </View>

                      <View style={styles.messageBox}>
                        <MessageSquare size={14} color="#94A3B8" style={styles.messageIcon} />
                        <Text style={styles.messageText}>
                          {req.student_message || "No message provided by the student."}
                        </Text>
                      </View>

                      <View style={styles.actionsRow}>
                        <TouchableOpacity 
                          style={styles.acceptBtn} 
                          onPress={() => handleAcceptRequest(req)}
                          disabled={acceptingId === req.name}
                        >
                          {acceptingId === req.name ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <>
                              <Check size={12} color="#FFF" />
                              <Text style={styles.acceptBtnText} numberOfLines={1} adjustsFontSizeToFit>Accept & Schedule</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        
                        {false && (
                          <TouchableOpacity 
                            style={styles.altBtn} 
                            onPress={() => openAltTimeModal(req)}
                          >
                            <Clock size={12} color="#1E293B" />
                            <Text style={styles.altBtnText} numberOfLines={1} adjustsFontSizeToFit>Suggest Alt Time</Text>
                          </TouchableOpacity>
                        )}

                        {false && (
                          <TouchableOpacity 
                            style={styles.declineBtn} 
                            onPress={() => handleDeclineRequest(req)}
                            disabled={decliningId === req.name}
                          >
                            {decliningId === req.name ? (
                              <ActivityIndicator size="small" color="#475569" />
                            ) : (
                              <>
                                <X size={12} color="#64748B" />
                                <Text style={styles.declineBtnText} numberOfLines={1} adjustsFontSizeToFit>Decline</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </Animated.View>
                  );
                })}

                <Pagination
                  currentPage={requestsPage}
                  totalPages={totalRequestsPages}
                  onPageChange={setRequestsPage}
                  activeColor="#4c1d95"
                />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Inbox size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>You're all caught up!</Text>
                <Text style={styles.emptySub}>No pending session requests to review.</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.tabContentWrapper}>
            <Text style={styles.sectionHeader}>Skill Verification Queue</Text>
            
            <View style={styles.infoCallout}>
              <ShieldCheck size={18} color="#2563EB" />
              <Text style={styles.infoCalloutText}>
                You have been trusted by students and the platform to verify these skills. Your endorsement adds a verified badge visible on the student's public profile and ledger.
              </Text>
            </View>

            {loadingVerify && verifyQueue.length === 0 ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color="#4c1d95" />
                <Text style={styles.loadingText}>Fetching verification requests...</Text>
              </View>
            ) : paginatedVerifyQueue.length > 0 ? (
              <View style={styles.list}>
                {paginatedVerifyQueue.map((item, i) => {
                  const isProject = item.evidence_type === 'Project';
                  const badgeBg = isProject ? '#ECFDF5' : '#EFF6FF';
                  const badgeText = isProject ? '#059669' : '#2563EB';

                  return (
                    <Animated.View key={item.evidence_name} entering={FadeInUp.delay(100 + i * 50)} style={styles.requestCard}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.userName}>{item.student_name}</Text>
                          <View style={styles.evidenceBadgesRow}>
                            <View style={styles.skillBadge}>
                              <Text style={styles.skillBadgeText}>{item.skill}</Text>
                            </View>
                            <View style={[styles.evidenceBadge, { backgroundColor: badgeBg }]}>
                              <Text style={[styles.evidenceBadgeText, { color: badgeText }]}>{item.evidence_type}</Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.evidenceId}>{item.evidence_name}</Text>
                      </View>

                      <View style={styles.messageBox}>
                        <Link2 size={14} color="#64748B" style={styles.messageIcon} />
                        <Text style={styles.messageText}>
                          {item.description || "No description provided."}
                        </Text>
                      </View>

                      <View style={styles.actionsRow}>
                        <TouchableOpacity 
                          style={[styles.acceptBtn, { backgroundColor: '#10B981' }]}
                          onPress={() => handleVerifyAndEndorse(item.evidence_name)}
                          disabled={processingEvidenceName !== null}
                        >
                          {processingEvidenceName === item.evidence_name && actionType === 'verify' ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <>
                              <ShieldCheck size={12} color="#FFF" />
                              <Text style={styles.acceptBtnText} numberOfLines={1} adjustsFontSizeToFit>Verify & Endorse</Text>
                            </>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.altBtn, { flex: 1.2 }]}
                          onPress={() => {
                            if (item.document_url) {
                              const url = item.document_url.startsWith('http') 
                                ? item.document_url 
                                : `${BASE_DOMAIN}${item.document_url}`;
                              Linking.openURL(url).catch((e) => {
                                console.error("Failed to open URL", e);
                                Alert.alert("Error", "Unable to open evidence link.");
                              });
                            } else {
                              Alert.alert("Info", "No evidence URL provided.");
                            }
                          }}
                          disabled={!item.document_url}
                        >
                          <Text style={styles.altBtnText} numberOfLines={1} adjustsFontSizeToFit>Review Evidence</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.declineBtn}
                          onPress={() => handleRejectEvidence(item.evidence_name)}
                          disabled={processingEvidenceName !== null}
                        >
                          {processingEvidenceName === item.evidence_name && actionType === 'reject' ? (
                            <ActivityIndicator size="small" color="#475569" />
                          ) : (
                            <>
                              <X size={12} color="#64748B" />
                              <Text style={styles.declineBtnText} numberOfLines={1} adjustsFontSizeToFit>Reject</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  );
                })}

                <Pagination
                  currentPage={verifyQueuePage}
                  totalPages={totalVerifyPages}
                  onPageChange={setVerifyQueuePage}
                  activeColor="#4c1d95"
                />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <ShieldCheck size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptySub}>No skill verifications pending review.</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Suggest Alternate Time Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={altTimeModalOpen}
        onRequestClose={() => setAltTimeModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Suggest Alternate Time</Text>
              <TouchableOpacity onPress={() => setAltTimeModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLbl}>DATE</Text>
              <TouchableOpacity
                style={[styles.inputFld, styles.dateTimeSelector]}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={{ color: altDate ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                  {altDate || "Select Date"}
                </Text>
                <Calendar size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLbl}>TIME</Text>
              <TouchableOpacity
                style={[styles.inputFld, styles.dateTimeSelector]}
                onPress={() => setTimePickerVisible(true)}
              >
                <Text style={{ color: altTime ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                  {altTime ? altTime : "Select Time"}
                </Text>
                <Clock size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAltTimeModalOpen(false)}
                disabled={submittingAlt}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { opacity: altDate && altTime ? 1 : 0.6 }]}
                onPress={handleSuggestAltTime}
                disabled={!altDate || !altTime || submittingAlt}
              >
                {submittingAlt ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={() => setDatePickerVisible(false)}
            />
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={handleTimeConfirm}
              onCancel={() => setTimePickerVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', lineHeight: 16 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 16 },

  tabsWrapper: { marginBottom: 16 },
  tabContentWrapper: { gap: 12 },
  sectionHeader: { fontSize: 14, fontWeight: '800', color: '#1E293B', paddingHorizontal: 4, marginBottom: 4 },
  
  infoCallout: { flexDirection: 'row', gap: 10, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE', borderRadius: 12, padding: 12, marginBottom: 4 },
  infoCalloutText: { flex: 1, fontSize: 11, fontWeight: '600', color: '#1E3A8A', lineHeight: 16 },

  list: { gap: 16 },
  requestCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  userIntro: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800' },
  userMeta: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  userTopic: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },

  detailsRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  dateBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#EFF6FF', 
    paddingHorizontal: 8, 
    paddingVertical: 5, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#DBEAFE' 
  },
  dateBadgeText: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#1E40AF' 
  },
  typeBadge: { 
    backgroundColor: '#FFF7ED', 
    paddingHorizontal: 8, 
    paddingVertical: 5, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#FFEDD5' 
  },
  typeBadgeText: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#EA580C' 
  },

  messageBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#F8FAFC', 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginBottom: 16 
  },
  messageIcon: { flexShrink: 0 },
  messageText: { 
    flex: 1, 
    fontSize: 13, 
    color: '#475569', 
    fontStyle: 'italic' 
  },

  actionsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  acceptBtn: { 
    flex: 1.5, 
    backgroundColor: '#F97316', 
    paddingVertical: 12, 
    paddingHorizontal: 4,
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 4 
  },
  acceptBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  altBtn: { 
    flex: 1.5, 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    paddingVertical: 12, 
    paddingHorizontal: 4,
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 4 
  },
  altBtnText: { color: '#1E293B', fontSize: 11, fontWeight: '700' },
  declineBtn: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    paddingVertical: 12, 
    paddingHorizontal: 4,
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 4 
  },
  declineBtnText: { color: '#64748B', fontSize: 11, fontWeight: '700' },

  evidenceBadgesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  skillBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  skillBadgeText: { fontSize: 9, fontWeight: '800', color: '#475569' },
  evidenceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  evidenceBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  evidenceId: { fontSize: 10, fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }), color: '#94A3B8' },

  loadingWrapper: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B', fontWeight: '500' },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, opacity: 0.8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 12, marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  footerSpacer: { height: 40 },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 110 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20 },

  inputGroup: { marginBottom: 16 },
  inputLbl: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 0.5, marginBottom: 8 },
  inputFld: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0F172A', fontWeight: '600' },
  dateTimeSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  modalCancelBtn: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalCancelBtnText: { color: '#64748B', fontSize: 14, fontWeight: '800' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalConfirmBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' }
});
