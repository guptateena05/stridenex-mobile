import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const beliefs = [
    "Every student has potential when guided in the right direction",
    "Skills become valuable only when applied in real environments",
    "Career readiness is a journey, not a single certification",
    "Collaboration between academia and industry creates sustainable talent ecosystems"
];

export const Philosophy = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>OUR PHILOSOPHY</Text>
                </View>
                <Text style={styles.title}>What We Believe</Text>
            </View>

            <View style={styles.grid}>
                {beliefs.map((belief, index) => (
                    <View key={index} style={styles.card}>
                        <Heart size={32} color={colors.accent.DEFAULT} style={{ marginBottom: spacing.md }} />
                        <Text style={styles.cardText}>{belief}</Text>
                    </View>
                ))}
            </View>
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
        fontFamily: typography.fontFamily.display
    },
    grid: { gap: spacing.md },
    card: {
        backgroundColor: '#f8fafc',
        padding: spacing.xl,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cardText: {
        fontSize: typography.fontSize.base,
        color: colors.navy,
        lineHeight: 24,
    }
});
