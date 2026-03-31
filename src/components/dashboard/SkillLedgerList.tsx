import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ShieldCheck, Star, FileText, CheckCircle2 } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface SkillRow {
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

const skillRows: SkillRow[] = [
  { id: '1', name: 'Python', category: 'Technical', categoryType: 'Technical', level: 'Advanced', levelType: 'Advanced', evidence: 5, endorsements: 2, aiVerified: true, lastDemo: 'Feb 14' },
  { id: '2', name: 'SQL', category: 'Technical', categoryType: 'Technical', level: 'Advanced', levelType: 'Advanced', evidence: 4, endorsements: 2, aiVerified: true, lastDemo: 'Feb 10' },
  { id: '3', name: 'Problem Solving', category: 'Cognitive', categoryType: 'Cognitive', level: 'Advanced', levelType: 'Advanced', evidence: 6, endorsements: 1, aiVerified: true, lastDemo: 'Feb 18' },
  { id: '4', name: 'Machine Learning', category: 'Technical', categoryType: 'Technical', level: 'Intermediate', levelType: 'Intermediate', evidence: 3, endorsements: 1, aiVerified: true, lastDemo: 'Jan 30' },
  { id: '5', name: 'Communication', category: 'Soft Skill', categoryType: 'Soft Skill', level: 'Intermediate', levelType: 'Intermediate', evidence: 2, endorsements: 1, aiVerified: false, lastDemo: 'Jan 20' },
];

const getCategoryStyle = (category: string) => {
  const styles = {
    Technical: { bg: '#F1F5F9', text: '#475569' },
    Cognitive: { bg: '#F5F3FF', text: '#7C3AED' },
    "Soft Skill": { bg: '#ECFDF5', text: '#059669' }
  };
  return styles[category as keyof typeof styles] || { bg: '#F1F5F9', text: '#475569' };
};

const getLevelStyle = (level: string, type: string) => {
  if (type === 'Advanced') return { color: colors.accent.DEFAULT };
  if (type === 'Intermediate') return { color: '#3B82F6' };
  return { color: '#64748B' };
};

export const SkillLedgerList = () => {
  const renderItem = ({ item }: { item: SkillRow }) => {
    const catStyle = getCategoryStyle(item.categoryType);
    const levelColor = getLevelStyle(item.level, item.levelType);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.skillName}>{item.name}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.categoryText, { color: catStyle.text }]}>{item.category}</Text>
            </View>
          </View>
          <View style={styles.verificationContainer}>
            {item.aiVerified ? (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color="#059669" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : (
              <Text style={styles.pendingText}>Pending</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Level</Text>
            <Text style={[styles.footerValue, levelColor]}>{item.level}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Evidence</Text>
            <View style={styles.row}>
              <FileText size={12} color="#64748B" />
              <Text style={styles.footerValue}>{item.evidence} items</Text>
            </View>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Endorsed</Text>
            <View style={styles.row}>
              <Text style={styles.footerValue}>{item.endorsements}</Text>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Full Skill Ledger</Text>
        <View style={styles.integrityBadge}>
           <CheckCircle2 size={12} color="#059669" />
           <Text style={styles.integrityText}>Integrity Verified</Text>
        </View>
      </View>
      {skillRows.map((item) => (
        <React.Fragment key={item.id}>
          {renderItem({ item })}
        </React.Fragment>
      ))}
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
  },
  integrityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  verificationContainer: {
    alignItems: 'flex-end',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  }
});
