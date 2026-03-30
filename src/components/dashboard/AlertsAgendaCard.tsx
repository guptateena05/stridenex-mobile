import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Bell, Calendar, BookOpen, Clock } from 'lucide-react-native';

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
    switch (iconName) {
      case 'education': return <BookOpen size={14} color={colors.text.secondary} />;
      case 'call': return <Clock size={14} color={colors.text.secondary} />;
      case 'write': return <Calendar size={14} color={colors.text.secondary} />;
      default: return <Bell size={14} color={colors.text.secondary} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'warning': return colors.warning || '#f59e0b';
      case 'success': return colors.success || '#10b981';
      case 'danger': return colors.error || '#ef4444';
      default: return colors.primary.DEFAULT;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.section}>
        <View style={styles.header}>
          <Bell size={20} color={colors.navy} />
          <Text style={styles.title}>Alerts</Text>
        </View>
        {alerts.map((alert, index) => (
          <View key={index} style={[styles.alertItem, { borderLeftColor: getColor(alert.type) }]}>
            <Text style={styles.alertMsg}>{alert.message}</Text>
            <Text style={styles.alertDetail}>{alert.detail}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.header}>
          <Calendar size={20} color={colors.navy} />
          <Text style={styles.title}>Upcoming Agenda</Text>
        </View>
        {agenda.map((item, index) => (
          <View key={index} style={styles.agendaItem}>
            <View style={styles.agendaIconBox}>
              {getIcon(item.icon)}
            </View>
            <Text style={styles.agendaText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: 'bold',
    color: colors.navy,
    fontFamily: typography.fontFamily.display,
  },
  alertItem: {
    backgroundColor: '#f8fafc',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    marginBottom: spacing.sm,
  },
  alertMsg: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },
  alertDetail: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: spacing.md,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  agendaIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '500',
  },
});
