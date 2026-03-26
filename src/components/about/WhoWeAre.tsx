import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const WhoWeAre = () => {
    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>WHO WE ARE</Text>
            </View>
            
            <Text style={styles.title}>Bridging the Gap Between Education and Industry</Text>

            <Text style={styles.paragraph}>
                StrideNex is a future-focused career development platform created to bridge the long-standing gap between education and real industry expectations. We believe that true success begins when students gain clarity about their direction and develop practical capabilities aligned with the evolving professional world.
            </Text>

            <Text style={styles.paragraph}>
                Our platform connects students, academic institutions, and industry into one collaborative ecosystem where learning is guided, skills are validated, and outcomes are measurable.
            </Text>

            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }} 
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
        marginBottom: spacing.xl,
        lineHeight: 40,
    },
    paragraph: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        lineHeight: 26,
        marginBottom: spacing.lg,
    },
    imageContainer: {
        marginTop: spacing.xl,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        aspectRatio: 1, // To roughly match the aspect-square from web
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    }
});
