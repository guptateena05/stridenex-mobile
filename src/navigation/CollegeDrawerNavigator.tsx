import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CollegeOverviewScreen } from '@/screens/Dashboards/CollegeDashboard/CollegeOverviewScreen';
import { CollegeStudentsScreen } from '@/screens/Dashboards/CollegeDashboard/CollegeStudentsScreen';
import { CollegePlacementScreen } from '@/screens/Dashboards/CollegeDashboard/CollegePlacementScreen';
import { CollegeNepUgcScreen } from '@/screens/Dashboards/CollegeDashboard/CollegeNepUgcScreen';
import { CollegeInterventionsScreen } from '@/screens/Dashboards/CollegeDashboard/CollegeInterventionsScreen';
import { CollegeNoticeBoardScreen } from '@/screens/Dashboards/CollegeDashboard/CollegeNoticeBoardScreen';
import { CollegeReportsScreen } from '@/screens/Dashboards/CollegeDashboard/CollegeReportsScreen';
import { CollegePlansScreen } from '@/screens/Dashboards/CollegeDashboard/CollegePlansScreen';
import { CustomDrawerContent } from '@/components/dashboard/CustomDrawerContent';
import { colors } from '@/theme/colors';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Building2,
  Target,
  BookOpen,
  BarChart,
  Award,
  FileText,
  CheckSquare,
  Briefcase
} from 'lucide-react-native';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

const Drawer = createDrawerNavigator();

export const CollegeDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: () => <DashboardHeader />,
        // Use green for College role
        drawerActiveBackgroundColor: 'rgba(16, 185, 129, 0.1)',
        drawerActiveTintColor: '#10b981',
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
        component={CollegeOverviewScreen}
        options={{ drawerIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Student Analytics"
        component={CollegeStudentsScreen}
        options={{ drawerIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Campus Drives"
        component={CollegePlacementScreen}
        initialParams={{ tab: 'drives' }}
        options={{ drawerIcon: ({ color, size }) => <Briefcase color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Active Drives"
        component={CollegePlacementScreen}
        initialParams={{ tab: 'drives' }}
        options={{ drawerIcon: ({ color, size }) => <Briefcase color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Placement Tracker"
        component={CollegePlacementScreen}
        initialParams={{ tab: 'tracker' }}
        options={{ drawerIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Eligibility Checker"
        component={CollegePlacementScreen}
        initialParams={{ tab: 'eligibility' }}
        options={{ drawerIcon: ({ color, size }) => <Target color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Placement Stats"
        component={CollegePlacementScreen}
        initialParams={{ tab: 'stats' }}
        options={{ drawerIcon: ({ color, size }) => <BarChart color={color} size={size} /> }}
      />
      {/* 
        This is the parent tab for NEP & UGC. 
        We will also add sub-tabs here so they mount in the same Stack, 
        but we'll intercept them in CustomDrawerContent to display as an accordion.
      */}
      <Drawer.Screen
        name="NEP & UGC 2026"
        component={CollegeNepUgcScreen}
        initialParams={{ tab: 'Dashboard' }}
        options={{ drawerIcon: ({ color, size }) => <Building2 color={color} size={size} /> }}
      />

      {/* Accordion Hidden Sub Tabs for NEP & UGC */}
      <Drawer.Screen
        name="NEP Dashboard"
        component={CollegeNepUgcScreen}
        initialParams={{ tab: 'Dashboard' }}
        options={{ title: 'Dashboard', drawerIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="NEP 2020"
        component={CollegeNepUgcScreen}
        initialParams={{ tab: 'NEP 2020' }}
        options={{ drawerIcon: ({ color, size }) => <FileText color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="UGC 2026"
        component={CollegeNepUgcScreen}
        initialParams={{ tab: 'UGC 2026' }}
        options={{ drawerIcon: ({ color, size }) => <Target color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Grievance Engine"
        component={CollegeNepUgcScreen}
        initialParams={{ tab: 'Grievance Engine' }}
        options={{ drawerIcon: ({ color, size }) => <CheckSquare color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Portfolio Locker"
        component={CollegeNepUgcScreen}
        initialParams={{ tab: 'Portfolio Locker' }}
        options={{ drawerIcon: ({ color, size }) => <Briefcase color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="ABC Credits"
        component={CollegeNepUgcScreen}
        initialParams={{ tab: 'ABC Credits' }}
        options={{ drawerIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Equity Audit"
        component={CollegeNepUgcScreen}
        initialParams={{ tab: 'Equity Audit' }}
        options={{ drawerIcon: ({ color, size }) => <Target color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="NEP Reports"
        component={CollegeReportsScreen}
        options={{ title: 'Reports', drawerIcon: ({ color, size }) => <BarChart color={color} size={size} /> }}
      />

      {/* Main Tabs cont... */}
      <Drawer.Screen
        name="Interventions"
        component={CollegeInterventionsScreen}
        options={{ drawerIcon: ({ color, size }) => <Target color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Notice Board"
        component={CollegeNoticeBoardScreen}
        options={{ drawerIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Reports"
        component={CollegeReportsScreen}
        options={{ drawerIcon: ({ color, size }) => <BarChart color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Plans"
        component={CollegePlansScreen}
        options={{ drawerIcon: ({ color, size }) => <Award color={color} size={size} /> }}
      />
    </Drawer.Navigator>
  );
};
