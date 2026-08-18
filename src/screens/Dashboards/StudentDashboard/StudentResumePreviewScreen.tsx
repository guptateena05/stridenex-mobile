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
import { ArrowLeft, Download, Sparkles, Eye, Upload } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from '@react-native-documents/picker';
import { BASE_URL } from '@/api/api.services';
import { Dirs, FileSystem } from 'react-native-file-access';

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
  const [base64Pdf, setBase64Pdf] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const directPdfUrl = `${BASE_URL}method/stridenex_app.api_stridenex_app.student.student.get_student_resume?student=${encodeURIComponent(userName || "")}&template=${selectedTemplate}`;

  useEffect(() => {
    let isActive = true;
    const fetchPdf = async () => {
      setWebViewLoading(true);
      setErrorMsg(null);
      setBase64Pdf(null);
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const token = storedToken ? storedToken.trim() : null;
        
        const localPath = `${Dirs.CacheDir}/resume_preview.pdf`;
        const headers: any = {};
        if (token) {
          headers["Authorization"] = `token ${token}`;
        }
        
        const res = await FileSystem.fetch(directPdfUrl, {
          method: 'GET',
          headers,
          path: localPath
        });
        
        if (res.ok) {
          const b64 = await FileSystem.readFile(localPath, 'base64');
          if (isActive) {
             setBase64Pdf(b64);
          }
        } else {
          if (isActive) {
             setErrorMsg(`Error loading preview: ${res.status}`);
          }
        }
      } catch (err: any) {
         if (isActive) setErrorMsg(err?.message || "Failed to fetch PDF");
      } finally {
         if (isActive) setWebViewLoading(false);
      }
    };
    fetchPdf();
    return () => { isActive = false; };
  }, [selectedTemplate, directPdfUrl, userName]);

  const handleDownload = () => {
    Linking.openURL(directPdfUrl).catch(err => {
      console.error("Failed to download PDF on mobile:", err);
      Alert.alert("Error", "Could not start PDF download.");
    });
  };

  const handleResumePickAndUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.docx, DocumentPicker.types.doc, DocumentPicker.types.allFiles],
        allowMultiSelection: false,
      });

      if (result) {
        const file = Array.isArray(result) ? result[0] : result;
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert('File Size Error', 'File size should be less than 10MB');
          return;
        }
        
        // Start upload
        setUploading(true);
        const fd = new FormData();
        fd.append("doctype", "Student");
        fd.append("docname", userName || "");
        fd.append("fieldname", "resume");
        fd.append("is_private", "0");
        fd.append("file", {
          uri: file.uri,
          type: file.type || 'application/pdf',
          name: file.name || 'resume.pdf'
        } as any);

        const storedToken = await AsyncStorage.getItem("token");
        const token = storedToken ? storedToken.trim() : null;
        const headers: Record<string, string> = {
          "Content-Type": "multipart/form-data",
        };
        if (token) {
          headers["Authorization"] = `token ${token}`;
        }

        const response = await fetch(`${BASE_URL}method/stridenex_app.api_stridenex_app.app.upload_file_api`, {
          method: "POST",
          headers,
          body: fd
        });

        const resText = await response.text();
        console.log("Upload response:", resText);
        
        let resJson: any = {};
        try {
          resJson = JSON.parse(resText);
        } catch(e) {}

        if (response.ok) {
          Alert.alert("Success", "Resume uploaded successfully!");
        } else {
          Alert.alert("Error", resJson?.message || "Failed to upload resume.");
        }
      }
    } catch (err: any) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED' || err.code === 'CANCELED') {
        console.log("User cancelled file selection");
      } else {
        console.error("Resume file pick error:", err);
        Alert.alert("Error", err?.message || "Something went wrong during picker/upload.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
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
        {errorMsg ? (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : base64Pdf ? (
          <WebView
            key={selectedTemplate}
            originWhitelist={['*']}
            source={{ html: `
              <!DOCTYPE html>
              <html>
              <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
              <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
              <style>
                body { margin:0; padding:0; background-color: #f8fafc; text-align: center; }
                canvas { width: 100%; height: auto; margin: 0 auto 16px auto; display: block; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); background-color: white; }
                #loading { font-family: sans-serif; color: #64748b; font-size: 14px; margin-top: 50px; }
              </style>
              </head>
              <body>
              <div id="pdf-container"></div>
              <script>
                try {
                  const pdfData = atob("${base64Pdf}");
                  const uint8Array = new Uint8Array(pdfData.length);
                  for (let i = 0; i < pdfData.length; i++) {
                    uint8Array[i] = pdfData.charCodeAt(i);
                  }
                  
                  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                  
                  pdfjsLib.getDocument({data: uint8Array}).promise.then(pdf => {
                    const container = document.getElementById('pdf-container');
                    
                    const renderPage = (pageNum) => {
                      pdf.getPage(pageNum).then(page => {
                        const scale = window.devicePixelRatio || 1;
                        const viewport = page.getViewport({scale: 1.5});
                        
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        canvas.height = viewport.height * scale;
                        canvas.width = viewport.width * scale;
                        canvas.style.height = viewport.height + 'px';
                        canvas.style.width = viewport.width + 'px';
                        ctx.scale(scale, scale);
                        
                        container.appendChild(canvas);
                        page.render({canvasContext: ctx, viewport: viewport}).promise.then(() => {
                          if(pageNum < pdf.numPages) {
                            renderPage(pageNum + 1);
                          } else {
                             window.ReactNativeWebView.postMessage('loaded');
                          }
                        });
                      });
                    };
                    
                    if(pdf.numPages > 0) renderPage(1);
                  }).catch(err => {
                    window.ReactNativeWebView.postMessage('error:' + err.message);
                  });
                } catch(e) {
                  window.ReactNativeWebView.postMessage('error:' + e.message);
                }
              </script>
              </body>
              </html>
            ` }}
            style={styles.webView}
            onMessage={(event) => {
              if (event.nativeEvent.data === 'loaded') {
                setWebViewLoading(false);
              } else if (event.nativeEvent.data.startsWith('error:')) {
                setWebViewLoading(false);
                setErrorMsg(event.nativeEvent.data);
              }
            }}
          />
        ) : null}
      </View>

      {/* Action Bar */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.downloadBtnSecondary}
          onPress={handleDownload}
          activeOpacity={0.8}
        >
          <Download size={18} color="#FF6B00" style={{ marginRight: 8 }} />
          <Text style={styles.downloadBtnTextSecondary}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.uploadBtn}
          onPress={handleResumePickAndUpload}
          activeOpacity={0.8}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Upload size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.uploadBtnText}>Upload</Text>
            </>
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTemplateTab: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  templateTabTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTemplateTabTxt: {
    color: '#FFFFFF',
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
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  downloadBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    borderRadius: 16,
    height: 50,
  },
  downloadBtnTextSecondary: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF6B00',
  },
  uploadBtn: {
    flex: 1,
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
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  }
});
