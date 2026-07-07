import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShieldCheck, Star, FileText, CheckCircle2, Plus, ChevronRight, Clock } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

export interface SkillRow {
  id: string;
  name: string;
  category: string;
  categoryType: "Technical" | "Cognitive" | "Soft Skill";
  level: string;
  levelType: "Advanced" | "Intermediate" | "Beginner";
  evidence: number;
  endorsements: number;
  aiVerified: boolean;
  lastDemo: string;
}

const getCategoryStyle = (category: string) => {
  const styles = {
    Technical: { bg: '#F1F5F9', text: '#475569' },
    Cognitive: { bg: '#F5F3FF', text: '#7C3AED' },
    "Soft Skill": { bg: '#ECFDF5', text: '#059669' }
  };
  return styles[category as keyof typeof styles] || { bg: '#F1F5F9', text: '#475569' };
};

const getLevelStyle = (level: string, type: string) => {
  if (type === 'Advanced') return { text: colors.accent.DEFAULT, bg: 'rgba(255, 107, 0, 0.08)' };
  if (type === 'Intermediate') return { text: '#3B82F6', bg: '#EFF6FF' };
  return { text: '#64748B', bg: '#F8FAFC' };
};

interface SkillLedgerListProps {
  skills: SkillRow[];
  onSkillPress?: (skill: SkillRow) => void;
  onAddSkillPress?: () => void;
}

export const SkillLedgerList: React.FC<SkillLedgerListProps> = ({ skills, onSkillPress, onAddSkillPress }) => {
  const renderItem = (item: SkillRow) => {
    const catStyle = getCategoryStyle(item.categoryType);
    const levelStyle = getLevelStyle(item.level, item.levelType);

    return (
      <TouchableOpacity 
        key={item.id}
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => onSkillPress?.(item)}
      >
        {/* Header Row: Skill Name & AI Verification badge */}
        <View style={styles.cardHeader}>
          <Text style={styles.skillName}>{item.name}</Text>
          <View style={styles.rightAction}>
            {item.aiVerified ? (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={11} color="#059669" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}
            <ChevronRight size={16} color="#94A3B8" style={{ marginLeft: 6 }} />
          </View>
        </View>

        {/* Badges Row: Category and Level */}
        <View style={styles.badgesRow}>
          <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.categoryText, { color: catStyle.text }]}>{item.category}</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: levelStyle.bg }]}>
            <Text style={[styles.levelText, { color: levelStyle.text }]}>{item.level}</Text>
          </View>
        </View>

        {/* Grid Meta Details: Evidence, Endorsements, Last Demo */}
        <View style={styles.detailsGrid}>
          <View style={styles.gridItem}>
            <FileText size={11} color="#64748B" />
            <Text style={styles.gridLabel}>Evidence:</Text>
            <Text style={styles.gridValue}>{item.evidence} items</Text>
          </View>
          <View style={styles.gridItem}>
            <Star size={11} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.gridLabel}>Endorsed:</Text>
            <Text style={styles.gridValue}>{item.endorsements}</Text>
          </View>
          <View style={[styles.gridItem, { width: '100%', marginTop: 6 }]}>
            <Clock size={11} color="#64748B" />
            <Text style={styles.gridLabel}>Last Demo:</Text>
            <Text style={styles.gridValue}>{item.lastDemo || '-'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Full Skill Ledger</Text>
          <View style={styles.integrityBadge}>
             <CheckCircle2 size={10} color="#059669" />
             <Text style={styles.integrityText}>Integrity Verified</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addSkillInlineBtn} onPress={onAddSkillPress} activeOpacity={0.8}>
          <Plus size={12} color="#FFF" />
          <Text style={styles.addSkillInlineBtnText}>Add Skill</Text>
        </TouchableOpacity>
      </View>
      {skills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No skills found in your ledger. Click "Add Skill" to get started.</Text>
        </View>
      ) : (
        skills.map((item) => renderItem(item))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  integrityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  integrityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  addSkillInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent.DEFAULT,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addSkillInlineBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: typography.fontFamily.display,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  gridItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  gridValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  pendingBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  emptyContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontFamily: typography.fontFamily.display,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  }
});
