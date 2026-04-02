import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuth } from '@/context/AuthContext';
import { RoleBannerWidget } from '@/components/dashboard/RoleBannerWidget';
import { 
  GraduationCap, 
  Calendar, 
  Star, 
  IndianRupee,
  Clock,
  Video,
  ChevronRight,
  TrendingUp,
  FileText,
  CheckCircle,
  Activity,
  AlertCircle,
  LayoutDashboard,
  Award
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { StatsCard } from '@/components/dashboard/StatsCard';

const overviewStats = [
  { label: "STUDENTS MENTORED", value: "247", icon: GraduationCap, color: "#EA580C" },
  { label: "SESSIONS MONTHLY", value: "18", icon: Calendar, color: "#3B82F6" },
  { label: "AVERAGE RATING", value: "4.9/5", icon: Star, color: "#EAB308" },
  { label: "PENDING PAYOUT", value: "₹18.3k", icon: IndianRupee, color: "#10B981" }
];

const upcomingSessions = [
  { id: "PS", initials: "PS", name: "Priya Sharma", topic: "ML Project Milestone", date: "Feb 26 4 PM", duration: "60m", type: "Technical", color: "#F97316" },
  { id: "AN", initials: "AN", name: "Arjun Nair", topic: "FAANG Prep", date: "Feb 27 3 PM", duration: "45m", type: "Career", color: "#3B82F6" },
  { id: "TG", initials: "TG", name: "Tanya Gupta", topic: "Data Science Roadmap", date: "Mar 1 12 PM", duration: "60m", type: "Career", color: "#10B981" }
];

const pendingRequests = [
  { initials: "AK", name: "Aisha Khan", topic: "PM Intro", priority: "high", color: "#FCE7F3", textColor: "#BE185D" },
  { initials: "RM", name: "Rahul Mehta", topic: "DSA Mock Interview", priority: "medium", color: "#DBEAFE", textColor: "#1D4ED8" },
];

const verifyQueue = [
  { name: "Priya Sharma", skill: "Machine Learning", priority: "normal", color: "#94A3B8" },
  { name: "Arjun Nair", skill: "System Design", priority: "high", color: "#EF4444" },
];

export const MentorDashboardScreen = () => {
  const { userFullName } = useAuth();
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.content}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
            <View style={styles.headerBadge}>
              <LayoutDashboard size={10} color="#4c1d95" />
              <Text style={styles.headerBadgeText}>DASHBOARD SUMMARY</Text>
            </View>
            <Text style={styles.title}>Overview</Text>
            <Text style={styles.subtitle}>Here is your mentorship overview today</Text>
          </Animated.View>

          {/* Banner */}
          <Animated.View entering={FadeInUp.delay(100)} style={{ marginBottom: 24 }}>
            <RoleBannerWidget 
              fullName={userFullName || 'Mentorship Team'} 
              date="Wednesday, 01 April"
              role="Senior Data Scientist @ Amazon"
              progress={100}
              theme="mentor"
              metrics={[
                { label: 'TOTAL STUDENTS', value: '247', iconName: 'Users' },
                { label: 'SESSIONS DONE', value: '18', iconName: 'Calendar' },
                { label: 'AVG RATING', value: '4.9', iconName: 'Award' }
              ]}
            />
          </Animated.View>

          {/* Stats Row */}
          <Animated.View entering={FadeInRight.delay(150)} style={styles.statsRow}>
            {overviewStats.map((stat, i) => (
               <StatsCard key={i} title={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
            ))}
          </Animated.View>

          {/* Upcoming Sessions Card */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Calendar size={18} color="#64748B" />
                <Text style={styles.cardTitle}>Upcoming Sessions</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>Manage <ChevronRight size={14} /></Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.sessionList}>
              {upcomingSessions.map((session, i) => (
                <View key={i} style={styles.sessionItem}>
                  <View style={styles.sessionTopRow}>
                    <View style={styles.sessionInfoGroup}>
                      <View style={[styles.avatar, { backgroundColor: session.color }]}>
                        <Text style={styles.avatarText}>{session.initials}</Text>
                      </View>
                      <View>
                        <Text style={styles.sessionName}>{session.name}</Text>
                        <Text style={styles.sessionTopic}>{session.topic}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.sessionTagsRow}>
                    <View style={styles.tag}>
                      <Calendar size={12} color="#64748B" />
                      <Text style={styles.tagText}>{session.date}</Text>
                    </View>
                    <View style={styles.tag}>
                      <Clock size={12} color="#64748B" />
                      <Text style={styles.tagText}>{session.duration}</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                      <Text style={[styles.tagText, { color: '#2563EB', fontWeight: '800' }]}>{session.type}</Text>
                    </View>
                  </View>

                  <View style={styles.sessionActions}>
                    <TouchableOpacity style={styles.joinBtn}>
                      <Text style={styles.joinBtnText}>Join</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rescheduleBtn}>
                      <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Split Row for Earnings / Requests */}
          <Animated.View entering={FadeInUp.delay(250)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={styles.earningsIconBox}>
                  <IndianRupee size={16} color="#059669" />
                </View>
                <Text style={styles.cardTitle}>Feb Earnings</Text>
              </View>
            </View>
            <View style={styles.earningsContent}>
              <Text style={styles.earningsValue}>₹18,360</Text>
              <Text style={styles.earningsSub}>Net payout • Processing Mar 1</Text>
              
              <View style={styles.earningsLedger}>
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Gross Earned</Text>
                  <Text style={styles.ledgerValNormal}>₹21,600</Text>
                </View>
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Commission (15%)</Text>
                  <Text style={styles.ledgerValDanger}>-₹3,240</Text>
                </View>
                <View style={[styles.ledgerRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 4 }]}>
                  <Text style={styles.ledgerLabelBold}>Net to Bank</Text>
                  <Text style={styles.ledgerValSuccess}>₹18,360</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Video size={18} color="#F97316" />
                <Text style={styles.cardTitle}>Pending Requests</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All <ChevronRight size={14} /></Text>
              </TouchableOpacity>
            </View>
            <View style={styles.requestsList}>
              {pendingRequests.map((req, i) => (
                <View key={i} style={styles.requestItem}>
                  <View style={styles.requestIntro}>
                    <View style={[styles.reqAvatar, { backgroundColor: req.color }]}>
                      <Text style={[styles.reqAvatarText, { color: req.textColor }]}>{req.initials}</Text>
                    </View>
                    <View>
                      <Text style={styles.reqName}>{req.name}</Text>
                      <Text style={styles.reqTopic}>{req.topic}</Text>
                    </View>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: req.priority === 'high' ? '#FEF2F2' : '#FFFBEB' }]}>
                    <Text style={[styles.priorityText, { color: req.priority === 'high' ? '#DC2626' : '#D97706' }]}>{req.priority}</Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.reviewBtn}>
              <Text style={styles.reviewBtnText}>2 Pending — Review Now</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(350)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <CheckCircle size={18} color="#64748B" />
                <Text style={styles.cardTitle}>Skill Verify Queue</Text>
              </View>
            </View>
            <View style={styles.requestsList}>
              {verifyQueue.map((item, i) => (
                <View key={i} style={styles.requestItem}>
                  <View style={styles.requestIntro}>
                    <AlertCircle size={18} color={item.color} />
                    <View>
                      <Text style={styles.reqName}>{item.name}</Text>
                      <Text style={styles.reqTopic}>{item.skill}</Text>
                    </View>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: item.priority === 'high' ? '#FEF2F2' : '#F8FAFC' }]}>
                    <Text style={[styles.priorityText, { color: item.priority === 'high' ? '#DC2626' : '#64748B' }]}>{item.priority}</Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: '#4c1d95' }]}>
              <Text style={styles.reviewBtnText}>4 Awaiting Review</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* This Month Summary */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.activityCard}>
            <View style={styles.activityHeader}>
               <Activity size={16} color="#3B82F6" />
               <Text style={styles.activityTitle}>This Month</Text>
            </View>
            <View style={styles.activityList}>
               {[
                 { label: "Sessions completed", value: "18", icon: Calendar },
                 { label: "5-star reviews", value: "14", icon: Award },
                 { label: "Notes shared", value: "22", icon: FileText },
                 { label: "Skills verified", value: "6", icon: CheckCircle },
                 { label: "Hours mentored", value: "21h", icon: Clock },
                 { label: "Profile views", value: "840", icon: Activity }
               ].map((stat, idx) => (
                 <View key={idx} style={styles.activityRow}>
                   <View style={styles.activityLeft}>
                     <stat.icon size={16} color="#94A3B8" />
                     <Text style={styles.activityLabel}>{stat.label}</Text>
                   </View>
                   <Text style={styles.activityValue}>{stat.value}</Text>
                 </View>
               ))}
            </View>
          </Animated.View>

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
  
  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24 },

  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  viewAllText: { fontSize: 13, fontWeight: '700', color: '#2563EB', flexDirection: 'row', alignItems: 'center' },
  
  sessionList: { gap: 16 },
  sessionItem: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  sessionTopRow: { marginBottom: 12 },
  sessionInfoGroup: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  sessionName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  sessionTopic: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  sessionTagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  tagText: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  sessionActions: { flexDirection: 'row', gap: 8 },
  joinBtn: { flex: 1, backgroundColor: '#4c1d95', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  joinBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  rescheduleBtn: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  rescheduleBtnText: { color: '#475569', fontSize: 13, fontWeight: '700' },

  earningsIconBox: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  earningsContent: { alignItems: 'center' },
  earningsValue: { fontSize: 36, fontWeight: '900', color: '#10B981', letterSpacing: -1, marginBottom: 4 },
  earningsSub: { fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 24 },
  earningsLedger: { width: '100%', gap: 12 },
  ledgerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ledgerLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  ledgerLabelBold: { fontSize: 13, color: '#1E293B', fontWeight: '800' },
  ledgerValNormal: { fontSize: 13, color: '#1E293B', fontWeight: '600' },
  ledgerValDanger: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
  ledgerValSuccess: { fontSize: 14, color: '#10B981', fontWeight: '800' },

  requestsList: { gap: 16, marginBottom: 20 },
  requestItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  requestIntro: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  reqAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reqAvatarText: { fontSize: 12, fontWeight: '800' },
  reqName: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  reqTopic: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  
  reviewBtn: { backgroundColor: '#4c1d95', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  reviewBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  activityCard: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 20 },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 12 },
  activityTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  activityList: { gap: 12 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activityLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  activityValue: { fontSize: 14, fontWeight: '800', color: '#0F172A' },

  footerSpacer: { height: 40 }
});
