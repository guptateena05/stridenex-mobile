import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuth } from '@/context/AuthContext';
import { RoleBannerWidget } from '@/components/dashboard/RoleBannerWidget';
import {
  GraduationCap,
  Calendar,
  Star,
  IndianRupee,
  Clock,
  Video,
  ChevronRight,
  TrendingUp,
  FileText,
  CheckCircle,
  Activity,
  AlertCircle,
  LayoutDashboard,
  Award,
  X
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { StatsCard } from '@/components/dashboard/StatsCard';
import {
  getMentorByEmail,
  getMentorDashboardStats,
  getUpcomingSessions,
  getPendingRequests,
  getMentorPendingVerifications,
  rescheduleSession
} from '@/api/mentor.services';

export const MentorDashboardScreen = () => {
  const { userFullName, userName } = useAuth();
  const navigation = useNavigation<any>();

  // Overview data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mentorData, setMentorData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [verifyQueue, setVerifyQueue] = useState<any[]>([]);
  const [totalPendingCount, setTotalPendingCount] = useState<number>(0);

  // Reschedule Modal states
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSessionMentor, setSelectedSessionMentor] = useState("");
  const [selectedSessionStudent, setSelectedSessionStudent] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleFromTime, setRescheduleFromTime] = useState("");
  const [rescheduleToTime, setRescheduleToTime] = useState("");
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isFromTimePickerVisible, setFromTimePickerVisible] = useState(false);
  const [isToTimePickerVisible, setToTimePickerVisible] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const email = userName || "";
      if (!email) return;

      const [profileRes, statsRes, upcomingRes, pendingRes, verifyQueueRes] = await Promise.all([
        getMentorByEmail(email).catch(e => { console.error(e); return null; }),
        getMentorDashboardStats(email).catch(e => { console.error(e); return null; }),
        getUpcomingSessions(email).catch(e => { console.error(e); return null; }),
        getPendingRequests(email, 3).catch(e => { console.error(e); return null; }),
        getMentorPendingVerifications(email, 3).catch(e => { console.error(e); return null; })
      ]);

      if (profileRes?.message?.data || profileRes?.message) {
        setMentorData(profileRes.message.data || profileRes.message);
      }
      if (statsRes?.message) {
        setDashboardStats(statsRes.message);
      }
      if (upcomingRes?.message && Array.isArray(upcomingRes.message)) {
        setUpcoming(upcomingRes.message);
      } else {
        setUpcoming([]);
      }
      if (pendingRes?.message) {
        setPending(pendingRes.message.records || []);
        setPendingRequestsCount(pendingRes.message.total_pending_count || 0);
      } else {
        setPending([]);
        setPendingRequestsCount(0);
      }
      if (verifyQueueRes?.message) {
        setVerifyQueue(verifyQueueRes.message.records || []);
        setTotalPendingCount(verifyQueueRes.message.total_pending_count || 0);
      } else {
        setVerifyQueue([]);
        setTotalPendingCount(0);
      }
    } catch (error) {
      console.error("Error fetching mentor dashboard overview data:", error);
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
    fetchData(true);
  }, [fetchData]);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getFormattedDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const d = new Date();
    const dayName = days[d.getDay()];
    const dateNum = String(d.getDate()).padStart(2, '0');
    const monthName = months[d.getMonth()];
    return `${dayName}, ${dateNum} ${monthName}`;
  };

  const handleRescheduleClick = (sessionId: string, mentor: string, student: string) => {
    setSelectedSessionId(sessionId);
    setSelectedSessionMentor(mentor || "");
    setSelectedSessionStudent(student || "");
    setRescheduleDate("");
    setRescheduleFromTime("");
    setRescheduleToTime("");
    setRescheduleError("");
    setRescheduleModalOpen(true);
  };

  const handleDateConfirm = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    setRescheduleDate(`${day}-${month}-${year}`);
    setDatePickerVisible(false);
  };

  const handleFromTimeConfirm = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setRescheduleFromTime(`${hours}:${minutes}`);
    setFromTimePickerVisible(false);
  };

  const handleToTimeConfirm = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setRescheduleToTime(`${hours}:${minutes}`);
    setToTimePickerVisible(false);
  };

  const submitReschedule = async () => {
    if (!selectedSessionId || !rescheduleDate || !rescheduleFromTime || !rescheduleToTime) return;
    try {
      setRescheduleError("");
      setSubmittingReschedule(true);
      const formatTimeToSeconds = (t: string) => {
        if (t.split(':').length === 2) return `${t}:00`;
        return t;
      };

      // Validate date format DD-MM-YYYY
      const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!dateRegex.test(rescheduleDate)) {
        setRescheduleError("Please enter date in DD-MM-YYYY format");
        setSubmittingReschedule(false);
        return;
      }

      const [day, month, year] = rescheduleDate.split('-');
      const formattedDate = `${year}-${month}-${day}`;

      await rescheduleSession({
        session_name: selectedSessionId,
        new_date: formattedDate,
        new_from_time: formatTimeToSeconds(rescheduleFromTime),
        new_to_time: formatTimeToSeconds(rescheduleToTime),
        mentor: selectedSessionMentor,
        student: selectedSessionStudent
      });
      setRescheduleModalOpen(false);
      fetchData(true);
    } catch (error: any) {
      console.error("Failed to reschedule session:", error);
      let errorMessage = "Failed to reschedule session. Please try again.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      setRescheduleError(errorMessage);
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Helper mappings
  const getSessionColor = (index: number) => {
    const colors = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6"];
    return colors[index % colors.length];
  };

  const getAvatarColors = (name: string) => {
    const schemes = [
      { bg: "#FCE7F3", text: "#BE185D" },
      { bg: "#DBEAFE", text: "#1D4ED8" },
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

  // Compute dynamic lists
  const dynamicUpcomingSessions = upcoming.slice(0, 4).map((s, index) => {
    const studentName = s.student_full_name || s.student_name || (s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : null) || s.student?.split('@')[0] || "Unknown";
    const initials = getInitials(studentName);
    const color = getSessionColor(index);
    const dateObj = new Date(s.session_date);
    const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timeStr = formatTime(s.from_time);

    return {
      id: s.name,
      initials,
      name: studentName,
      mentor: s.mentor || "",
      student: s.student || "",
      topic: s.topic || "Session",
      date: `${dateStr} ${timeStr}`,
      duration: `${s.duration}m`,
      type: s.session_type || "Mentorship",
      color,
      meeting_link: s.meeting_link
    };
  });

  const dynamicPendingRequests = pending.slice(0, 3).map((req) => {
    const name = req.student_name || "Student";
    const priority = req.priority || 'Normal';
    const avatarColor = getAvatarColors(name);

    return {
      initials: getInitials(name),
      name,
      topic: req.topic || "Mentorship Session",
      priority: priority.toLowerCase(),
      color: avatarColor.bg,
      textColor: avatarColor.text
    };
  });

  const dynamicVerifyQueue = verifyQueue.slice(0, 3).map((item) => {
    return {
      name: item.student_name || "Student",
      skill: item.skill || "Skill Verification",
      evidence_type: item.evidence_type || "Evidence",
      color: item.evidence_type === 'Project' ? '#EF4444' : '#64748B'
    };
  });

  const overviewStats = [
    {
      label: "STUDENTS MENTORED",
      value: dashboardStats?.total_students_mentored?.toString() || "0",
      icon: GraduationCap,
      color: "#EA580C"
    },
    {
      label: "SESSIONS MONTHLY",
      value: dashboardStats?.sessions_this_month?.toString() || "0",
      icon: Calendar,
      color: "#3B82F6"
    },
    {
      label: "AVERAGE RATING",
      value: mentorData?.avg_rating > 0 ? `${Number(mentorData.avg_rating).toFixed(1)}/5` : "0/5",
      icon: Star,
      color: "#EAB308"
    },
    {
      label: "PENDING PAYOUT",
      value: dashboardStats?.pending_payout || "₹0.00",
      icon: IndianRupee,
      color: "#10B981"
    }
  ];

  const thisMonthStats = [
    { label: "Sessions completed", value: dashboardStats?.this_month?.sessions_completed?.toString() || "0", icon: Calendar },
    { label: "5-star reviews", value: dashboardStats?.this_month?.five_star_reviews?.toString() || "0", icon: Award },
    // { label: "Notes shared", value: dashboardStats?.this_month?.notes_shared?.toString() || "0", icon: FileText },
    { label: "Skills verified", value: dashboardStats?.this_month?.skills_verified?.toString() || "0", icon: CheckCircle },
    { label: "Hours mentored", value: dashboardStats?.this_month?.hours_mentored || "0.0h", icon: Clock },
    // { label: "Profile views", value: dashboardStats?.this_month?.profile_views?.toString() || "0", icon: Activity }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4c1d95" />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4c1d95"]} />
        }
      >

        <View style={styles.content}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Overview</Text>
              <View style={styles.headerBadge}>
                <LayoutDashboard size={10} color="#4c1d95" />
                <Text style={styles.headerBadgeText}>DASHBOARD SUMMARY</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Here is your mentorship overview today</Text>
          </Animated.View>

          {/* Banner */}
          <Animated.View entering={FadeInUp.delay(100)} style={{ marginBottom: 12 }}>
            <RoleBannerWidget
              fullName={mentorData ? `${mentorData.first_name || ""} ${mentorData.last_name || ""}`.trim() : (userFullName || 'Mentorship Team')}
              date={getFormattedDate()}
              role={mentorData?.role || 'Verified Mentor'}
              progress={100}
              theme="mentor"
              metrics={[
                {
                  label: 'TOTAL STUDENTS',
                  value: dashboardStats?.total_students_mentored ?? mentorData?.total_students ?? 0,
                  iconName: 'Users'
                },
                {
                  label: 'SESSIONS DONE',
                  value: mentorData?.total_sessions ?? dashboardStats?.sessions_this_month ?? 0,
                  iconName: 'Calendar'
                },
                {
                  label: 'AVG RATING',
                  value: mentorData?.avg_rating > 0 ? Number(mentorData.avg_rating).toFixed(1) : "New",
                  iconName: 'Award'
                }
              ]}
            />
          </Animated.View>

          {/* Stats Row */}
          <Animated.View entering={FadeInRight.delay(150)} style={styles.statsRow}>
            {overviewStats.map((stat, i) => (
              <StatsCard key={i} title={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
            ))}
          </Animated.View>

          {/* Upcoming Sessions Card */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Calendar size={18} color="#64748B" />
                <Text style={styles.cardTitle}>Upcoming Sessions</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Schedule')} style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>Manage</Text>
                <ChevronRight size={14} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <View style={styles.sessionList}>
              {dynamicUpcomingSessions.length === 0 ? (
                <View style={styles.emptyCardState}>
                  <Text style={styles.emptyCardText}>No upcoming sessions.</Text>
                </View>
              ) : (
                dynamicUpcomingSessions.map((session, i) => (
                  <View key={i} style={styles.sessionItem}>
                    <View style={styles.sessionTopRow}>
                      <View style={styles.sessionInfoGroup}>
                        <View style={[styles.avatar, { backgroundColor: session.color }]}>
                          <Text style={styles.avatarText}>{session.initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.sessionName} numberOfLines={1}>{session.name}</Text>
                          <Text style={styles.sessionTopic} numberOfLines={2}>{session.topic}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.sessionTagsRow}>
                      <View style={styles.tag}>
                        <Calendar size={12} color="#64748B" />
                        <Text style={styles.tagText}>{session.date}</Text>
                      </View>
                      <View style={styles.tag}>
                        <Clock size={12} color="#64748B" />
                        <Text style={styles.tagText}>{session.duration}</Text>
                      </View>
                      <View style={[styles.tag, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                        <Text style={[styles.tagText, { color: '#2563EB', fontWeight: '800' }]}>{session.type}</Text>
                      </View>
                    </View>

                    <View style={styles.sessionActions}>
                      <TouchableOpacity
                        style={[styles.rescheduleBtn, { flex: 1, backgroundColor: '#FFF', borderColor: '#4c1d95', borderWidth: 1.5 }]}
                        onPress={() => handleRescheduleClick(session.id, session.mentor, session.student)}
                      >
                        <Text style={[styles.rescheduleBtnText, { color: '#4c1d95' }]}>Reschedule Session</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </Animated.View>



          {/* Pending Requests */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Video size={18} color="#F97316" />
                <Text style={styles.cardTitle}>Pending Requests</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Requests')} style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={14} color="#2563EB" />
              </TouchableOpacity>
            </View>
            <View style={styles.requestsList}>
              {dynamicPendingRequests.length === 0 ? (
                <View style={styles.emptyCardState}>
                  <Text style={styles.emptyCardText}>No pending requests.</Text>
                </View>
              ) : (
                dynamicPendingRequests.map((req, i) => (
                  <View key={i} style={styles.requestItem}>
                    <View style={styles.requestIntro}>
                      <View style={[styles.reqAvatar, { backgroundColor: req.color }]}>
                        <Text style={[styles.reqAvatarText, { color: req.textColor }]}>{req.initials}</Text>
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.reqName} numberOfLines={1}>{req.name}</Text>
                        <Text style={styles.reqTopic} numberOfLines={2}>{req.topic}</Text>
                      </View>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: req.priority === 'high' ? '#FEF2F2' : '#FFFBEB' }]}>
                      <Text style={[styles.priorityText, { color: req.priority === 'high' ? '#DC2626' : '#D97706' }]}>{req.priority}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
            <TouchableOpacity style={styles.reviewBtn} onPress={() => navigation.navigate('Requests')}>
              <Text style={styles.reviewBtnText}>{pendingRequestsCount} Pending — Review Now</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Skill Verify Queue */}
          <Animated.View entering={FadeInUp.delay(350)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <CheckCircle size={18} color="#64748B" />
                <Text style={styles.cardTitle}>Skill Verify Queue</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Requests')} style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={14} color="#2563EB" />
              </TouchableOpacity>
            </View>
            <View style={styles.requestsList}>
              {dynamicVerifyQueue.length === 0 ? (
                <View style={styles.emptyCardState}>
                  <Text style={styles.emptyCardText}>No pending verifications.</Text>
                </View>
              ) : (
                dynamicVerifyQueue.map((item, i) => (
                  <View key={i} style={styles.requestItem}>
                    <View style={styles.requestIntro}>
                      <AlertCircle size={18} color={item.color} />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.reqName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.reqTopic} numberOfLines={2}>{item.skill}</Text>
                      </View>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE', minWidth: 60, alignItems: 'center' }]}>
                      <Text style={[styles.priorityText, { color: '#2563EB' }]} numberOfLines={1}>{item.evidence_type}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
            <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: '#4c1d95' }]} onPress={() => navigation.navigate('Requests')}>
              <Text style={styles.reviewBtnText}>{totalPendingCount} Awaiting Review</Text>
            </TouchableOpacity>
          </Animated.View>


          {/* Earnings Card */}
          <Animated.View entering={FadeInUp.delay(250)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={styles.earningsIconBox}>
                  <IndianRupee size={16} color="#059669" />
                </View>
                <Text style={styles.cardTitle}>Earnings Summary</Text>
              </View>
            </View>
            <View style={styles.earningsContent}>
              <Text style={styles.earningsValue}>{dashboardStats?.pending_payout || "₹0.00"}</Text>
              <Text style={styles.earningsSub}>Net payout • Processing Next Month</Text>

              <View style={styles.earningsLedger}>
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Gross Earned</Text>
                  <Text style={styles.ledgerValNormal}>{dashboardStats?.gross_earned || "₹0.00"}</Text>
                </View>
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Commission (15%)</Text>
                  <Text style={styles.ledgerValDanger}>
                    {dashboardStats?.commission ? `-${dashboardStats.commission}` : "-₹0.00"}
                  </Text>
                </View>
                <View style={[styles.ledgerRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 4 }]}>
                  <Text style={styles.ledgerLabelBold}>Net to Bank</Text>
                  <Text style={styles.ledgerValSuccess}>{dashboardStats?.pending_payout || "₹0.00"}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* This Month Summary */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Activity size={16} color="#3B82F6" />
              <Text style={styles.activityTitle}>This Month</Text>
            </View>
            <View style={styles.activityList}>
              {thisMonthStats.map((stat, idx) => (
                <View key={idx} style={styles.activityRow}>
                  <View style={styles.activityLeft}>
                    <stat.icon size={16} color="#94A3B8" />
                    <Text style={styles.activityLabel}>{stat.label}</Text>
                  </View>
                  <Text style={styles.activityValue}>{stat.value}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

        </View>
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={rescheduleModalOpen}
        onRequestClose={() => setRescheduleModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reschedule Session</Text>
              <TouchableOpacity onPress={() => setRescheduleModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {rescheduleError ? (
              <View style={styles.errorAlert}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorAlertText}>{rescheduleError}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLbl}>NEW DATE</Text>
              <TouchableOpacity
                style={[styles.inputFld, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={{ color: rescheduleDate ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                  {rescheduleDate || "Select Date"}
                </Text>
                <Calendar size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputsRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLbl}>FROM TIME</Text>
                <TouchableOpacity
                  style={[styles.inputFld, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                  onPress={() => setFromTimePickerVisible(true)}
                >
                  <Text style={{ color: rescheduleFromTime ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                    {rescheduleFromTime ? formatTime(rescheduleFromTime) : "Select Time"}
                  </Text>
                  <Clock size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.inputLbl}>TO TIME</Text>
                <TouchableOpacity
                  style={[styles.inputFld, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                  onPress={() => setToTimePickerVisible(true)}
                >
                  <Text style={{ color: rescheduleToTime ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                    {rescheduleToTime ? formatTime(rescheduleToTime) : "Select Time"}
                  </Text>
                  <Clock size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRescheduleModalOpen(false)}
                disabled={submittingReschedule}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { opacity: rescheduleDate && rescheduleFromTime && rescheduleToTime ? 1 : 0.6 }]}
                onPress={submitReschedule}
                disabled={!rescheduleDate || !rescheduleFromTime || !rescheduleToTime || submittingReschedule}
              >
                {submittingReschedule ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Confirm</Text>
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
              isVisible={isFromTimePickerVisible}
              mode="time"
              onConfirm={handleFromTimeConfirm}
              onCancel={() => setFromTimePickerVisible(false)}
            />
            <DateTimePickerModal
              isVisible={isToTimePickerVisible}
              mode="time"
              onConfirm={handleToTimeConfirm}
              onCancel={() => setToTimePickerVisible(false)}
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
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 16 },

  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },

  sessionList: { gap: 12 },
  sessionItem: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  sessionTopRow: { marginBottom: 8 },
  sessionInfoGroup: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  sessionName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  sessionTopic: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  sessionTagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  tagText: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  sessionActions: { flexDirection: 'row', gap: 8 },
  rescheduleBtn: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  rescheduleBtnText: { color: '#475569', fontSize: 13, fontWeight: '700' },

  earningsIconBox: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  earningsContent: { alignItems: 'center' },
  earningsValue: { fontSize: 36, fontWeight: '900', color: '#10B981', letterSpacing: -1, marginBottom: 4 },
  earningsSub: { fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 12 },
  earningsLedger: { width: '100%', gap: 12 },
  ledgerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ledgerLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  ledgerLabelBold: { fontSize: 13, color: '#1E293B', fontWeight: '800' },
  ledgerValNormal: { fontSize: 13, color: '#1E293B', fontWeight: '600' },
  ledgerValDanger: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
  ledgerValSuccess: { fontSize: 14, color: '#10B981', fontWeight: '800' },

  requestsList: { gap: 12, marginBottom: 16 },
  requestItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  requestIntro: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1, marginRight: 12 },
  reqAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reqAvatarText: { fontSize: 12, fontWeight: '800' },
  reqName: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  reqTopic: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },

  reviewBtn: { backgroundColor: '#4c1d95', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  reviewBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  activityCard: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 16 },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 12 },
  activityTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  activityList: { gap: 12 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activityLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  activityValue: { fontSize: 14, fontWeight: '800', color: '#0F172A' },

  footerSpacer: { height: 40 },

  // Loading and Modal styles
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '500' },
  emptyCardState: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  emptyCardText: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20 },

  errorAlert: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorAlertText: { fontSize: 13, color: '#DC2626', fontWeight: '600', flex: 1 },

  inputGroup: { marginBottom: 20 },
  inputLbl: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 0.5, marginBottom: 8 },
  inputFld: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0F172A', fontWeight: '600' },

  timeInputsRow: { flexDirection: 'row', justifyContent: 'space-between' },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  modalCancelBtn: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalCancelBtnText: { color: '#64748B', fontSize: 14, fontWeight: '800' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalConfirmBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' }
});
