import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '@/navigation/RootNavigator';
import { AuthProvider } from '@/context/AuthContext';
import { IndustryProvider } from '@/context/IndustryContext';

LogBox.ignoreLogs(['viewIsDescendantOf() noop']);


const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <IndustryProvider>
          <RootNavigator />
        </IndustryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
