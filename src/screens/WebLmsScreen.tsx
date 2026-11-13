import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet, StatusBar, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';
import { RootStackParamList } from '@/navigation/types';

const DEFAULT_LMS_URL = 'https://testwebstridenex.quantcloud.in/lms/courses?source=mobile';

const STRIDENEX_RETURN_PATHS = [
  '/student/dashboard',
  '/college/dashboard',
  '/industry/dashboard',
  '/mentor/dashboard',
  '/partner',
];

const isStrideNexReturnUrl = (rawUrl?: string): boolean => {
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl);
    const path = parsed.pathname.toLowerCase();
    return STRIDENEX_RETURN_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  } catch {
    return STRIDENEX_RETURN_PATHS.some((prefix) => rawUrl.includes(prefix));
  }
};

const WebLmsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'WebLms'>>();
  const { userName, userFullName, userImage, role } = useAuth();

  const targetUrl = route.params?.url || DEFAULT_LMS_URL;

  const [injectedScript, setInjectedScript] = useState('');
  const [isReady, setIsReady] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const hasReturnedRef = useRef(false);

  const handleBackToStrideNex = useCallback(() => {
    if (hasReturnedRef.current) return;
    hasReturnedRef.current = true;
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const prepareScript = async () => {
      try {
        const [
          storedToken,
          storedUserName,
          storedFullName,
          storedFirst,
          storedLast,
          storedImage,
          storedRole,
        ] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('userName'),
          AsyncStorage.getItem('userFullName'),
          AsyncStorage.getItem('userFirstName'),
          AsyncStorage.getItem('userLastName'),
          AsyncStorage.getItem('userImage'),
          AsyncStorage.getItem('role'),
        ]);

        const effectiveEmail = userName || storedUserName || '';
        const effectiveFullName =
          userFullName ||
          storedFullName ||
          `${storedFirst || ''} ${storedLast || ''}`.trim();
        const effectiveImage = userImage || storedImage || '';
        const effectiveRole = role || storedRole || 'Student';
        const lowerRole = effectiveRole.toLowerCase();

        let apiKey = '';
        let apiSecret = '';
        if (storedToken && storedToken.includes(':') && storedToken !== 'dummy-token') {
          const idx = storedToken.indexOf(':');
          apiKey = storedToken.slice(0, idx);
          apiSecret = storedToken.slice(idx + 1);
        }

        let script = `
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
              ${effectiveImage ? `
                localStorage.setItem("user_image", ${JSON.stringify(effectiveImage)});
                localStorage.setItem("userImage", ${JSON.stringify(effectiveImage)});
              ` : ''}
              localStorage.setItem("role", ${JSON.stringify(lowerRole)});
              localStorage.setItem("roles", ${JSON.stringify(JSON.stringify([effectiveRole]))});
              localStorage.setItem("isOnboarded", "1");
              document.cookie = "user_role=" + encodeURIComponent(${JSON.stringify(lowerRole)}) + "; path=/";
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
          })();
          true;
        `;

        setInjectedScript(script);
      } catch (err) {
        console.error('Failed to prepare LMS session script', err);
      } finally {
        setIsReady(true);
      }
    };

    prepareScript();
  }, [userName, userFullName, userImage, role]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      handleBackToStrideNex();
      return true;
    });
    return () => subscription.remove();
  }, [handleBackToStrideNex]);

  const handleShouldStartLoad = (request: { url: string }) => {
    if (isStrideNexReturnUrl(request.url)) {
      handleBackToStrideNex();
      return false;
    }
    return true;
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    canGoBackRef.current = navState.canGoBack;
    if (isStrideNexReturnUrl(navState.url)) {
      handleBackToStrideNex();
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload?.type === 'BACK_TO_STRIDENEX') {
        handleBackToStrideNex();
      }
    } catch {
      if (event.nativeEvent.data === 'BACK_TO_STRIDENEX') {
        handleBackToStrideNex();
      }
    }
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
        document.head.appendChild(meta);
      }

      if (!document.getElementById('disable-ios-zoom')) {
        var style = document.createElement('style');
        style.id = 'disable-ios-zoom';
        style.type = 'text/css';
        style.innerHTML = 'input, select, textarea { font-size: 16px !important; }';
        document.head.appendChild(style);
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
        source={{ uri: targetUrl }}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={injectedScript}
        injectedJavaScript={postLoadScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default WebLmsScreen;

