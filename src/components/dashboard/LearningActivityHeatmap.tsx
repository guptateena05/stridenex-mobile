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
  // Generate mock heatmap data (5 weeks x 7 days = 35 points)
  const days = Array.from({ length: 35 }, (_, i) => ({
    opacity: Math.random() > 0.2 ? Math.random() * 0.7 + 0.3 : 0.2,
    id: i
  }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Activity</Text>
        <View style={styles.legend}>
          <Text style={styles.legendText}>Less</Text>
          <View style={[styles.legendBox, { opacity: 0.1 }]} />
          <View style={[styles.legendBox, { opacity: 0.4 }]} />
          <View style={[styles.legendBox, { opacity: 0.7 }]} />
          <View style={[styles.legendBox, { opacity: 1 }]} />
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>

      <View style={styles.heatmapGrid}>
        {days.map((day) => (
          <View 
            key={day.id} 
            style={[
              styles.heatBox, 
              { 
                backgroundColor: colors.accent.DEFAULT,
                opacity: day.opacity
              }
            ]} 
          />
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.lessons}</Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.problems}</Text>
          <Text style={styles.statLabel}>Problems</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.studyTime}h</Text>
          <Text style={styles.statLabel}>Study Time</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#94A3B8',
    marginHorizontal: 2,
  },
  legendBox: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.accent.DEFAULT,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  heatBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#F1F5F9',
  },
});
