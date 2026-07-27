import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, G } from 'react-native-svg';
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

export const SkillsRadarChart = ({ data, size = 260 }: SkillsRadarChartProps) => {
  const horizontalPadding = 40; // Horizontal margin for labels
  const width = size + horizontalPadding * 2;
  const height = size;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = (size / 2) * 0.6; // Slightly reduced radius ratio for safety margin
  const angleStep = (Math.PI * 2) / data.length;

  // Calculate points for the proficiency polygon
  const points = data
    .map((d, i) => {
      const r = (d.value / d.fullMark) * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  // Calculate points for the background grids (5 concentric levels)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <View style={[styles.container, { width: width, height: height }]}>
      <Svg width={width} height={height}>
        <G>
          {/* Concentric Grid lines (Polygons matching the axes count) */}
          {gridLevels.map((level, idx) => {
            const gridPoints = data
              .map((_, i) => {
                const r = level * radius;
                const angle = i * angleStep - Math.PI / 2;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <Polygon
                key={`grid-${idx}`}
                points={gridPoints}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis lines radiating from the center */}
          {data.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <Line
                key={`axis-${i}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Proficiency Area (Translucent Fill & Solid Border) */}
          <Polygon
            points={points}
            fill={colors.accent.DEFAULT}
            fillOpacity={0.2}
            stroke={colors.accent.DEFAULT}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Axis Labels */}
          {data.map((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 15; // Balanced padding
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            
            // Adjust label alignments based on horizontal quadrant position
            let textAnchor = "middle";
            if (Math.cos(angle) > 0.1) textAnchor = "start";
            if (Math.cos(angle) < -0.1) textAnchor = "end";

            return (
              <SvgText
                key={`label-${i}`}
                x={x}
                y={y + 4}
                fontSize="11"
                fontWeight="500"
                fill="#64748B"
                textAnchor={textAnchor as any}
                fontFamily={typography.fontFamily.display}
              >
                {d.subject}
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
