import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Calendar, Plus, FileText, Bell, Users, Trophy, ChevronRight, Clock } from 'lucide-react-native';

const events = [
  { type: "Hackathon", title: "HackIndia 2025", date: "Mar 15-17", participants: "150+ colleges", prize: "₹5 Lakhs", prizeIcon: "🏆", daysLeft: 12, color: "#F59E0B" },
  { type: "Competition", title: "DataFest National", date: "Apr 2-3", participants: "80+ colleges", prize: "₹2 Lakhs", prizeIcon: "🏆", daysLeft: 28, color: "#10B981" },
  { type: "Startup", title: "Startup Pitch Battle", date: "Mar 25", participants: "All colleges", prize: "₹10 Lakhs", prizeIcon: "🎖", daysLeft: 20, color: "#10B981" },
];

const notices = [
  { category: "Placement", title: "VJTI-TCS iON Internship Drive", date: "Feb 24", urgent: true, color: "#F59E0B" },
  { category: "Academic", title: "NEP 2020 Workshop: Credit Transfer", date: "Feb 23", urgent: true, color: "#10B981" },
  { category: "Events", title: "HackIndia 2025 — Team Formation", date: "Feb 22", urgent: false, color: "#10B981" },
];

export const CollegeNoticeBoardScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Bell size={10} color="#059669" />
            <Text style={styles.headerBadgeText}>NOTICE BOARD</Text>
          </View>
          <View style={styles.headerTitleRow}>
            <View>
               <Text style={styles.title}>Announcements</Text>
               <Text style={styles.subtitle}>Institutional events and digital notices</Text>
            </View>
            <TouchableOpacity style={styles.createBtn}>
               <Plus size={16} color="#FFF" />
               <Text style={styles.createBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Featured Events Section */}
        <View style={styles.sectionTitleRow}>
           <Text style={styles.sectionLabel}>ACTIVE EVENTS & COMPETITIONS</Text>
        </View>

        <View style={styles.eventsStack}>
          {events.map((event, idx) => (
            <Animated.View key={idx} entering={FadeInRight.delay(100 + idx * 50)}>
               <Card style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                     <View style={[styles.typeBadge, { backgroundColor: event.color + '10' }]}>
                        <Text style={[styles.typeBadgeText, { color: event.color }]}>{event.type}</Text>
                     </View>
                     <View style={styles.daysBadge}>
                        <Clock size={10} color="#64748B" />
                        <Text style={styles.daysBadgeText}>{event.daysLeft} DAYS LEFT</Text>
                     </View>
                  </View>
                  
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  
                  <View style={styles.eventMetaRow}>
                     <View style={styles.metaItem}>
                        <Calendar size={12} color="#64748B" />
                        <Text style={styles.metaLabelText}>{event.date}</Text>
                     </View>
                     <View style={styles.metaDivider} />
                     <View style={styles.metaItem}>
                        <Users size={12} color="#64748B" />
                        <Text style={styles.metaLabelText}>{event.participants}</Text>
                     </View>
                  </View>

                  <View style={styles.prizeHighlight}>
                     <View style={styles.prizeIconBox}>
                        <Trophy size={16} color="#F59E0B" />
                     </View>
                     <View>
                        <Text style={styles.prizeLabel}>TOTAL PRIZE POOL</Text>
                        <Text style={styles.prizeAmount}>{event.prize}</Text>
                     </View>
                  </View>

                  <View style={styles.eventActions}>
                     <TouchableOpacity style={styles.applyBtn}>
                        <Text style={styles.applyBtnText}>Register Now</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.detailsBtn}>
                        <Text style={styles.detailsBtnText}>Details</Text>
                     </TouchableOpacity>
                  </View>
               </Card>
            </Animated.View>
          ))}
        </View>

        {/* Digital Notice Board Ledger */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <FileText color="#64748B" size={18} />
            <Text style={styles.sectionTitle}>Digital Notice Board</Text>
          </View>
          
          <View style={styles.listContainer}>
            {notices.map((notice, idx) => (
              <View key={idx} style={[styles.noticeRow, idx === notices.length - 1 && styles.noBorder]}>
                <View style={[styles.noticeIndicator, { backgroundColor: notice.color }]} />
                <View style={styles.noticeInfo}>
                   <View style={styles.noticeTopRow}>
                      <Text style={styles.noticeCategory}>{notice.category}</Text>
                      <Text style={styles.noticeDate}>{notice.date}</Text>
                   </View>
                   <Text style={styles.noticeText} numberOfLines={2}>{notice.title}</Text>
                </View>
                {notice.urgent && (
                   <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>URGENT</Text>
                   </View>
                )}
                <ChevronRight size={14} color="#CBD5E1" />
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.viewArchiveBtn}>
             <Text style={styles.viewArchiveText}>View All Notices Archive</Text>
          </TouchableOpacity>
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  
  header: { marginBottom: 24, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  headerTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0F172A', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  createBtnText: { fontSize: 12, fontWeight: '800', color: '#FFF' },

  sectionTitleRow: { marginBottom: 12, paddingHorizontal: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },

  eventsStack: { gap: 16, marginBottom: 24 },
  eventCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  daysBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  daysBadgeText: { fontSize: 8, fontWeight: '800', color: '#64748B' },
  
  eventTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 12, fontFamily: typography.fontFamily.display },
  
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaLabelText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' },

  prizeHighlight: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  prizeIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  prizeLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  prizeAmount: { fontSize: 16, fontWeight: '800', color: '#1E293B' },

  eventActions: { flexDirection: 'row', gap: 12 },
  applyBtn: { flex: 1, backgroundColor: '#059669', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  applyBtnText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  detailsBtn: { flex: 0.4, backgroundColor: '#FFF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  detailsBtnText: { fontSize: 14, fontWeight: '700', color: '#64748B' },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },

  listContainer: { gap: 0 },
  noticeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  noticeIndicator: { width: 3, height: 32, borderRadius: 2, marginRight: 12 },
  noticeInfo: { flex: 1, marginRight: 8 },
  noticeTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  noticeCategory: { fontSize: 10, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  noticeDate: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  noticeText: { fontSize: 14, fontWeight: '600', color: '#1E293B', lineHeight: 20 },
  
  urgentBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  urgentText: { fontSize: 8, fontWeight: '800', color: '#EF4444' },

  viewArchiveBtn: { alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  viewArchiveText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' }
});
