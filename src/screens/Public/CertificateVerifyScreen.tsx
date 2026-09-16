import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CheckCircle, Award, Calendar, User, ShieldCheck, Cpu, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { colors } from '@/theme/colors';

interface Skill {
  name: string;
  student: string;
  skill: string;
  skill_level: string;
  event_type: string;
}

interface CertificateData {
  certificate: {
    name: string;
    sr_no: string;
    student_name: string;
    assessment_name: string;
    issued_date: string;
  };
  student: {
    name: string;
    full_name: string;
    email: string | null;
    mobile_no: string | null;
    enabled: string | null;
  };
  skills: Skill[];
  skill_count: number;
}

export default function CertificateVerifyScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No certificate ID provided.');
      setLoading(false);
      return;
    }

    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const url = `https://devstridenex.quantcloud.in/api/method/stridenex_app.api_stridenex_app.student.masters.get_student_certificate_info?sr_no=${id}`;
        
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!res.ok) {
          throw new Error('Failed to verify certificate.');
        }

        const json = await res.json();
        if (json.message?.success && json.message?.data) {
          setData(json.message.data);
        } else if (json.data?.success && json.data?.data) {
           setData(json.data.data);
        } else {
          throw new Error('Certificate not found or invalid.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while verifying the certificate.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingIconContainer}>
          <ShieldCheck size={48} color={colors.primary.DEFAULT} />
        </View>
        <Text style={styles.loadingText}>Verifying Certificate...</Text>
        <Text style={styles.subText}>Securely checking records on StrideNEX</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() ? navigation.goBack() : null}>
            <ArrowLeft size={24} color="#64748B" />
        </TouchableOpacity>
        <View style={styles.errorCard}>
          <View style={styles.errorIconContainer}>
            <AlertCircle size={48} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Verification Failed</Text>
          <Text style={styles.errorText}>{error || 'This certificate could not be found in our system.'}</Text>
          <Text style={styles.errorId}>Certificate ID: <Text style={styles.errorIdBold}>{id}</Text></Text>
        </View>
      </View>
    );
  }

  const { certificate, student, skills } = data;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backButtonWhite} onPress={() => navigation.canGoBack() ? navigation.goBack() : null}>
              <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.checkContainer}>
            <CheckCircle size={32} color="#22C55E" />
          </View>
          <Text style={styles.verifiedText}>Verified Credential</Text>
          <Text style={styles.brandText}>STRIDENEX OFFICIAL</Text>

          <Text style={styles.studentName}>{student.full_name || certificate.student_name}</Text>
          <View style={styles.userRow}>
            <User size={14} color="#E9D5FF" />
            <Text style={styles.userIdText}>{student.name}</Text>
          </View>

          <View style={styles.achievementCard}>
            <View style={styles.achievementHeader}>
              <Award size={14} color="#E9D5FF" />
              <Text style={styles.achievementHeaderText}>ACHIEVEMENT</Text>
            </View>
            <Text style={styles.assessmentName}>{certificate.assessment_name}</Text>
            <View style={styles.dateRow}>
              <Calendar size={14} color="#E9D5FF" />
              <Text style={styles.dateText}>
                Issued {new Date(certificate.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.skillsSection}>
          <View style={styles.skillsHeader}>
            <View style={styles.skillsTitleRow}>
              <Cpu size={18} color="#A855F7" />
              <Text style={styles.skillsTitle}>Skills Validated</Text>
            </View>
            <View style={styles.skillsBadge}>
              <Text style={styles.skillsBadgeText}>{skills.length}</Text>
            </View>
          </View>

          {skills && skills.length > 0 ? (
            <View style={styles.skillsList}>
              {skills.map((s, idx) => (
                <View key={idx} style={styles.skillItem}>
                  <View style={styles.skillItemLeft}>
                    <View style={styles.skillIconContainer}>
                      <CheckCircle size={14} color="#EA580C" />
                    </View>
                    <View style={styles.skillTextContainer}>
                      <Text style={styles.skillName} numberOfLines={1}>{s.skill}</Text>
                      <View style={styles.skillLevelRow}>
                        <BookOpen size={10} color="#94A3B8" />
                        <Text style={styles.skillLevel}>{s.skill_level}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.eventTypeBadge}>
                    <Text style={styles.eventTypeText}>{s.event_type.split(' ')[0]}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noSkillsContainer}>
              <Text style={styles.noSkillsText}>No skills recorded.</Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
             <Text style={styles.footerText}>CERTIFICATE ID: <Text style={styles.footerId}>{certificate.sr_no}</Text></Text>
             <Text style={styles.footerDivider}>|</Text>
             <Text style={styles.footerText}>Powered by StrideNEX</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#64748B',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backButtonWhite: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 15,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#FEF2F2',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
  },
  errorId: {
    fontSize: 14,
    color: '#94A3B8',
  },
  errorIdBold: {
    fontWeight: '600',
    color: '#475569',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: '#7E22CE', // Purple base
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  checkContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  verifiedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E9D5FF',
    letterSpacing: 2,
    marginBottom: 32,
  },
  studentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  userIdText: {
    color: '#E9D5FF',
    fontSize: 14,
    marginLeft: 6,
  },
  achievementCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementHeaderText: {
    color: '#E9D5FF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  assessmentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#E9D5FF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  skillsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  skillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  skillsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
  },
  skillsBadge: {
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  skillsBadgeText: {
    color: '#9333EA',
    fontWeight: 'bold',
    fontSize: 14,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skillItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  skillItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skillIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  skillTextContainer: {
    flex: 1,
  },
  skillName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  skillLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillLevel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 4,
  },
  eventTypeBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  eventTypeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noSkillsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noSkillsText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  footerId: {
    color: '#64748B',
  },
  footerDivider: {
    fontSize: 10,
    color: '#E2E8F0',
    marginHorizontal: 12,
  },
});
