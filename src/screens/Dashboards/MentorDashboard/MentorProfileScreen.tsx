import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  UserCircle, 
  MapPin, 
  Briefcase, 
  BookOpen,
  Edit2,
  CheckCircle2,
  Shield,
  Eye,
  X,
  Star
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

export const MentorProfileScreen = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
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
            <TouchableOpacity style={styles.editBtnBox} onPress={() => setIsEditModalVisible(true)}>
              <Edit2 size={16} color="#4c1d95" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Manage your public appearance and verifications</Text>
        </Animated.View>

        {/* Profile Card Summary */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.summaryCard}>
          <View style={styles.rowWrapper}>
            <View style={styles.avatarMain}>
              <Text style={styles.avatarMainTxt}>MG</Text>
              <View style={styles.verifyPip}>
                <Text style={{fontSize: 8}}>✨</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
               <View style={styles.nameRow}>
                 <Text style={styles.nameTxt}>Meghna Gupta</Text>
                 <View style={styles.proTag}>
                   <Shield size={10} color="#2563EB" />
                   <Text style={styles.proTagTxt}>Verified Mentor</Text>
                 </View>
               </View>
               <Text style={styles.roleSubTxt}>Senior Data Scientist @ Amazon • 7 years exp</Text>
               <View style={styles.tagsRow}>
                 <Text style={[styles.tagLbl, { backgroundColor: '#FFF7ED', color: '#C2410C', borderColor: '#FFEDD5' }]}>ML</Text>
                 <Text style={[styles.tagLbl, { backgroundColor: '#F0FDF4', color: '#15803D', borderColor: '#DCFCE7' }]}>Python</Text>
                 <Text style={[styles.tagLbl, { backgroundColor: '#ECFDF5', color: '#047857', borderColor: '#D1FAE5' }]}>Career</Text>
                 <Text style={[styles.tagLbl, { backgroundColor: '#EFF6FF', color: '#1D4ED8', borderColor: '#DBEAFE' }]}>Interview Prep</Text>
               </View>
            </View>
          </View>
        </Animated.View>

        {/* Verification Status */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.sectionContainer}>
          <View style={styles.sectionHeaderLine}>
            <Shield size={16} color="#EF4444" />
            <Text style={styles.sectionHeaderTitle}>Verification Status</Text>
          </View>

          <View style={styles.verifyMainBox}>
             <View style={styles.verifyCenter}>
               <View style={styles.verifyIconBox}>
                 <Shield size={24} color="#3B82F6" />
               </View>
               <Text style={styles.verifyMainTxt}>Verified Mentor</Text>
               <Text style={styles.verifySubTxt}>Verified on Jan 15, 2025</Text>
             </View>

             <View style={styles.verifyList}>
               {[
                 "Identity Verified",
                 "LinkedIn Matched",
                 "Employment Verified",
                 "Background Check",
                 "4.8+ Rating Maintained",
                 "Recent Profile Edit"
               ].map((item, idx) => (
                 <View key={idx} style={styles.verifyListItem}>
                   <View style={styles.verifyListItemLeft}>
                     <CheckCircle2 size={16} color="#10B981" />
                     <Text style={styles.verifyListItemTxt}>{item}</Text>
                   </View>
                   <View style={styles.verifyPillBg}>
                     <Text style={styles.verifyPillTxt}>VERIFIED</Text>
                   </View>
                 </View>
               ))}
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
                     <Text style={styles.pCardAvatarTxt}>MG</Text>
                   </View>
                   <View>
                     <View style={styles.pCardNameRow}>
                        <Text style={styles.pCardName}>Meghna Gupta</Text>
                        <View style={styles.proTagSmall}>
                          <Shield size={8} color="#2563EB" />
                          <Text style={styles.proTagSmallTxt}>VERIFIED</Text>
                        </View>
                     </View>
                     <Text style={styles.pCardRole}>Senior Data Scientist @ Amazon</Text>
                   </View>
                </View>

                <View style={styles.pCardStatsRow}>
                  <View style={styles.pCardStatCol}>
                     <Text style={styles.pCardStatLbl}>RATING</Text>
                     <Text style={styles.pCardStatVal}>⭐ 4.9</Text>
                  </View>
                  <View style={styles.pCardDiv} />
                  <View style={styles.pCardStatCol}>
                     <Text style={styles.pCardStatLbl}>SESSIONS</Text>
                     <Text style={styles.pCardStatVal}>120</Text>
                  </View>
                  <View style={styles.pCardDiv} />
                  <View style={styles.pCardStatCol}>
                     <Text style={styles.pCardStatLbl}>PER HR</Text>
                     <Text style={styles.pCardStatVal}>₹1,200</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.pCardBtn}>
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
               
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLbl}>Display Name</Text>
                 <TextInput style={styles.inputFld} defaultValue="Meghna Gupta" placeholderTextColor="#94A3B8" />
               </View>

               <View style={styles.inputGroup}>
                 <Text style={styles.inputLbl}>Current Role</Text>
                 <TextInput style={styles.inputFld} defaultValue="Senior Data Scientist @ Amazon" placeholderTextColor="#94A3B8" />
               </View>

               <View style={styles.inputGroup}>
                 <Text style={styles.inputLbl}>Years of Experience</Text>
                 <TextInput style={styles.inputFld} defaultValue="7" keyboardType="numeric" placeholderTextColor="#94A3B8" />
               </View>

               <View style={styles.inputGroup}>
                 <Text style={styles.inputLbl}>LinkedIn URL</Text>
                 <TextInput style={styles.inputFld} defaultValue="linkedin.com/in/meghnagupta" autoCapitalize="none" placeholderTextColor="#94A3B8" />
               </View>

               <View style={styles.inputGroup}>
                 <Text style={styles.inputLbl}>GitHub (Optional)</Text>
                 <TextInput style={styles.inputFld} defaultValue="github.com/meghnagupta" autoCapitalize="none" placeholderTextColor="#94A3B8" />
               </View>

               <View style={styles.inputGroup}>
                 <Text style={styles.inputLbl}>Hourly Rate (₹)</Text>
                 <TextInput style={styles.inputFld} defaultValue="1200" keyboardType="numeric" placeholderTextColor="#94A3B8" />
               </View>

               <View style={styles.inputGroup}>
                 <Text style={styles.inputLbl}>Professional Bio</Text>
                 <TextInput style={[styles.inputFld, styles.inputTxtArea]} multiline numberOfLines={4} defaultValue="7+ years in ML & data science at Amazon. I mentor students on ML careers, Python, and interview prep for product + data science roles at top companies." textAlignVertical="top" placeholderTextColor="#94A3B8" />
               </View>

               <TouchableOpacity style={styles.saveBtn} onPress={() => setIsEditModalVisible(false)}>
                 <Text style={styles.saveBtnTxt}>Save Changes</Text>
               </TouchableOpacity>

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

  sectionContainer: { marginBottom: 24 },
  sectionHeaderLine: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, marginBottom: 12 },
  sectionHeaderTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },

  verifyMainBox: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 20 },
  verifyCenter: { alignItems: 'center', marginBottom: 20 },
  verifyIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  verifyMainTxt: { fontSize: 16, fontWeight: '800', color: '#2563EB', marginBottom: 2 },
  verifySubTxt: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  verifyList: { gap: 12 },
  verifyListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verifyListItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verifyListItemTxt: { fontSize: 13, fontWeight: '700', color: '#475569' },
  verifyPillBg: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#D1FAE5' },
  verifyPillTxt: { fontSize: 9, fontWeight: '900', color: '#059669' },

  previewContainer: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 20 },
  previewInfo: { fontSize: 11, color: '#64748B', fontWeight: '500', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16 },
  previewCard: { borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, backgroundColor: '#FFF' },
  pCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  pCardAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  pCardAvatarTxt: { fontSize: 16, fontWeight: '900', color: '#FFF' },
  pCardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  pCardName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  proTagSmall: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#EFF6FF', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#BFDBFE' },
  proTagSmallTxt: { fontSize: 8, fontWeight: '900', color: '#1D4ED8' },
  pCardRole: { fontSize: 10, color: '#64748B', fontWeight: '500' },
  
  pCardStatsRow: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#F8FAFC', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16 },
  pCardStatCol: { flex: 1, alignItems: 'center' },
  pCardStatLbl: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  pCardStatVal: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  pCardDiv: { width: 1, height: 24, backgroundColor: '#E2E8F0' },

  pCardBtn: { backgroundColor: '#F97316', width: '100%', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  pCardBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', paddingHorizontal: 20, paddingTop: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20 },
  modalScroll: { paddingBottom: 60 },
  
  inputGroup: { marginBottom: 20 },
  inputLbl: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 8 },
  inputFld: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#0F172A', fontWeight: '500' },
  inputTxtArea: { minHeight: 100 },
  
  saveBtn: { backgroundColor: '#4c1d95', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  footerSpacer: { height: 40 }
});
