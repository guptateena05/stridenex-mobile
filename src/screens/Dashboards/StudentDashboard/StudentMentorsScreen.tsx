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
  ChevronLeft
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { 
  getMentorList, 
  getMentorSlotCalendar, 
  bookMentorSlot, 
  getMentorNextAvailableSlot, 
  getBookedSessions, 
  getMentorOfferings 
} from '@/api/student.services';

const AVATAR_COLORS = [
  "#9333EA", "#2563EB", "#10B981", "#F59E0B", "#EC4899", "#6366F1"
];

export const StudentMentorsScreen = () => {
  const { userName } = useAuth();
  const [activeTab, setActiveTab] = useState<'mentors' | 'sessions'>('mentors');
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
  const [selectedOffering, setSelectedOffering] = useState<any | null>(null);
  const [slotCalendar, setSlotCalendar] = useState<any>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [bookingTopic, setBookingTopic] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Debounced search logic
  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setSearchQuery(val);
      setCurrentPage(1);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
      if (res && Array.isArray(res.message)) {
        setBookedSessions(res.message);
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

    try {
      const response = await getMentorSlotCalendar(selectedMentor.email);
      if (response && response.message) {
        setSlotCalendar(response.message);
        const dates = Object.keys(response.message);
        if (dates.length > 0) {
          dates.sort();
          setSelectedDate(dates[0]);
        } else {
          setSelectedDate(null);
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
        topic: bookingTopic || selectedOffering.title || "General Mentorship"
      };

      const response = await bookMentorSlot(payload);

      if (response && response.exc_type) {
        let errMsg = "Failed to book session. Please try again.";
        if (response._server_messages) {
          try {
            const messages = JSON.parse(response._server_messages);
            const msgObj = JSON.parse(messages[0]);
            errMsg = msgObj.message || errMsg;
          } catch (e) {
            console.error("Error parsing server messages:", e);
          }
        }
        Alert.alert("Error", errMsg);
        return;
      }

      setBookingModalVisible(false);
      setSelectedMentor(null);
      setSelectedOffering(null);
      setSelectedDate(null);
      setSelectedSlot(null);
      setBookingTopic("");
      setSlotCalendar({});

      Alert.alert("Success", `Session booked successfully! ID: ${response?.message?.session_name || ""}`);
      fetchMentorsList(currentPage, searchQuery);
      fetchBookedSessions();
    } catch (err) {
      console.error("Error confirming booking:", err);
      Alert.alert("Error", "Failed to book session. Please try again.");
    } finally {
      setIsBooking(false);
    }
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
                            <Text style={styles.offeringMetaText}>{offering.offering_type}</Text>
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
                      }}
                    >
                      <Text style={styles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                  </View>

                  {loadingSlots ? (
                    <View style={styles.modalLoaderContainer}>
                      <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
                      <Text style={styles.modalLoaderText}>Loading available slots...</Text>
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
        <Animated.View entering={FadeInUp.delay(120)} style={styles.tabSwitcherContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'mentors' && styles.activeTabBtn]}
            onPress={() => setActiveTab('mentors')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'mentors' && styles.activeTabBtnText]}>
              Explore Mentors
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'sessions' && styles.activeTabBtn]}
            onPress={() => setActiveTab('sessions')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'sessions' && styles.activeTabBtnText]}>
              My Bookings ({bookedSessions.length})
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {activeTab === 'mentors' ? (
          <View>
            {/* Search Bar */}
            <Animated.View entering={FadeInUp.delay(150)} style={styles.searchContainer}>
              <Search size={18} color="#94A3B8" style={styles.searchIcon} />
              <TextInput 
                placeholder="Search mentors..." 
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
                    return (
                      <Animated.View 
                        key={mentor.id} 
                        entering={FadeInUp.delay(200 + index * 50)}
                        style={styles.mentorCard}
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

                        {/* Actions */}
                        <View style={styles.actionsRow}>
                          {booked ? (
                            <View style={styles.bookedButtonContainer}>
                              <Text style={styles.bookedButtonLabel}>Already Booked</Text>
                            </View>
                          ) : (
                            <TouchableOpacity 
                              style={styles.bookButton}
                              onPress={() => handleOpenBooking(mentor)}
                            >
                              <Text style={styles.bookButtonText}>Book Session</Text>
                            </TouchableOpacity>
                          )}
                          <View style={styles.iconButton}>
                            <ChevronRight size={18} color="#64748B" />
                          </View>
                        </View>
                      </Animated.View>
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
                  const dateFormatted = session.session_date ? new Date(session.session_date).toLocaleDateString() : "N/A";
                  const isHigh = session.priority === 'High';
                  const isMedium = session.priority === 'Medium';
                  
                  return (
                    <View key={idx} style={styles.sessionCard}>
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
                            session.status === 'Scheduled' && styles.statusScheduled,
                            session.status === 'Completed' && styles.statusCompleted,
                            session.status === 'Cancelled' && styles.statusCancelled
                          ]}>
                            <Text style={[
                              styles.statusText,
                              session.status === 'Scheduled' && styles.statusScheduledText,
                              session.status === 'Completed' && styles.statusCompletedText,
                              session.status === 'Cancelled' && styles.statusCancelledText
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
                          <Text style={styles.sessionInfoVal}>{session.from_time} - {session.to_time}</Text>
                        </View>
                        <View style={styles.sessionInfoItem}>
                          <Target size={12} color="#64748B" />
                          <Text style={styles.sessionInfoVal} numberOfLines={1}>{session.topic || "General Mentorship"}</Text>
                        </View>
                      </View>

                      <View style={styles.sessionFooterRow}>
                        <Text style={styles.sessionFooterVal}>Type: {session.session_type || "1:1"}</Text>
                        <Text style={styles.sessionFooterVal}>Duration: {session.duration || "N/A"}</Text>
                        <Text style={styles.sessionFooterVal}>Offering: {session.offering_type || "General"}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {renderBookingModal()}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  
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
  mentorCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
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

  sessionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
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

  offeringCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#F1F5F9', marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  slotTextSelected: { color: '#047857' },
  slotSubText: { fontSize: 9, fontWeight: '600', color: '#10B981', marginTop: 2 },
  slotSubTextDisabled: { color: '#94A3B8' },
  slotSubTextSelected: { color: '#047857' },

  topicConfirmContainer: { marginTop: 24, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#F1F5F9' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  topicInput: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontSize: 13, color: '#1E293B', fontWeight: '500', marginBottom: 14, backgroundColor: '#F8FAFC' },
  confirmBtn: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  // Tab Switcher Styles
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
    flex: 1,
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

  footerSpacer: { height: 40 }
});
