import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee,
  Clock,
  Trophy,
  Bell,
  Megaphone,
  ChevronRight,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Plus
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { SwipeableRow } from '@/components/Shared/SwipeableRow';
import { 
  getMasterData, 
  getStudentByEmail, 
  createStudentEventRegistration, 
  getCollegeEventList 
} from '@/api/student.services';

// Helper style maps
const getNoticeStyles = (type: string) => {
  switch (type) {
    case "Placement":
      return { icon: Bell, color: "#2563EB" };
    case "Events":
      return { icon: Megaphone, color: colors.accent.DEFAULT };
    case "Academic":
      return { icon: Trophy, color: "#16A34A" };
    case "Compliance":
      return { icon: Bell, color: "#10B981" };
    default:
      return { icon: Bell, color: "#64748B" };
  }
};

const getEventStyles = (type: string) => {
  const styles: Record<string, any> = {
    "Hackathon": { color: "#EA580C", bgColor: "#FFF7ED", borderColor: "#FFEDD5" },
    "Competition": { color: "#2563EB", bgColor: "#EFF6FF", borderColor: "#DBEAFE" },
    "Pitch Battle": { color: "#9333EA", bgColor: "#FAF5FF", borderColor: "#F3E8FF" },
    "Case Study": { color: "#059669", bgColor: "#F0FDF4", borderColor: "#DCFCE7" },
    "Workshop": { color: "#D97706", bgColor: "#FFFBEB", borderColor: "#FEF3C7" }
  };
  return styles[type] || { color: "#475569", bgColor: "#F8FAFC", borderColor: "#E2E8F0" };
};

const calculateDaysLeft = (dateString: string) => {
  if (!dateString) return 0;
  try {
    const targetDate = new Date(dateString);
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  } catch (e) {
    return 0;
  }
};

export const StudentEventsScreen = () => {
  const { userName } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'notices'>('events');
  const [events, setEvents] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [studentCollege, setStudentCollege] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [searchVal, setSearchVal] = useState("");

  const fetchInitialData = useCallback(async () => {
    if (!userName) return;
    try {
      setLoading(true);
      const studentRes = await getStudentByEmail(userName);
      const collegeName = studentRes?.message?.data?.college;

      if (collegeName) {
        setStudentCollege(collegeName);
        await Promise.all([
          fetchNotices(collegeName),
          fetchEvents(collegeName)
        ]);
      } else {
        setNotices([]);
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching initial event data:", error);
    } finally {
      setLoading(false);
    }
  }, [userName]);

  const fetchNotices = async (college: string) => {
    try {
      const response = await getMasterData("College Notice", {
        filters: { college: college },
        fields: ["college", "notice", "notice_type", "date"]
      });

      const apiData = response?.data || response?.message || [];
      if (Array.isArray(apiData)) {
        const mappedNotices = apiData.map((item: any, index: number) => {
          const styles = getNoticeStyles(item.notice_type);
          return {
            id: index + 1,
            title: item.notice || "Untitled Notice",
            category: item.notice_type || "General",
            date: item.date || "",
            icon: styles.icon,
            color: styles.color
          };
        });
        setNotices(mappedNotices);
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
      setNotices([]);
    }
  };

  const fetchEvents = async (college: string) => {
    try {
      if (!userName) return;
      const response = await getCollegeEventList(college, userName);
      const eventsList = response?.data?.events || response?.message?.data?.events || response?.events || (Array.isArray(response?.data) ? response.data : []);
      
      if (Array.isArray(eventsList)) {
        const mappedEvents = eventsList.map((item: any, index: number) => {
          const styles = getEventStyles(item.event_type);
          return {
            id: index + 1,
            name: item.name,
            title: item.event || "Untitled Event",
            type: item.event_type || "Event",
            college: item.college,
            daysLeft: calculateDaysLeft(item.start_date),
            date: `${item.start_date}${item.end_date ? ` - ${item.end_date}` : ''}`,
            participants: "Join Now",
            prize: item.price || "Exciting Rewards",
            registrationStatus: item.registration_status || "Not Registered",
            description: item.description || "Detailed information about this event will be updated soon.",
            location: item.location || "Campus / Virtual",
            ...styles
          };
        });
        setEvents(mappedEvents);

        // Update list of registered IDs
        const registered = mappedEvents
          .filter(e => e.registrationStatus === "Register")
          .map(e => e.name);
        setRegisteredEventIds(registered);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleRegister = async (event: any) => {
    if (!userName) {
      Alert.alert("Error", "Authentication Required: Please log in to register.");
      return;
    }

    try {
      setRegisteringId(event.name);
      const payload = {
        student: userName,
        event: event.name,
        college: studentCollege || event.college || "", 
        status: "Register"
      };

      const response = await createStudentEventRegistration(payload);

      if (response && (response.status === 200 || response.status === "200" || response.message?.status === 200)) {
        setRegisteredEventIds(prev => [...prev, event.name]);
        Alert.alert("Success", `Successfully registered for ${event.title}!`);
        await fetchInitialData();
      } else {
        Alert.alert("Registration Failed", response?.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Event registration error:", err);
      Alert.alert("Error", err?.message || "Registration failed. Please try again.");
    } finally {
      setRegisteringId(null);
    }
  };

  // Filter events by search keyword
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchVal.toLowerCase()) || 
    e.type.toLowerCase().includes(searchVal.toLowerCase())
  );

  const renderEventDetailsModal = () => {
    if (!selectedEvent) return null;
    const isRegistered = registeredEventIds.includes(selectedEvent.name) || selectedEvent.registrationStatus === "Register";
    return (
      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={[styles.modalHeader, { backgroundColor: selectedEvent.bgColor, borderBottomColor: selectedEvent.borderColor }]}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.modalIconBox, { backgroundColor: '#FFFFFF' }]}>
                <Trophy size={22} color={selectedEvent.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitleText} numberOfLines={1}>{selectedEvent.title}</Text>
                <View style={[styles.daysLeftBadge, { backgroundColor: selectedEvent.bgColor, borderColor: selectedEvent.borderColor, alignSelf: 'flex-start', marginTop: 4 }]}>
                  <Text style={[styles.daysLeftText, { color: selectedEvent.color }]}>{selectedEvent.type}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setSelectedEvent(null)}
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
            {/* Stats info Grid */}
            <View style={styles.modalGrid}>
              <View style={styles.modalGridItem}>
                <Calendar size={18} color="#94A3B8" />
                <View>
                  <Text style={styles.modalGridLabel}>DATE & TIME</Text>
                  <Text style={styles.modalGridValue}>{selectedEvent.date}</Text>
                </View>
              </View>

              <View style={styles.modalGridItem}>
                <MapPin size={18} color="#94A3B8" />
                <View>
                  <Text style={styles.modalGridLabel}>LOCATION</Text>
                  <Text style={styles.modalGridValue}>{selectedEvent.location}</Text>
                </View>
              </View>

              <View style={styles.modalGridItem}>
                <IndianRupee size={18} color="#94A3B8" />
                <View>
                  <Text style={styles.modalGridLabel}>PRIZE POOL</Text>
                  <Text style={styles.modalGridValue}>{selectedEvent.prize}</Text>
                </View>
              </View>

              <View style={styles.modalGridItem}>
                <Users size={18} color="#94A3B8" />
                <View>
                  <Text style={styles.modalGridLabel}>ELIGIBILITY</Text>
                  <Text style={styles.modalGridValue}>{selectedEvent.participants}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.aboutContainer}>
              <Text style={styles.aboutTitle}>About the Event</Text>
              <Text style={styles.aboutText}>{selectedEvent.description.replace(/<[^>]*>/g, '')}</Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              onPress={() => setSelectedEvent(null)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelBtnText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalApplyBtn,
                isRegistered ? styles.modalRegisteredBtn : styles.modalRegisterBtn,
                registeringId === selectedEvent.name && { opacity: 0.7 }
              ]}
              disabled={registeringId === selectedEvent.name}
              onPress={() => {
                const eventToRegister = selectedEvent;
                setSelectedEvent(null);
                handleRegister(eventToRegister);
              }}
            >
              {registeringId === selectedEvent.name ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : isRegistered ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="#FFFFFF" />
                  <Text style={styles.modalApplyBtnText}>Registered</Text>
                </View>
              ) : (
                <Text style={styles.modalApplyBtnText}>Register Now</Text>
              )}
            </TouchableOpacity>
          </View>
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
            <Calendar size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>HACKATHONS & MORE</Text>
          </View>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Inter-college hackathons and pitches</Text>
        </Animated.View>

        {/* Segmented Tab Switcher */}
        <Animated.View entering={FadeInUp.delay(120)} style={styles.tabSwitcherContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'events' && styles.activeTabBtn]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'events' && styles.activeTabBtnText]}>
              Events & Hackathons
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'notices' && styles.activeTabBtn]}
            onPress={() => setActiveTab('notices')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'notices' && styles.activeTabBtnText]}>
              Notice Board ({notices.length})
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {activeTab === 'events' ? (
          <View>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={18} color="#94A3B8" style={styles.searchIcon} />
              <TextInput 
                placeholder="Search events..." 
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                value={searchVal}
                onChangeText={setSearchVal}
              />
            </View>

            {loading ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
                <Text style={styles.loaderText}>Loading events...</Text>
              </View>
            ) : filteredEvents.length === 0 ? (
              <View style={styles.emptyBox}>
                <Trophy size={36} color="#94A3B8" />
                <Text style={styles.emptyText}>No events or competitions found.</Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {filteredEvents.map((event, index) => {
                  const isRegistered = registeredEventIds.includes(event.name) || event.registrationStatus === "Register";
                  const eventActions = [
                    {
                      label: isRegistered ? 'Registered' : 'Register',
                      icon: isRegistered ? CheckCircle2 : Plus,
                      bgColor: isRegistered ? '#DCFCE7' : '#FFF7ED',
                      color: isRegistered ? '#10B981' : '#FF6B00',
                      onPress: () => handleRegister(event)
                    },
                    {
                      label: 'Details',
                      icon: Eye,
                      bgColor: '#EFF6FF',
                      color: '#3B82F6',
                      onPress: () => setSelectedEvent(event)
                    }
                  ];
                  return (
                    <SwipeableRow key={event.id} actions={eventActions}>
                      <View 
                        style={[styles.eventCard, { marginBottom: 0 }]}
                      >
                        <View style={styles.cardHeader}>
                          <View style={styles.eventInfo}>
                            <View style={[styles.iconBox, { backgroundColor: event.bgColor }]}>
                              <Trophy size={20} color={event.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                              <Text style={styles.eventType}>{event.type}</Text>
                            </View>
                          </View>
                          {event.daysLeft > 0 && (
                            <View style={[styles.daysLeftBadge, { backgroundColor: event.bgColor, borderColor: event.borderColor }]}>
                              <Clock size={10} color={event.color} />
                              <Text style={[styles.daysLeftText, { color: event.color }]}>{event.daysLeft} days left</Text>
                            </View>
                          )}
                        </View>

                        {/* Event Details */}
                        <View style={styles.detailsRow}>
                          <View style={styles.detailItem}>
                            <Calendar size={14} color="#94A3B8" />
                            <Text style={styles.detailText} numberOfLines={1}>{event.date.split(" ")[0]}</Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Users size={14} color="#94A3B8" />
                            <Text style={styles.detailText}>{event.participants}</Text>
                          </View>
                          <View style={styles.detailItem}>
                            <IndianRupee size={14} color="#94A3B8" />
                            <Text style={styles.prizeText}>{event.prize}</Text>
                          </View>
                        </View>
                      </View>
                    </SwipeableRow>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          /* Notice Board View */
          <View>
            {loading ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
                <Text style={styles.loaderText}>Loading notices...</Text>
              </View>
            ) : notices.length === 0 ? (
              <View style={styles.emptyBox}>
                <Bell size={36} color="#94A3B8" />
                <Text style={styles.emptyText}>No college notices found.</Text>
              </View>
            ) : (
              <Animated.View entering={FadeInRight.delay(100)} style={styles.noticeContainer}>
                {notices.map((notice) => {
                  const IconComponent = getNoticeStyles(notice.category).icon;
                  return (
                    <View key={notice.id} style={styles.noticeItem}>
                      <View style={[styles.noticeIconBox, { backgroundColor: `${notice.color}15` }]}>
                        {typeof IconComponent === 'string' ? (
                          <Bell size={16} color={notice.color} />
                        ) : (
                          <IconComponent size={16} color={notice.color} />
                        )}
                      </View>
                      <View style={styles.noticeContent}>
                        <Text style={styles.noticeTitle} numberOfLines={2}>{notice.title}</Text>
                        <View style={styles.noticeMetaRow}>
                          <View style={styles.noticeBadge}>
                            <Text style={styles.noticeBadgeText}>{notice.category}</Text>
                          </View>
                          <Text style={styles.noticeDate}>{notice.date}</Text>
                        </View>
                      </View>
                      <ChevronRight size={16} color="#CBD5E1" />
                    </View>
                  );
                })}
              </Animated.View>
            )}
          </View>
        )}

        {/* Featured Event Banner */}
        <Animated.View entering={FadeInUp.delay(500)} style={{ marginTop: 12 }}>
          <View style={[styles.featuredBanner, { backgroundColor: '#FFF7ED' }]}>
            <View style={styles.featuredHeader}>
              <View style={styles.featuredIconContainer}>
                <Sparkles size={24} color={colors.accent.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featuredTitle}>Tech Summit 2025</Text>
                <Text style={styles.featuredSubtitle} numberOfLines={2}>India's largest student tech conference</Text>
                <View style={styles.featuredMetaRow}>
                  <View style={styles.featuredDetail}>
                    <Calendar size={12} color="#64748B" />
                    <Text style={styles.featuredDetailText}>Apr 5-7</Text>
                  </View>
                  <View style={styles.featuredDetail}>
                    <Users size={12} color="#64748B" />
                    <Text style={styles.featuredDetailText}>500+ colleges</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {renderEventDetailsModal()}
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

  // Tab Switcher Styles
  tabSwitcherContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  activeTabBtn: { backgroundColor: '#FFF', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabBtnText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  activeTabBtnText: { color: '#0F172A' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 20, borderWidth: 1.5, borderColor: '#E2E8F0' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#1E293B', fontWeight: '500' },
  
  loaderBox: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  loaderText: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 10 },
  
  emptyBox: { padding: 40, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1.5, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  emptyText: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 10, textAlign: 'center' },

  listContainer: { gap: 16, marginBottom: 20 },
  eventCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderLeftWidth: 4, borderLeftColor: '#FF6B00', borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  eventInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  eventType: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  daysLeftBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  daysLeftText: { fontSize: 10, fontWeight: '800' },
  
  detailsRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  detailText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  prizeText: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  
  actionsRow: { flexDirection: 'row', gap: 10 },
  registerButton: { flex: 1.2, backgroundColor: colors.accent.DEFAULT, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 },
  registerButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  registeredBtn: { backgroundColor: '#10B981', shadowColor: '#10B981' },
  detailsButton: { flex: 0.8, flexDirection: 'row', justifyContent: 'center', backgroundColor: '#F8FAFC', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#F1F5F9', alignItems: 'center', gap: 6 },
  detailsButtonText: { color: '#475569', fontSize: 13, fontWeight: '700' },
  
  noticeContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 8, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderLeftWidth: 4, borderLeftColor: '#FF6B00', borderColor: '#F1F5F9', marginBottom: 20 },
  noticeItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noticeIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  noticeContent: { flex: 1 },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  noticeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noticeBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  noticeBadgeText: { fontSize: 9, fontWeight: '600', color: '#64748B' },
  noticeDate: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },
  
  featuredBanner: { borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#FFEDD5', marginBottom: 12 },
  featuredHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  featuredIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFEDD5' },
  featuredTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  featuredSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2, marginBottom: 8 },
  featuredMetaRow: { flexDirection: 'row', gap: 14 },
  featuredDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredDetailText: { fontSize: 11, color: '#64748B', fontWeight: '500' },

  // Details Modal styles
  modalOverlay: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1.5 },
  modalIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  modalTitleText: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  modalCloseBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 20 },
  modalScroll: { flex: 1 },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  modalGridItem: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  modalGridLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  modalGridValue: { fontSize: 12, fontWeight: '700', color: '#334155', marginTop: 1 },
  aboutContainer: { marginTop: 8 },
  aboutTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  aboutText: { fontSize: 13, color: '#475569', lineHeight: 19, fontWeight: '500', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1.5, borderTopColor: '#F1F5F9', backgroundColor: '#F8FAFC' },
  modalCancelBtn: { flex: 0.8, backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  modalCancelBtnText: { color: '#475569', fontSize: 13, fontWeight: '700' },
  modalApplyBtn: { flex: 1.2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  modalApplyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  modalRegisterBtn: { backgroundColor: colors.accent.DEFAULT, shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },
  modalRegisteredBtn: { backgroundColor: '#10B981', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },

  footerSpacer: { height: 40 }
});
