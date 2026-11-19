import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { getUserSubscriptionDashboard } from './student.services';

/**
 * Checks whether the student has an active paid subscription plan.
 */
export const isStudentPlanActive = (dashboardData: any): boolean => {
  if (!dashboardData) return false;

  // 1. Check active_subscription
  if (
    dashboardData.active_subscription &&
    dashboardData.active_subscription.is_active !== false &&
    String(dashboardData.active_subscription.payment_status || '').toLowerCase() !== 'unpaid' &&
    String(dashboardData.active_subscription.payment_status || '').toLowerCase() !== 'failed'
  ) {
    return true;
  }

  // 2. Check summary active_subscription
  if (
    dashboardData.summary?.active_subscription === true &&
    dashboardData.summary?.current_package &&
    !String(dashboardData.summary.current_package).toLowerCase().includes('free')
  ) {
    return true;
  }

  // 3. Check history
  if (Array.isArray(dashboardData.history)) {
    const hasPaidActiveInHistory = dashboardData.history.some(
      (item: any) =>
        item.is_active !== false &&
        String(item.payment_status || '').toLowerCase() === 'paid'
    );
    if (hasPaidActiveInHistory) return true;
  }

  return false;
};

/**
 * Fetches the user subscription dashboard, determines plan status, and caches it in AsyncStorage.
 */
export const fetchAndCacheStudentPlanStatus = async (): Promise<boolean> => {
  try {
    const res = await getUserSubscriptionDashboard();
    const isActive = isStudentPlanActive(res);
    await AsyncStorage.setItem('has_active_student_plan', isActive ? 'true' : 'false');
    DeviceEventEmitter.emit('PLAN_UPDATED', { isActive });
    return isActive;
  } catch (err) {
    console.log('Error fetching student plan status on mobile, defaulting to inactive:', err);
    await AsyncStorage.setItem('has_active_student_plan', 'false');
    DeviceEventEmitter.emit('PLAN_UPDATED', { isActive: false });
    return false;
  }
};

/**
 * Returns cached plan status from AsyncStorage, or null if not yet determined.
 */
export const getCachedStudentPlanStatus = async (): Promise<boolean | null> => {
  try {
    const cached = await AsyncStorage.getItem('has_active_student_plan');
    if (cached === null) return null;
    return cached === 'true';
  } catch {
    return null;
  }
};
