import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getStudentGuidelines,
  completeStudentGuidelineStep,
} from '@/api/student.services';
import { Compass, X, Check, Play, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react-native';
import WebView from 'react-native-webview';

const { width, height } = Dimensions.get('window');

interface GuidelineStep {
  name: string;
  title: string;
  module: string;
  tab: string;
  step_no: number;
  description: string;
  video_url: string | null;
  image: string | null;
  is_mandatory: number;
  status: 'Pending' | 'Completed';
}

interface StudentGuidelineTourProps {
  studentEmail: string | undefined;
  onTourStateChange?: (isOpen: boolean) => void;
}

export default function StudentGuidelineTour({ studentEmail, onTourStateChange }: StudentGuidelineTourProps) {
  const [steps, setSteps] = useState<GuidelineStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completingStep, setCompletingStep] = useState(false);

  useEffect(() => {
    if (onTourStateChange) {
      onTourStateChange(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    if (studentEmail) {
      fetchGuidelines();
    }
  }, [studentEmail]);

  const fetchGuidelines = async (forceOpen = false) => {
    if (!studentEmail) return;
    setLoading(true);
    try {
      const res = await getStudentGuidelines('Student', null, studentEmail);
      const data = res?.data?.message || res?.data?.data || res?.data;
      if (data && Array.isArray(data.steps) && data.steps.length > 0) {
        const sortedSteps = [...data.steps].sort((a, b) => a.step_no - b.step_no);
        setSteps(sortedSteps);

        const dismissedStr = await AsyncStorage.getItem('dismissed_student_tour');
        const isDismissed = dismissedStr === 'true';
        const hasPending = sortedSteps.some((s) => s.status === 'Pending');

        if (forceOpen || (hasPending && !isDismissed)) {
          const firstPending = sortedSteps.findIndex((s) => s.status === 'Pending');
          setCurrentIndex(firstPending !== -1 ? firstPending : 0);
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Error loading student guidelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[currentIndex];
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;

  const getMediaUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Fallback domain if relative
    return `https://devstridenex.quantcloud.in${url}`;
  };

  const handleNext = async () => {
    if (!currentStep) return;

    if (currentStep.status === 'Pending' && studentEmail) {
      setCompletingStep(true);
      try {
        await completeStudentGuidelineStep(currentStep.name, studentEmail);
        const updatedSteps = [...steps];
        updatedSteps[currentIndex].status = 'Completed';
        setSteps(updatedSteps);
      } catch (error) {
        console.error('Error completing onboarding step:', error);
      } finally {
        setCompletingStep(false);
      }
    }

    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('dismissed_student_tour', 'true');
      setIsOpen(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('dismissed_student_tour', 'true');
    setIsOpen(false);
  };

  const handleManualOpen = () => {
    fetchGuidelines(true);
  };

  const cleanDescription = (htmlStr: string) => {
    if (!htmlStr) return '';
    return htmlStr.replace(/<[^>]*>?/gm, '').trim();
  };

  if (steps.length === 0) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleManualOpen}
        activeOpacity={0.8}
      >
        <Compass size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Sparkles size={18} color="#93C5FD" style={{ marginRight: 8 }} />
                <Text style={styles.headerStepText}>
                  STEP {currentIndex + 1} OF {totalSteps}
                </Text>
              </View>
              <Text style={styles.headerTitle}>App Guide</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleSkip}>
                <X size={20} color="#E2E8F0" />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>

            {/* Content Area */}
            {currentStep && (
              <ScrollView 
                style={styles.bodyScroll} 
                contentContainerStyle={styles.bodyContentContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Visual Preview Area */}
                <View style={styles.mediaContainer}>
                  {currentStep.image ? (
                    <Image
                      source={{ uri: getMediaUrl(currentStep.image) as string }}
                      style={styles.mediaImage}
                      resizeMode="contain"
                    />
                  ) : currentStep.video_url ? (
                    <View style={styles.videoContainer}>
                      <WebView
                        source={{ uri: getMediaUrl(currentStep.video_url) as string }}
                        style={styles.webview}
                        allowsFullscreenVideo
                        javaScriptEnabled
                      />
                    </View>
                  ) : (
                    <View style={styles.fallbackMedia}>
                      <Compass size={48} color="#94A3B8" />
                      <Text style={styles.fallbackText}>Explore Feature</Text>
                    </View>
                  )}
                </View>

                {/* Text Content Area */}
                <View style={styles.textContainer}>
                  {currentStep.tab && (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>Feature: {currentStep.tab}</Text>
                    </View>
                  )}
                  <Text style={styles.stepTitle}>{currentStep.title}</Text>
                  <Text style={styles.stepDescription}>
                    {cleanDescription(currentStep.description)}
                  </Text>

                  <View style={styles.statusRow}>
                    <View style={[
                      styles.statusBadge, 
                      currentStep.status === 'Completed' ? styles.statusCompleted : styles.statusPending
                    ]}>
                      {currentStep.status === 'Completed' ? (
                        <>
                          <Check size={12} color="#15803D" style={{ marginRight: 4 }} />
                          <Text style={styles.statusCompletedText}>Completed</Text>
                        </>
                      ) : (
                        <>
                          <View style={styles.dotPending} />
                          <Text style={styles.statusPendingText}>To Explore</Text>
                        </>
                      )}
                    </View>
                    {currentStep.is_mandatory === 1 && (
                      <View style={styles.mandatoryBadge}>
                        <Text style={styles.mandatoryBadgeText}>MANDATORY</Text>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Footer Navigation */}
            <View style={styles.footerControls}>
              <TouchableOpacity
                style={[styles.btnOutline, currentIndex === 0 && styles.btnDisabled]}
                onPress={handleBack}
                disabled={currentIndex === 0 || completingStep}
              >
                <ChevronLeft size={18} color={currentIndex === 0 ? '#94A3B8' : '#475569'} />
                <Text style={[styles.btnOutlineText, currentIndex === 0 && styles.btnTextDisabled]}>
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnPrimary, completingStep && styles.btnDisabled]}
                onPress={handleNext}
                disabled={completingStep}
              >
                {completingStep ? (
                  <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                ) : null}
                <Text style={styles.btnPrimaryText}>
                  {currentIndex === totalSteps - 1 ? "Finish Tour" : "Continue"}
                </Text>
                {!completingStep && <ChevronRight size={18} color="#FFF" />}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E3A8A', // matches royal/primary vibe
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStepText: {
    color: '#DBEAFE',
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6', // Accent
  },
  bodyScroll: {
    flexShrink: 1,
  },
  bodyContentContainer: {
    padding: 20,
  },
  mediaContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
  },
  fallbackMedia: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  textContainer: {
    flex: 1,
  },
  tabBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  tabBadgeText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 28,
  },
  stepDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  statusPending: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  statusCompletedText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  statusPendingText: {
    color: '#C2410C',
    fontSize: 12,
    fontWeight: '600',
  },
  dotPending: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
    marginRight: 6,
  },
  mandatoryBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mandatoryBadgeText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
  },
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFF',
  },
  btnOutlineText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 6,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnTextDisabled: {
    color: '#94A3B8',
  },
});
