import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lightbulb, Users, TrendingUp, CheckCircle } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const steps = [
    {
        id: 1,
        title: "Learn with Purpose",
        description: "Follow guided pathways aligned with real industry expectations instead of random course selection.",
        icon: Lightbulb,
        color: colors.primary.DEFAULT,
        bgColor: colors.primary.DEFAULT + '15',
    },
    {
        id: 2,
        title: "Execute with Guidance",
        description: "Work on practical assignments and collaborative projects supported by mentors and experts.",
        icon: Users,
        color: colors.accent.DEFAULT,
        bgColor: colors.accent.DEFAULT + '15',
    },
    {
        id: 3,
        title: "Progress with Confidence",
        description: "Showcase verified skills through dynamic profiles trusted by recruiters and institutions.",
        icon: TrendingUp,
        color: colors.success,
        bgColor: colors.success + '15',
    },
];

export const HowItWorksSection = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>HOW STRIDENEX WORKS</Text>
                </View>
                <Text style={styles.title}>A Structured Pathway from Campus to Career</Text>
            </View>

            <View style={styles.grid}>
                {steps.map((step) => (
                    <View key={step.id} style={styles.card}>
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconWrapper, { backgroundColor: step.bgColor }]}>
                                <step.icon size={36} color={step.color} />
                            </View>
                            <View style={styles.numberBadge}>
                                <Text style={styles.numberText}>{step.id}</Text>
                            </View>
                        </View>
                        
                        <Text style={styles.cardTitle}>{step.title}</Text>
                        <Text style={styles.cardDesc}>{step.description}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.bottomCerts}>
                <CheckCircle size={20} color={colors.primary.DEFAULT} style={{ marginRight: spacing.sm }} />
                <Text style={styles.bottomText}>
                    Industry-validated skills • Mentor-guided learning • Career-ready portfolios
                </Text>
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
        fontFamily: typography.fontFamily.display
    },
    grid: { gap: spacing.xl },
    card: {
        backgroundColor: '#ffffff',
        padding: spacing.xl,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    iconContainer: { position: 'relative', marginBottom: spacing.lg },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.accent.DEFAULT,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    numberText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
    cardTitle: {
        fontSize: typography.fontSize['xl'],
        fontWeight: 'bold',
        color: colors.navy,
        marginBottom: spacing.sm,
        textAlign: 'center',
        fontFamily: typography.fontFamily.display
    },
    cardDesc: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    bottomCerts: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomText: {
        color: colors.primary.DEFAULT,
        fontWeight: '600',
        fontSize: 14,
        flex: 1,
        textAlign: 'center',
        lineHeight: 22
    }
});
