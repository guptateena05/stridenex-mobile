import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Lock, Sparkles, X, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';

interface LmsUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: string;
  onUpgrade?: () => void;
}

const FEATURES = [
  'Complete course creation & curriculum authoring',
  'Cohort, batch & live session scheduling',
  'Interactive quizzes, assignments & coding tests',
  'Automated certificate generation & grading',
];

export const LmsUpgradeModal: React.FC<LmsUpgradeModalProps> = ({
  isOpen,
  onClose,
  role,
  onUpgrade,
}) => {
  const navigation = useNavigation<any>();

  const handleUpgradeClick = () => {
    onClose();
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    // Universal fallback: every drawer navigator (College, Industry, Mentor, Student) has 'Plans' screen
    try {
      navigation.navigate('Plans');
    } catch (err) {
      console.warn('[LmsUpgradeModal] Failed to navigate to Plans:', err);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.cardContainer}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close"
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>

              {/* Header Icon & Badge */}
              <View style={styles.header}>
                <View style={styles.lockIconBox}>
                  <Lock size={30} color="#FFFFFF" />
                </View>

                <View style={styles.proBadge}>
                  <Sparkles size={12} color="#1D4ED8" />
                  <Text style={styles.proBadgeText}>Pro Feature</Text>
                </View>

                <Text style={styles.title}>Unlock LMS Studio with Pro</Text>
                <Text style={styles.subtitle}>
                  Course authoring, batch management, quizzes, and certificates are available on our Pro plan.
                </Text>
              </View>

              {/* Feature Highlights */}
              <View style={styles.featuresContainer}>
                {FEATURES.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <CheckCircle2 size={16} color="#10B981" style={styles.featureIcon} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.upgradeBtn}
                  onPress={handleUpgradeClick}
                  activeOpacity={0.85}
                >
                  <Text style={styles.upgradeBtnText}>Upgrade Plan</Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Maybe Later</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LmsUpgradeModal;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: Math.min(width - 40, 400),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 22,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  lockIconBox: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 8,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  featuresContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 10,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },
  actionsContainer: {
    gap: 8,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
});
