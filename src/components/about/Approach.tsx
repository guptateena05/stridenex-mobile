import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Code, Rocket, GraduationCap } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const approaches = [
    {
        title: "Skill Facilitating",
        description: "Develop practical capabilities and industry readiness through guided execution and project exposure.",
        icon: Code,
        color: colors.primary.DEFAULT,
        bgColor: colors.primary.DEFAULT + '15'
    },
    {
        title: "Entrepreneur Development",
        description: "Encourage innovation by supporting students in transforming ideas into viable ventures.",
        icon: Rocket,
        color: colors.accent.DEFAULT,
        bgColor: colors.accent.DEFAULT + '15'
    },
    {
        title: "Higher Education Pathway",
        description: "Prepare learners for advanced academic opportunities through structured specialization and profile development.",
        icon: GraduationCap,
        color: colors.success,
        bgColor: colors.success + '15'
    }
];

export const Approach = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>OUR APPROACH</Text>
                </View>
                <Text style={styles.title}>A Structured Journey to Success</Text>
                <Text style={styles.subtitle}>
                    StrideNex begins with understanding each learner's interests, strengths, and aspirations. Based on this mapping, students progress through structured development pathways supported by mentors, institutions, and industry insights.
                </Text>
            </View>

            <View style={styles.grid}>
                {approaches.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                            <item.icon size={28} color={item.color} />
                        </View>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardDesc}>{item.description}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 60,
        backgroundColor: colors.background.light,
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
    grid: { gap: spacing.lg },
    card: {
        backgroundColor: '#ffffff',
        padding: spacing.xl,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    cardTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.navy,
        marginBottom: spacing.sm,
        fontFamily: typography.fontFamily.display
    },
    cardDesc: {
        fontSize: 15,
        color: colors.text.secondary,
        lineHeight: 24,
    }
});
