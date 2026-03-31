import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';

interface HeatmapData {
  lessons: number;
  problems: number;
  studyTime: number;
}

interface LearningActivityHeatmapProps {
  data: HeatmapData;
}

export const LearningActivityHeatmap = ({ data }: LearningActivityHeatmapProps) => {
  // GitHub-style discrete levels
  const levels = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
  
  // Generate mock heatmap data (15 weeks x 7 days = 105 points for a denser look)
  const days = Array.from({ length: 98 }, (_, i) => ({
    level: Math.floor(Math.random() * 5),
    id: i
  }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Activity</Text>
        <View style={styles.legend}>
          <Text style={styles.legendText}>Less</Text>
          {levels.map((color, i) => (
            <View key={i} style={[styles.legendBox, { backgroundColor: color }]} />
          ))}
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>

      <View style={styles.heatmapGrid}>
        {days.map((day) => (
          <View 
            key={day.id} 
            style={[
              styles.heatBox, 
              { backgroundColor: levels[day.level] }
            ]} 
          />
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>LESSONS</Text>
          <Text style={styles.statValue}>{data.lessons}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>PROBLEMS</Text>
          <Text style={styles.statValue}>{data.problems}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TIME</Text>
          <Text style={styles.statValue}>{data.studyTime}h</Text>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: typography.fontFamily.display,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  legendText: {
    fontSize: 8,
    color: '#94A3B8',
    marginHorizontal: 2,
    fontWeight: '600',
  },
  legendBox: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingRight: 10, // Ensure it doesn't touch the edge
  },
  heatBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
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
