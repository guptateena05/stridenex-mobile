import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { TrendingUp, Code, Users, ArrowRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';

const offerings = [
    {
        id: 1,
        title: "Strategic Leadership",
        description: "Advanced decision-making frameworks for high-stakes environments.",
        icon: TrendingUp,
        color: colors.accent.DEFAULT,
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        stats: "15+ Modules",
        features: ["Executive Coaching", "Strategy Workshops", "Leadership Assessment"],
    },
    {
        id: 2,
        title: "Tech Mastery",
        description: "Deep dives into AI, cloud architecture, and data orchestration.",
        icon: Code,
        color: colors.primary.DEFAULT,
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        stats: "20+ Courses",
        features: ["AI & Machine Learning", "Cloud Architecture", "Data Science"],
    },
    {
        id: 3,
        title: "Cultural Dynamics",
        description: "Building resilient, inclusive, and high-performance teams.",
        icon: Users,
        color: colors.success || '#10b981',
        image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        stats: "10+ Workshops",
        features: ["Team Building", "Diversity & Inclusion", "Change Management"],
    },
];

export const OfferingsSection = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>The Curriculum</Text>
                </View>
                <Text style={styles.title}>Curated for the Modern Executive</Text>
                <Text style={styles.subtitle}>Specialized programs designed to transform your leadership capabilities</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {offerings.map((offering) => (
                    <Card key={offering.id} style={styles.card}>
                        <View style={styles.imageBox}>
                            <Image source={{ uri: offering.image }} style={styles.image} />
                            <View style={[styles.imageOverlay, { backgroundColor: offering.color + '40' }]} />
                            <View style={styles.statsBadge}>
                                <Text style={styles.statsText}>{offering.stats}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.cardContent}>
                            <View style={[styles.iconBox, { backgroundColor: offering.color }]}>
                                <offering.icon color="#fff" size={24} />
                            </View>
                            
                            <Text style={styles.cardTitle}>{offering.title}</Text>
                            <Text style={styles.cardDesc}>{offering.description}</Text>
                            
                            <View style={styles.featuresList}>
                                {offering.features.map((feat, i) => (
                                    <View key={i} style={styles.featureItem}>
                                        <View style={[styles.dot, { backgroundColor: offering.color }]} />
                                        <Text style={styles.featureText}>{feat}</Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.linkBtn}>
                                <Text style={[styles.linkText, { color: offering.color }]}>Learn more</Text>
                                <ArrowRight color={offering.color} size={16} />
                            </TouchableOpacity>
                        </View>
                    </Card>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingVertical: spacing['2xl'], backgroundColor: '#fff' },
    header: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
    badge: { alignSelf: 'flex-start', backgroundColor: colors.accent.DEFAULT + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: spacing.sm },
    badgeText: { color: colors.accent.DEFAULT, fontSize: typography.fontSize.xs, fontWeight: 'bold', textTransform: 'uppercase' },
    title: { fontSize: typography.fontSize['3xl'], fontWeight: '900', color: colors.navy, marginBottom: spacing.sm, fontFamily: typography.fontFamily.display },
    subtitle: { fontSize: typography.fontSize.base, color: colors.text.secondary },
    scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
    card: { width: 300, marginHorizontal: spacing.sm, padding: 0, overflow: 'hidden', borderRadius: borderRadius.xl },
    imageBox: { width: '100%', height: 180, position: 'relative' },
    image: { width: '100%', height: '100%' },
    imageOverlay: { ...StyleSheet.absoluteFillObject },
    statsBadge: { position: 'absolute', top: spacing.md, right: spacing.md, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statsText: { fontSize: 10, fontWeight: 'bold', color: colors.navy },
    cardContent: { padding: spacing.lg, paddingTop: 0 },
    iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: -28, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
    cardTitle: { fontSize: typography.fontSize.xl, fontWeight: '900', color: colors.navy, marginBottom: spacing.sm, fontFamily: typography.fontFamily.display },
    cardDesc: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing.md },
    featuresList: { marginBottom: spacing.lg },
    featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: spacing.sm },
    featureText: { fontSize: typography.fontSize.sm, color: colors.text.primary },
    linkBtn: { flexDirection: 'row', alignItems: 'center' },
    linkText: { fontSize: typography.fontSize.sm, fontWeight: 'bold', marginRight: 4 }
});
