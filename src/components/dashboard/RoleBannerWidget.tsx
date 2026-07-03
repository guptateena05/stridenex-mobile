import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, ShieldCheck, Calendar, Users, Award, Briefcase, Target, Pen } from 'lucide-react-native';
import { Svg, Defs, LinearGradient as SvgGradient, Stop, Rect, Circle } from 'react-native-svg';

interface RoleBannerWidgetProps {
  fullName: string;
  date: string;
  role: string;
  progress: number;
  theme?: 'orange' | 'purple' | 'mentor' | 'college';
  metrics?: { label: string; value: string | number; iconName?: 'Users' | 'Calendar' | 'Award' | 'Briefcase' | 'Target' }[];
  title?: string;
  subtitle?: string;
  onEditPress?: () => void;
}

export const RoleBannerWidget = ({ fullName, date, role, progress, theme = 'orange', metrics, title, subtitle, onEditPress }: RoleBannerWidgetProps) => {
  const isPurple = theme === 'purple';
  const isMentor = theme === 'mentor';
  const isCollege = theme === 'college' || role?.toLowerCase() === 'college';
  
  let gradStart = '#FB923C';
  let gradEnd = '#EA580C';
  let shadowColor = '#EA580C';
  let iconColor = '#EA580C';

  if (isPurple) {
    gradStart = '#2EA0B6'; // Soothing teal-cyan
    gradEnd = '#0A8099';   // Primary teal-cyan
    shadowColor = '#0A8099';
    iconColor = '#0A8099';
  } else if (isMentor) {
    gradStart = '#4c1d95'; // violet-900
    gradEnd = '#2e1065';   // violet-950
    shadowColor = '#2e1065';
    iconColor = '#4c1d95';
  } else if (isCollege) {
    gradStart = '#10b981'; // emerald-500
    gradEnd = '#047857';   // emerald-700
    shadowColor = '#047857';
    iconColor = '#10b981';
  }

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Users': return <Users size={16} color={iconColor} />;
      case 'Calendar': return <Calendar size={16} color={iconColor} />;
      case 'Award': return <Award size={16} color={iconColor} />;
      case 'Briefcase': return <Briefcase size={16} color={iconColor} />;
      case 'Target': return <Target size={16} color={iconColor} />;
      default: return null;
    }
  };

  const displayGreetingName = fullName ? (fullName.split(' ')[0] || 'User') : 'User';

  return (
    <View style={[styles.container, { backgroundColor: gradStart, shadowColor }]}>
      <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
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

      <View style={[styles.content, { zIndex: 2 }]}>
        <View style={styles.topSection}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            {title ? (
              <>
                <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
                {subtitle ? (
                  <Text style={styles.subtitleText}>{subtitle}</Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.greeting}>Hello, {displayGreetingName}!</Text>
                <View style={styles.dateRow}>
                  <Calendar size={12} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.dateText}>{date} • {role}</Text>
                </View>
              </>
            )}
          </View>
          {onEditPress ? (
            <TouchableOpacity style={styles.avatar} onPress={onEditPress}>
              <Pen color={iconColor} size={20} />
            </TouchableOpacity>
          ) : (
            <View style={styles.avatar}>
              <User color={iconColor} size={24} />
            </View>
          )}
        </View>

        {metrics && metrics.length > 0 ? (
          <View style={styles.metricsRow}>
            {metrics.map((m, i) => (
              <View key={i} style={styles.metricBox}>
                <View style={styles.metricValRow}>
                  <Text style={styles.metricVal}>{m.value}</Text>
                  {getIcon(m.iconName)}
                </View>
                <Text style={styles.metricLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.bottomCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Course Completion</Text>
              <Text style={styles.progressVal}>{progress}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}
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
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
  },
  metricValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    lineHeight: 16,
  }
});
