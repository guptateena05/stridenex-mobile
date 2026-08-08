import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking, 
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ArrowLeft, Download, Sparkles, Eye } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

const templates = [
  { value: "classic_resume", label: "Classic" },
  { value: "compact_grid_resume", label: "Compact Grid" },
  { value: "professional_resume", label: "Professional" },
  { value: "modern_resume", label: "Modern" },
  { value: "elegant_resume", label: "Elegant" }
];

export const StudentResumePreviewScreen = () => {
  const navigation = useNavigation();
  const { userName } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState("professional_resume");
  const [webViewLoading, setWebViewLoading] = useState(true);

  const directPdfUrl = `https://devstridenex.quantcloud.in/api/method/stridenex_app.api_stridenex_app.student.student.get_student_resume?student=${encodeURIComponent(userName || "")}&template=${selectedTemplate}`;
  
  // Android webview cannot preview PDFs natively, so we load them via Google Docs Viewer
  const webViewUri = Platform.OS === 'ios' 
    ? directPdfUrl 
    : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(directPdfUrl)}`;

  useEffect(() => {
    setWebViewLoading(true);
  }, [selectedTemplate]);

  const handleDownload = () => {
    Linking.openURL(directPdfUrl).catch(err => {
      console.error("Failed to download PDF on mobile:", err);
      Alert.alert("Error", "Could not start PDF download.");
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resume Preview</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Horizontal Template Selector Scroll */}
      <View style={styles.selectorContainer}>
        <View style={styles.sectionHeader}>
          <Sparkles size={14} color="#FF6B00" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Select Template</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorScroll}
        >
          {templates.map((tpl) => {
            const isActive = selectedTemplate === tpl.value;
            return (
              <TouchableOpacity
                key={tpl.value}
                style={[
                  styles.templateTab,
                  isActive && styles.activeTemplateTab
                ]}
                onPress={() => setSelectedTemplate(tpl.value)}
              >
                <Text 
                  style={[
                    styles.templateTabTxt,
                    isActive && styles.activeTemplateTabTxt
                  ]}
                >
                  {tpl.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Live Preview Panel */}
      <View style={styles.previewContainer}>
        {webViewLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.loadingText}>Rendering Resume Preview...</Text>
          </View>
        )}
        <WebView
          key={selectedTemplate}
          source={{ uri: webViewUri }}
          style={styles.webView}
          onLoadEnd={() => setWebViewLoading(false)}
        />
      </View>

      {/* Download Action Bar */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.downloadBtn}
          onPress={handleDownload}
          activeOpacity={0.8}
        >
          <Download size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.downloadBtnText}>Download PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  selectorContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectorScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  templateTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTemplateTab: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6B00',
  },
  templateTabTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTemplateTabTxt: {
    color: '#FF6B00',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    borderRadius: 16,
    height: 50,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  }
});
