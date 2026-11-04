import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme/colors';

const WebOnboarding = ({ route, navigation }) => {
  const { url, sessionData, email } = route.params;
  const [injectedScript, setInjectedScript] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepareScript = async () => {
      try {
        const [storedFirst, storedLast, storedPwd] = await Promise.all([
          AsyncStorage.getItem('userFirstName'),
          AsyncStorage.getItem('userLastName'),
          AsyncStorage.getItem('userPassword'),
        ]);

        const fullName = sessionData?.fullName || '';
        const nameParts = fullName.trim().split(/\s+/);
        const resolvedFirst = sessionData?.firstName || storedFirst || nameParts[0] || '';
        const resolvedLast = sessionData?.lastName || storedLast || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '') || '';
        const resolvedPassword = sessionData?.userPassword || storedPwd || '';
        const emailToPrefill = email || (sessionData && sessionData.email);

        let script = `
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          console.log("Storage cleared");
        `;

        if (emailToPrefill) {
          script += `
            localStorage.setItem("userEmail", ${JSON.stringify(emailToPrefill)});
            console.log("Prefilled userEmail in localStorage");
          `;
        }

        if (resolvedFirst) {
          script += `
            localStorage.setItem("userFirstName", ${JSON.stringify(resolvedFirst)});
            console.log("Prefilled userFirstName in localStorage:", ${JSON.stringify(resolvedFirst)});
          `;
        }

        if (resolvedLast) {
          script += `
            localStorage.setItem("userLastName", ${JSON.stringify(resolvedLast)});
            console.log("Prefilled userLastName in localStorage:", ${JSON.stringify(resolvedLast)});
          `;
        }

        if (resolvedPassword) {
          script += `
            localStorage.setItem("userPassword", ${JSON.stringify(resolvedPassword)});
            console.log("Prefilled userPassword in localStorage");
          `;
        }

        if (sessionData) {
          script += `
            localStorage.setItem("apiKey", ${JSON.stringify(sessionData.apiKey || '')});
            localStorage.setItem("apiSecret", ${JSON.stringify(sessionData.apiSecret || '')});
            localStorage.setItem("currentUser", ${JSON.stringify(sessionData.email || emailToPrefill || '')});
            localStorage.setItem("role", ${JSON.stringify(sessionData.role || "mentor")});
            localStorage.setItem("isOnboarded", ${JSON.stringify(sessionData.isOnboarded || '0')});
            localStorage.setItem("fullName", ${JSON.stringify(sessionData.fullName || `${resolvedFirst} ${resolvedLast}`.trim())});
            console.log("Injected session data into localStorage");
          `;
        }

        // Prevent iOS Safari/WebKit auto-zoom on input focus
        script += `
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
            var style = document.createElement('style');
            style.id = 'disable-ios-zoom';
            style.type = 'text/css';
            style.innerHTML = 'input, select, textarea { font-size: 16px !important; }';
            document.head.appendChild(style);
          })();
        `;

        setInjectedScript(script);
      } catch (err) {
        console.error("Failed to prepare onboarding script", err);
      } finally {
        setIsReady(true);
      }
    };

    prepareScript();
  }, [email, sessionData]);

  const handleNavigation = (navState) => {
    console.log("Navigation URL:", navState.url);

    // Check for ANY login URL (http, https, or any subpath)
    if (navState.url.includes('testwebstridenex.quantcloud.in/login')) {
      console.log("✅ Login page detected! Opening mobile login");
      navigation.replace('Login');
      return;
    }

    // Also check for any redirect to login
    if (navState.url.endsWith('/login') || navState.url.includes('/login?')) {
      console.log("✅ Login redirect detected! Opening mobile login");
      navigation.replace('Login');
      return;
    }
  };

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

      var observer = new MutationObserver(function() {
        if (!document.getElementById('disable-ios-zoom')) {
          var s = document.createElement('style');
          s.id = 'disable-ios-zoom';
          s.type = 'text/css';
          s.innerHTML = 'input, select, textarea { font-size: 16px !important; }';
          document.head.appendChild(s);
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={handleNavigation}
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

export default WebOnboarding;