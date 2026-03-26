import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Briefcase, Rocket, GraduationCap, CheckCircle } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Shared/Button';

const pathways = [
    {
        id: 1,
        title: "Skill Facilitating Program",
        tagline: "Become Industry-Ready Before You Graduate",
        description: "Designed for students aiming to enter the workforce with confidence and practical capability.",
        icon: Briefcase,
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
        color: colors.primary.DEFAULT,
        bgColor: colors.primary.DEFAULT + '15',
        features: [
            "Industry-aligned skill pathways",
            "Real-world project exposure",
            "Portfolio and execution-based learning",
            "Continuous mentor guidance",
            "Industry readiness score and validation",
        ],
        outcome: "Students transition from learners to professionals prepared for real job roles.",
        cta: "Build Job-Ready Skills",
    },
    {
        id: 2,
        title: "Entrepreneur Development Program",
        tagline: "Transform Ideas into Scalable Ventures",
        description: "For students who aspire to create, innovate, and lead.",
        icon: Rocket,
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
        color: colors.accent.DEFAULT,
        bgColor: colors.accent.DEFAULT + '15',
        features: [
            "Innovation and problem-identification frameworks",
            "Startup mentoring and incubation guidance",
            "Product development exposure",
            "Business model and market validation support",
            "Industry and investor ecosystem connect",
        ],
        outcome: "Students evolve from idea thinkers into startup creators.",
        cta: "Start Your Innovation Journey",
    },
    {
        id: 3,
        title: "Higher Education Pathway",
        tagline: "Prepare for Advanced Academic Excellence",
        description: "For learners planning global or specialized higher studies with clarity and preparation.",
        icon: GraduationCap,
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
        color: colors.success,
        bgColor: colors.success + '15',
        features: [
            "Career-aligned higher education mapping",
            "Research and specialization guidance",
            "Skill portfolio strengthening",
            "Industry exposure to support academic applications",
            "Future-focused learning preparation",
        ],
        outcome: "Students pursue higher education with stronger profiles and clearer specialization goals.",
        cta: "Plan Your Academic Future",
    },
];

export const PathwaysSection = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>THREE CORE DEVELOPMENT PATHWAYS</Text>
                </View>
                <Text style={styles.title}>One Platform. <Text style={{ color: colors.navy }}>Three Powerful Growth Directions.</Text></Text>
            </View>

            <View style={styles.list}>
                {pathways.map((pathway) => (
                    <View key={pathway.id} style={styles.card}>
                        <Image source={{ uri: pathway.image }} style={styles.cardImage} />
                        
                        <View style={styles.cardContent}>
                            <View style={[styles.iconWrapper, { backgroundColor: pathway.bgColor }]}>
                                <pathway.icon size={24} color={pathway.color} />
                            </View>

                            <Text style={[styles.tagline, { color: pathway.color }]}>{pathway.tagline}</Text>
                            <Text style={styles.cardTitle}>{pathway.title}</Text>
                            <Text style={styles.cardDesc}>{pathway.description}</Text>

                            <View style={styles.featuresList}>
                                {pathway.features.map((feature, idx) => (
                                    <View key={idx} style={styles.featureItem}>
                                        <CheckCircle size={16} color={pathway.color} style={{ marginRight: 8, marginTop: 2 }} />
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={[styles.outcomeBox, { backgroundColor: pathway.bgColor, borderLeftColor: pathway.color }]}>
                                <Text style={styles.outcomeText}><Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Outcome:</Text> {pathway.outcome}</Text>
                            </View>

                            <Button title={pathway.cta} variant="outline" onPress={() => {}} style={{ marginTop: spacing.lg }} />
                        </View>
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
        color: colors.primary.DEFAULT,
        textAlign: 'center',
        fontFamily: typography.fontFamily.display
    },
    list: { gap: spacing.xl },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
    },
    cardImage: { width: '100%', height: 200 },
    cardContent: { padding: spacing.xl },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    tagline: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: spacing.xs },
    cardTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.navy,
        marginBottom: spacing.sm,
        fontFamily: typography.fontFamily.display
    },
    cardDesc: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
    featuresList: { marginBottom: spacing.lg },
    featureItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
    featureText: { flex: 1, fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
    outcomeBox: {
        padding: spacing.md,
        borderRadius: 8,
        borderLeftWidth: 4,
    },
    outcomeText: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 }
});
