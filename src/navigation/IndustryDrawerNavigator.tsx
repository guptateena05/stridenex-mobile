import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { IndustryDashboardScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryDashboardScreen';
import { IndustryCompanyProfileScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryCompanyProfileScreen';
import { IndustryFindTalentScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryFindTalentScreen';
import { IndustryPipelineScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryPipelineScreen';
import { IndustryProjectsScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryProjectsScreen';
import { IndustryInternshipsScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryInternshipsScreen';
import { IndustryFeedbackScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryFeedbackScreen';
import { IndustryAnalyticsScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryAnalyticsScreen';
import { IndustryPlansScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryPlansScreen';
import { CustomDrawerContent } from '@/components/dashboard/CustomDrawerContent';
import { colors } from '@/theme/colors';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Mail,
  FolderGit2,
  UserCheck,
  Star,
  Calendar,
  School,
  Settings
} from 'lucide-react-native';
import { IndustrySettingsScreen } from '@/screens/Dashboards/IndustryDashboard/IndustrySettingsScreen';
import { IndustryProjectPipelineScreen } from '@/screens/Dashboards/IndustryDashboard/IndustryProjectPipelineScreen';

const Drawer = createDrawerNavigator();

export const IndustryDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: () => <DashboardHeader />,
        drawerActiveBackgroundColor: 'rgba(147, 51, 234, 0.1)', // purple[600] with 10% opacity
        drawerActiveTintColor: colors.purple[600],
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
        component={IndustryDashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Company Profile"
        component={IndustryCompanyProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => <Building2 color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Find Talent"
        component={IndustryFindTalentScreen}
        options={{
          drawerIcon: ({ color, size }) => <Briefcase color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Internships Pipeline"
        component={IndustryPipelineScreen}
        options={{
          drawerIcon: ({ color, size }) => <Mail color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Projects"
        component={IndustryProjectsScreen}
        options={{
          drawerIcon: ({ color, size }) => <FolderGit2 color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Internships"
        component={IndustryInternshipsScreen}
        options={{
          drawerIcon: ({ color, size }) => <UserCheck color={color} size={size} />
        }}
      />
      {/* <Drawer.Screen
        name="Feedback"
        component={IndustryFeedbackScreen}
        options={{
          drawerIcon: ({ color, size }) => <Star color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Analytics"
        component={IndustryAnalyticsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }}
      /> */}
      <Drawer.Screen
        name="Settings"
        component={IndustrySettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Settings color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Plans"
        component={IndustryPlansScreen}
        options={{
          drawerIcon: ({ color, size }) => <School color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Project Pipeline"
        component={IndustryProjectPipelineScreen}
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />
    </Drawer.Navigator>
  );
};
