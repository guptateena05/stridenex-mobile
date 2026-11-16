import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/api.services';

/**
 * Utility to verify and enforce LMS Studio access based on role & subscription plans
 * Identical logic to StrideNex web (src/utils/lmsAccess.ts)
 */
export async function checkLmsAccess(emailOverride?: string | null): Promise<boolean> {
  const role = ((await AsyncStorage.getItem('role')) || '').toLowerCase();
  const rolesStr = ((await AsyncStorage.getItem('roles')) || '').toLowerCase();

  // 1. PARTNER HAS NO PLANS: Partner users have NO plan restrictions and 100% free full authoring
  if (role.includes('partner') || rolesStr.includes('partner')) {
    await AsyncStorage.setItem('has_lms_access', 'true');
    await AsyncStorage.setItem('isInstructor', 'true');
    return true;
  }

  // 2. Administrators always have 100% full access
  try {
    const rawRoles = await AsyncStorage.getItem('roles');
    if (rawRoles) {
      const parsed = rawRoles.startsWith('[') ? JSON.parse(rawRoles) : rawRoles;
      const isAdmin = Array.isArray(parsed)
        ? parsed.some((r: string) => ['administrator', 'system manager'].includes(r.toLowerCase()))
        : /administrator|system manager/i.test(rawRoles);
      if (isAdmin) {
        await AsyncStorage.setItem('has_lms_access', 'true');
        await AsyncStorage.setItem('isInstructor', 'true');
        return true;
      }
    }
  } catch {}

  // 3. For College, Industry, Mentor and other accounts: Live backend verification
  try {
    const userEmail =
      emailOverride ||
      (await AsyncStorage.getItem('userName')) ||
      (await AsyncStorage.getItem('userEmail')) ||
      '';

    if (!userEmail) return false;

    const res = await api.post('method/lms.lms.stride_lms.check_lms_access', {
      user: userEmail,
    });

    const hasAccess = Boolean(res?.data?.message?.has_access);
    const isInstructor = Boolean(res?.data?.message?.is_instructor ?? hasAccess);

    if (hasAccess) {
      await AsyncStorage.setItem('has_lms_access', 'true');
      await AsyncStorage.setItem('isInstructor', isInstructor ? 'true' : 'false');
      return true;
    } else {
      await AsyncStorage.setItem('has_lms_access', 'false');
      await AsyncStorage.setItem('isInstructor', 'false');
      return false;
    }
  } catch (err) {
    console.warn('[LMS Access] Error checking LMS access:', err);
    return false;
  }
}

/**
 * Reusable hook to handle LMS Studio click, checking access and either
 * navigating to WebLms or showing the LmsUpgradeModal.
 */
export const useLmsAccess = () => {
  const [checkingLms, setCheckingLms] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigation = useNavigation<any>();
  const { userName, role } = useAuth();

  const handleOpenLmsStudio = useCallback(
    async (emailOverride?: string) => {
      if (checkingLms) return;
      setCheckingLms(true);
      try {
        const effectiveEmail = emailOverride || userName || '';
        const allowed = await checkLmsAccess(effectiveEmail);

        if (allowed) {
          navigation.navigate('WebLms', {
            url: 'https://testwebstridenex.quantcloud.in/lms/courses?source=mobile',
          });
        } else {
          setShowUpgradeModal(true);
        }
      } catch (err) {
        setShowUpgradeModal(true);
      } finally {
        setCheckingLms(false);
      }
    },
    [checkingLms, userName, navigation]
  );

  return {
    checkingLms,
    showUpgradeModal,
    setShowUpgradeModal,
    handleOpenLmsStudio,
    role,
  };
};
