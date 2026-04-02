import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MentorDashboardScreen } from '@/screens/Dashboards/MentorDashboard/MentorDashboardScreen';
import { MentorScheduleScreen } from '@/screens/Dashboards/MentorDashboard/MentorScheduleScreen';
import { MentorOfferingsScreen } from '@/screens/Dashboards/MentorDashboard/MentorOfferingsScreen';
import { MentorRequestsScreen } from '@/screens/Dashboards/MentorDashboard/MentorRequestsScreen';
import { MentorSessionHistoryScreen } from '@/screens/Dashboards/MentorDashboard/MentorSessionHistoryScreen';
import { MentorPayoutsScreen } from '@/screens/Dashboards/MentorDashboard/MentorPayoutsScreen';
import { MentorProfileScreen } from '@/screens/Dashboards/MentorDashboard/MentorProfileScreen';
import { CustomDrawerContent } from '@/components/dashboard/CustomDrawerContent';
import { colors } from '@/theme/colors';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  LayoutDashboard,
  Calendar,
  Video,
  BookOpen,
  MessageSquare,
  TrendingUp,
} from 'lucide-react-native';

const Drawer = createDrawerNavigator();

export const MentorDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: () => <DashboardHeader />,
        drawerActiveBackgroundColor: 'rgba(76, 29, 149, 0.1)', // #4c1d95 with 10% opacity
        drawerActiveTintColor: '#4c1d95',
        drawerInactiveTintColor: colors.text.secondary,
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          marginLeft: 8,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 12,
        }
      }}
    >
      <Drawer.Screen
        name="Overview"
        component={MentorDashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Schedule"
        component={MentorScheduleScreen}
        options={{
          drawerIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Offerings"
        component={MentorOfferingsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Video color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Requests"
        component={MentorRequestsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Session History"
        component={MentorSessionHistoryScreen}
        options={{
          drawerIcon: ({ color, size }) => <BookOpen color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Payouts & Commission"
        component={MentorPayoutsScreen}
        options={{
          drawerIcon: ({ color, size }) => <MessageSquare color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="My Profile"
        component={MentorProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => <TrendingUp color={color} size={size} />
        }}
      />
    </Drawer.Navigator>
  );
};
