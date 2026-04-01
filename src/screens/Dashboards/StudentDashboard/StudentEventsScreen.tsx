import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee,
  Clock,
  Trophy,
  Bell,
  Megaphone,
  ChevronRight,
  Sparkles,
  Eye
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

// Events data
const events = [
  { id: 1, title: "Hackathon", type: "Hackathon", daysLeft: 12, date: "Mar 15–17", participants: "150+ colleges", prize: "5 Lakhs", color: colors.accent.DEFAULT, bgColor: "rgba(255, 107, 0, 0.08)", borderColor: "rgba(255, 107, 0, 0.2)", icon: Trophy },
  { id: 2, title: "DataFest National", type: "Competition", daysLeft: 0, date: "Apr 2–3", participants: "80+ colleges", prize: "2 Lakhs", color: "#2563EB", bgColor: "rgba(37, 99, 235, 0.08)", borderColor: "rgba(37, 99, 235, 0.2)", icon: Trophy },
  { id: 3, title: "Startup Pitch Battle", type: "Pitch Battle", daysLeft: 20, date: "Mar 25", participants: "All colleges", prize: "10 Lakhs", color: "#9333EA", bgColor: "rgba(147, 51, 234, 0.08)", borderColor: "rgba(147, 51, 234, 0.2)", icon: Trophy },
  { id: 4, title: "Case Study Champions", type: "Case Study", daysLeft: 0, date: "Apr 10", participants: "60+ colleges", prize: "Internships", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.2)", icon: Trophy }
];

// Notice board data
const notices = [
  { id: 1, title: "VJTI-TCS iON Internship Drive – Applications Open", category: "Placement", date: "Feb 24", icon: Bell, color: "#2563EB" },
  { id: 2, title: "HackIndia 2025 – Team Formation Begins", category: "Events", date: "Feb 22", icon: Megaphone, color: colors.accent.DEFAULT },
  { id: 3, title: "NEP 2020 Workshop: Credit Transfer & ABC Portal", category: "Academic", date: "Feb 23", icon: Calendar, color: "#9333EA" },
  { id: 4, title: "UGC Equity Audit: Equal Opportunity Centre Open", category: "Compliance", date: "Feb 20", icon: Bell, color: "#10B981" }
];

export const StudentEventsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Calendar size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>HACKATHONS & MORE</Text>
          </View>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Inter-college hackathons and pitches</Text>
        </Animated.View>

        {/* Events List */}
        <View style={styles.listContainer}>
           {events.map((event, index) => (
             <Animated.View 
               key={event.id} 
               entering={FadeInUp.delay(200 + index * 100)}
               style={styles.eventCard}
             >
                <View style={styles.cardHeader}>
                   <View style={styles.eventInfo}>
                      <View style={[styles.iconBox, { backgroundColor: event.bgColor }]}>
                         <event.icon size={20} color={event.color} />
                      </View>
                      <View>
                         <Text style={styles.eventTitle}>{event.title}</Text>
                         <Text style={styles.eventType}>{event.type}</Text>
                      </View>
                   </View>
                   {event.daysLeft > 0 && (
                     <View style={[styles.daysLeftBadge, { backgroundColor: event.bgColor, borderColor: event.borderColor }]}>
                        <Clock size={10} color={event.color} />
                        <Text style={[styles.daysLeftText, { color: event.color }]}>{event.daysLeft} days left</Text>
                     </View>
                   )}
                </View>

                {/* Event Details */}
                <View style={styles.detailsRow}>
                   <View style={styles.detailItem}>
                      <Calendar size={14} color="#94A3B8" />
                      <Text style={styles.detailText}>{event.date}</Text>
                   </View>
                   <View style={styles.detailItem}>
                      <Users size={14} color="#94A3B8" />
                      <Text style={styles.detailText}>{event.participants}</Text>
                   </View>
                   <View style={styles.detailItem}>
                      <IndianRupee size={14} color="#94A3B8" />
                      <Text style={styles.prizeText}>{event.prize}</Text>
                   </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                   <TouchableOpacity style={styles.registerButton}>
                      <Text style={styles.registerButtonText}>Register Now</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.detailsButton}>
                      <Eye size={14} color="#64748B" />
                      <Text style={styles.detailsButtonText}>Details</Text>
                   </TouchableOpacity>
                </View>
             </Animated.View>
           ))}
        </View>

        {/* Digital Notice Board */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitleSimple}>Digital Notice Board</Text>
           <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
           </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInRight.delay(500)} style={styles.noticeContainer}>
           {notices.map((notice, index) => (
             <TouchableOpacity key={notice.id} style={styles.noticeItem}>
                <View style={[styles.noticeIconBox, { backgroundColor: `${notice.color}15` }]}>
                   <notice.icon size={16} color={notice.color} />
                </View>
                <View style={styles.noticeContent}>
                   <Text style={styles.noticeTitle} numberOfLines={2}>{notice.title}</Text>
                   <View style={styles.noticeMetaRow}>
                      <View style={styles.noticeBadge}>
                         <Text style={styles.noticeBadgeText}>{notice.category}</Text>
                      </View>
                      <Text style={styles.noticeDate}>{notice.date}</Text>
                   </View>
                </View>
                <ChevronRight size={16} color="#CBD5E1" />
             </TouchableOpacity>
           ))}
        </Animated.View>

        {/* Featured Event Banner */}
        <Animated.View entering={FadeInUp.delay(600)}>
           <View style={[styles.featuredBanner, { backgroundColor: '#FFF7ED' }]}>
              <View style={styles.featuredHeader}>
                 <View style={styles.featuredIconContainer}>
                    <Sparkles size={24} color={colors.accent.DEFAULT} />
                 </View>
                 <View>
                    <Text style={styles.featuredTitle}>Tech Summit 2025</Text>
                    <Text style={styles.featuredSubtitle}>India's largest student tech conference</Text>
                    <View style={styles.featuredMetaRow}>
                       <View style={styles.featuredDetail}>
                          <Calendar size={12} color="#64748B" />
                          <Text style={styles.featuredDetailText}>Apr 5-7</Text>
                       </View>
                       <View style={styles.featuredDetail}>
                          <Users size={12} color="#64748B" />
                          <Text style={styles.featuredDetailText}>500+ colleges</Text>
                       </View>
                    </View>
                 </View>
              </View>
              <View style={styles.featuredActions}>
                 <TouchableOpacity style={styles.featuredDetailsButton}>
                    <Eye size={14} color={colors.accent.DEFAULT} />
                    <Text style={styles.featuredDetailsText}>Details</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.featuredRegisterButton}>
                    <Text style={styles.featuredRegisterText}>Register</Text>
                 </TouchableOpacity>
              </View>
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
  
  listContainer: { gap: 16, marginBottom: 32 },
  eventCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  eventInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  eventType: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  daysLeftBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  daysLeftText: { fontSize: 10, fontWeight: '800' },
  
  detailsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  prizeText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  
  actionsRow: { flexDirection: 'row', gap: 10 },
  registerButton: { flex: 1, backgroundColor: colors.accent.DEFAULT, paddingVertical: 12, borderRadius: 12, alignItems: 'center', shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  registerButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  detailsButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', backgroundColor: '#F8FAFC', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#F1F5F9', alignItems: 'center', gap: 6 },
  detailsButtonText: { color: '#475569', fontSize: 13, fontWeight: '700' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitleSimple: { fontSize: 14, fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5 },
  viewAllText: { fontSize: 12, fontWeight: '700', color: colors.accent.DEFAULT },
  
  noticeContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 8, borderWidth: 1.5, borderColor: '#F1F5F9', marginBottom: 32 },
  noticeItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noticeIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  noticeContent: { flex: 1 },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  noticeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noticeBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  noticeBadgeText: { fontSize: 9, fontWeight: '600', color: '#64748B' },
  noticeDate: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },
  
  featuredBanner: { borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#FFEDD5', } ,
  featuredHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 20 },
  featuredIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 107, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
  featuredTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  featuredSubtitle: { fontSize: 13, color: '#475569', fontWeight: '500', marginBottom: 12 },
  featuredMetaRow: { flexDirection: 'row', gap: 16 },
  featuredDetail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featuredDetailText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  
  featuredActions: { flexDirection: 'row', gap: 10 },
  featuredDetailsButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', backgroundColor: '#FFFFFF', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FFEDD5', alignItems: 'center', gap: 6 },
  featuredDetailsText: { color: colors.accent.DEFAULT, fontSize: 13, fontWeight: '800' },
  featuredRegisterButton: { flex: 1, backgroundColor: colors.accent.DEFAULT, paddingVertical: 12, borderRadius: 12, alignItems: 'center', shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  featuredRegisterText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  footerSpacer: { height: 40 }
});
