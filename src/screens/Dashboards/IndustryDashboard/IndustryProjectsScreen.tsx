import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Plus, 
  Briefcase, 
  Trophy,
  Users,
  Microscope,
  Palette,
  Database,
  ArrowRight
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { StatsCard } from '@/components/dashboard/StatsCard';

const { width } = Dimensions.get('window');
const cardWidth = (width - 44) / 2;

const projectsStats = [
  { label: "ACTIVE PROJECTS", value: "5", icon: Microscope, color: "#9333EA" },
  { label: "TOTAL APPLICATIONS", value: "152", icon: Users, color: "#3B82F6" },
  { label: "STUDENTS AWARDED", value: "22", icon: Trophy, color: "#10B981" },
  { label: "CONVERTED TO PPO", value: "8", icon: Briefcase, color: "#F97316" },
];

const projects = [
  {
    id: 1,
    icon: Microscope,
    title: "AI-Powered Fraud Detection Engine",
    subtitle: "Risk & Payments • PRJ-2401",
    description: "Build an ML pipeline to detect real-time payment fraud using graph neural networks and anomaly detection.",
    tags: ["Python", "ML", "Statistics", "SQL"],
    badges: ["Open", "R&D"],
    metrics: { applied: 47, shortlisted: 8, award: "₹50,000", duration: "3 months" }
  },
  {
    id: 2,
    icon: Palette,
    title: "Payments Dashboard Redesign",
    subtitle: "Product Design • PRJ-2398",
    description: "Redesign our merchant payments dashboard with a focus on reducing cognitive load and improving conversion.",
    tags: ["Figma", "UX Research", "Prototyping"],
    badges: ["Shortlisting", "Design"],
    metrics: { applied: 31, shortlisted: 6, award: "Internship Offer", duration: "6 weeks" }
  },
  {
    id: 3,
    icon: Database,
    title: "Customer Churn Prediction Model",
    subtitle: "Data Science • PRJ-2391",
    description: "Develop a predictive model to identify high-risk customers based on transaction frequency and account age.",
    tags: ["Python", "Pandas", "Scikit-Learn"],
    badges: ["Open", "Data Science"],
    metrics: { applied: 112, shortlisted: 14, award: "₹30,000", duration: "2 months" }
  }
];

export const IndustryProjectsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
           <View style={styles.headerBadge}>
              <Briefcase size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>R&D OPPORTUNITIES</Text>
           </View>
           <Text style={styles.title}>Live Projects</Text>
           <Text style={styles.subtitle}>Post real projects for students to participate in</Text>
        </Animated.View>

        {/* Post Button */}
        <Animated.View entering={FadeInUp.delay(150)}>
           <TouchableOpacity style={styles.postBtn}>
             <Plus size={16} color="#FFF" />
             <Text style={styles.postBtnText}>Post New Project</Text>
           </TouchableOpacity>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.statsRow}>
           {projectsStats.map((stat, i) => (
              <StatsCard key={i} title={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
           ))}
        </Animated.View>

        {/* Projects List */}
        <Animated.View entering={FadeInUp.delay(300)}>
          {projects.map((project, index) => (
             <Animated.View key={project.id} entering={FadeInUp.delay(350 + index * 50)} style={styles.projectCard}>
                <View style={styles.cardTop}>
                   <View style={styles.titleRow}>
                      <View style={styles.iconBox}>
                         <project.icon size={20} color="#64748B" />
                      </View>
                      <View style={styles.titleInfo}>
                         <Text style={styles.projectTitle}>{project.title}</Text>
                         <Text style={styles.projectSubtitle}>{project.subtitle}</Text>
                      </View>
                   </View>
                   
                   <View style={styles.badgesRow}>
                      {project.badges.map((badge, bIdx) => (
                         <View key={bIdx} style={[styles.badge, badge === "Open" ? styles.badgeOpen : {}]}>
                            <Text style={[styles.badgeText, badge === "Open" ? styles.badgeTextOpen : {}]}>{badge}</Text>
                         </View>
                      ))}
                   </View>
                </View>

                <Text style={styles.description}>{project.description}</Text>
                
                <View style={styles.tagsContainer}>
                   {project.tags.map((tag) => (
                      <View key={tag} style={styles.tagPill}>
                         <Text style={styles.tagText}>{tag}</Text>
                      </View>
                   ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.metricsContainer}>
                   <View style={styles.metricsGrid}>
                      <View style={styles.metricItem}>
                         <Text style={[styles.metricValue, { color: '#F97316' }]}>{project.metrics.applied}</Text>
                         <Text style={styles.metricLabel}>Applied</Text>
                      </View>
                      <View style={styles.metricItem}>
                         <Text style={[styles.metricValue, { color: '#3B82F6' }]}>{project.metrics.shortlisted}</Text>
                         <Text style={styles.metricLabel}>Shortlisted</Text>
                      </View>
                      <View style={styles.metricItem}>
                         <Text style={[styles.metricValue, { color: '#10B981' }]}>{project.metrics.award}</Text>
                         <Text style={styles.metricLabel}>Award</Text>
                      </View>
                      <View style={styles.metricItem}>
                         <Text style={[styles.metricValue, { color: '#475569', fontSize: 13 }]}>{project.metrics.duration}</Text>
                         <Text style={styles.metricLabel}>Duration</Text>
                      </View>
                   </View>
                   
                   <TouchableOpacity style={styles.manageBtn}>
                      <Text style={styles.manageBtnText}>Manage</Text>
                      <ArrowRight size={14} color="#FFF" />
                   </TouchableOpacity>
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
  
  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  postBtn: { marginBottom: 24, backgroundColor: colors.purple[600], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, shadowColor: colors.purple[600], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  postBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 24 },

  projectCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTop: { marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  titleInfo: { flex: 1 },
  projectTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  projectSubtitle: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  badgeOpen: { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' },
  badgeTextOpen: { color: '#059669' },

  description: { fontSize: 13, color: '#64748B', fontWeight: '500', lineHeight: 20, marginBottom: 16 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tagPill: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E0E7FF' },
  tagText: { color: '#6366F1', fontSize: 10, fontWeight: '800' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },

  metricsContainer: { gap: 20 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  metricItem: { flex: 1, minWidth: '22%' },
  metricValue: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  metricLabel: { fontSize: 9, fontWeight: '800', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: 0.5 },

  manageBtn: { backgroundColor: colors.purple[600], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, shadowColor: colors.purple[600], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },
  manageBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  footerSpacer: { height: 40 }
});
