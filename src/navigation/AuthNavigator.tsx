import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PublicTabNavigator } from '@/navigation/PublicTabNavigator';
import { LoginScreen } from '@/screens/Auth/LoginScreen';
import { SignupScreen } from '@/screens/Auth/SignupScreen';
import StudentOnboardingScreen from '@/screens/Auth/StudentOnboardingScreen';
import { CollegeOnboardingScreen } from '@/screens/Auth/CollegeOnboardingScreen';
import { IndustryOnboardingScreen } from '@/screens/Auth/IndustryOnboardingScreen';
import { MentorOnboardingScreen } from '@/screens/Auth/MentorOnboardingScreen';
import { TermsOfUseScreen } from '@/screens/Auth/TermsOfUseScreen';
import { PrivacyPolicyScreen } from '@/screens/Auth/PrivacyPolicyScreen';
import { AuthStackParamList } from './types';


const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* <Stack.Screen name="PublicTabs" component={PublicTabNavigator} /> */}
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="StudentOnboarding" component={StudentOnboardingScreen} />
      <Stack.Screen name="CollegeOnboarding" component={CollegeOnboardingScreen} />
      <Stack.Screen name="IndustryOnboarding" component={IndustryOnboardingScreen} />
      <Stack.Screen name="MentorOnboarding" component={MentorOnboardingScreen} />
      <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator
