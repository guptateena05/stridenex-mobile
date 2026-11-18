import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ActivityIndicator,
  FlatList,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/context/AuthContext';
import {
  HelpCircle,
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
  Ticket,
  PlusCircle,
  ArrowLeft,
  RefreshCw,
  User,
  Shield,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react-native';
import {
  ticketService,
  TicketSummary,
  TicketDetail,
  TicketComment,
} from '@/api/ticket.services';

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
      'Tap the "Tour Guide" button in the quick cards at the top of this screen, or tap the manual "Tabs Guide" button on your main dashboard to walk through all features.',
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
    question: 'How do Mentors accept and coordinate mentorship slots?',
    answer:
      'Mentors can configure recurring available booking slots, review incoming student inquiries, accept session requests, and log post-session notes and feedback.',
    category: 'Platform & Features',
    roles: ['Mentor', 'mentor'],
  },
];

const BASE_DOMAIN = 'https://devstridenex.quantcloud.in';

interface MessagePart {
  type: 'text' | 'image';
  content?: string;
  src?: string;
}

const cleanHtmlText = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '') // remove all HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

const parseHtmlMessage = (rawHtml: string): MessagePart[] => {
  if (!rawHtml) return [];

  const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>/gi;
  const parts: MessagePart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(rawHtml)) !== null) {
    const textBefore = rawHtml.substring(lastIndex, match.index);
    const cleanedText = cleanHtmlText(textBefore);
    if (cleanedText) {
      parts.push({ type: 'text', content: cleanedText });
    }

    let src = match[1];
    if (
      src &&
      !src.startsWith('http://') &&
      !src.startsWith('https://') &&
      !src.startsWith('data:')
    ) {
      const cleanPath = src.startsWith('/') ? src : `/${src}`;
      src = `${BASE_DOMAIN}${cleanPath}`;
    }

    parts.push({ type: 'image', src });
    lastIndex = imgRegex.lastIndex;
  }

  if (lastIndex < rawHtml.length) {
    const textAfter = rawHtml.substring(lastIndex);
    const cleanedText = cleanHtmlText(textAfter);
    if (cleanedText) {
      parts.push({ type: 'text', content: cleanedText });
    }
  }

  if (parts.length === 0) {
    const cleaned = cleanHtmlText(rawHtml);
    if (cleaned) {
      parts.push({ type: 'text', content: cleaned });
    }
  }

  return parts;
};

interface RichChatMessageProps {
  message: string;
  isUser: boolean;
  onImagePress: (url: string) => void;
}

const RichChatMessage: React.FC<RichChatMessageProps> = ({
  message,
  isUser,
  onImagePress,
}) => {
  const parts = useMemo(() => parseHtmlMessage(message), [message]);

  if (parts.length === 0) {
    return (
      <Text
        style={[
          styles.chatMessageText,
          isUser ? styles.userMessageText : styles.agentMessageText,
        ]}
      >
        {message}
      </Text>
    );
  }

  return (
    <View style={{ width: '100%' }}>
      {parts.map((part, index) => {
        if (part.type === 'image' && part.src) {
          return (
            <TouchableOpacity
              key={`img-${index}`}
              onPress={() => onImagePress(part.src!)}
              activeOpacity={0.85}
              style={styles.chatImageWrap}
            >
              <Image
                source={{ uri: part.src }}
                style={styles.chatInlineImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          );
        }

        return (
          <Text
            key={`txt-${index}`}
            style={[
              styles.chatMessageText,
              isUser ? styles.userMessageText : styles.agentMessageText,
            ]}
          >
            {part.content}
          </Text>
        );
      })}
    </View>
  );
};

export const SupportScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { role } = useAuth();

  // Active top-level subtab: "faqs" | "raise-ticket" | "my-tickets"
  const [activeTab, setActiveTab] = useState<'faqs' | 'raise-ticket' | 'my-tickets'>('faqs');

  // FAQs State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Tickets List State
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Selected Ticket Detail State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketDetail, setTicketDetail] = useState<TicketDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Raise Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [ticketDescription, setTicketDescription] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const normalizedRole = useMemo(() => {
    return (role || 'student').toLowerCase();
  }, [role]);

  const roleAccentColor = useMemo(() => {
    switch (normalizedRole) {
      case 'college':
        return '#0284c7';
      case 'industry':
        return '#059669';
      case 'mentor':
        return '#7c3aed';
      default:
        return '#ea580c';
    }
  }, [normalizedRole]);

  // Fetch Tickets List
  const fetchMyTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res: any = await ticketService.getMyTickets();
      const list = res?.data?.tickets || res?.message?.data?.tickets || res?.message?.tickets || res?.tickets || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  // Fetch Single Ticket Detail
  const fetchTicketDetails = useCallback(async (ticketId: string) => {
    setLoadingDetail(true);
    try {
      const res: any = await ticketService.getTicketDetails(ticketId);
      const detail = res?.data || res?.message?.data || res?.message;
      if (detail && detail.ticket_id) {
        setTicketDetail(detail);
      } else {
        setTicketDetail(null);
      }
    } catch (err: any) {
      console.error('Error fetching ticket details:', err);
      Alert.alert('Error', 'Unable to load ticket conversation details.');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'my-tickets') {
      fetchMyTickets();
    }
  }, [activeTab, fetchMyTickets]);

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId, fetchTicketDetails]);

  // Launch Tour Handler
  const handleLaunchTour = () => {
    const eventName =
      normalizedRole === 'college'
        ? 'START_COLLEGE_TAB_TOUR'
        : normalizedRole === 'industry'
        ? 'START_INDUSTRY_TAB_TOUR'
        : normalizedRole === 'mentor'
        ? 'START_MENTOR_TAB_TOUR'
        : 'START_STUDENT_TAB_TOUR';

    // Navigate to the module dashboard overview screen
    if (normalizedRole === 'student') {
      navigation.navigate('DashboardMain', { screen: 'Overview' });
    } else if (normalizedRole === 'college') {
      navigation.navigate('CollegeOverview');
    } else if (normalizedRole === 'industry') {
      navigation.navigate('IndustryOverview');
    } else if (normalizedRole === 'mentor') {
      navigation.navigate('MentorOverview');
    }

    // Trigger the guided tour immediately upon landing on the overview
    setTimeout(() => {
      DeviceEventEmitter.emit(eventName);
    }, 400);
  };

  // Email Handler
  const handleEmail = () => {
    Linking.openURL('mailto:info@stridenex.ai').catch(() => {
      Alert.alert('Email', 'info@stridenex.ai');
    });
  };

  // Location Alert
  const handleLocationPress = () => {
    Alert.alert(
      'Headquarters',
      'StrideNex Technologies\nPune, Maharashtra, India\n\nWorking Hours:\nMon – Fri: 9:00 AM – 6:00 PM IST'
    );
  };

  // Handle Create Ticket
  const handleCreateTicket = async () => {
    if (!ticketSubject.trim()) {
      Alert.alert('Missing Subject', 'Please enter a ticket subject.');
      return;
    }
    if (!ticketDescription.trim()) {
      Alert.alert('Missing Description', 'Please describe your inquiry or issue.');
      return;
    }

    setSubmittingTicket(true);
    try {
      const res: any = await ticketService.createTicket({
        subject: ticketSubject.trim(),
        description: ticketDescription.trim(),
        priority: ticketPriority,
      });

      const newId =
        res?.data?.ticket_id ||
        res?.data?.id ||
        res?.message?.data?.ticket_id ||
        res?.message?.ticket_id;

      Alert.alert(
        'Ticket Created',
        newId
          ? `Support Ticket #${newId} has been created successfully. Our team will assist you shortly.`
          : 'Your support ticket has been created successfully.'
      );

      setTicketSubject('');
      setTicketDescription('');
      setTicketPriority('Medium');
      setActiveTab('my-tickets');
      fetchMyTickets();
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      Alert.alert('Submission Failed', err?.message || 'Could not create ticket. Please try again.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Handle Reply to Ticket
  const handleSendReply = async () => {
    if (!selectedTicketId || !replyMessage.trim()) return;

    setSubmittingReply(true);
    try {
      await ticketService.addTicketComment({
        ticket_id: selectedTicketId,
        message: replyMessage.trim(),
      });
      setReplyMessage('');
      await fetchTicketDetails(selectedTicketId);
    } catch (err: any) {
      console.error('Error posting reply:', err);
      Alert.alert('Error', err?.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Filtered FAQs
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

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'open') return { bg: '#dbeafe', text: '#1d4ed8' };
    if (s === 'replied') return { bg: '#f3e8ff', text: '#7e22ce' };
    if (s === 'resolved' || s === 'closed') return { bg: '#dcfce7', text: '#15803d' };
    return { bg: '#fef3c7', text: '#b45309' };
  };

  const getPriorityColor = (priority: string) => {
    const p = (priority || '').toLowerCase();
    if (p === 'urgent') return { bg: '#ffe4e6', text: '#be123c' };
    if (p === 'high') return { bg: '#ffedd5', text: '#c2410c' };
    if (p === 'low') return { bg: '#f1f5f9', text: '#475569' };
    return { bg: '#eff6ff', text: '#1d4ed8' };
  };

  return (
    <View style={styles.container}>
      {/* ─── TICKET CONVERSATION VIEW (FULL SCREEN OVERLAY) ─────────── */}
      {selectedTicketId ? (
        <View style={[styles.chatContainer, { paddingBottom: insets.bottom + 10 }]}>
          {/* Conversation Top Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedTicketId(null);
                setTicketDetail(null);
              }}
            >
              <ArrowLeft size={20} color="#0f172a" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <View style={styles.chatHeaderBadgeRow}>
                <Text style={styles.chatTicketId}>#{ticketDetail?.ticket_id || selectedTicketId}</Text>
                {ticketDetail && (
                  <View
                    style={[
                      styles.statusPillSmall,
                      { backgroundColor: getStatusColor(ticketDetail.status).bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillTextSmall,
                        { color: getStatusColor(ticketDetail.status).text },
                      ]}
                    >
                      {ticketDetail.status}
                    </Text>
                  </View>
                )}
                {ticketDetail && (
                  <View
                    style={[
                      styles.statusPillSmall,
                      { backgroundColor: getPriorityColor(ticketDetail.priority).bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillTextSmall,
                        { color: getPriorityColor(ticketDetail.priority).text },
                      ]}
                    >
                      {ticketDetail.priority}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.chatHeaderTitle} numberOfLines={1}>
                {ticketDetail?.subject || 'Ticket Details'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshIconBtn}
              onPress={() => fetchTicketDetails(selectedTicketId)}
              disabled={loadingDetail}
            >
              {loadingDetail ? (
                <ActivityIndicator size="small" color="#ea580c" />
              ) : (
                <RefreshCw size={18} color="#64748b" />
              )}
            </TouchableOpacity>
          </View>

          {/* Messages List */}
          <ScrollView
            style={styles.chatMessagesArea}
            contentContainerStyle={styles.chatMessagesContent}
            showsVerticalScrollIndicator={false}
          >
            {loadingDetail && !ticketDetail ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color="#ea580c" />
                <Text style={styles.loadingText}>Loading conversation...</Text>
              </View>
            ) : ticketDetail ? (
              <>
                {/* Original Description Card */}
                <View style={styles.originalDescCard}>
                  <View style={styles.descCardHeader}>
                    <Text style={styles.descCardTitle}>Initial Description</Text>
                    <Text style={styles.descCardDate}>{ticketDetail.created_at || 'Opened'}</Text>
                  </View>
                  <RichChatMessage
                    message={ticketDetail.description}
                    isUser={false}
                    onImagePress={setPreviewImageUrl}
                  />
                </View>

                {/* Conversation Comments */}
                {ticketDetail.comments && ticketDetail.comments.length > 0 ? (
                  ticketDetail.comments.map((comment: TicketComment, idx: number) => {
                    const isUser = comment.is_user;
                    return (
                      <View
                        key={comment.comment_id || idx}
                        style={[
                          styles.chatBubbleWrap,
                          isUser ? styles.chatBubbleRight : styles.chatBubbleLeft,
                        ]}
                      >
                        <View style={styles.chatMetaRow}>
                          {isUser ? (
                            <>
                              <User size={12} color="#ea580c" />
                              <Text style={styles.chatSender}>You</Text>
                            </>
                          ) : (
                            <>
                              <Shield size={12} color="#4f46e5" />
                              <Text style={[styles.chatSender, { color: '#4f46e5' }]}>
                                Support ({comment.comment_by || 'Agent'})
                              </Text>
                            </>
                          )}
                          <Text style={styles.chatTimestamp}>• {comment.created_at || ''}</Text>
                        </View>
                        <View
                          style={[
                            styles.chatBubble,
                            isUser ? styles.userBubble : styles.agentBubble,
                          ]}
                        >
                          <RichChatMessage
                            message={comment.message}
                            isUser={isUser}
                            onImagePress={setPreviewImageUrl}
                          />
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyCommentsCard}>
                    <Text style={styles.emptyCommentsText}>
                      No comments yet. Our support team will review your ticket and reply here.
                    </Text>
                  </View>
                )}
              </>
            ) : null}
          </ScrollView>

          {/* Reply Input Bar */}
          <View style={styles.chatInputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type your reply message..."
              placeholderTextColor="#94a3b8"
              value={replyMessage}
              onChangeText={setReplyMessage}
            />
            <TouchableOpacity
              style={[
                styles.chatSendBtn,
                { backgroundColor: replyMessage.trim() ? '#ea580c' : '#cbd5e1' },
              ]}
              onPress={handleSendReply}
              disabled={submittingReply || !replyMessage.trim()}
            >
              {submittingReply ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Send size={16} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* ─── MAIN SUPPORT SCREEN SCROLLVIEW ─────────────────────────── */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerTopRow}>
              <View style={[styles.headerIconWrap, { backgroundColor: `${roleAccentColor}15` }]}>
                <HelpCircle size={22} color={roleAccentColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: `${roleAccentColor}18` }]}>
                    <Text style={[styles.badgeText, { color: roleAccentColor }]}>SUPPORT DESK</Text>
                  </View>
                </View>
                <Text style={styles.headerTitle}>How can we assist you?</Text>
                <Text style={styles.headerSubtitle}>
                  Browse FAQs, launch guided tours, or manage support tickets.
                </Text>
              </View>
            </View>
          </View>

          {/* 3 Quick Cards in a Single Row: Interactive Tour, Email Us, Contact Location */}
          <View style={styles.quickActionsRow}>
            {/* Card 1: Tour Guide */}
            <TouchableOpacity
              style={styles.quickCard}
              onPress={handleLaunchTour}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: '#f3e8ff' }]}>
                <Compass size={18} color="#9333ea" />
              </View>
              <Text style={styles.quickTitle} numberOfLines={1}>
                Tour Guide
              </Text>
              <Text style={styles.quickSubtitle} numberOfLines={1}>
                Platform Tour
              </Text>
            </TouchableOpacity>

            {/* Card 2: Email Us */}
            <TouchableOpacity
              style={styles.quickCard}
              onPress={handleEmail}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: '#ecfdf5' }]}>
                <Mail size={18} color="#059669" />
              </View>
              <Text style={styles.quickTitle} numberOfLines={1}>
                Email Us
              </Text>
              <Text style={styles.quickSubtitle} numberOfLines={1}>
                info@stridenex.ai
              </Text>
            </TouchableOpacity>

            {/* Card 3: Contact Details (Pune, Maharashtra, India) */}
            <TouchableOpacity
              style={styles.quickCard}
              onPress={handleLocationPress}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: '#fff7ed' }]}>
                <MapPin size={18} color="#ea580c" />
              </View>
              <Text style={styles.quickTitle} numberOfLines={1}>
                Pune, India
              </Text>
              <Text style={styles.quickSubtitle} numberOfLines={1}>
                Headquarters
              </Text>
            </TouchableOpacity>
          </View>

          {/* Segmented Subtab Navigation Bar */}
          <View style={styles.subtabsContainer}>
            <TouchableOpacity
              style={[styles.subtabButton, activeTab === 'faqs' && styles.subtabActive]}
              onPress={() => setActiveTab('faqs')}
            >
              <HelpCircle size={14} color={activeTab === 'faqs' ? '#0f172a' : '#64748b'} />
              <Text style={[styles.subtabText, activeTab === 'faqs' && styles.subtabTextActive]}>
                FAQs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subtabButton, activeTab === 'raise-ticket' && styles.subtabActive]}
              onPress={() => setActiveTab('raise-ticket')}
            >
              <PlusCircle size={14} color={activeTab === 'raise-ticket' ? '#0f172a' : '#64748b'} />
              <Text style={[styles.subtabText, activeTab === 'raise-ticket' && styles.subtabTextActive]}>
                Raise Ticket
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subtabButton, activeTab === 'my-tickets' && styles.subtabActive]}
              onPress={() => setActiveTab('my-tickets')}
            >
              <Ticket size={14} color={activeTab === 'my-tickets' ? '#0f172a' : '#64748b'} />
              <Text style={[styles.subtabText, activeTab === 'my-tickets' && styles.subtabTextActive]}>
                My Tickets
              </Text>
              {tickets.length > 0 && (
                <View style={styles.ticketCountBadge}>
                  <Text style={styles.ticketCountText}>{tickets.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ─── SUBTAB 1: FAQS ───────────────────────────────────────── */}
          {activeTab === 'faqs' && (
            <View style={styles.tabContentArea}>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Search size={16} color="#64748b" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search questions or topics..."
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

              {/* Category Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
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
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && { color: '#ffffff', fontWeight: '700' },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* FAQs List */}
              <View style={styles.faqsList}>
                {filteredFaqs.length === 0 ? (
                  <View style={styles.emptyFaqCard}>
                    <HelpCircle size={32} color="#94a3b8" />
                    <Text style={styles.emptyFaqTitle}>No questions found</Text>
                    <Text style={styles.emptyFaqSubtitle}>
                      Try a different keyword or raise a support ticket.
                    </Text>
                  </View>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <View key={faq.id} style={styles.faqCard}>
                        <TouchableOpacity
                          style={styles.faqHeader}
                          onPress={() => toggleFaq(faq.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.faqQuestion}>{faq.question}</Text>
                          {isExpanded ? (
                            <ChevronUp size={18} color="#64748b" />
                          ) : (
                            <ChevronDown size={18} color="#64748b" />
                          )}
                        </TouchableOpacity>
                        {isExpanded && (
                          <View style={styles.faqAnswerContainer}>
                            <Text style={styles.faqAnswer}>{faq.answer}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          )}

          {/* ─── SUBTAB 2: RAISE TICKET ────────────────────────────────── */}
          {activeTab === 'raise-ticket' && (
            <View style={styles.ticketCard}>
              <View style={styles.ticketHeaderRow}>
                <PlusCircle size={20} color={roleAccentColor} />
                <Text style={styles.ticketTitle}>Create Support Ticket</Text>
              </View>
              <Text style={styles.ticketSubtitle}>
                Describe your inquiry or issue. Our support engineering team will assist you.
              </Text>

              {/* Subject */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Subject <Text style={{ color: '#ef4444' }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Unable to upload certificate or book slot"
                  placeholderTextColor="#94a3b8"
                  value={ticketSubject}
                  onChangeText={setTicketSubject}
                />
              </View>

              {/* Priority Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Priority Level</Text>
                <View style={styles.priorityRow}>
                  {(['Low', 'Medium', 'High', 'Urgent'] as const).map((p) => {
                    const isSelected = ticketPriority === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.priorityPill,
                          isSelected && { backgroundColor: roleAccentColor, borderColor: roleAccentColor },
                        ]}
                        onPress={() => setTicketPriority(p)}
                      >
                        <Text
                          style={[
                            styles.priorityPillText,
                            isSelected && { color: '#ffffff', fontWeight: '700' },
                          ]}
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Description <Text style={{ color: '#ef4444' }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Please provide details, error messages, or steps to reproduce..."
                  placeholderTextColor="#94a3b8"
                  value={ticketDescription}
                  onChangeText={setTicketDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: roleAccentColor }]}
                onPress={handleCreateTicket}
                disabled={submittingTicket}
                activeOpacity={0.8}
              >
                {submittingTicket ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Submit Ticket</Text>
                    <Send size={16} color="#ffffff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ─── SUBTAB 3: MY TICKETS LIST ─────────────────────────────── */}
          {activeTab === 'my-tickets' && (
            <View style={styles.tabContentArea}>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listSectionTitle}>Your Support Tickets</Text>
                <TouchableOpacity
                  style={styles.refreshListBtn}
                  onPress={fetchMyTickets}
                  disabled={loadingTickets}
                >
                  {loadingTickets ? (
                    <ActivityIndicator size="small" color="#ea580c" />
                  ) : (
                    <>
                      <RefreshCw size={13} color="#64748b" />
                      <Text style={styles.refreshListText}>Refresh</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {loadingTickets ? (
                <View style={styles.centerLoading}>
                  <ActivityIndicator size="large" color="#ea580c" />
                  <Text style={styles.loadingText}>Fetching your tickets...</Text>
                </View>
              ) : tickets.length === 0 ? (
                <View style={styles.emptyFaqCard}>
                  <Ticket size={36} color="#94a3b8" />
                  <Text style={styles.emptyFaqTitle}>No tickets found</Text>
                  <Text style={styles.emptyFaqSubtitle}>
                    You have not raised any support tickets yet.
                  </Text>
                  <TouchableOpacity
                    style={[styles.createTicketBtnSmall, { backgroundColor: roleAccentColor }]}
                    onPress={() => setActiveTab('raise-ticket')}
                  >
                    <PlusCircle size={14} color="#ffffff" />
                    <Text style={styles.createTicketBtnText}>Raise a Ticket</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.ticketsList}>
                  {tickets.map((t) => (
                    <TouchableOpacity
                      key={t.ticket_id}
                      style={styles.ticketItemCard}
                      onPress={() => setSelectedTicketId(t.ticket_id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.ticketItemTopRow}>
                        <Text style={styles.ticketItemCode}>#{t.ticket_id}</Text>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <View
                            style={[
                              styles.statusPillSmall,
                              { backgroundColor: getStatusColor(t.status).bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillTextSmall,
                                { color: getStatusColor(t.status).text },
                              ]}
                            >
                              {t.status}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusPillSmall,
                              { backgroundColor: getPriorityColor(t.priority).bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillTextSmall,
                                { color: getPriorityColor(t.priority).text },
                              ]}
                            >
                              {t.priority}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Text style={styles.ticketItemSubject} numberOfLines={2}>
                        {t.subject}
                      </Text>

                      <View style={styles.ticketItemBottomRow}>
                        <Text style={styles.ticketItemDate}>
                          Created: {t.creation || 'Recent'}
                        </Text>
                        <View style={styles.viewThreadRow}>
                          <MessageSquare size={13} color="#ea580c" />
                          <Text style={styles.viewThreadText}>View Thread</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Image Preview</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setPreviewImageUrl(null)}
            >
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalImageContainer}>
            {previewImageUrl ? (
              <Image
                source={{ uri: previewImageUrl }}
                style={styles.modalFullImage}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  headerCard: {
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  /* 3 Quick Cards in a Row */
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: spacing.md,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  quickIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  quickSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  /* Subtabs Bar */
  subtabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 3,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  subtabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  subtabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  subtabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  subtabTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  ticketCountBadge: {
    backgroundColor: '#ea580c',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  ticketCountText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  tabContentArea: {
    marginBottom: spacing.md,
  },
  /* Search Bar */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    marginLeft: 8,
    padding: 0,
  },
  clearText: {
    fontSize: 12,
    color: '#ea580c',
    fontWeight: '600',
  },
  /* Category Pills */
  categoryScroll: {
    gap: 6,
    paddingBottom: 10,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  /* FAQs List */
  faqsList: {
    gap: 8,
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
    fontWeight: '600',
    color: '#0f172a',
    marginRight: 8,
  },
  faqAnswerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  faqAnswer: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  emptyFaqCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyFaqTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 8,
  },
  emptyFaqSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  /* Raise Ticket Form */
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  ticketSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  /* Tickets List */
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  refreshListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  refreshListText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  ticketsList: {
    gap: 8,
  },
  ticketItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ticketItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ticketItemCode: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  statusPillSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  statusPillTextSmall: {
    fontSize: 9,
    fontWeight: '700',
  },
  ticketItemSubject: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 17,
    marginBottom: 8,
  },
  ticketItemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  ticketItemDate: {
    fontSize: 10,
    color: '#94a3b8',
  },
  viewThreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewThreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ea580c',
  },
  createTicketBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createTicketBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  /* Full Screen Ticket Chat Conversation View */
  chatContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 10,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  chatHeaderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatTicketId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  chatHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  refreshIconBtn: {
    padding: 6,
  },
  chatMessagesArea: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: 12,
    gap: 10,
  },
  centerLoading: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  originalDescCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 4,
  },
  descCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  descCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  descCardDate: {
    fontSize: 10,
    color: '#94a3b8',
  },
  descCardBody: {
    fontSize: 12,
    color: '#1e293b',
    lineHeight: 17,
  },
  chatBubbleWrap: {
    maxWidth: '85%',
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  chatMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  chatSender: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ea580c',
  },
  chatTimestamp: {
    fontSize: 9,
    color: '#94a3b8',
  },
  chatBubble: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: '#ea580c',
    borderBottomRightRadius: 2,
  },
  agentBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chatMessageText: {
    fontSize: 12,
    lineHeight: 17,
  },
  userMessageText: {
    color: '#ffffff',
  },
  agentMessageText: {
    color: '#0f172a',
  },
  emptyCommentsCard: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 10,
  },
  emptyCommentsText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  chatSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatImageWrap: {
    width: '100%',
    marginVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  chatInlineImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalFullImage: {
    width: '100%',
    height: '100%',
  },
});
