import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';

interface Alert {
  type: 'warning' | 'success' | 'danger';
  message: string;
  detail: string;
}

interface AlertsAgendaCardProps {
  alerts: Alert[];
}

export const AlertsAgendaCard = ({ alerts }: AlertsAgendaCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.alertsList}>
        {alerts && alerts.length > 0 ? (
          alerts.map((alert, i) => (
            <View key={i} style={styles.alertCard}>
              <View style={styles.alertIconBox}>
                 <Bell color={alert.type === 'warning' ? '#F97316' : (alert.type === 'danger' ? '#EF4444' : '#10B981')} size={20} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertMsg}>{alert.message}</Text>
                <Text style={styles.alertDetail}>{alert.detail}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyAlertsCard}>
            <Text style={styles.emptyAlertsText}>No new opportunity alerts today.</Text>
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
  emptyAlertsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyAlertsText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
