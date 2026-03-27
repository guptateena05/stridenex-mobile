import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Shared/Button';
import logo from '../../assets/images/Logo.png'

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Home'>;

export const PublicHeader = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
      <View style={styles.leftGroup}>
        {navigation.canGoBack() && (
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft color={colors.navy} size={28} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.headerLogoBox}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Home')}
        >
          <View style={styles.logoBadge}>
            <Image source={require('@/assets/images/circularLogo.jpg')} style={styles.logoBadgeImage} resizeMode="cover" />
          </View>
          <Text style={styles.headerTitle}>StrideNex</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerActions}>
        <Button
          title="Log in"
          variant="outline"
          size="sm"
          fullWidth={false}
          onPress={() => navigation.navigate('Login')}
          style={styles.loginBtn}
          textStyle={styles.loginBtnTxt}
        />
        <Button
          title="Join now"
          variant="accent"
          size="sm"
          fullWidth={false}
          onPress={() => navigation.navigate('Signup')}
          style={styles.joinBtn}
          textStyle={styles.joinBtnTxt}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 10,
    minHeight: 70,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 15, 189, 0.05)',
  },
  logoImage: {
    width: 140,
    height: 45,
  },
  headerLogoBox: { flexDirection: 'row', alignItems: 'center' },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm
  },
  logoBadgeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  logoText: { color: '#ffffff', fontWeight: 'bold', fontFamily: typography.fontFamily.display },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.navy, fontFamily: typography.fontFamily.display },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  loginBtn: {
    backgroundColor: 'transparent',
    borderColor: colors.accent.DEFAULT,
  },
  loginBtnTxt: { fontWeight: 'bold', color: colors.accent.DEFAULT },
  joinBtn: {
    backgroundColor: colors.accent.DEFAULT,
    borderWidth: 0,
  },
  joinBtnTxt: { fontWeight: 'bold', color: '#fff' }
});
