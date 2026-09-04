import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator, Linking, Dimensions, DeviceEventEmitter } from 'react-native';
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
import { AlertsAgendaCard } from '@/components/dashboard/AlertsAgendaCard';
import { useNavigation } from '@react-navigation/native';
import { TrendingUp, Award, Briefcase, Bot, X, MapPin, Clock, IndianRupee, Target, ShieldCheck, Factory, FileText, ChevronRight, AlertCircle } from 'lucide-react-native';

import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { getStudentByEmail, updateStudent, mapYearToWord, getSkillLedger, getDashboardStats, getStudentInternshipList, getLearningActivity, getTodaysOpportunityAlerts } from '@/api/student.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';
import ProfileImageUploader from '@/components/profile/ProfileImageUploader';

const { width } = Dimensions.get('window');

export const StudentDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { userName, userFullName, userImage, role } = useAuth();
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

  const [ledgerSummary, setLedgerSummary] = useState<any>({});

  useEffect(() => {
    fetchStudentData();
  }, [userName]);

  useEffect(() => {
    if (!userName) return;
    const fetchSkills = async () => {
      try {
        const res = await getSkillLedger(userName);
        console.log("Mobile student skills response:", res);
        if (res?.message) {
          setLedgerSummary(res.message.summary || {});
        }
      } catch (err) {
        console.error("Error loading mobile skills summary:", err);
      }
    };
    fetchSkills();
  }, [userName]);

  const [statsData, setStatsData] = useState<any>(null);
  const [isIncompletePopupVisible, setIsIncompletePopupVisible] = useState(false);

  const fetchStats = async () => {
    if (!userName) return;
    try {
      const res = await getDashboardStats(userName);
      console.log("Mobile student stats response:", res);
      const data = res?.data || res?.message || res;
      if (data) {
        setStatsData(data);
        if (Number(data.profile_completeness) < 60) {
          setIsIncompletePopupVisible(true);
        } else {
          setIsIncompletePopupVisible(false);
        }
      }
    } catch (err) {
      console.error("Error loading mobile dashboard stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userName]);

  const [learningActivityData, setLearningActivityData] = useState<any>(null);

  useEffect(() => {
    if (!userName) return;
    const fetchLearningActivity = async () => {
      try {
        const res = await getLearningActivity(userName);
        console.log("Mobile student learning activity response:", res);
        const data = res?.data || res?.message || res;
        if (data) {
          setLearningActivityData(data);
        }
      } catch (err) {
        console.error("Error loading mobile learning activity:", err);
      }
    };
    fetchLearningActivity();
  }, [userName]);

  const [opportunityAlerts, setOpportunityAlerts] = useState<any>({ newPostings: [], deadlineAlerts: [] });

  useEffect(() => {
    if (!userName) return;
    const fetchAlerts = async () => {
      try {
        const res = await getTodaysOpportunityAlerts(userName);
        console.log("Mobile opportunity alerts response:", res);
        const data = res?.data || res?.message;
        
        if (data) {
          setOpportunityAlerts({
            newPostings: data.new_postings || [],
            deadlineAlerts: data.deadline_alerts || []
          });
        }
      } catch (err) {
        console.error("Error loading mobile opportunity alerts:", err);
      }
    };
    fetchAlerts();
  }, [userName]);

  const [internshipsData, setInternshipsData] = useState<any[]>([]);
  const [internshipsLoading, setInternshipsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userName || !studentData) return;
    const fetchInternships = async () => {
      try {
        setInternshipsLoading(true);
        const res = await getStudentInternshipList(
          userName,
          studentData.course || null,
          studentData.department || null,
          studentData.current_year || studentData.academic_year || null
        );
        const dataContainer = (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) ? res : (res?.message && typeof res.message === 'object' ? res.message : res);
        const internshipData = dataContainer?.data?.internships || dataContainer?.internships || [];
        
        // Match mapping function
        const mapped = internshipData.slice(0, 3).map((item: any, index: number) => {
          const matches = [91, 84, 76];
          const match = matches[index % matches.length];
          
          let ringColor = "border-emerald-500";
          let matchColor = "#10B981";
          let bgColor = "#ECFDF5";
          
          if (match < 80) {
            ringColor = "border-orange-500";
            matchColor = "#F97316";
            bgColor = "#FFF7ED";
          } else if (match < 90) {
            ringColor = "border-sky-500";
            matchColor = "#0EA5E9";
            bgColor = "#F0F9FF";
          }

          let stipendStr = "Unpaid";
          if (item.stipend) {
            const amount = Number(item.stipend);
            if (amount >= 1000) {
              stipendStr = `₹${(amount / 1000).toFixed(0)}k/mo`;
            } else {
              stipendStr = `₹${amount}/mo`;
            }
          }

          let durationStr = "N/A";
          if (item.duration) {
            const days = Number(item.duration);
            if (days >= 30) {
              durationStr = `${Math.round(days / 30)} mo`;
            } else {
              durationStr = `${days} days`;
            }
          }

          return {
            role: item.title || "Internship Role",
            company: item.industry || "Company Name",
            match,
            location: item.location || "Remote",
            duration: durationStr,
            stipend: stipendStr,
            matchColor,
            ringColor,
            bgColor
          };
        });

        setInternshipsData(mapped);
      } catch (error) {
        console.error("Error fetching matching internships on mobile dashboard:", error);
      } finally {
        setInternshipsLoading(false);
      }
    };
    fetchInternships();
  }, [userName, studentData]);

  const stats = useMemo(() => {
    const score = statsData?.employability_score !== undefined ? `${statsData.employability_score}/100` : '73/100';
    const completeness = statsData?.profile_completeness !== undefined ? `${statsData.profile_completeness}%` : '78%';
    const skillsCount = statsData?.total_skills !== undefined ? String(statsData.total_skills) : '3';
    const cgpaVal = statsData?.cgpa !== undefined ? String(statsData.cgpa) : '0';

    return [
      { title: 'Score', value: score, icon: TrendingUp, color: colors.accent.DEFAULT },
      { title: 'Goal', value: completeness, icon: Award, color: colors.primary.DEFAULT },
      { title: 'Skills', value: skillsCount, icon: Briefcase, color: colors.info || '#3b82f6' },
      { title: 'CGPA', value: cgpaVal, icon: Bot, color: colors.success || '#10b981' },
    ];
  }, [statsData]);

  const fallbackSummary = {
    total_skills: 4,
    ai_verified: 2,
    mentor_endorsed: 1,
    industry_endorsed: 1,
    evidence_items: 6
  };
  const summary = Object.keys(ledgerSummary).length > 0 ? ledgerSummary : fallbackSummary;

  const ledgerStats = useMemo(() => [
    { label: 'Total Skills', value: String(summary.total_skills || 0), icon: Target, color: '#EF4444', bg: '#FEF2F2' },
    { label: 'AI Verified', value: String(summary.ai_verified || 0), icon: ShieldCheck, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Mentor Endorsed', value: String(summary.mentor_endorsed || 0), icon: Award, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Industry Endorsed', value: String(summary.industry_endorsed || 0), icon: Factory, color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Evidence Items', value: String(summary.evidence_items || 0), icon: FileText, color: '#64748B', bg: '#F8FAFC' },
  ], [summary]);

  const alerts = opportunityAlerts;



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
      current_year: mapYearToWord(studentData.current_year || studentData.academic_year) || "",
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
        current_year: mapYearToWord(formData.current_year) || mapYearToWord(studentData?.current_year || studentData?.academic_year) || "",
        academic_year: mapYearToWord(formData.current_year) || mapYearToWord(studentData?.current_year || studentData?.academic_year) || "",
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
      await fetchStats();
      DeviceEventEmitter.emit('PROFILE_UPDATED');
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
      fieldname: 'current_year',
      label: 'Current Year',
      fieldtype: 'Select',
      required: true,
      placeholder: 'Select Current Year',
      options: ['First Year', 'Second Year', 'Third Year', 'Final Year'],
      layout: 'full',
    },
    {
      fieldname: 'date_of_birth',
      label: 'Date of Birth',
      fieldtype: 'Date',
      required: true,
      placeholder: 'Select Date of Birth',
      layout: 'full',
      textTransform: 'uppercase',
      testTransform: 'uppercase',
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
    const score = studentData.employability_score !== undefined && studentData.employability_score !== null
      ? String(studentData.employability_score)
      : '73';
    return [
      { label: 'Employability', value: score, iconName: 'Target' as const },
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
            imageUrl={userImage}
            progress={statsData?.profile_completeness !== undefined && statsData?.profile_completeness !== null ? Number(statsData.profile_completeness) : 78}
            title={bannerTitle}
            subtitle={bannerSubtitle}
            metrics={bannerMetrics}
            onEditPress={() => {
              setProfileFormValues(initialFormValues);
              setIsEditModalVisible(true);
            }}
            onCreateResumePress={() => {
              navigation.navigate('Resume');
            }}
            onPreviewResumePress={() => {
              navigation.navigate('ResumePreview');
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
          <LearningActivityGraph data={learningActivityData} />
        </Animated.View>



        <Animated.View entering={FadeInUp.delay(600)} style={styles.premiumCard}>
          <TouchableOpacity 
            style={styles.cardHeader} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Skill Ledger')}
          >
            <View style={styles.cardHeaderTitle}>
              <Text style={styles.sectionTitle}>Ledger Summary</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accent.DEFAULT }}>Full Ledger</Text>
              <ChevronRight size={16} color={colors.accent.DEFAULT} style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>

          <View style={[styles.statsList, { gap: 8 }]}>
            {ledgerStats.map((stat, i) => (
              <View key={i} style={[styles.statItem, { backgroundColor: stat.bg, padding: 8, borderRadius: 12 }]}>
                <View style={[styles.statIcon, { backgroundColor: 'transparent', width: 32, height: 32 }]}>
                  <stat.icon size={20} color={stat.color} />
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#334155' }}>{stat.label}</Text>
                  <Text style={[styles.statValue, { fontSize: 16 }]}>{stat.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alerts</Text>
        </View>

        <Animated.View entering={FadeInUp.delay(700)}>
          <AlertsAgendaCard alerts={alerts} />
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Matched Internships</Text>
        </View>

        <Animated.View entering={FadeInUp.delay(800)}>
          {internshipsLoading ? (
            <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 20 }} />
          ) : internshipsData.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No matched internships found.</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {internshipsData.map((internship: any, index: number) => (
                <View key={index} style={styles.internshipCard}>
                  <View style={styles.internshipHeader}>
                    <View style={styles.companyLogo}>
                      <Briefcase size={20} color="#64748B" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.internshipRole} numberOfLines={1}>{internship.role}</Text>
                      <Text style={styles.internshipCompany} numberOfLines={1}>{internship.company}</Text>
                    </View>
                    <View style={[styles.matchBadge, { borderColor: internship.matchColor }]}>
                      <Text style={[styles.matchText, { color: internship.matchColor }]}>{internship.match}%</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <MapPin size={12} color="#EF4444" />
                      <Text style={styles.metaText}>{internship.location}</Text>
                    </View>
                    <View style={styles.metaBadge}>
                      <Clock size={12} color="#64748B" />
                      <Text style={styles.metaText}>{internship.duration}</Text>
                    </View>
                    <View style={[styles.metaBadge, styles.stipendBadge]}>
                      <IndianRupee size={10} color="#15803D" />
                      <Text style={[styles.metaText, styles.stipendText]}>{internship.stipend}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Coach</Text>
        </View>

        <Animated.View entering={FadeInUp.delay(900)}>
          <AICoachCard 
            message="Your SQL velocity is impressive. 🚀 You've unlocked the next 'Strategic Learning' path."
            task="Optimize Ch.4 Joins + solving 3 advanced queries."
          />
        </Animated.View>
        
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Edit Student Profile Modal */}
      <Modal animationType="slide" transparent={true} visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Settings</Text>
              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => {
                  setIsEditModalVisible(false);
                  if (Number(statsData?.profile_completeness) < 60) {
                    setIsIncompletePopupVisible(true);
                  }
                }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
               <View style={{ padding: 20 }}>
                 <ProfileImageUploader
                   currentImageUrl={userImage}
                   initials={profileFormValues.full_name?.charAt(0) || userFullName?.charAt(0) || "U"}
                   size="lg"
                 />
                 <DynamicForm
                   fields={editFields}
                   onSubmit={async (values) => {
                     await handleUpdateProfile(values);
                     await fetchStats();
                   }}
                   initialValues={profileFormValues}
                   loading={updateLoading}
                   buttonLabel="Save Changes"
                 />
               </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {isIncompletePopupVisible && (
        <View style={[StyleSheet.absoluteFill, styles.incompleteOverlay]}>
          <View style={styles.incompleteModal}>
            <View style={styles.incompleteIconContainer}>
              <AlertCircle size={32} color="#EF4444" />
            </View>
            <Text style={styles.incompleteTitle}>Profile Incomplete</Text>
            <Text style={styles.incompleteText}>
              Your profile completeness is {statsData?.profile_completeness || 0}%. Please update your profile to at least 60% to access all platform features.
            </Text>
            <TouchableOpacity 
              style={styles.incompleteBtn}
              onPress={() => {
                setIsIncompletePopupVisible(false);
                setProfileFormValues(initialFormValues);
                setIsEditModalVisible(true);
              }}
            >
              <Text style={styles.incompleteBtnText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    paddingBottom: 110,
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  internshipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  internshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  internshipRole: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  internshipCompany: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  matchBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  stipendBadge: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  stipendText: {
    color: '#15803D',
    fontWeight: '700',
  },
  premiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsList: {
    gap: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  incompleteOverlay: { zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  incompleteModal: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  incompleteIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  incompleteTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  incompleteText: { fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  incompleteBtn: { backgroundColor: '#FF6B00', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center' },
  incompleteBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' }
});
