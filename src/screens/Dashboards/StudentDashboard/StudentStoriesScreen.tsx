import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Quote, 
  Briefcase, 
  Rocket, 
  Sparkles, 
  ChevronRight, 
  Award, 
  TrendingUp,
  History,
  X,
  ChevronDown
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { getStudentByEmail, getSuccessStories, createSuccessStory } from '@/api/student.services';

const categories = ["Placement", "Startup", "Internship", "Higher Studies", "Other"];
const statuses = ["Draft", "Published", "Archived"];

export const StudentStoriesScreen = () => {
  const { userName } = useAuth();
  
  const [storiesList, setStoriesList] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  
  // Modal & form state
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState("Placement");
  const [status, setStatus] = useState("Published");
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState("");
  const [testimonial, setTestimonial] = useState("");

  // Dropdown UI visibility states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const fetchStudentProfile = async (email: string) => {
    try {
      const res = await getStudentByEmail(email);
      const data = res?.data || res?.message?.data || res?.message;
      if (data && typeof data === 'object') {
        setStudentData(data);
        await AsyncStorage.setItem(`studentDetails_${email}`, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch student profile:", err);
    }
    return null;
  };

  const fetchStories = async (showLoading = true) => {
    if (showLoading) setLoadingStories(true);
    try {
      const res = await getSuccessStories();
      const fetchedStories = res?.data || res?.message?.data || res?.message || [];
      setStoriesList(Array.isArray(fetchedStories) ? fetchedStories : []);
    } catch (error) {
      console.error("Error fetching stories:", error);
      Alert.alert("Error", "Failed to load success stories.");
    } finally {
      setLoadingStories(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStories();
    
    const loadStudentData = async () => {
      if (!userName) return;
      try {
        const cached = await AsyncStorage.getItem(`studentDetails_${userName}`);
        if (cached) {
          setStudentData(JSON.parse(cached));
        }
        await fetchStudentProfile(userName);
      } catch (err) {
        console.error("Failed to load student details on stories screen mount:", err);
      }
    };
    loadStudentData();
  }, [userName]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStories(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Outcome Title is required.");
      return;
    }
    if (!testimonial.trim()) {
      Alert.alert("Validation Error", "Testimonial is required.");
      return;
    }

    setSubmitting(true);
    
    try {
      let resolvedStudentId = studentData?.name;
      if (!resolvedStudentId && userName) {
        const freshProfile = await fetchStudentProfile(userName);
        resolvedStudentId = freshProfile?.name;
      }
      
      const studentId = resolvedStudentId || userName;
      if (!studentId) {
        Alert.alert("Error", "Could not resolve student details. Please verify your login session.");
        setSubmitting(false);
        return;
      }

      const payload = {
        student: studentId,
        outcome_category: category,
        outcome_title: title,
        outcome_metric: metric || null,
        testimonial: testimonial,
        status: status
      };

      console.log("Submitting Success Story payload:", payload);
      const res = await createSuccessStory(payload);
      console.log("Success Story creation response:", res);

      Alert.alert("Success", "Your success story has been published!");
      
      // Reset form
      setModalVisible(false);
      setTitle("");
      setMetric("");
      setTestimonial("");
      setCategory("Placement");
      setStatus("Published");
      
      // Refresh list
      fetchStories(false);
    } catch (err: any) {
      console.error("Error creating story:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to submit success story.";
      Alert.alert("Submission Failed", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStudentDisplayName = (story: any) => {
    if (!story.student) return "StrideNex Student";
    if (story.student.includes("@")) {
      const part = story.student.split("@")[0];
      return part
        .split(".")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return story.student;
  };

  const getInitials = (story: any) => {
    if (story.avatar_initials) return story.avatar_initials;
    const name = getStudentDisplayName(story);
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarStyle = (story: any) => {
    if (story.avatar_color && story.avatar_color.startsWith("#")) {
      return { backgroundColor: story.avatar_color };
    }
    const colorsList = ["#9333EA", "#2563EB", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
    const charCode = (story.student || "ST").charCodeAt(0);
    return { backgroundColor: colorsList[charCode % colorsList.length] };
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "placement":
        return Briefcase;
      case "internship":
        return Award;
      case "higher studies":
        return Rocket;
      case "startup":
      case "entrepreneurship":
        return TrendingUp;
      default:
        return Sparkles;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent.DEFAULT]} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.headerBadge}>
                <History size={10} color={colors.accent.DEFAULT} />
                <Text style={styles.headerBadgeText}>SUCCESS STORIES</Text>
              </View>
              <Text style={styles.title}>Stories</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              style={styles.headerBtn}
              activeOpacity={0.8}
            >
              <Sparkles size={12} color="#FFF" />
              <Text style={styles.headerBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Real outcomes from StrideNex students</Text>
        </Animated.View>

        {/* Stories Horizontal Carousel */}
        {loadingStories ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          </View>
        ) : storiesList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Sparkles size={40} color="#CBD5E1" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No success stories published yet.</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Be the first to share!</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {storiesList.map((story, index) => {
              const Icon = getCategoryIcon(story.outcome_category);
              const displayName = getStudentDisplayName(story);
              const initials = getInitials(story);
              const avatarStyle = getAvatarStyle(story);
              
              let leftBarColor = '#EC4899';
              let badgeBg = 'rgba(236, 72, 153, 0.06)';
              let badgeText = '#EC4899';
              let badgeBorder = 'rgba(236, 72, 153, 0.1)';
              let iconBg = 'rgba(236, 72, 153, 0.08)';
              let iconColor = '#EC4899';
              
              if (story.outcome_category?.toLowerCase() === 'placement') {
                leftBarColor = '#F97316';
                badgeBg = 'rgba(249, 115, 22, 0.06)';
                badgeText = '#F97316';
                badgeBorder = 'rgba(249, 115, 22, 0.1)';
                iconBg = 'rgba(249, 115, 22, 0.08)';
                iconColor = '#F97316';
              } else if (story.outcome_category?.toLowerCase() === 'internship') {
                leftBarColor = '#10B981';
                badgeBg = 'rgba(16, 185, 129, 0.06)';
                badgeText = '#10B981';
                badgeBorder = 'rgba(16, 185, 129, 0.1)';
                iconBg = 'rgba(16, 185, 129, 0.08)';
                iconColor = '#10B981';
              } else if (story.outcome_category?.toLowerCase() === 'startup') {
                leftBarColor = '#8B5CF6';
                badgeBg = 'rgba(139, 92, 246, 0.06)';
                badgeText = '#8B5CF6';
                badgeBorder = 'rgba(139, 92, 246, 0.1)';
                iconBg = 'rgba(139, 92, 246, 0.08)';
                iconColor = '#8B5CF6';
              } else if (story.outcome_category?.toLowerCase() === 'higher studies') {
                leftBarColor = '#3B82F6';
                badgeBg = 'rgba(59, 130, 246, 0.06)';
                badgeText = '#3B82F6';
                badgeBorder = 'rgba(59, 130, 246, 0.1)';
                iconBg = 'rgba(59, 130, 246, 0.08)';
                iconColor = '#3B82F6';
              }

              return (
                <Animated.View 
                  key={story.id || index.toString()} 
                  entering={FadeInUp.delay(100 + index * 50)}
                  style={[styles.storyCard, { borderLeftWidth: 4, borderLeftColor: leftBarColor }]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                      <View style={[styles.avatar, avatarStyle]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                      </View>
                      <View style={styles.userMeta}>
                        <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                        <Text style={styles.userCollege} numberOfLines={1}>{story.college || "StrideNex Student"}</Text>
                      </View>
                    </View>
                    <View style={[styles.successBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                      <Text style={[styles.successBadgeText, { color: badgeText }]}>{story.outcome_category}</Text>
                    </View>
                  </View>

                  {/* Testimonial Quote Box */}
                  <View style={styles.quoteBox}>
                    <View style={styles.quoteIconWrapper}>
                      <Quote size={20} color="rgba(148, 163, 184, 0.12)" />
                    </View>
                    <Text style={styles.quoteText}>"{story.testimonial}"</Text>
                  </View>

                  {/* Achievement Row */}
                  <View style={styles.achievementRow}>
                    <View style={styles.achievementLeft}>
                      <View style={[styles.achievementIconBg, { backgroundColor: iconBg }]}>
                        <Icon size={12} color={iconColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.achievementLabel}>ACHIEVEMENT</Text>
                        <Text style={styles.achievementTitle} numberOfLines={1}>{story.outcome_title}</Text>
                      </View>
                    </View>
                    {story.outcome_metric && (
                      <View style={styles.metricBadge}>
                        <Text style={styles.metricBadgeText}>{story.outcome_metric}</Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* CTA Banner */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.ctaWrapper}>
          <View style={[styles.ctaBanner, { backgroundColor: '#FFF7ED' }]}>
            <Text style={styles.ctaTitle}>Your Success Story Starts Today</Text>
            <Text style={styles.ctaSubtitle}>Join 10,000+ students building their future on StrideNex</Text>
            
            <TouchableOpacity style={styles.startPathButton} activeOpacity={0.8}>
              <Text style={styles.startPathButtonText}>Start Your Path</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllText}>Share Your Story</Text>
              <ChevronRight size={14} color={colors.accent.DEFAULT} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Creation Dialog Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <View style={styles.modalHeaderIconBg}>
                  <Sparkles size={16} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Share Your Success</Text>
                  <Text style={styles.modalSubtitle}>Inspire others with your story</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Modal Form */}
            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
              
              {/* Category Dropdown */}
              <Text style={styles.label}>Outcome Category</Text>
              <View style={[styles.dropdownContainer, { zIndex: 100 }]}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() => {
                    setCategoryDropdownOpen(!categoryDropdownOpen);
                    setStatusDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownHeaderText}>{category}</Text>
                  <ChevronDown size={16} color="#64748B" />
                </TouchableOpacity>
                
                {categoryDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setCategory(cat);
                          setCategoryDropdownOpen(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          category === cat && styles.dropdownItemTextSelected
                        ]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Status Dropdown */}
              <Text style={styles.label}>Status</Text>
              <View style={[styles.dropdownContainer, { zIndex: 90 }]}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() => {
                    setStatusDropdownOpen(!statusDropdownOpen);
                    setCategoryDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownHeaderText}>{status}</Text>
                  <ChevronDown size={16} color="#64748B" />
                </TouchableOpacity>
                
                {statusDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {statuses.map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setStatus(st);
                          setStatusDropdownOpen(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          status === st && styles.dropdownItemTextSelected
                        ]}>{st}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Outcome Title Input */}
              <Text style={styles.label}>Outcome Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. SDE @ Google, ML Engineer @ Microsoft"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />

              {/* Outcome Metric Input */}
              <Text style={styles.label}>Outcome Metric / Package (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. ₹42 LPA, ₹12 LPA"
                placeholderTextColor="#94A3B8"
                value={metric}
                onChangeText={setMetric}
              />

              {/* Testimonial Quote Input */}
              <Text style={styles.label}>Testimonial</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your experience and how StrideNex helped you..."
                placeholderTextColor="#94A3B8"
                multiline={true}
                numberOfLines={4}
                value={testimonial}
                onChangeText={setTestimonial}
              />

              {/* Form Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.submitBtn]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Publish Story</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 110 },
  header: {
    marginBottom: 20,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  headerBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.accent.DEFAULT,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent.DEFAULT,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  centered: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 32,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: colors.accent.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: colors.accent.DEFAULT,
    fontWeight: '700',
    fontSize: 13,
  },
  storyCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 14, 
    borderWidth: 1.5, 
    borderColor: '#F1F5F9', 
    shadowColor: '#64748B', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 2 
  },
  listContainer: { gap: 14, marginBottom: 32 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  userMeta: { flex: 1 },
  userName: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 1 },
  userCollege: { fontSize: 10, fontWeight: '500', color: '#94A3B8' },
  successBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  successBadgeText: { fontSize: 8, fontWeight: '700' },
  
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  achievementIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    lineHeight: 8,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 1,
    lineHeight: 12,
  },
  metricBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metricBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  quoteBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    position: 'relative',
    minHeight: 46,
    justifyContent: 'center',
  },
  quoteIconWrapper: {
    position: 'absolute',
    right: 6,
    top: 4,
    opacity: 0.8,
  },
  quoteText: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 15,
    fontWeight: '500',
    paddingRight: 20,
  },
  
  ctaWrapper: { overflow: 'hidden', borderRadius: 24, borderWidth: 1.5, borderColor: '#FFEDD5', marginTop: 12 },
  ctaBanner: { padding: 24, alignItems: 'center' },
  ctaTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
  ctaSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 20, textAlign: 'center', paddingHorizontal: 16 },
  startPathButton: { width: '100%', backgroundColor: colors.accent.DEFAULT, paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: colors.accent.DEFAULT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, marginBottom: 12 },
  startPathButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  viewAllButton: { width: '100%', flexDirection: 'row', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#FDBA74', alignItems: 'center', gap: 6 },
  viewAllText: { color: colors.accent.DEFAULT, fontSize: 14, fontWeight: '800' },

  footerSpacer: { height: 40 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalHeaderIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    paddingBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.accent.DEFAULT,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Dropdown styles
  dropdownContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownHeaderText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 4,
    paddingVertical: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: colors.accent.DEFAULT,
    fontWeight: '700',
  },
});
