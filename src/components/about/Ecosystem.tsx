import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, Building2, Briefcase } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const ecosystem = [
    {
        title: "Students",
        description: "Gain direction and confidence",
        icon: Users,
        color: colors.primary.DEFAULT,
        bgColor: colors.primary.DEFAULT + '15',
        stats: "10k+ Active"
    },
    {
        title: "Institutes",
        description: "Enhance academic outcomes",
        icon: Building2,
        color: colors.accent.DEFAULT,
        bgColor: colors.accent.DEFAULT + '15',
        stats: "500+ Partners"
    },
    {
        title: "Industry",
        description: "Access prepared talent",
        icon: Briefcase,
        color: colors.success,
        bgColor: colors.success + '15',
        stats: "200+ Connected"
    }
];

export const Ecosystem = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>THE ECOSYSTEM</Text>
                </View>
                <Text style={styles.title}>What We're Building</Text>
                <Text style={styles.subtitle}>
                    StrideNex is not just a platform — it is a collaborative movement toward transforming how careers are built.
                </Text>
            </View>

            <View style={styles.grid}>
                {ecosystem.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                            <item.icon size={32} color={item.color} />
                        </View>
                        <Text style={styles.cardStats}>{item.stats}</Text>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardDesc}>{item.description}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.footerText}>
                Together, we are shaping a future where learning leads seamlessly to meaningful opportunities.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 60,
        backgroundColor: '#ffffff',
        paddingHorizontal: spacing.xl,
    },
    header: { alignItems: 'center', marginBottom: 40 },
    badge: {
        backgroundColor: colors.primary.DEFAULT + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: spacing.md
    },
    badgeText: { color: colors.primary.DEFAULT, fontSize: 12, fontWeight: 'bold' },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '900',
        color: colors.navy,
        textAlign: 'center',
        marginBottom: spacing.md,
        fontFamily: typography.fontFamily.display
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    grid: { gap: spacing.md, marginBottom: 40 },
    card: {
        backgroundColor: '#f8fafc',
        padding: spacing.xl,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    cardStats: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '900',
        color: colors.navy,
        marginBottom: spacing.xs,
        fontFamily: typography.fontFamily.display
    },
    cardTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.navy,
        marginBottom: spacing.xs,
        fontFamily: typography.fontFamily.display
    },
    cardDesc: {
        fontSize: 15,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    footerText: {
        fontSize: typography.fontSize.lg,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 26,
    }
});
