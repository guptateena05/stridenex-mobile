import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StudentDashboardScreen } from '@/screens/Dashboards/StudentDashboard/StudentDashboardScreen';
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
  Video 
} from 'lucide-react-native';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

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
          drawerIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Skills" 
        component={DummyScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <Zap color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Path" 
        component={DummyScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <Navigation color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Community" 
        component={DummyScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <Users color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Internships" 
        component={DummyScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <Briefcase color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Habits" 
        component={DummyScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <PieChart color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Mentors" 
        component={DummyScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <UserSquare2 color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Events" 
        component={DummyScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <Calendar color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Stories" 
        component={DummyScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <History color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Plans" 
        component={DummyScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <BookOpen color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Shorts" 
        component={DummyScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <Video color={color} size={size} /> 
        }} 
      />
    </Drawer.Navigator>
  );
};
