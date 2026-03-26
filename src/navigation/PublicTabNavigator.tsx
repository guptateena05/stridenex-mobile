import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/screens/Public/HomeScreen';
import { AboutScreen } from '@/screens/Public/AboutScreen';
import { OfferingsScreen } from '@/screens/Public/OfferingsScreen';
import { PathwaysScreen } from '@/screens/Public/PathwaysScreen';
import { SolutionsScreen } from '@/screens/Public/SolutionsScreen';
import { Info, Target, TrendingUp, Navigation, Home } from 'lucide-react-native';
import { colors } from '@/theme/colors';

const Tab = createBottomTabNavigator();

export const PublicTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent.DEFAULT,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />
        }} 
      />
      <Tab.Screen 
        name="About Us" 
        component={AboutScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Info size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Offerings" 
        component={OfferingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Target size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Pathways" 
        component={PathwaysScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Solutions" 
        component={SolutionsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Navigation size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};
