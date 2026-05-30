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
  Platform,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Calendar, 
  Clock, 
  X, 
  Plus, 
  Video, 
  FileText, 
  Edit3, 
  Trash2, 
  Lock, 
  User, 
  AlertCircle,
  HelpCircle,
  CheckCircle,
  ChevronRight,
  Info,
  CalendarDays
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { 
  getUpcomingSessions, 
  getSlotCalendar, 
  getWeeklyBookedSessions, 
  getMonthlyBookedSessions, 
  blockTime, 
  rescheduleSession, 
  saveMentorAvailability, 
  deleteMentorAvailability, 
  getSessionNote, 
  saveSessionNotes 
} from '@/api/mentor.services';
import { Tabs } from '@/components/Shared/Tabs';
import { Pagination } from '@/components/Shared/Pagination';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const BASE_DOMAIN = "https://devstridenex.quantcloud.in";

export const MentorScheduleScreen = () => {
  const { userName } = useAuth();
  
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'booked' | 'availability' | 'upcoming'>('booked');
  
  // Booked sessions tab state
  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const [weeklyBooked, setWeeklyBooked] = useState<any[]>([]);
  const [monthlyBooked, setMonthlyBooked] = useState<any[]>([]);
  const [loadingBooked, setLoadingBooked] = useState(true);
  const [bookedSessionsPage, setBookedSessionsPage] = useState<number>(1);
  
  // Availability grid tab state
  const [slotCalendar, setSlotCalendar] = useState<Record<string, any[]>>({});
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  
  // Upcoming bookings tab state
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [upcomingBookingsPage, setUpcomingBookingsPage] = useState<number>(1);
  
  const ITEMS_PER_PAGE = 3;
  const [refreshing, setRefreshing] = useState(false);

  // Picker States for modals
  const [pickerMode, setPickerMode] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  // Block Time Modal States
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [blockFromTime, setBlockFromTime] = useState("");
  const [blockToTime, setBlockToTime] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [submittingBlock, setSubmittingBlock] = useState(false);

  // Reschedule Modal States
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSessionMentor, setSelectedSessionMentor] = useState("");
  const [selectedSessionStudent, setSelectedSessionStudent] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleFromTime, setRescheduleFromTime] = useState("");
  const [rescheduleToTime, setRescheduleToTime] = useState("");
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Availability Modal States
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<'Each Day Same Schedule' | 'Each Day Different Schedule'>('Each Day Same Schedule');
  const [sameScheduleFromTime, setSameScheduleFromTime] = useState("");
  const [sameScheduleToTime, setSameScheduleToTime] = useState("");
  const [sameScheduleSelectedDays, setSameScheduleSelectedDays] = useState<string[]>([]);
  const [differentScheduleDays, setDifferentScheduleDays] = useState<Record<string, { active: boolean; fromTime: string; toTime: string }>>({
    Monday: { active: false, fromTime: "", toTime: "" },
    Tuesday: { active: false, fromTime: "", toTime: "" },
    Wednesday: { active: false, fromTime: "", toTime: "" },
    Thursday: { active: false, fromTime: "", toTime: "" },
    Friday: { active: false, fromTime: "", toTime: "" },
    Saturday: { active: false, fromTime: "", toTime: "" },
    Sunday: { active: false, fromTime: "", toTime: "" }
  });
  const [submittingAvailability, setSubmittingAvailability] = useState(false);

  // Prep Notes Modal States
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesSessionId, setNotesSessionId] = useState("");
  const [notesStudentEmail, setNotesStudentEmail] = useState("");
  const [notesStudentName, setNotesStudentName] = useState("");
  const [notesTopic, setNotesTopic] = useState("");
  const [notesShared, setNotesShared] = useState("");
  const [notesInternal, setNotesInternal] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Format Helpers
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const formatTimeSlot = (timeStr: string) => {
    if (!timeStr) return "";
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      if (minutes === '00') return `${h12} ${ampm}`;
      return `${h12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const getDayName = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
      return `${dayName} (${dateFormatted})`;
    } catch (e) {
      return dateStr;
    }
  };

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
      { bg: "#EFF6FF", text: "#2563EB" },
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

  // API Call Handlers
  const fetchBookedSessions = useCallback(async (isSilent = false) => {
    if (!userName) return;
    if (!isSilent) setLoadingBooked(true);
    try {
      if (viewType === 'week') {
        const res = await getWeeklyBookedSessions(userName);
        setWeeklyBooked(res?.message || []);
      } else {
        const res = await getMonthlyBookedSessions(userName);
        setMonthlyBooked(res?.message || []);
      }
    } catch (err) {
      console.error("Failed to fetch booked sessions:", err);
    } finally {
      setLoadingBooked(false);
    }
  }, [userName, viewType]);

  const fetchCalendar = useCallback(async (isSilent = false) => {
    if (!userName) return;
    if (!isSilent) setLoadingCalendar(true);
    try {
      const res = await getSlotCalendar(userName);
      setSlotCalendar(res?.message || {});
    } catch (err) {
      console.error("Failed to fetch calendar slots:", err);
    } finally {
      setLoadingCalendar(false);
    }
  }, [userName]);

  const fetchUpcoming = useCallback(async (isSilent = false) => {
    if (!userName) return;
    if (!isSilent) setLoadingUpcoming(true);
    try {
      const res = await getUpcomingSessions(userName);
      setUpcoming(res?.message || []);
    } catch (err) {
      console.error("Failed to fetch upcoming bookings:", err);
    } finally {
      setLoadingUpcoming(false);
    }
  }, [userName]);

  const fetchData = useCallback(async (isSilent = false) => {
    await Promise.all([
      fetchBookedSessions(isSilent),
      fetchCalendar(isSilent),
      fetchUpcoming(isSilent)
    ]);
  }, [fetchBookedSessions, fetchCalendar, fetchUpcoming]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect to refetch booked when viewType changes
  useEffect(() => {
    fetchBookedSessions();
    setBookedSessionsPage(1);
  }, [viewType, fetchBookedSessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  }, [fetchData]);

  // Modals Open Handlers
  const handleOpenNotes = async (sessionId: string, studentEmail: string, studentName: string, topic: string) => {
    setNotesSessionId(sessionId);
    setNotesStudentEmail(studentEmail);
    setNotesStudentName(studentName);
    setNotesTopic(topic);
    setNotesShared("");
    setNotesInternal("");
    setNotesModalOpen(true);
    setLoadingNotes(true);

    try {
      const res = await getSessionNote(sessionId, studentEmail);
      if (res?.message?.data) {
        setNotesShared(res.message.data.shared_with_student || "");
        setNotesInternal(res.message.data.notes || "");
      }
    } catch (err) {
      console.error("Failed to fetch session notes:", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!notesSessionId || !notesStudentEmail) return;
    setSavingNotes(true);
    try {
      await saveSessionNotes({
        session_name: notesSessionId,
        student: notesStudentEmail,
        notes: notesInternal,
        shared_with_student: notesShared
      });
      setNotesModalOpen(false);
      Alert.alert("Success", "Prep notes saved successfully.");
    } catch (err: any) {
      console.error("Failed to save notes:", err);
      Alert.alert("Error", err?.message || "Failed to save notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRescheduleClick = (session: any) => {
    setSelectedSessionId(session.name);
    setSelectedSessionMentor(session.mentor);
    setSelectedSessionStudent(session.student);
    setRescheduleDate("");
    setRescheduleFromTime("");
    setRescheduleToTime("");
    setRescheduleModalOpen(true);
  };

  const submitReschedule = async () => {
    if (!selectedSessionId || !rescheduleDate || !rescheduleFromTime || !rescheduleToTime) return;
    setSubmittingReschedule(true);
    try {
      const formatTimeToSeconds = (t: string) => {
        return t.split(':').length === 2 ? `${t}:00` : t;
      };
      await rescheduleSession({
        session_name: selectedSessionId,
        new_date: rescheduleDate,
        new_from_time: formatTimeToSeconds(rescheduleFromTime),
        new_to_time: formatTimeToSeconds(rescheduleToTime),
        mentor: selectedSessionMentor,
        student: selectedSessionStudent
      });
      setRescheduleModalOpen(false);
      Alert.alert("Success", "Session rescheduled successfully.");
      fetchData(true);
    } catch (err: any) {
      console.error("Failed to reschedule session:", err);
      Alert.alert("Error", err?.message || "Failed to reschedule session.");
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleBlockTime = async () => {
    if (!userName || !blockDate || !blockFromTime || !blockToTime) return;
    setSubmittingBlock(true);
    try {
      const formatTimeToSeconds = (t: string) => {
        return t.split(':').length === 2 ? `${t}:00` : t;
      };
      await blockTime({
        mentor: userName,
        date: blockDate,
        from_time: formatTimeToSeconds(blockFromTime),
        to_time: formatTimeToSeconds(blockToTime),
        reason: blockReason
      });
      setBlockDate("");
      setBlockFromTime("");
      setBlockToTime("");
      setBlockReason("");
      setBlockModalOpen(false);
      Alert.alert("Success", "Time blocked successfully.");
      fetchData(true);
    } catch (err: any) {
      console.error("Failed to block time:", err);
      Alert.alert("Error", err?.message || "Failed to block time.");
    } finally {
      setSubmittingBlock(false);
    }
  };

  const handleClearAvailability = async () => {
    if (!userName) return;
    Alert.alert(
      "Clear All Availability",
      "Are you sure you want to clear all your availability slots? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteMentorAvailability(userName);
              Alert.alert("Success", "All availability slots cleared.");
              fetchCalendar();
            } catch (err: any) {
              console.error("Failed to clear availability:", err);
              Alert.alert("Error", err?.message || "Failed to clear availability.");
            }
          }
        }
      ]
    );
  };

  const handleSaveAvailability = async () => {
    if (!userName) return;
    setSubmittingAvailability(true);
    try {
      const formatTimeToSeconds = (t: string) => {
        return t ? (t.split(':').length === 2 ? `${t}:00` : t) : "";
      };
      
      let payload: any = {
        mentor: userName,
        schedule_type: scheduleType
      };
      
      if (scheduleType === 'Each Day Same Schedule') {
        if (sameScheduleSelectedDays.length === 0) {
          throw new Error("Please select at least one day.");
        }
        if (!sameScheduleFromTime || !sameScheduleToTime) {
          throw new Error("Please select both From and To times.");
        }
        payload.from_time = formatTimeToSeconds(sameScheduleFromTime);
        payload.to_time = formatTimeToSeconds(sameScheduleToTime);
        payload.days_multi = sameScheduleSelectedDays.map(day => ({ day }));
      } else {
        const dailySchedule = Object.entries(differentScheduleDays)
          .filter(([_, data]) => data.active)
          .map(([day, data]) => {
            if (!data.fromTime || !data.toTime) {
              throw new Error(`Please select both From and To times for ${day}.`);
            }
            return {
              day,
              from_time: formatTimeToSeconds(data.fromTime),
              to_time: formatTimeToSeconds(data.toTime)
            };
          });
        
        if (dailySchedule.length === 0) {
          throw new Error("Please configure and enable at least one day.");
        }
        payload.daily_schedule = dailySchedule;
      }
      
      await saveMentorAvailability(payload);
      
      // Reset Modal values
      setSameScheduleFromTime("");
      setSameScheduleToTime("");
      setSameScheduleSelectedDays([]);
      setDifferentScheduleDays({
        Monday: { active: false, fromTime: "", toTime: "" },
        Tuesday: { active: false, fromTime: "", toTime: "" },
        Wednesday: { active: false, fromTime: "", toTime: "" },
        Thursday: { active: false, fromTime: "", toTime: "" },
        Friday: { active: false, fromTime: "", toTime: "" },
        Saturday: { active: false, fromTime: "", toTime: "" },
        Sunday: { active: false, fromTime: "", toTime: "" }
      });
      setAvailabilityModalOpen(false);
      Alert.alert("Success", "Availability slots saved successfully.");
      fetchCalendar();
    } catch (err: any) {
      console.error("Failed to save availability:", err);
      Alert.alert("Error", err?.message || "Failed to save availability.");
    } finally {
      setSubmittingAvailability(false);
    }
  };

  // DateTimePicker triggers
  const triggerDatePicker = (target: string) => {
    setPickerMode(target);
    setDatePickerVisible(true);
  };

  const triggerTimePicker = (target: string) => {
    setPickerMode(target);
    setTimePickerVisible(true);
  };

  const handleDateConfirm = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    
    if (pickerMode === 'blockDate') setBlockDate(formatted);
    else if (pickerMode === 'rescheduleDate') setRescheduleDate(formatted);
    
    setDatePickerVisible(false);
    setPickerMode(null);
  };

  const handleTimeConfirm = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formatted = `${hours}:${minutes}`;
    
    if (pickerMode === 'blockFromTime') setBlockFromTime(formatted);
    else if (pickerMode === 'blockToTime') setBlockToTime(formatted);
    else if (pickerMode === 'rescheduleFromTime') setRescheduleFromTime(formatted);
    else if (pickerMode === 'rescheduleToTime') setRescheduleToTime(formatted);
    else if (pickerMode === 'sameScheduleFromTime') setSameScheduleFromTime(formatted);
    else if (pickerMode === 'sameScheduleToTime') setSameScheduleToTime(formatted);
    else if (pickerMode?.startsWith('diffFromTime_')) {
      const day = pickerMode.split('_')[1];
      setDifferentScheduleDays(prev => ({
        ...prev,
        [day]: { ...prev[day], fromTime: formatted }
      }));
    } else if (pickerMode?.startsWith('diffToTime_')) {
      const day = pickerMode.split('_')[1];
      setDifferentScheduleDays(prev => ({
        ...prev,
        [day]: { ...prev[day], toTime: formatted }
      }));
    }
    
    setTimePickerVisible(false);
    setPickerMode(null);
  };

  // Helper values for inputs display
  const formatDateLabel = (dStr: string) => {
    if (!dStr) return "Select Date";
    try {
      const parts = dStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dStr;
    }
  };

  const formatTimeLabel = (tStr: string) => {
    if (!tStr) return "Select Time";
    return formatTime(tStr);
  };

  // Memoized lists & paging
  const activeBookedSessions = useMemo(() => {
    return viewType === 'week' ? weeklyBooked : monthlyBooked;
  }, [viewType, weeklyBooked, monthlyBooked]);

  const totalBookedPages = Math.ceil(activeBookedSessions.length / ITEMS_PER_PAGE) || 1;
  const paginatedBooked = useMemo(() => {
    const start = (bookedSessionsPage - 1) * ITEMS_PER_PAGE;
    return activeBookedSessions.slice(start, start + ITEMS_PER_PAGE);
  }, [activeBookedSessions, bookedSessionsPage]);

  const totalUpcomingPages = Math.ceil(upcoming.length / ITEMS_PER_PAGE) || 1;
  const paginatedUpcoming = useMemo(() => {
    const start = (upcomingBookingsPage - 1) * ITEMS_PER_PAGE;
    return upcoming.slice(start, start + ITEMS_PER_PAGE);
  }, [upcoming, upcomingBookingsPage]);

  const availabilityGridData = useMemo(() => {
    return Object.keys(slotCalendar || {}).map(dateStr => {
      const slots = slotCalendar[dateStr];
      return {
        dayLabel: getDayName(dateStr),
        slots: Array.isArray(slots) ? slots.map(s => ({
          time: formatTimeSlot(s.from_time),
          status: s.status,
          reason: s.reason
        })) : []
      };
    });
  }, [slotCalendar]);

  const toggleDaySelection = (day: string) => {
    if (sameScheduleSelectedDays.includes(day)) {
      setSameScheduleSelectedDays(sameScheduleSelectedDays.filter(d => d !== day));
    } else {
      setSameScheduleSelectedDays([...sameScheduleSelectedDays, day]);
    }
  };

  const tabOptions = [
    { label: 'Booked Sessions', value: 'booked' },
    { label: 'Availability', value: 'availability' },
    { label: 'Upcoming', value: 'upcoming' }
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
            <Text style={styles.title}>Calendar</Text>
            <View style={styles.headerBadge}>
              <CalendarDays size={10} color="#4c1d95" />
              <Text style={styles.headerBadgeText}>SCHEDULES & SESSIONS</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Configure slots, block out holidays, and check upcoming bookings</Text>
        </Animated.View>

        {/* Tabs Bar */}
        <View style={styles.tabsWrapper}>
          <Tabs 
            tabs={tabOptions} 
            activeTab={activeTab} 
            onTabChange={(val: any) => setActiveTab(val)} 
          />
        </View>

        {/* Tab Contents */}
        {activeTab === 'booked' && (
          <View style={styles.tabContent}>
            {/* View Selector & Header */}
            <View style={styles.subHeaderRow}>
              <Text style={styles.sectionTitle}>Booked Sessions</Text>
              <View style={styles.viewToggleRow}>
                <TouchableOpacity 
                  style={[styles.toggleBtn, viewType === 'week' && styles.toggleBtnActive]}
                  onPress={() => setViewType('week')}
                >
                  <Text style={[styles.toggleBtnText, viewType === 'week' && styles.toggleBtnTextActive]}>Week</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleBtn, viewType === 'month' && styles.toggleBtnActive]}
                  onPress={() => setViewType('month')}
                >
                  <Text style={[styles.toggleBtnText, viewType === 'month' && styles.toggleBtnTextActive]}>Month</Text>
                </TouchableOpacity>
              </View>
            </View>

            {loadingBooked && activeBookedSessions.length === 0 ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color="#4c1d95" />
                <Text style={styles.loadingText}>Fetching booked sessions...</Text>
              </View>
            ) : paginatedBooked.length > 0 ? (
              <View style={styles.cardList}>
                {paginatedBooked.map((session, i) => {
                  const studentName = session.student_full_name || session.student_name || session.student?.split('@')[0] || "Student";
                  const avatarColor = getAvatarColors(studentName);
                  
                  let dateLabel = "";
                  if (session.session_date) {
                    const dateObj = new Date(session.session_date);
                    dateLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }
                  const timeLabel = formatTime(session.from_time);

                  return (
                    <Animated.View key={session.name} entering={FadeInUp.delay(100 + i * 50)} style={styles.bookedCard}>
                      <View style={styles.cardTop}>
                        <View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
                          <Text style={[styles.avatarText, { color: avatarColor.text }]}>{getInitials(studentName)}</Text>
                        </View>
                        <View style={styles.userMeta}>
                          <Text style={styles.userName}>{studentName}</Text>
                          <Text style={styles.sessionTopic} numberOfLines={1}>{session.topic || "Session"}</Text>
                        </View>
                      </View>

                      <View style={styles.detailsRow}>
                        <View style={styles.dateBadge}>
                          <CalendarDays size={12} color="#1E40AF" />
                          <Text style={styles.dateBadgeText}>{dateLabel} · {timeLabel}</Text>
                        </View>
                        <View style={styles.durationBadge}>
                          <Clock size={12} color="#475569" />
                          <Text style={styles.durationBadgeText}>{session.duration || 60} mins</Text>
                        </View>
                      </View>

                      <View style={styles.actionsRow}>
                        {!!session.meeting_link && (
                          <TouchableOpacity 
                            style={styles.joinBtn}
                            onPress={() => Linking.openURL(session.meeting_link).catch(e => Alert.alert("Error", "Could not open meeting link."))}
                          >
                            <Video size={13} color="#FFF" />
                            <Text style={styles.joinBtnText} numberOfLines={1} adjustsFontSizeToFit>Join Room</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity 
                          style={styles.notesBtn}
                          onPress={() => handleOpenNotes(session.name, session.student, studentName, session.topic)}
                        >
                          <FileText size={13} color="#1E293B" />
                          <Text style={styles.notesBtnText} numberOfLines={1} adjustsFontSizeToFit>Prep Notes</Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  );
                })}
                <Pagination 
                  currentPage={bookedSessionsPage}
                  totalPages={totalBookedPages}
                  onPageChange={setBookedSessionsPage}
                  activeColor="#4c1d95"
                />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Info size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Bookings Found</Text>
                <Text style={styles.emptySubtitle}>You have no booked sessions scheduled for this {viewType}.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'availability' && (
          <View style={styles.tabContent}>
            {/* Quick Actions */}
            <View style={styles.availabilityActionsRow}>
              <TouchableOpacity 
                style={styles.actionBtnOutline}
                onPress={() => setAvailabilityModalOpen(true)}
              >
                <Plus size={14} color="#4c1d95" />
                <Text style={styles.actionBtnOutlineText}>Set Availability</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtnOrange}
                onPress={() => setBlockModalOpen(true)}
              >
                <Lock size={14} color="#FFF" />
                <Text style={styles.actionBtnOrangeText}>Block Time</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtnClear}
                onPress={handleClearAvailability}
              >
                <Trash2 size={14} color="#DC2626" />
                <Text style={styles.actionBtnClearText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Weekly Availability Grid</Text>

            {loadingCalendar && availabilityGridData.length === 0 ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color="#4c1d95" />
                <Text style={styles.loadingText}>Fetching slots...</Text>
              </View>
            ) : availabilityGridData.length > 0 ? (
              <View style={styles.gridContainer}>
                {availabilityGridData.map((dayLine, i) => (
                  <View key={i} style={styles.gridRow}>
                    <Text style={styles.gridDayLabel}>{dayLine.dayLabel}</Text>
                    <View style={styles.gridSlotsContainer}>
                      {dayLine.slots.length === 0 ? (
                        <Text style={styles.noSlotsText}>No slots configured</Text>
                      ) : dayLine.slots.map((slot, j) => {
                        const isBooked = slot.status?.includes('booked');
                        const isBlocked = slot.status === 'blocked';

                        let slotStyle: any = styles.slotAvailable;
                        let slotTextStyle = styles.slotAvailableText;
                        if (isBooked) {
                          slotStyle = styles.slotBooked;
                          slotTextStyle = styles.slotBookedText;
                        } else if (isBlocked) {
                          slotStyle = styles.slotBlocked;
                          slotTextStyle = styles.slotBlockedText;
                        }

                        return (
                          <View key={j} style={[styles.slotPill, slotStyle]}>
                            <Text style={[styles.slotText, slotTextStyle]}>{slot.time}</Text>
                            {slot.status === 'booked_locked' && <Lock size={10} color="#FFF" />}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}

                {/* Legend */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                    <Text style={styles.legendText}>Booked</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' }]} />
                    <Text style={styles.legendText}>Available</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FEF2F2' }]} />
                    <Text style={styles.legendText}>Blocked</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Clock size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Grid Empty</Text>
                <Text style={styles.emptySubtitle}>No calendar slots generated yet. Set your weekly availability to open slots.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'upcoming' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>All Upcoming Bookings</Text>

            {loadingUpcoming && upcoming.length === 0 ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color="#4c1d95" />
                <Text style={styles.loadingText}>Fetching upcoming bookings...</Text>
              </View>
            ) : paginatedUpcoming.length > 0 ? (
              <View style={styles.cardList}>
                {paginatedUpcoming.map((session, i) => {
                  const studentName = session.student_full_name || session.student_name || session.student?.split('@')[0] || "Student";
                  const avatarColor = getAvatarColors(studentName);
                  
                  const dateObj = new Date(session.session_date);
                  const dateLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  const timeLabel = formatTime(session.from_time);

                  return (
                    <Animated.View key={session.name} entering={FadeInUp.delay(100 + i * 50)} style={styles.bookedCard}>
                      <View style={styles.cardTop}>
                        <View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
                          <Text style={[styles.avatarText, { color: avatarColor.text }]}>{getInitials(studentName)}</Text>
                        </View>
                        <View style={styles.userMeta}>
                          <View style={styles.upcomingIdRow}>
                            <Text style={styles.userName}>{studentName}</Text>
                            <Text style={styles.sessionId}>{session.name}</Text>
                          </View>
                          <Text style={styles.sessionTopic} numberOfLines={1}>{session.topic || "Session"}</Text>
                        </View>
                      </View>

                      <View style={styles.detailsRow}>
                        <View style={styles.dateBadge}>
                          <CalendarDays size={12} color="#1E40AF" />
                          <Text style={styles.dateBadgeText}>{dateLabel} · {timeLabel}</Text>
                        </View>
                        <View style={styles.durationBadge}>
                          <Clock size={12} color="#475569" />
                          <Text style={styles.durationBadgeText}>{session.duration || 60} mins</Text>
                        </View>
                      </View>

                      <View style={styles.actionsRow}>
                        {!!session.meeting_link && (
                          <TouchableOpacity 
                            style={styles.joinBtn}
                            onPress={() => Linking.openURL(session.meeting_link).catch(e => Alert.alert("Error", "Could not open meeting link."))}
                          >
                            <Video size={13} color="#FFF" />
                            <Text style={styles.joinBtnText} numberOfLines={1} adjustsFontSizeToFit>Join Room</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity 
                          style={styles.notesBtn}
                          onPress={() => handleOpenNotes(session.name, session.student, studentName, session.topic)}
                        >
                          <FileText size={13} color="#1E293B" />
                          <Text style={styles.notesBtnText} numberOfLines={1} adjustsFontSizeToFit>Prep Notes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.rescheduleBtn}
                          onPress={() => handleRescheduleClick(session)}
                        >
                          <Edit3 size={13} color="#64748B" />
                          <Text style={styles.rescheduleBtnText} numberOfLines={1} adjustsFontSizeToFit>Reschedule</Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  );
                })}
                <Pagination 
                  currentPage={upcomingBookingsPage}
                  totalPages={totalUpcomingPages}
                  onPageChange={setUpcomingBookingsPage}
                  activeColor="#4c1d95"
                />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Info size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Upcoming Sessions</Text>
                <Text style={styles.emptySubtitle}>You don't have any upcoming session bookings listed.</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Block Time Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={blockModalOpen}
        onRequestClose={() => setBlockModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Block Time</Text>
              <TouchableOpacity onPress={() => setBlockModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLbl}>DATE</Text>
                <TouchableOpacity
                  style={[styles.inputFld, styles.dateTimeSelector]}
                  onPress={() => triggerDatePicker('blockDate')}
                >
                  <Text style={{ color: blockDate ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                    {formatDateLabel(blockDate)}
                  </Text>
                  <CalendarDays size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLbl}>FROM TIME</Text>
                  <TouchableOpacity
                    style={[styles.inputFld, styles.dateTimeSelector]}
                    onPress={() => triggerTimePicker('blockFromTime')}
                  >
                    <Text style={{ color: blockFromTime ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                      {formatTimeLabel(blockFromTime)}
                    </Text>
                    <Clock size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLbl}>TO TIME</Text>
                  <TouchableOpacity
                    style={[styles.inputFld, styles.dateTimeSelector]}
                    onPress={() => triggerTimePicker('blockToTime')}
                  >
                    <Text style={{ color: blockToTime ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                      {formatTimeLabel(blockToTime)}
                    </Text>
                    <Clock size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLbl}>REASON (OPTIONAL)</Text>
                <TextInput
                  style={[styles.inputFld, styles.textArea]}
                  value={blockReason}
                  onChangeText={setBlockReason}
                  placeholder="e.g. Doctor appointment, holiday"
                  placeholderTextColor="#94A3B8"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setBlockModalOpen(false)}
                disabled={submittingBlock}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { opacity: blockDate && blockFromTime && blockToTime ? 1 : 0.6 }]}
                onPress={handleBlockTime}
                disabled={!blockDate || !blockFromTime || !blockToTime || submittingBlock}
              >
                {submittingBlock ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLbl}>NEW DATE</Text>
                <TouchableOpacity
                  style={[styles.inputFld, styles.dateTimeSelector]}
                  onPress={() => triggerDatePicker('rescheduleDate')}
                >
                  <Text style={{ color: rescheduleDate ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                    {formatDateLabel(rescheduleDate)}
                  </Text>
                  <CalendarDays size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLbl}>FROM TIME</Text>
                  <TouchableOpacity
                    style={[styles.inputFld, styles.dateTimeSelector]}
                    onPress={() => triggerTimePicker('rescheduleFromTime')}
                  >
                    <Text style={{ color: rescheduleFromTime ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                      {formatTimeLabel(rescheduleFromTime)}
                    </Text>
                    <Clock size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLbl}>TO TIME</Text>
                  <TouchableOpacity
                    style={[styles.inputFld, styles.dateTimeSelector]}
                    onPress={() => triggerTimePicker('rescheduleToTime')}
                  >
                    <Text style={{ color: rescheduleToTime ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                      {formatTimeLabel(rescheduleToTime)}
                    </Text>
                    <Clock size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

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
                  <Text style={styles.modalConfirmBtnText}>Reschedule</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Availability Configuration Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={availabilityModalOpen}
        onRequestClose={() => setAvailabilityModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Weekly Availability</Text>
              <TouchableOpacity onPress={() => setAvailabilityModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Type Switcher */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLbl}>AVAILABILITY TYPE</Text>
                <View style={styles.typeToggleRow}>
                  <TouchableOpacity 
                    style={[styles.typeSelectBtn, scheduleType === 'Each Day Same Schedule' && styles.typeSelectBtnActive]}
                    onPress={() => setScheduleType('Each Day Same Schedule')}
                  >
                    <Text style={[styles.typeSelectBtnText, scheduleType === 'Each Day Same Schedule' && styles.typeSelectBtnTextActive]}>Same Time Daily</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.typeSelectBtn, scheduleType === 'Each Day Different Schedule' && styles.typeSelectBtnActive]}
                    onPress={() => setScheduleType('Each Day Different Schedule')}
                  >
                    <Text style={[styles.typeSelectBtnText, scheduleType === 'Each Day Different Schedule' && styles.typeSelectBtnTextActive]}>Different Daily</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {scheduleType === 'Each Day Same Schedule' ? (
                <View style={{ gap: 16 }}>
                  {/* Days Selector */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLbl}>SELECT DAYS</Text>
                    <View style={styles.daysContainer}>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                        const isSelected = sameScheduleSelectedDays.includes(day);
                        return (
                          <TouchableOpacity
                            key={day}
                            style={[styles.dayChip, isSelected && styles.dayChipActive]}
                            onPress={() => toggleDaySelection(day)}
                          >
                            <Text style={[styles.dayChipText, isSelected && styles.dayChipTextActive]}>
                              {day.substring(0, 3)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLbl}>FROM TIME</Text>
                      <TouchableOpacity
                        style={[styles.inputFld, styles.dateTimeSelector]}
                        onPress={() => triggerTimePicker('sameScheduleFromTime')}
                      >
                        <Text style={{ color: sameScheduleFromTime ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                          {formatTimeLabel(sameScheduleFromTime)}
                        </Text>
                        <Clock size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLbl}>TO TIME</Text>
                      <TouchableOpacity
                        style={[styles.inputFld, styles.dateTimeSelector]}
                        onPress={() => triggerTimePicker('sameScheduleToTime')}
                      >
                        <Text style={{ color: sameScheduleToTime ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                          {formatTimeLabel(sameScheduleToTime)}
                        </Text>
                        <Clock size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={{ gap: 16 }}>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                    const dayConf = differentScheduleDays[day];
                    return (
                      <View key={day} style={styles.dayConfigRow}>
                        <View style={styles.daySwitchCol}>
                          <Text style={[styles.dayNameLabel, dayConf.active && styles.dayNameLabelActive]}>{day}</Text>
                          <Switch
                            value={dayConf.active}
                            onValueChange={(val: boolean) => setDifferentScheduleDays(prev => ({
                              ...prev,
                              [day]: { ...prev[day], active: val }
                            }))}
                            trackColor={{ false: "#CBD5E1", true: "#C084FC" }}
                            thumbColor={dayConf.active ? "#4c1d95" : "#F1F5F9"}
                          />
                        </View>

                        {dayConf.active && (
                          <View style={styles.dayTimesCol}>
                            <TouchableOpacity
                              style={[styles.dayTimeInput, { flex: 1 }]}
                              onPress={() => triggerTimePicker(`diffFromTime_${day}`)}
                            >
                              <Text style={styles.dayTimeInputText}>{formatTimeLabel(dayConf.fromTime)}</Text>
                            </TouchableOpacity>
                            <Text style={styles.toSeparator}>to</Text>
                            <TouchableOpacity
                              style={[styles.dayTimeInput, { flex: 1 }]}
                              onPress={() => triggerTimePicker(`diffToTime_${day}`)}
                            >
                              <Text style={styles.dayTimeInputText}>{formatTimeLabel(dayConf.toTime)}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAvailabilityModalOpen(false)}
                disabled={submittingAvailability}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSaveAvailability}
                disabled={submittingAvailability}
              >
                {submittingAvailability ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Save Availability</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Session Notes Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notesModalOpen}
        onRequestClose={() => setNotesModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Session Prep Notes</Text>
                <Text style={styles.notesSubtitleText}>{notesStudentName} — {notesTopic}</Text>
              </View>
              <TouchableOpacity onPress={() => setNotesModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {loadingNotes ? (
                <View style={styles.detailsLoading}>
                  <ActivityIndicator size="large" color="#4c1d95" />
                  <Text style={styles.loadingText}>Fetching existing notes...</Text>
                </View>
              ) : (
                <View style={{ gap: 16 }}>
                  {/* Shared with Student */}
                  <View style={styles.notesBlockShared}>
                    <View style={styles.notesBlockHeader}>
                      <View style={styles.notesTagShared}>
                        <User size={10} color="#047857" />
                        <Text style={styles.notesTagSharedText}>Shared with Student</Text>
                      </View>
                      <Text style={styles.notesHelpText}>Visible on student's dashboard</Text>
                    </View>
                    <TextInput
                      style={[styles.inputFld, styles.notesTextArea, { borderColor: '#A7F3D0' }]}
                      value={notesShared}
                      onChangeText={setNotesShared}
                      placeholder="Add takeaways, resources, or links for the student..."
                      placeholderTextColor="#94A3B8"
                      multiline={true}
                      numberOfLines={5}
                    />
                  </View>

                  {/* Internal Notes */}
                  <View style={styles.notesBlockPrivate}>
                    <View style={styles.notesBlockHeader}>
                      <View style={styles.notesTagPrivate}>
                        <Lock size={10} color="#B45309" />
                        <Text style={styles.notesTagPrivateText}>Internal Note Only</Text>
                      </View>
                      <Text style={styles.notesHelpText}>Only visible to you</Text>
                    </View>
                    <TextInput
                      style={[styles.inputFld, styles.notesTextArea, { borderColor: '#FDE68A' }]}
                      value={notesInternal}
                      onChangeText={setNotesInternal}
                      placeholder="Add reminders, preparation checklist, or feedback draft..."
                      placeholderTextColor="#94A3B8"
                      multiline={true}
                      numberOfLines={5}
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setNotesModalOpen(false)}
                disabled={savingNotes}
              >
                <Text style={styles.modalCancelBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSaveNotes}
                disabled={savingNotes || loadingNotes}
              >
                {savingNotes ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Save Notes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date & Time Picker Modal */}
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

  tabsWrapper: { marginBottom: 16 },
  tabContent: { gap: 12 },

  subHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },

  viewToggleRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 3, borderRadius: 10 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#4c1d95' },
  toggleBtnText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  toggleBtnTextActive: { color: '#FFF' },

  cardList: { gap: 16 },
  bookedCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800' },
  userMeta: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  sessionTopic: { fontSize: 13, color: '#64748B', fontWeight: '600' },

  upcomingIdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionId: { fontSize: 11, fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }), color: '#94A3B8', fontWeight: '600' },

  detailsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE' },
  dateBadgeText: { fontSize: 11, fontWeight: '700', color: '#1E40AF' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  durationBadgeText: { fontSize: 11, fontWeight: '700', color: '#475569' },

  actionsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  joinBtn: { flex: 1.2, backgroundColor: '#2563EB', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  joinBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  notesBtn: { flex: 1.3, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  notesBtnText: { color: '#C2410C', fontSize: 11, fontWeight: '700' },
  rescheduleBtn: { flex: 1.3, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  rescheduleBtnText: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  disabledBtn: { backgroundColor: '#94A3B8', opacity: 0.7 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, opacity: 0.8, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 20 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginTop: 12, marginBottom: 4 },
  emptySubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', textAlign: 'center', lineHeight: 16 },

  loadingWrapper: { paddingVertical: 50, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B', fontWeight: '500' },

  // Availability layout
  availabilityActionsRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  actionBtnOutline: { flex: 1, minWidth: 100, backgroundColor: 'rgba(76, 29, 149, 0.04)', borderWidth: 1, borderColor: 'rgba(76, 29, 149, 0.2)', paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionBtnOutlineText: { color: '#4c1d95', fontSize: 11, fontWeight: '800' },
  actionBtnOrange: { flex: 1, minWidth: 100, backgroundColor: '#F97316', paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionBtnOrangeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  actionBtnClear: { flex: 1, minWidth: 100, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2', paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionBtnClearText: { color: '#DC2626', fontSize: 11, fontWeight: '800' },

  gridContainer: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  gridRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F8FAFC', paddingVertical: 12, alignItems: 'flex-start' },
  gridDayLabel: { width: 110, fontSize: 11, fontWeight: '800', color: '#64748B', marginTop: 4 },
  gridSlotsContainer: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  noSlotsText: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic', marginTop: 4 },

  slotPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  slotAvailable: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  slotAvailableText: { color: '#475569' },
  slotBooked: { backgroundColor: '#F97316' },
  slotBookedText: { color: '#FFF' },
  slotBlocked: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  slotBlockedText: { color: '#DC2626' },
  slotText: { fontSize: 10, fontWeight: '700' },

  legendContainer: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 12, paddingTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontWeight: '600', color: '#64748B' },

  footerSpacer: { height: 40 },

  // Modals Styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  notesSubtitleText: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20 },

  modalBody: { gap: 16, marginBottom: 16 },
  inputGroup: { marginBottom: 14 },
  inputLbl: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 0.5, marginBottom: 6 },
  inputFld: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#0F172A', fontWeight: '600' },
  dateTimeSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputRow: { flexDirection: 'row', gap: 10 },
  textArea: { minHeight: 60, textAlignVertical: 'top' },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancelBtn: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modalCancelBtnText: { color: '#64748B', fontSize: 13, fontWeight: '800' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#F97316', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalConfirmBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  // Availability modal specific
  typeToggleRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 3, borderRadius: 10 },
  typeSelectBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  typeSelectBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  typeSelectBtnText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  typeSelectBtnTextActive: { color: '#0F172A', fontWeight: '800' },

  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  dayChipActive: { backgroundColor: '#4c1d95', borderColor: '#4c1d95' },
  dayChipText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  dayChipTextActive: { color: '#FFF', fontWeight: '800' },

  dayConfigRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  daySwitchCol: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayNameLabel: { fontSize: 13, fontWeight: '700', color: '#94A3B8', width: 90 },
  dayNameLabelActive: { color: '#1E293B', fontWeight: '800' },
  dayTimesCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  dayTimeInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  dayTimeInputText: { fontSize: 11, fontWeight: '600', color: '#0F172A' },
  toSeparator: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },

  // Prep notes specific
  detailsLoading: { paddingVertical: 30, alignItems: 'center' },
  notesTextArea: { minHeight: 90, textAlignVertical: 'top', backgroundColor: '#FFF', borderWidth: 1, fontSize: 13, color: '#334155', fontWeight: '500' },
  notesBlockShared: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#D1FAE5', borderRadius: 16, padding: 12 },
  notesBlockPrivate: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FEF3C7', borderRadius: 16, padding: 12 },
  notesBlockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  notesTagShared: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  notesTagSharedText: { fontSize: 9, fontWeight: '800', color: '#065F46' },
  notesTagPrivate: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  notesTagPrivateText: { fontSize: 9, fontWeight: '800', color: '#92400E' },
  notesHelpText: { fontSize: 10, color: '#64748B', fontWeight: '500' }
});
