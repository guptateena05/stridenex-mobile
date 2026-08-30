import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface OverallSkillScoreProps {
  score: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
}

export const OverallSkillScore = ({
  score,
  label = 'Overall',
  size = 85,
  strokeWidth = 6
}: OverallSkillScoreProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <Defs>
            <SvgGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.accent.light} />
              <Stop offset="100%" stopColor={colors.accent.DEFAULT} />
            </SvgGradient>
          </Defs>

          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#grad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        <View style={styles.content}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      </View>

      <Text style={styles.footerText}>
        Keep building your profile
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 16,
    textAlign: 'center',
  }
});
