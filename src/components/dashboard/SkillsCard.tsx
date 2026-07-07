import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '@/theme/typography';
import { Code, Database, Cpu, BarChart3, Award } from 'lucide-react-native';
import { Svg, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

interface Skill {
  name: string;
  percentage: number;
}

interface SkillsCardProps {
  skills: Skill[];
}

interface SkillTheme {
  color: string;
  bgColor: string;
  icon: any;
}

export const SkillsCard = ({ skills }: SkillsCardProps) => {
  const getTheme = (name: string): SkillTheme => {
    const size = 20;
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('python')) {
      return { 
        color: '#3B82F6', 
        bgColor: '#EFF6FF', 
        icon: <Code size={size} color="#3B82F6" /> 
      };
    }
    if (lowerName.includes('sql')) {
      return { 
        color: '#10B981', 
        bgColor: '#ECFDF5', 
        icon: <Database size={size} color="#10B981" /> 
      };
    }
    if (lowerName.includes('ml')) {
      return { 
        color: '#8B5CF6', 
        bgColor: '#F5F3FF', 
        icon: <Cpu size={size} color="#8B5CF6" /> 
      };
    }
    if (lowerName.includes('viz')) {
      return { 
        color: '#F59E0B', 
        bgColor: '#FFFBEB', 
        icon: <BarChart3 size={size} color="#F59E0B" /> 
      };
    }
    return { 
      color: '#EA580C', 
      bgColor: '#FFF7ED', 
      icon: <Award size={size} color="#EA580C" /> 
    };
  };

  const getProficiency = (perc: number) => {
    if (perc > 80) return 'Expert';
    if (perc > 60) return 'Proficient';
    return 'Learning';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Core Expertise</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Verified Skills</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {skills.map((skill, index) => {
          const theme = getTheme(skill.name);
          const radius = 22;
          const strokeWidth = 4;
          const circumference = 2 * Math.PI * radius;
          const progress = (skill.percentage / 100) * circumference;

          return (
            <View key={index} style={styles.tile}>
              <View style={styles.tileHeader}>
                <View style={[styles.iconBox, { backgroundColor: theme.bgColor, borderColor: theme.bgColor }]}>
                  {theme.icon}
                </View>
                <View style={styles.radialBox}>
                  <Svg height="56" width="56" viewBox="0 0 56 56">
                    <Circle
                      cx="28"
                      cy="28"
                      r={radius}
                      stroke="#F1F5F9"
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    <Circle
                      cx="28"
                      cy="28"
                      r={radius}
                      stroke={theme.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      strokeLinecap="round"
                      fill="none"
                      transform="rotate(-90 28 28)"
                    />
                  </Svg>
                  <View style={styles.percOverlay}>
                    <Text style={styles.percText}>{skill.percentage}%</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.tileBody}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{getProficiency(skill.percentage)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  badge: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E11D48',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tile: {
    width: '47.1%',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  radialBox: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  percOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
  },
  tileBody: {
    marginTop: 4,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  levelBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
});
