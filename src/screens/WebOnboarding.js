import React from 'react';
import { WebView } from 'react-native-webview';

const WebOnboarding = ({ route, navigation }) => {
  const { url } = route.params;

  const handleNavigation = (navState) => {
    // ✅ only trigger when EXACTLY login page
    if (navState.url === 'http://testwebstridenex.quantcloud.in/login') {
      navigation.replace('Login');
    }
  };

  return (
    <WebView
      source={{ uri: url }}
      onNavigationStateChange={handleNavigation}
    />
  );
};

export default WebOnboarding;