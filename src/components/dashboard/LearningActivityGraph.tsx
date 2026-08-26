import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { BookOpen, Code, Clock } from 'lucide-react-native';

interface LearningActivityGraphProps {
  data: any;
}

const staticDemoGraphData = [
  { hours: 2.5, lessons: 1, problems: 3 },
  { hours: 4.0, lessons: 2, problems: 5 },
  { hours: 3.5, lessons: 1, problems: 4 },
  { hours: 6.0, lessons: 3, problems: 8 },
  { hours: 8.0, lessons: 4, problems: 10 },
  { hours: 5.5, lessons: 2, problems: 7 },
  { hours: 7.0, lessons: 3, problems: 9 },
  { hours: 9.5, lessons: 5, problems: 12 },
  { hours: 8.0, lessons: 4, problems: 10 },
  { hours: 11.0, lessons: 6, problems: 15 }
];

export const LearningActivityGraph = ({ data }: LearningActivityGraphProps) => {
  const [activeMetric, setActiveMetric] = useState<"hours" | "lessons" | "problems">("hours");

  // Parse dynamic data with fallbacks
  const totals = data?.totals || data?.message?.totals;
  const initialLessons = totals?.lessons ?? 0;
  const initialProblems = totals?.problems ?? 0;
  const initialStudyTime = totals?.study_hours ?? 0;
  const initialStreak = data?.streak ?? data?.streak_count ?? 0;

  const isDemoMode = initialLessons === 0 && initialProblems === 0 && initialStudyTime === 0;

  const lessons = isDemoMode ? 31 : initialLessons;
  const problems = isDemoMode ? 83 : initialProblems;
  const studyTime = isDemoMode ? 65 : initialStudyTime;
  const streak = isDemoMode ? 5 : initialStreak;

  const weeksData = data?.weeks || data?.message?.weeks;
  
  const parsedData = isDemoMode 
    ? staticDemoGraphData
    : (Array.isArray(weeksData) && weeksData.length > 0
        ? weeksData.map((weekObj: any) => {
            let hours = 0;
            let weekLessons = 0;
            let weekProblems = 0;
            if (weekObj.days && Array.isArray(weekObj.days)) {
              weekObj.days.forEach((day: any) => {
                hours += (day.study_minutes || 0) / 60;
                weekLessons += day.lessons || 0;
                weekProblems += day.problems || 0;
              });
            }
            return {
              hours: Number(hours.toFixed(1)),
              lessons: weekLessons,
              problems: weekProblems
            };
          })
        : new Array(10).fill({ hours: 0, lessons: 0, problems: 0 }));

  let parsedChartData = parsedData.map(d => d[activeMetric]);

  // If the parsed array is too short to draw a graph (needs at least 2 points), pad it
  if (parsedChartData.length === 0) {
    parsedChartData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  } else if (parsedChartData.length === 1) {
    parsedChartData = [parsedChartData[0], 0];
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const labels = Array.isArray(weeksData) && weeksData.length > 0 && !isDemoMode
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
  
  const maxVal = Math.max(...parsedChartData, 10);

  const points = parsedChartData.map((val, i) => {
    const x = paddingLeft + (i * chartWidth) / (parsedChartData.length - 1);
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });

  // Create path for the line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Create path for the filled area under the line
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Colors config based on metric
  const metricColors = {
    hours: { stroke: "#EA580C", bgLight: "rgba(234, 88, 12, 0.15)", iconColor: "#EA580C" },
    lessons: { stroke: "#10b981", bgLight: "rgba(16, 185, 129, 0.15)", iconColor: "#10b981" },
    problems: { stroke: "#eab308", bgLight: "rgba(234, 179, 8, 0.15)", iconColor: "#eab308" }
  };
  
  const activeColor = metricColors[activeMetric].stroke;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>📊 Learning Activity Graph</Text>
          {isDemoMode ? (
            <Text style={styles.demoSubText}>Sample course activity data</Text>
          ) : (
            <Text style={styles.subText}>Weekly progress details</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {isDemoMode && (
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>PREVIEW MODE</Text>
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🔥 {streak} Day Streak!</Text>
          </View>
        </View>
      </View>
      
      {/* Metric Selectors */}
      <View style={styles.metricSelectors}>
        {(['hours', 'lessons', 'problems'] as const).map((m) => {
           const isActive = activeMetric === m;
           return (
             <TouchableOpacity 
               key={m}
               onPress={() => setActiveMetric(m)}
               style={[
                 styles.metricBtn,
                 isActive && { backgroundColor: metricColors[m].bgLight, borderColor: metricColors[m].bgLight }
               ]}
               activeOpacity={0.7}
             >
               <Text style={[
                 styles.metricBtnText, 
                 isActive && { color: metricColors[m].stroke }
               ]}>
                 {m === 'hours' ? 'Hours' : m === 'lessons' ? 'Lessons' : 'Problems'}
               </Text>
             </TouchableOpacity>
           )
        })}
      </View>

      {/* Custom SVG Graph */}
      <View style={styles.chartContainer}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={activeColor} stopOpacity={0.3} />
              <Stop offset="100%" stopColor={activeColor} stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
          <Line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
          <Line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="#E2E8F0" strokeWidth="1" />

          {/* Area Fill */}
          <Path d={areaPath} fill="url(#grad)" />

          {/* Line Path */}
          <Path d={linePath} fill="none" stroke={activeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <React.Fragment key={i}>
              <Circle cx={p.x} cy={p.y} r="6" fill={activeColor} fillOpacity="0.2" />
              <Circle cx={p.x} cy={p.y} r="3.5" fill="#FFF" stroke={activeColor} strokeWidth="2" />
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
        <TouchableOpacity 
          style={[styles.statItem, activeMetric === 'lessons' && styles.activeStatItem]} 
          onPress={() => setActiveMetric('lessons')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <BookOpen size={16} color="#10b981" />
          </View>
          <Text style={styles.statValue}>{lessons}</Text>
          <Text style={styles.statLabel}>LESSONS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statItem, activeMetric === 'problems' && styles.activeStatItem]} 
          onPress={() => setActiveMetric('problems')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
            <Code size={16} color="#eab308" />
          </View>
          <Text style={styles.statValue}>{problems}</Text>
          <Text style={styles.statLabel}>PROBLEMS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statItem, activeMetric === 'hours' && styles.activeStatItem]} 
          onPress={() => setActiveMetric('hours')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(234, 88, 12, 0.1)' }]}>
            <Clock size={16} color="#EA580C" />
          </View>
          <Text style={styles.statValue}>{studyTime}h</Text>
          <Text style={styles.statLabel}>TIME</Text>
        </TouchableOpacity>
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: typography.fontFamily.display,
  },
  subText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  demoSubText: {
    fontSize: 10,
    color: '#EA580C',
    marginTop: 2,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EA580C',
  },
  previewBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  previewBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#EA580C',
  },
  metricSelectors: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  metricBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
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
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeStatItem: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    padding: 6,
    borderRadius: 8,
    marginBottom: 6,
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
    marginBottom: 2,
  },
});
