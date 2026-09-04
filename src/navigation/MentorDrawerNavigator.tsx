import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MentorDashboardScreen } from '@/screens/Dashboards/MentorDashboard/MentorDashboardScreen';
import { MentorScheduleScreen } from '@/screens/Dashboards/MentorDashboard/MentorScheduleScreen';
import { MentorOfferingsScreen } from '@/screens/Dashboards/MentorDashboard/MentorOfferingsScreen';
import { MentorRequestsScreen } from '@/screens/Dashboards/MentorDashboard/MentorRequestsScreen';
import { MentorSessionHistoryScreen } from '@/screens/Dashboards/MentorDashboard/MentorSessionHistoryScreen';
import { MentorPayoutsScreen } from '@/screens/Dashboards/MentorDashboard/MentorPayoutsScreen';
import { MentorProfileScreen } from '@/screens/Dashboards/MentorDashboard/MentorProfileScreen';
import { MentorPlansScreen } from '@/screens/Dashboards/MentorDashboard/MentorPlansScreen';
import { MentorCommunityScreen } from '@/screens/Dashboards/MentorDashboard/MentorCommunityScreen';
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
  Award,
  Users,
} from 'lucide-react-native';

import { SharedBottomTabs, TabConfig } from './SharedBottomTabs';

const Drawer = createDrawerNavigator();

const MentorTabs = () => {
  const tabs: TabConfig[] = [
    { name: "Overview", component: MentorDashboardScreen, icon: LayoutDashboard },
    { name: "Schedule", component: MentorScheduleScreen, icon: Calendar },
    { name: "Offerings", component: MentorOfferingsScreen, icon: Video },
    { name: "Requests", component: MentorRequestsScreen, icon: Calendar },
    { name: "Session History", component: MentorSessionHistoryScreen, icon: BookOpen }
  ];
  return <SharedBottomTabs tabs={tabs} activeTintColor="#4c1d95" />;
};

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
        name="ModuleTabs"
        component={MentorTabs}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="Community"
        component={MentorCommunityScreen}
        options={{
          drawerIcon: ({ color, size }) => <Users color={color} size={size} />
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
      <Drawer.Screen
        name="Plans"
        component={MentorPlansScreen}
        options={{
          drawerIcon: ({ color, size }) => <Award color={color} size={size} />
        }}
      />
    </Drawer.Navigator>
  );
};
