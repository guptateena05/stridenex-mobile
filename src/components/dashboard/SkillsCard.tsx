import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';

interface Skill {
  name: string;
  percentage: number;
}

interface SkillsCardProps {
  skills: Skill[];
}

export const SkillsCard = ({ skills }: SkillsCardProps) => (
  <View style={styles.card}>
    <Text style={styles.title}>Top Skills</Text>
    {skills.map((skill, index) => (
      <View key={index} style={styles.skillRow}>
        <View style={styles.skillInfo}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text style={styles.skillPerc}>{skill.percentage}%</Text>
        </View>
        <View style={styles.skillBarBg}>
          <View 
            style={[
              styles.skillBarFill, 
              { 
                width: `${skill.percentage}%`, 
                backgroundColor: index % 2 === 0 ? colors.accent.DEFAULT : colors.primary.DEFAULT 
              }
            ]} 
          />
        </View>
      </View>
    ))}
  </View>
);

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
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: spacing.lg,
    fontFamily: typography.fontFamily.display,
  },
  skillRow: {
    marginBottom: spacing.md,
  },
  skillInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  skillName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '600',
  },
  skillPerc: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  skillBarBg: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
