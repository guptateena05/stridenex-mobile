const fs = require('fs');
const path = require('path');

const screens = [
  'src/screens/Auth/LoginScreen.tsx',
  'src/screens/Auth/SignupScreen.tsx',
  'src/screens/Auth/OnboardingScreen.tsx',
  'src/screens/Public/HomeScreen.tsx',
  'src/screens/Public/AboutScreen.tsx',
  'src/screens/Dashboards/StudentDashboard/StudentDashboardScreen.tsx',
  'src/screens/Dashboards/MentorDashboard/MentorDashboardScreen.tsx',
  'src/screens/Dashboards/CollegeDashboard/CollegeDashboardScreen.tsx',
  'src/screens/Dashboards/IndustryDashboard/IndustryDashboardScreen.tsx'
];

screens.forEach(file => {
  const compName = path.basename(file, '.tsx');
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true });
  
  const content = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ${compName} = () => {
  return (
    <View style={styles.container}>
      <Text>${compName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f6f8' }
});
`;
  fs.writeFileSync(file, content);
});
console.log('Screens generated!');
