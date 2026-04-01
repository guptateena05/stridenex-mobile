import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { Search, ChevronDown, Download, Sparkles, Bookmark } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const suggestedSkills = ["Python", "Machine Learning", "SQL", "Data Viz", "Statistics", "TensorFlow"];

const candidates = [
  { id: 1, initials: "PS", bgColor: "#EF4444", name: "Priya Sharma", college: "VJTI Mumbai • CGPA 8.7", skills: ["Python", "ML", "SQL"], match: 94 },
  { id: 2, initials: "SP", bgColor: "#84CC16", name: "Sneha Patel", college: "COEP Pune • CGPA 8.4", skills: ["Python", "SQL"], match: 87 },
  { id: 3, initials: "AN", bgColor: "#22C55E", name: "Arjun Nair", college: "IIT Bombay • CGPA 9.1", skills: ["ML", "Python"], match: 80 },
  { id: 4, initials: "KR", bgColor: "#3B82F6", name: "Kiran Reddy", college: "NIT Warangal • CGPA 8", skills: ["Deep Learning"], match: 74 },
  { id: 5, initials: "PS", bgColor: "#6366F1", name: "Priya Sharma", college: "VJTI Mumbai • CGPA 8.7", skills: ["Python", "ML", "SQL"], match: 90 },
  { id: 6, initials: "SP", bgColor: "#A855F7", name: "Sneha Patel", college: "COEP Pune • CGPA 8.4", skills: ["Python", "SQL"], match: 83 }
];

export const IndustryFindTalentScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
           <View style={styles.headerBadge}>
              <Search size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>TALENT ACQUISITION</Text>
           </View>
           <Text style={styles.title}>Find Talent</Text>
           <Text style={styles.subtitle}>Discover and invite top matched candidates</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={styles.searchCard}>
          <View style={styles.searchTitleRow}>
            <Search size={20} color="#64748B" />
            <Text style={styles.searchTitle}>Skill-Based Candidate Search</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input}
              placeholder="Required Skills (e.g. Python, ML, SQL)"
              placeholderTextColor="#94A3B8"
              defaultValue="Python, Machine Learning, SQL"
            />
          </View>

          <View style={styles.dropdownRow}>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownText}>College Tier</Text>
              <ChevronDown size={16} color="#64748B" />
            </View>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownText}>Graduation Year</Text>
              <ChevronDown size={16} color="#64748B" />
            </View>
          </View>

          <TouchableOpacity style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>

          <View style={styles.skillsChipsRow}>
            {suggestedSkills.map((skill, index) => (
              <View key={skill} style={[styles.skillChip, index < 3 ? styles.skillChipActive : {}]}>
                <Text style={[styles.skillChipText, index < 3 ? styles.skillChipTextActive : {}]}>{skill}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>847 candidates match</Text>
            <View style={styles.resultsActions}>
              <View style={styles.dropdownSmall}>
                <Text style={styles.dropdownSmallText}>Sort: Best Match</Text>
                <ChevronDown size={14} color="#64748B" />
              </View>
            </View>
          </View>

          <View style={styles.candidatesList}>
            {candidates.map((candidate, idx) => (
              <Animated.View key={candidate.id} entering={FadeInUp.delay(300 + idx * 50)} style={styles.candidateCard}>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchBadgeText}>{candidate.match}%</Text>
                </View>
                
                <View style={styles.candidateTop}>
                  <View style={[styles.avatar, { backgroundColor: candidate.bgColor }]}>
                    <Text style={styles.avatarText}>{candidate.initials}</Text>
                  </View>
                  <View style={styles.candidateInfo}>
                    <Text style={styles.candidateName}>{candidate.name}</Text>
                    <Text style={styles.candidateCollege}>{candidate.college}</Text>
                    <View style={styles.skillsRow}>
                      {candidate.skills.map(skill => (
                        <View key={skill} style={styles.skillTag}>
                          <Text style={styles.skillTagText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.candidateActions}>
                  <TouchableOpacity style={styles.inviteBtn}>
                    <Sparkles size={14} color="#FFF" />
                    <Text style={styles.inviteBtnText}>Invite</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.ledgerBtn}>
                    <Text style={styles.ledgerBtnText}>View Ledger</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bookmarkBtn}>
                    <Bookmark size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  
  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },

  searchCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 24 },
  searchTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  searchTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  inputContainer: { marginBottom: 16 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A', fontWeight: '500' },
  dropdownRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  dropdown: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  dropdownText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  searchBtn: { backgroundColor: colors.purple[600], paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20, shadowColor: colors.purple[600], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  searchBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  skillsChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  skillChipActive: { backgroundColor: '#F1F5F9', borderColor: '#F1F5F9' },
  skillChipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  skillChipTextActive: { color: '#334155' },

  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  resultsTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  resultsActions: { flexDirection: 'row', gap: 8 },
  dropdownSmall: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  dropdownSmallText: { fontSize: 12, color: '#475569', fontWeight: '600' },

  candidatesList: { gap: 16 },
  candidateCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, position: 'relative' },
  matchBadge: { position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  matchBadgeText: { fontSize: 13, fontWeight: '900', color: '#059669' },
  candidateTop: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  candidateInfo: { flex: 1, paddingRight: 40 },
  candidateName: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  candidateCollege: { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 10 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE' },
  skillTagText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  candidateActions: { flexDirection: 'row', gap: 10 },
  inviteBtn: { flex: 1, backgroundColor: colors.purple[600], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  inviteBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  ledgerBtn: { flex: 1, backgroundColor: '#F8FAFC', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  ledgerBtnText: { color: '#475569', fontSize: 13, fontWeight: '700' },
  bookmarkBtn: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  footerSpacer: { height: 40 }
});
