import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { Bell, BookOpen, Video, Clock, MessageSquare, Calendar } from 'lucide-react-native';

interface Alert {
  type: 'warning' | 'success' | 'danger';
  message: string;
  detail: string;
}

interface AgendaItem {
  icon: string;
  text: string;
}

interface AlertsAgendaCardProps {
  alerts: Alert[];
  agenda: AgendaItem[];
}

export const AlertsAgendaCard = ({ alerts, agenda }: AlertsAgendaCardProps) => {
  const getIcon = (iconName: string) => {
    const iconSize = 18;
    switch (iconName) {
      case 'education': return <BookOpen size={iconSize} color="#6366F1" />;
      case 'call': return <Clock size={iconSize} color="#F97316" />;
      default: return <Video size={iconSize} color="#10B981" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Priority Inbox</Text>
      </View>
      <View style={styles.alertsList}>
        {alerts.map((alert, i) => (
          <View key={i} style={styles.alertCard}>
            <View style={styles.alertIconBox}>
               <Bell color={alert.type === 'warning' ? '#F97316' : '#10B981'} size={20} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertMsg}>{alert.message}</Text>
              <Text style={styles.alertDetail}>{alert.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.sectionHeader, { marginTop: 32 }]}>
        <Text style={styles.sectionTitle}>Learning Pipeline</Text>
      </View>
      <View style={styles.timelineContainer}>
        {agenda.map((item, i) => (
          <View key={i} style={styles.timelineItem}>
            <View style={styles.timelineContent}>
              <View style={styles.agendaIconBox}>
                {getIcon(item.icon)}
              </View>
              <View style={styles.agendaTextContainer}>
                <Text style={styles.agendaText}>{item.text}</Text>
                <Text style={styles.agendaSub}>Status: Scheduled</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  alertIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  alertContent: {
    flex: 1,
  },
  alertMsg: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  alertDetail: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  timelineContainer: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  agendaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  agendaTextContainer: {
    flex: 1,
  },
  agendaText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  agendaSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
});
