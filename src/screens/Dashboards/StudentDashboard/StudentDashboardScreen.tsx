import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/context/AuthContext';
import { RoleBannerWidget } from '@/components/dashboard/RoleBannerWidget';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LearningActivityGraph } from '@/components/dashboard/LearningActivityGraph';
import { AICoachCard } from '@/components/dashboard/AICoachCard';
import { SkillsCard } from '@/components/dashboard/SkillsCard';
import { AlertsAgendaCard } from '@/components/dashboard/AlertsAgendaCard';
import { TrendingUp, Award, Briefcase, Bot, X } from 'lucide-react-native';

import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { getStudentByEmail, updateStudent } from '@/api/student.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';

export const StudentDashboardScreen = () => {
  const { userName, userFullName, role } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [profileFormValues, setProfileFormValues] = useState<any>({});

  // Load cached student data on mount/username change
  useEffect(() => {
    const loadCache = async () => {
      if (!userName) return;
      try {
        const cached = await AsyncStorage.getItem(`studentDetails_${userName}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setStudentData(parsed);
          setLoadingDetails(false);
        }
      } catch (err) {
        console.log("Error loading mobile student cache:", err);
      }
    };
    loadCache();
  }, [userName]);

  const fetchStudentData = async () => {
    if (!userName) return;
    const hasData = !!studentData;
    if (!hasData) {
      setLoadingDetails(true);
    }
    try {
      const res = await getStudentByEmail(userName);
      const data = res?.data || res?.message?.data || res?.message;
      if (data && typeof data === 'object') {
        setStudentData(data);
        await AsyncStorage.setItem(`studentDetails_${userName}`, JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to fetch student details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [userName]);

  const stats = [
    { title: 'Score', value: '73/100', icon: TrendingUp, color: colors.accent.DEFAULT },
    { title: 'Goal', value: '58%', icon: Award, color: colors.primary.DEFAULT },
    { title: 'Active', value: '3', icon: Briefcase, color: colors.info || '#3b82f6' },
    { title: 'Sessions', value: '12', icon: Bot, color: colors.success || '#10b981' },
  ];

  const skills = [
    { name: 'Python', percentage: 78 },
    { name: 'SQL', percentage: 85 },
    { name: 'ML', percentage: 61 },
    { name: 'Viz', percentage: 55 },
  ];

  const alerts = [
    { type: 'warning' as const, message: 'Upcoming Deadline', detail: 'Razorpay • 3 days left' },
    { type: 'success' as const, message: 'Project Approved', detail: 'TCS • Interview: Feb 28' },
  ];

  const agenda = [
    { icon: 'education', text: 'ML Module Ch.2 — Today' },
    { icon: 'call', text: 'Mentor call — Feb 27 4PM' },
  ];

  // Initial Form values derived from fetched profile details
  const initialFormValues = useMemo(() => {
    if (!studentData) return {};
    return {
      first_name: studentData.first_name || "",
      last_name: studentData.last_name || "",
      email_id: studentData.email_id || userName || "",
      mobile_no: studentData.mobile_no || "",
      college: studentData.college || "",
      department: studentData.department || "",
      stream: studentData.stream || "",
      course: studentData.course || "",
      semester: studentData.semester || "",
      academic_year: studentData.academic_year || "",
      date_of_birth: studentData.date_of_birth || "",
      gender: studentData.gender || "",
      linkedin: studentData.linkedin || "",
      github: studentData.github || "",
      cgpa: studentData.cgpa ? String(studentData.cgpa) : "",
    };
  }, [studentData, userName]);


  // Submit profile updates to API
  const handleUpdateProfile = async (formData: any) => {
    if (!userName) return;
    setUpdateLoading(true);
    try {
      const payload = {
        ...studentData,
        first_name: formData.first_name || studentData?.first_name || "",
        last_name: formData.last_name || studentData?.last_name || "",
        email_id: formData.email_id || studentData?.email_id || userName || "",
        mobile_no: formData.mobile_no || studentData?.mobile_no || "",
        college: formData.college || studentData?.college || "",
        department: formData.department || studentData?.department || "",
        stream: formData.stream || studentData?.stream || "",
        course: formData.course || studentData?.course || "",
        semester: formData.semester || studentData?.semester || "",
        academic_year: formData.academic_year || studentData?.academic_year || "",
        date_of_birth: formData.date_of_birth || studentData?.date_of_birth || "",
        gender: formData.gender || studentData?.gender || "",
        linkedin: formData.linkedin || studentData?.linkedin || "",
        github: formData.github || studentData?.github || "",
        cgpa: formData.cgpa ? Number(formData.cgpa) : undefined,
      };

      await updateStudent(userName, payload);
      setIsEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
      fetchStudentData();
    } catch (err: any) {
      console.error("Failed to update student details:", err);
      Alert.alert("Error", err?.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const editFields: FormField[] = useMemo(() => [
    {
      fieldname: 'first_name',
      label: 'First Name',
      fieldtype: 'Data',
      required: true,
      disabled: true,
      layout: 'full',
    },
    {
      fieldname: 'last_name',
      label: 'Last Name',
      fieldtype: 'Data',
      required: true,
      disabled: true,
      layout: 'full',
    },
    {
      fieldname: 'email_id',
      label: 'Email ID',
      fieldtype: 'Data',
      required: true,
      disabled: true,
      layout: 'full',
    },
    {
      fieldname: 'mobile_no',
      label: 'Mobile No',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter Mobile Number',
      layout: 'full',
    },
    {
      fieldname: 'college',
      label: 'College',
      fieldtype: 'Data',
      required: true,
      disabled: true,
      layout: 'full',
    },
    {
      fieldname: 'department',
      label: 'Department',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter Department',
      layout: 'full',
    },
    {
      fieldname: 'stream',
      label: 'Stream',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter Stream',
      layout: 'full',
    },
    {
      fieldname: 'course',
      label: 'Course',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter Course',
      layout: 'full',
    },
    {
      fieldname: 'semester',
      label: 'Semester',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter Semester',
      layout: 'full',
    },
    {
      fieldname: 'academic_year',
      label: 'Academic Year',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter Academic Year',
      layout: 'full',
    },
    {
      fieldname: 'date_of_birth',
      label: 'Date of Birth',
      fieldtype: 'Date',
      required: true,
      placeholder: 'Select Date of Birth',
      layout: 'full',
    },
    {
      fieldname: 'gender',
      label: 'Gender',
      fieldtype: 'Select',
      required: true,
      disabled: true,
      options: ['Male', 'Female', 'Other'],
      layout: 'full',
    },
    {
      fieldname: 'linkedin',
      label: 'LinkedIn URL',
      fieldtype: 'Data',
      required: false,
      placeholder: 'Enter LinkedIn URL',
      layout: 'full',
    },
    {
      fieldname: 'github',
      label: 'GitHub URL',
      fieldtype: 'Data',
      required: false,
      placeholder: 'Enter GitHub URL',
      layout: 'full',
    },
    {
      fieldname: 'cgpa',
      label: 'CGPA',
      fieldtype: 'Float',
      required: true,
      placeholder: 'Enter CGPA',
      layout: 'full',
    },
  ], []);

  const bannerMetrics = useMemo(() => {
    if (!studentData) return undefined;
    return [
      { label: 'Employability', value: '73', iconName: 'Target' as const },
      { label: 'Current CGPA', value: studentData.cgpa || '0', iconName: 'Award' as const },
      { label: 'Semester', value: studentData.semester || 'N/A', iconName: 'Calendar' as const },
    ];
  }, [studentData]);

  const bannerTitle = useMemo(() => {
    if (studentData) {
      return `${studentData.first_name || ""} ${studentData.last_name || ""}`.trim();
    }
    return userFullName || "Student";
  }, [studentData, userFullName]);

  const bannerSubtitle = useMemo(() => {
    if (studentData) {
      return `${studentData.college || "College Not Specified"}\n${studentData.course || ""} • ${studentData.department || ""} • Stream ${studentData.stream || "N/A"}`;
    }
    return "";
  }, [studentData]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200)}>
          <RoleBannerWidget 
            fullName={bannerTitle} 
            date={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            role={role || 'Student'}
            progress={78}
            title={bannerTitle}
            subtitle={bannerSubtitle}
            metrics={bannerMetrics}
            onEditPress={() => {
              setProfileFormValues(initialFormValues);
              setIsEditModalVisible(true);
            }}
          />
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
        </View>

        <Animated.View entering={FadeInRight.delay(300)} style={styles.statsGrid}>
          {stats.map((stat, i) => (
             <View key={i} style={styles.statWrapper}>
                <StatsCard {...stat} />
             </View>
          ))}
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Strategic Learning</Text>
        </View>

        <Animated.View entering={FadeInUp.delay(400)}>
          <LearningActivityGraph data={{ lessons: 142, problems: 287, studyTime: 168 }} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)}>
          <AICoachCard 
            message="Your SQL velocity is impressive. 🚀 You've unlocked the next 'Strategic Learning' path."
            task="Optimize Ch.4 Joins + solving 3 advanced queries."
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)}>
          <SkillsCard skills={skills} />
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Communications</Text>
        </View>

        <Animated.View entering={FadeInUp.delay(700)}>
          <AlertsAgendaCard alerts={alerts} agenda={agenda} />
        </Animated.View>
        
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Edit Student Profile Modal */}
      <Modal animationType="slide" transparent={true} visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Settings</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
               <View style={{ padding: 20 }}>
                 <DynamicForm
                   fields={editFields}
                   onSubmit={handleUpdateProfile}
                   initialValues={profileFormValues}
                   loading={updateLoading}
                   buttonLabel="Save Changes"
                 />
               </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  userNameText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
    letterSpacing: -1,
  },
  todayText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
  },
  sectionHeader: {
    marginBottom: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    paddingVertical: 4,
  },
  statWrapper: {
    width: '25%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  footerSpacer: {
    height: 60,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20 },
  modalScroll: { paddingBottom: 60 },
});
