import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator  from './AuthNavigator';
import { DashboardNavigator } from './DashboardNavigator';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/theme/colors';

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
    <NavigationContainer>
      {isAuthenticated ? (
        <DashboardNavigator role={role || undefined} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator
