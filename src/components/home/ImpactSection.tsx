import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Users, Award, Clock } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const stats = [
    { id: 1, value: "85", suffix: "%", label: "Faster transition to employment", icon: TrendingUp, bgColor: colors.accent.DEFAULT },
    { id: 2, value: "92", suffix: "%", label: "Increased student confidence", icon: Users, bgColor: colors.primary.DEFAULT },
    { id: 3, value: "3", suffix: "x", label: "Stronger placement outcomes", icon: Award, bgColor: colors.success },
    { id: 4, value: "40", suffix: "%", label: "Reduced hiring risk", icon: Clock, bgColor: colors.accent.DEFAULT },
];

export const ImpactSection = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>IMPACT & OUTCOMES</Text>
                </View>
                <Text style={styles.title}>Creating Measurable Career Transformation</Text>
            </View>

            <View style={styles.grid}>
                {stats.map((stat) => (
                    <View key={stat.id} style={styles.statBox}>
                        <View style={[styles.iconWrapper, { backgroundColor: stat.bgColor }]}>
                            <stat.icon size={28} color="#fff" />
                        </View>
                        <Text style={styles.statValue}>{stat.value}{stat.suffix}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 60,
        backgroundColor: colors.navy, // mapping from primarily purple/dark gradient
        paddingHorizontal: spacing.xl,
        overflow: 'hidden'
    },
    header: { alignItems: 'center', marginBottom: 40 },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: spacing.md
    },
    badgeText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: typography.fontFamily.display
    },
    grid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        rowGap: spacing.xl,
    },
    statBox: {
        width: '48%',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    statValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#ffffff',
        fontFamily: typography.fontFamily.display,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 18,
    }
});
