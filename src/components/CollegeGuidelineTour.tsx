import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  DeviceEventEmitter,
  Pressable
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Target,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Sparkles
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface MobileTabTourStep {
  id: string;
  name: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  description: string;
}

export const MOBILE_COLLEGE_TABS: MobileTabTourStep[] = [
  {
    id: 'overview',
    name: 'Overview',
    title: 'Overview Dashboard',
    badge: 'Command Center',
    icon: LayoutDashboard,
    description: 'Real-time institutional dashboard displaying placement metrics, active student counts, skill gap analytics, and company recruitment updates.'
  },
  {
    id: 'students',
    name: 'Student Analytics',
    title: 'Student Analytics',
    badge: 'Cohort Insights',
    icon: Users,
    description: 'Monitor cohort progress, batch performance, skill competency distributions, and verified credentials across departments.'
  },
  {
    id: 'drives',
    name: 'Campus Drives',
    title: 'Campus Recruitment Drives',
    badge: 'Placements',
    icon: Briefcase,
    description: 'Manage active campus drives, company eligibility criteria, student shortlist rounds, and placements in real time.'
  },
  {
    id: 'interventions',
    name: 'Interventions',
    title: 'Targeted Interventions',
    badge: 'Action Plans',
    icon: Target,
    description: 'Identify at-risk students and launch targeted skill interventions to boost institutional placement readiness.'
  },
  {
    id: 'notices',
    name: 'Notice Board',
    title: 'Campus Notice Board',
    badge: 'Bulletins',
    icon: BookOpen,
    description: 'Publish and review campus bulletins, placement notices, circulars, and important academic updates.'
  }
];

interface CollegeGuidelineTourProps {
  collegeEmail?: string;
  onTourStateChange?: (isOpen: boolean) => void;
  disabled?: boolean;
  isFirstLogin?: boolean;
}

export default function CollegeGuidelineTour({
  collegeEmail,
  onTourStateChange,
  disabled,
  isFirstLogin = false
}: CollegeGuidelineTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (onTourStateChange) {
      onTourStateChange(isOpen);
    }
  }, [isOpen, onTourStateChange]);

  const startTour = useCallback(async () => {
    if (disabled) return;
    setCurrentIndex(0);
    setIsOpen(true);
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;
    let timer: any = null;
    let isMounted = true;

    const checkTourStatus = async () => {
      try {
        const userKey = collegeEmail ? `has_seen_college_tour_${collegeEmail}` : 'has_seen_college_tour';
        const hasSeen = await AsyncStorage.getItem(userKey);
        // ONLY auto-launch if explicitly first-time login
        if (isFirstLogin && !hasSeen && isMounted) {
          timer = setTimeout(() => {
            if (isMounted) {
              startTour();
            }
          }, 800);
        }
      } catch (e) {
        console.log('Error checking college tour status:', e);
      }
    };

    checkTourStatus();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [disabled, startTour, collegeEmail, isFirstLogin]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('START_COLLEGE_TAB_TOUR', () => {
      startTour();
    });

    return () => {
      sub.remove();
    };
  }, [startTour]);

  const finishTour = async () => {
    setIsOpen(false);
    try {
      const userKey = collegeEmail ? `has_seen_college_tour_${collegeEmail}` : 'has_seen_college_tour';
      await AsyncStorage.setItem(userKey, 'true');
    } catch (e) {
      console.log('Error saving college tour completion:', e);
    }
  };

  const handleNext = () => {
    if (currentIndex < MOBILE_COLLEGE_TABS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishTour();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!isOpen) {
    return (
      <TouchableOpacity
        style={styles.floatingTrigger}
        onPress={startTour}
        activeOpacity={0.8}
        accessibilityLabel="Start Tabs Tour"
        accessibilityRole="button"
      >
        <Compass size={18} color="#10B981" />
        <Text style={styles.floatingTriggerText}>Tabs Guide</Text>
      </TouchableOpacity>
    );
  }

  const currentTab = MOBILE_COLLEGE_TABS[currentIndex] || MOBILE_COLLEGE_TABS[0];
  const totalTabs = MOBILE_COLLEGE_TABS.length;
  const StepIcon = currentTab.icon;

  const tabWidth = SCREEN_WIDTH / totalTabs;
  const tabCenterX = (currentIndex + 0.5) * tabWidth;
  const bottomBarHeight = Platform.OS === 'ios' ? 85 : 70;

  const popupWidth = Math.min(340, SCREEN_WIDTH - 32);
  const halfPopup = popupWidth / 2;
  let popupLeft = tabCenterX - halfPopup;
  if (popupLeft < 16) popupLeft = 16;
  if (popupLeft + popupWidth > SCREEN_WIDTH - 16) {
    popupLeft = SCREEN_WIDTH - popupWidth - 16;
  }
  const arrowLeft = Math.max(16, Math.min(popupWidth - 16, tabCenterX - popupLeft));

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={finishTour}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdropPressable} onPress={finishTour} />

        <View
          style={[
            styles.tabSpotlight,
            {
              left: tabCenterX - 28,
              bottom: Platform.OS === 'ios' ? 28 : 12,
            }
          ]}
          pointerEvents="none"
        >
          <View style={styles.tabSpotlightInner}>
            <StepIcon size={24} color="#10B981" strokeWidth={2.5} />
          </View>
        </View>

        <View
          style={[
            styles.popupCard,
            {
              left: popupLeft,
              width: popupWidth,
              bottom: bottomBarHeight + 20,
            }
          ]}
        >
          <View
            style={[
              styles.downArrow,
              { left: arrowLeft - 8 }
            ]}
          />

          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <StepIcon size={18} color="#10B981" strokeWidth={2.5} />
              </View>
              <View>
                <View style={styles.badgeRow}>
                  <Text style={styles.badgeText}>{currentTab.badge}</Text>
                  <Text style={styles.stepCounterText}>
                    {currentIndex + 1} of {totalTabs}
                  </Text>
                </View>
                <Text style={styles.tabTitle}>{currentTab.name}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={finishTour}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.descriptionText}>{currentTab.description}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.dotsRow}>
              {MOBILE_COLLEGE_TABS.map((tab, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setCurrentIndex(idx)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    style={[
                      styles.dot,
                      isActive ? styles.dotActive : styles.dotInactive
                    ]}
                  />
                );
              })}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={handlePrev}
                disabled={currentIndex === 0}
                style={[
                  styles.prevBtn,
                  currentIndex === 0 && styles.btnDisabled
                ]}
                activeOpacity={0.7}
              >
                <ChevronLeft size={16} color={currentIndex === 0 ? '#CBD5E1' : '#475569'} />
                <Text
                  style={[
                    styles.prevBtnText,
                    currentIndex === 0 && styles.prevBtnTextDisabled
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <View style={styles.rightActions}>
                <TouchableOpacity
                  onPress={finishTour}
                  style={styles.skipBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipBtnText}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNext}
                  style={styles.nextBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextBtnText}>
                    {currentIndex === totalTabs - 1 ? 'Finish' : 'Next'}
                  </Text>
                  {currentIndex === totalTabs - 1 ? (
                    <Sparkles size={15} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  ) : (
                    <ChevronRight size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  tabSpotlight: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 9999,
  },
  tabSpotlightInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'visible',
    zIndex: 10000,
  },
  downArrow: {
    position: 'absolute',
    bottom: -8,
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    transform: [{ rotate: '45deg' }],
    zIndex: 10001,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    textTransform: 'uppercase',
  },
  stepCounterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '400',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#10B981',
  },
  dotInactive: {
    width: 7,
    backgroundColor: '#CBD5E1',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  prevBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 2,
  },
  prevBtnTextDisabled: {
    color: '#CBD5E1',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  nextBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 2,
  },
  floatingTrigger: {
    position: 'absolute',
    bottom: 85,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    gap: 6,
    zIndex: 999,
  },
  floatingTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
});
