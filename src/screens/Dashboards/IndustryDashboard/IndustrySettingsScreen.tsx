import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Clipboard, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Settings, 
  Mail, 
  Send, 
  Copy, 
  X,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { useIndustry } from '@/context/IndustryContext';

export const IndustrySettingsScreen = () => {
  const { industryData } = useIndustry();
  const [activeTemplate, setActiveTemplate] = useState<'email' | 'invite' | null>(null);
  const [copied, setCopied] = useState(false);

  const companyName = industryData?.company_name || "your company";

  const emailTemplate = {
    subject: `Opportunity: Internship with ${companyName}`,
    body: `Dear Student,

We've been impressed by your profile on Stridenex. Your skills and achievements align perfectly with our current initiatives.

We would love to discuss a potential partnership or internship opportunity with you.

Best regards,
Recruitment Team
${companyName}`
  };

  const inviteTemplate = `Hi there! 👋

${companyName} are currently looking for talented students to join our upcoming projects.

Check out our latest internship postings on Stridenex and apply today:
[Link to Stridenex Dashboard]

We look forward to seeing your application!

Best,
The ${companyName}`;

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert("Success", "Template copied to clipboard!");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.title}>Recruitment Settings</Text>
          <Text style={styles.subtitle}>Manage your Outreach templates and platform preferences.</Text>
        </Animated.View>

        {/* Action Cards */}
        <View style={styles.cardsRow}>
          <Animated.View entering={FadeInUp.delay(200)} style={styles.actionCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
              <Mail size={20} color="#F97316" />
            </View>
            <Text style={styles.cardTitle}>Professional Email</Text>
            <Text style={styles.cardDesc}>Generate a high-conversion follow-up email template personalized for your company outreach.</Text>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => setActiveTemplate('email')}
            >
              <Sparkles size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>Generate Email Template</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)} style={styles.actionCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Send size={20} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Student Invitation</Text>
            <Text style={styles.cardDesc}>Get a concise, friendly invitation template perfect for quick platform-based student invites.</Text>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]} 
              onPress={() => setActiveTemplate('invite')}
            >
              <Sparkles size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>Get Invitation Template</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Expanded Template View */}
        {activeTemplate && (
          <Animated.View 
            layout={Layout.springify()} 
            entering={FadeInDown} 
            style={styles.templateExpandedCard}
          >
            <View style={styles.templateHeader}>
              <View style={styles.templateHeaderLeft}>
                <Mail size={16} color="#64748B" />
                <Text style={styles.templateHeaderText}>
                  {activeTemplate === 'email' ? 'EMAIL TEMPLATE' : 'INVITATION TEMPLATE'}
                </Text>
              </View>
              <View style={styles.templateHeaderRight}>
                <TouchableOpacity 
                  style={styles.copyPill} 
                  onPress={() => handleCopy(activeTemplate === 'email' ? `${emailTemplate.subject}\n\n${emailTemplate.body}` : inviteTemplate)}
                >
                  <Copy size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.copyPillText}>{copied ? 'Copied!' : 'Copy to Clipboard'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTemplate(null)} style={styles.closeBtn}>
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.templateBody}>
              {activeTemplate === 'email' ? (
                <>
                  <Text style={styles.subjectLine}><Text style={styles.boldText}>Subject:</Text> {emailTemplate.subject}</Text>
                  <Text style={styles.bodyText}>{emailTemplate.body}</Text>
                </>
              ) : (
                <Text style={styles.bodyText}>{inviteTemplate}</Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* Info Banner */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.infoBanner}>
          <View style={styles.bannerIconBox}>
            <ShieldCheck size={28} color="#FFF" />
          </View>
          <View style={styles.bannerContent}>
            <View style={styles.bannerHeaderRow}>
              <Text style={styles.bannerTitle}>Automated Verification Enabled</Text>
              <View style={styles.secureBadge}>
                <Text style={styles.secureBadgeText}>SECURE OUTREACH</Text>
              </View>
            </View>
            <Text style={styles.bannerDesc}>
              Every template generated here follows Stridenex's quality guidelines. Your outreach is automatically verified to increase student response rates by up to 45%.
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { padding: 20 },

  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 4 },

  cardsRow: { gap: 16, marginBottom: 24 },
  actionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  cardDesc: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 20 },
  actionBtn: { backgroundColor: '#0F172A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  actionBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  templateExpandedCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  templateHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  templateHeaderText: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  templateHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copyPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  copyPillText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  closeBtn: { padding: 4 },
  
  templateBody: { padding: 24 },
  subjectLine: { fontSize: 14, color: '#334155', fontStyle: 'italic', marginBottom: 16 },
  boldText: { fontWeight: '700', fontStyle: 'normal' },
  bodyText: { fontSize: 13, color: '#334155', lineHeight: 22, fontWeight: '500' },

  infoBanner: { backgroundColor: '#0F172A', borderRadius: 20, padding: 24, flexDirection: 'row', gap: 16, marginTop: 10 },
  bannerIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  bannerContent: { flex: 1 },
  bannerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  secureBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  secureBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  bannerDesc: { fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 18 }
});
