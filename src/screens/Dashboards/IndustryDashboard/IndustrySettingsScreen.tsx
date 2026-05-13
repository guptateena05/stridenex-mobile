import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Settings, 
  Mail, 
  UserPlus, 
  Copy, 
  Save,
  CheckCircle2
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export const IndustrySettingsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Template States (Aligned with Web Portal)
  const [emailTemplate, setEmailTemplate] = useState(`Dear {{student_name}},

We are pleased to inform you that your application for the {{internship_title}} position at {{company_name}} has been shortlisted.

We would like to invite you for an interview. Please let us know your availability.

Best regards,
Recruitment Team
{{company_name}}`);

  const [inviteTemplate, setInviteTemplate] = useState(`Hello {{student_name}},

We have reviewed your profile on Stridenex and are impressed with your background. We would like to invite you to apply for the {{internship_title}} position at {{company_name}}.

Looking forward to your application!

Best regards,
{{company_name}}`);

  const handleCopy = (text: string, id: string) => {
    try {
      Clipboard.setString(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      Alert.alert("Error", "Clipboard access is not available.");
    }
  };

  const handleSaveTemplates = () => {
    setLoading(true);
    // Simulate API call to save templates
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Settings updated successfully");
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.headerBadge}>
              <Settings size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>CONFIGURATION</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Manage your email and invitation templates</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.headerLeft}>
                <Mail size={18} color={colors.purple[600]} />
                <Text style={styles.sectionTitle}>Email Template</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleCopy(emailTemplate, 'email')}
                style={styles.copyBtn}
              >
                {copiedId === 'email' ? (
                  <CheckCircle2 size={16} color="#10B981" />
                ) : (
                  <Copy size={16} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>Standard email for shortlisting candidates.</Text>
            
            <View style={styles.templateContainer}>
              <TextInput
                style={styles.templateInput}
                multiline
                value={emailTemplate}
                onChangeText={setEmailTemplate}
                placeholder="Enter email template..."
                placeholderTextColor="#94A3B8"
              />
              <View style={styles.variableBadgeRow}>
                <Text style={styles.variableLabel}>Use variables:</Text>
                {['{{student_name}}', '{{internship_title}}', '{{company_name}}'].map(v => (
                  <View key={v} style={styles.variableBadge}>
                    <Text style={styles.variableText}>{v}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.headerLeft}>
                <UserPlus size={18} color={colors.purple[600]} />
                <Text style={styles.sectionTitle}>Invitation Template</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleCopy(inviteTemplate, 'invite')}
                style={styles.copyBtn}
              >
                {copiedId === 'invite' ? (
                  <CheckCircle2 size={16} color="#10B981" />
                ) : (
                  <Copy size={16} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>Invitation message for talent discovery.</Text>
            
            <View style={styles.templateContainer}>
              <TextInput
                style={styles.templateInput}
                multiline
                value={inviteTemplate}
                onChangeText={setInviteTemplate}
                placeholder="Enter invitation template..."
                placeholderTextColor="#94A3B8"
              />
            </View>
          </Animated.View>

          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleSaveTemplates}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Save size={18} color="#FFF" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  
  header: { marginBottom: 20, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '900', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  scrollContent: { gap: 20 },
  section: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  sectionSubtitle: { fontSize: 11, color: '#94A3B8', marginBottom: 16, fontWeight: '600' },

  copyBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },

  templateContainer: { gap: 12 },
  templateInput: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, fontSize: 14, color: '#334155', minHeight: 160, textAlignVertical: 'top', borderWidth: 1, borderColor: '#F1F5F9', lineHeight: 22, fontFamily: typography.fontFamily.display },
  variableBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  variableLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', alignSelf: 'center', marginRight: 2 },
  variableBadge: { backgroundColor: 'rgba(147, 51, 234, 0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(147, 51, 234, 0.1)' },
  variableText: { fontSize: 9, color: colors.purple[600], fontWeight: '700' },

  saveBtn: { backgroundColor: colors.purple[600], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, shadowColor: colors.purple[600], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginTop: 10 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' }
});
