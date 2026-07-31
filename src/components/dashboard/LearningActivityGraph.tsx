import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface HeatmapData {
  lessons: number;
  problems: number;
  studyTime: number;
}

interface LearningActivityGraphProps {
  data: any;
}

export const LearningActivityGraph = ({ data }: LearningActivityGraphProps) => {
  // Parse dynamic data with fallbacks
  const totals = data?.totals || data?.message?.totals;
  const lessons = totals?.lessons ?? 0;
  const problems = totals?.problems ?? 0;
  const studyTime = totals?.study_hours ?? 0;
  const streak = data?.streak ?? data?.streak_count ?? 0;

  const weeksData = data?.weeks || data?.message?.weeks;
  let parsedChartData = Array.isArray(weeksData) && weeksData.length > 0
    ? weeksData.map((weekObj: any) => {
        let hours = 0;
        if (weekObj.days && Array.isArray(weekObj.days)) {
          weekObj.days.forEach((day: any) => {
            hours += (day.study_minutes || 0) / 60;
          });
        }
        return Number(hours.toFixed(1));
      })
    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // If the parsed array is too short to draw a graph (needs at least 2 points), pad it with zeros
  if (parsedChartData.length === 0) {
    parsedChartData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  } else if (parsedChartData.length === 1) {
    parsedChartData = [parsedChartData[0], 0];
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const labels = Array.isArray(weeksData) && weeksData.length > 0
    ? weeksData.map((weekObj: any, idx: number) => {
        if (weekObj.week_start) {
          return weekObj.week_start.slice(5); // e.g. "06-13"
        }
        return `W${idx + 1}`;
      })
    : months;
  
  const width = 340;
  const height = 120;
  const paddingLeft = 25;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const maxVal = Math.max(...parsedChartData, 100);

  const points = parsedChartData.map((val, i) => {
    const x = paddingLeft + (i * chartWidth) / (parsedChartData.length - 1);
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });

  // Create path for the line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Create path for the filled area under the line
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Activity Graph</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔥 {streak} Day Streak!</Text>
        </View>
      </View>

      {/* Custom SVG Graph */}
      <View style={styles.chartContainer}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.accent?.DEFAULT || '#ff6b00'} stopOpacity={0.3} />
              <Stop offset="100%" stopColor={colors.accent?.DEFAULT || '#ff6b00'} stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
          <Line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
          <Line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="#E2E8F0" strokeWidth="1" />

          {/* Area Fill */}
          <Path d={areaPath} fill="url(#grad)" />

          {/* Line Path */}
          <Path d={linePath} fill="none" stroke={colors.accent?.DEFAULT || '#ff6b00'} strokeWidth="3" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <React.Fragment key={i}>
              {/* Glow circle */}
              <Circle cx={p.x} cy={p.y} r="6" fill={colors.accent?.DEFAULT || '#ff6b00'} fillOpacity="0.2" />
              {/* Inner solid circle */}
              <Circle cx={p.x} cy={p.y} r="3.5" fill="#FFF" stroke={colors.accent?.DEFAULT || '#ff6b00'} strokeWidth="2" />
            </React.Fragment>
          ))}

          {/* X Axis Labels */}
          {points.map((p, i) => {
            if (i % 2 !== 0) return null;
            return (
              <SvgText
                key={i}
                x={p.x}
                y={height - 2}
                fontSize="9"
                fill="#94A3B8"
                fontWeight="600"
                textAnchor="middle"
              >
                {labels[i] || `W${i + 1}`}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>LESSONS</Text>
          <Text style={styles.statValue}>{lessons}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>PROBLEMS</Text>
          <Text style={styles.statValue}>{problems}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TIME</Text>
          <Text style={styles.statValue}>{studyTime}h</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: typography.fontFamily.display,
  },
  badge: {
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EA580C',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
});
