import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { DrawerContentComponentProps, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { useAuth } from '@/context/AuthContext';
import circularLogo from '@/assets/images/circularLogo.jpg';
import { 
  BarChart2, 
  BookOpen, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Zap, 
  Star, 
  Calendar, 
  History, 
  CreditCard, 
  Play,
  LogOut,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const insets = useSafeAreaInsets();
  const { userFullName, role, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: logout 
        }
      ]
    );
  };

  let headerBg = colors.accent.DEFAULT;
  if (role === 'Mentor') headerBg = '#2e1065';
  else if (role === 'College') headerBg = '#10b981';
  else if (role === 'Industry') headerBg = colors.purple[600] || '#9333ea';

  const [nepExpanded, setNepExpanded] = useState(false);
  const nepTabs = ["NEP Dashboard", "NEP 2020", "UGC 2026", "Grievance Engine", "Portfolio Locker", "ABC Credits", "Equity Audit", "NEP Reports"];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, backgroundColor: headerBg }]}>
        <View style={styles.profileBox}>
          <View style={styles.avatar}>
            <Image source={circularLogo} style={styles.avatarImage} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name} numberOfLines={1}>{userFullName || 'John Smith'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{(role as string)?.toUpperCase() || 'STUDENT'}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {role === 'College' ? (
          props.state.routes.map((route, i) => {
            const focused = i === props.state.index;
            const { title, drawerIcon, drawerActiveTintColor, drawerInactiveTintColor, drawerActiveBackgroundColor, drawerLabelStyle, drawerItemStyle } = props.descriptors[route.key].options;
            const isNepParent = route.name === 'NEP & UGC 2026';
            const isNepChild = nepTabs.includes(route.name);

            if (isNepChild && !nepExpanded) return null;

            return (
              <View key={route.key}>
                <DrawerItem
                  label={({ focused, color }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, paddingRight: 4 }}>
                      <Text style={[drawerLabelStyle, { color, fontSize: 13, fontWeight: '700' }]}>
                        {title !== undefined ? title : route.name}
                      </Text>
                      {isNepParent && (
                        <View style={{ opacity: 0.5 }}>
                          {nepExpanded ? <ChevronUp size={16} color={color} /> : <ChevronDown size={16} color={color} />}
                        </View>
                      )}
                    </View>
                  )}
                  icon={drawerIcon}
                  focused={focused}
                  activeTintColor={drawerActiveTintColor || '#10b981'}
                  inactiveTintColor={drawerInactiveTintColor || colors.text.secondary}
                  activeBackgroundColor={drawerActiveBackgroundColor || 'rgba(16, 185, 129, 0.1)'}
                  style={[drawerItemStyle, isNepChild && { marginTop: 0, marginBottom: 2, marginLeft: 44 }]}
                  onPress={() => {
                    if (isNepParent) {
                      setNepExpanded(!nepExpanded);
                    } else {
                      props.navigation.navigate(route.name);
                    }
                  }}
                />
              </View>
            );
          })
        ) : (
          <DrawerItemList {...props} />
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomRightRadius: 36,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: typography.fontFamily.display,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  logoutText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: '600',
  },
});
