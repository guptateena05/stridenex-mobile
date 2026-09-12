import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { getHabitCompletionHeatmap } from '@/api/student.services';

interface HeatmapDay {
  date: string | null;
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  day_of_week: number | null;
}

interface HeatmapWeek {
  week_number: number;
  days: HeatmapDay[];
}

interface HeatmapMonth {
  name: string;
  week_index: number;
}

interface HeatmapData {
  year: number;
  total_done: number;
  max_count: number;
  weeks: HeatmapWeek[];
  months: HeatmapMonth[];
}

const INTENSITY_COLORS: Record<number, string> = {
  0: '#eef0f3',   // empty day
  1: '#bbf7d0',   // level 1
  2: '#4ade80',   // level 2
  3: '#22c55e',   // level 3
  4: '#16a34a',   // level 4
};

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CELL = 13;
const GAP = 3;
const DOW_COL_W = 25;
const MONTH_ROW_H = 15;

export const HabitHeatmapWidget = ({ studentEmail }: { studentEmail: string }) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear];

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHeatmap = useCallback(async (year: number) => {
    if (!studentEmail) return;
    setLoading(true);
    try {
      const data = await getHabitCompletionHeatmap(studentEmail, year);
      setHeatmapData(data);
    } catch (err) {
      console.error('Heatmap fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [studentEmail]);

  useEffect(() => {
    fetchHeatmap(selectedYear);
  }, [selectedYear, fetchHeatmap]);

  const activeDays = heatmapData
    ? heatmapData.weeks.flatMap(w => w.days).filter(d => d.date !== null && d.intensity > 0).length
    : 0;
  const totalDays = heatmapData
    ? heatmapData.weeks.flatMap(w => w.days).filter(d => d.date !== null).length
    : 0;
  const completionPct = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <View style={styles.greenDot} />
            <Text style={styles.title}>Habit Activity</Text>
          </View>
          
          {!loading && heatmapData && (
            <View style={styles.statsContainer}>
              <View style={styles.statPillGreen}>
                <Text style={styles.statPillGreenText}>{heatmapData.total_done.toLocaleString()} habits done</Text>
              </View>
              <View style={styles.statPillGray}>
                <Text style={styles.statPillGrayText}>{activeDays} active days · {completionPct}% consistency</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.yearsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {yearOptions.map(y => (
              <TouchableOpacity 
                key={y} 
                onPress={() => setSelectedYear(y)}
                style={[styles.yearChip, selectedYear === y && styles.yearChipActive]}
              >
                <Text style={[styles.yearChipText, selectedYear === y && styles.yearChipTextActive]}>
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.gridWrapper}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#16a34a" />
          </View>
        ) : heatmapData ? (
          <View style={styles.heatmapRow}>
            {/* DOW Column */}
            <View style={styles.dowColumn}>
              {DOW_LABELS.map((label, i) => (
                <Text key={label} style={[styles.dowText, { color: i % 2 === 0 ? '#94a3b8' : 'transparent' }]}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Scrollable Grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.scrollGridContent}>
                {/* Months Row */}
                <View style={styles.monthsRow}>
                  {heatmapData.months.map(month => (
                    <Text 
                      key={month.name} 
                      style={[styles.monthText, { left: month.week_index * (CELL + GAP) }]}
                    >
                      {month.name}
                    </Text>
                  ))}
                </View>

                {/* Grid */}
                <View style={styles.weeksContainer}>
                  {heatmapData.weeks.map(week => (
                    <View key={week.week_number} style={styles.weekColumn}>
                      {week.days.map((day, di) => {
                        const isEmpty = day.date === null;
                        const bg = isEmpty ? 'transparent' : (INTENSITY_COLORS[day.intensity] ?? INTENSITY_COLORS[0]);
                        const isZero = !isEmpty && day.intensity === 0;
                        return (
                          <View
                            key={di}
                            style={[
                              styles.cell,
                              { backgroundColor: bg },
                              isZero && styles.cellZero
                            ]}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        ) : (
          <Text style={styles.noDataText}>No activity data available.</Text>
        )}
      </View>

      {/* Legend */}
      {!loading && heatmapData && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendText}>Less</Text>
          {[0, 1, 2, 3, 4].map(level => (
            <View 
              key={level} 
              style={[
                styles.legendCell, 
                { backgroundColor: INTENSITY_COLORS[level] },
                level === 0 && styles.cellZero
              ]} 
            />
          ))}
          <Text style={styles.legendText}>More</Text>
        </View>
      )}
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
  headerRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    fontFamily: typography.fontFamily.display,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statPillGreen: {
    backgroundColor: '#dcfce7',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statPillGreenText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
  },
  statPillGray: {
    backgroundColor: '#f8fafc',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statPillGrayText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  yearsContainer: {
    width: '100%',
  },
  yearChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 6,
  },
  yearChipActive: {
    backgroundColor: '#1e293b',
    borderColor: '#1e293b',
  },
  yearChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  yearChipTextActive: {
    color: '#ffffff',
  },
  gridWrapper: {
    width: '100%',
  },
  loaderContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapRow: {
    flexDirection: 'row',
  },
  dowColumn: {
    width: DOW_COL_W,
    paddingTop: MONTH_ROW_H,
    paddingRight: 6,
    gap: GAP,
  },
  dowText: {
    height: CELL,
    lineHeight: CELL,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'right',
  },
  scrollGridContent: {
    position: 'relative',
  },
  monthsRow: {
    height: MONTH_ROW_H,
    position: 'relative',
    width: '100%',
  },
  monthText: {
    position: 'absolute',
    top: 0,
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  weeksContainer: {
    flexDirection: 'row',
    gap: GAP,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 2,
  },
  cellZero: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noDataText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    marginTop: 10,
  },
  legendText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  legendCell: {
    width: 11,
    height: 11,
    borderRadius: 3,
  },
});
