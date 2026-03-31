import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface RadarData {
  subject: string;
  value: number;
  fullMark: number;
}

interface SkillsRadarChartProps {
  data: RadarData[];
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const SkillsRadarChart = ({ data, size = 260 }: SkillsRadarChartProps) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const center = size / 2;
  const radius = (size / 2) * 0.68; // Slightly more compact for better label breathing room
  const angleStep = (Math.PI * 2) / data.length;

  // Calculate points for the proficiency polygon
  const points = data
    .map((d, i) => {
      const r = (d.value / d.fullMark) * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  const proficiencyPoints = data.map((d, i) => {
    const r = (d.value / d.fullMark) * radius;
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  // Calculate points for the background grids (5 levels)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="polyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.accent.light} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={colors.accent.DEFAULT} stopOpacity="0.8" />
          </LinearGradient>
          <RadialGradient id="glowGradient" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={colors.accent.DEFAULT} stopOpacity="0.15" />
            <Stop offset="100%" stopColor={colors.accent.DEFAULT} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <G>
          {/* Subtle Outer Glow */}
          <Circle
            cx={center}
            cy={center}
            r={radius * 1.2}
            fill="url(#glowGradient)"
          />

          {/* Grid lines (Hexagons/Polygons) */}
          {gridLevels.map((level, idx) => {
            const gridPoints = data
              .map((_, i) => {
                const r = level * radius;
                const angle = i * angleStep - Math.PI / 2;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <Polygon
                key={`grid-${idx}`}
                points={gridPoints}
                fill="none"
                stroke={idx === gridLevels.length - 1 ? "#CBD5E1" : "#E2E8F0"}
                strokeWidth={idx === gridLevels.length - 1 ? "1.5" : "1"}
                strokeDasharray={idx < gridLevels.length - 1 ? "4,4" : undefined}
              />
            );
          })}

          {/* Axis lines */}
          {data.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <Line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1.2"
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Proficiency Polygon */}
          <Polygon
            points={points}
            fill="url(#polyGradient)"
            stroke={colors.accent.DEFAULT}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Proficiency Points with Pulse Effect */}
          {proficiencyPoints.map((p, i) => (
            <G key={`point-group-${i}`}>
              <AnimatedCircle
                cx={p.x}
                cy={p.y}
                r={pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, 10],
                })}
                fill={colors.accent.DEFAULT}
                opacity={pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0],
                })}
              />
              <Circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#FFFFFF"
                stroke={colors.accent.DEFAULT}
                strokeWidth="2"
              />
            </G>
          ))}

          {/* Labels */}
          {data.map((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 24;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            
            // Adjust label alignment based on position
            let textAnchor = "middle";
            if (Math.cos(angle) > 0.1) textAnchor = "start";
            if (Math.cos(angle) < -0.1) textAnchor = "end";

            return (
              <SvgText
                key={`label-${i}`}
                x={x}
                y={y + 4}
                fontSize="11"
                fontWeight="800"
                fill="#475569"
                textAnchor={textAnchor as any}
                fontFamily={typography.fontFamily.display}
                letterSpacing={0.2}
              >
                {d.subject.toUpperCase()}
              </SvgText>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
