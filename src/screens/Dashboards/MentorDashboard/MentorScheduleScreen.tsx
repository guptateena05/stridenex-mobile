import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Calendar, 
  Clock, 
  MoreHorizontal,
  Plus
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const scheduleData = [
  {
    day: 'Today',
    date: 'Feb 26',
    sessions: [
      { id: "1", name: "Priya Sharma", topic: "ML Project Milestone", time: "4:00 PM - 5:00 PM", type: "Technical", color: "#F97316" },
      { id: "2", name: "Rohan Verma", topic: "DSA: Trees & Graphs", time: "5:30 PM - 7:00 PM", type: "Technical", color: "#4c1d95" },
    ]
  },
  {
    day: 'Tomorrow',
    date: 'Feb 27',
    sessions: [
      { id: "3", name: "Arjun Nair", topic: "FAANG Prep Check-In", time: "3:00 PM - 3:45 PM", type: "Career", color: "#3B82F6" },
      { id: "4", name: "Tanya Gupta", topic: "System Design Prep", time: "5:00 PM - 6:00 PM", type: "Technical", color: "#4c1d95" }
    ]
  },
  {
    day: 'Friday',
    date: 'Feb 28',
    sessions: [
      { id: "5", name: "Rahul Singh", topic: "Resume Optimization", time: "10:00 AM - 10:45 AM", type: "Review", color: "#10B981" },
      { id: "6", name: "Aisha Khan", topic: "Product Management 101", time: "2:00 PM - 3:00 PM", type: "Career", color: "#F97316" }
    ]
  }
];

export const MentorScheduleScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Schedule</Text>
            <View style={styles.headerBadge}>
              <Calendar size={10} color="#4c1d95" />
              <Text style={styles.headerBadgeText}>YOUR SCHEDULE</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Manage availability and upcoming bookings</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={{ marginBottom: 24 }}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.primaryBtnText}>Update Availability</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.scheduleList}>
          {scheduleData.map((group, i) => (
            <Animated.View key={i} entering={FadeInUp.delay(150 + i * 50)} style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupDay}>{group.day}</Text>
                <Text style={styles.groupDate}>{group.date}</Text>
              </View>

              <View style={styles.sessionList}>
                {group.sessions.map((session, j) => (
                  <View key={session.id} style={styles.sessionCard}>
                    <View style={styles.sessionLeft}>
                      <View style={styles.timeLine}>
                        <View style={[styles.timeDot, { backgroundColor: session.color }]} />
                        {j < group.sessions.length - 1 && <View style={[styles.timeLineStick, { backgroundColor: `${session.color}30` }]} />}
                      </View>
                      <View style={styles.sessionBody}>
                        <Text style={styles.sessionTime}>{session.time}</Text>
                        <View style={styles.sessionInfoBox}>
                          <View style={styles.sessionTopRow}>
                            <Text style={styles.sessionName}>{session.name}</Text>
                            <TouchableOpacity>
                              <MoreHorizontal size={18} color="#94A3B8" />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.sessionTopic}>{session.topic}</Text>
                          <View style={styles.tag}>
                             <Text style={[styles.tagText, { color: session.color }]}>{session.type}</Text>
                          </View>
                          
                          <View style={styles.actionRow}>
                             <TouchableOpacity style={styles.joinBtn}>
                               <Text style={styles.joinBtnText}>Join Room</Text>
                             </TouchableOpacity>
                          </View>
                        </View>
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
  
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  primaryBtn: { backgroundColor: '#4c1d95', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, shadowColor: '#4c1d95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  primaryBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  scheduleList: { gap: 24 },
  groupCard: {},
  groupHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16, paddingLeft: 8 },
  groupDay: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  groupDate: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },

  sessionList: { gap: 0 },
  sessionCard: { flexDirection: 'row' },
  sessionLeft: { flexDirection: 'row', flex: 1 },
  timeLine: { width: 32, alignItems: 'center' },
  timeDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: '#F8FAFC', marginTop: 4, zIndex: 10 },
  timeLineStick: { width: 2, flex: 1, marginTop: -4, marginBottom: -16 },

  sessionBody: { flex: 1, paddingBottom: 24 },
  sessionTime: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  
  sessionInfoBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  sessionTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sessionName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  sessionTopic: { fontSize: 13, color: '#475569', fontWeight: '500', marginBottom: 12 },
  tag: { alignSelf: 'flex-start', backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16 },
  tagText: { fontSize: 10, fontWeight: '800' },

  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  joinBtn: { flex: 1, backgroundColor: '#4c1d95', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  joinBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  footerSpacer: { height: 40 }
});
