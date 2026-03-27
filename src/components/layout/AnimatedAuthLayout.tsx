import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Animated, TouchableOpacity, Image } from 'react-native';
import { Home } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import circularLogo from '@/assets/images/circularLogo.jpg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  appName?: string;
}

export const AnimatedAuthLayout = ({
  children,
  title,
  subtitle,
  appName = "StrideNex"
}: AuthLayoutProps) => {
  const navigation = useNavigation<any>();

  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, useNativeDriver: true })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5000, useNativeDriver: true })
      ])
    ).start();
  }, [orb1Anim, orb2Anim]);

  const translateY1 = orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const scale1 = orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const translateY2 = orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });
  const scale2 = orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.orb1, { transform: [{ translateY: translateY1 }, { scale: scale1 }] }]} />
      <Animated.View style={[styles.orb2, { transform: [{ translateY: translateY2 }, { scale: scale2 }] }]} />
      
      <View style={styles.radialPatternOverlay} />

      <KeyboardAvoidingView style={{ flex: 1, zIndex: 2 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* <TouchableOpacity 
            style={styles.homeBtn}
            onPress={() => navigation.navigate('PublicTabs', { screen: 'Home' })}
          >
            <Home color="white" size={20} />
          </TouchableOpacity> */}

          <View style={styles.contentWrapper}>
            <View style={styles.brandContainer}>
              <View style={styles.logoContainer}>
                <Image 
                  source={circularLogo} 
                  style={styles.logoImage} 
                  resizeMode="cover"
                />
              </View>
              <View>
                <Text style={styles.appName}>{appName}</Text>
                <Text style={styles.appTagline}>Pathways to Your Future</Text>
              </View>
            </View>

            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {children}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  radialPatternOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)', 
    zIndex: 1,
  },
  orb1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(15, 15, 189, 0.15)', 
    zIndex: 0,
  },
  orb2: {
    position: 'absolute',
    bottom: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 107, 0, 0.15)', 
    zIndex: 0,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: 80,
    justifyContent: 'center',
    zIndex: 10,
  },
  homeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 20,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    padding: spacing.xl,
    borderRadius: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28, // Circular
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    fontFamily: typography.fontFamily.display,
  },
  appTagline: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.display,
  },
  headerTextContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    fontFamily: typography.fontFamily.display,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.display,
  },
});
