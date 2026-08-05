import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { Bot, MessageSquare } from 'lucide-react-native';

interface AICoachCardProps {
  message: string;
  task: string;
}

export const AICoachCard = ({ message, task }: AICoachCardProps) => (
  <View style={styles.card}>
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Bot color="#94A3B8" size={20} />
        <Text style={styles.title}>AI Coach</Text>
      </View>
      
      {/* Message Box (Dark Blue) */}
      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{message}</Text>
      </View>
      
      {/* Today's Task */}
      <View style={styles.taskContainer}>
        <Text style={styles.todayText}>Today: </Text>
        <Text style={styles.taskText}>{task}</Text>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button} activeOpacity={0.8}>
        <MessageSquare color="#FFFFFF" size={16} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Open AI Coach</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'none',
    letterSpacing: 0.5,
  },
  messageBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  taskContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  todayText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  taskText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#FF6B00',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
