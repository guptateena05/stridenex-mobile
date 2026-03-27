import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import circularLogo from '@/assets/images/circularLogo.jpg';
import { Mail, Phone, MapPin, Globe, Share2, Info } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/Shared/Button';
import { Input } from '@/components/Shared/Input';

export const PublicFooter = () => {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <View style={styles.brandSection}>
                <View style={styles.logoFlex}>
                    <View style={styles.logoBadge}>
                        <Image 
                            source={circularLogo} 
                            style={styles.logoImage} 
                            resizeMode="cover"
                        />
                    </View>
                    <View>
                        <Text style={styles.title}>StrideNex</Text>
                        <Text style={styles.subtitle}>Pathways to Your Future</Text>
                    </View>
                </View>
                <Text style={styles.desc}>
                    StrideNex is a collaborative career development platform connecting education, innovation, and industry.
                </Text>

                <View style={styles.contactInfo}>
                    <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:info@stridenex.ai')}>
                        <Mail color="#fff" size={16} />
                        <Text style={styles.contactText}>info@stridenex.ai</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+918668756959')}>
                        <Phone color={colors.accent.DEFAULT} size={16} />
                        <Text style={styles.contactText}>(+91) 8668756959</Text>
                    </TouchableOpacity>
                    <View style={styles.contactRow}>
                        <MapPin color={colors.success || '#10b981'} size={16} />
                        <Text style={styles.contactText}>Pune, (MH) India 411038</Text>
                    </View>
                </View>
                <View style={styles.socialIconsContainer}>
                    <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://stridenex.ai')}>
                        <Globe color={colors.text.inverse} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://linkedin.com/company/stridenex')}>
                        <Share2 color={colors.text.inverse} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://instagram.com/stridenex')}>
                        <Info color={colors.text.inverse} size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.linksGrid}>
                <View style={styles.linkCol}>
                    <Text style={styles.colTitle}>FOR STUDENTS</Text>
                    {['Skill Facilitating', 'Entrepreneur', 'Higher Education', 'Mentorship'].map(l => (
                        <Text key={l} style={styles.link}>{l}</Text>
                    ))}
                </View>
                <View style={styles.linkCol}>
                    <Text style={styles.colTitle}>FOR INSTITUTES</Text>
                    {['Industry Integration', 'Skill Analytics', 'Placement'].map(l => (
                        <Text key={l} style={styles.link}>{l}</Text>
                    ))}
                </View>
            </View>

            <View style={styles.newsletterSection}>
                <Text style={styles.colTitle}>STAY UPDATED</Text>
                <Input placeholder="Enter your email" containerStyle={{ marginBottom: spacing.sm, backgroundColor: '#1e293b', borderColor: '#334155' }} style={{ color: '#fff' }} />
                <Button title="Subscribe" variant="accent" onPress={() => {}} />
            </View>

            <View style={styles.bottomBar}>
                <Text style={styles.copyright}>© {new Date().getFullYear()} StrideNex. All rights reserved.</Text>
                <View style={styles.legalLinks}>
                    <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                        <Text style={styles.legalLink}>Privacy</Text>
                    </TouchableOpacity>
                    <Text style={styles.dot}>•</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('TermsOfUse')}>
                        <Text style={styles.legalLink}>Terms</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0f172a', // matches slate-900
        padding: spacing.xl,
        paddingTop: 40,
    },
    brandSection: { marginBottom: spacing.xl },
    logoFlex: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    logoBadge: { 
        width: 44, 
        height: 44, 
        backgroundColor: '#fff', 
        borderRadius: 22, // Circular
        alignItems: 'center', 
        justifyContent: 'center', 
        marginRight: spacing.sm,
        overflow: 'hidden'
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    title: { color: '#fff', fontSize: 20, fontWeight: '900', fontFamily: typography.fontFamily.display },
    subtitle: { color: '#94a3b8', fontSize: 12 },
    desc: { color: '#cbd5e1', fontSize: 14, lineHeight: 22, marginBottom: spacing.lg },
    contactInfo: { gap: spacing.sm },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    contactText: { color: '#cbd5e1', fontSize: 14 },
    linksGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
    linkCol: { flex: 1 },
    colTitle: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: spacing.md, letterSpacing: 1 },
    link: { color: '#94a3b8', fontSize: 14, marginBottom: spacing.sm },
    newsletterSection: { backgroundColor: '#1e293b', padding: spacing.lg, borderRadius: 16, marginBottom: spacing.xl },
    bottomBar: { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: spacing.xl, paddingBottom: spacing.lg, alignItems: 'center' },
    copyright: { color: '#64748b', fontSize: 12, marginBottom: spacing.sm },
    legalLinks: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    legalLink: { color: '#64748b', fontSize: 12 },
    dot: { color: '#64748b' },
    socialIconsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    socialIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    }
});
