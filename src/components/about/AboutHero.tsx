import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Shared/Button';
import { ArrowRight } from 'lucide-react-native';

export const AboutHero = () => {
    return (
        <View style={styles.container}>
            {/* Subtle background pattern abstraction - native friendly */}
            <View style={StyleSheet.absoluteFill}>
                <View style={styles.patternLayer} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>
                    Advancing Career-Focused{"\n"}
                    <Text style={{ color: colors.accent.DEFAULT }}>Skill Development</Text>
                </Text>

                <Text style={styles.subtitle}>
                    StrideNex is a next-generation career development ecosystem designed to align education with real industry expectations.
                </Text>

                <Text style={styles.desc}>
                    Our platform connects students, academic institutions, mentors, and industry partners to create structured pathways that transform learning into measurable outcomes.
                </Text>

                <View style={styles.btnWrap}>
                    <Button 
                        title="Explore Our Ecosystem" 
                        variant="accent"
                        onPress={() => {}}
                        style={styles.btn}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background.light,
        paddingVertical: 80,
        paddingHorizontal: spacing.xl,
        position: 'relative',
        overflow: 'hidden',
    },
    patternLayer: {
        flex: 1,
        opacity: 0.05,
        backgroundColor: colors.primary.DEFAULT, // placeholder for radial pattern via code or image if needed
    },
    content: {
        alignItems: 'center',
        zIndex: 10,
    },
    title: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: '900',
        color: colors.navy,
        textAlign: 'center',
        fontFamily: typography.fontFamily.display,
        marginBottom: spacing.lg,
    },
    subtitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.md,
        fontFamily: typography.fontFamily.display,
        lineHeight: 28,
    },
    desc: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 40,
    },
    btnWrap: {
        alignItems: 'center',
        width: '100%',
    },
    btn: {
        minWidth: 250,
        height: 54,
    }
});
