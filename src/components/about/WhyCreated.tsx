import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, Building2, Briefcase } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const items = [
    {
        title: "Students",
        description: "Gain clarity and direction about their career paths",
        icon: Users,
        color: colors.primary.DEFAULT,
        bgColor: colors.primary.DEFAULT + '15'
    },
    {
        title: "Institutes",
        description: "Achieve stronger placement outcomes",
        icon: Building2,
        color: colors.accent.DEFAULT,
        bgColor: colors.accent.DEFAULT + '15'
    },
    {
        title: "Industry",
        description: "Access capable talent with validated skills",
        icon: Briefcase,
        color: colors.success,
        bgColor: colors.success + '15'
    }
];

export const WhyCreated = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>OUR ORIGIN</Text>
                </View>
                <Text style={styles.title}>Why StrideNex Was Created</Text>
                
                <Text style={styles.paragraph}>
                    Across education systems, students invest years in learning yet often struggle to translate knowledge into career confidence. Organizations seek capable talent, institutions aim for stronger outcomes, and students look for direction — but these three ecosystems traditionally operate in isolation.
                </Text>

                <Text style={styles.paragraph}>
                    StrideNex was built to bring them together. By integrating structured evaluation, guided development, and industry participation, we enable learners to move from uncertainty to purposeful growth.
                </Text>
            </View>

            <View style={styles.grid}>
                {items.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                            <item.icon size={24} color={item.color} />
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
        marginBottom: spacing.xl,
        fontFamily: typography.fontFamily.display
    },
    paragraph: {
        fontSize: typography.fontSize.lg,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: spacing.md,
    },
    grid: { gap: spacing.md },
    card: {
        backgroundColor: '#ffffff',
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    cardTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: 'bold',
        color: colors.navy,
        marginBottom: 4,
        fontFamily: typography.fontFamily.display
    },
    cardDesc: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20
    }
});
