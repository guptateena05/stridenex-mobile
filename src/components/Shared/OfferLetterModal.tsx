import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, Check, XCircle } from 'lucide-react-native';

interface OfferLetterModalProps {
  visible: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  isLoading: boolean;
  title?: string;
  onAccept: () => void;
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export const OfferLetterModal: React.FC<OfferLetterModalProps> = ({
  visible,
  onClose,
  pdfUrl,
  isLoading,
  title = "Offer Letter",
  onAccept,
  onReject,
  isAccepting,
  isRejecting
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.container}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>Please review carefully</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Viewer */}
          <View style={styles.viewerContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={styles.loadingText}>Generating offer letter...</Text>
              </View>
            ) : pdfUrl ? (
              <WebView 
                source={{ uri: pdfUrl }}
                style={styles.webview}
                originWhitelist={['*']}
                useWebKit={true}
              />
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Failed to load offer letter.</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn, (isLoading || isAccepting || isRejecting) && styles.disabledBtn]}
              onPress={onReject}
              disabled={isLoading || isAccepting || isRejecting}
            >
              {isRejecting ? <ActivityIndicator size="small" color="#ef4444" /> : <XCircle size={18} color="#ef4444" />}
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.acceptBtn, (isLoading || isAccepting || isRejecting || !pdfUrl) && styles.disabledBtn]}
              onPress={onAccept}
              disabled={isLoading || isAccepting || isRejecting || !pdfUrl}
            >
              {isAccepting ? <ActivityIndicator size="small" color="#ffffff" /> : <Check size={18} color="#ffffff" />}
              <Text style={styles.acceptBtnText}>Accept Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  rejectBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectBtnText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  acceptBtn: {
    backgroundColor: '#10b981',
  },
  acceptBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  }
});
