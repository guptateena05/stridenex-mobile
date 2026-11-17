import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  DeviceEventEmitter,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { useAuth } from '@/context/AuthContext';
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  Compass,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Building2,
  ExternalLink,
} from 'lucide-react-native';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Account & Security' | 'Platform & Features' | 'Billing & Plans';
  roles?: string[];
}

const FAQS_DATA: FaqItem[] = [
  {
    id: 'gen-1',
    question: 'What is StrideNex and how does it empower my journey?',
    answer:
      'StrideNex is an intelligent career acceleration platform connecting Students, Colleges, Industry recruiters, and Mentors into a single unified ecosystem with verified skill ledgers, habit tracking, and campus recruitment.',
    category: 'General',
  },
  {
    id: 'gen-2',
    question: 'Can I access StrideNex on both Mobile and Web?',
    answer:
      'Yes! You can access StrideNex on your mobile app for instant notifications and updates, as well as on desktop browsers for deep analytics and management.',
    category: 'General',
  },
  {
    id: 'gen-3',
    question: 'How do I take the interactive platform tour again?',
    answer:
      'Tap the "Platform Tour" button under Quick Actions on this screen, or tap the manual "Tabs Guide" button on your main dashboard to walk through all features.',
    category: 'General',
  },
  {
    id: 'stu-1',
    question: 'How is my Employability Score calculated?',
    answer:
      'Your Employability Score is computed from verified skills in your Skill Ledger, daily consistency in the Habit Tracker, completed LMS courses, and your academic CGPA.',
    category: 'Platform & Features',
    roles: ['Student', 'student'],
  },
  {
    id: 'stu-2',
    question: 'Why are some dashboard tabs locked with a plan badge?',
    answer:
      'Advanced features like applying to verified Jobs, premium Internships, and 1:1 Mentors require an active student subscription plan. Visit the Plans tab to select and activate your plan.',
    category: 'Billing & Plans',
    roles: ['Student', 'student'],
  },
  {
    id: 'col-1',
    question: 'How does the College Placement Cell manage recruitment drives?',
    answer:
      'Colleges can create and invite verified industry recruiters to drives from the Campus Drives tab, establish eligibility thresholds, and track student opt-ins in real-time.',
    category: 'Platform & Features',
    roles: ['College', 'college'],
  },
  {
    id: 'ind-1',
    question: 'How does Industry post new internship or job openings?',
    answer:
      'Navigate to Internship Posts or Job Profiles to post requirements with tech proficiencies, stipend, location, and screening filters to receive pre-evaluated student profiles.',
    category: 'Platform & Features',
    roles: ['Industry', 'industry'],
  },
  {
    id: 'men-1',
    question: 'How do Mentors manage session schedule and payouts?',
    answer:
      'Mentors can configure availability slots in the Schedule tab and track verified completed session earnings in the Payouts & Commission tab on a regular bi-weekly cycle.',
    category: 'Platform & Features',
    roles: ['Mentor', 'mentor'],
  },
  {
    id: 'sec-1',
    question: 'How do I reset my password or update profile details?',
    answer:
      'You can update your profile in Settings or use the "Forgot Password" OTP flow on the login screen to securely reset your credentials.',
    category: 'Account & Security',
  },
  {
    id: 'sec-2',
    question: 'Is my personal and payment data secure?',
    answer:
      'Yes. All transactions and user records are secured with industry-standard 256-bit encryption, tokenized authentication, and PCI-DSS compliant payment gateways.',
    category: 'Account & Security',
  },
];

export const SupportScreen = () => {
  const insets = useSafeAreaInsets();
  const { role, userFullName, userName } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('gen-1');

  // Contact / Query form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedRole = (role as string)?.toLowerCase() || 'student';

  const roleAccentColor = useMemo(() => {
    switch (normalizedRole) {
      case 'college':
        return '#10b981';
      case 'industry':
        return colors.purple?.[600] || '#9333ea';
      case 'mentor':
        return '#4c1d95';
      case 'student':
      default:
        return colors.accent.DEFAULT;
    }
  }, [normalizedRole]);

  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((faq) => {
      if (faq.roles && !faq.roles.map((r) => r.toLowerCase()).includes(normalizedRole)) {
        return false;
      }
      if (activeCategory !== 'All' && faq.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [normalizedRole, activeCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleCall = () => {
    Linking.openURL('tel:+919225297767').catch(() => {
      Alert.alert('Phone', 'Call (+91) 9225297767');
    });
  };

  const handleEmail = () => {
    Linking.openURL('mailto:info@stridenex.ai').catch(() => {
      Alert.alert('Email', 'info@stridenex.ai');
    });
  };

  const handleLaunchTour = () => {
    const eventName =
      normalizedRole === 'college'
        ? 'START_COLLEGE_TAB_TOUR'
        : normalizedRole === 'industry'
        ? 'START_INDUSTRY_TAB_TOUR'
        : normalizedRole === 'mentor'
        ? 'START_MENTOR_TAB_TOUR'
        : 'START_STUDENT_TAB_TOUR';

    DeviceEventEmitter.emit(eventName);
    Alert.alert('Tour Started', 'Navigate to your dashboard to begin the step-by-step tour.');
  };

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      Alert.alert('Incomplete Form', 'Please enter a subject and your message details.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSubject('');
      setTicketMessage('');
      Alert.alert(
        'Message Sent',
        `Thank you! Your inquiry has been submitted. Our team will contact you at ${
          userName || 'your registered email'
        }.`
      );
    }, 600);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Compact Light Header ─────────────────────────────────────────── */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={[styles.headerIconWrap, { backgroundColor: `${roleAccentColor}15` }]}>
            <HelpCircle size={22} color={roleAccentColor} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: `${roleAccentColor}18` }]}>
                <Text style={[styles.badgeText, { color: roleAccentColor }]}>SUPPORT & HELP</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>How can we assist you?</Text>
            <Text style={styles.headerSubtitle}>
              Browse answers or connect with our support team.
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={16} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions, topics, features..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ─── Quick Action Cards ─────────────────────────────────── */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity style={styles.quickCard} onPress={handleCall} activeOpacity={0.8}>
          <View style={[styles.quickIconWrap, { backgroundColor: '#eff6ff' }]}>
            <Phone size={20} color="#2563eb" />
          </View>
          <Text style={styles.quickTitle}>Call Support</Text>
          <Text style={styles.quickSubtitle}>Direct hotline</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={handleEmail} activeOpacity={0.8}>
          <View style={[styles.quickIconWrap, { backgroundColor: '#ecfdf5' }]}>
            <Mail size={20} color="#059669" />
          </View>
          <Text style={styles.quickTitle}>Email Us</Text>
          <Text style={styles.quickSubtitle}>Within 24h</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={handleLaunchTour} activeOpacity={0.8}>
          <View style={[styles.quickIconWrap, { backgroundColor: '#fff7ed' }]}>
            <Compass size={20} color={roleAccentColor} />
          </View>
          <Text style={styles.quickTitle}>Tour Guide</Text>
          <Text style={styles.quickSubtitle}>Guided tour</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Category Tabs ───────────────────────────────────────── */}
      <View style={styles.categoryHeader}>
        <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {['All', 'Platform & Features', 'Billing & Plans', 'Account & Security'].map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isSelected && { backgroundColor: roleAccentColor, borderColor: roleAccentColor },
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryPillText, isSelected && { color: '#ffffff', fontWeight: '700' }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── FAQ Accordion List ──────────────────────────────────── */}
      <View style={styles.faqList}>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = expandedFaqId === faq.id;
            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {isOpen ? (
                    <ChevronUp size={18} color={roleAccentColor} />
                  ) : (
                    <ChevronDown size={18} color="#94a3b8" />
                  )}
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Search size={28} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No matching questions found</Text>
            <Text style={styles.emptySubtitle}>Try searching with different keywords.</Text>
          </View>
        )}
      </View>

      {/* ─── Contact Details Card ────────────────────────────────── */}
      <View style={styles.contactCard}>
        <View style={styles.contactHeaderRow}>
          <Building2 size={20} color="#1e293b" />
          <Text style={styles.contactCardTitle}>Official Contact Details</Text>
        </View>

        <TouchableOpacity style={styles.contactItem} onPress={handleCall} activeOpacity={0.7}>
          <View style={[styles.contactIconBox, { backgroundColor: '#fff7ed' }]}>
            <Phone size={18} color="#ea580c" />
          </View>
          <View style={styles.contactItemTextWrap}>
            <Text style={styles.contactLabel}>Phone Support</Text>
            <Text style={styles.contactValue}>(+91) 9225297767</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleEmail} activeOpacity={0.7}>
          <View style={[styles.contactIconBox, { backgroundColor: '#eff6ff' }]}>
            <Mail size={18} color="#2563eb" />
          </View>
          <View style={styles.contactItemTextWrap}>
            <Text style={styles.contactLabel}>Email Address</Text>
            <Text style={styles.contactValue}>info@stridenex.ai</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.contactItem}>
          <View style={[styles.contactIconBox, { backgroundColor: '#ecfdf5' }]}>
            <MapPin size={18} color="#059669" />
          </View>
          <View style={styles.contactItemTextWrap}>
            <Text style={styles.contactLabel}>Headquarters</Text>
            <Text style={styles.contactAddress}>
              B2/20, Saudamini Co-Operative Housing Society, Paud Road, Kothrud, Pune, (MH) India 411038
            </Text>
          </View>
        </View>

        <View style={styles.contactItem}>
          <View style={[styles.contactIconBox, { backgroundColor: '#f5f3ff' }]}>
            <Clock size={18} color="#7c3aed" />
          </View>
          <View style={styles.contactItemTextWrap}>
            <Text style={styles.contactLabel}>Operating Hours</Text>
            <Text style={styles.contactValue}>Monday – Friday: 9:00 AM – 6:00 PM IST</Text>
          </View>
        </View>
      </View>

      {/* ─── Send Us a Message Form ──────────────────────────────── */}
      <View style={styles.ticketCard}>
        <View style={styles.ticketHeaderRow}>
          <MessageSquare size={20} color="#fb923c" />
          <Text style={styles.ticketTitle}>Send Us a Message</Text>
        </View>
        <Text style={styles.ticketSubtitle}>
          Have a question or facing an issue? Send us your message and our team will get back to you shortly.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Brief summary of your question..."
            placeholderTextColor="#64748b"
            value={ticketSubject}
            onChangeText={setTicketSubject}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe what you need assistance with..."
            placeholderTextColor="#64748b"
            value={ticketMessage}
            onChangeText={setTicketMessage}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: roleAccentColor }]}
          onPress={handleSubmitTicket}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}
          </Text>
          <Send size={16} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: spacing.md,
  },
  headerCard: {
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: typography.fontFamily.display,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    paddingHorizontal: 8,
  },
  clearText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: spacing.lg,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  quickSubtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  categoryHeader: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
    fontFamily: typography.fontFamily.display,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  faqList: {
    gap: 10,
    marginBottom: spacing.lg,
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    paddingRight: 8,
  },
  faqBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  faqAnswer: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  contactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  contactCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  contactIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactItemTextWrap: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 1,
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  contactAddress: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  ticketCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  ticketSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 14,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: '#ffffff',
    fontSize: 13,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
