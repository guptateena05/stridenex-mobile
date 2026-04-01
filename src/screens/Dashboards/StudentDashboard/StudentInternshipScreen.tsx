import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Briefcase, 
  Send, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Clock, 
  IndianRupee,
  ChevronRight,
  ShieldCheck,
  Bookmark,
  TrendingUp
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { StatsCard } from '@/components/dashboard/StatsCard';

const statsData = [
  { id: 1, title: "APPLIED", value: 14, icon: Send, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.08)" },
  { id: 2, title: "SHORTLISTED", value: 3, icon: CheckCircle2, color: "#10B981", bg: "rgba(16, 185, 129, 0.08)" },
  { id: 3, title: "INTERVIEWS", value: 1, icon: Calendar, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.08)" },
  { id: 4, title: "MATCHING", value: 14, icon: Briefcase, color: colors.accent.DEFAULT, bg: "rgba(255, 107, 0, 0.08)" },
];

const internships = [
  {
    id: 1,
    title: "Data Science Intern",
    company: "TCS iON",
    match: 91,
    location: "Pune/Hybrid",
    duration: "3 mo",
    stipend: "₹15k/mo",
    logo: "T",
    matchColor: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.15)"
  },
  {
    id: 2,
    title: "ML Engineering Intern",
    company: "Razorpay",
    match: 76,
    location: "Bengaluru",
    duration: "6 mo",
    stipend: "₹40k/mo",
    logo: "R",
    matchColor: colors.accent.DEFAULT,
    bgColor: "rgba(255, 107, 0, 0.08)",
    borderColor: "rgba(255, 107, 0, 0.15)"
  },
  {
    id: 3,
    title: "Analytics Intern",
    company: "Zepto",
    match: 84,
    location: "Mumbai",
    duration: "4 mo",
    stipend: "₹20k/mo",
    logo: "Z",
    matchColor: colors.accent.DEFAULT,
    bgColor: "rgba(255, 107, 0, 0.08)",
    borderColor: "rgba(255, 107, 0, 0.15)"
  },
  {
    id: 4,
    title: "Data Engineering Intern",
    company: "Freshworks",
    match: 88,
    location: "Chennai",
    duration: "3 mo",
    stipend: "₹25k/mo",
    logo: "F",
    matchColor: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.15)"
  },
  {
    id: 5,
    title: "Business Analytics Intern",
    company: "MakeMyTrip",
    match: 79,
    location: "Delhi",
    duration: "4 mo",
    stipend: "₹18k/mo",
    logo: "M",
    matchColor: colors.accent.DEFAULT,
    bgColor: "rgba(255, 107, 0, 0.08)",
    borderColor: "rgba(255, 107, 0, 0.15)"
  }
];

export const StudentInternshipScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Briefcase size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>CAREER OPPORTUNITIES</Text>
          </View>
          <Text style={styles.title}>Internships</Text>
          <Text style={styles.subtitle}>Find and apply to matching roles</Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInRight.delay(200)} style={styles.statsRow}>
           {statsData.map((stat) => (
             <StatsCard 
               key={stat.id}
               title={stat.title}
               value={stat.value}
               icon={stat.icon}
               color={stat.color}
             />
           ))}
        </Animated.View>

        {/* Matching Internships Section */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitleSimple}>Matching For You</Text>
           <TouchableOpacity style={styles.filterButton}>
              <TrendingUp size={14} color="#64748B" />
              <Text style={styles.filterText}>Relevance</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
           {internships.map((internship, index) => (
             <Animated.View 
               key={internship.id} 
               entering={FadeInUp.delay(300 + index * 100)}
               style={styles.internshipCard}
             >
                <View style={styles.cardTop}>
                   <View style={styles.companyInfo}>
                      <View style={[styles.companyLogo, { backgroundColor: internship.bgColor, borderColor: internship.borderColor }]}>
                         <Text style={[styles.logoText, { color: internship.matchColor }]}>{internship.logo}</Text>
                      </View>
                      <View>
                         <Text style={styles.jobTitle}>{internship.title}</Text>
                         <Text style={styles.companyName}>{internship.company}</Text>
                      </View>
                   </View>
                   <View style={styles.matchBadge}>
                      <Text style={[styles.matchValue, { color: internship.matchColor }]}>{internship.match}%</Text>
                      <Text style={styles.matchLabel}>MATCH</Text>
                   </View>
                </View>

                <View style={styles.badgeRow}>
                   <View style={styles.infoBadge}>
                      <MapPin size={10} color="#64748B" />
                      <Text style={styles.badgeText}>{internship.location}</Text>
                   </View>
                   <View style={styles.infoBadge}>
                      <Clock size={10} color="#64748B" />
                      <Text style={styles.badgeText}>{internship.duration}</Text>
                   </View>
                   <View style={[styles.infoBadge, { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.1)' }]}>
                      <IndianRupee size={10} color="#059669" />
                      <Text style={[styles.badgeText, { color: '#059669', fontWeight: '700' }]}>{internship.stipend}</Text>
                   </View>
                </View>

                <View style={styles.cardActions}>
                   <TouchableOpacity style={styles.applyButton}>
                      <Text style={styles.applyButtonText}>Apply Now</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.detailsButton}>
                      <Text style={styles.detailsButtonText}>Details</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.bookmarkButton}>
                      <Bookmark size={18} color="#64748B" />
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleSimple: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  listContainer: {
    gap: 16,
  },
  internshipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  matchBadge: {
    alignItems: 'flex-end',
  },
  matchValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  matchLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.accent.DEFAULT,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSpacer: {
    height: 40,
  }
});
