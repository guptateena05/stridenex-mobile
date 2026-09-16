import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator  from './AuthNavigator';
import { DashboardNavigator } from './DashboardNavigator';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View, Platform } from 'react-native';
import { colors } from '@/theme/colors';
import CertificateVerifyScreen from '@/screens/Public/CertificateVerifyScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<any> = {
  prefixes: ['stridenex://'],
  config: {
    screens: {
      Login: 'login',
      CertificateVerify: 'certificate-verify/:id',
    },
  },
};

const RootNavigator = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.light }}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Dashboard">
            {() => <DashboardNavigator role={role || undefined} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
        <Stack.Screen name="CertificateVerify" component={CertificateVerifyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
