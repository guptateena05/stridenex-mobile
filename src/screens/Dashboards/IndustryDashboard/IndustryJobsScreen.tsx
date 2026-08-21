import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import {
  Plus,
  Calendar,
  Users,
  Banknote,
  Briefcase,
  Clock,
  Trophy,
  X,
  Target
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SkeletonLoader } from '@/components/Shared/SkeletonLoader';
import { SwipeableRow } from '@/components/Shared/SwipeableRow';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useIndustry } from '@/context/IndustryContext';
import {
  getJobProfiles,
  createJobProfile,
  updateJobProfile,
  createSkill,
  createCourse,
  createDepartment,
  uploadFile
} from '@/api/industry.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';

export const IndustryJobsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { industryData } = useIndustry();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    openings: 0,
    total: 0
  });

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const [editingJob, setEditingJob] = useState<any>(null);

  const companyName = industryData?.company_name || industryData?.name;

  const fetchJobsData = useCallback(async () => {
    if (!companyName) return;

    try {
      setLoading(true);
      const response = await getJobProfiles(companyName);

      const dataObj = response?.data || response?.message?.data || response?.message || response || [];
      let list = [];
      if (Array.isArray(dataObj)) {
        list = dataObj;
      } else if (dataObj && typeof dataObj === 'object' && Array.isArray(dataObj.data)) {
        list = dataObj.data;
      }

      // Filter by company name
      const filtered = list.filter((job: any) => job.industry === companyName);

      setJobs(filtered);

      // Calculate stats
      setStats({
        active: filtered.filter((j: any) => j.status === 'Open').length,
        openings: filtered.reduce((acc: number, curr: any) => acc + (Number(curr.openings) || 0), 0),
        total: filtered.length
      });
    } catch (err) {
      console.error("Error fetching jobs data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyName]);

  useFocusEffect(
    useCallback(() => {
      fetchJobsData();

      if (route.params?.openForm) {
        setEditingJob(null);
        setFormValues({ status: 'Open', industry: companyName, experience: 'Fresher', employment_type: 'Full Time' });
        setIsModalVisible(true);
      }

      return () => {
        navigation.setParams({ openForm: undefined });
      };
    }, [fetchJobsData, route.params?.openForm, navigation, companyName])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobsData();
  };

  const handlePostNew = () => {
    setEditingJob(null);
    setFormValues({ status: 'Open', industry: companyName, experience: 'Fresher', employment_type: 'Full Time' });
    setIsModalVisible(true);
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setFormValues({
      ...job,
      job_title: job.job_title,
      experience: job.experience,
      employment_type: job.employment_type,
      location: job.location,
      salary_from: job.salary_from ? String(job.salary_from) : '',
      salary_to: job.salary_to ? String(job.salary_to) : '',
      openings: job.openings ? String(job.openings) : '',
      last_date: job.last_date,
      contact_person: job.contact_person,
      contact_email: job.contact_email,
      contact_phone: job.contact_phone,
      status: job.status,
      course: Array.isArray(job.course) ? job.course.map((c: any) => c.course || c) : [],
      department: Array.isArray(job.department) ? job.department.map((d: any) => d.department || d) : [],
      skills_required: Array.isArray(job.skills_required)
        ? job.skills_required.map((s: any) => s.skill || s)
        : []
    });
    setIsModalVisible(true);
  };

  const handleFormChange = (newData: any) => {
    setFormValues(newData);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setModalLoading(true);

      const payload = {
        name: editingJob?.name || undefined,
        job_title: formData.job_title,
        experience: formData.experience,
        employment_type: formData.employment_type,
        location: formData.location,
        salary_from: Number(formData.salary_from),
        salary_to: Number(formData.salary_to),
        openings: Number(formData.openings),
        last_date: formData.last_date,
        contact_person: formData.contact_person,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        status: formData.status,
        is_active: 1,
        course: formData.course || [],
        department: formData.department || [],
        skills_required: Array.isArray(formData.skills_required)
          ? formData.skills_required.map((s: string) => ({ skill: s }))
          : [],
        job_description: formData.job_description,
        industry: companyName
      };

      if (editingJob) {
        await updateJobProfile(payload);
      } else {
        await createJobProfile(payload);
      }
      Alert.alert("Success", `Job Profile ${editingJob ? 'updated' : 'created'} successfully`);
      setIsModalVisible(false);
      setEditingJob(null);
      fetchJobsData();
    } catch (err: any) {
      console.error("Error saving job profile:", err);
      Alert.alert("Error", err?.message || "Failed to save job profile");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateCustomValue = async (fieldName: string, value: string) => {
    try {
      if (fieldName === 'skills_required') {
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

  const jobFields: FormField[] = useMemo(() => [
    {
      fieldname: 'job_title',
      label: 'Job Title',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. Python Developer'
    },
    {
      fieldname: 'industry',
      label: 'Industry',
      fieldtype: 'Data',
      disabled: true,
    },
    {
      fieldname: 'experience',
      label: 'Experience Required',
      fieldtype: 'Select',
      options: ['Fresher', '0-1 Years', '1-2 Years', '2-4 Years', '3-5 Years', '5+ Years'],
      required: true,
    },
    {
      fieldname: 'employment_type',
      label: 'Employment Type',
      fieldtype: 'Select',
      options: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'],
      required: true,
    },
    {
      fieldname: 'location',
      label: 'Location',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. Pune'
    },
    {
      fieldname: 'salary_from',
      label: 'Salary From (LPA)',
      fieldtype: 'Int',
      required: true,
      placeholder: 'e.g. 400000'
    },
    {
      fieldname: 'salary_to',
      label: 'Salary To (LPA)',
      fieldtype: 'Int',
      required: true,
      placeholder: 'e.g. 700000'
    },
    {
      fieldname: 'openings',
      label: 'Openings',
      fieldtype: 'Int',
      required: true,
      placeholder: 'e.g. 3'
    },
    {
      fieldname: 'last_date',
      label: 'Last Date to Apply',
      fieldtype: 'Date',
      required: true,
    },
    {
      fieldname: 'contact_person',
      label: 'Contact Person',
      fieldtype: 'Data',
      placeholder: 'e.g. John Doe'
    },
    {
      fieldname: 'contact_email',
      label: 'Contact Email',
      fieldtype: 'Data',
      placeholder: 'e.g. john@example.com'
    },
    {
      fieldname: 'contact_phone',
      label: 'Contact Phone',
      fieldtype: 'Data',
      placeholder: 'e.g. 9876543210'
    },

    {
      fieldname: 'status',
      label: 'Status',
      fieldtype: 'Select',
      options: ['Open', 'Closed'],
      required: true,
    },
    {
      fieldname: 'course',
      label: 'Course',
      fieldtype: 'Link',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Courses' },
      mapOptions: (data: any) => {
        return data.map((item: any) => {
          const val = item.name || item.value || (typeof item === 'string' ? item : '');
          const lbl = item.label || item.name || (typeof item === 'string' ? item : '');
          return { value: val, label: lbl };
        });
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
      fieldname: 'skills_required',
      label: 'Required Skills',
      fieldtype: 'Link',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Skill' },
      multiSelect: true,
      required: true,
      allowCustom: true
    },
    {
      fieldname: 'job_description',
      label: 'Job Description',
      fieldtype: 'Long Text',
      required: true,
    }
  ], [formValues.course, companyName]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dateStr;
  };

  const formatSalary = (from: any, to: any) => {
    if (!from && !to) return 'N/A';
    const formatVal = (val: any) => {
      const num = Number(val);
      if (num >= 100000) {
        return `${(num / 100000).toFixed(1)}L`;
      }
      return `${num}`;
    };
    return `₹${formatVal(from)}-${formatVal(to)} LPA`;
  };

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
            <Text style={styles.title}>Job Profiles</Text>
            <View style={styles.headerBadge}>
              <Briefcase size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>OPPORTUNITIES</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Manage active and draft job postings</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150)} style={{ marginBottom: 24 }}>
          <TouchableOpacity style={styles.postBtn} onPress={handlePostNew}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.postBtnText}>Post Job Profile</Text>
          </TouchableOpacity>
        </Animated.View>

        {loading && !refreshing ? (
          <View style={{ gap: 16 }}>
            {[1, 2, 3].map((key) => (
              <View key={key} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#E2E8F0' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <SkeletonLoader width={36} height={36} borderRadius={10} />
                    <View style={{ gap: 6 }}>
                      <SkeletonLoader width={150} height={14} />
                      <SkeletonLoader width={100} height={10} />
                    </View>
                  </View>
                  <SkeletonLoader width={60} height={18} borderRadius={6} />
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                  <SkeletonLoader width={80} height={12} />
                  <SkeletonLoader width={80} height={12} />
                  <SkeletonLoader width={80} height={12} />
                </View>
                <View style={styles.divider} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SkeletonLoader width={100} height={16} />
                  <SkeletonLoader width={80} height={32} borderRadius={8} />
                </View>
              </View>
            ))}
          </View>
        ) : jobs.length > 0 ? (
          <Animated.View entering={FadeInUp.delay(200)}>
            {jobs.map((job, idx) => {
              const accentColor = job.status === 'Open' ? '#0A8099' : '#94A3B8';
              return (
                <Animated.View key={job.name || idx} entering={FadeInUp.delay(250 + idx * 50)}>
                  <SwipeableRow
                    onEdit={() => handleEdit(job)}
                    disableSwipe={job.status !== 'Open'}
                  >
                    <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: accentColor, marginBottom: 0 }]}>
                      <View style={styles.cardHeader}>
                        <View style={styles.titleArea}>
                          <View style={styles.iconBox}>
                            <Briefcase size={18} color="#0A8099" />
                          </View>
                          <View style={styles.titleInfo}>
                            <Text style={styles.jobRole} numberOfLines={1}>{job.job_title}</Text>
                            <Text style={styles.jobSubtitle}>{job.employment_type} • {job.location || 'Pune'}</Text>
                          </View>
                        </View>
                        <View style={[styles.statusBadge, job.status === 'Open' ? styles.statusActive : styles.statusDisabled]}>
                          <Text style={[styles.statusText, job.status === 'Open' ? styles.statusTextActive : styles.statusTextDisabled]}>
                            {job.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                          <Banknote size={14} color="#16A34A" />
                          <Text style={styles.infoText}>{formatSalary(job.salary_from, job.salary_to)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Users size={14} color="#0A8099" />
                          <Text style={styles.infoText}>{job.openings} Openings</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Calendar size={14} color="#F59E0B" />
                          <Text style={styles.infoText}>Ends {formatDate(job.last_date)}</Text>
                        </View>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.footerRow}>
                        <View style={styles.appCountBox}>
                          <Text style={styles.appCountNum}>0</Text>
                          <Text style={styles.appCountLabel}>APPLICATIONS</Text>
                        </View>
                      </View>
                    </View>
                  </SwipeableRow>
                </Animated.View>
              );
            })}
          </Animated.View>
        ) : (
          <View style={styles.emptyContainer}>
            <Briefcase size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No job postings found.</Text>
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsModalVisible(false);
          setEditingJob(null);
        }}
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
                  <Text style={styles.modalTitle}>{editingJob ? "Edit Job Profile" : "Post Job Profile"}</Text>
                  <Text style={styles.modalSubtitle}>{editingJob ? "Update your recruitment requirements" : "Manage your talent acquisition pipeline"}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => { setIsModalVisible(false); setEditingJob(null); }} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <DynamicForm
                fields={jobFields}
                onSubmit={handleFormSubmit}
                onChange={handleFormChange}
                onCreateCustomValue={handleCreateCustomValue}
                loading={modalLoading}
                initialValues={formValues}
                buttonLabel={editingJob ? "Save Changes" : "Post Job Profile"}
                accentColor={colors.purple[600]}
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
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(10, 128, 153, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

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
  statusDisabled: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  statusText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  statusTextActive: { color: '#059669' },
  statusTextDisabled: { color: '#94A3B8' },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, fontWeight: '600', color: '#475569' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appCountBox: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  appCountNum: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  appCountLabel: { fontSize: 8, fontWeight: '800', color: '#CBD5E1', textTransform: 'uppercase' },

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
    backgroundColor: '#F97316',
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
