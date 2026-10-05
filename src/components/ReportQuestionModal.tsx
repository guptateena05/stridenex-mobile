import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { X, Flag, AlertCircle } from 'lucide-react-native';
import { reportQuestion } from '../api/student.services';

interface ReportQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  questionBankId: string;
  onReported: (questionBankId: string) => void;
}

const REASON_OPTIONS = [
  { value: "wrong_answer", label: "The correct answer is wrong" },
  { value: "unclear_question", label: "Question is confusing or unclear" },
  { value: "outdated_content", label: "Content is outdated" },
  { value: "duplicate_question", label: "I've seen this question before" },
  { value: "other", label: "Other issue" },
];

export const ReportQuestionModal: React.FC<ReportQuestionModalProps> = ({
  visible,
  onClose,
  questionBankId,
  onReported,
}) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasonError, setReasonError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Reset form when opened
  React.useEffect(() => {
    if (visible) {
      setReason("");
      setDetails("");
      setReasonError(false);
      setShowDropdown(false);
    }
  }, [visible, questionBankId]);

  const handleSubmit = async () => {
    if (!reason) {
      setReasonError(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await reportQuestion({
        question_bank_id: questionBankId,
        reason,
        details: details.trim() || "",
      });

      const status = response?.message?.status;

      if (status === "reported") {
        Alert.alert("Success", "Thanks! We'll review this question.");
        onReported(questionBankId);
        onClose();
      } else if (status === "already_reported") {
        Alert.alert("Info", "You've already reported this question.");
        onReported(questionBankId);
        onClose();
      } else {
        Alert.alert("Error", "Failed to submit report. Please try again.");
        onClose();
      }
    } catch {
      Alert.alert("Error", "Failed to submit report. Please try again.");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReasonLabel = REASON_OPTIONS.find(opt => opt.value === reason)?.label || "Select a reason...";

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Flag size={20} color="#F43F5E" />
              </View>
              <View>
                <Text style={styles.title}>Report This Question</Text>
                <Text style={styles.subtitle}>Help us improve question quality</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                What is the issue? <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              
              <TouchableOpacity
                style={[styles.dropdownSelect, reasonError && styles.dropdownError]}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text style={reason ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>
                  {selectedReasonLabel}
                </Text>
              </TouchableOpacity>

              {reasonError && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color="#F43F5E" />
                  <Text style={styles.errorText}>Please select a reason before submitting.</Text>
                </View>
              )}

              {showDropdown && (
                <View style={styles.dropdownOptionsContainer}>
                  {REASON_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setReason(opt.value);
                        setReasonError(false);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={reason === opt.value ? styles.dropdownOptionTextSelected : styles.dropdownOptionText}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Additional details <Text style={styles.optionalText}>(optional)</Text>
              </Text>
              <TextInput
                value={details}
                onChangeText={(text) => {
                  if (text.length <= 500) setDetails(text);
                }}
                placeholder="Describe the issue in more detail..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                style={styles.textArea}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{details.length} / 500</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
              ) : (
                <Flag size={16} color="white" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 20,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requiredAsterisk: {
    color: '#F43F5E',
  },
  optionalText: {
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'none',
    letterSpacing: 0,
  },
  dropdownSelect: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  dropdownError: {
    borderColor: '#FDA4AF',
    backgroundColor: '#FFF1F2',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  dropdownSelectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownOptionsContainer: {
    marginTop: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  dropdownOptionTextSelected: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F43F5E',
  },
  textArea: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    minHeight: 100,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  cancelButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F43F5E',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
