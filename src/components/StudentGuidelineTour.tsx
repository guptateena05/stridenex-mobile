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
  Zap,
  FolderGit2,
  Briefcase,
  Award,
  PieChart,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Sparkles
} from 'lucide-react-native';
import { colors } from '@/theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface MobileTabTourStep {
  id: string;
  name: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  description: string;
}

export const MOBILE_STUDENT_TABS: MobileTabTourStep[] = [
  {
    id: 'overview',
    name: 'Overview',
    title: 'Overview Dashboard',
    badge: 'Home Base',
    icon: LayoutDashboard,
    description: 'Your central hub for tracking your skill readiness score, weekly habit heatmaps, recent opportunity alerts, and quick profile actions.'
  },
  {
    id: 'skill-ledger',
    name: 'Skill Ledger',
    title: 'Verified Skill Ledger',
    badge: 'Competencies',
    icon: Zap,
    description: 'Your digital competency passport. Track and verify your technical, problem-solving, and soft skills with verified badges.'
  },
  {
    id: 'projects',
    name: 'Projects',
    title: 'Project Portfolio',
    badge: 'Proof of Work',
    icon: FolderGit2,
    description: 'Showcase capstone, academic, and open-source projects with live demo URLs, GitHub repositories, and tech stacks for recruiters.'
  },
  {
    id: 'internships',
    name: 'Internships',
    title: 'Industry Internships',
    badge: 'Hands-on',
    icon: Briefcase,
    description: 'Discover and apply for verified corporate internships tailored to your branch, academic year, and verified skill set.'
  },
  {
    id: 'jobs',
    name: 'Jobs',
    title: 'Full-Time Jobs',
    badge: 'Placements',
    icon: Award,
    description: 'Explore entry-level jobs and placement opportunities from verified hiring partners, with real-time application tracking.'
  },
  {
    id: 'habits',
    name: 'Habits',
    title: 'Learning Habits',
    badge: 'Consistency',
    icon: PieChart,
    description: 'Build daily study discipline. Monitor coding practice streaks, problem-solving goals, and weekly activity consistency.'
  }
];

interface StudentGuidelineTourProps {
  studentEmail?: string;
  onTourStateChange?: (isOpen: boolean) => void;
  disabled?: boolean;
  isFirstLogin?: boolean;
  onTourClose?: () => void;
}

export default function StudentGuidelineTour({
  studentEmail,
  onTourStateChange,
  disabled,
  isFirstLogin = false,
  onTourClose
}: StudentGuidelineTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTabs, setActiveTabs] = useState<MobileTabTourStep[]>(MOBILE_STUDENT_TABS);

  useEffect(() => {
    if (onTourStateChange) {
      onTourStateChange(isOpen);
    }
  }, [isOpen, onTourStateChange]);

  const startTour = useCallback(async () => {
    if (disabled) return;
    setActiveTabs(MOBILE_STUDENT_TABS);
    setCurrentIndex(0);
    setIsOpen(true);
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;
    let timer: any = null;
    let isMounted = true;

    const checkTourStatus = async () => {
      try {
        const userKey = studentEmail ? `has_seen_student_tour_${studentEmail}` : 'has_seen_student_tour';
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
        console.log('Error checking tour status:', e);
      }
    };

    checkTourStatus();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [disabled, startTour, studentEmail, isFirstLogin]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('START_STUDENT_TAB_TOUR', () => {
      startTour();
    });

    return () => {
      sub.remove();
    };
  }, [startTour]);

  const finishTour = async () => {
    setIsOpen(false);
    try {
      const userKey = studentEmail ? `has_seen_student_tour_${studentEmail}` : 'has_seen_student_tour';
      await AsyncStorage.setItem(userKey, 'true');
      await AsyncStorage.setItem('dismissed_student_tour', 'true');
    } catch (e) {
      console.log('Error saving tour completion:', e);
    }
    if (onTourClose) {
      onTourClose();
    }
  };

  const handleNext = () => {
    if (currentIndex < activeTabs.length - 1) {
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
        <Compass size={18} color="#EA580C" />
        <Text style={styles.floatingTriggerText}>Tabs Guide</Text>
      </TouchableOpacity>
    );
  }

  const currentTab = activeTabs[currentIndex] || activeTabs[0];
  const totalTabs = activeTabs.length;
  const StepIcon = currentTab.icon;

  // Geometry calculations for bottom tab bar
  const tabWidth = SCREEN_WIDTH / totalTabs;
  const tabCenterX = (currentIndex + 0.5) * tabWidth;
  const bottomBarHeight = Platform.OS === 'ios' ? 85 : 70;

  // Popup positioning
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
        {/* Semi-transparent backdrop */}
        <Pressable style={styles.backdropPressable} onPress={finishTour} />

        {/* Highlight spotlight over the active bottom tab */}
        <View
          style={[
            styles.tabSpotlight,
            {
              left: tabCenterX - 28,
              bottom: (Platform.OS === 'ios' ? 28 : 12),
            }
          ]}
          pointerEvents="none"
        >
          <View style={styles.tabSpotlightInner}>
            <StepIcon size={24} color="#EA580C" strokeWidth={2.5} />
          </View>
        </View>

        {/* Small Tour Popup anchored directly above the highlighted tab */}
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
          {/* Downward-pointing arrow caret */}
          <View
            style={[
              styles.downArrow,
              { left: arrowLeft - 8 }
            ]}
          />

          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <StepIcon size={18} color="#EA580C" strokeWidth={2.5} />
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

          {/* Description */}
          <View style={styles.cardBody}>
            <Text style={styles.descriptionText}>{currentTab.description}</Text>
          </View>

          {/* Carousel Dots & Controls Footer */}
          <View style={styles.cardFooter}>
            {/* Carousel Indicator Dots */}
            <View style={styles.dotsRow}>
              {activeTabs.map((tab, idx) => {
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

            {/* Action Buttons: Previous & Next/Finish */}
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
    borderColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
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
    backgroundColor: '#FFF7ED',
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#EA580C',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stepCounterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTitle: {
    fontSize: 15,
    fontWeight: '700',
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
    paddingVertical: 14,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    fontWeight: '400',
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    marginBottom: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#EA580C',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
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
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
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
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
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
    color: '#EA580C',
  },
});
