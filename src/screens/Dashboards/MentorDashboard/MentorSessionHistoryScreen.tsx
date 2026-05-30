import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '@/theme/typography';
import {
  Calendar,
  Clock,
  Star,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Lock,
  Edit2,
  Mail,
  History,
  LayoutList
} from 'lucide-react-native';
import { Pagination } from '@/components/Shared/Pagination';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import {
  getSessionHistory,
  updateMentorStats,
  getSessionNote,
  saveSessionNotes,
  emailSessionNoteToStudent
} from '@/api/mentor.services';
import { StatsCard } from '@/components/dashboard/StatsCard';

export const MentorSessionHistoryScreen = () => {
  const { userName } = useAuth();

  // Screen states
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_sessions: 0, total_hours: 0, total_earnings: 0, avg_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination states
  const [historyPage, setHistoryPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 4;

  // Notes expansion & editing states
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [sessionNotes, setSessionNotes] = useState<Record<string, { notes: string; shared_with_student: string }>>({});
  const [editingNotes, setEditingNotes] = useState<Record<string, boolean>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, { notes: string; shared_with_student: string }>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
  const [loadingNotes, setLoadingNotes] = useState<Record<string, boolean>>({});
  const [emailingNotes, setEmailingNotes] = useState<Record<string, boolean>>({});

  // Fetch session history & stats
  const fetchHistory = useCallback(async (isRefresh = false) => {
    if (!userName) return;
    if (!isRefresh) setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        getSessionHistory(userName).catch(e => { console.error(e); return null; }),
        updateMentorStats(userName).catch(e => { console.error(e); return null; })
      ]);

      if (res?.message && Array.isArray(res.message)) {
        setSessions(res.message);
      } else {
        setSessions([]);
      }

      if (statsRes?.message) {
        setStats({
          total_sessions: statsRes.message.total_sessions || 0,
          total_hours: statsRes.message.total_hours || 0,
          total_earnings: statsRes.message.total_earnings || 0,
          avg_rating: statsRes.message.avg_rating || 0
        });
      }
    } catch (err) {
      console.error("Failed to fetch session history or stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(true);
  }, [fetchHistory]);

  // format time 13:00:00 -> 1:00 PM
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const getInitials = (studentEmail: string) => {
    const studentName = studentEmail?.split('@')[0] || "ST";
    return studentName.substring(0, 2).toUpperCase();
  };

  // Map backend session array to local schema
  const mappedSessions = useMemo(() => {
    const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
    return sessions.map((s, index) => {
      const studentName = s.student_full_name || s.student_name || s.student?.split('@')[0] || "Student";
      const initials = getInitials(s.student);
      const color = colors[index % colors.length];

      const dateObj = new Date(s.session_date);
      const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const timeStr = `${formatTime(s.from_time)} - ${formatTime(s.to_time)}`;

      return {
        id: s.name || index.toString(),
        initials,
        name: studentName,
        studentEmail: s.student || "",
        title: s.topic || "Session Discussion",
        date: `${dateStr} • ${timeStr}`,
        duration: `${s.duration} min`,
        tag: s.status || "Completed",
        price: s.price ? `₹${s.price}` : "₹1,200",
        rating: s.rating || 5,
        color,
        sharedNote: s.shared_note || "",
        internalNote: s.internal_note || ""
      };
    });
  }, [sessions]);

  // Pagination helper calculations
  const totalHistoryPages = Math.ceil(mappedSessions.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (mappedSessions.length > 0) {
      const maxPage = Math.ceil(mappedSessions.length / ITEMS_PER_PAGE);
      if (historyPage > maxPage) {
        setHistoryPage(maxPage);
      }
    } else {
      setHistoryPage(1);
    }
  }, [mappedSessions.length, historyPage]);

  const paginatedSessions = useMemo(() => {
    const startIndex = (historyPage - 1) * ITEMS_PER_PAGE;
    return mappedSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [mappedSessions, historyPage]);

  // Collapsible notes handling
  const toggleNotes = async (id: string, studentEmail: string) => {
    const isExpanding = !expandedNotes[id];
    setExpandedNotes(prev => ({ ...prev, [id]: isExpanding }));

    if (isExpanding && !sessionNotes[id]) {
      setLoadingNotes(prev => ({ ...prev, [id]: true }));
      try {
        const res = await getSessionNote(id, studentEmail);
        const sessionItem = mappedSessions.find(s => s.id === id);
        if (res?.message?.data) {
          setSessionNotes(prev => ({
            ...prev,
            [id]: {
              notes: res.message.data.notes || sessionItem?.internalNote || "",
              shared_with_student: res.message.data.shared_with_student || sessionItem?.sharedNote || ""
            }
          }));
        } else {
          setSessionNotes(prev => ({
            ...prev,
            [id]: {
              notes: sessionItem?.internalNote || "",
              shared_with_student: sessionItem?.sharedNote || ""
            }
          }));
        }
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        const sessionItem = mappedSessions.find(s => s.id === id);
        setSessionNotes(prev => ({
          ...prev,
          [id]: {
            notes: sessionItem?.internalNote || "",
            shared_with_student: sessionItem?.sharedNote || ""
          }
        }));
      } finally {
        setLoadingNotes(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleEditNotes = (id: string, session: any) => {
    const currentNotes = sessionNotes[id] || {
      notes: session.internalNote || "",
      shared_with_student: session.sharedNote || ""
    };
    setDraftNotes(prev => ({ ...prev, [id]: currentNotes }));
    setEditingNotes(prev => ({ ...prev, [id]: true }));
  };

  const handleCancelEdit = (id: string) => {
    setEditingNotes(prev => ({ ...prev, [id]: false }));
  };

  const handleSaveNotes = async (id: string, studentEmail: string) => {
    setSavingNotes(prev => ({ ...prev, [id]: true }));
    try {
      const payload = {
        session_name: id,
        student: studentEmail,
        notes: draftNotes[id]?.notes || "",
        shared_with_student: draftNotes[id]?.shared_with_student || ""
      };
      await saveSessionNotes(payload);
      setSessionNotes(prev => ({
        ...prev,
        [id]: {
          notes: draftNotes[id]?.notes || "",
          shared_with_student: draftNotes[id]?.shared_with_student || ""
        }
      }));
      setEditingNotes(prev => ({ ...prev, [id]: false }));
      Alert.alert("Success", "Notes updated successfully!");
    } catch (err: any) {
      console.error("Failed to save notes:", err);
      Alert.alert("Error", err?.message || "Failed to save notes. Please try again.");
    } finally {
      setSavingNotes(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleEmailStudent = async (id: string, studentEmail: string) => {
    const sessionItem = mappedSessions.find(s => s.id === id);
    const sharedText = sessionNotes[id]?.shared_with_student || sessionItem?.sharedNote || "";
    if (!sharedText) {
      Alert.alert("Info", "No notes available to share. Please add and save notes for the student first.");
      return;
    }

    setEmailingNotes(prev => ({ ...prev, [id]: true }));
    try {
      const res = await emailSessionNoteToStudent({
        session_name: id,
        student: studentEmail,
        subject: "Session note updated successfully",
        message: sharedText
      });
      Alert.alert("Success", res?.message?.message || "Email sent to student successfully!");
    } catch (err: any) {
      console.error("Failed to email notes:", err);
      Alert.alert("Error", err?.message || "Failed to send email. Please try again.");
    } finally {
      setEmailingNotes(prev => ({ ...prev, [id]: false }));
    }
  };

  // Top Summary Cards definition matching Overview format
  const summaryCards = [
    { label: "TOTAL SESSIONS", value: stats.total_sessions.toString(), icon: LayoutList, color: "#3B82F6" },
    { label: "TOTAL HOURS", value: `${stats.total_hours.toFixed(1)}h`, icon: Clock, color: "#10B981" },
    { label: "NOTES SHARED", value: "—", icon: FileText, color: "#F59E0B" },
    { label: "LIFETIME RATING", value: stats.avg_rating > 0 ? stats.avg_rating.toFixed(1) : "—", icon: Star, color: "#8B5CF6" }
  ];

  if (loading && sessions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4c1d95" />
          <Text style={styles.loadingText}>Loading session history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
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
              <Text style={styles.title}>History</Text>
              <View style={styles.headerBadge}>
                <History size={10} color="#4c1d95" />
                <Text style={styles.headerBadgeText}>PAST SESSIONS</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Review past sessions, ratings and update session notes</Text>
          </Animated.View>

          {/* Stats Row - matching Dashboard Overview style */}
          <Animated.View entering={FadeInRight.delay(100)} style={styles.statsRow}>
            {summaryCards.map((stat, i) => (
              <StatsCard
                key={i}
                title={stat.label}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </Animated.View>

          {/* Session History Title Section */}
          <View style={styles.sectionHeaderRow}>
            <LayoutList size={18} color="#059669" />
            <Text style={styles.sectionTitle}>Session History</Text>
          </View>

          {/* Sessions List */}
          {paginatedSessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No session history found.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {paginatedSessions.map((session, i) => {
                const isExpanded = !!expandedNotes[session.id];
                const isEditing = !!editingNotes[session.id];
                const isNotesLoading = !!loadingNotes[session.id];

                return (
                  <Animated.View
                    key={session.id}
                    entering={FadeInUp.delay(150 + i * 50)}
                    style={styles.historyCard}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={[styles.avatar, { backgroundColor: session.color }]}>
                        <Text style={styles.avatarText}>{session.initials}</Text>
                      </View>
                      <View style={styles.sessionMeta}>
                        <Text style={styles.sessionName} numberOfLines={1}>{session.name}</Text>
                        <Text style={styles.sessionTopic} numberOfLines={2}>{session.title}</Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>{session.price}</Text>
                      </View>
                    </View>

                    {/* Date and Duration row */}
                    <View style={styles.logisticsRow}>
                      <View style={styles.logisticsCol}>
                        <View style={styles.logisticsTag}>
                          <Calendar size={12} color="#64748B" />
                          <Text style={styles.logisticsText}>{session.date}</Text>
                        </View>
                        <View style={[styles.logisticsTag, { marginTop: 6 }]}>
                          <Clock size={12} color="#64748B" />
                          <Text style={styles.logisticsText}>{session.duration}</Text>
                        </View>
                      </View>

                      {/* Ratings stars */}
                      <View style={styles.ratingsColumn}>
                        <View style={styles.starsRow}>
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              size={12}
                              fill={idx < session.rating ? "#F59E0B" : "transparent"}
                              color={idx < session.rating ? "#F59E0B" : "#CBD5E1"}
                            />
                          ))}
                        </View>
                        <TouchableOpacity
                          style={styles.toggleNotesBtn}
                          onPress={() => toggleNotes(session.id, session.studentEmail)}
                        >
                          <Text style={styles.toggleNotesText}>
                            {isExpanded ? 'Hide notes' : 'View notes'}
                          </Text>
                          {isExpanded ? (
                            <ChevronUp size={12} color="#4b5563" />
                          ) : (
                            <ChevronDown size={12} color="#4b5563" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Notes Expanded Section */}
                    {isExpanded && (
                      <View style={styles.notesContainer}>
                        <View style={styles.divider} />
                        {isNotesLoading ? (
                          <ActivityIndicator size="small" color="#4c1d95" style={{ paddingVertical: 12 }} />
                        ) : isEditing ? (
                          <View style={styles.notesEditWrapper}>
                            {/* Shared Note Editor */}
                            <View style={styles.noteFieldWrapper}>
                              <View style={styles.noteFieldHeader}>
                                <View style={[styles.notePill, styles.sharedNotePill]}>
                                  <User size={10} color="#047857" />
                                  <Text style={styles.sharedPillText}>Shared with Student</Text>
                                </View>
                                <Text style={styles.noteFieldSub}>Visible on student's profile</Text>
                              </View>
                              <TextInput
                                style={styles.noteTextInput}
                                multiline
                                numberOfLines={3}
                                value={draftNotes[session.id]?.shared_with_student || ""}
                                onChangeText={(text) => setDraftNotes(prev => {
                                  const current = prev[session.id] || { notes: "", shared_with_student: "" };
                                  return {
                                    ...prev,
                                    [session.id]: {
                                      ...current,
                                      shared_with_student: text
                                    }
                                  };
                                })}
                                placeholder="Enter notes to share with student..."
                              />
                            </View>

                            {/* Internal Note Editor */}
                            <View style={styles.noteFieldWrapper}>
                              <View style={styles.noteFieldHeader}>
                                <View style={[styles.notePill, styles.internalNotePill]}>
                                  <Lock size={10} color="#C2410C" />
                                  <Text style={styles.internalPillText}>Internal Note Only</Text>
                                </View>
                                <Text style={styles.noteFieldSub}>Not visible to student</Text>
                              </View>
                              <TextInput
                                style={styles.noteTextInput}
                                multiline
                                numberOfLines={3}
                                value={draftNotes[session.id]?.notes || ""}
                                onChangeText={(text) => setDraftNotes(prev => {
                                  const current = prev[session.id] || { notes: "", shared_with_student: "" };
                                  return {
                                    ...prev,
                                    [session.id]: {
                                      ...current,
                                      notes: text
                                    }
                                  };
                                })}
                                placeholder="Enter internal notes..."
                              />
                            </View>

                            {/* Saving / Cancel Action buttons */}
                            <View style={styles.notesEditActions}>
                              <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={() => handleSaveNotes(session.id, session.studentEmail)}
                                disabled={savingNotes[session.id]}
                              >
                                {savingNotes[session.id] ? (
                                  <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                  <Text style={styles.saveBtnText}>Save Notes</Text>
                                )}
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => handleCancelEdit(session.id)}
                                disabled={savingNotes[session.id]}
                              >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <View style={styles.notesViewWrapper}>
                            {/* Shared Note Display */}
                            <View style={[styles.noteDisplayBox, styles.sharedNoteDisplay]}>
                              <View style={styles.noteDisplayHeader}>
                                <View style={[styles.notePill, styles.sharedNotePill]}>
                                  <User size={10} color="#047857" />
                                  <Text style={styles.sharedPillText}>Shared with Student</Text>
                                </View>
                                <Text style={styles.noteFieldSub}>Visible on student's profile</Text>
                              </View>
                              <Text style={[
                                styles.noteDisplayText,
                                !(sessionNotes[session.id]?.shared_with_student || session.sharedNote) && styles.italicText
                              ]}>
                                {sessionNotes[session.id]?.shared_with_student || session.sharedNote || "No notes shared with student yet. Click 'Edit Notes' to add."}
                              </Text>
                            </View>

                            {/* Internal Note Display */}
                            <View style={[styles.noteDisplayBox, styles.internalNoteDisplay]}>
                              <View style={styles.noteDisplayHeader}>
                                <View style={[styles.notePill, styles.internalNotePill]}>
                                  <Lock size={10} color="#C2410C" />
                                  <Text style={styles.internalPillText}>Internal Note Only</Text>
                                </View>
                                <Text style={styles.noteFieldSub}>Not visible to student</Text>
                              </View>
                              <Text style={[
                                styles.noteDisplayText,
                                !(sessionNotes[session.id]?.notes || session.internalNote) && styles.italicText
                              ]}>
                                {sessionNotes[session.id]?.notes || session.internalNote || "No internal notes added yet. Click 'Edit Notes' to add."}
                              </Text>
                            </View>

                            {/* Editing / Email Action buttons */}
                            <View style={styles.notesViewActions}>
                              <TouchableOpacity
                                style={styles.editNotesBtn}
                                onPress={() => handleEditNotes(session.id, session)}
                              >
                                <Edit2 size={12} color="#475569" style={{ marginRight: 6 }} />
                                <Text style={styles.editNotesText}>Edit Notes</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.emailNotesBtn}
                                onPress={() => handleEmailStudent(session.id, session.studentEmail)}
                                disabled={emailingNotes[session.id]}
                              >
                                {emailingNotes[session.id] ? (
                                  <ActivityIndicator size="small" color="#475569" />
                                ) : (
                                  <>
                                    <Mail size={12} color="#475569" style={{ marginRight: 6 }} />
                                    <Text style={styles.emailNotesText}>Email to Student</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          )}

          <Pagination
            currentPage={historyPage}
            totalPages={totalHistoryPages}
            onPageChange={setHistoryPage}
            activeColor="#4c1d95"
          />

          <View style={styles.footerSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },

  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', lineHeight: 16 },

  // Stats row matching overview dashboard styles
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 20 },

  // Section divider header
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },

  list: { gap: 16 },
  historyCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  sessionMeta: { flex: 1 },
  sessionName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  sessionTopic: { fontSize: 12, color: '#475569', fontWeight: '500' },
  priceContainer: { alignItems: 'flex-end' },
  priceText: { fontSize: 16, fontWeight: '800', color: '#059669' },

  logisticsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  logisticsCol: { flex: 1, marginRight: 12 },
  logisticsTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logisticsText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  ratingsColumn: { alignItems: 'flex-end', justifyContent: 'flex-end' },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  toggleNotesBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toggleNotesText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },

  // Expanded notes styles
  notesContainer: { marginTop: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  notesEditWrapper: { gap: 12 },
  noteFieldWrapper: { gap: 8 },
  noteFieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sharedNotePill: { backgroundColor: '#D1FAE5' },
  internalNotePill: { backgroundColor: '#FFEDD5' },
  sharedPillText: { fontSize: 9, fontWeight: '800', color: '#047857' },
  internalPillText: { fontSize: 9, fontWeight: '800', color: '#C2410C' },
  noteFieldSub: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },
  noteTextInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, fontSize: 13, color: '#334155', backgroundColor: '#F8FAFC', textAlignVertical: 'top', minHeight: 70 },

  notesEditActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveBtn: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  cancelBtn: { borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },

  notesViewWrapper: { gap: 12 },
  noteDisplayBox: { padding: 12, borderRadius: 8, borderWidth: 1 },
  sharedNoteDisplay: { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' },
  internalNoteDisplay: { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' },
  noteDisplayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  noteDisplayText: { fontSize: 13, color: '#334155', lineHeight: 18, fontWeight: '500' },
  italicText: { fontStyle: 'italic', color: '#94A3B8' },

  notesViewActions: { flexDirection: 'row', gap: 12 },
  editNotesBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 8, borderRadius: 8, backgroundColor: '#FFF' },
  editNotesText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  emailNotesBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 8, borderRadius: 8, backgroundColor: '#FFF' },
  emailNotesText: { fontSize: 12, fontWeight: '700', color: '#475569' },

  // Empty state
  emptyContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '500' },

  footerSpacer: { height: 40 }
});
