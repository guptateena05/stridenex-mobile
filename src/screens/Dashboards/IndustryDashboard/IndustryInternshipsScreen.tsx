import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import {
  Plus,
  Calendar,
  Users,
  Banknote,
  Briefcase,
  Clock,
  Trash2,
  Trophy,
  X
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useIndustry } from '@/context/IndustryContext';
import {
  getInternshipList,
  createInternship,
  updateInternship,
  deleteInternship,
  createSkill,
  createCourse,
  createDepartment
} from '@/api/industry.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';

export const IndustryInternshipsScreen = () => {
  const { industryData } = useIndustry();
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    applications: 0,
    openings: 0,
    closingSoon: 0
  });

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const [editingInternship, setEditingInternship] = useState<any>(null);

  const companyName = industryData?.company_name || industryData?.name;

  const fetchInternshipData = useCallback(async () => {
    if (!companyName) return;

    try {
      setLoading(true);
      const response = await getInternshipList(companyName);

      // Parse response based on user provided structure
      // response: { status: 200, message: "...", data: [...] }
      let list = [];
      if (response && Array.isArray(response.data)) {
        list = response.data;
      } else if (response?.message && Array.isArray(response.message.data)) {
        list = response.message.data;
      } else if (Array.isArray(response)) {
        list = response;
      }

      setInternships(list);

      // Calculate simple stats
      setStats({
        active: list.filter((i: any) => i.status === 'Active').length,
        applications: list.reduce((acc: number, curr: any) => acc + (Number(curr.total_applications) || 0), 0),
        openings: list.reduce((acc: number, curr: any) => acc + (Number(curr.openings) || 0), 0),
        closingSoon: list.filter((i: any) => i.status === 'Closing').length
      });
    } catch (err) {
      console.error("Error fetching internship data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyName]);

  useEffect(() => {
    fetchInternshipData();
  }, [fetchInternshipData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInternshipData();
  };

  const handlePostNew = () => {
    setEditingInternship(null);
    setFormValues({ status: 'Active', industry: companyName });
    setIsModalVisible(true);
  };

  const handleEdit = (internship: any) => {
    setEditingInternship(internship);

    // Map API fields to Form fields
    setFormValues({
      ...internship,
      internship_title: internship.title,
      location_type: internship.work_mode,
      payment_type: internship.payment_mode,
      domain: internship.type,
      required_skills: Array.isArray(internship.skills)
        ? internship.skills.map((s: any) => s.skill || s)
        : [],
      course: Array.isArray(internship.course) ? internship.course : [],
      department: Array.isArray(internship.department) ? internship.department : [],
      academic_year: Array.isArray(internship.academic_year) ? internship.academic_year : []
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (internshipName: string) => {
    Alert.alert(
      "Delete Internship",
      "Are you sure you want to delete this internship posting?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteInternship(internshipName);
              fetchInternshipData();
              Alert.alert("Success", "Internship deleted successfully");
            } catch (err) {
              Alert.alert("Error", "Failed to delete internship");
            }
          }
        }
      ]
    );
  };

  const handleFormChange = (newData: any) => {
    // End Date calculation: Start Date + Duration
    if (newData.start_date && newData.duration) {
      const start = new Date(newData.start_date);
      if (!isNaN(start.getTime())) {
        const durationDays = parseInt(newData.duration, 10);
        if (!isNaN(durationDays)) {
          const end = new Date(start);
          end.setDate(end.getDate() + durationDays);
          const endStr = end.toISOString().split('T')[0];

          if (newData.end_date !== endStr) {
            setFormValues({
              ...newData,
              end_date: endStr
            });
            return;
          }
        }
      }
    }
    setFormValues(newData);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setModalLoading(true);

      // Map Form fields to API fields as per provided response structure
      const payload = {
        title: formData.internship_title,
        type: formData.domain,
        work_mode: formData.location_type,
        payment_mode: formData.payment_type,
        location: formData.location || formData.location_type,
        stipend: formData.payment_type === 'Paid' ? Number(formData.stipend) : 0,
        duration: Number(formData.duration),
        start_date: formData.start_date,
        end_date: formData.end_date,
        application_deadline: formData.application_deadline,
        openings: Number(formData.no_of_openings),
        status: formData.status,
        course: formData.course || [],
        department: formData.department || [],
        academic_year: formData.academic_year || [],
        industry: companyName,
        description: formData.description,
        skills: Array.isArray(formData.required_skills)
          ? formData.required_skills.map((s: string) => ({ skill: s }))
          : []
      };

      if (editingInternship) {
        await updateInternship(editingInternship.name, { ...payload, name: editingInternship.name });
        Alert.alert("Success", "Internship updated successfully");
      } else {
        await createInternship(payload);
        Alert.alert("Success", "Internship created successfully");
      }
      setIsModalVisible(false);
      fetchInternshipData();
    } catch (err: any) {
      console.error("Error saving internship:", err);
      Alert.alert("Error", err?.message || "Failed to save internship");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateCustomValue = async (fieldName: string, value: string) => {
    try {
      if (fieldName === 'required_skills') {
        await createSkill(value);
      } else if (fieldName === 'course') {
        await createCourse(value);
      } else if (fieldName === 'department') {
        await createDepartment(value);
      }
    } catch (err) {
      console.error(`Error creating custom value for ${fieldName}:`, err);
      throw err;
    }
  };

  const internshipFields: FormField[] = useMemo(() => [
    {
      fieldname: 'internship_title',
      label: 'Internship Title',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. Backend Developer Intern'
    },
    {
      fieldname: 'domain',
      label: 'Domain',
      fieldtype: 'Link',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Domain' },
      required: true,
    },
    {
      fieldname: 'industry',
      label: 'Industry',
      fieldtype: 'Data',
      disabled: true,
    },
    {
      fieldname: 'location_type',
      label: 'Location Type',
      fieldtype: 'Select',
      options: ['Remote', 'Hybrid', 'On-site'],
      required: true,
    },
    {
      fieldname: 'payment_type',
      label: 'Payment',
      fieldtype: 'Select',
      options: ['Paid', 'Unpaid'],
      required: true,
    },
    {
      fieldname: 'stipend',
      label: 'Stipend (Monthly)',
      fieldtype: 'Int',
      required: formValues.payment_type === 'Paid',
      placeholder: 'e.g. 15000',
      hidden: formValues.payment_type === 'Unpaid'
    },
    {
      fieldname: 'duration',
      label: 'Duration (Days)',
      fieldtype: 'Int',
      required: true,
      placeholder: 'e.g. 90',
    },
    {
      fieldname: 'start_date',
      label: 'Start Date',
      fieldtype: 'Date',
      required: true,
    },
    {
      fieldname: 'end_date',
      label: 'End Date',
      fieldtype: 'Date',
      disabled: true,
    },
    {
      fieldname: 'application_deadline',
      label: 'Application Deadline',
      fieldtype: 'Date',
      required: true,
    },
    {
      fieldname: 'no_of_openings',
      label: 'Openings',
      fieldtype: 'Int',
      required: true,
      placeholder: 'e.g. 10',
    },
    {
      fieldname: 'status',
      label: 'Status',
      fieldtype: 'Select',
      options: ['Active', 'Completed', 'Closing', 'Disable'],
      required: true,
    },
    {
      fieldname: 'course',
      label: 'Course',
      fieldtype: 'Link',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Courses' },
      mapOptions: (data: any) => {
        const options = data.map((item: any) => {
          const val = item.name || item.value || (typeof item === 'string' ? item : '');
          const lbl = item.label || item.name || (typeof item === 'string' ? item : '');
          return { value: val, label: lbl };
        });
        return [{ value: 'All', label: 'All' }, ...options];
      },
      multiSelect: true,
      required: true,
      allowCustom: false
    },
    {
      fieldname: 'department',
      label: 'Department',
      fieldtype: 'Link',
      apiEndpoint: 'method/stridenex_app.stridenex_app.doctype.college_department.college_department.get_departments_by_course',
      apiParams: { courses: formValues.course ? (Array.isArray(formValues.course) ? formValues.course.join(',') : formValues.course) : '' },
      multiSelect: true,
      required: true,
      allowCustom: false
    },
    {
      fieldname: 'academic_year',
      label: 'Academic Year',
      fieldtype: 'Select',
      options: ['2', '3', '4'],
      multiSelect: true,
      required: true,
    },
    {
      fieldname: 'required_skills',
      label: 'Required Skills',
      fieldtype: 'Link',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Skill' },
      multiSelect: true,
      required: true,
      allowCustom: true
    },
    {
      fieldname: 'description',
      label: 'Description',
      fieldtype: 'Long Text',
      required: true,
    }
  ], [formValues.payment_type, editingInternship, formValues.course]);

  const statsCards = [
    { label: "ACTIVE ROLES", value: String(stats.active), icon: Briefcase, color: "#9333EA" },
    { label: "APPLICATIONS", value: String(stats.applications), icon: Users, color: "#3B82F6" },
    { label: "OPENINGS", value: String(stats.openings), icon: Trophy, color: "#10B981" },
    { label: "CLOSING SOON", value: String(stats.closingSoon), icon: Clock, color: "#F97316" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Internships</Text>
            <View style={styles.headerBadge}>
              <Briefcase size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>OPPORTUNITIES</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Manage active and draft internship postings</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={styles.statsRow}>
          {statsCards.map((card, idx) => (
            <StatsCard key={idx} title={card.label} value={card.value} icon={card.icon} color={card.color} />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150)} style={{ marginBottom: 24 }}>
          <TouchableOpacity style={styles.postBtn} onPress={handlePostNew}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.postBtnText}>Post Internship</Text>
          </TouchableOpacity>
        </Animated.View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.purple[600]} style={{ marginTop: 40 }} />
        ) : internships.length > 0 ? (
          <Animated.View entering={FadeInUp.delay(200)}>
            {internships.map((job, idx) => (
              <Animated.View key={job.name || idx} entering={FadeInUp.delay(250 + idx * 50)} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleArea}>
                    <View style={styles.iconBox}>
                      <Briefcase size={18} color="#64748B" />
                    </View>
                    <View style={styles.titleInfo}>
                      <Text style={styles.jobRole} numberOfLines={1}>{job.title || job.internship_title}</Text>
                      <Text style={styles.jobSubtitle}>{job.type} • {job.work_mode || job.location}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, job.status === 'Active' ? styles.statusActive : (job.status === 'Closing' ? styles.statusClosing : styles.statusDisabled)]}>
                    <Text style={[styles.statusText, job.status === 'Active' ? styles.statusTextActive : (job.status === 'Closing' ? styles.statusTextClosing : styles.statusTextDisabled)]}>
                      {job.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Banknote size={14} color="#10B981" />
                    <Text style={styles.infoText}>{job.payment_mode === 'Paid' ? `₹${job.stipend}` : (job.stipend > 0 ? `₹${job.stipend}` : 'Unpaid')}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Users size={14} color="#3B82F6" />
                    <Text style={styles.infoText}>{job.openings} Openings</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Calendar size={14} color="#F59E0B" />
                    <Text style={styles.infoText}>Ends {job.application_deadline || job.deadline}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.footerRow}>
                  <View style={styles.appCountBox}>
                    <Text style={styles.appCountNum}>{job.total_applications || 0}</Text>
                    <Text style={styles.appCountLabel}>APPLICATIONS</Text>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn, job.status === 'Disable' && styles.disabledBtn]}
                      onPress={() => job.status !== 'Disable' && handleDelete(job.name)}
                      disabled={job.status === 'Disable'}
                    >
                      <Trash2 size={16} color={job.status === 'Disable' ? "#94A3B8" : "#EF4444"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.manageBtn, job.status === 'Disable' && styles.disabledManageBtn]}
                      onPress={() => job.status !== 'Disable' && handleEdit(job)}
                      disabled={job.status === 'Disable'}
                    >
                      <Text style={styles.manageBtnText}>Manage</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        ) : (
          <View style={styles.emptyContainer}>
            <Briefcase size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No internship postings found.</Text>
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeInUp.springify().damping(20)}
            style={styles.modalContent}
          >
            <View style={styles.dragHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconBox}>
                  <Briefcase size={22} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>{editingInternship ? 'Update Internship' : 'Post Internship'}</Text>
                  <Text style={styles.modalSubtitle}>Manage your talent acquisition pipeline</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <DynamicForm
                fields={internshipFields}
                onSubmit={handleFormSubmit}
                onChange={handleFormChange}
                onCreateCustomValue={handleCreateCustomValue}
                loading={modalLoading}
                initialValues={formValues}
                buttonLabel={editingInternship ? "Save Changes" : "Post Internship"}
              />
              <View style={{ height: 60 }} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24, flexWrap: 'wrap' },

  postBtn: { backgroundColor: colors.purple[600], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, shadowColor: colors.purple[600], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  postBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  titleInfo: { flex: 1 },
  jobRole: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  jobSubtitle: { fontSize: 9, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase' },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusActive: { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' },
  statusClosing: { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' },
  statusDisabled: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  statusText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  statusTextActive: { color: '#059669' },
  statusTextClosing: { color: '#D97706' },
  statusTextDisabled: { color: '#94A3B8' },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, fontWeight: '600', color: '#475569' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appCountBox: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  appCountNum: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  appCountLabel: { fontSize: 8, fontWeight: '800', color: '#CBD5E1', textTransform: 'uppercase' },

  actionRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  deleteBtn: { backgroundColor: '#FEF2F2' },
  disabledBtn: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  manageBtn: { backgroundColor: colors.purple[600], paddingHorizontal: 12, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  disabledManageBtn: { backgroundColor: '#CBD5E1' },
  manageBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, opacity: 0.6 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F97316', // Orange from the screenshot
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
    letterSpacing: -0.5
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  modalScrollContent: {
    padding: 24,
    paddingTop: 16
  },
  footerSpacer: { height: 40 }
});
