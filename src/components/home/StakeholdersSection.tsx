import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, Briefcase, CheckCircle, ArrowRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Shared/Button';

const stakeholders = [
    {
        id: "students",
        label: "For Students",
        title: "For Students",
        subtitle: "Clarity, Confidence, and Career Direction",
        icon: Users,
        color: colors.accent.DEFAULT,
        bgColor: colors.accent.DEFAULT,
        buttonVariant: "accent" as const,
        features: [
            "Discover your real professional interests",
            "Gain hands-on industry exposure",
            "Build portfolios that employers trust",
            "Choose career, startup, or higher education pathways",
            "Develop skills aligned with future industries",
        ],
        cta: "Start Your Journey",
    },
    {
        id: "industry",
        label: "For Industry",
        title: "For Industry",
        subtitle: "Engage with Talent That Demonstrates Capability",
        icon: Briefcase,
        color: colors.navy,
        bgColor: colors.navy,
        buttonVariant: "primary" as const,
        features: [
            "Access pre-evaluated candidate pools",
            "Skill-validated student profiles",
            "Reduced recruitment uncertainty",
            "Early engagement with emerging talent",
            "Continuous talent pipeline development",
        ],
        cta: "Explore Talent Network",
    },
];

export const StakeholdersSection = () => {
    const [activeTab, setActiveTab] = useState("students");
    const activeItem = stakeholders.find(item => item.id === activeTab) || stakeholders[0];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>BUILT FOR EVERY STAKEHOLDER</Text>
                </View>
                <Text style={styles.title}>A Platform for Everyone</Text>
            </View>

            <View style={styles.tabContainer}>
                <View style={styles.tabBg}>
                    {stakeholders.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.tabButton,
                                activeTab === item.id ? { backgroundColor: item.bgColor, shadowOpacity: 0.2 } : { backgroundColor: 'transparent', shadowOpacity: 0 }
                            ]}
                            onPress={() => setActiveTab(item.id)}
                        >
                            <Text style={[styles.tabText, activeTab === item.id ? { color: '#ffffff' } : { color: colors.text.secondary }]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.contentCard}>
                <View style={styles.cardInfo}>
                    <View style={[styles.activeRoleBadge, { backgroundColor: activeItem.bgColor }]}>
                        <activeItem.icon size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.activeRoleText}>{activeItem.title}</Text>
                    </View>

                    <Text style={styles.cardSubtitle}>{activeItem.subtitle}</Text>

                    <View style={styles.featuresList}>
                        {activeItem.features.map((feat, i) => (
                            <View key={i} style={styles.featureRow}>
                                <CheckCircle size={20} color={colors.primary.DEFAULT} style={{ marginRight: spacing.sm }} />
                                <Text style={styles.featureText}>{feat}</Text>
                            </View>
                        ))}
                    </View>

                    <Button 
                        title={activeItem.cta} 
                        variant={activeItem.buttonVariant} 
                        style={{ marginTop: spacing.md }} 
                        onPress={() => {}} 
                    />
                </View>

                <View style={[styles.cardVisual, { backgroundColor: activeItem.bgColor }]}>
                    <activeItem.icon size={120} color="rgba(255,255,255,0.2)" />
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
    tabContainer: { alignItems: 'center', marginBottom: 40 },
    tabBg: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 30, padding: 4 },
    tabButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 26, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
    tabText: { fontWeight: 'bold', fontSize: 14 },
    contentCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.primary.DEFAULT + '20',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    cardInfo: { padding: spacing.xl },
    activeRoleBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: spacing.xl },
    activeRoleText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
    cardSubtitle: { fontSize: typography.fontSize['2xl'], fontWeight: 'bold', color: colors.navy, marginBottom: spacing.xl, fontFamily: typography.fontFamily.display },
    featuresList: { marginBottom: spacing.xl },
    featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
    featureText: { flex: 1, fontSize: 15, color: colors.text.secondary, lineHeight: 22 },
    cardVisual: { backgroundColor: colors.accent.DEFAULT, padding: 40, alignItems: 'center', justifyContent: 'center' }
});
