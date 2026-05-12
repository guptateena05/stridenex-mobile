import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Plus, 
  MapPin,
  Calendar,
  Users,
  Banknote,
  MoreVertical,
  Briefcase
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const internships = [
  { id: 1, role: "Backend Engineer Intern", type: "Technical", location: "Bengaluru", stipend: "₹40k/mo", openings: 5, applications: 78, deadline: "Mar 5", status: "Active" },
  { id: 2, role: "Product Analytics Intern", type: "Business", location: "Bengaluru", stipend: "₹35k/mo", openings: 3, applications: 54, deadline: "Mar 10", status: "Active" },
  { id: 3, role: "ML Research Intern", type: "Research", location: "Remote", stipend: "₹30k/mo", openings: 2, applications: 41, deadline: "Feb 28", status: "Closing" },
  { id: 4, role: "Design Intern (UX)", type: "Design", location: "Bengaluru", stipend: "₹25k/mo", openings: 2, applications: 19, deadline: "Mar 20", status: "Active" },
  { id: 5, role: "Fintech Analyst Intern", type: "Finance", location: "Remote", stipend: "₹20k/mo", openings: 4, applications: 55, deadline: "Mar 15", status: "Active" }
];

export const IndustryInternshipsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
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

        <Animated.View entering={FadeInUp.delay(100)} style={{ marginBottom: 24 }}>
           <TouchableOpacity style={styles.postBtn}>
             <Plus size={16} color="#FFF" />
             <Text style={styles.postBtnText}>Post Internship</Text>
           </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)}>
          {internships.map((job, idx) => (
             <Animated.View key={job.id} entering={FadeInUp.delay(250 + idx * 50)} style={styles.card}>
                <View style={styles.cardHeader}>
                   <View style={styles.titleArea}>
                      <Text style={styles.jobRole}>{job.role}</Text>
                      <View style={styles.typeBadge}>
                         <Text style={styles.typeText}>{job.type}</Text>
                      </View>
                   </View>
                   <TouchableOpacity style={styles.moreBtn}>
                      <MoreVertical size={18} color="#94A3B8" />
                   </TouchableOpacity>
                </View>

                <View style={styles.infoGrid}>
                   <View style={styles.infoItem}>
                      <MapPin size={14} color="#EF4444" />
                      <Text style={styles.infoText}>{job.location}</Text>
                   </View>
                   <View style={styles.infoItem}>
                      <Banknote size={14} color="#10B981" />
                      <Text style={styles.infoText}>{job.stipend}</Text>
                   </View>
                   <View style={styles.infoItem}>
                      <Users size={14} color="#3B82F6" />
                      <Text style={styles.infoText}>{job.openings} Openings</Text>
                   </View>
                   <View style={styles.infoItem}>
                      <Calendar size={14} color={job.deadline === "Feb 28" ? "#EF4444" : "#F59E0B"} />
                      <Text style={[styles.infoText, job.deadline === "Feb 28" && { color: "#EF4444" }]}>Ends {job.deadline}</Text>
                   </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.footerRow}>
                   <View style={styles.appCountBox}>
                      <Text style={styles.appCountNum}>{job.applications}</Text>
                      <Text style={styles.appCountLabel}>Applications</Text>
                   </View>

                   <View style={[styles.statusBadge, job.status === 'Active' ? styles.statusActive : styles.statusClosing]}>
                      <Text style={[styles.statusText, job.status === 'Active' ? styles.statusTextActive : styles.statusTextClosing]}>
                         {job.status}
                      </Text>
                   </View>
                </View>
             </Animated.View>
          ))}
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
  
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  postBtn: { backgroundColor: colors.purple[600], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, shadowColor: colors.purple[600], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  postBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  titleArea: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  jobRole: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  typeBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  typeText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  moreBtn: { padding: 4, marginRight: -4 },
  
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
  infoText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },
  
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appCountBox: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  appCountNum: { fontSize: 20, fontWeight: '900', color: '#2563EB' },
  appCountLabel: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusActive: { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' },
  statusClosing: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  statusTextActive: { color: '#059669' },
  statusTextClosing: { color: '#EF4444' },

  footerSpacer: { height: 40 }
});
