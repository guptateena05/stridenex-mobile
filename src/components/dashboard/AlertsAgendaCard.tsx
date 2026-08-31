import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Flame, Clock, Sparkles, Briefcase, Calendar } from 'lucide-react-native';

interface AlertsAgendaCardProps {
  alerts: {
    newPostings?: any[];
    deadlineAlerts?: any[];
  };
}

export const AlertsAgendaCard = ({ alerts }: AlertsAgendaCardProps) => {
  const newPostings = alerts?.newPostings || [];
  const deadlineAlerts = alerts?.deadlineAlerts || [];
  
  const hasAnyAlerts = newPostings.length > 0 || deadlineAlerts.length > 0;

  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (deadlineAlerts.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [deadlineAlerts.length, pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.alertsList}>
        {!hasAnyAlerts ? (
          <View style={styles.emptyAlertsCard}>
            <View style={styles.emptyIconBox}>
              <Calendar color="#94A3B8" size={24} />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyAlertsText}>No new opportunity alerts or deadlines today.</Text>
          </View>
        ) : (
          <View style={{ gap: 24 }}>
            {/* Urgent Deadlines */}
            {deadlineAlerts.length > 0 && (
              <View style={{ gap: 12 }}>
                <Animated.View style={[styles.sectionHeader, { opacity: pulseAnim }]}>
                  <Flame color="#DC2626" size={14} />
                  <Text style={styles.sectionTitleRed}>Urgent Deadlines</Text>
                </Animated.View>
                <View style={{ gap: 8 }}>
                  {deadlineAlerts.slice(0, 3).map((alert: any, idx: number) => {
                    const isToday = alert.days_left === 0;
                    return (
                      <View 
                        key={`deadline-${idx}`} 
                        style={[
                          styles.alertCard, 
                          isToday ? styles.cardRed : styles.cardAmber
                        ]}
                      >
                        <View style={[styles.iconBox, isToday ? styles.iconBoxRed : styles.iconBoxAmber]}>
                          <Clock color={isToday ? "#DC2626" : "#D97706"} size={16} />
                        </View>
                        <View style={styles.alertContent}>
                          <View style={styles.titleRow}>
                            <Text style={styles.alertMsg} numberOfLines={1}>{alert.title || alert.name}</Text>
                            <Animated.View style={[styles.badge, isToday ? [styles.badgeRed, { opacity: pulseAnim }] : styles.badgeAmber]}>
                              <Text style={[styles.badgeText, isToday ? styles.badgeTextRed : styles.badgeTextAmber]}>
                                {isToday ? "TODAY" : `${alert.days_left}D LEFT`}
                              </Text>
                            </Animated.View>
                          </View>
                          <Text style={styles.alertDetail} numberOfLines={1}>{alert.type} • Deadline: {alert.deadline}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* New Opportunities */}
            {newPostings.length > 0 && (
              <View style={{ gap: 12 }}>
                <View style={styles.sectionHeader}>
                  <Sparkles color="#059669" size={14} />
                  <Text style={styles.sectionTitleGreen}>New Opportunities</Text>
                </View>
                <View style={{ gap: 8 }}>
                  {newPostings.slice(0, 3).map((posting: any, idx: number) => (
                    <View key={`new-${idx}`} style={styles.newCard}>
                      <View style={styles.iconBoxGreen}>
                        <Briefcase color="#059669" size={16} />
                      </View>
                      <View style={styles.alertContent}>
                        <View style={styles.titleRow}>
                          <Text style={styles.alertMsg} numberOfLines={1}>{posting.title || posting.name}</Text>
                          <Text style={styles.dateText}>{posting.date}</Text>
                        </View>
                        <Text style={styles.alertDetail} numberOfLines={1}>{posting.type}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  alertsList: {
    gap: 12,
  },
  emptyAlertsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  emptyAlertsText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitleRed: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitleGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertCard: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  cardRed: {
    backgroundColor: 'rgba(254, 226, 226, 0.6)', 
    borderColor: '#FEE2E2',
  },
  cardAmber: {
    backgroundColor: 'rgba(254, 243, 199, 0.4)', 
    borderColor: 'rgba(253, 230, 138, 0.6)', 
  },
  newCard: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxRed: {
    backgroundColor: '#FEE2E2',
  },
  iconBoxAmber: {
    backgroundColor: '#FEF3C7',
  },
  iconBoxGreen: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#D1FAE5',
  },
  alertContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
    gap: 8,
  },
  alertMsg: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 1,
  },
  badgeRed: {
    backgroundColor: '#FECACA',
  },
  badgeAmber: {
    backgroundColor: '#FDE68A',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextRed: {
    color: '#B91C1C',
  },
  badgeTextAmber: {
    color: '#92400E',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  alertDetail: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
