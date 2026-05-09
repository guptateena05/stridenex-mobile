import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '@/navigation/RootNavigator';
import { AuthProvider } from '@/context/AuthContext';
import { IndustryProvider } from '@/context/IndustryContext';


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
