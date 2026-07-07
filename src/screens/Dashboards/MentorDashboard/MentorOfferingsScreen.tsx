import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import {
  Plus,
  Clock,
  Star,
  Award,
  X,
  AlertCircle,
  Edit2
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import {
  getMentorOfferings,
  createMentorOffering,
  updateMentorOffering,
  createLmsBatchForOffering
} from '@/api/mentor.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';

export const MentorOfferingsScreen = () => {
  const { userName } = useAuth();

  // Screen Data states
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingOffering, setEditingOffering] = useState<any>(null);
  const [formValues, setFormValues] = useState<any>({});

  // Fetch Offerings from API
  const fetchOfferings = useCallback(async (isRefresh = false) => {
    if (!userName) return;
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const res = await getMentorOfferings(userName);
      const data = res?.message?.data || res?.message || [];
      setOfferings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch offerings:", err);
      setError(err?.message || "Failed to load offerings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchOfferings();
  }, [fetchOfferings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOfferings(true);
  }, [fetchOfferings]);

  // Handle status toggle (Live <-> Paused)
  const handleStatusToggle = async (offering: any) => {
    const currentStatus = offering.status;
    const newStatus = currentStatus === "Live" ? "Paused" : "Live";

    // Optimistic update
    setOfferings(prev => prev.map(o => o.name === offering.name ? { ...o, status: newStatus } : o));

    try {
      const payload = {
        ...offering,
        status: newStatus,
        is_featured: parseInt(String(offering.is_featured || "0"), 10),
        price_per_session: parseFloat(String(offering.price_per_session || "0")),
        duration_minutes: parseInt(String(offering.duration_minutes || "60"), 10),
        max_group_size: parseInt(String(offering.max_group_size || "1"), 10),
      };

      await updateMentorOffering(offering.name, payload);
    } catch (err: any) {
      // Revert if update fails
      setOfferings(prev => prev.map(o => o.name === offering.name ? { ...o, status: currentStatus } : o));
      Alert.alert("Error", err?.message || "Failed to update status");
    }
  };

  // Form Fields Schema mapping
  const formFields: FormField[] = useMemo(() => {
    const isGroupOrWorkshop = ["Group Session", "Workshop"].includes(formValues.offering_type);

    const fields: FormField[] = [
      {
        fieldname: "title",
        label: "Offering Title",
        fieldtype: "Data",
        required: true,
        placeholder: "e.g. Django API Bootcamp",
      },
      {
        fieldname: "offering_type",
        label: "Offering Type",
        fieldtype: "Select",
        required: true,
        options: ["1:1 Mentorship", "Group Session", "Async Review", "Workshop"],
        placeholder: "Select Type",
      },
      {
        fieldname: "category",
        label: "Category",
        fieldtype: "Select",
        required: true,
        options: ["Career", "Technical", "Interview Prep", "Resume", "Startup"],
        placeholder: "Select Category",
      },
      {
        fieldname: "price_per_session",
        label: "Price per Session (₹)",
        fieldtype: "Currency",
        required: true,
        placeholder: "e.g. 1500",
      },
      {
        fieldname: "duration_minutes",
        label: "Duration (minutes)",
        fieldtype: "Int",
        required: true,
        placeholder: "e.g. 60",
      },
      {
        fieldname: "max_group_size",
        label: "Max Group Size",
        fieldtype: "Int",
        required: false,
        placeholder: "e.g. 1",
      },
      {
        fieldname: "status",
        label: "Initial Status",
        fieldtype: "Select",
        required: true,
        options: ["Live", "Draft", "Paused"],
        placeholder: "Select Status",
      },
    ];

    if (isGroupOrWorkshop) {
      fields.push(
        {
          fieldname: "start_date",
          label: "Start Date",
          fieldtype: "Date",
          required: true,
          placeholder: "Select Date",
        },
        {
          fieldname: "end_date",
          label: "End Date",
          fieldtype: "Date",
          required: true,
          placeholder: "Select Date",
        },
        {
          fieldname: "start_time",
          label: "Start Time",
          fieldtype: "Time",
          required: true,
          placeholder: "Select Time",
        },
        {
          fieldname: "end_time",
          label: "End Time",
          fieldtype: "Time",
          required: true,
          placeholder: "Select Time",
        }
      );
    }

    fields.push({
      fieldname: "description",
      label: "Detailed Description",
      fieldtype: "Long Text",
      required: true,
      placeholder: "What will students learn in this offering?",
    });

    if (isGroupOrWorkshop) {
      fields.push({
        fieldname: "batch_details",
        label: "Batch Details",
        fieldtype: "Long Text",
        required: false,
        placeholder: "Specific info about this batch (optional)",
      });
    }

    return fields;
  }, [formValues.offering_type]);

  // Handle Form Change (sync dynamic show/hide)
  const handleFormChange = (newData: any) => {
    setFormValues((prev: any) => ({ ...prev, ...newData }));
  };

  // Create / Update form submission
  const handleFormSubmit = async (formData: any) => {
    if (!userName) return;
    setModalLoading(true);
    try {
      const payload = {
        ...formData,
        mentor: userName,
        is_featured: formData.is_featured === '1' || formData.is_featured === 1 || formData.is_featured === true ? 1 : 0,
        price_per_session: parseFloat(String(formData.price_per_session || '0')),
        duration_minutes: parseInt(String(formData.duration_minutes || '60'), 10),
        max_group_size: parseInt(String(formData.max_group_size || '1'), 10),
        ...(editingOffering ? { name: editingOffering.name } : {}),
      };

      if (editingOffering) {
        await updateMentorOffering(editingOffering.name, payload);
        Alert.alert("Success", "Offering updated successfully!");
        setIsModalVisible(false);
        fetchOfferings(true);
      } else {
        const response = await createMentorOffering(payload);
        const createdName = response?.message?.name || response?.name || response?.message || response?.data?.name;

        setIsModalVisible(false);
        fetchOfferings(true);

        if (createdName && formData.offering_type === "Group Session") {
          Alert.alert(
            "Create LMS Batch",
            `An LMS Batch must be created for your group session offering "${formData.title || createdName}".`,
            [
              {
                text: "Create Batch Now",
                onPress: async () => {
                  try {
                    setLoading(true);
                    const batchRes = await createLmsBatchForOffering(createdName);
                    
                    if (batchRes && batchRes.exc_type) {
                      let errMsg = "Failed to create LMS batch. Please try again.";
                      if (batchRes._server_messages) {
                        try {
                          const messages = JSON.parse(batchRes._server_messages);
                          const msgObj = JSON.parse(messages[0]);
                          errMsg = msgObj.message || errMsg;
                        } catch (e) {
                          console.error("Error parsing server messages:", e);
                        }
                      }
                      Alert.alert("Error", errMsg);
                    } else {
                      const msg = batchRes?.message?.message || (typeof batchRes?.message === "string" ? batchRes.message : null) || "Batch created successfully";
                      Alert.alert("Success", msg);
                      fetchOfferings(true);
                    }
                  } catch (err: any) {
                    console.error("Error creating LMS batch:", err);
                    Alert.alert("Error", err?.message || "Failed to create LMS Batch");
                  } finally {
                    setLoading(false);
                  }
                }
              }
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert("Success", "Offering created successfully!");
        }
      }
    } catch (err: any) {
      console.error("Failed to submit offering:", err);
      Alert.alert("Error", err?.message || "Failed to save offering. Please check your inputs.");
    } finally {
      setModalLoading(false);
    }
  };

  // Open Add Modal
  const handleAddOffering = () => {
    setEditingOffering(null);
    setFormValues({
      offering_type: "1:1 Mentorship",
      category: "Technical",
      price_per_session: "500",
      duration_minutes: "60",
      max_group_size: "1",
      status: "Live",
      is_featured: "0",
      description: ""
    });
    setIsModalVisible(true);
  };

  // Open Edit Modal
  const handleEditOffering = (offering: any) => {
    setEditingOffering(offering);
    setFormValues({
      ...offering,
      price_per_session: offering.price_per_session !== undefined ? String(offering.price_per_session) : "500",
      duration_minutes: offering.duration_minutes !== undefined ? String(offering.duration_minutes) : "60",
      max_group_size: offering.max_group_size !== undefined ? String(offering.max_group_size) : "1",
      is_featured: offering.is_featured === 1 || offering.is_featured === '1' ? '1' : '0'
    });
    setIsModalVisible(true);
  };

  if (loading && offerings.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4c1d95" />
          <Text style={styles.loadingText}>Loading offerings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && offerings.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <AlertCircle size={40} color="#EF4444" style={{ marginBottom: 12 }} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOfferings(false)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>Offerings</Text>
            <View style={styles.headerBadge}>
              <Award size={10} color="#4c1d95" />
              <Text style={styles.headerBadgeText}>YOUR SERVICES</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Define your mentorship packages and pricing</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={{ marginBottom: 16 }}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddOffering}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.primaryBtnText}>Create New Offering</Text>
          </TouchableOpacity>
        </Animated.View>

        {offerings.length === 0 ? (
          <Animated.View entering={FadeInUp.delay(150)} style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Plus size={28} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No offerings yet</Text>
            <Text style={styles.emptySubtitle}>Create your first mentorship offering to start helping students.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={handleAddOffering}>
              <Text style={styles.emptyBtnText}>Create Offering</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.list}>
            {offerings.map((pkg, i) => {
              const isLive = pkg.status === 'Live';
              const isPaused = pkg.status === 'Paused';

              return (
                <Animated.View
                  key={pkg.name || i}
                  entering={FadeInUp.delay(150 + i * 50)}
                  style={[styles.card, !isLive && styles.cardInactive]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.pkgTitle} numberOfLines={1}>{pkg.title}</Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: isLive ? '#ECFDF5' : isPaused ? '#FFFBEB' : '#F1F5F9',
                      borderColor: isLive ? '#D1FAE5' : isPaused ? '#FEF3C7' : '#E2E8F0'
                    }]}>
                      <View style={[styles.statusDot, { backgroundColor: isLive ? '#10B981' : isPaused ? '#F59E0B' : '#94A3B8' }]} />
                      <Text style={[styles.statusText, { color: isLive ? '#059669' : isPaused ? '#D97706' : '#64748B' }]}>
                        {pkg.status ? pkg.status.toUpperCase() : 'DRAFT'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.badgesRow}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{pkg.offering_type || '1:1 Mentorship'}</Text>
                    </View>
                    <View style={styles.durationBadge}>
                      <Clock size={14} color="#64748B" />
                      <Text style={styles.durationText}>{pkg.duration_minutes ? `${pkg.duration_minutes} min` : '60 min'}</Text>
                    </View>
                    <Text style={[styles.categoryText, { color: pkg.category === 'Technical' ? '#EA580C' : '#2563EB' }]}>
                      {pkg.category || 'General'}
                    </Text>
                  </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.statColumn}>
                      <Text style={styles.statValue}>₹{pkg.price_per_session || '0'}</Text>
                      <Text style={styles.statLabel}>Per Session</Text>
                    </View>
                    <View style={styles.columnDivider} />
                    <View style={styles.statColumn}>
                      <Text style={styles.statValue}>{pkg.total_bookings || 0}</Text>
                      <Text style={styles.statLabel}>Bookings</Text>
                    </View>
                    <View style={styles.columnDivider} />
                    <View style={styles.statColumn}>
                      <View style={styles.ratingRow}>
                        <Star size={14} color="#EAB308" fill="#EAB308" />
                        <Text style={[styles.statValue, { marginLeft: 4 }]}>
                          {Number(pkg.avg_rating || 0).toFixed(0)}
                        </Text>
                      </View>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                  </View>

                  <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.btnOutline} onPress={() => handleEditOffering(pkg)}>
                      <Edit2 size={14} color="#334155" style={{ marginRight: 6 }} />
                      <Text style={styles.btnOutlineText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnOutline}
                      onPress={() => handleStatusToggle(pkg)}
                    >
                      <Text style={styles.btnOutlineText}>
                        {isLive ? 'Pause' : 'Activate'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Form Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editingOffering ? 'Edit Offering' : 'Create New Offering'}</Text>
                <Text style={styles.modalSubtitle}>
                  {editingOffering ? 'Modify your package details' : 'Define a new mentorship package'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <DynamicForm
                fields={formFields}
                onSubmit={handleFormSubmit}
                initialValues={formValues}
                onChange={handleFormChange}
                loading={modalLoading}
                buttonLabel={editingOffering ? 'Save Changes' : 'Create Offering'}
                accentColor={colors.violet[600]}
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
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },

  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  primaryBtn: { backgroundColor: '#4c1d95', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, shadowColor: '#4c1d95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  primaryBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  list: { gap: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardInactive: { backgroundColor: '#F8FAFC', opacity: 0.8 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  pkgTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, flex: 1, marginRight: 8 },

  badgesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 16 },
  typeBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  categoryText: { fontSize: 12, fontWeight: '700' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, marginBottom: 16 },
  statColumn: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 },
  columnDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },

  actionsContainer: { flexDirection: 'row', gap: 12 },
  btnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 8 },
  btnOutlineText: { fontSize: 13, fontWeight: '700', color: '#334155' },

  emptyCard: { backgroundColor: '#FFF', borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', padding: 32, alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  emptyIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 6, fontFamily: typography.fontFamily.display },
  emptySubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500', textAlign: 'center', marginBottom: 20, maxWidth: 260, lineHeight: 18 },
  emptyBtn: { backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '500' },
  errorText: { fontSize: 14, color: '#EF4444', fontWeight: '600', marginBottom: 16 },
  retryBtn: { backgroundColor: '#4c1d95', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', paddingHorizontal: 20, paddingTop: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display },
  modalSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20 },
  modalScroll: { paddingBottom: 60 },

  footerSpacer: { height: 40 }
});
