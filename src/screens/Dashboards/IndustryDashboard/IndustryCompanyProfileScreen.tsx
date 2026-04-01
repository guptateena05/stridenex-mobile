import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Building2, 
  Edit3,
  Monitor,
  Star,
  Globe,
  MapPin,
  Layers,
  Target,
  Users,
  Zap,
  ShieldCheck,
  Factory,
  GraduationCap,
  Plus
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const skillDomains = [
  { id: "engineering", title: "Engineering", color: "#2563EB", bg: "#EFF6FF", borderColor: "#DBEAFE", openings: 24, tags: ["Python", "Go", "React", "Docker"], roles: "Backend • Frontend • ML" },
  { id: "datascience", title: "Data Science", color: "#9333EA", bg: "#FAF5FF", borderColor: "#F3E8FF", openings: 8, tags: ["Python", "SQL", "Statistics"], roles: "Data Scientist • ML Researcher" },
  { id: "product", title: "Product", color: "#EA580C", bg: "#FFF7ED", borderColor: "#FFEDD5", openings: 5, tags: ["Strategy", "SQL", "Figma"], roles: "Product Manager • Analyst" }
];

const companyStats = [
  { label: "Industry", value: "Fintech", icon: Layers, color: "#3B82F6", bg: "#EFF6FF" },
  { label: "Size", value: "2,000+", icon: Users, color: "#F97316", bg: "#FFF7ED" },
  { label: "HQ", value: "Bengaluru", icon: MapPin, color: "#10B981", bg: "#ECFDF5" },
  { label: "Website", value: "razorpay.com", icon: Globe, color: "#6366F1", bg: "#EEF2FF" },
  { label: "Stage", value: "Series F Unicorn", icon: Star, color: "#F59E0B", bg: "#FFFBEB" },
  { label: "CIN", value: "U74999KA2013", icon: ShieldCheck, color: "#475569", bg: "#F1F5F9" },
];

export const IndustryCompanyProfileScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
           <View style={styles.headerBadge}>
              <Building2 size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>COMPANY DETAILS</Text>
           </View>
           <Text style={styles.title}>Profile</Text>
           <Text style={styles.subtitle}>Manage your employer branding and details</Text>
        </Animated.View>

        {/* Banner */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.heroBanner}>
           <View style={styles.heroGlow} />
           
           <View style={styles.heroTopRow}>
              <View style={styles.companyLogoFrame}>
                 <View style={styles.companyLogoInner} />
              </View>
              <TouchableOpacity style={styles.editBtn}>
                 <Edit3 size={16} color="#0F172A" />
              </TouchableOpacity>
           </View>

           <View style={styles.heroInfo}>
              <View style={styles.heroTitleRow}>
                 <Text style={styles.heroTitle}>Razorpay Tech</Text>
                 <View style={styles.verifiedBadge}>
                    <ShieldCheck size={10} color="#FFF" />
                    <Text style={styles.verifiedText}>VERIFIED</Text>
                 </View>
              </View>
              <Text style={styles.heroSub}>Bengaluru, India • Fintech • 2,000+ Team</Text>
           </View>

           <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                 <Text style={styles.heroStatValue}>44</Text>
                 <Text style={styles.heroStatLabel}>OPEN ROLES</Text>
              </View>
              <View style={styles.heroStatItem}>
                 <Text style={[styles.heroStatValue, { color: '#FCD34D' }]}>4.1</Text>
                 <Text style={styles.heroStatLabel}>RATING</Text>
              </View>
              <View style={styles.heroStatItem}>
                 <Text style={[styles.heroStatValue, { color: '#34D399' }]}>247</Text>
                 <Text style={styles.heroStatLabel}>HIRED</Text>
              </View>
           </View>
        </Animated.View>

        {/* Overview section */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.card}>
           <View style={styles.cardHeader}>
              <View style={styles.iconSquare}>
                 <Zap size={14} color="#FFF" />
              </View>
              <Text style={styles.cardTitleText}>COMPANY OVERVIEW</Text>
           </View>

           <View style={styles.missionContainer}>
              <Text style={styles.missionLabel}>THE MISSION</Text>
              <Text style={styles.missionText}>
                 Razorpay is India's leading payments infrastructure platform, enabling businesses of all sizes to accept, process, and disburse payments. We are building the financial ecosystem for Internet businesses.
              </Text>
           </View>

           <View style={styles.companyStatsGrid}>
              {companyStats.map((stat, idx) => (
                 <View key={idx} style={styles.companyStatCard}>
                    <View style={styles.companyStatTop}>
                       <View style={[styles.companyStatIcon, { backgroundColor: stat.bg }]}>
                          <stat.icon size={12} color={stat.color} />
                       </View>
                       <Text style={styles.companyStatLabel}>{stat.label}</Text>
                    </View>
                    <Text style={styles.companyStatValue} numberOfLines={1}>{stat.value}</Text>
                 </View>
              ))}
           </View>
        </Animated.View>

        {/* Skill Domains */}
        <Animated.View entering={FadeInUp.delay(300)}>
           <View style={styles.sectionTitleRow}>
              <Target size={18} color="#EF4444" />
              <Text style={styles.cardTitleText}>SKILL DOMAINS</Text>
           </View>
           
           <View style={styles.domainsGrid}>
              {skillDomains.map(domain => (
                 <View key={domain.id} style={[styles.domainCard, { backgroundColor: domain.bg, borderColor: domain.borderColor }]}>
                    <View style={styles.domainHeader}>
                       <View style={styles.domainTitleRow}>
                          <View style={[styles.domainDot, { backgroundColor: domain.color }]} />
                          <Text style={styles.domainTitle}>{domain.title}</Text>
                       </View>
                       <View style={[styles.domainBadge, { borderColor: domain.borderColor }]}>
                          <Text style={[styles.domainBadgeText, { color: domain.color }]}>{domain.openings} OPENINGS</Text>
                       </View>
                    </View>

                    <View style={styles.tagsContainer}>
                       {domain.tags.map(tag => (
                          <View key={tag} style={styles.tagPill}>
                             <Text style={styles.tagLabel}>{tag}</Text>
                          </View>
                       ))}
                    </View>

                    <View style={styles.rolesContainer}>
                       <Text style={styles.rolesLabel}>ROLES: <Text style={styles.rolesValue}>{domain.roles}</Text></Text>
                    </View>
                 </View>
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
  
  heroBanner: { backgroundColor: '#0F172A', borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden', marginBottom: 24 },
  heroGlow: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(59, 130, 246, 0.3)' },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, zIndex: 10 },
  companyLogoFrame: { width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  companyLogoInner: { flex: 1, backgroundColor: '#FACC15', borderRadius: 4 },
  editBtn: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  heroInfo: { zIndex: 10, marginBottom: 24 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  verifiedText: { fontSize: 9, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  heroSub: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  heroStatsRow: { flexDirection: 'row', gap: 12, zIndex: 10 },
  heroStatItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heroStatValue: { fontSize: 20, fontWeight: '900', color: '#60A5FA', marginBottom: 2 },
  heroStatLabel: { fontSize: 9, fontWeight: '900', color: '#64748B', letterSpacing: 1 },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  iconSquare: { width: 28, height: 28, backgroundColor: '#0F172A', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardTitleText: { fontSize: 12, fontWeight: '900', color: '#0F172A', letterSpacing: 1 },
  
  missionContainer: { marginBottom: 24 },
  missionLabel: { fontSize: 10, fontWeight: '900', color: '#2563EB', letterSpacing: 1.5, marginBottom: 8 },
  missionText: { fontSize: 14, color: '#334155', fontWeight: '600', lineHeight: 22 },

  companyStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  companyStatCard: { width: (width - 84) / 2, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 12 },
  companyStatTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  companyStatIcon: { padding: 6, borderRadius: 8 },
  companyStatLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  companyStatValue: { fontSize: 13, fontWeight: '900', color: '#0F172A' },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 4 },
  domainsGrid: { gap: 12 },
  domainCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderBottomWidth: 3 },
  domainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  domainTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  domainDot: { width: 10, height: 10, borderRadius: 5 },
  domainTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  domainBadge: { backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  domainBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagPill: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  tagLabel: { fontSize: 11, fontWeight: '800', color: '#334155' },
  rolesContainer: { backgroundColor: 'rgba(255,255,255,0.6)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  rolesLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  rolesValue: { color: '#0F172A' },

  footerSpacer: { height: 40 }
});
