import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  StatusBar,
  BackHandler,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

const BASE_PARTNER_URL = 'https://testwebstridenex.quantcloud.in/partner?source=mobile&from=mobile';

export const PartnerWebScreen: React.FC = () => {
  const { logout, userName, userFullName } = useAuth();

  const [injectedScript, setInjectedScript] = useState('');
  const [partnerUrl, setPartnerUrl] = useState(BASE_PARTNER_URL);
  const [isReady, setIsReady] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const isLoggingOutRef = useRef(false);

  const handleLogoutBackToMobile = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    try {
      await logout();
    } catch (err) {
      console.error('[PartnerWeb] Error during partner logout:', err);
    }
  }, [logout]);

  useEffect(() => {
    const prepareSession = async () => {
      try {
        const [
          storedToken,
          storedUserName,
          storedFullName,
          storedFirst,
          storedLast,
        ] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('userName'),
          AsyncStorage.getItem('userFullName'),
          AsyncStorage.getItem('userFirstName'),
          AsyncStorage.getItem('userLastName'),
        ]);

        const effectiveEmail = userName || storedUserName || '';
        const effectiveFullName =
          userFullName ||
          storedFullName ||
          `${storedFirst || ''} ${storedLast || ''}`.trim();

        let apiKey = '';
        let apiSecret = '';
        if (storedToken && storedToken.includes(':') && storedToken !== 'dummy-token') {
          const idx = storedToken.indexOf(':');
          apiKey = storedToken.slice(0, idx);
          apiSecret = storedToken.slice(idx + 1);
        }

        let fullUrl = BASE_PARTNER_URL;
        if (apiKey && apiSecret) {
          fullUrl += `&apiKey=${encodeURIComponent(apiKey)}&apiSecret=${encodeURIComponent(apiSecret)}`;
          if (effectiveEmail) {
            fullUrl += `&user=${encodeURIComponent(effectiveEmail)}`;
          }
          if (effectiveFullName) {
            fullUrl += `&fullName=${encodeURIComponent(effectiveFullName)}`;
          }
        }
        setPartnerUrl(fullUrl);

        const script = `
          (function() {
            try {
              ${apiKey ? `localStorage.setItem("apiKey", ${JSON.stringify(apiKey)});` : ''}
              ${apiSecret ? `localStorage.setItem("apiSecret", ${JSON.stringify(apiSecret)});` : ''}
              ${effectiveEmail ? `
                localStorage.setItem("userEmail", ${JSON.stringify(effectiveEmail)});
                localStorage.setItem("user", ${JSON.stringify(effectiveEmail)});
                localStorage.setItem("currentUser", ${JSON.stringify(effectiveEmail)});
              ` : ''}
              ${effectiveFullName ? `
                localStorage.setItem("fullName", ${JSON.stringify(effectiveFullName)});
                localStorage.setItem("userFullName", ${JSON.stringify(effectiveFullName)});
              ` : ''}
              localStorage.setItem("role", "partner");
              localStorage.setItem("roles", JSON.stringify(["Partner", "Instructor", "Course Creator"]));
              localStorage.setItem("isOnboarded", "1");
              localStorage.setItem("has_lms_access", "true");
              localStorage.setItem("isInstructor", "true");
              sessionStorage.setItem("is_mobile_view", "true");
              document.cookie = "user_role=partner; path=/; max-age=86400";
              document.cookie = "has_lms_access=true; path=/; max-age=86400";
            } catch (e) {}

            var meta = document.querySelector('meta[name="viewport"]');
            if (meta) {
              meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            } else {
              meta = document.createElement('meta');
              meta.name = 'viewport';
              meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
              document.head && document.head.appendChild(meta);
            }

            if (!document.getElementById('disable-ios-zoom')) {
              var style = document.createElement('style');
              style.id = 'disable-ios-zoom';
              style.type = 'text/css';
              style.innerHTML = 'input, select, textarea { font-size: 16px !important; }';
              document.head && document.head.appendChild(style);
            }

            if (!document.getElementById('partner-mobile-theme-fix')) {
              var themeStyle = document.createElement('style');
              themeStyle.id = 'partner-mobile-theme-fix';
              themeStyle.type = 'text/css';
              themeStyle.innerHTML = \`
                html, body, .min-h-screen {
                  background: #ffffff !important;
                  background-color: #ffffff !important;
                }
                .fixed.inset-0.z-0,
                div[class*="radial-gradient"],
                div[class*="blur-3xl"] {
                  display: none !important;
                  opacity: 0 !important;
                  visibility: hidden !important;
                }
                main > div:first-child {
                  background-color: #ffffff !important;
                }
                main h1, h1 {
                  color: #0f172a !important;
                  font-weight: 800 !important;
                }
                main p, h1 + p {
                  color: #334155 !important;
                  font-weight: 500 !important;
                }
                header > div:first-child {
                  padding-left: 12px !important;
                  padding-right: 12px !important;
                  gap: 12px !important;
                  justify-content: space-between !important;
                }
                header img {
                  max-width: 105px !important;
                  width: 105px !important;
                  height: auto !important;
                  object-fit: contain !important;
                }
                div:has(> svg.lucide-mail) + div,
                div:has(> svg.lucide-mail) + div p {
                  min-width: 0 !important;
                  word-break: break-all !important;
                  overflow-wrap: anywhere !important;
                }
              \`;
              (document.head || document.documentElement).appendChild(themeStyle);
            }
          })();
          true;
        `;

        setInjectedScript(script);
      } catch (err) {
        console.error('[PartnerWeb] Error preparing partner session:', err);
      } finally {
        setIsReady(true);
      }
    };

    prepareSession();
  }, [userName, userFullName]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      Alert.alert(
        'Return to Mobile Login',
        'Do you want to log out from Partner Portal and return to the login screen?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout & Return',
            style: 'destructive',
            onPress: () => handleLogoutBackToMobile(),
          },
        ]
      );
      return true;
    });
    return () => subscription.remove();
  }, [handleLogoutBackToMobile]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'BACK_TO_MOBILE_LOGIN' || data?.type === 'LOGOUT_BACK_TO_MOBILE') {
        handleLogoutBackToMobile();
        return;
      }
    } catch {
      if (event.nativeEvent.data === 'BACK_TO_MOBILE_LOGIN' || event.nativeEvent.data === 'LOGOUT_BACK_TO_MOBILE') {
        handleLogoutBackToMobile();
        return;
      }
    }
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    canGoBackRef.current = navState.canGoBack;
    const url = navState.url.toLowerCase();
    if (url.includes('/login') || url.includes('method/stridenex_app.api_stridenex_app.app.logout')) {
      handleLogoutBackToMobile();
    }
  };

  const handleShouldStartLoad = (request: { url: string }) => {
    const url = request.url.toLowerCase();
    if (url.includes('/login') || url.includes('method/stridenex_app.api_stridenex_app.app.logout')) {
      handleLogoutBackToMobile();
      return false;
    }
    return true;
  };

  const postLoadScript = `
    (function() {
      var meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      } else {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head && document.head.appendChild(meta);
      }

      if (!document.getElementById('disable-ios-zoom')) {
        var style = document.createElement('style');
        style.id = 'disable-ios-zoom';
        style.type = 'text/css';
        style.innerHTML = 'input, select, textarea { font-size: 16px !important; }';
        document.head && document.head.appendChild(style);
      }

      if (!document.getElementById('partner-mobile-theme-fix')) {
        var themeStyle = document.createElement('style');
        themeStyle.id = 'partner-mobile-theme-fix';
        themeStyle.type = 'text/css';
        themeStyle.innerHTML = \`
          html, body, .min-h-screen {
            background: #ffffff !important;
            background-color: #ffffff !important;
          }
          .fixed.inset-0.z-0,
          div[class*="radial-gradient"],
          div[class*="blur-3xl"] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          main > div:first-child {
            background-color: #ffffff !important;
          }
          main h1, h1 {
            color: #0f172a !important;
            font-weight: 800 !important;
          }
          main p, h1 + p {
            color: #334155 !important;
            font-weight: 500 !important;
          }
          header > div:first-child {
            padding-left: 12px !important;
            padding-right: 12px !important;
            gap: 12px !important;
            justify-content: space-between !important;
          }
          header img {
            max-width: 105px !important;
            width: 105px !important;
            height: auto !important;
            object-fit: contain !important;
          }
          div:has(> svg.lucide-mail) + div,
          div:has(> svg.lucide-mail) + div p {
            min-width: 0 !important;
            word-break: break-all !important;
            overflow-wrap: anywhere !important;
          }
        \`;
        (document.head || document.documentElement).appendChild(themeStyle);
      }
    })();
    true;
  `;

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        ref={webViewRef}
        source={{ uri: partnerUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={injectedScript}
        injectedJavaScript={postLoadScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={false}
        scalesPageToFit={false}
        showsHorizontalScrollIndicator={false}
        setBuiltInZoomControls={false}
        bounces={false}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default PartnerWebScreen;
