import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  UserCircle, 
  MapPin, 
  Briefcase, 
  Edit2,
  CheckCircle2,
  Shield,
  Eye,
  X,
  Star,
  Globe,
  Phone,
  CreditCard,
  Award,
  FileText
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { getMentorByEmail, updateMentor } from '@/api/mentor.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';

export const MentorProfileScreen = () => {
  const { userName } = useAuth();

  // State variables
  const [mentorData, setMentorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profileFormValues, setProfileFormValues] = useState<any>({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Fetch mentor profile from API
  const fetchProfile = useCallback(async (isRefresh = false) => {
    if (!userName) return;
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const res = await getMentorByEmail(userName);
      const data = res?.message?.data || res?.message || null;
      setMentorData(data);
    } catch (err: any) {
      console.error("Error fetching mentor profile:", err);
      setError(err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile(true);
  }, [fetchProfile]);

  // Derived display values
  const getInitials = (firstName: string, lastName: string) => {
    return `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}` || "M";
  };

  const initials = getInitials(mentorData?.first_name, mentorData?.last_name);
  const fullName = mentorData ? `${mentorData.first_name || ""} ${mentorData.last_name || ""}`.trim() : "—";
  const domains = (mentorData?.domains || []).map((d: any) => d.domain || d).filter(Boolean);
  const skills = (mentorData?.mentor_skills || mentorData?.skills || []).map((s: any) => s.skill || s).filter(Boolean);
  const platformUrls = mentorData?.mentor_platform_urls || [];

  // Initial Form values derived from fetched profile details
  const initialFormValues = useMemo(() => {
    if (!mentorData) return {};
    return {
      first_name: mentorData.first_name || "",
      last_name: mentorData.last_name || "",
      role: mentorData.role || "",
      experience: mentorData.experience || "",
      type: mentorData.type || "",
      travelling_possible: mentorData.travelling_possible || "Yes",
      state: mentorData.state || "",
      district: mentorData.district || "",
      tahsil: mentorData.tahsil || "",
      city: mentorData.city || "",
      mobile_no: mentorData.mobile_no || "",
      profile_description: mentorData.profile_description || "",
      bank_name: mentorData.bank_name || "",
      account_number: mentorData.account_number || "",
      ifsc_code: mentorData.ifsc_code || "",
    };
  }, [mentorData]);

  // Handle DynamicForm dropdown state changes
  const handleFormChange = (newData: any) => {
    setProfileFormValues((prev: any) => {
      const updated = { ...prev, ...newData };
      // Reset nested location fields if their parent fields change
      if (prev.state !== updated.state) {
        updated.district = '';
        updated.tahsil = '';
        updated.city = '';
      } else if (prev.district !== updated.district) {
        updated.tahsil = '';
        updated.city = '';
      } else if (prev.tahsil !== updated.tahsil) {
        updated.city = '';
      }
      return updated;
    });
  };

  // Submit profile updates to API
  const handleUpdateProfile = async (formData: any) => {
    if (!userName) return;
    setUpdateLoading(true);
    try {
      const domainArray = (mentorData?.domains || []).map((d: any) => ({ domain: d.domain || d }));
      const skillsArray = (mentorData?.mentor_skills || mentorData?.skills || []).map((s: any) => ({ skill: s.skill || s }));
      const platformUrlsPayload = (mentorData?.mentor_platform_urls || []).map((p: any) => ({ platform: p.platform, url: p.url }));

      const payload = {
        name: userName,
        email_id: userName,
        first_name: formData.first_name || mentorData?.first_name || "",
        last_name: formData.last_name || mentorData?.last_name || "",
        mobile_no: formData.mobile_no || mentorData?.mobile_no || null,
        type: formData.type || null,
        travelling_possible: formData.travelling_possible || "Yes",
        country: mentorData?.country || "India",
        state: formData.state || null,
        district: formData.district || null,
        tahsil: formData.tahsil || null,
        city: formData.city || null,
        profile_description: formData.profile_description?.trim() || null,
        role: formData.role || mentorData?.role || null,
        experience: formData.experience || mentorData?.experience || null,
        bank_name: formData.bank_name?.trim() || null,
        account_number: formData.account_number?.trim() || null,
        ifsc_code: formData.ifsc_code?.trim() || null,
        doctype: "Mentor",
        domain: domainArray,
        mentor_skills: skillsArray,
        mentor_platform_urls: platformUrlsPayload,
      };

      await updateMentor(userName, payload);
      setIsEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
      fetchProfile(true);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      Alert.alert("Error", err?.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Edit fields schema definition
  const editFields: FormField[] = useMemo(() => [
    {
      fieldname: 'first_name',
      label: 'First Name',
      fieldtype: 'Data',
      required: true,
      layout: 'half',
      placeholder: 'e.g. Kavya'
    },
    {
      fieldname: 'last_name',
      label: 'Last Name',
      fieldtype: 'Data',
      required: true,
      layout: 'half',
      placeholder: 'e.g. Reddy'
    },
    {
      fieldname: 'role',
      label: 'Current Role',
      fieldtype: 'Data',
      required: false,
      placeholder: 'e.g. Senior Software Engineer'
    },
    {
      fieldname: 'experience',
      label: 'Experience (Years)',
      fieldtype: 'Int',
      required: false,
      placeholder: 'e.g. 5'
    },
    {
      fieldname: 'type',
      label: 'Mentor Type',
      fieldtype: 'Select',
      required: false,
      placeholder: 'Select Type',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: "Type" },
    },
    {
      fieldname: 'travelling_possible',
      label: 'Willing to Travel',
      fieldtype: 'Select',
      required: false,
      options: ['Yes', 'No', 'Maybe'],
      placeholder: 'Select'
    },
    {
      fieldname: 'state',
      label: 'State',
      fieldtype: 'Select',
      required: false,
      placeholder: 'Select State',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: "State" },
    },
    {
      fieldname: 'district',
      label: 'District',
      fieldtype: 'Select',
      required: false,
      placeholder: 'Select District',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: profileFormValues?.state
        ? { doctype: "District", fields: ["name", "district_name"], filters: [["state", "=", profileFormValues.state]], order_by: "district_name asc", limit_page_length: 1000 }
        : undefined,
      disabled: !profileFormValues?.state,
    },
    {
      fieldname: 'tahsil',
      label: 'Taluka',
      fieldtype: 'Select',
      required: false,
      placeholder: 'Select Taluka',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: profileFormValues?.district
        ? { doctype: "Tahsil", fields: ["name", "tahsil_name"], filters: [["district", "=", profileFormValues.district]], order_by: "tahsil_name asc", limit_page_length: 1000 }
        : undefined,
      disabled: !profileFormValues?.district,
    },
    {
      fieldname: 'city',
      label: 'City',
      fieldtype: 'Select',
      required: false,
      placeholder: 'Select City',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: profileFormValues?.tahsil
        ? { doctype: "City", fields: ["name", "city_name"], filters: [["tahsil", "=", profileFormValues.tahsil]], order_by: "city_name asc", limit_page_length: 1000 }
        : undefined,
      disabled: !profileFormValues?.tahsil,
    },
    {
      fieldname: 'mobile_no',
      label: 'Mobile Number',
      fieldtype: 'Phone',
      required: false,
      placeholder: 'e.g. +91-9876543210'
    },
    {
      fieldname: 'profile_description',
      label: 'Bio / Profile Description',
      fieldtype: 'Long Text',
      required: false,
      placeholder: 'Describe your expertise and mentoring approach...'
    },
    {
      fieldname: 'bank_name',
      label: 'Bank Name',
      fieldtype: 'Data',
      required: false,
      placeholder: 'e.g. HDFC Bank'
    },
    {
      fieldname: 'account_number',
      label: 'Account Number',
      fieldtype: 'Data',
      required: false,
      placeholder: 'e.g. 123456789012'
    },
    {
      fieldname: 'ifsc_code',
      label: 'IFSC Code',
      fieldtype: 'Data',
      required: false,
      placeholder: 'e.g. HDFC0001234'
    },
  ], [profileFormValues?.state, profileFormValues?.district, profileFormValues?.tahsil]);

  // Loading Screen
  if (loading && !mentorData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4c1d95" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Error Screen
  if (error && !mentorData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProfile(false)}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
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
            <View style={styles.headerTitleGroup}>
               <Text style={styles.title}>My Profile</Text>
               <View style={styles.headerBadge}>
                 <UserCircle size={10} color="#4c1d95" />
                 <Text style={styles.headerBadgeText}>PUBLIC PROFILE</Text>
               </View>
            </View>
            <TouchableOpacity 
              style={styles.editBtnBox} 
              onPress={() => {
                setProfileFormValues(initialFormValues);
                setIsEditModalVisible(true);
              }}
            >
              <Edit2 size={16} color="#4c1d95" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Manage your public appearance and verifications</Text>
        </Animated.View>

        {/* Profile Card Summary */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.summaryCard}>
          <View style={styles.rowWrapper}>
            <View style={styles.avatarMain}>
              <Text style={styles.avatarMainTxt}>{initials}</Text>
              <View style={styles.verifyPip}>
                <Text style={{fontSize: 8}}>✨</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
               <View style={styles.nameRow}>
                 <Text style={styles.nameTxt}>{fullName}</Text>
                 <View style={styles.proTag}>
                   <Shield size={10} color="#2563EB" />
                   <Text style={styles.proTagTxt}>{mentorData?.approved_status || 'Mentor'}</Text>
                 </View>
               </View>
               <Text style={styles.roleSubTxt}>
                 {mentorData?.role || 'No role set'}
                 {mentorData?.experience ? ` • ${mentorData.experience} years exp` : ''}
                 {mentorData?.type ? ` • ${mentorData.type}` : ''}
               </Text>
               {domains.length > 0 && (
                 <View style={styles.tagsRow}>
                   {domains.map((d: string, idx: number) => (
                     <Text key={idx} style={[styles.tagLbl, { backgroundColor: '#FFF7ED', color: '#C2410C', borderColor: '#FFEDD5' }]}>{d}</Text>
                   ))}
                 </View>
               )}
            </View>
          </View>
        </Animated.View>

        {/* Profile Details Card */}
        <Animated.View entering={FadeInUp.delay(120)} style={styles.detailsCard}>
          <View style={styles.detailsGrid}>
            {[
              { label: "Email", value: userName, icon: Globe },
              { label: "Mobile", value: mentorData?.mobile_no, icon: Phone },
              { label: "Current Role", value: mentorData?.role, icon: Briefcase },
              { label: "Experience", value: mentorData?.experience ? `${mentorData.experience} Years` : null, icon: Award },
              { label: "Location", value: [mentorData?.city, mentorData?.tahsil, mentorData?.district, mentorData?.state, mentorData?.country || 'India'].filter(Boolean).join(", "), icon: MapPin },
              { label: "Travelling", value: mentorData?.travelling_possible, icon: MapPin },
              { label: "Bank", value: mentorData?.bank_name, icon: CreditCard },
              { label: "IFSC", value: mentorData?.ifsc_code, icon: CreditCard },
            ].map(({ label, value, icon: Icon }) =>
              value ? (
                <View key={label} style={styles.detailItem}>
                  <Icon size={14} color="#64748B" style={styles.detailIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>{label}</Text>
                    <Text style={styles.detailValue}>{value}</Text>
                  </View>
                </View>
              ) : null
            )}
          </View>

          {/* Bio */}
          {mentorData?.profile_description ? (
            <View style={styles.bioContainer}>
              <Text style={styles.detailLabel}>BIO</Text>
              <Text style={styles.bioText}>{mentorData.profile_description}</Text>
            </View>
          ) : null}

          {/* Skills */}
          {skills.length > 0 ? (
            <View style={styles.skillsContainer}>
              <Text style={styles.detailLabel}>SKILLS</Text>
              <View style={styles.skillsList}>
                {skills.map((s: string, idx: number) => (
                  <View key={idx} style={styles.skillBadge}>
                    <Text style={styles.skillBadgeText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Platform URLs */}
          {platformUrls.length > 0 ? (
            <View style={styles.platformsContainer}>
              <Text style={styles.detailLabel}>PLATFORM LINKS</Text>
              <View style={styles.platformsList}>
                {platformUrls.map((p: any, idx: number) => (
                  <View key={idx} style={styles.platformLink}>
                    <Globe size={12} color="#2563EB" />
                    <Text style={styles.platformText}>
                      <Text style={{ fontWeight: 'bold' }}>{p.platform}: </Text>
                      {p.url}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </Animated.View>

        {/* Verification Status */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.sectionContainer}>
          <View style={styles.sectionHeaderLine}>
            <Shield size={16} color="#EF4444" />
            <Text style={styles.sectionHeaderTitle}>Verification Status</Text>
          </View>

          <View style={styles.verifyMainBox}>
             <View style={styles.verifyCenter}>
               <View style={[styles.verifyIconBox, { backgroundColor: mentorData?.approved_status === 'Approved' ? '#ECFDF5' : '#EFF6FF' }]}>
                 <Shield size={24} color={mentorData?.approved_status === 'Approved' ? '#10B981' : '#3B82F6'} />
               </View>
               <Text style={[styles.verifyMainTxt, { color: mentorData?.approved_status === 'Approved' ? '#10B981' : '#3B82F6' }]}>
                 {mentorData?.approved_status || "Pending Verification"}
               </Text>
               <Text style={styles.verifySubTxt}>
                 {mentorData?.is_active ? "Profile active & visible to students" : "Profile is hidden from students"}
               </Text>
             </View>

             <View style={styles.verifyList}>
               {(mentorData?.mentor_verification || []).length > 0 ? (
                 mentorData.mentor_verification.map((item: any, idx: number) => (
                   <View key={idx} style={styles.verifyListItem}>
                     <View style={styles.verifyListItemLeft}>
                       <CheckCircle2 size={16} color={item.status === 'Verified' ? '#10B981' : '#F59E0B'} />
                       <Text style={styles.verifyListItemTxt}>{item.verification}</Text>
                     </View>
                     <View style={[styles.verifyPillBg, { backgroundColor: item.status === 'Verified' ? '#ECFDF5' : '#FFFBEB', borderColor: item.status === 'Verified' ? '#D1FAE5' : '#FEF3C7' }]}>
                       <Text style={[styles.verifyPillTxt, { color: item.status === 'Verified' ? '#059669' : '#D97706' }]}>{item.status}</Text>
                     </View>
                   </View>
                 ))
               ) : (
                 <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                   <Text style={styles.verifySubTxt}>No verification records found</Text>
                 </View>
               )}
             </View>
          </View>
        </Animated.View>

        {/* Student Facing Preview */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.sectionContainer}>
           <View style={styles.sectionHeaderLine}>
             <Eye size={16} color="#D97706" />
             <Text style={styles.sectionHeaderTitle}>Student-Facing Public Profile</Text>
           </View>

           <View style={styles.previewContainer}>
             <Text style={styles.previewInfo}>This is how students see your profile card:</Text>
             
             <View style={styles.previewCard}>
                <View style={styles.pCardTop}>
                   <View style={styles.pCardAvatar}>
                     <Text style={styles.pCardAvatarTxt}>{initials}</Text>
                   </View>
                   <View style={{ flex: 1 }}>
                     <View style={styles.pCardNameRow}>
                        <Text style={styles.pCardName}>{fullName}</Text>
                        <View style={[styles.proTagSmall, { backgroundColor: mentorData?.approved_status === 'Approved' ? '#ECFDF5' : '#EFF6FF', borderColor: mentorData?.approved_status === 'Approved' ? '#A7F3D0' : '#BFDBFE' }]}>
                          <Shield size={8} color={mentorData?.approved_status === 'Approved' ? '#059669' : '#2563EB'} />
                          <Text style={[styles.proTagSmallTxt, { color: mentorData?.approved_status === 'Approved' ? '#059669' : '#1D4ED8' }]}>
                            {mentorData?.approved_status === 'Approved' ? 'VERIFIED' : 'PENDING'}
                          </Text>
                        </View>
                     </View>
                     <Text style={styles.pCardRole} numberOfLines={1}>{mentorData?.role || 'No role set'}</Text>
                     {mentorData?.type ? (
                       <Text style={styles.pCardType} numberOfLines={1}>{mentorData.type}</Text>
                     ) : null}
                   </View>
                </View>

                <View style={styles.pCardStatsRow}>
                  <View style={styles.pCardStatCol}>
                     <Text style={styles.pCardStatLbl}>RATING</Text>
                     <Text style={styles.pCardStatVal}>⭐ {mentorData?.avg_rating > 0 ? Number(mentorData.avg_rating).toFixed(1) : 'New'}</Text>
                  </View>
                  <View style={styles.pCardDiv} />
                  <View style={styles.pCardStatCol}>
                     <Text style={styles.pCardStatLbl}>SESSIONS</Text>
                     <Text style={styles.pCardStatVal}>{mentorData?.total_sessions ?? 0}</Text>
                  </View>
                  <View style={styles.pCardDiv} />
                  <View style={styles.pCardStatCol}>
                     <Text style={styles.pCardStatLbl}>HOURS</Text>
                     <Text style={styles.pCardStatVal}>{Number(mentorData?.total_hours ?? 0).toFixed(1)}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.pCardBtn} disabled>
                  <Text style={styles.pCardBtnTxt}>Book Session</Text>
                </TouchableOpacity>
             </View>
           </View>
        </Animated.View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal animationType="slide" transparent={true} visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Settings</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
               <DynamicForm
                 fields={editFields}
                 onSubmit={handleUpdateProfile}
                 initialValues={profileFormValues}
                 onChange={handleFormChange}
                 loading={updateLoading}
                 buttonLabel="Save Changes"
               />
            </ScrollView>
          </Animated.View>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  editBtnBox: { padding: 10, backgroundColor: 'rgba(76, 29, 149, 0.08)', borderRadius: 10 },

  summaryCard: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 20, marginBottom: 24, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  rowWrapper: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  avatarMain: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarMainTxt: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  verifyPip: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#FFF', padding: 2, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  nameTxt: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  proTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#BFDBFE' },
  proTagTxt: { fontSize: 8, fontWeight: '900', color: '#1D4ED8', textTransform: 'uppercase' },
  roleSubTxt: { fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 10 },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagLbl: { fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, overflow: 'hidden' },

  detailsCard: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 20, marginBottom: 24, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  detailsGrid: { gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailIcon: { marginTop: 2 },
  detailLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 2, textTransform: 'uppercase' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#334155' },

  bioContainer: { marginTop: 16 },
  bioText: { fontSize: 14, color: '#475569', lineHeight: 20, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },

  skillsContainer: { marginTop: 16 },
  skillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E0E7FF' },
  skillBadgeText: { fontSize: 12, color: '#4F46E5', fontWeight: '700' },

  platformsContainer: { marginTop: 16 },
  platformsList: { gap: 8 },
  platformLink: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  platformText: { fontSize: 13, color: '#2563EB', fontWeight: '500' },

  sectionContainer: { marginBottom: 24 },
  sectionHeaderLine: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, marginBottom: 12 },
  sectionHeaderTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },

  verifyMainBox: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 20, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  verifyCenter: { alignItems: 'center', marginBottom: 20 },
  verifyIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  verifyMainTxt: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  verifySubTxt: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  verifyList: { gap: 12 },
  verifyListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verifyListItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verifyListItemTxt: { fontSize: 13, fontWeight: '700', color: '#475569' },
  verifyPillBg: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  verifyPillTxt: { fontSize: 9, fontWeight: '900' },

  previewContainer: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 20, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  previewInfo: { fontSize: 11, color: '#64748B', fontWeight: '500', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16 },
  previewCard: { borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, backgroundColor: '#FFF' },
  pCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  pCardAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  pCardAvatarTxt: { fontSize: 16, fontWeight: '900', color: '#FFF' },
  pCardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  pCardName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  proTagSmall: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  proTagSmallTxt: { fontSize: 8, fontWeight: '900' },
  pCardRole: { fontSize: 10, color: '#64748B', fontWeight: '500' },
  pCardType: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
  
  pCardStatsRow: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#F8FAFC', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16 },
  pCardStatCol: { flex: 1, alignItems: 'center' },
  pCardStatLbl: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  pCardStatVal: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  pCardDiv: { width: 1, height: 24, backgroundColor: '#E2E8F0' },

  pCardBtn: { backgroundColor: '#F97316', width: '100%', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  pCardBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '500' },
  errorText: { fontSize: 14, color: '#EF4444', fontWeight: '600', marginBottom: 16 },
  retryBtn: { backgroundColor: '#4c1d95', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', paddingHorizontal: 20, paddingTop: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20 },
  modalScroll: { paddingBottom: 60 },

  footerSpacer: { height: 40 }
});
