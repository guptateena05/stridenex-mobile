import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Shared/Button';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Home'>;

export const PublicHeader = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
      <TouchableOpacity 
        style={styles.headerLogoBox}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Home')}
      >
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>SN</Text>
        </View>
        <Text style={styles.headerTitle}>StrideNex</Text>
      </TouchableOpacity>
      
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
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
    minHeight: 60,
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
