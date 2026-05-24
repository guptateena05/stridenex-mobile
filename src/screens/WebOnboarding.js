import React from 'react';
import { WebView } from 'react-native-webview';

const WebOnboarding = ({ route, navigation }) => {
  const { url } = route.params;

  const clearStorageScript = `
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log("Storage cleared");
  `;

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
    <WebView
      source={{ uri: url }}
      onNavigationStateChange={handleNavigation}
      injectedJavaScriptBeforeContentLoaded={clearStorageScript}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      cacheEnabled={false}
    />
  );
};

export default WebOnboarding;