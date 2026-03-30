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
    <View style={styles.gradientOverlay} />
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={styles.botIconWrapper}>
          <View style={styles.pulseRing} />
          <View style={styles.iconBox}>
            <Bot color="#fff" size={20} />
          </View>
        </View>
        <View>
          <Text style={styles.title}>AI Career Coach</Text>
          <Text style={styles.subtitle}>Personalized Guidance</Text>
        </View>
      </View>
      
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.taskBox}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskLabel}>NEXT MILESTONE</Text>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>High Priority</Text>
          </View>
        </View>
        <Text style={styles.taskText}>{task}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 0, 0.05)', // Subtle Stridenex orange hint
  },
  content: {
    padding: 20,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  botIconWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  pulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    top: -4,
    left: -4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: typography.fontFamily.display,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  message: {
    color: 'rgba(219, 234, 254, 0.9)', // Light blue-ish white
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
  },
  taskBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskLabel: {
    color: colors.accent.DEFAULT,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  priorityBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: colors.accent.DEFAULT,
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  taskText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
