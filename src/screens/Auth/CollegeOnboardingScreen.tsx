import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/Shared/Button';
import { AnimatedAuthLayout } from '@/components/layout/AnimatedAuthLayout';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

export const CollegeOnboardingScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <AnimatedAuthLayout
      title="College Onboarding"
      subtitle="Set up your institution to track student progress"
    >
      <View style={styles.formContainer}>
        <Text style={styles.infoText}>Welcome! In a full implementation, you'd complete your institutional compliance, batches, and accreditation details here.</Text>
        
        <View style={styles.actions}>
          <Button 
            title="Complete Profile" 
            variant="accent" 
            onPress={() => navigation.navigate('Login')} 
          />
          <Button 
            title="Skip Onboarding" 
            variant="outline" 
            style={styles.skipBtn}
            textStyle={styles.skipText}
            onPress={() => navigation.navigate('Login')} 
          />
        </View>
      </View>
    </AnimatedAuthLayout>
  );
};

const styles = StyleSheet.create({
  formContainer: { width: '100%', marginTop: spacing.md },
  infoText: { marginBottom: spacing.xl, lineHeight: 22, color: colors.text.secondary, fontFamily: typography.fontFamily.display },
  actions: { gap: spacing.md },
  skipBtn: { borderColor: colors.text.secondary, marginTop: spacing.md },
  skipText: { color: colors.text.secondary }
});
