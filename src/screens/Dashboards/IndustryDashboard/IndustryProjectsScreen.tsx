import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import {
  Plus,
  Briefcase,
  Trophy,
  Users,
  Microscope,
  ArrowRight,
  RefreshCcw,
  Trash2,
  X
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useIndustry } from '@/context/IndustryContext';
import {
  getProjectList,
  createProject,
  updateProject,
  deleteProject,
  getProjectApplicationCount,
  createSkill,
  createCourse,
  createDepartment
} from '@/api/industry.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';



export const IndustryProjectsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { industryData } = useIndustry();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    applications: 0,
    awarded: 0,
    ppo: 0
  });

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const [editingProject, setEditingProject] = useState<any>(null);

  const companyName = industryData?.company_name || industryData?.name;

  const fetchProjectData = useCallback(async () => {
    if (!companyName) return;

    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        getProjectList(companyName),
        getProjectApplicationCount(companyName)
      ]);

      const dataObj = listRes?.data || (listRes?.message && typeof listRes.message === 'object' ? listRes.message : null) || listRes || {};
      let projectList = [];
      if (Array.isArray(dataObj)) {
        projectList = dataObj;
      } else if (dataObj && typeof dataObj === 'object') {
        const rawData = dataObj.projects || dataObj.data;
        if (Array.isArray(rawData)) {
          projectList = rawData;
        } else if (dataObj.message && typeof dataObj.message === 'object') {
          const nestedData = dataObj.message.projects || dataObj.message.data;
          if (Array.isArray(nestedData)) {
            projectList = nestedData;
          }
        }
      }

      setProjects(projectList);

      setStats({
        active: projectList.filter((p: any) => p.status === 'Active').length,
        applications: countRes?.data?.total_applications || countRes?.message?.total_applications || 0,
        awarded: projectList.reduce((acc: number, p: any) => acc + (p.shortlisted_count || 0), 0),
        ppo: 0
      });
    } catch (err) {
      console.error("Error fetching project data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyName]);

  useEffect(() => {
    fetchProjectData();

    // Refresh data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProjectData();
    });

    return unsubscribe;
  }, [navigation, fetchProjectData]);

  useEffect(() => {
    if (route.params?.openForm) {
      handlePostNew();
      navigation.setParams({ openForm: undefined });
    }
  }, [route.params?.openForm, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjectData();
  };

  const handlePostNew = () => {
    setEditingProject(null);
    setFormValues({ status: 'Active' });
    setIsModalVisible(true);
  };

  const handleEdit = (project: any) => {
    const vals = {
      ...project,
      required_skills: Array.isArray(project.required_skills)
        ? project.required_skills.map((s: any) => s.skill)
        : Array.isArray(project.skills)
          ? project.skills.map((s: any) => s.skill)
          : []
    };
    setEditingProject(project);
    setFormValues(vals);
    setIsModalVisible(true);
  };

  const handleDelete = async (projectName: string) => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProject(projectName);
              fetchProjectData();
              Alert.alert("Success", "Project deleted successfully");
            } catch (err) {
              console.error("Error deleting project:", err);
              Alert.alert("Error", "Failed to delete project");
            }
          }
        }
      ]
    );
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setModalLoading(true);
      const payload = {
        ...formData,
        industry: companyName,
        duration: String(formData.duration),
        // Convert comma-separated skills back to objects if needed, 
        // but here we just pass the values as the backend expect
        required_skills: Array.isArray(formData.required_skills)
          ? formData.required_skills.map((s: string) => ({ skill: s }))
          : []
      };

      if (editingProject) {
        await updateProject(editingProject.name, { ...payload, name: editingProject.name });
        Alert.alert("Success", "Project updated successfully");
      } else {
        await createProject(payload);
        Alert.alert("Success", "Project created successfully");
      }
      setIsModalVisible(false);
      fetchProjectData();
    } catch (err: any) {
      console.error("Error saving project:", err);
      let msg = "Failed to save project";
      if (err?.message === "Network Error") {
        msg = "Network connection issue. Please check your internet or try again.";
      } else if (err?.message) {
        msg = err.message;
      }
      Alert.alert("Error", msg);
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

  const handleFormChange = (newData: any) => {
    // If startDate or duration changes, calculate endDate
    if (newData.start_date && newData.duration) {
      const start = new Date(newData.start_date);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(end.getDate() + parseInt(newData.duration, 10));
        const endStr = end.toISOString().split('T')[0];
        if (newData.end_date !== endStr) {
          setFormValues({ ...newData, end_date: endStr });
          return;
        }
      }
    }
    setFormValues(newData);
  };

  const projectFields: FormField[] = useMemo(() => [
    {
      fieldname: 'project_name',
      label: 'Project Name',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. AI-Powered Fraud Detection',
      disabled: !!editingProject
    },
    {
      fieldname: 'project_code',
      label: 'Project Code',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. PRJ-2401',
    },
    {
      fieldname: 'status',
      label: 'Status',
      fieldtype: 'Select',
      options: ['Active', 'Completed', 'Disable'],
      required: true,
    },
    {
      fieldname: 'duration',
      label: 'Duration (Days)',
      fieldtype: 'Int',
      required: true,
      placeholder: 'e.g. 30',
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
      required: true,
      disabled: true
    },
    {
      fieldname: 'application_deadline',
      label: 'Application Deadline',
      fieldtype: 'Date',
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
      fieldname: 'academic_year',
      label: 'Academic Year',
      fieldtype: 'Select',
      options: ['2', '3', '4'],
      multiSelect: true,
      required: true
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
      placeholder: 'Project details and objectives...'
    }
  ], [editingProject, formValues.course]);

  const initialValues = useMemo(() => formValues, [formValues]);

  const statsCards = [
    { label: "ACTIVE PROJECTS", value: String(stats.active), icon: Microscope, color: "#9333EA" },
    { label: "TOTAL APPLICATIONS", value: String(stats.applications), icon: Users, color: "#3B82F6" },
    { label: "STUDENTS AWARDED", value: "0", icon: Trophy, color: "#10B981" },
    { label: "CONVERTED TO PPO", value: "0", icon: Briefcase, color: "#F97316" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Live Projects</Text>
            <View style={styles.headerBadge}>
              <Briefcase size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>R&D OPPORTUNITIES</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Post real projects for students to participate in</Text>
        </Animated.View>

        {/* Post Button */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <TouchableOpacity style={styles.postBtn} onPress={handlePostNew}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.postBtnText}>Post New Project</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.statsRow}>
          {statsCards.map((stat, i) => (
            <StatsCard key={i} title={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
          ))}
        </Animated.View>

        {/* Projects List */}
        <Animated.View entering={FadeInUp.delay(300)}>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={colors.purple[600]} style={{ marginTop: 40 }} />
          ) : projects.length > 0 ? (
            projects.map((project, index) => (
              <Animated.View key={project.name} entering={FadeInUp.delay(350 + index * 50)} style={styles.projectCard}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Project Pipeline', { project })}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.iconBox}>
                      <Microscope size={18} color="#64748B" />
                    </View>
                    <View style={styles.titleInfo}>
                      <Text style={styles.projectTitle} numberOfLines={1}>{project.project_name}</Text>
                      <Text style={styles.projectSubtitle}>{project.industry} • {project.project_code}</Text>
                    </View>
                    <View style={[styles.badge, project.status?.toLowerCase() === "active" ? styles.badgeOpen : {}]}>
                      <Text style={[styles.badgeText, project.status?.toLowerCase() === "active" ? styles.badgeTextOpen : {}]}>{project.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.description} numberOfLines={2}>{project.description}</Text>

                  <View style={styles.tagsContainer}>
                    {(project.required_skills || project.skills || []).slice(0, 3).map((skill: any, sIdx: number) => (
                      <View key={sIdx} style={styles.tagPill}>
                        <Text style={styles.tagText}>{skill.skill || skill.skills}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.footerRow}>
                    <View style={styles.metricsGrid}>
                      <View style={styles.metricItem}>
                        <Text style={[styles.metricValue, { color: '#F97316' }]}>{project.applied_count || 0}</Text>
                        <Text style={styles.metricLabel}>Applied</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={[styles.metricValue, { color: '#3B82F6' }]}>{project.shortlisted_count || 0}</Text>
                        <Text style={styles.metricLabel}>Shortlisted</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={[styles.metricValue, { color: '#10B981' }]}>{project.duration || '-'}</Text>
                        <Text style={styles.metricLabel}>Days</Text>
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          styles.deleteBtn,
                          (project.status?.toLowerCase() === 'disabled' || project.status?.toLowerCase() === 'disable' || project.status?.toLowerCase() === 'inactive') && styles.disabledBtn
                        ]}
                        onPress={() => handleDelete(project.name)}
                        disabled={project.status?.toLowerCase() === 'disabled' || project.status?.toLowerCase() === 'disable' || project.status?.toLowerCase() === 'inactive'}
                      >
                        <Trash2 size={14} color={(project.status?.toLowerCase() === 'disabled' || project.status?.toLowerCase() === 'disable' || project.status?.toLowerCase() === 'inactive') ? '#CBD5E1' : colors.error} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.manageBtn,
                          (project.status?.toLowerCase() === 'disabled' || project.status?.toLowerCase() === 'disable' || project.status?.toLowerCase() === 'inactive') && styles.disabledManageBtn
                        ]}
                        onPress={() => handleEdit(project)}
                        disabled={project.status?.toLowerCase() === 'disabled' || project.status?.toLowerCase() === 'disable' || project.status?.toLowerCase() === 'inactive'}
                      >
                        <Text style={styles.manageBtnText}>Manage</Text>
                        <ArrowRight size={12} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Briefcase size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No live projects found.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
                <RefreshCcw size={16} color="#FFF" />
                <Text style={styles.retryBtnText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Form Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingProject ? 'Edit Project' : 'Post New Project'}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
              <DynamicForm
                fields={projectFields}
                initialValues={initialValues}
                onSubmit={handleFormSubmit}
                onChange={handleFormChange}
                onCreateCustomValue={handleCreateCustomValue}
                loading={modalLoading}
                buttonLabel={editingProject ? "Update Project" : "Create Project"}
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
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  postBtn: { marginBottom: 24, backgroundColor: colors.purple[600], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, shadowColor: colors.purple[600], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  postBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24, flexWrap: 'wrap' },

  projectCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  titleInfo: { flex: 1, marginLeft: 10 },
  projectTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  projectSubtitle: { fontSize: 9, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase' },
  badge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  badgeOpen: { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' },
  badgeTextOpen: { color: '#059669' },

  description: { fontSize: 12, color: '#64748B', fontWeight: '500', lineHeight: 18, marginBottom: 10 },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagPill: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#E0E7FF' },
  tagText: { color: '#6366F1', fontSize: 9, fontWeight: '800' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricsGrid: { flexDirection: 'row', gap: 12 },
  metricItem: { alignItems: 'center' },
  metricValue: { fontSize: 14, fontWeight: '900', color: '#1E293B' },
  metricLabel: { fontSize: 8, fontWeight: '800', color: '#CBD5E1', textTransform: 'uppercase' },

  actionRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  deleteBtn: { backgroundColor: '#FEF2F2' },
  disabledBtn: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  manageBtn: { backgroundColor: colors.purple[600], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 36, paddingHorizontal: 12, borderRadius: 10 },
  disabledManageBtn: { backgroundColor: '#CBD5E1' },
  manageBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, opacity: 0.6 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '600' },
  retryBtn: { marginTop: 20, backgroundColor: colors.purple[600], flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryBtnText: { color: '#FFF', fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },

  footerSpacer: { height: 40 }
});
