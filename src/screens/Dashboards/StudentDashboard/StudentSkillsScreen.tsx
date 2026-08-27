import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/context/AuthContext';
import { SkillsRadarChart } from '@/components/dashboard/SkillsRadarChart';
import { OverallSkillScore } from '@/components/dashboard/OverallSkillScore';
import { SkillLedgerList, SkillRow } from '@/components/dashboard/SkillLedgerList';
import { 
  Award, 
  FileText, 
  ShieldCheck, 
  Target, 
  Factory, 
  TrendingUp, 
  Zap, 
  ChevronRight, 
  X, 
  Plus,
  Check
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { 
  getSkillLedger, 
  getEmployabilityScore, 
  createStudentSkill, 
  addSkillEvidence,
} from '@/api/student.services';
import SkillVerificationModal from '@/components/SkillVerificationModal';
import { getSkillScore } from '@/api/api.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';

export const StudentSkillsScreen = () => {
  const { userName } = useAuth();
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [overallScore, setOverallScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Modals visibility
  const [isSkillModalVisible, setIsSkillModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEvidenceModalVisible, setIsEvidenceModalVisible] = useState(false);

  // Selected skill
  const [selectedSkill, setSelectedSkill] = useState<SkillRow | null>(null);

  // Submitting states
  const [submittingSkill, setSubmittingSkill] = useState(false);
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  // Skill Verification States
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testSkill, setTestSkill] = useState<string>('');
  const [testLevel, setTestLevel] = useState<string>('');

  // Fetch skill data from API
  const fetchSkillStats = async (showLoadingSpinner = true) => {
    if (!userName) return;
    if (showLoadingSpinner) setLoading(true);
    try {
      const [ledgerRes, scoreRes] = await Promise.all([
        getSkillLedger(userName),
        getSkillScore({ student: userName })
      ]);

      if (ledgerRes?.message) {
        setSummary(ledgerRes.message.summary || {});

        if (ledgerRes.message.skills && Array.isArray(ledgerRes.message.skills)) {
          const mappedRows: SkillRow[] = ledgerRes.message.skills.map((s: any, idx: number) => ({
            id: s.name || `skill-${idx}`,
            name: s.skill || s.skill_name || "Untitled Skill",
            category: s.skill_category || "Technical",
            categoryType: (s.skill_category as any) || "Technical",
            level: s.current_level || "Beginner",
            levelType: (s.current_level as any) || "Beginner",
            evidence: s.evidence_count || 0,
            endorsements: s.endorsement_count || 0,
            aiVerified: !!s.ai_verified,
            lastDemo: s.last_demo || "-"
          }));
          setSkills(mappedRows);
        } else {
          setSkills([]);
        }
      }

      if (scoreRes && scoreRes.hasOwnProperty('message')) {
        setOverallScore(scoreRes.message || 0);
      }
    } catch (err) {
      console.error("Error fetching skill stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillStats();
  }, [userName]);

  // Map skills to Radar data
  const radarData = useMemo(() => {
    const mapped = (skills || []).slice(0, 6).map(s => {
      let val = 40;
      if (s.level === 'Advanced') val = 90;
      else if (s.level === 'Intermediate') val = 65;
      else val = 40;
      return {
        subject: s.name.length > 8 ? s.name.slice(0, 8) + '..' : s.name,
        value: val,
        fullMark: 100
      };
    });

    // Ensure at least 3 subjects for proper radar rendering
    while (mapped.length < 3) {
      mapped.push({
        subject: `Skill ${mapped.length + 1}`,
        value: 0,
        fullMark: 100
      });
    }

    return mapped;
  }, [skills]);

  // Map summary stats dynamically
  const ledgerStats = useMemo(() => [
    { label: 'Total Skills', value: String(summary.total_skills || 0), icon: Target, color: '#EF4444', bg: '#FEF2F2' },
    { label: 'AI Verified', value: String(summary.ai_verified || 0), icon: ShieldCheck, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Mentor Endorsed', value: String(summary.mentor_endorsed || 0), icon: Award, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Industry Endorsed', value: String(summary.industry_endorsed || 0), icon: Factory, color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Evidence Items', value: String(summary.evidence_items || 0), icon: FileText, color: '#64748B', bg: '#F8FAFC' },
  ], [summary]);

  // Skill creation fields
  const skillFields: FormField[] = useMemo(() => [
    {
      fieldname: 'skill',
      label: 'Skill Name',
      fieldtype: 'Select',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Skill', fields: ['skill_name'] },
      mapOptions: (data: any) => {
        const items = data.data || data || [];
        return items.map((item: any) => ({
          value: item.name || item.skill_name,
          label: item.skill_name || item.name,
        }));
      },
      placeholder: 'Select a skill',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'current_level',
      label: 'Current Level',
      fieldtype: 'Select',
      options: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
      layout: 'full',
    }
  ], []);

  // Evidence submission fields
  const evidenceFields: FormField[] = useMemo(() => [
    {
      fieldname: 'evidence_type',
      label: 'Evidence Type',
      fieldtype: 'Select',
      options: ['Project', 'Certification', 'Work Experience', 'Competition', 'Other'],
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'evidence_date',
      label: 'Evidence Date',
      fieldtype: 'Date',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'description',
      label: 'Description',
      fieldtype: 'Long Text',
      placeholder: 'Briefly describe your project, certification, or experience...',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'document_url',
      label: 'Document URL',
      fieldtype: 'Data',
      placeholder: 'e.g. GitHub URL or Certificate URL',
      required: false,
      layout: 'full',
    }
  ], []);

  // Handle skill creation verify & test trigger
  const handleCreateSkill = async (formData: any) => {
    setTestSkill(formData.skill);
    setTestLevel(formData.current_level);
    setIsSkillModalVisible(false);
    setIsTestModalOpen(true);
  };

  const handleVerifySkillDirect = async (skillRow: SkillRow) => {
    setTestSkill(skillRow.name);
    setTestLevel(skillRow.level);
    setIsSkillModalVisible(false);
    setIsTestModalOpen(true);
  };

  // Handle evidence creation submit
  const handleAddEvidence = async (formData: any) => {
    if (!userName || !selectedSkill) return;
    setSubmittingEvidence(true);
    try {
      const payload = {
        student_skill: selectedSkill.id || `${userName}-${selectedSkill.name.toLowerCase()}`,
        evidence_type: formData.evidence_type,
        evidence_date: formData.evidence_date,
        description: formData.description,
        reference_doctype: '',
        reference_name: '',
        document_url: formData.document_url || ''
      };

      const response = await addSkillEvidence(payload);

      const isSuccess = response && (
        response.status === 200 || 
        response.status === '200' || 
        response.message === 'Evidence added successfully' ||
        (typeof response.message === 'string' && response.message.startsWith('SE-')) ||
        response.data
      );

      if (isSuccess) {
        Alert.alert('Success', 'Evidence added successfully!');
        setIsEvidenceModalVisible(false);
        setIsDetailModalVisible(false);
        setSelectedSkill(null);
        fetchSkillStats(false);
      } else {
        Alert.alert('Error', response?.message || 'Failed to add evidence');
      }
    } catch (err: any) {
      console.error('Error adding evidence:', err);
      Alert.alert('Error', err?.message || 'Something went wrong while adding evidence');
    } finally {
      setSubmittingEvidence(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        <Text style={styles.loadingText}>Syncing Skill Ledger...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Zap size={10} color={colors.accent.DEFAULT} fill={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>PRO ANALYST MODE</Text>
          </View>
          <Text style={styles.title}>Skills Pulse</Text>
          <Text style={styles.subtitle}>Real-time verification & competency ledger</Text>
        </Animated.View>

        {/* Skill Radar Section */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.premiumCard}>
          <View style={styles.cardHeader}>
             <View style={styles.cardHeaderTitle}>
                <TrendingUp size={16} color={colors.accent.DEFAULT} />
                <Text style={styles.sectionTitle}>Skill Radar</Text>
             </View>
          </View>
          
          <View style={styles.radarContainer}>
            <SkillsRadarChart data={radarData} size={200} />
          </View>

          <View style={styles.insightBox}>
             <View style={styles.insightIconContainer}>
                <Zap size={14} color={colors.accent.DEFAULT} />
             </View>
             <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>
                  {skills.length > 0 ? `Dominant Category: ${skills[0].category}` : 'Beginner Career Profile'}
                </Text>
                <Text style={styles.insightText}>
                  {skills.length > 0 
                    ? `Your top skill is ${skills[0].name}. Keep adding evidence to raise your verification score.`
                    : 'Start by declaring your skills and uploading evidence items to verify them.'}
                </Text>
             </View>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.row}>
          <Animated.View entering={FadeInUp.delay(300)} style={[styles.premiumCard, styles.halfCard]}>
            <Text style={styles.miniTitle}>LEDGER STATS</Text>
            <View style={styles.statsList}>
              {ledgerStats.map((stat, i) => (
                <View key={i} style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                    <stat.icon size={11} color={stat.color} />
                  </View>
                  <View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={[styles.premiumCard, styles.halfCard, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={[styles.miniTitle, { alignSelf: 'flex-start', position: 'absolute', top: 16, left: 16 }]}>OVERALL</Text>
            <OverallSkillScore score={overallScore} size={92} strokeWidth={8} />
          </Animated.View>
        </View>

        {/* Skill Ledger List */}
        <Animated.View entering={FadeInUp.delay(500)}>
          <SkillLedgerList 
            skills={skills} 
            onSkillPress={(skill) => {
              setSelectedSkill(skill);
              setIsDetailModalVisible(true);
            }}
            onAddSkillPress={() => setIsSkillModalVisible(true)}
            onVerifySkillPress={handleVerifySkillDirect}
          />
        </Animated.View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Add New Skill Modal */}
      <Modal animationType="slide" transparent={true} visible={isSkillModalVisible} onRequestClose={() => setIsSkillModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Skill</Text>
              <TouchableOpacity onPress={() => setIsSkillModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
               <View style={{ padding: 20 }}>
                 <DynamicForm
                   fields={skillFields}
                   onSubmit={handleCreateSkill}
                   loading={submittingSkill}
                   buttonLabel="Verify Skill"
                 />
               </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Skill Detail Modal */}
      <Modal animationType="slide" transparent={true} visible={isDetailModalVisible} onRequestClose={() => setIsDetailModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedSkill?.name}</Text>
              <TouchableOpacity onPress={() => setIsDetailModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailBody}>
              <Text style={styles.detailSubtitle}>
                {selectedSkill?.category} • {selectedSkill?.level}
              </Text>
              <View style={styles.detailStatsRow}>
                <View style={styles.detailStatBox}>
                  <Text style={styles.detailStatLabel}>EVIDENCE</Text>
                  <Text style={styles.detailStatValue}>{selectedSkill?.evidence} items</Text>
                </View>
                <View style={styles.detailStatBox}>
                  <Text style={styles.detailStatLabel}>ENDORSEMENTS</Text>
                  <Text style={styles.detailStatValue}>{selectedSkill?.endorsements} points</Text>
                </View>
              </View>

              <View style={styles.strengthenBox}>
                <View style={styles.strengthenIconContainer}>
                  <Plus size={20} color="#fff" />
                </View>
                <View style={styles.strengthenContent}>
                  <Text style={styles.strengthenTitle}>Strengthen this skill</Text>
                  <Text style={styles.strengthenText}>Add a project, certificate or experience as evidence.</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.evidenceBtn}
                onPress={() => {
                  setIsDetailModalVisible(false);
                  setIsEvidenceModalVisible(true);
                }}
              >
                <Text style={styles.evidenceBtnText}>Add New Evidence</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Skill Evidence Modal */}
      <Modal animationType="slide" transparent={true} visible={isEvidenceModalVisible} onRequestClose={() => setIsEvidenceModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Evidence: {selectedSkill?.name}</Text>
              <TouchableOpacity onPress={() => setIsEvidenceModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
               <View style={{ padding: 20 }}>
                 <DynamicForm
                   fields={evidenceFields}
                   onSubmit={handleAddEvidence}
                   loading={submittingEvidence}
                   buttonLabel="Add Evidence"
                 />
               </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <SkillVerificationModal
        visible={isTestModalOpen}
        userName={userName || ''}
        skillName={testSkill}
        skillLevel={testLevel}
        onClose={() => setIsTestModalOpen(false)}
        onSuccess={async (result) => {
          // If passed, create student skill in DB
          try {
            await createStudentSkill({
              student: userName || "",
              skill: testSkill,
              current_level: testLevel,
              ai_verified: 1
            });
          } catch (createErr) {
            console.error('Error saving verified skill to DB:', createErr);
          }
          fetchSkillStats(false);
        }}
      />
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  headerBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.accent.DEFAULT,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  addSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent.DEFAULT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addSkillBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: typography.fontFamily.display,
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  miniTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  insightText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfCard: {
    flex: 1,
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
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  footerSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
  },
  modalScroll: {
    paddingBottom: 60,
  },
  detailBody: {
    padding: 24,
  },
  detailSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 20,
  },
  detailStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  detailStatBox: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailStatLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  strengthenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 24,
  },
  strengthenIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  strengthenContent: {
    flex: 1,
  },
  strengthenTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 2,
  },
  strengthenText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#C2410C',
    lineHeight: 15,
  },
  evidenceBtn: {
    backgroundColor: '#0F172A',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  evidenceBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: typography.fontFamily.display,
  },
  testModalOverlay: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  testModalContainer: {
    flex: 1,
  },
  testModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  testHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  testHeaderSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  testCloseBtn: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
  },
  testBody: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent.DEFAULT,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  testScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.accent.DEFAULT,
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionButtonSelected: {
    borderColor: colors.accent.DEFAULT,
    backgroundColor: 'rgba(255, 107, 0, 0.02)',
  },
  answerInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: colors.accent.DEFAULT,
  },
  optionRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent.DEFAULT,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  optionTextSelected: {
    color: '#0F172A',
    fontWeight: '700',
  },
  testFooter: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
    gap: 16,
  },
  testBackBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBackBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  testNextBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testNextBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  testSubmitBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testSubmitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  testIntroScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introHighlightBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  introIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introHighlightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  introHighlightText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  introRow: {
    flexDirection: 'column', // Or row if landscape
    gap: 16,
  },
  introCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flex: 1,
  },
  introCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  introCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 1,
  },
  introBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  introBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97316',
    marginTop: 6,
    marginRight: 10,
  },
  introBulletText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
  testIntroCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  testIntroCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  testIntroStartBtn: {
    flex: 2,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  testIntroStartBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scorecardMain: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scorePercentText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: 2,
  },
  resultStatusBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  resultStatusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  correctAnswersText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  feedbackSection: {
    marginBottom: 20,
  },
  sectionHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  feedbackSummaryCard: {
    backgroundColor: 'rgba(37, 99, 235, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 20,
    padding: 16,
  },
  feedbackSummaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 18,
  },
  strengthsGapsContainer: {
    flexDirection: 'column',
    gap: 20,
    marginBottom: 20,
  },
  halfFeedbackSection: {
    flex: 1,
  },
  strengthsCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  gapsCard: {
    backgroundColor: 'rgba(217, 119, 6, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.1)',
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bulletIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: -2,
  },
  bulletText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },
  nextStepsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    padding: 16,
  },
  nextStepsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 17,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionIndexBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questionIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  correctnessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  correctnessText: {
    fontSize: 10,
    fontWeight: '800',
  },
  breakdownQuestionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
    marginBottom: 10,
  },
  userAnswerBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  answerBoxLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 2,
  },
  userAnswerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  commentBox: {
    backgroundColor: 'rgba(37, 99, 235, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 12,
    padding: 10,
  },
  commentBoxLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 16,
  },
  resultFooter: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
