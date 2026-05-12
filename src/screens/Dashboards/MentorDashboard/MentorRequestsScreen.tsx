import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Inbox, 
  MapPin, 
  Clock, 
  ChevronRight,
  TrendingDown,
  UserCheck
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const requestsData = [
  {
    id: 'req1',
    initials: 'AK',
    name: 'Aisha Khan',
    topic: 'PM Interview Prep',
    course: 'Product Management',
    status: 'Pending',
    date: 'Today',
    duration: '45 mins',
    match: 92,
    color: '#FCE7F3',
    textColor: '#BE185D'
  },
  {
    id: 'req2',
    initials: 'RM',
    name: 'Rahul Mehta',
    topic: 'DSA Mock Interview',
    course: 'SDE Preparation',
    status: 'Pending',
    date: 'Tomorrow',
    duration: '60 mins',
    match: 88,
    color: '#DBEAFE',
    textColor: '#1D4ED8'
  },
  {
    id: 'req3',
    initials: 'SK',
    name: 'Suresh Krishnan',
    topic: 'System Design for Senior Roles',
    course: 'Backend Engineering',
    status: 'Pending',
    date: 'Thursday',
    duration: '45 mins',
    match: 81,
    color: '#F3E8FF',
    textColor: '#7E22CE'
  },
  {
    id: 'req4',
    initials: 'NT',
    name: 'Neha Thakur',
    topic: 'Resume Architecture',
    course: 'Frontend Mastery',
    status: 'Pending',
    date: 'Saturday',
    duration: '30 mins',
    match: 75,
    color: '#ECFDF5',
    textColor: '#047857'
  }
];

export const MentorRequestsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Inbox</Text>
            <View style={styles.headerBadge}>
              <Inbox size={10} color="#4c1d95" />
              <Text style={styles.headerBadgeText}>MEETING REQUESTS</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Review and manage session requests</Text>
        </Animated.View>

        <View style={styles.list}>
          {requestsData.map((req, i) => (
            <Animated.View key={req.id} entering={FadeInUp.delay(100 + i * 50)} style={styles.requestCard}>
              <View style={styles.cardHeader}>
                <View style={styles.userIntro}>
                  <View style={[styles.avatar, { backgroundColor: req.color }]}>
                    <Text style={[styles.avatarText, { color: req.textColor }]}>{req.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{req.name}</Text>
                    <Text style={styles.userCourse}>{req.course}</Text>
                  </View>
                </View>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchValue}>{req.match}%</Text>
                  <Text style={styles.matchLabel}>MATCH</Text>
                </View>
              </View>

              <View style={styles.topicBox}>
                <Text style={styles.topicLabel}>Requested Topic</Text>
                <Text style={styles.topicValue}>{req.topic}</Text>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.detailText}>{req.date} • {req.duration}</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.acceptBtn}>
                  <Text style={styles.acceptBtnText}>Accept Request</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn}>
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
        </View>

        {requestsData.length === 0 && (
          <View style={styles.emptyState}>
            <Inbox size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptySub}>No pending requests to review.</Text>
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  list: { gap: 16 },
  requestCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  userIntro: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800' },
  userName: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  userCourse: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  matchBadge: { alignItems: 'flex-end' },
  matchValue: { fontSize: 18, fontWeight: '900', color: '#10B981' },
  matchLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8' },

  topicBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16 },
  topicLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: 4 },
  topicValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },

  detailsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  detailText: { fontSize: 11, fontWeight: '700', color: '#475569' },

  actionsRow: { flexDirection: 'row', gap: 12 },
  acceptBtn: { flex: 1, backgroundColor: '#4c1d95', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  acceptBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  declineBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  declineBtnText: { color: '#64748B', fontSize: 14, fontWeight: '700' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 12, marginBottom: 4 },
  emptySub: { fontSize: 14, color: '#64748B', fontWeight: '500' },

  footerSpacer: { height: 40 }
});
