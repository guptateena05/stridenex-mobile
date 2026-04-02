import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  History, 
  Calendar, 
  Clock, 
  Star,
  FileText,
  Download
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const historyData = [
  {
    id: 's1',
    initials: 'NS',
    name: 'Neha Singh',
    topic: 'Product Management Intro',
    date: 'Feb 24, 2024',
    duration: '45 mins',
    rating: 5,
    review: 'Extremely helpful walkthrough of the PM interview process.',
    notesAvailable: true,
    color: '#8B5CF6'
  },
  {
    id: 's2',
    initials: 'VK',
    name: 'Varun Kumar',
    topic: 'DSA Array & Strings',
    date: 'Feb 21, 2024',
    duration: '60 mins',
    rating: 4,
    review: 'Good session, clarified my basic concepts.',
    notesAvailable: true,
    color: '#3B82F6'
  },
  {
    id: 's3',
    initials: 'AM',
    name: 'Aarti Mishra',
    topic: 'System Design: Rate Limiter',
    date: 'Feb 18, 2024',
    duration: '90 mins',
    rating: 5,
    review: 'Amazing deep dive. The mentor explained the architecture tradeoffs brilliantly!',
    notesAvailable: true,
    color: '#4c1d95'
  },
  {
    id: 's4',
    initials: 'RT',
    name: 'Rohan Tiwari',
    topic: 'Career Switch Prep',
    date: 'Feb 15, 2024',
    duration: '30 mins',
    rating: 5,
    review: 'Very encouraging and gave me a clear actionable roadmap for my career transition.',
    notesAvailable: false,
    color: '#10B981'
  }
];

export const MentorSessionHistoryScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerBadge}>
            <History size={10} color="#4c1d95" />
            <Text style={styles.headerBadgeText}>PAST SESSIONS</Text>
          </View>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Review past sessions and student feedback</Text>
        </Animated.View>

        <View style={styles.list}>
          {historyData.map((session, i) => (
            <Animated.View key={session.id} entering={FadeInUp.delay(100 + i * 50)} style={styles.historyCard}>
              <View style={styles.cardTopRow}>
                <View style={[styles.avatar, { backgroundColor: session.color }]}>
                  <Text style={styles.avatarText}>{session.initials}</Text>
                </View>
                <View style={styles.sessionMeta}>
                  <Text style={styles.sessionName}>{session.name}</Text>
                  <Text style={styles.sessionTopic}>{session.topic}</Text>
                </View>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateText}>{session.date}</Text>
                </View>
              </View>
              
              <View style={styles.logisticsRow}>
                <View style={styles.logisticsTag}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.logisticsText}>Duration: {session.duration}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  {[...Array(5)].map((_, idx) => (
                     <Star key={idx} size={12} fill={idx < session.rating ? "#F59E0B" : "#E2E8F0"} color={idx < session.rating ? "#F59E0B" : "#E2E8F0"} />
                  ))}
                  <Text style={styles.ratingDigit}>{session.rating}.0</Text>
                </View>
              </View>

              <View style={styles.reviewBox}>
                <Text style={styles.reviewQuote}>"{session.review}"</Text>
              </View>

              {session.notesAvailable && (
                <View style={styles.cardFooter}>
                  <TouchableOpacity style={styles.notesBtn}>
                    <FileText size={14} color="#2563EB" />
                    <Text style={styles.notesBtnText}>View Shared Notes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn}>
                    <Download size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
              )}
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
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },

  list: { gap: 16 },
  historyCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  sessionMeta: { flex: 1 },
  sessionName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  sessionTopic: { fontSize: 12, color: '#475569', fontWeight: '500' },
  dateBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  dateText: { fontSize: 10, fontWeight: '800', color: '#64748B' },

  logisticsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logisticsTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logisticsText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FEFCE8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FEF08A' },
  ratingDigit: { fontSize: 11, fontWeight: '900', color: '#B45309', marginLeft: 4 },

  reviewBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#CBD5E1', marginBottom: 16 },
  reviewQuote: { fontSize: 13, color: '#334155', fontStyle: 'italic', fontWeight: '500', lineHeight: 20 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  notesBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  notesBtnText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },

  footerSpacer: { height: 40 }
});
