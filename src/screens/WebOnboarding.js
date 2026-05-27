import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '@/theme/colors';

const WebOnboarding = ({ route, navigation }) => {
  const { url, sessionData, email } = route.params;

  let injectedScript = `
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log("Storage cleared");
  `;

  const emailToPrefill = email || (sessionData && sessionData.email);
  if (emailToPrefill) {
    injectedScript += `
      localStorage.setItem("userEmail", ${JSON.stringify(emailToPrefill)});
      console.log("Prefilled userEmail in localStorage");
    `;
  }

  if (sessionData) {
    injectedScript += `
      localStorage.setItem("apiKey", ${JSON.stringify(sessionData.apiKey)});
      localStorage.setItem("apiSecret", ${JSON.stringify(sessionData.apiSecret)});
      localStorage.setItem("currentUser", ${JSON.stringify(sessionData.email)});
      localStorage.setItem("role", ${JSON.stringify(sessionData.role || "industry")});
      localStorage.setItem("isOnboarded", ${JSON.stringify(sessionData.isOnboarded)});
      localStorage.setItem("fullName", ${JSON.stringify(sessionData.fullName)});
      console.log("Injected session data into localStorage");
    `;
  }

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

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={handleNavigation}
        injectedJavaScriptBeforeContentLoaded={injectedScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={false}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          </View>
        )}
      />
    </View>
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