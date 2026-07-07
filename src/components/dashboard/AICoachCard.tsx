import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Bot } from 'lucide-react-native';

interface AICoachCardProps {
  message: string;
  task: string;
}

export const AICoachCard = ({ message, task }: AICoachCardProps) => (
  <View style={styles.card}>
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Bot color="#F97316" size={22} />
        </View>
        <View>
          <Text style={styles.title}>Career Insights</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>ANALYSIS LIVE</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.actionBox}>
        <Text style={styles.actionLabel}>RECOMMENDED ACTION</Text>
        <Text style={styles.actionText}>{task}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  title: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: typography.fontFamily.display,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  liveText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  message: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
    fontWeight: '500',
  },
  actionBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionLabel: {
    color: '#F97316',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  actionText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
