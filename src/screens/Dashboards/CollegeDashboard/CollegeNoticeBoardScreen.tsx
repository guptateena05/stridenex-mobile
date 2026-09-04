import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { SwipeableRow } from '@/components/Shared/SwipeableRow';
import { SkeletonLoader } from '@/components/Shared/SkeletonLoader';
import {
  Calendar,
  Plus,
  FileText,
  Bell,
  Users,
  Trophy,
  ChevronRight,
  Clock,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  Briefcase,
  ChevronLeft
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import {
  getCollegeDetails,
  getCollegeEvents,
  createCollegeEvent,
  updateCollegeEvent,
  getCollegeNotices,
  createCollegeNotice,
  updateCollegeNotice,
  deleteCollegeNotice
} from '@/api/college.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';

export const CollegeNoticeBoardScreen = () => {
  const { userName } = useAuth();
  
  // States
  const [collegeDetails, setCollegeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'notices'>('events');
  
  // Events States
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  
  // Notices States
  const [noticesList, setNoticesList] = useState<any[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticesPage, setNoticesPage] = useState(1);
  const [noticesTotalPages, setNoticesTotalPages] = useState(1);

  // Modal States
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventFormValues, setEventFormValues] = useState<any>({});
  const [eventModalLoading, setEventModalLoading] = useState(false);

  const [isNoticeModalVisible, setIsNoticeModalVisible] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const [noticeFormValues, setNoticeFormValues] = useState<any>({});
  const [noticeModalLoading, setNoticeModalLoading] = useState(false);

  // Fetch College Details
  const fetchCollegeInfo = useCallback(async () => {
    if (!userName) return null;
    try {
      const res = await getCollegeDetails(userName);
      const data = res?.data || res?.message?.data || res?.message;
      if (data) {
        setCollegeDetails(data);
        return data;
      }
    } catch (err) {
      console.error("Failed to load college details in notice board:", err);
    }
    return null;
  }, [userName]);

  // Fetch Events
  const fetchEvents = useCallback(async (collegeName: string, page = 1, isSilent = false) => {
    if (!collegeName) return;
    if (!isSilent) setEventsLoading(true);
    try {
      const res = await getCollegeEvents(collegeName, page, 10); // 10 events per page
      const data = res?.data || res?.message?.data || res?.message || res;
      if (data && typeof data === 'object') {
        const eventsArray = Array.isArray(data.events) ? data.events : (Array.isArray(data) ? data : []);
        setEventsList(eventsArray);
        setEventsPage(page);
        if (data.pagination) {
          setEventsTotalPages(data.pagination.total_pages || 1);
        } else {
          setEventsTotalPages(1);
        }
      } else {
        setEventsList([]);
        setEventsTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  // Fetch Notices
  const fetchNotices = useCallback(async (collegeName: string, page = 1, isSilent = false) => {
    if (!collegeName) return;
    if (!isSilent) setNoticesLoading(true);
    try {
      const res = await getCollegeNotices(collegeName, page, 10); // 10 notices per page
      const data = res?.data || res?.message?.data || res?.message || res;
      if (data && typeof data === 'object') {
        const noticesArray = Array.isArray(data.notice)
          ? data.notice
          : (Array.isArray(data.notices)
            ? data.notices
            : (Array.isArray(data) ? data : []));
        setNoticesList(noticesArray);
        setNoticesPage(page);
        if (data.pagination) {
          setNoticesTotalPages(data.pagination.total_pages || 1);
        } else {
          setNoticesTotalPages(1);
        }
      } else {
        setNoticesList([]);
        setNoticesTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    } finally {
      setNoticesLoading(false);
    }
  }, []);

  // Initial Data Load
  const loadInitialData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    const details = await fetchCollegeInfo();
    const collegeName = details?.name || details?.college_name;
    if (collegeName) {
      await Promise.all([
        fetchEvents(collegeName, 1, isRefresh),
        fetchNotices(collegeName, 1, isRefresh)
      ]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [fetchCollegeInfo, fetchEvents, fetchNotices]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInitialData(true);
  };

  // Helper styles / properties mapping
  const getEventTheme = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("hackathon")) {
      return { color: "#EA580C", bgColor: "#FFF7ED" }; // Orange
    } else if (t.includes("competition")) {
      return { color: "#2563EB", bgColor: "#EFF6FF" }; // Blue
    } else {
      return { color: "#10B981", bgColor: "#ECFDF5" }; // Emerald/Default
    }
  };

  const getDaysLeft = (startDateStr: string) => {
    if (!startDateStr) return 0;
    const start = new Date(startDateStr);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatEventDate = (startStr: string, endStr: string) => {
    if (!startStr) return "";
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const start = new Date(startStr);
    const startFormatted = start.toLocaleDateString('en-US', options);

    if (!endStr || startStr === endStr) {
      return startFormatted;
    }

    const end = new Date(endStr);
    const endFormatted = end.toLocaleDateString('en-US', options);

    if (start.getMonth() === end.getMonth()) {
      return `${startFormatted}-${end.getDate()}`;
    }

    return `${startFormatted} - ${endFormatted}`;
  };

  const getNoticeColor = (category: string) => {
    const c = (category || "").toLowerCase();
    if (c.includes("placement")) return "#F59E0B"; // Amber
    if (c.includes("academic")) return "#3B82F6"; // Blue
    if (c.includes("event")) return "#10B981"; // Emerald
    return "#8B5CF6"; // Purple (Compliance/Other)
  };

  const formatNoticeDate = (dateStr: string) => {
    if (!dateStr) return "";
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', options);
  };

  // Event Form Schema
  const eventFields: FormField[] = useMemo(() => [
    {
      fieldname: "event",
      label: "Event Name",
      fieldtype: "Data",
      required: true,
      placeholder: "e.g. Startup Pitch Battle"
    },
    {
      fieldname: "event_type",
      label: "Event Type",
      fieldtype: "Select",
      required: true,
      options: ["Competition", "Hackathon"],
      placeholder: "Select Type"
    },
    {
      fieldname: "participation_scope",
      label: "Participation Scope",
      fieldtype: "Select",
      required: true,
      options: ["Inter College", "Intra College"],
      placeholder: "Select Scope"
    },
    {
      fieldname: "start_date",
      label: "Start Date",
      fieldtype: "Date",
      required: true,
      placeholder: "YYYY-MM-DD"
    },
    {
      fieldname: "end_date",
      label: "End Date",
      fieldtype: "Date",
      required: true,
      placeholder: "YYYY-MM-DD"
    },
    {
      fieldname: "price",
      label: "Prize Pool / Reward",
      fieldtype: "Data",
      required: true,
      placeholder: "e.g. ₹5 Lakhs"
    },
    {
      fieldname: "company",
      label: "Partnering Company",
      fieldtype: "Data",
      required: false,
      placeholder: "e.g. Google (Optional)"
    }
  ], []);

  // Notice Form Schema
  const noticeFields: FormField[] = useMemo(() => [
    {
      fieldname: "notice",
      label: "Notice Content / Title",
      fieldtype: "Data",
      required: true,
      placeholder: "e.g. VJTI-TCS iON Internship Drive"
    },
    {
      fieldname: "notice_type",
      label: "Notice Type",
      fieldtype: "Select",
      required: true,
      options: ["Placement", "Academic", "Event", "Compliance"],
      placeholder: "Select Type"
    },
    {
      fieldname: "date",
      label: "Notice Date",
      fieldtype: "Date",
      required: true,
      placeholder: "YYYY-MM-DD"
    },
    {
      fieldname: "company",
      label: "Partnering Company",
      fieldtype: "Data",
      required: false,
      placeholder: "e.g. TCS (Optional)"
    }
  ], []);

  // Modal Handlers
  const handleOpenEventModal = (eventObj: any = null) => {
    if (eventObj) {
      setEditingEvent(eventObj);
      setEventFormValues({
        event: eventObj.event,
        event_type: eventObj.event_type,
        participation_scope: eventObj.participation_scope,
        start_date: eventObj.start_date,
        end_date: eventObj.end_date,
        price: eventObj.price,
        company: eventObj.company || ""
      });
    } else {
      setEditingEvent(null);
      setEventFormValues({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      });
    }
    setIsEventModalVisible(true);
  };

  const handleOpenNoticeModal = (noticeObj: any = null) => {
    if (noticeObj) {
      setEditingNotice(noticeObj);
      setNoticeFormValues({
        notice: noticeObj.notice,
        notice_type: noticeObj.notice_type,
        date: noticeObj.date,
        company: noticeObj.company || ""
      });
    } else {
      setEditingNotice(null);
      setNoticeFormValues({
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsNoticeModalVisible(true);
  };

  // Submit Handlers
  const handleEventSubmit = async (formData: any) => {
    const collegeId = collegeDetails?.name;
    if (!collegeId) {
      Alert.alert("Error", "College details not loaded yet.");
      return;
    }

    setEventModalLoading(true);
    try {
      const payload = {
        event: formData.event,
        college: collegeId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        price: formData.price,
        event_type: formData.event_type,
        company: formData.company || null,
        participation_scope: formData.participation_scope
      };

      if (editingEvent) {
        await updateCollegeEvent(editingEvent.name, {
          name: editingEvent.name,
          ...payload
        });
        Alert.alert("Success", "Event updated successfully!");
      } else {
        await createCollegeEvent(payload);
        Alert.alert("Success", "Event created successfully!");
      }
      setIsEventModalVisible(false);
      fetchEvents(collegeId, 1, false);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save event");
    } finally {
      setEventModalLoading(false);
    }
  };

  const handleNoticeSubmit = async (formData: any) => {
    const collegeId = collegeDetails?.name;
    if (!collegeId) {
      Alert.alert("Error", "College details not loaded yet.");
      return;
    }
    setNoticeModalLoading(true);
    try {
      const payload = {
        college: collegeId,
        notice: formData.notice,
        date: formData.date,
        notice_type: formData.notice_type,
        company: formData.company || null
      };

      if (editingNotice) {
        await updateCollegeNotice(editingNotice.name, {
          name: editingNotice.name,
          ...payload
        });
        Alert.alert("Success", "Notice updated successfully!");
      } else {
        await createCollegeNotice(payload);
        Alert.alert("Success", "Notice created successfully!");
      }
      setIsNoticeModalVisible(false);
      fetchNotices(collegeId, 1, false);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save notice");
    } finally {
      setNoticeModalLoading(false);
    }
  };

  const handleDeleteNotice = (noticeName: string) => {
    const collegeId = collegeDetails?.name;
    if (!collegeId) return;

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this notice?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCollegeNotice(noticeName);
              Alert.alert("Success", "Notice deleted successfully");
              fetchNotices(collegeId, noticesPage, false);
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to delete notice");
            }
          }
        }
      ]
    );
  };

  // Skeletons will load inline inside respective tabs instead of full screen.

  const collegeName = collegeDetails?.name || collegeDetails?.college_name;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0F172A"]} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={[styles.headerRow, { flexWrap: 'wrap', gap: 8 }]}>
            <View style={{ flex: 1, minWidth: 180 }}>
              <View style={[styles.headerBadge, { alignSelf: 'flex-start', marginBottom: 4 }]}>
                <Bell size={10} color="#059669" />
                <Text style={styles.headerBadgeText}>NOTICE BOARD</Text>
              </View>
              <Text style={styles.title}>Announcements</Text>
            </View>
            {activeTab === 'events' ? (
              <TouchableOpacity style={styles.createBtn} onPress={() => handleOpenEventModal()}>
                <Plus size={14} color="#FFF" />
                <Text style={styles.createBtnText}>Add Event</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.createBtn} onPress={() => handleOpenNoticeModal()}>
                <Plus size={14} color="#FFF" />
                <Text style={styles.createBtnText}>Post Notice</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.subtitle}>Institutional events and digital notices</Text>
        </Animated.View>

        {/* Tab Switcher Button */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'events' && styles.activeTabButton]}
            onPress={() => setActiveTab('events')}
          >
            <Trophy size={14} color={activeTab === 'events' ? '#FFF' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === 'events' && styles.activeTabButtonText]}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'notices' && styles.activeTabButton]}
            onPress={() => setActiveTab('notices')}
          >
            <FileText size={14} color={activeTab === 'notices' ? '#FFF' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === 'notices' && styles.activeTabButtonText]}>Notice Board</Text>
          </TouchableOpacity>
        </View>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <View>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionLabel}>ACTIVE EVENTS & COMPETITIONS</Text>
            </View>

            {loading || eventsLoading ? (
              <View style={{ gap: 16 }}>
                {[1, 2].map((i) => (
                  <View key={i} style={[styles.eventCard, { borderLeftWidth: 4, borderLeftColor: '#E2E8F0', padding: 16 }]}>
                    <View style={styles.eventHeader}>
                      <SkeletonLoader width={80} height={18} borderRadius={4} />
                      <SkeletonLoader width={80} height={14} />
                    </View>
                    <SkeletonLoader width="80%" height={16} style={{ marginTop: 12 }} />
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                      <SkeletonLoader width={100} height={12} />
                      <SkeletonLoader width={80} height={12} />
                    </View>
                    <View style={{ marginTop: 12 }}>
                      <SkeletonLoader width={100} height={20} borderRadius={4} />
                    </View>
                  </View>
                ))}
              </View>
            ) : eventsList.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Trophy size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyText}>No Active Events Published</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => handleOpenEventModal()}>
                  <Text style={styles.emptyBtnText}>Create Event</Text>
                </TouchableOpacity>
              </Card>
            ) : (
              <View style={styles.eventsStack}>
                {eventsList.map((event, idx) => {
                  const theme = getEventTheme(event.event_type);
                  const daysLeft = getDaysLeft(event.start_date);
                  const isActive = daysLeft > 0;
                  const borderColor = isActive ? '#059669' : '#94A3B8';
                  return (
                    <SwipeableRow
                      key={event.name || idx}
                      onEdit={() => handleOpenEventModal(event)}
                      editBgColor="#ecfdf5"
                      editTextColor="#059669"
                    >
                      <Card style={[styles.eventCard, { borderLeftWidth: 4, borderLeftColor: borderColor, marginBottom: 0 }]}>
                        <View style={styles.eventHeader}>
                          <View style={[styles.typeBadge, { backgroundColor: theme.bgColor }]}>
                            <Text style={[styles.typeBadgeText, { color: theme.color }]}>{event.event_type}</Text>
                          </View>
                          <View style={styles.daysBadge}>
                            <Clock size={10} color="#64748B" />
                            <Text style={styles.daysBadgeText}>
                              {daysLeft > 0 ? `${daysLeft} DAYS LEFT` : 'ONGOING/ENDED'}
                            </Text>
                          </View>
                        </View>
                        
                        <Text style={styles.eventTitle}>{event.event}</Text>
                        
                        <View style={styles.eventMetaRow}>
                          <View style={styles.metaItem}>
                            <Calendar size={12} color="#64748B" />
                            <Text style={styles.metaLabelText}>{formatEventDate(event.start_date, event.end_date)}</Text>
                          </View>
                          <View style={styles.metaDivider} />
                          <View style={styles.metaItem}>
                            <Users size={12} color="#64748B" />
                            <Text style={styles.metaLabelText}>{event.participation_scope}</Text>
                          </View>
                          {event.company && (
                            <>
                              <View style={styles.metaDivider} />
                              <View style={styles.metaItem}>
                                <Briefcase size={12} color="#64748B" />
                                <Text style={styles.metaLabelText} numberOfLines={1}>{event.company}</Text>
                              </View>
                            </>
                          )}
                        </View>

                        <View style={styles.prizeHighlight}>
                          <View style={styles.prizeIconBox}>
                            <Trophy size={16} color="#F59E0B" />
                          </View>
                          <View>
                            <Text style={styles.prizeLabel}>TOTAL PRIZE POOL</Text>
                            <Text style={styles.prizeAmount}>{event.price}</Text>
                          </View>
                        </View>
                      </Card>
                    </SwipeableRow>
                  );
                })}
              </View>
            )}

            {/* Events Pagination */}
            {eventsTotalPages > 1 && (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  disabled={eventsPage <= 1}
                  onPress={() => fetchEvents(collegeName, eventsPage - 1)}
                  style={[styles.pageBtn, eventsPage <= 1 && styles.pageBtnDisabled]}
                >
                  <ChevronLeft size={16} color={eventsPage <= 1 ? "#CBD5E1" : "#0F172A"} />
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>{eventsPage} of {eventsTotalPages}</Text>
                <TouchableOpacity
                  disabled={eventsPage >= eventsTotalPages}
                  onPress={() => fetchEvents(collegeName, eventsPage + 1)}
                  style={[styles.pageBtn, eventsPage >= eventsTotalPages && styles.pageBtnDisabled]}
                >
                  <ChevronRight size={16} color={eventsPage >= eventsTotalPages ? "#CBD5E1" : "#0F172A"} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <View>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionLabel}>DIGITAL ANNOUNCEMENTS</Text>
            </View>
            
            {loading || noticesLoading ? (
              <View style={{ gap: 16 }}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={[styles.noticeCard, { borderLeftWidth: 4, borderLeftColor: '#E2E8F0', padding: 16 }]}>
                    <View style={styles.noticeTopRow}>
                      <SkeletonLoader width={60} height={12} />
                      <SkeletonLoader width={60} height={10} />
                    </View>
                    <SkeletonLoader width="90%" height={14} style={{ marginTop: 8 }} />
                    <SkeletonLoader width="50%" height={10} style={{ marginTop: 6 }} />
                  </View>
                ))}
              </View>
            ) : noticesList.length === 0 ? (
              <Card style={styles.emptyCard}>
                <FileText size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyText}>No notices posted yet</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => handleOpenNoticeModal()}>
                  <Text style={styles.emptyBtnText}>Post Notice</Text>
                </TouchableOpacity>
              </Card>
            ) : (
              <View style={styles.eventsStack}>
                {noticesList.map((notice, idx) => {
                  const noticeColor = getNoticeColor(notice.notice_type);
                  return (
                    <SwipeableRow
                      key={notice.name || idx}
                      onEdit={() => handleOpenNoticeModal(notice)}
                      onDelete={() => handleDeleteNotice(notice.name)}
                      editBgColor="#ecfdf5"
                      editTextColor="#059669"
                    >
                      <Card style={[styles.noticeCard, { borderLeftWidth: 4, borderLeftColor: noticeColor || '#059669', marginBottom: 0 }]}>
                        <View style={styles.noticeInfo}>
                          <View style={styles.noticeTopRow}>
                            <Text style={styles.noticeCategory}>{notice.notice_type}</Text>
                            <Text style={styles.noticeDate}>{formatNoticeDate(notice.date)}</Text>
                          </View>
                          <Text style={styles.noticeText} numberOfLines={3}>{notice.notice}</Text>
                          {notice.company && (
                            <Text style={styles.noticePartner}>Partner: {notice.company}</Text>
                          )}
                        </View>
                      </Card>
                    </SwipeableRow>
                  );
                })}
              </View>
            )}

            {/* Notices Pagination */}
            {noticesTotalPages > 1 && (
              <View style={styles.paginationRowInside}>
                <TouchableOpacity
                  disabled={noticesPage <= 1}
                  onPress={() => fetchNotices(collegeName, noticesPage - 1)}
                  style={[styles.pageBtn, noticesPage <= 1 && styles.pageBtnDisabled]}
                >
                  <ChevronLeft size={14} color={noticesPage <= 1 ? "#CBD5E1" : "#0F172A"} />
                </TouchableOpacity>
                <Text style={styles.pageIndicatorInside}>{noticesPage} of {noticesTotalPages}</Text>
                <TouchableOpacity
                  disabled={noticesPage >= noticesTotalPages}
                  onPress={() => fetchNotices(collegeName, noticesPage + 1)}
                  style={[styles.pageBtn, noticesPage >= noticesTotalPages && styles.pageBtnDisabled]}
                >
                  <ChevronRight size={14} color={noticesPage >= noticesTotalPages ? "#CBD5E1" : "#0F172A"} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create/Edit Event Modal */}
      <Modal
        visible={isEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEventModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editingEvent ? 'Edit Event' : 'Create New Event'}</Text>
                <Text style={styles.modalSubtitle}>
                  {editingEvent ? 'Modify event information' : 'Publish a new campus event'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsEventModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
              <DynamicForm
                fields={eventFields}
                onSubmit={handleEventSubmit}
                initialValues={eventFormValues}
                loading={eventModalLoading}
                buttonLabel={editingEvent ? 'Save Changes' : 'Create Event'}
                accentColor={colors.emerald.DEFAULT}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create/Edit Notice Modal */}
      <Modal
        visible={isNoticeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNoticeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editingNotice ? 'Edit Notice' : 'Post New Notice'}</Text>
                <Text style={styles.modalSubtitle}>
                  {editingNotice ? 'Modify announcement information' : 'Publish a new announcement'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsNoticeModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
              <DynamicForm
                fields={noticeFields}
                onSubmit={handleNoticeSubmit}
                initialValues={noticeFormValues}
                loading={noticeModalLoading}
                buttonLabel={editingNotice ? 'Save Changes' : 'Post Notice'}
                accentColor={colors.emerald.DEFAULT}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 },
  
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  createBtnText: { fontSize: 11, fontWeight: '800', color: '#FFF' },

  sectionTitleRow: { marginBottom: 12, paddingHorizontal: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },

  eventsStack: { gap: 16, marginBottom: 24 },
  eventCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  daysBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  daysBadgeText: { fontSize: 8, fontWeight: '800', color: '#64748B' },
  
  eventTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 8, fontFamily: typography.fontFamily.display },
  
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaLabelText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' },

  prizeHighlight: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 10, marginBottom: 0, borderWidth: 1, borderColor: '#F1F5F9' },
  prizeIconBox: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  prizeLabel: { fontSize: 7, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  prizeAmount: { fontSize: 14, fontWeight: '800', color: '#1E293B' },

  eventActions: { flexDirection: 'row', gap: 12 },
  applyBtn: { flex: 1, backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  applyBtnText: { fontSize: 13, fontWeight: '800', color: '#FFF' },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  postNoticeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  postNoticeBtnText: { fontSize: 11, fontWeight: '800', color: '#2563EB' },

  listContainer: { gap: 0 },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  noticeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  noticeIndicator: { width: 3, height: 36, borderRadius: 2, marginRight: 12 },
  noticeInfo: { flex: 1 },
  noticeTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  noticeCategory: { fontSize: 10, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  noticeDate: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  noticeText: { fontSize: 14, fontWeight: '600', color: '#1E293B', lineHeight: 20 },
  noticePartner: { fontSize: 11, fontWeight: '700', color: '#64748B', marginTop: 4 },
  noticeActionsContainer: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconActionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },

  emptyNoticeContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  emptyNoticeText: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 4 },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display },
  modalSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20 },
  modalScroll: { paddingBottom: 60 },

  emptyCard: { backgroundColor: '#FFF', borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', padding: 24, alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  emptyText: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 12 },
  emptyBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  emptyBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginVertical: 12 },
  paginationRowInside: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  pageBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  pageBtnDisabled: { opacity: 0.5 },
  pageIndicator: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  pageIndicatorInside: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 16 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  activeTabButton: { backgroundColor: '#10B981', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabButtonText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  activeTabButtonText: { color: '#FFF' }
});
