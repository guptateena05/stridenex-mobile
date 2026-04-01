import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  MoreHorizontal, 
  MapPin, 
  Clock, 
  ChevronRight,
  UserCheck,
  Zap,
  PhoneCall,
  CheckCircle2,
  ListOrdered
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const pipelineData = [
  {
    id: 'stage-1',
    title: 'AI Pre-screened',
    count: 24,
    color: '#3B82F6',
    icon: Zap,
    candidates: [
      { id: '101', name: 'Alok Singh', role: 'Backend Engineer Intern', match: 94, location: 'Remote', applyDate: '2d ago', initials: 'AS' },
      { id: '102', name: 'Kavya R.', role: 'Product Analytics Intern', match: 88, location: 'Bengaluru', applyDate: '3d ago', initials: 'KR' }
    ]
  },
  {
    id: 'stage-2',
    title: 'HR Shortlisted',
    count: 8,
    color: '#F97316',
    icon: UserCheck,
    candidates: [
      { id: '103', name: 'Rohan Gupta', role: 'ML Research Intern', match: 91, location: 'Pune', applyDate: '5d ago', initials: 'RG' }
    ]
  },
  {
    id: 'stage-3',
    title: 'Interviews (R1)',
    count: 3,
    color: '#8B5CF6',
    icon: PhoneCall,
    candidates: [
      { id: '104', name: 'Tanya Sharma', role: 'Design Intern (UX)', match: 86, location: 'Delhi', applyDate: '1w ago', initials: 'TS' },
      { id: '105', name: 'Aman Verma', role: 'Backend Engineer Intern', match: 82, location: 'Bengaluru', applyDate: '1w ago', initials: 'AV' }
    ]
  },
  {
    id: 'stage-4',
    title: 'Offers Extended',
    count: 1,
    color: '#10B981',
    icon: CheckCircle2,
    candidates: [
      { id: '106', name: 'Sneha Patil', role: 'Fintech Analyst', match: 96, location: 'Remote', applyDate: '2w ago', initials: 'SP' }
    ]
  }
];

export const IndustryPipelineScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
           <View style={styles.headerBadge}>
              <ListOrdered size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>CANDIDATE WORKFLOW</Text>
           </View>
           <Text style={styles.title}>Pipeline</Text>
           <Text style={styles.subtitle}>Track candidates across recruitment stages</Text>
        </Animated.View>

        {/* Pipeline Sections (Vertical grouped layout) */}
        <View style={styles.pipelineContainer}>
          {pipelineData.map((stage, sIdx) => (
             <Animated.View key={stage.id} entering={FadeInUp.delay(100 + sIdx * 100)} style={styles.stageSection}>
                <View style={[styles.stageHeader, { borderLeftColor: stage.color }]}>
                   <View style={styles.stageTitleRow}>
                      <View style={[styles.stageIconBox, { backgroundColor: `${stage.color}15` }]}>
                         <stage.icon size={16} color={stage.color} />
                      </View>
                      <Text style={styles.stageTitleText}>{stage.title}</Text>
                      <View style={[styles.countBadge, { backgroundColor: `${stage.color}10` }]}>
                         <Text style={[styles.countBadgeText, { color: stage.color }]}>{stage.count}</Text>
                      </View>
                   </View>
                </View>

                <View style={styles.candidatesList}>
                   {stage.candidates.map((candidate, cIdx) => (
                      <View key={candidate.id} style={styles.candidateCard}>
                         <View style={styles.cardTopRow}>
                            <View style={styles.candidateIntro}>
                               <View style={styles.avatar}>
                                  <Text style={styles.avatarText}>{candidate.initials}</Text>
                               </View>
                               <View>
                                  <Text style={styles.candidateName}>{candidate.name}</Text>
                                  <Text style={styles.candidateRole}>{candidate.role}</Text>
                               </View>
                            </View>
                            <TouchableOpacity style={styles.moreBtn}>
                               <MoreHorizontal size={20} color="#94A3B8" />
                            </TouchableOpacity>
                         </View>

                         <View style={styles.cardDivider} />

                         <View style={styles.cardBottomRow}>
                            <View style={styles.infoRow}>
                               <View style={styles.infoChip}>
                                  <MapPin size={10} color="#64748B" />
                                  <Text style={styles.infoChipText}>{candidate.location}</Text>
                               </View>
                               <View style={styles.infoChip}>
                                  <Clock size={10} color="#64748B" />
                                  <Text style={styles.infoChipText}>{candidate.applyDate}</Text>
                               </View>
                            </View>

                            <View style={styles.matchPill}>
                               <Text style={styles.matchLabel}>Match</Text>
                               <Text style={styles.matchValue}>{candidate.match}%</Text>
                            </View>
                         </View>
                      </View>
                   ))}
                </View>
             </Animated.View>
          ))}
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  
  header: { marginBottom: 24, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },

  pipelineContainer: { gap: 24 },
  
  stageSection: {},
  stageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingLeft: 12, borderLeftWidth: 4 },
  stageTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stageIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stageTitleText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  countBadgeText: { fontSize: 11, fontWeight: '800' },
  
  candidatesList: { gap: 12 },
  candidateCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  candidateIntro: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#475569' },
  candidateName: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  candidateRole: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  moreBtn: { padding: 4, marginRight: -4, marginTop: -4 },
  
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  infoChipText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  
  matchPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#D1FAE5' },
  matchLabel: { fontSize: 9, fontWeight: '800', color: '#059669', textTransform: 'uppercase' },
  matchValue: { fontSize: 11, fontWeight: '900', color: '#059669' },

  footerSpacer: { height: 40 }
});
