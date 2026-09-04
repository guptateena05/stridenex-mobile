import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { colors } from '@/theme/colors';

const Tab = createBottomTabNavigator();

export type TabConfig = {
  name: string;
  component: React.ComponentType<any>;
  icon: React.ElementType;
  hide?: boolean;
  initialParams?: any;
};

export type SharedBottomTabsProps = {
  tabs: TabConfig[];
  activeTintColor?: string;
};

export const SharedBottomTabs = ({ tabs, activeTintColor = colors.accent.DEFAULT }: SharedBottomTabsProps) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          borderTopWidth: 0,
          backgroundColor: '#ffffff',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          padding: 2,
        }
      }}
    >
      {tabs.map((tab) => {
        if (tab.hide) return null;
        
        return (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            initialParams={tab.initialParams}
            options={{
              tabBarIcon: ({ color, focused }) => {
                const IconComponent = tab.icon;
                return <IconComponent color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.5 : 2} />;
              }
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};
