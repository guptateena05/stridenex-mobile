import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StudentDashboardScreen } from '@/screens/Dashboards/StudentDashboard/StudentDashboardScreen';
import { StudentSkillsScreen } from '@/screens/Dashboards/StudentDashboard/StudentSkillsScreen';
import { CustomDrawerContent } from '@/components/dashboard/CustomDrawerContent';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { View, Text, StyleSheet } from 'react-native';
import {
  LayoutDashboard,
  Zap,
  Navigation,
  Users,
  Briefcase,
  PieChart,
  UserSquare2,
  Calendar,
  BookOpen,
  History,
  Video,
  Target
} from 'lucide-react-native';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StudentPathScreen } from '@/screens/Dashboards/StudentDashboard/StudentPathScreen';
import { StudentCommunityScreen } from '@/screens/Dashboards/StudentDashboard/StudentCommunityScreen';
import { StudentInternshipScreen } from '@/screens/Dashboards/StudentDashboard/StudentInternshipScreen';
import { StudentProjectsScreen } from '@/screens/Dashboards/StudentDashboard/StudentProjectsScreen';
import { StudentHabitsScreen } from '@/screens/Dashboards/StudentDashboard/StudentHabitsScreen';
import { StudentMentorsScreen } from '@/screens/Dashboards/StudentDashboard/StudentMentorsScreen';
import { StudentEventsScreen } from '@/screens/Dashboards/StudentDashboard/StudentEventsScreen';
import { StudentStoriesScreen } from '@/screens/Dashboards/StudentDashboard/StudentStoriesScreen';
import { StudentPlansScreen } from '@/screens/Dashboards/StudentDashboard/StudentPlansScreen';
import { StudentShortsScreen } from '@/screens/Dashboards/StudentDashboard/StudentShortsScreen';

const Drawer = createDrawerNavigator();

const DummyScreen = ({ route }: any) => (
  <View style={styles.dummyContainer}>
    <Text style={styles.dummyTitle}>{route.name}</Text>
    <Text style={styles.dummyText}>This screen is coming soon!</Text>
  </View>
);

const styles = StyleSheet.create({
  dummyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.light },
  dummyTitle: { fontSize: 24, fontWeight: 'bold', color: colors.navy, marginBottom: 10 },
  dummyText: { fontSize: 16, color: colors.text.secondary },
});

export const StudentDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: () => <DashboardHeader />,
        drawerActiveBackgroundColor: 'rgba(255, 107, 0, 0.1)',
        drawerActiveTintColor: colors.accent.DEFAULT,
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
        component={StudentDashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Skills"
        component={StudentSkillsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Zap color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Path"
        component={StudentPathScreen}
        options={{
          drawerIcon: ({ color, size }) => <Navigation color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Community"
        component={StudentCommunityScreen}
        options={{
          drawerIcon: ({ color, size }) => <Users color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Projects"
        component={StudentProjectsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Target color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Internships"
        component={StudentInternshipScreen}
        options={{
          drawerIcon: ({ color, size }) => <Briefcase color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Habits"
        component={StudentHabitsScreen}
        options={{
          drawerIcon: ({ color, size }) => <PieChart color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Mentors"
        component={StudentMentorsScreen}
        options={{
          drawerIcon: ({ color, size }) => <UserSquare2 color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Events"
        component={StudentEventsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Stories"
        component={StudentStoriesScreen}
        options={{
          drawerIcon: ({ color, size }) => <History color={color} size={size} />
        }}
      />
      <Drawer.Screen
        name="Shorts"
        component={StudentShortsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Video color={color} size={size} />,
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Plans"
        component={StudentPlansScreen}
        options={{
          drawerIcon: ({ color, size }) => <BookOpen color={color} size={size} />
        }}
      />
    </Drawer.Navigator>
  );
};
