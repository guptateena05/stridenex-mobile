import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '@/navigation/RootNavigator';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { IndustryProvider } from '@/context/IndustryContext';
import {
  initializePushNotifications,
  setupForegroundListener,
} from '@/services/pushNotification.service';

LogBox.ignoreLogs(['viewIsDescendantOf() noop']);

const AppContent = () => {
  const { userName, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only register push token with backend if user is authenticated
    if (isAuthenticated && userName) {
      initializePushNotifications(userName);
    }

    // Setup listener for foreground push notifications
    const unsubscribeForeground = setupForegroundListener();

    return () => {
      unsubscribeForeground();
    };
  }, [isAuthenticated, userName]);

  return <RootNavigator />;
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <IndustryProvider>
          <AppContent />
        </IndustryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
