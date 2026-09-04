import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  Modal, 
  RefreshControl,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Star, 
  Calendar, 
  Clock, 
  Briefcase, 
  UserSquare2,
  Search,
  Filter,
  ChevronRight,
  X,
  BookOpen,
  Mail,
  Target,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronLeft,
  ArrowRight
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { SwipeableRow } from '@/components/Shared/SwipeableRow';
import { 
  getMentorList, 
  getMentorSlotCalendar, 
  bookMentorSlot, 
  getMentorNextAvailableSlot, 
  getBookedSessions, 
  getMentorOfferings,
  initiateSessionBooking,
  verifySessionPayment,
  getNewGroupWorkshopOfferings,
  getSessionNote,
  submitSessionReview,
  getSessionReviewStatus
} from '@/api/student.services';
import { WebView } from 'react-native-webview';

const AVATAR_COLORS = [
  "#9333EA", "#2563EB", "#10B981", "#F59E0B", "#EC4899", "#6366F1"
];

export const StudentMentorsScreen = () => {
  const { userName } = useAuth();
  const [activeTab, setActiveTab] = useState<'group_sessions' | 'workshops' | 'booked_sessions' | 'mentors'>('group_sessions');
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Booked sessions
  const [bookedSessions, setBookedSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Search & Pagination
  const [searchVal, setSearchVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceTimeoutRef = useRef<any>(null);

  // Booking Modal
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loadingOfferings, setLoadingOfferings] = useState(false);

  // Group Sessions & Workshops offerings
  const [groupOfferings, setGroupOfferings] = useState<any[]>([]);
  const [loadingGroupOfferings, setLoadingGroupOfferings] = useState(true);
  const [groupOfferingSearch, setGroupOfferingSearch] = useState('');
  const [selectedOffering, setSelectedOffering] = useState<any | null>(null);
  const [slotCalendar, setSlotCalendar] = useState<any>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [bookingTopic, setBookingTopic] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [groupSessionData, setGroupSessionData] = useState<any | null>(null);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentData, setPaymentData] = useState<any | null>(null);

  // Review & Note Modal State
  const [reviewSession, setReviewSession] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [viewingNoteSession, setViewingNoteSession] = useState<any | null>(null);
  const [sessionNoteText, setSessionNoteText] = useState<string | null>(null);
  const [isLoadingNote, setIsLoadingNote] = useState<boolean>(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const getOfferingTypeBadgeStyle = (type: string) => {
    if (type === 'Group Session') {
      return {
        bg: { backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
        text: { color: '#4F46E5', fontSize: 9, fontWeight: '700' as const, textTransform: 'uppercase' as const }
      };
    } else {
      return {
        bg: { backgroundColor: 'rgba(249, 115, 22, 0.1)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
        text: { color: '#EA580C', fontSize: 9, fontWeight: '700' as const, textTransform: 'uppercase' as const }
      };
    }
  };

  // Debounced search logic
  const searchInputRef = useRef<TextInput>(null);
  const tabScrollViewRef = useRef<ScrollView>(null);

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setSearchQuery(val);
      setCurrentPage(1);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!loading && searchVal && searchInputRef.current) {
      if (!searchInputRef.current.isFocused()) {
        searchInputRef.current.focus();
      }
    }
  }, [loading, searchVal]);

  // Fetch mentors list
  const fetchMentorsList = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMentorList(page, 20, search);
      const dataObj = res?.data || {};
      const mentorList = dataObj.Mentor || [];
      const paginationData = dataObj.pagination || {
        total: mentorList.length,
        page: page,
        page_size: 20,
        total_pages: 1,
        has_next: false,
        has_prev: false
      };

      if (Array.isArray(mentorList)) {
        const mapped = mentorList.map((m: any, index: number) => {
          const name = `${m.first_name || ""} ${m.last_name || ""}`.trim() || m.name || "Unknown Mentor";
          const initials = name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "M";

          const expertise = m.domain 
            ? [m.domain, m.other_domain].filter(Boolean)
            : (m.type && m.type !== "RAW" ? [m.type] : []);

          return {
            id: m.name || `mentor-${index}`,
            name,
            email: m.email_id || m.name || "",
            initials,
            role: m.role || m.type || "Mentor",
            company: m.company || "Independent",
            expertise,
            rating: m.avg_rating || 0,
            sessions: m.total_sessions || 0,
            hourlyRate: "Free",
            availability: "Contact for availability",
            tags: expertise,
            avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
            profileImage: m.profile_image || "",
            offering_type: "1:1 Mentorship",
            nextAvailableSlot: undefined
          };
        });
        setMentors(mapped);
        setTotalPages(paginationData.total_pages || 1);
      } else {
        setMentors([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setError("Failed to load mentors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch booked sessions
  const fetchBookedSessions = useCallback(async () => {
    if (!userName) return;
    try {
      setLoadingSessions(true);
      const res = await getBookedSessions(userName);
      const data = res?.message || res?.data || res;
      if (data && Array.isArray(data)) {
        const sessions = data;
        const reviewChecks = await Promise.allSettled(
          sessions
            .filter(s => s.status === "Completed")
            .map(async s => {
              try {
                const r = await getSessionReviewStatus({ booking_name: s.name });
                return { name: s.name, already_reviewed: r?.message?.already_reviewed ?? false };
              } catch {
                return { name: s.name, already_reviewed: false };
              }
            })
        );
        const reviewMap: Record<string, boolean> = {};
        reviewChecks.forEach(result => {
          if (result.status === "fulfilled") {
            reviewMap[result.value.name] = result.value.already_reviewed;
          }
        });
        setBookedSessions(sessions.map(s => ({
          ...s,
          already_reviewed: reviewMap[s.name] ?? false,
        })));
      } else {
        setBookedSessions([]);
      }
    } catch (err) {
      console.error("Error fetching booked sessions:", err);
      setBookedSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, [userName]);

  // Load initial data
  useEffect(() => {
    fetchMentorsList(currentPage, searchQuery);
  }, [currentPage, searchQuery, fetchMentorsList]);

  useEffect(() => {
    fetchBookedSessions();
  }, [fetchBookedSessions]);

  // Fetch group/workshop offerings
  const fetchGroupOfferings = useCallback(async (type: string, search?: string) => {
    try {
      setLoadingGroupOfferings(true);
      const res = await getNewGroupWorkshopOfferings({ offering_type: type, search });
      const data = res?.message?.data || res?.data || res?.message || (Array.isArray(res) ? res : []);
      setGroupOfferings(Array.isArray(data) ? data.filter(Boolean) : []);
    } catch (err) {
      console.error('Error fetching group offerings:', err);
      setGroupOfferings([]);
    } finally {
      setLoadingGroupOfferings(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'group_sessions') {
      fetchGroupOfferings('Group Session', groupOfferingSearch || undefined);
    } else if (activeTab === 'workshops') {
      fetchGroupOfferings('Workshop', groupOfferingSearch || undefined);
    }
  }, [activeTab, groupOfferingSearch, fetchGroupOfferings]);

  // Next slots prefetch
  useEffect(() => {
    if (mentors.length > 0 && mentors.some(m => !m.nextAvailableSlot)) {
      const fetchSlots = async () => {
        const updateMentorSlot = async (mentorEmail: string) => {
          try {
            const response = await getMentorNextAvailableSlot(mentorEmail);
            if (response && response.message) {
              setMentors(current => 
                current.map(m => 
                  m.email === mentorEmail 
                    ? { ...m, nextAvailableSlot: response.message } 
                    : m
                )
              );
            }
          } catch (err) {
            console.error(`Error fetching slot for ${mentorEmail}:`, err);
          }
        };
        await Promise.all(mentors.map(m => updateMentorSlot(m.email)));
      };
      fetchSlots();
    }
  }, [mentors.length]);

  const handleOpenReview = (session: any) => {
    setReviewSession(session);
    setReviewRating(0);
    setReviewText("");
    setReviewError(null);
    setReviewSuccess(false);
  };

  const handleOpenNote = async (session: any) => {
    setViewingNoteSession(session);
    setIsLoadingNote(true);
    setNoteError(null);
    setSessionNoteText(null);
    try {
      const res = await getSessionNote(session.name, userName || "");
      if (res?.message && res.message.status === "success") {
        setSessionNoteText(res.message.data?.shared_with_student || "");
      } else {
        setNoteError(res?.message?.message || "Failed to load session note.");
      }
    } catch (err: any) {
      setNoteError(err?.message || "Failed to load session note.");
    } finally {
      setIsLoadingNote(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewSession) return;
    if (reviewRating < 1) {
      setReviewError("Please select a star rating.");
      return;
    }
    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      await submitSessionReview({
        booking_name: reviewSession.name,
        rating: reviewRating,
        review: reviewText.trim() || "Great session!",
      });
      setReviewSuccess(true);
      setBookedSessions(prev =>
        prev.map(s => s.name === reviewSession.name ? { ...s, already_reviewed: true } : s)
      );
      setTimeout(() => setReviewSession(null), 1500);
    } catch (err: any) {
      setReviewError(err?.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await Promise.all([
      fetchMentorsList(1, searchQuery),
      fetchBookedSessions()
    ]);
    setRefreshing(false);
  };

  const isSessionAlreadyBooked = (mentor: any) => {
    return bookedSessions.some(session => 
      session.mentor === mentor.email && 
      session.offering_type === mentor.offering_type &&
      (session.status === 'Scheduled' || session.status === 'Accepted')
    );
  };

  // Open booking flow modal
  const handleOpenBooking = async (mentor: any) => {
    setSelectedMentor(mentor);
    setSelectedOffering(null);
    setSelectedSlot(null);
    setSelectedDate(null);
    setBookingTopic("");
    setSlotCalendar({});
    setGroupSessionData(null);
    setBookingModalVisible(true);
    setLoadingOfferings(true);

    try {
      const response = await getMentorOfferings(mentor.email);
      const data = response?.message?.data || response?.message || response?.data || [];
      setOfferings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading offerings:", err);
      setOfferings([]);
    } finally {
      setLoadingOfferings(false);
    }
  };

  const handleSelectOffering = async (offering: any) => {
    setSelectedOffering(offering);
    setLoadingSlots(true);
    setSelectedSlot(null);
    setSelectedDate(null);
    setBookingTopic("");
    setGroupSessionData(null);

    try {
      const response = await getMentorSlotCalendar(selectedMentor.email, offering.name);
      const msg = response?.message;
      if (msg) {
        if (msg.offering_type === "Group Session") {
          setGroupSessionData(msg);
          setSlotCalendar({});
        } else {
          setGroupSessionData(null);
          setSlotCalendar(msg);
          const dates = Object.keys(msg);
          if (dates.length > 0) {
            dates.sort();
            setSelectedDate(dates[0]);
          } else {
            setSelectedDate(null);
          }
        }
      } else {
        setSlotCalendar({});
        setSelectedDate(null);
      }
    } catch (err) {
      console.error("Error loading slots:", err);
      setSlotCalendar({});
    } finally {
      setLoadingSlots(false);
    }
  };

  const startPaymentCheckout = (initData: any, amount: number, description: string) => {
    setPaymentData({
      apiKey: initData.api_key,
      orderId: initData.order_id,
      bookingId: initData.booking_id,
      amount: amount,
      description: description,
      studentEmail: userName || ""
    });
    setShowPaymentWebView(true);
  };

  const handlePaymentMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setShowPaymentWebView(false);
      
      if (data.status === "success") {
        setIsBooking(true);
        try {
          await verifySessionPayment({
            booking_id: paymentData.bookingId,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
          });
          
          setBookingModalVisible(false);
          setSelectedMentor(null);
          setSelectedOffering(null);
          setSelectedDate(null);
          setSelectedSlot(null);
          setBookingTopic("");
          setSlotCalendar({});
          setGroupSessionData(null);
          
          Alert.alert("Success", "Payment successful! Your session has been confirmed.");
          fetchMentorsList(currentPage, searchQuery);
          fetchBookedSessions();
        } catch (verifyErr) {
          console.error("Payment verification failed:", verifyErr);
          Alert.alert("Error", "Payment received but verification failed. Please contact support.");
        } finally {
          setIsBooking(false);
        }
      } else if (data.status === "failed") {
        Alert.alert("Error", `Payment failed: ${data.description || "Unknown error"}`);
      } else if (data.status === "cancelled") {
        Alert.alert("Cancelled", "Payment was cancelled.");
      }
    } catch (e) {
      console.error("Error parsing message from webview:", e);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    console.log("WebView Navigation URL:", navState.url);
    if (navState.url && navState.url.includes("verify_session_payment") && showPaymentWebView) {
      // The callback_url redirect has loaded!
      setShowPaymentWebView(false);
      setIsBooking(false);
      
      // Close all modals
      setBookingModalVisible(false);
      setSelectedMentor(null);
      setSelectedOffering(null);
      setSelectedDate(null);
      setSelectedSlot(null);
      setBookingTopic("");
      setSlotCalendar({});
      setGroupSessionData(null);

      const isGroup = selectedOffering?.offering_type === "Group Session" || groupSessionData;
      const successMsg = isGroup 
        ? "Payment successful! You have joined the group session." 
        : "Payment successful! Your session has been confirmed.";

      Alert.alert("Success", successMsg);
      fetchMentorsList(currentPage, searchQuery);
      fetchBookedSessions();
    }
  };

  const handleLoadStart = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log("WebView Load Start URL:", nativeEvent.url);
    if (nativeEvent.url && nativeEvent.url.includes("verify_session_payment") && showPaymentWebView) {
      setShowPaymentWebView(false);
      setIsBooking(false);
      
      // Close all modals
      setBookingModalVisible(false);
      setSelectedMentor(null);
      setSelectedOffering(null);
      setSelectedDate(null);
      setSelectedSlot(null);
      setBookingTopic("");
      setSlotCalendar({});
      setGroupSessionData(null);

      const isGroup = selectedOffering?.offering_type === "Group Session" || groupSessionData;
      const successMsg = isGroup 
        ? "Payment successful! You have joined the group session." 
        : "Payment successful! Your session has been confirmed.";

      Alert.alert("Success", successMsg);
      fetchMentorsList(currentPage, searchQuery);
      fetchBookedSessions();
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedMentor || !selectedOffering || !selectedDate || !selectedSlot) return;
    
    setIsBooking(true);
    try {
      const payload = {
        mentor: selectedMentor.email,
        student: userName || "",
        offering: selectedOffering.name,
        session_date: selectedDate,
        from_time: selectedSlot.from_time,
        to_time: selectedSlot.to_time,
        topic: bookingTopic || selectedOffering.title || "General Mentorship",
        amount: selectedOffering.price_per_session ?? 0,
      };

      const initResponse = await initiateSessionBooking(payload);
      const initData = initResponse?.message ?? initResponse;

      if (initData?.payment_required === false) {
        setBookingModalVisible(false);
        setSelectedMentor(null);
        setSelectedOffering(null);
        setSelectedDate(null);
        setSelectedSlot(null);
        setBookingTopic("");
        setSlotCalendar({});
        setGroupSessionData(null);

        Alert.alert("Success", `Session booked successfully! ID: ${initData?.booking_id ?? ""}`);
        fetchMentorsList(currentPage, searchQuery);
        fetchBookedSessions();
        return;
      }

      if (!initData?.api_key || !initData?.order_id || !initData?.booking_id) {
        throw new Error("Backend did not return required payment fields.");
      }

      startPaymentCheckout(initData, selectedOffering.price_per_session ?? 0, payload.topic);
    } catch (err: any) {
      console.error("Error confirming booking:", err);
      Alert.alert("Error", err.message || "Failed to initiate booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleConfirmGroupBooking = async () => {
    if (!selectedMentor || !selectedOffering || !groupSessionData) return;
    setIsBooking(true);
    try {
      const sessionPayload = {
        mentor: selectedMentor.email,
        student: userName || "",
        offering: selectedOffering.name,
        session_date: groupSessionData.start_date,
        from_time: groupSessionData.start_time,
        to_time: groupSessionData.end_time,
        topic: bookingTopic || groupSessionData.title || "Group Session",
        amount: groupSessionData.price_per_session ?? 0,
      };

      const initResponse = await initiateSessionBooking(sessionPayload);
      const initData = initResponse?.message ?? initResponse;

      if (initData?.payment_required === false) {
        setBookingModalVisible(false);
        setSelectedMentor(null);
        setSelectedOffering(null);
        setSelectedDate(null);
        setSelectedSlot(null);
        setBookingTopic("");
        setSlotCalendar({});
        setGroupSessionData(null);

        Alert.alert("Success", `Group session joined! ID: ${initData?.booking_id ?? ""}`);
        fetchMentorsList(currentPage, searchQuery);
        fetchBookedSessions();
        return;
      }

      if (!initData?.api_key || !initData?.order_id || !initData?.booking_id) {
        throw new Error("Backend did not return required payment fields.");
      }

      startPaymentCheckout(initData, groupSessionData.price_per_session ?? 0, sessionPayload.topic);
    } catch (err: any) {
      console.error("Error during group booking:", err);
      Alert.alert("Error", err.message || "Failed to initiate group booking.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelSession = (session: any) => {
    Alert.alert(
      "Cancel Session",
      `Are you sure you want to cancel the session with ${session.mentor}?`,
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive", 
          onPress: () => {
            setBookedSessions(prev => prev.filter(s => s.name !== session.name));
            Alert.alert("Success", "Session cancelled successfully!");
          } 
        }
      ]
    );
  };

  const renderBookingModal = () => {
    if (!selectedMentor) return null;
    return (
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Book Session</Text>
                <Text style={styles.modalSubtitle}>with {selectedMentor.name}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setBookingModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20 }}
            >
              {!selectedOffering ? (
                // Step 1: Select Offering
                loadingOfferings ? (
                  <View style={styles.modalLoaderContainer}>
                    <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
                    <Text style={styles.modalLoaderText}>Loading mentor offerings...</Text>
                  </View>
                ) : offerings.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <AlertCircle size={32} color="#94A3B8" />
                    <Text style={styles.emptyText}>No offerings available for this mentor.</Text>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.sectionLabel}>Select an Offering</Text>
                    {offerings.map((offering) => (
                      <TouchableOpacity
                        key={offering.name}
                        onPress={() => handleSelectOffering(offering)}
                        style={styles.offeringCard}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                            <Text style={styles.offeringTitle}>{offering.title}</Text>
                          </View>
                          <Text style={styles.offeringDesc} numberOfLines={2}>{offering.description}</Text>
                          <View style={styles.offeringMetaRow}>
                            <View style={getOfferingTypeBadgeStyle(offering.offering_type).bg}>
                              <Text style={getOfferingTypeBadgeStyle(offering.offering_type).text}>
                                {offering.offering_type}
                              </Text>
                            </View>
                            <Text style={styles.offeringMetaDivider}>•</Text>
                            <Text style={styles.offeringMetaText}>{offering.duration_minutes} mins</Text>
                          </View>
                        </View>
                        <View style={styles.offeringPriceBox}>
                          <Text style={styles.offeringPrice}>
                            {offering.price_per_session ? `₹${offering.price_per_session}` : "Free"}
                          </Text>
                          <Text style={styles.offeringPriceLabel}>Per Session</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )
              ) : (
                // Step 2: Slot/Booking details
                <View>
                  {/* Offering info card */}
                  <View style={styles.selectedOfferingBanner}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectedOfferingLabel}>SELECTED OFFERING</Text>
                      <Text style={styles.selectedOfferingTitle}>{selectedOffering.title}</Text>
                      <Text style={styles.selectedOfferingSub}>{selectedOffering.offering_type} • {selectedOffering.price_per_session ? `₹${selectedOffering.price_per_session}` : "Free"}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.changeBtn}
                      onPress={() => {
                        setSelectedOffering(null);
                        setSelectedSlot(null);
                        setSelectedDate(null);
                        setBookingTopic("");
                        setSlotCalendar({});
                        setGroupSessionData(null);
                      }}
                    >
                      <Text style={styles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                  </View>

                  {loadingSlots ? (
                    <View style={styles.modalLoaderContainer}>
                      <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
                      <Text style={styles.modalLoaderText}>Loading details...</Text>
                    </View>
                  ) : groupSessionData ? (
                    /* ── Group Session: fixed schedule info card ── */
                    <View style={{ marginTop: 20 }}>
                      <View style={styles.groupInfoCard}>
                        <View style={{ marginBottom: 12 }}>
                          <Text style={styles.groupTitle}>{groupSessionData.title}</Text>
                          <Text style={styles.groupDesc}>{groupSessionData.description}</Text>
                        </View>
                        
                        <View style={styles.groupMetaGrid}>
                          <View style={styles.groupMetaBox}>
                            <Text style={styles.groupMetaLabel}>Price</Text>
                            <Text style={styles.groupMetaValHighlight}>
                              {groupSessionData.price_per_session ? `₹${groupSessionData.price_per_session}` : "Free"}
                            </Text>
                          </View>
                          <View style={styles.groupMetaBox}>
                            <Text style={styles.groupMetaLabel}>Date</Text>
                            <Text style={styles.groupMetaVal}>
                              {new Date(groupSessionData.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                          </View>
                          <View style={styles.groupMetaBox}>
                            <Text style={styles.groupMetaLabel}>Time</Text>
                            <Text style={styles.groupMetaVal}>
                              {groupSessionData.start_time?.slice(0, 5)} - {groupSessionData.end_time?.slice(0, 5)}
                            </Text>
                          </View>
                          <View style={styles.groupMetaBox}>
                            <Text style={styles.groupMetaLabel}>Availability</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={styles.groupMetaVal}>{groupSessionData.seats_left} / {groupSessionData.max_group_size}</Text>
                              <Text style={[styles.groupMetaStatus, { color: groupSessionData.seat_status === 'open' ? '#10B981' : '#EF4444' }]}>
                                {groupSessionData.seat_status === 'open' ? ' ● Open' : ' ● Full'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Topic & Confirmation for Group Session */}
                      <Animated.View entering={FadeInUp} style={styles.topicConfirmContainer}>
                        <Text style={styles.fieldLabel}>Session Topic / Description (Optional)</Text>
                        <TextInput
                          placeholder="e.g. Mock Interview Prep"
                          placeholderTextColor="#94A3B8"
                          style={styles.topicInput}
                          value={bookingTopic}
                          onChangeText={setBookingTopic}
                        />

                        <TouchableOpacity 
                          style={[
                            styles.confirmBtn, 
                            (isBooking || groupSessionData.seat_status !== 'open') && { opacity: 0.7 }
                          ]}
                          onPress={handleConfirmGroupBooking}
                          disabled={isBooking || groupSessionData.seat_status !== 'open'}
                        >
                          {isBooking ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                          ) : (
                            <Text style={styles.confirmBtnText}>
                              {groupSessionData.seat_status !== 'open' ? "Session Full" : "Join Group Session"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                  ) : Object.keys(slotCalendar).length === 0 ? (
                    <View style={styles.emptyBox}>
                      <AlertCircle size={32} color="#94A3B8" />
                      <Text style={styles.emptyText}>No slots available for this mentor.</Text>
                    </View>
                  ) : (
                    <View style={{ marginTop: 20 }}>
                      {/* Date Select */}
                      <Text style={styles.sectionLabel}>Select Date</Text>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
                      >
                        {Object.keys(slotCalendar).map((date) => {
                          const dateObj = new Date(date);
                          const isSelected = selectedDate === date;
                          return (
                            <TouchableOpacity
                              key={date}
                              onPress={() => {
                                setSelectedDate(date);
                                setSelectedSlot(null);
                              }}
                              style={[
                                styles.dateButton,
                                isSelected && styles.dateButtonActive
                              ]}
                            >
                              <Text style={[styles.dateDayName, isSelected && styles.dateDayNameActive]}>
                                {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                              </Text>
                              <Text style={[styles.dateDayNumber, isSelected && styles.dateDayNumberActive]}>
                                {dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>

                      {/* Slots selector */}
                      {selectedDate && slotCalendar[selectedDate] && (
                        <View style={{ marginTop: 10 }}>
                          <Text style={styles.sectionLabel}>Available Slots</Text>
                          <View style={styles.slotsGrid}>
                            {slotCalendar[selectedDate].map((slot: any, idx: number) => {
                              const isAvailable = slot.status === "available";
                              const isSelected = selectedSlot === slot;
                              return (
                                <TouchableOpacity
                                  key={idx}
                                  disabled={!isAvailable}
                                  onPress={() => setSelectedSlot(slot)}
                                  style={[
                                    styles.slotButton,
                                    !isAvailable && styles.slotButtonDisabled,
                                    isSelected && styles.slotButtonSelected
                                  ]}
                                >
                                  <Text style={[
                                    styles.slotText,
                                    !isAvailable && styles.slotTextDisabled,
                                    isSelected && styles.slotTextSelected
                                  ]}>
                                    {slot.from_time.slice(0, 5)} - {slot.to_time.slice(0, 5)}
                                  </Text>
                                  <Text style={[
                                    styles.slotSubText,
                                    !isAvailable && styles.slotSubTextDisabled,
                                    isSelected && styles.slotSubTextSelected
                                  ]}>
                                    {isAvailable ? "Available" : "Booked"}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      )}

                      {/* Topic & Confirmation */}
                      {selectedSlot && (
                        <Animated.View entering={FadeInUp} style={styles.topicConfirmContainer}>
                          <Text style={styles.fieldLabel}>Session Topic / Description (Optional)</Text>
                          <TextInput
                            placeholder="e.g. Mock Interview Prep"
                            placeholderTextColor="#94A3B8"
                            style={styles.topicInput}
                            value={bookingTopic}
                            onChangeText={setBookingTopic}
                          />

                          <TouchableOpacity 
                            style={[styles.confirmBtn, isBooking && { opacity: 0.7 }]}
                            onPress={handleConfirmBooking}
                            disabled={isBooking}
                          >
                            {isBooking ? (
                              <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                            )}
                          </TouchableOpacity>
                        </Animated.View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent.DEFAULT} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <UserSquare2 size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>EXPERT GUIDANCE</Text>
          </View>
          <Text style={styles.title}>Mentors</Text>
          <Text style={styles.subtitle}>Connect with industry experts</Text>
        </Animated.View>

        {/* Segmented Tab Switcher */}
        <Animated.View entering={FadeInUp.delay(120)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity 
            onPress={() => tabScrollViewRef.current?.scrollTo({ x: 0, animated: true })}
            style={{ paddingRight: 4, paddingBottom: 4 }}
          >
            <ChevronLeft size={20} color="#94A3B8" />
          </TouchableOpacity>
          <ScrollView
            ref={tabScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.tabScrollContainer, { marginBottom: 0, flex: 1 }]}
            contentContainerStyle={styles.tabScrollContent}
          >
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'group_sessions' && styles.activeTabBtn]}
              onPress={() => setActiveTab('group_sessions')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'group_sessions' && styles.activeTabBtnText]}>
                Group Sessions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'workshops' && styles.activeTabBtn]}
              onPress={() => setActiveTab('workshops')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'workshops' && styles.activeTabBtnText]}>
                Workshops
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'booked_sessions' && styles.activeTabBtn]}
              onPress={() => setActiveTab('booked_sessions')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'booked_sessions' && styles.activeTabBtnText]}>
                Booked Sessions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'mentors' && styles.activeTabBtn]}
              onPress={() => setActiveTab('mentors')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'mentors' && styles.activeTabBtnText]}>
                Mentors List
              </Text>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity 
            onPress={() => tabScrollViewRef.current?.scrollToEnd({ animated: true })}
            style={{ paddingLeft: 4, paddingBottom: 4 }}
          >
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </Animated.View>

        {activeTab === 'group_sessions' || activeTab === 'workshops' ? (
          <View>
            <Animated.View entering={FadeInUp.delay(130)} style={styles.offeringsSection}>
              <Text style={styles.sectionTitle}>
                {activeTab === 'group_sessions' ? 'Group Sessions' : 'Workshops'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Expert-led {activeTab === 'group_sessions' ? 'group sessions' : 'workshops'} open to enroll
              </Text>

              {loadingGroupOfferings ? (
                <View style={styles.offeringLoader}>
                  <ActivityIndicator size="small" color="#F97316" />
                  <Text style={styles.offeringLoaderText}>
                    Loading {activeTab === 'group_sessions' ? 'group sessions' : 'workshops'}...
                  </Text>
                </View>
              ) : groupOfferings.length === 0 ? (
                <View style={styles.offeringEmpty}>
                  <Text style={styles.offeringEmptyText}>
                    No {activeTab === 'group_sessions' ? 'group sessions' : 'workshops'} available right now.
                  </Text>
                </View>
              ) : (
                <View style={styles.offeringList}>
                  {groupOfferings.map((offering, idx) => {
                    const isBooked = bookedSessions.some(session => session.offering === offering.name);
                    return (
                    <View key={offering.name || idx} style={styles.groupOfferingCard}>
                      {/* Header row */}
                      <View style={styles.groupOfferingHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={styles.groupOfferingTypeBadge}>
                            <Text style={styles.groupOfferingTypeText}>{offering.offering_type}</Text>
                          </View>
                          {isBooked && (
                            <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 8 }}>
                              <Text style={{ color: '#166534', fontSize: 10, fontWeight: '700' }}>Booked</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.groupOfferingDurationBadge}>
                          <Text style={styles.groupOfferingDurationText}>{offering.duration_minutes || 60} mins</Text>
                        </View>
                      </View>

                      {/* Title */}
                      <Text style={styles.groupOfferingTitle} numberOfLines={2}>
                        {offering.title}
                      </Text>

                      {/* Mentor + Category */}
                      <View style={styles.groupOfferingMentorRow}>
                        <View style={styles.groupOfferingAvatar}>
                          <Text style={styles.groupOfferingAvatarText}>
                            {(offering.mentor_full_name || offering.mentor || 'M').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.groupOfferingMentorName} numberOfLines={1}>
                          {offering.mentor_full_name || offering.mentor}
                        </Text>
                        {offering.category ? (
                          <View style={styles.groupOfferingCategoryBadge}>
                            <Text style={styles.groupOfferingCategoryText}>{offering.category}</Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Description */}
                      {offering.description ? (
                        <Text style={styles.groupOfferingDesc} numberOfLines={2}>{offering.description}</Text>
                      ) : null}

                      {/* Seats + Price */}
                      <View style={styles.groupOfferingMetaRow}>
                        <View style={styles.seatsBadge}>
                          <Text style={styles.seatsBadgeText}>
                            {offering.remaining_seats ?? offering.max_group_size ?? '—'} seats left
                          </Text>
                        </View>
                        <View style={styles.priceBadge}>
                          <Text style={styles.priceBadgeText}>
                            {offering.price_per_session ? `₹${offering.price_per_session}` : 'Free'}
                          </Text>
                        </View>
                      </View>

                      {/* Footer: date + join button */}
                      <View style={styles.groupOfferingFooter}>
                        <View>
                          <Text style={styles.groupOfferingDateLabel}>DATE &amp; TIME</Text>
                          <Text style={styles.groupOfferingDateValue}>
                            {offering.start_date
                              ? new Date(offering.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                              : 'Upcoming'}{' '}• {offering.start_time ? offering.start_time.slice(0, 5) : 'TBD'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.joinBtn, isBooked && { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 7 }]}
                          disabled={isBooked}
                          onPress={() => Alert.alert('Join Session', `Join "${offering.title}"?\n\nThis will open the booking flow.`)}
                        >
                          <Text style={[styles.joinBtnText, isBooked && { color: '#64748B' }]}>{isBooked ? 'Booked' : 'Join'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )})}
                </View>
              )}
            </Animated.View>
          </View>
        ) : activeTab === 'mentors' ? (
          <View>
            {/* Search Bar */}
            <Animated.View entering={FadeInUp.delay(150)} style={styles.searchContainer}>
              <Search size={18} color="#94A3B8" style={styles.searchIcon} />
              <TextInput 
                ref={searchInputRef}
                placeholder="search for email" 
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                value={searchVal}
                onChangeText={handleSearchChange}
              />
              <TouchableOpacity style={styles.filterButton} onPress={() => fetchMentorsList(1, searchQuery)}>
                 <Filter size={16} color="#64748B" />
              </TouchableOpacity>
            </Animated.View>

            {/* Mentors list or loading state */}
            {loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
                <Text style={styles.loadingText}>Loading mentors...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorBox}>
                <AlertCircle size={28} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMentorsList(currentPage, searchQuery)}>
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : mentors.length === 0 ? (
              <View style={styles.emptyBox}>
                <BookOpen size={36} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  {searchQuery ? "No mentors found matching your search." : "No mentors available at the moment."}
                </Text>
              </View>
            ) : (
              <View>
                <View style={styles.listContainer}>
                  {mentors.map((mentor, index) => {
                    const booked = isSessionAlreadyBooked(mentor);
                    const mentorActions = [
                      {
                        label: booked ? 'Booked' : 'Book Slot',
                        icon: BookOpen,
                        bgColor: booked ? '#F1F5F9' : '#FFF7ED',
                        color: booked ? '#94A3B8' : '#FF6B00',
                        onPress: () => {
                          if (!booked) {
                            handleOpenBooking(mentor);
                          }
                        }
                      }
                    ];
                    return (
                      <SwipeableRow key={mentor.id} actions={mentorActions}>
                        <View 
                          style={[styles.mentorCard, { marginBottom: 0 }]}
                        >
                          <View style={styles.cardHeader}>
                            <View style={styles.mentorInfo}>
                              {mentor.profileImage ? (
                                <View style={styles.avatar}>
                                  <View style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: 'hidden' }]} />
                                  <Animated.Image 
                                    source={{ uri: mentor.profileImage }} 
                                    style={{ width: 48, height: 48, borderRadius: 24 }}
                                  />
                                </View>
                              ) : (
                                <View style={[styles.avatar, { backgroundColor: mentor.avatarColor }]}>
                                  <Text style={styles.avatarText}>{mentor.initials}</Text>
                                </View>
                              )}
                              <View style={styles.mentorDetails}>
                                <Text style={styles.mentorName} numberOfLines={1}>{mentor.name}</Text>
                                <View style={styles.roleCompanyRow}>
                                  <Briefcase size={10} color="#64748B" />
                                  <Text style={styles.roleCompanyText} numberOfLines={1}>
                                    {mentor.role} • {mentor.company}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View style={[
                              styles.availBadge, 
                              booked ? styles.bookedBadge : styles.availableBadge
                            ]}>
                              <Text style={[
                                styles.availText,
                                booked ? styles.bookedText : styles.availableText
                              ]}>
                                {booked ? 'Booked' : 'Available'}
                              </Text>
                            </View>
                          </View>

                          {/* Expertise Tags */}
                          {mentor.expertise && mentor.expertise.length > 0 && (
                            <View style={styles.tagsContainer}>
                              {mentor.expertise.map((exp: string, idx: number) => (
                                <View key={idx} style={styles.tagBadge}>
                                  <Text style={styles.tagText}>{exp}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Stats Row */}
                          <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                              <Star size={14} color="#FBBF24" fill="#FBBF24" />
                              <Text style={styles.ratingText}>{Number(mentor.rating).toFixed(1)}</Text>
                              <Text style={styles.sessionsText}>({mentor.sessions})</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                              <Clock size={14} color="#94A3B8" />
                              <Text style={styles.rateText}>{mentor.hourlyRate}</Text>
                            </View>
                          </View>

                          {/* Next Available */}
                          <View style={styles.nextAvailBox}>
                            <Calendar size={14} color="#64748B" />
                            <Text style={styles.nextAvailLabel}>Next available: </Text>
                            <Text style={styles.nextAvailValue} numberOfLines={1}>
                              {mentor.nextAvailableSlot || mentor.availability}
                            </Text>
                          </View>
                        </View>
                      </SwipeableRow>
                    );
                  })}
                </View>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <View style={styles.paginationRow}>
                    <TouchableOpacity
                      disabled={currentPage === 1}
                      onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                    >
                      <ChevronLeft size={16} color={currentPage === 1 ? "#94A3B8" : "#475569"} />
                      <Text style={[styles.pageBtnText, currentPage === 1 && styles.pageBtnTextDisabled]}>Prev</Text>
                    </TouchableOpacity>

                    <Text style={styles.pageInfoText}>Page {currentPage} of {totalPages}</Text>

                    <TouchableOpacity
                      disabled={currentPage === totalPages}
                      onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                    >
                      <Text style={[styles.pageBtnText, currentPage === totalPages && styles.pageBtnTextDisabled]}>Next</Text>
                      <ChevronRight size={16} color={currentPage === totalPages ? "#94A3B8" : "#475569"} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          /* Booked Sessions Section */
          <View style={styles.bookedSessionsSection}>
            {loadingSessions ? (
              <View style={styles.sessionLoaderBox}>
                <ActivityIndicator size="small" color={colors.accent.DEFAULT} />
                <Text style={styles.sessionLoaderText}>Loading booked sessions...</Text>
              </View>
            ) : bookedSessions.length === 0 ? (
              <View style={styles.sessionEmptyBox}>
                <Calendar size={24} color="#94A3B8" style={{ marginBottom: 6 }} />
                <Text style={styles.sessionEmptyText}>No booked sessions found.</Text>
                <Text style={styles.sessionEmptySub}>Book a session with a mentor to get started!</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {bookedSessions.map((session, idx) => {
                  const dateFormatted = session.session_date ? new Date(session.session_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A";
                  const fromTimeStr = session.from_time ? session.from_time.slice(0, 5) : "TBD";
                  const toTimeStr = session.to_time ? session.to_time.slice(0, 5) : "TBD";
                  const isHigh = session.priority === 'High';
                  const isMedium = session.priority === 'Medium';
                  
                  return (
                    <SwipeableRow
                      key={session.id || idx}
                      onDelete={() => handleCancelSession(session)}
                    >
                      <View style={[styles.sessionCard, { marginBottom: 0 }]}>
                        <View style={styles.sessionHeaderRow}>
                          <Text style={styles.sessionName} numberOfLines={1}>{session.name}</Text>
                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            <View style={[
                              styles.priorityBadge,
                              isHigh ? styles.highPriority : (isMedium ? styles.mediumPriority : styles.lowPriority)
                            ]}>
                              <Text style={[
                                styles.priorityText,
                                isHigh ? styles.highPriorityText : (isMedium ? styles.mediumPriorityText : styles.lowPriorityText)
                              ]}>
                                {session.priority}
                              </Text>
                            </View>
                            <View style={[
                              styles.statusBadge,
                              (session.status === 'Scheduled' || session.status === 'Accepted') && styles.statusScheduled,
                              session.status === 'Completed' && styles.statusCompleted,
                              session.status === 'Cancelled' && styles.statusCancelled,
                              session.status === 'Pending' && styles.statusPending
                            ]}>
                              <Text style={[
                                styles.statusText,
                                (session.status === 'Scheduled' || session.status === 'Accepted') && styles.statusScheduledText,
                                session.status === 'Completed' && styles.statusCompletedText,
                                session.status === 'Cancelled' && styles.statusCancelledText,
                                session.status === 'Pending' && styles.statusPendingText
                              ]}>
                                {session.status}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.sessionInfoGrid}>
                          <View style={styles.sessionInfoItem}>
                            <Mail size={12} color="#64748B" />
                            <Text style={styles.sessionInfoVal} numberOfLines={1}>Mentor: {session.mentor}</Text>
                          </View>
                          <View style={styles.sessionInfoItem}>
                            <Calendar size={12} color="#64748B" />
                            <Text style={styles.sessionInfoVal}>{dateFormatted}</Text>
                          </View>
                          <View style={styles.sessionInfoItem}>
                            <Clock size={12} color="#64748B" />
                            <Text style={styles.sessionInfoVal}>{fromTimeStr} - {toTimeStr}</Text>
                          </View>
                          <View style={styles.sessionInfoItem}>
                            <Target size={12} color="#64748B" />
                            <Text style={styles.sessionInfoVal} numberOfLines={1}>{session.topic || "General Mentorship"}</Text>
                          </View>
                        </View>

                        <View style={styles.sessionFooterRow}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.sessionFooterVal}>Offering: </Text>
                            <View style={getOfferingTypeBadgeStyle(session.offering_type || "General").bg}>
                              <Text style={getOfferingTypeBadgeStyle(session.offering_type || "General").text}>
                                {session.offering_type || "General"}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.sessionFooterVal}>Duration: {session.duration ? `${session.duration} min` : "N/A"}</Text>
                        </View>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                          {session.status === 'Completed' && (
                            session.already_reviewed ? (
                              <View style={[styles.actionBtn, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                                <CheckCircle2 size={14} color="#10B981" />
                                <Text style={[styles.actionBtnText, { color: '#059669' }]}>Reviewed</Text>
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => handleOpenReview(session)}
                                style={[styles.actionBtn, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}
                              >
                                <Star size={14} color="#F97316" fill="#F97316" />
                                <Text style={[styles.actionBtnText, { color: '#EA580C' }]}>Rate Session</Text>
                              </TouchableOpacity>
                            )
                          )}
                          <TouchableOpacity
                            onPress={() => handleOpenNote(session)}
                            style={[styles.actionBtn, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}
                          >
                            <BookOpen size={14} color="#3B82F6" />
                            <Text style={[styles.actionBtnText, { color: '#2563EB' }]}>View Note</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </SwipeableRow>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {renderBookingModal()}

        {reviewSession && (
          <Modal visible animationType="fade" transparent onRequestClose={() => setReviewSession(null)}>
            <View style={styles.modalBackdrop}>
              <View style={styles.reviewModalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Rate this Session</Text>
                  <TouchableOpacity onPress={() => setReviewSession(null)}><X size={20} color="#64748B" /></TouchableOpacity>
                </View>
                <View style={styles.reviewModalBody}>
                  {reviewSuccess ? (
                    <View style={{ alignItems: 'center', padding: 20 }}>
                      <CheckCircle2 size={48} color="#10B981" />
                      <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '700', color: '#1E293B' }}>Review Submitted!</Text>
                      <Text style={{ marginTop: 4, fontSize: 14, color: '#64748B' }}>Thank you for your feedback.</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 12 }}>Your Rating <Text style={{ color: '#EF4444' }}>*</Text></Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                            <Star size={36} color={star <= reviewRating ? "#FBBF24" : "#E2E8F0"} fill={star <= reviewRating ? "#FBBF24" : "transparent"} />
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8 }}>Your Review (optional)</Text>
                      <TextInput
                        value={reviewText}
                        onChangeText={setReviewText}
                        placeholder="Share your experience..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={4}
                        style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, height: 100, textAlignVertical: 'top' }}
                      />
                      {reviewError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginTop: 12 }}>
                          <AlertCircle size={16} color="#EF4444" />
                          <Text style={{ color: '#EF4444', fontSize: 12, flex: 1 }}>{reviewError}</Text>
                        </View>
                      )}
                      <TouchableOpacity 
                        onPress={handleSubmitReview}
                        disabled={isSubmittingReview || reviewRating < 1}
                        style={{ backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24, opacity: (isSubmittingReview || reviewRating < 1) ? 0.5 : 1 }}
                      >
                        {isSubmittingReview ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>Submit Review</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          </Modal>
        )}

        {viewingNoteSession && (
          <Modal visible animationType="fade" transparent onRequestClose={() => setViewingNoteSession(null)}>
            <View style={styles.modalBackdrop}>
              <View style={styles.reviewModalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Mentor's Shared Note</Text>
                  <TouchableOpacity onPress={() => setViewingNoteSession(null)}><X size={20} color="#64748B" /></TouchableOpacity>
                </View>
                <View style={styles.reviewModalBody}>
                  {isLoadingNote ? (
                    <View style={{ alignItems: 'center', padding: 30 }}>
                      <ActivityIndicator size="large" color="#3B82F6" />
                      <Text style={{ marginTop: 12, color: '#64748B' }}>Fetching shared notes...</Text>
                    </View>
                  ) : noteError ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12 }}>
                      <AlertCircle size={20} color="#EF4444" />
                      <Text style={{ color: '#EF4444', flex: 1 }}>{noteError}</Text>
                    </View>
                  ) : sessionNoteText ? (
                    <ScrollView style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', maxHeight: 300 }}>
                      <Text style={{ color: '#334155', fontSize: 14, lineHeight: 22 }}>{sessionNoteText}</Text>
                    </ScrollView>
                  ) : (
                    <View style={{ alignItems: 'center', padding: 30, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed' }}>
                      <BookOpen size={36} color="#CBD5E1" />
                      <Text style={{ marginTop: 12, fontSize: 14, fontWeight: '600', color: '#64748B' }}>No notes shared yet</Text>
                      <Text style={{ marginTop: 4, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>The mentor has not shared any preparation or follow-up notes for this session.</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Razorpay Checkout WebView Modal */}
        <Modal
          visible={showPaymentWebView}
          animationType="slide"
          onRequestClose={() => {
            setShowPaymentWebView(false);
            setIsBooking(false);
          }}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <View style={{
              height: 56,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#e2e8f0',
              backgroundColor: '#ffffff'
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>Payment Checkout</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowPaymentWebView(false);
                  setIsBooking(false);
                }}
                style={{ padding: 8 }}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            {paymentData && (
              <WebView
                originWhitelist={['*']}
                source={{ html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                      <style>
                        body {
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          height: 100vh;
                          margin: 0;
                          background-color: #f8fafc;
                          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        }
                        .loader {
                          border: 4px solid #f3f3f3;
                          border-top: 4px solid #6366f1;
                          border-radius: 50%;
                          width: 40px;
                          height: 40px;
                          animation: spin 1s linear infinite;
                        }
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      </style>
                    </head>
                    <body>
                      <div class="loader"></div>
                      <script>
                        const options = {
                          key: "${paymentData.apiKey}",
                          amount: "${paymentData.amount * 100}",
                          currency: "INR",
                          name: "StrideNex Mentorship",
                          description: "${paymentData.description || 'Session booking'}",
                          order_id: "${paymentData.orderId}",
                          prefill: {
                            email: "${paymentData.studentEmail}"
                          },
                          theme: {
                            color: "#6366f1"
                          },
                          callback_url: "https://devstridenex.quantcloud.in/api/method/quantbit_billing_platform.quantbit_billing_platform.api.verify_session_payment?booking_id=${paymentData.bookingId}",
                          redirect: true,
                          modal: {
                            ondismiss: function () {
                              const data = { status: "cancelled" };
                              window.ReactNativeWebView.postMessage(JSON.stringify(data));
                            }
                          }
                        };
                        const rzp = new Razorpay(options);
                        window.onload = function() {
                          rzp.open();
                        };
                      </script>
                    </body>
                  </html>
                ` }}
                onMessage={handlePaymentMessage}
                onNavigationStateChange={handleNavigationStateChange}
                onLoadStart={handleLoadStart}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                javaScriptCanOpenWindowsAutomatically={true}
                setSupportMultipleWindows={false}
                mixedContentMode="always"
                userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
                style={{ flex: 1 }}
              />
            )}
          </SafeAreaView>
        </Modal>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 110 },
  
  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255, 107, 0, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.accent.DEFAULT, letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 20, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#1E293B', fontWeight: '500' },
  filterButton: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  
  loadingContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  loadingText: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 10 },
  
  errorBox: { padding: 24, backgroundColor: '#FEF2F2', borderRadius: 20, borderWidth: 1, borderColor: '#FEE2E2', alignItems: 'center', marginVertical: 20 },
  errorText: { fontSize: 13, color: '#EF4444', fontWeight: '600', marginTop: 8, textAlign: 'center', marginBottom: 14 },
  retryBtn: { backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  retryBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  emptyBox: { padding: 40, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1.5, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  emptyText: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 10, textAlign: 'center', lineHeight: 18 },

  listContainer: { gap: 16 },
  mentorCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderLeftWidth: 4, borderLeftColor: '#FF6B00', borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  mentorInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1.5, borderColor: '#F1F5F9' },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  mentorDetails: { flex: 1, marginRight: 8 },
  mentorName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  roleCompanyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roleCompanyText: { fontSize: 11, fontWeight: '600', color: '#64748B', flexShrink: 1 },
  
  availBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  availableBadge: { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.15)' },
  availableText: { fontSize: 9, fontWeight: '700', color: '#059669' },
  bookedBadge: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  bookedText: { fontSize: 9, fontWeight: '700', color: '#475569' },
  availText: { textTransform: 'uppercase', letterSpacing: 0.5 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tagBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  tagText: { fontSize: 9, fontWeight: '600', color: '#475569' },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  sessionsText: { fontSize: 11, fontWeight: '500', color: '#94A3B8' },
  statDivider: { width: 1, height: 12, backgroundColor: '#E2E8F0' },
  rateText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  
  nextAvailBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  nextAvailLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  nextAvailValue: { fontSize: 11, fontWeight: '700', color: '#1E293B', flex: 1 },
  
  actionsRow: { flexDirection: 'row', gap: 10 },
  bookButton: { flex: 1, backgroundColor: colors.accent.DEFAULT, paddingVertical: 12, borderRadius: 12, alignItems: 'center', shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 },
  bookButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  bookedButtonContainer: { flex: 1, backgroundColor: '#E2E8F0', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bookedButtonLabel: { color: '#64748B', fontSize: 13, fontWeight: '700' },
  iconButton: { width: 44, height: 44, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1.5, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

  // Pagination styling
  paginationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 4 },
  pageBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  pageBtnDisabled: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9', opacity: 0.5 },
  pageBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  pageBtnTextDisabled: { color: '#94A3B8' },
  pageInfoText: { fontSize: 12, fontWeight: '600', color: '#64748B' },

  // Booked sessions styling
  bookedSessionsSection: { marginTop: 32 },
  bookedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingHorizontal: 4 },
  bookedTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  bookedCountBadge: { backgroundColor: 'rgba(37, 99, 235, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  bookedCountText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  sessionLoaderBox: { padding: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1.5, borderColor: '#F1F5F9' },
  sessionLoaderText: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 8 },
  sessionEmptyBox: { padding: 30, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1.5, borderColor: '#F1F5F9', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  sessionEmptyText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  sessionEmptySub: { fontSize: 11, color: '#94A3B8', marginTop: 2, textAlign: 'center' },

  sessionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderLeftWidth: 4, borderLeftColor: '#FF6B00', borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  sessionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sessionName: { fontSize: 14, fontWeight: '800', color: '#1E293B', flex: 1, marginRight: 8 },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  highPriority: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' },
  highPriorityText: { color: '#EF4444', fontSize: 8, fontWeight: '700' },
  mediumPriority: { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' },
  mediumPriorityText: { color: '#D97706', fontSize: 8, fontWeight: '700' },
  lowPriority: { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' },
  lowPriorityText: { color: '#16A34A', fontSize: 8, fontWeight: '700' },
  priorityText: { textTransform: 'uppercase' },

  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  statusScheduled: { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
  statusScheduledText: { color: '#2563EB', fontSize: 8, fontWeight: '700' },
  statusCompleted: { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' },
  statusCompletedText: { color: '#16A34A', fontSize: 8, fontWeight: '700' },
  statusCancelled: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' },
  statusCancelledText: { color: '#EF4444', fontSize: 8, fontWeight: '700' },
  statusPending: { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' },
  statusPendingText: { color: '#D97706', fontSize: 8, fontWeight: '700' },
  statusText: { textTransform: 'uppercase' },

  sessionInfoGrid: { gap: 6, marginBottom: 12 },
  sessionInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionInfoVal: { fontSize: 12, color: '#475569', fontWeight: '500', flex: 1 },
  sessionFooterRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  sessionFooterVal: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },

  // Booking Modal styling
  modalOverlay: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1.5, borderBottomColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 1 },
  modalCloseBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 20 },
  modalScroll: { flex: 1 },
  modalLoaderContainer: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  modalLoaderText: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },

  offeringCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#F1F5F9', borderLeftWidth: 4, borderLeftColor: '#FF6B00', marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  offeringTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  offeringDesc: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 2, marginBottom: 6, lineHeight: 15 },
  offeringMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  offeringMetaText: { fontSize: 9, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  offeringMetaDivider: { fontSize: 9, color: '#CBD5E1' },
  offeringPriceBox: { alignItems: 'flex-end', minWidth: 70 },
  offeringPrice: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
  offeringPriceLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '600', marginTop: 2 },

  selectedOfferingBanner: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', padding: 16 },
  selectedOfferingLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8, marginBottom: 2 },
  selectedOfferingTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  selectedOfferingSub: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  changeBtn: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  changeBtnText: { fontSize: 11, fontWeight: '700', color: '#475569' },

  dateButton: { minWidth: 64, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', alignItems: 'center' },
  dateButtonActive: { backgroundColor: 'rgba(255, 107, 0, 0.06)', borderColor: colors.accent.DEFAULT },
  dateDayName: { fontSize: 10, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', opacity: 0.8, marginBottom: 2 },
  dateDayNameActive: { color: colors.accent.DEFAULT },
  dateDayNumber: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  dateDayNumberActive: { color: colors.accent.DEFAULT },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotButton: { flexBasis: '31%', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.25)', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  slotButtonDisabled: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', opacity: 0.5 },
  slotButtonSelected: { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: '#10B981', borderWidth: 1.5 },
  slotText: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  slotTextDisabled: { color: '#94A3B8' },
  slotTextSelected: { color: colors.accent.DEFAULT },
  slotSubText: { fontSize: 10, color: '#10B981', fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
  slotSubTextSelected: { color: colors.accent.DEFAULT },
  slotSubTextDisabled: { color: '#94A3B8' },

  topicConfirmContainer: { marginTop: 24, borderTopWidth: 1.5, borderTopColor: '#F1F5F9', paddingTop: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  topicInput: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 16, height: 48, fontSize: 14, color: '#1E293B', marginBottom: 20 },
  confirmBtn: { backgroundColor: colors.accent.DEFAULT, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  reviewModalContainer: { backgroundColor: '#FFF', borderRadius: 24, width: '100%', overflow: 'hidden' },
  reviewModalBody: { padding: 24 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 11, fontWeight: '700' },

  // Tab Switcher Styles
  tabScrollContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabScrollContent: {
    gap: 4,
  },
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
    paddingHorizontal: 16,
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
  },

  groupInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: 12
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4
  },
  groupDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 15
  },
  groupMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  groupMetaBox: {
    width: '45%',
    marginBottom: 8
  },
  groupMetaLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  groupMetaVal: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600'
  },
  groupMetaValHighlight: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '800'
  },
  groupMetaStatus: {
    fontSize: 10,
    fontWeight: '800'
  },

  footerSpacer: { height: 40 },

  // ── Group Offerings Section ──
  offeringsSection: {
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  offeringTabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  offeringTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  offeringTabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  offeringTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  offeringTabTextActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  offeringLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  offeringLoaderText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  offeringEmpty: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  offeringEmptyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  offeringList: {
    gap: 12,
  },
  groupOfferingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  groupOfferingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  groupOfferingTypeBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  groupOfferingTypeText: {
    fontSize: 9,
    color: '#EA580C',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  groupOfferingDurationBadge: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  groupOfferingDurationText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '700',
  },
  groupOfferingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 20,
  },
  groupOfferingMentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  groupOfferingAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupOfferingAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  groupOfferingMentorName: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  groupOfferingCategoryBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  groupOfferingCategoryText: {
    fontSize: 9,
    color: '#4F46E5',
    fontWeight: '700',
  },
  groupOfferingDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 8,
  },
  groupOfferingMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  seatsBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  seatsBadgeText: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '700',
  },
  priceBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  priceBadgeText: {
    fontSize: 10,
    color: '#EA580C',
    fontWeight: '700',
  },
  groupOfferingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  groupOfferingDateLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  groupOfferingDateValue: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '700',
  },
  joinBtn: {
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  joinBtnText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
});
