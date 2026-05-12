import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import {
  Video,
  MoreVertical,
  Plus,
  IndianRupee,
  Clock,
  Star,
  Award
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const offeringsData = [
  {
    title: '1:1 Career Switch Counselling',
    type: 'Career Guidance',
    duration: '45 mins',
    price: '₹1,500',
    bookings: 42,
    rating: '5.0',
    isActive: true,
    color: '#3B82F6',
    bgColor: '#EFF6FF'
  },
  {
    title: 'Resume & LinkedIn Review',
    type: 'Profile Review',
    duration: '30 mins',
    price: '₹900',
    bookings: 128,
    rating: '4.9',
    isActive: true,
    color: '#4c1d95',
    bgColor: '#F5F3FF'
  },
  {
    title: 'FAANG level DSA Mock Interview',
    type: 'Technical Mock',
    duration: '90 mins',
    price: '₹3,000',
    bookings: 15,
    rating: '4.8',
    isActive: false,
    color: '#F97316',
    bgColor: '#FFF7ED'
  },
  {
    title: 'Salary Negotiation Tactics',
    type: 'Career Guidance',
    duration: '30 mins',
    price: '₹1,200',
    bookings: 67,
    rating: '5.0',
    isActive: true,
    color: '#10B981',
    bgColor: '#ECFDF5'
  },
  {
    title: 'System Design Arch Review',
    type: 'Technical Mock',
    duration: '60 mins',
    price: '₹2,500',
    bookings: 34,
    rating: '4.7',
    isActive: true,
    color: '#4c1d95',
    bgColor: '#F5F3FF'
  }
];

export const MentorOfferingsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Offerings</Text>
            <View style={styles.headerBadge}>
              <Award size={10} color="#4c1d95" />
              <Text style={styles.headerBadgeText}>YOUR SERVICES</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Define your mentorship packages and pricing</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={{ marginBottom: 24 }}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.primaryBtnText}>Create New Offering</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.list}>
          {offeringsData.map((pkg, i) => (
            <Animated.View key={i} entering={FadeInUp.delay(150 + i * 50)} style={[styles.card, !pkg.isActive && styles.cardInactive]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: pkg.bgColor }]}>
                  <Video size={16} color={pkg.color} />
                </View>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: pkg.isActive ? '#10B981' : '#94A3B8' }]} />
                  <Text style={[styles.statusText, { color: pkg.isActive ? '#059669' : '#64748B' }]}>{pkg.isActive ? 'Active' : 'Draft'}</Text>
                </View>
              </View>

              <Text style={styles.pkgTitle}>{pkg.title}</Text>
              <Text style={styles.pkgType}>{pkg.type}</Text>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.detailText}>{pkg.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <IndianRupee size={12} color="#64748B" />
                  <Text style={styles.detailText}>{pkg.price}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.footerRow}>
                <View style={styles.statsGroup}>
                  <Text style={styles.statsLabel}>{pkg.bookings} <Text style={{ fontWeight: '500' }}>Bookings</Text></Text>
                  <View style={styles.ratingBadge}>
                    <Star size={10} color="#CA8A04" fill="#CA8A04" />
                    <Text style={styles.ratingText}>{pkg.rating}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                  <Text style={styles.moreBtnText}>Edit</Text>
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
  content: { paddingHorizontal: 16, paddingTop: 16 },

  // header: { marginBottom: 16, paddingHorizontal: 4 },
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76, 29, 149, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#4c1d95', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  primaryBtn: { backgroundColor: '#4c1d95', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, shadowColor: '#4c1d95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  primaryBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  list: { gap: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardInactive: { backgroundColor: '#F8FAFC', opacity: 0.8 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  pkgTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  pkgType: { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 16 },

  detailsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  detailText: { fontSize: 11, fontWeight: '700', color: '#475569' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statsLabel: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEFCE8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#FEF08A' },
  ratingText: { fontSize: 10, fontWeight: '800', color: '#A16207' },

  moreBtn: { backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  moreBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },

  footerSpacer: { height: 40 }
});
