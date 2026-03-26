import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Shared/Button';
import { useNavigation } from '@react-navigation/native';

export const JoinMovement = () => {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Join the StrideNex Movement</Text>
                <Text style={styles.subtitle}>
                    Whether you are a student exploring your future, an institution strengthening outcomes, or an organization seeking capable talent — StrideNex enables growth through collaboration.
                </Text>
            </View>

            <View style={styles.buttonsWrap}>
                <Button 
                    title="Start as Student" 
                    variant="accent"
                    onPress={() => navigation.navigate('Signup', { role: 'student' })}
                    style={styles.btn}
                />
                <Button 
                    title="Partner as Institute" 
                    variant="outline"
                    onPress={() => navigation.navigate('Signup', { role: 'college' })}
                    style={styles.btn}
                />
                <Button 
                    title="Collaborate as Industry" 
                    variant="outline"
                    onPress={() => navigation.navigate('Signup', { role: 'industry' })}
                    style={styles.btn}
                />
            </View>

            <Text style={styles.footerText}>
                Start your journey with StrideNex today.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 80,
        backgroundColor: colors.background.light,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
    },
    header: { alignItems: 'center', marginBottom: 40 },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '900',
        color: colors.navy,
        textAlign: 'center',
        marginBottom: spacing.md,
        fontFamily: typography.fontFamily.display
    },
    subtitle: {
        fontSize: typography.fontSize.lg,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 28,
    },
    buttonsWrap: {
        width: '100%',
        gap: spacing.md,
        maxWidth: 400,
        marginBottom: 40,
    },
    btn: {
        width: '100%',
        height: 54,
    },
    footerText: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
    }
});
