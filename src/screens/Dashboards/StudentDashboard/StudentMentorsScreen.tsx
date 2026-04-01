import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Star, 
  Calendar, 
  Clock, 
  Briefcase, 
  UserSquare2,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

// Mentors data
const mentors = [
  { id: 1, name: "Kavya Reddy", initials: "KR", role: "Senior Data Scientist", company: "Amazon", expertise: ["ML", "Python", "Career"], rating: 4.9, sessions: 124, hourlyRate: "$85/hr", availability: "Feb 27, 4PM", tags: ["Deep Learning", "NLP"], avatarColor: "#9333EA" },
  { id: 2, name: "Siddharth Shah", initials: "SS", role: "Research Scientist", company: "Microsoft", expertise: ["Deep Learning", "Computer Vision", "Research"], rating: 4.9, sessions: 67, hourlyRate: "$95/hr", availability: "Mar 2, 11AM", tags: ["PyTorch", "TensorFlow"], avatarColor: "#2563EB" },
  { id: 3, name: "Rajan Mehta", initials: "RM", role: "Engineering Manager", company: "Google", expertise: ["Leadership", "Tech", "Resume"], rating: 4.8, sessions: 89, hourlyRate: "$120/hr", availability: "Mar 1, 2PM", tags: ["System Design", "Interviews"], avatarColor: "#10B981" },
  { id: 4, name: "Ananya Krishnan", initials: "AK", role: "Head of Analytics", company: "Razorpay", expertise: ["SQL", "Data Analytics", "Product"], rating: 4.6, sessions: 145, hourlyRate: "$75/hr", availability: "Mar 3, 10AM", tags: ["Business Intelligence", "Metrics"], avatarColor: colors.accent.DEFAULT },
  { id: 5, name: "Pooja Iyer", initials: "PI", role: "Product Lead", company: "Swiggy", expertise: ["Product", "Startup", "MBA"], rating: 4.7, sessions: 98, hourlyRate: "$90/hr", availability: "Mar 1, 2PM", tags: ["Product Strategy", "Growth"], avatarColor: "#EC4899" },
  { id: 6, name: "Rahul Verma", initials: "RV", role: "Engineering Manager", company: "Microsoft", expertise: ["Cloud", "DevOps", "Architecture"], rating: 4.8, sessions: 112, hourlyRate: "$105/hr", availability: "Feb 28, 3PM", tags: ["Azure", "Kubernetes"], avatarColor: "#4F46E5" }
];

export const StudentMentorsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <UserSquare2 size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>EXPERT GUIDANCE</Text>
          </View>
          <Text style={styles.title}>Mentors</Text>
          <Text style={styles.subtitle}>Connect with industry experts</Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.searchContainer}>
          <Search size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search mentors..." 
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.filterButton}>
             <Filter size={16} color="#64748B" />
          </TouchableOpacity>
        </Animated.View>

        {/* Mentors List */}
        <View style={styles.listContainer}>
           {mentors.map((mentor, index) => (
             <Animated.View 
               key={mentor.id} 
               entering={FadeInUp.delay(250 + index * 100)}
               style={styles.mentorCard}
             >
                <View style={styles.cardHeader}>
                   <View style={styles.mentorInfo}>
                      <View style={[styles.avatar, { backgroundColor: mentor.avatarColor }]}>
                         <Text style={styles.avatarText}>{mentor.initials}</Text>
                      </View>
                      <View style={styles.mentorDetails}>
                         <Text style={styles.mentorName}>{mentor.name}</Text>
                         <View style={styles.roleCompanyRow}>
                            <Briefcase size={10} color="#64748B" />
                            <Text style={styles.roleCompanyText} numberOfLines={1}>
                              {mentor.role} • {mentor.company}
                            </Text>
                         </View>
                      </View>
                   </View>
                   <View style={styles.availBadge}>
                      <Text style={styles.availText}>Available</Text>
                   </View>
                </View>

                {/* Expertise Tags */}
                <View style={styles.tagsContainer}>
                   {mentor.expertise.map((exp, idx) => (
                     <View key={idx} style={styles.tagBadge}>
                        <Text style={styles.tagText}>{exp}</Text>
                     </View>
                   ))}
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                   <View style={styles.statItem}>
                      <Star size={14} color="#FBBF24" fill="#FBBF24" />
                      <Text style={styles.ratingText}>{mentor.rating}</Text>
                      <Text style={styles.sessionsText}>({mentor.sessions})</Text>
                   </View>
                   <View style={styles.statDivider} />
                   <View style={styles.statItem}>
                      <Clock size={14} color="#94A3B8" />
                      <Text style={styles.rateText}>{mentor.hourlyRate}</Text>
                   </View>
                </View>

                {/* Next Available */}
                <View style={styles.nextAvailBox}>
                   <Calendar size={14} color="#64748B" />
                   <Text style={styles.nextAvailLabel}>Next available: </Text>
                   <Text style={styles.nextAvailValue}>{mentor.availability}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                   <TouchableOpacity style={styles.bookButton}>
                      <Text style={styles.bookButtonText}>Book Session</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.iconButton}>
                      <ChevronRight size={18} color="#64748B" />
                   </TouchableOpacity>
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
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
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
    marginTop: 2,
  },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 24, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#1E293B', fontWeight: '500' },
  filterButton: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  
  listContainer: { gap: 16 },
  mentorCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  mentorInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  mentorDetails: { flex: 1 },
  mentorName: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  roleCompanyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roleCompanyText: { fontSize: 11, fontWeight: '600', color: '#64748B', flexShrink: 1 },
  
  availBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  availText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  tagText: { fontSize: 10, fontWeight: '600', color: '#475569' },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  sessionsText: { fontSize: 11, fontWeight: '500', color: '#94A3B8' },
  statDivider: { width: 1, height: 12, backgroundColor: '#E2E8F0' },
  rateText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  
  nextAvailBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, marginBottom: 16 },
  nextAvailLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  nextAvailValue: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  
  actionsRow: { flexDirection: 'row', gap: 10 },
  bookButton: { flex: 1, backgroundColor: colors.accent.DEFAULT, paddingVertical: 12, borderRadius: 12, alignItems: 'center', shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  bookButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  iconButton: { width: 44, height: 44, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1.5, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

  footerSpacer: { height: 40 }
});
