import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User, ShieldCheck, Calendar } from 'lucide-react-native';
import { Svg, Defs, LinearGradient as SvgGradient, Stop, Rect, Circle } from 'react-native-svg';

interface RoleBannerWidgetProps {
  fullName: string;
  date: string;
  role: string;
  progress: number;
  theme?: 'orange' | 'purple';
}

export const RoleBannerWidget = ({ fullName, date, role, progress, theme = 'orange' }: RoleBannerWidgetProps) => {
  const isPurple = theme === 'purple';
  const gradStart = isPurple ? '#A855F7' : '#FB923C';
  const gradEnd = isPurple ? '#7E22CE' : '#EA580C';
  const shadowColor = isPurple ? '#7E22CE' : '#EA580C';
  const iconColor = isPurple ? '#9333EA' : '#EA580C';

  return (
    <View style={[styles.container, { backgroundColor: gradStart, shadowColor }]}>
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <SvgGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradStart} stopOpacity="1" />
              <Stop offset="100%" stopColor={gradEnd} stopOpacity="1" />
            </SvgGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#headerGrad)" rx={32} />
          <Circle cx="90%" cy="10%" r="80" fill="white" fillOpacity="0.12" />
          <Circle cx="5%" cy="90%" r="50" fill="white" fillOpacity="0.08" />
        </Svg>
      </View>

      <View style={styles.content}>
        <View style={styles.topSection}>
          <View>
            <Text style={styles.greeting}>Hello, {fullName.split(' ')[0]}!</Text>
            <View style={styles.dateRow}>
              <Calendar size={12} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.dateText}>{date} • {role}</Text>
            </View>
          </View>
          <View style={styles.avatar}>
            <User color={iconColor} size={24} />
          </View>
        </View>

        <View style={styles.bottomCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Course Completion</Text>
            <Text style={styles.progressVal}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 32,
    marginBottom: 28,
    overflow: 'hidden',
    backgroundColor: '#FB923C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bottomCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
});
