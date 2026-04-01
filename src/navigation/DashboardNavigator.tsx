import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StudentDashboardScreen } from '@/screens/Dashboards/StudentDashboard/StudentDashboardScreen';
import { MentorDashboardScreen } from '@/screens/Dashboards/MentorDashboard/MentorDashboardScreen';
import { CollegeDashboardScreen } from '@/screens/Dashboards/CollegeDashboard/CollegeDashboardScreen';
import { IndustryDashboardScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryDashboardScreen';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Home, BookOpen, User, Briefcase, BarChart, Settings, Users } from 'lucide-react-native';
import { colors } from '@/theme/colors';

const Tab = createBottomTabNavigator();

export const DashboardNavigator = ({ role = 'Student' }: { role?: string }) => {
  if (role === 'Student') {
    // Lazy require to avoid circular dependency
    const { StudentDrawerNavigator } = require('./StudentDrawerNavigator');
    return <StudentDrawerNavigator />;
  }

  if (role === 'Industry') {
    const { IndustryDrawerNavigator } = require('./IndustryDrawerNavigator');
    return <IndustryDrawerNavigator />;
  }

  // Theme coloring for active tabs based on module
  let activeColor = colors.accent.DEFAULT;
  if (role === 'Mentor') activeColor = colors.success || '#10b981';
  else if (role === 'College') activeColor = colors.info || '#3b82f6';

  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <DashboardHeader title={`${role} Portal`} />,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      {role === 'Mentor' && (
        <>
          <Tab.Screen name="Overview" component={MentorDashboardScreen} options={{ tabBarIcon: ({ color, size }: any) => <Home color={color} size={size} /> }} />
          <Tab.Screen name="Students" component={MentorDashboardScreen} options={{ tabBarIcon: ({ color, size }: any) => <Users color={color} size={size} /> }} />
          <Tab.Screen name="Sessions" component={MentorDashboardScreen} options={{ tabBarIcon: ({ color, size }: any) => <BookOpen color={color} size={size} /> }} />
          <Tab.Screen name="Profile" component={MentorDashboardScreen} options={{ tabBarIcon: ({ color, size }: any) => <User color={color} size={size} /> }} />
        </>
      )}

      {role === 'College' && (
        <>
          <Tab.Screen name="Overview" component={CollegeDashboardScreen} options={{ tabBarIcon: ({ color, size }: any) => <Home color={color} size={size} /> }} />
          <Tab.Screen name="Students" component={CollegeDashboardScreen} options={{ tabBarIcon: ({ color, size }: any) => <Users color={color} size={size} /> }} />
          <Tab.Screen name="NEP & UGC" component={CollegeDashboardScreen} options={{ tabBarIcon: ({ color, size }: any) => <BookOpen color={color} size={size} /> }} />
          <Tab.Screen name="Settings" component={CollegeDashboardScreen} options={{ tabBarIcon: ({ color, size }: any) => <Settings color={color} size={size} /> }} />
        </>
      )}
    </Tab.Navigator>
  );
};
