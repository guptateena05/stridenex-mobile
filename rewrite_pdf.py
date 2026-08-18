import re
with open('/Users/teenagupta/Desktop/Quantbit/stridenex-mobile/src/screens/Dashboards/StudentDashboard/StudentResumePreviewScreen.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace("import { BASE_URL } from '@/api/api.services';", "import { BASE_URL } from '@/api/api.services';\nimport { Dirs, FileSystem } from 'react-native-file-access';")

# Update state variables and URL
old_state = """  const [webViewLoading, setWebViewLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  // Construct URL using BASE_URL
  const directPdfUrl = `${BASE_URL}method/stridenex_app.api_stridenex_app.student.student.get_student_resume?student=${encodeURIComponent(userName || "")}&template=${selectedTemplate}`;
  
  // Android webview cannot preview PDFs natively, so we load them via Google Docs Viewer
  const webViewUri = Platform.OS === 'ios' 
    ? directPdfUrl 
    : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(directPdfUrl)}`;

  useEffect(() => {
    setWebViewLoading(true);
  }, [selectedTemplate]);"""

new_state = """  const [webViewLoading, setWebViewLoading] = useState(true);
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
  }, [selectedTemplate, directPdfUrl, userName]);"""

content = content.replace(old_state, new_state)

# Replace WebView JSX
old_webview = """        <WebView
          key={selectedTemplate}
          source={{ uri: webViewUri }}
          style={styles.webView}
          onLoadEnd={() => setWebViewLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setWebViewLoading(false);
            console.error('WebView error: ', nativeEvent);
            Alert.alert("Preview Error", `Failed to load preview: ${nativeEvent.description}`);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setWebViewLoading(false);
            console.error('WebView HTTP error: ', nativeEvent);
            Alert.alert("Preview Error", `HTTP Error ${nativeEvent.statusCode} occurred while loading the preview.`);
          }}
        />"""

new_webview = """        {errorMsg ? (
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
                body { margin:0; padding:16px; background-color: #f8fafc; text-align: center; }
                canvas { max-width: 100%; height: auto; margin: 0 auto 16px auto; display: block; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); background-color: white; border-radius: 4px; }
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
        ) : null}"""

content = content.replace(old_webview, new_webview)

# UI enhancements
content = content.replace("""  templateTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },""", """  templateTab: {
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
  },""")

content = content.replace("""  activeTemplateTab: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6B00',
  },""", """  activeTemplateTab: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },""")

content = content.replace("""  templateTabTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },""", """  templateTabTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },""")

content = content.replace("""  activeTemplateTabTxt: {
    color: '#FF6B00',
  },""", """  activeTemplateTabTxt: {
    color: '#FFFFFF',
  },""")

# Adding Error styles
content = content.replace("""  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },""", """  loadingText: {
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
  },""")

with open('/Users/teenagupta/Desktop/Quantbit/stridenex-mobile/src/screens/Dashboards/StudentDashboard/StudentResumePreviewScreen.tsx', 'w') as f:
    f.write(content)

