import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const differences = [
    "Personalized development journeys instead of generic learning paths",
    "Execution-based exposure rather than theory-only training",
    "Continuous mentorship and feedback",
    "Industry-connected progression from early stages",
    "Measurable skill validation supporting real opportunities"
];

export const WhatMakesDifferent = () => {
    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>WHAT MAKES US DIFFERENT</Text>
            </View>
            
            <Text style={styles.title}>Not Another Learning Platform — A Career Development Ecosystem</Text>

            <Text style={styles.paragraph}>
                Unlike traditional learning platforms focused only on courses, StrideNex focuses on career outcomes.
            </Text>

            <View style={styles.list}>
                {differences.map((item, index) => (
                    <View key={index} style={styles.listItem}>
                        <CheckCircle size={20} color={colors.accent.DEFAULT} style={{ marginRight: spacing.sm, marginTop: 2 }} />
                        <Text style={styles.listText}>{item}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1659080925920-1683d25f772a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }} 
                    style={styles.image}
                />
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
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.accent.DEFAULT + '15',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: spacing.lg,
    },
    badgeText: {
        color: colors.accent.DEFAULT,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '900',
        color: colors.navy,
        fontFamily: typography.fontFamily.display,
        marginBottom: spacing.md,
        lineHeight: 38,
    },
    paragraph: {
        fontSize: typography.fontSize.lg,
        color: colors.text.secondary,
        lineHeight: 28,
        marginBottom: spacing.xl,
    },
    list: {
        marginBottom: spacing.xl,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    listText: {
        flex: 1,
        fontSize: 15,
        color: colors.text.secondary,
        lineHeight: 24,
    },
    imageContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        aspectRatio: 1,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    }
});
