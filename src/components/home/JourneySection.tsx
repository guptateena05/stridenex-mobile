import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Compass, Target, Award, ArrowRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Shared/Button';

const steps = [
    {
        id: 1,
        title: "Evaluate & Map",
        description: "We assess interests, strengths, and career inclination using structured evaluation frameworks to identify the most suitable growth pathway.",
        icon: Compass,
        color: colors.primary.DEFAULT,
        bgColor: colors.primary.DEFAULT + '15'
    },
    {
        id: 2,
        title: "Guided Development",
        description: "Students are mapped into specialized development tracks supported by mentors, industry inputs, and experiential learning.",
        icon: Target,
        color: colors.accent.DEFAULT,
        bgColor: colors.accent.DEFAULT + '15'
    },
    {
        id: 3,
        title: "Outcome Achievement",
        description: "Learners progress toward employment, entrepreneurship, or advanced education with validated skills and confidence.",
        icon: Award,
        color: colors.success,
        bgColor: colors.success + '15'
    },
];

export const JourneySection = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>OUR JOURNEY WITH EVERY STUDENT</Text>
                </View>
                <Text style={styles.title}>Every Successful Career Begins with the Right Direction</Text>
                <Text style={styles.subtitle}>StrideNex starts by understanding each learner - not just academically, but professionally.</Text>
            </View>

            <View style={styles.grid}>
                {steps.map((step) => (
                    <View key={step.id} style={styles.card}>
                        <View style={[styles.iconWrapper, { backgroundColor: step.bgColor }]}>
                            <step.icon size={28} color={step.color} />
                        </View>
                        <Text style={styles.cardTitle}>Step {step.id} - {step.title}</Text>
                        <Text style={styles.cardDesc}>{step.description}</Text>
                        <View style={[styles.bottomLine, { backgroundColor: step.color }]} />
                    </View>
                ))}
            </View>

            <View style={styles.ctaWrapper}>
                <Button variant="outline" title="Learn More About Our Process" onPress={() => {}} style={{ paddingHorizontal: spacing.lg }} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 60,
        paddingHorizontal: spacing.xl,
        backgroundColor: '#ffffff',
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
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
        position: 'relative'
    },
    iconWrapper: {
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
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        lineHeight: 24,
    },
    bottomLine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    ctaWrapper: {
        marginTop: 40,
        alignItems: 'center'
    }
});
