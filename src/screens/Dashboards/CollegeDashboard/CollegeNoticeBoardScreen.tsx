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
      const res = await getCollegeEvents(collegeName, page, 5); // 5 events per page
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
      const res = await getCollegeNotices(collegeName, page, 5); // 5 notices per page
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0F172A" />
        <Text style={styles.loadingText}>Loading Announcements...</Text>
      </View>
    );
  }

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
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.title}>Announcements</Text>
              <View style={styles.headerBadge}>
                <Bell size={10} color="#059669" />
                <Text style={styles.headerBadgeText}>NOTICE BOARD</Text>
              </View>
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

            {eventsLoading ? (
              <ActivityIndicator size="small" color="#0F172A" style={{ marginVertical: 20 }} />
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
                  return (
                    <Animated.View key={event.name || idx} entering={FadeInRight.delay(100 + idx * 50)}>
                      <Card style={styles.eventCard}>
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

                        <View style={styles.eventActions}>
                          <TouchableOpacity style={styles.applyBtn} onPress={() => handleOpenEventModal(event)}>
                            <Edit2 size={12} color="#FFF" style={{ marginRight: 4 }} />
                            <Text style={styles.applyBtnText}>Edit Event</Text>
                          </TouchableOpacity>
                        </View>
                      </Card>
                    </Animated.View>
                  );
                })}

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
          </View>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <FileText color="#64748B" size={18} />
                <Text style={styles.sectionTitle}>Digital Notices</Text>
              </View>
            </View>
            
            {noticesLoading ? (
              <ActivityIndicator size="small" color="#0F172A" style={{ marginVertical: 20 }} />
            ) : noticesList.length === 0 ? (
              <View style={styles.emptyNoticeContainer}>
                <FileText size={24} color="#94A3B8" style={{ marginBottom: 6 }} />
                <Text style={styles.emptyNoticeText}>No notices posted yet</Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {noticesList.map((notice, idx) => {
                  const noticeColor = getNoticeColor(notice.notice_type);
                  return (
                    <View key={notice.name || idx} style={[styles.noticeRow, idx === noticesList.length - 1 && styles.noBorder]}>
                      <View style={[styles.noticeIndicator, { backgroundColor: noticeColor }]} />
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
                      
                      {/* Notice Action Buttons */}
                      <View style={styles.noticeActionsContainer}>
                        <TouchableOpacity onPress={() => handleOpenNoticeModal(notice)} style={styles.iconActionBtn}>
                          <Edit2 size={12} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteNotice(notice.name)} style={styles.iconActionBtn}>
                          <Trash2 size={12} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
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
          </Card>
        )}
      </ScrollView>

      {/* Create/Edit Event Modal */}
      <Modal
        visible={isEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEventModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editingEvent ? 'Edit Event' : 'Create New Event'}</Text>
                <Text style={styles.modalSubtitle}>
                  {editingEvent ? 'Modify event information' : 'Publish a new campus event'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsEventModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <DynamicForm
                fields={eventFields}
                onSubmit={handleEventSubmit}
                initialValues={eventFormValues}
                loading={eventModalLoading}
                buttonLabel={editingEvent ? 'Save Changes' : 'Create Event'}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Create/Edit Notice Modal */}
      <Modal
        visible={isNoticeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNoticeModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editingNotice ? 'Edit Notice' : 'Post New Notice'}</Text>
                <Text style={styles.modalSubtitle}>
                  {editingNotice ? 'Modify announcement information' : 'Publish a new announcement'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsNoticeModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <DynamicForm
                fields={noticeFields}
                onSubmit={handleNoticeSubmit}
                initialValues={noticeFormValues}
                loading={noticeModalLoading}
                buttonLabel={editingNotice ? 'Save Changes' : 'Post Notice'}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  createBtnText: { fontSize: 11, fontWeight: '800', color: '#FFF' },

  sectionTitleRow: { marginBottom: 12, paddingHorizontal: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },

  eventsStack: { gap: 16, marginBottom: 24 },
  eventCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  daysBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  daysBadgeText: { fontSize: 8, fontWeight: '800', color: '#64748B' },
  
  eventTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 12, fontFamily: typography.fontFamily.display },
  
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaLabelText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' },

  prizeHighlight: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  prizeIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  prizeLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  prizeAmount: { fontSize: 16, fontWeight: '800', color: '#1E293B' },

  eventActions: { flexDirection: 'row', gap: 12 },
  applyBtn: { flex: 1, backgroundColor: '#0F172A', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  applyBtnText: { fontSize: 13, fontWeight: '800', color: '#FFF' },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  postNoticeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  postNoticeBtnText: { fontSize: 11, fontWeight: '800', color: '#2563EB' },

  listContainer: { gap: 0 },
  noticeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  noticeIndicator: { width: 3, height: 36, borderRadius: 2, marginRight: 12 },
  noticeInfo: { flex: 1, marginRight: 8 },
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', paddingHorizontal: 20, paddingTop: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display },
  modalSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20 },
  modalScroll: { paddingBottom: 60 },

  emptyCard: { backgroundColor: '#FFF', borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', padding: 24, alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  emptyText: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 12 },
  emptyBtn: { backgroundColor: '#0F172A', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  emptyBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginVertical: 12 },
  paginationRowInside: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  pageBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  pageBtnDisabled: { opacity: 0.5 },
  pageIndicator: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  pageIndicatorInside: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 16 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  activeTabButton: { backgroundColor: '#0F172A', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabButtonText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  activeTabButtonText: { color: '#FFF' }
});

