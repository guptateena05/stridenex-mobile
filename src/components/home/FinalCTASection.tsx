import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Shared/Button';
import { useNavigation } from '@react-navigation/native';

export const FinalCTASection = () => {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Sparkles size={48} color="rgba(255,255,255,0.8)" style={{ marginBottom: spacing.xl }} />
                
                <Text style={styles.title}>
                    Your Future Should Not Be{"\n"}
                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Left to Chance</Text>
                </Text>
                
                <Text style={styles.desc}>
                    Discover your strengths, develop real capabilities, and move confidently toward your chosen future.
                </Text>

                <View style={styles.buttonsWrap}>
                    <Button 
                        title="Start as Student" 
                        onPress={() => navigation.navigate('Signup', { role: 'student' })}
                        style={{...styles.btn, backgroundColor: '#ffffff'}}
                        textStyle={{ color: colors.primary.DEFAULT }}
                    />
                    <Button 
                        title="Partner as Institute" 
                        variant="outline"
                        onPress={() => navigation.navigate('Signup', { role: 'college' })}
                        style={{...styles.btn, ...styles.outlineBtn}}
                        textStyle={{ color: '#ffffff' }}
                    />
                    <Button 
                        title="Hire Skilled Talent" 
                        variant="outline"
                        onPress={() => navigation.navigate('Signup', { role: 'industry' })}
                        style={{...styles.btn, ...styles.outlineBtn}}
                        textStyle={{ color: '#ffffff' }}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.primary.DEFAULT, // Use primary as base since gradient mapping to RN can be complex dynamically
        paddingVertical: 80,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        maxWidth: 500,
        width: '100%'
    },
    title: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: typography.fontFamily.display,
        marginBottom: spacing.lg,
    },
    desc: {
        fontSize: typography.fontSize.lg,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 40,
    },
    buttonsWrap: {
        width: '100%',
        gap: spacing.md,
    },
    btn: {
        width: '100%',
        height: 54,
    },
    outlineBtn: {
        borderColor: '#ffffff',
        backgroundColor: 'transparent',
    }
});
