import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap, Target, Users, Award, XCircle, CheckCircle2 } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const comparisons = [
    { conventional: "Course-focused learning", skillbridge: "Career pathway development", icon: Target },
    { conventional: "Certifications", skillbridge: "Demonstrated capability", icon: Award },
    { conventional: "Generic training", skillbridge: "Personalized progression", icon: Users },
    { conventional: "Hiring after graduation", skillbridge: "Industry connected from day one", icon: Zap },
];

export const WhyDifferentSection = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>WHY STRIDENEX STANDS DIFFERENT</Text>
                </View>
                <Text style={styles.title}>Not Another Learning Platform -</Text>
                <Text style={styles.subtitleTitle}>A Career Development Ecosystem</Text>
            </View>

            <View style={styles.grid}>
                {/* Conventional Card */}
                <View style={styles.card}>
                    <View style={[styles.cardHeader, { backgroundColor: '#f87171' + '15' }]}>
                        <Text style={[styles.cardTitle, { color: '#f87171' }]}>Conventional Platforms</Text>
                    </View>
                    <View style={styles.cardContent}>
                        {comparisons.map((c, i) => (
                            <View key={i} style={styles.row}>
                                <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                                    <c.icon size={20} color="#f87171" />
                                </View>
                                <Text style={styles.rowText}>{c.conventional}</Text>
                                <XCircle size={20} color="#f87171" />
                            </View>
                        ))}
                    </View>
                </View>

                {/* StrideNex Card */}
                <View style={[styles.card, styles.highlightCard]}>
                    <View style={[styles.cardHeader, { backgroundColor: colors.primary.DEFAULT + '20' }]}>
                        <Text style={[styles.cardTitle, { color: colors.primary.DEFAULT }]}>StrideNex</Text>
                    </View>
                    <View style={styles.cardContent}>
                        {comparisons.map((c, i) => (
                            <View key={i} style={styles.row}>
                                <View style={[styles.iconBox, { backgroundColor: colors.primary.DEFAULT + '15' }]}>
                                    <c.icon size={20} color={colors.primary.DEFAULT} />
                                </View>
                                <Text style={[styles.rowText, { color: colors.navy, fontWeight: '600' }]}>{c.skillbridge}</Text>
                                <CheckCircle2 size={24} color={colors.primary.DEFAULT} />
                            </View>
                        ))}
                    </View>
                </View>
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
        fontSize: typography.fontSize['2xl'],
        fontWeight: '900',
        color: colors.text.secondary,
        textAlign: 'center',
        fontFamily: typography.fontFamily.display
    },
    subtitleTitle: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '900',
        color: colors.navy,
        textAlign: 'center',
        fontFamily: typography.fontFamily.display,
        marginTop: 4
    },
    grid: { gap: spacing.xl },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    highlightCard: {
        borderColor: colors.primary.DEFAULT,
        borderWidth: 2,
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 5,
    },
    cardHeader: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: typography.fontFamily.display,
    },
    cardContent: { padding: spacing.lg },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    rowText: {
        flex: 1,
        fontSize: 15,
        color: colors.text.secondary,
        marginRight: spacing.sm,
    }
});
