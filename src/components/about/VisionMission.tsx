import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, Target } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const VisionMission = () => {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {/* Vision Card */}
                <View style={styles.card}>
                    <Sparkles size={48} color={colors.accent.DEFAULT} style={{ marginBottom: spacing.lg }} />
                    <Text style={styles.title}>Our Vision</Text>
                    <Text style={styles.text}>
                        To build a reliable talent ecosystem where industries can consistently find and trust job-ready, future-ready, and entrepreneurial individuals, enabled through structured pathways that align students with real industry needs and drive outcomes in careers, ventures, and higher education.
                    </Text>
                </View>

                {/* Mission Card */}
                <View style={[styles.card, { marginTop: spacing.xl }]}>
                    <Target size={48} color={colors.accent.DEFAULT} style={{ marginBottom: spacing.lg }} />
                    <Text style={styles.title}>Our Mission</Text>
                    <Text style={styles.text}>
                        For students and industries, StrideNEX builds a reliable talent ecosystem by preparing individuals for jobs, entrepreneurship, and higher education through industry-aligned learning, real-world exposure, and validated skill assessment using artificial intelligence agents.
                    </Text>
                </View>
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
    grid: {
        flexDirection: 'column',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: spacing.xl,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: colors.navy,
        marginBottom: spacing.md,
        fontFamily: typography.fontFamily.display
    },
    text: {
        fontSize: typography.fontSize.lg,
        color: colors.text.secondary,
        lineHeight: 28,
    }
});
