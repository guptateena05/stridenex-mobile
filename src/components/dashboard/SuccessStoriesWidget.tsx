import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Quote, 
  Briefcase, 
  Rocket, 
  Sparkles, 
  Award, 
  TrendingUp,
  X,
  ChevronDown,
  Pencil,
  Trash2
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStudentByEmail, getSuccessStories, createSuccessStory, updateSuccessStory, deleteSuccessStory } from '@/api/student.services';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_MARGIN = 12;

const categories = ["Placement", "Startup", "Internship", "Higher Studies", "Other"];
const statuses = ["Draft", "Published", "Archived"];

interface SuccessStoriesWidgetProps {
  collegeName?: string;
  collegeDetailsName?: string;
}

export const SuccessStoriesWidget: React.FC<SuccessStoriesWidgetProps> = ({ 
  collegeName, 
  collegeDetailsName 
}) => {
  const { userName, userFullName } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Modal & form state
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingStory, setEditingStory] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [category, setCategory] = useState("Placement");
  const [status, setStatus] = useState("Published");
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState("");
  const [testimonial, setTestimonial] = useState("");

  // Dropdown UI visibility states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  
  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await getSuccessStories();
      let fetchedStories: any[] = [];
      if (res) {
        if (Array.isArray(res)) {
          fetchedStories = res;
        } else if (res.message && Array.isArray(res.message.data)) {
          fetchedStories = res.message.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          fetchedStories = res.data.data;
        } else if (res.message && Array.isArray(res.message)) {
          fetchedStories = res.message;
        } else if (res.data && Array.isArray(res.data)) {
          fetchedStories = res.data;
        }
      }
      
      let filtered = fetchedStories.filter(s => s && s.testimonial);
      
      if (collegeName || collegeDetailsName) {
        const cName = (collegeName || "").toLowerCase().trim();
        const cdName = (collegeDetailsName || "").toLowerCase().trim();
        filtered = filtered.filter(story => {
          if (!story.college) return false;
          const storyColl = story.college.toLowerCase().trim();
          return (cName && storyColl === cName) || (cdName && storyColl === cdName);
        });
      }
      
      setStories(filtered);
    } catch (error) {
      console.error("Error loading success stories widget:", error);
    } finally {
      setLoading(false);
    }
  };

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
      console.error("Failed to fetch student profile in widget:", err);
    }
    return null;
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
        console.error("Failed to load student details in widget:", err);
      }
    };
    loadStudentData();
  }, [collegeName, collegeDetailsName, userName]);

  const isMyStory = (story: any): boolean => {
    if (!story || (!userName && !studentData && !userFullName)) return false;

    const clean = (str: any) => (typeof str === 'string' ? str.trim().toLowerCase() : '');

    const storyStudent = clean(story.student);
    const storyOwner = clean(story.owner);
    const storyEmail = clean(story.student_email || story.email);

    const authEmail = clean(userName);
    const authFullName = clean(userFullName);
    const profileId = clean(studentData?.name);
    const profileEmail = clean(studentData?.email_id);
    const profileFullName = clean(
      studentData?.full_name ||
      `${studentData?.first_name || ''} ${studentData?.last_name || ''}`.trim()
    );

    if (authEmail) {
      if (storyStudent === authEmail || storyOwner === authEmail || storyEmail === authEmail) {
        return true;
      }
      const userPrefix = authEmail.split('@')[0];
      if (userPrefix && storyStudent === userPrefix) {
        return true;
      }
    }

    if (profileId && (storyStudent === profileId || storyOwner === profileId)) {
      return true;
    }

    if (profileEmail && (storyStudent === profileEmail || storyOwner === profileEmail || storyEmail === profileEmail)) {
      return true;
    }

    if (authFullName && storyStudent && storyStudent === authFullName) {
      return true;
    }

    if (profileFullName && storyStudent && storyStudent === profileFullName) {
      return true;
    }

    return false;
  };

  const handleOpenCreate = () => {
    setEditingStory(null);
    setTitle("");
    setMetric("");
    setTestimonial("");
    setCategory("Placement");
    setStatus("Published");
    setCategoryDropdownOpen(false);
    setStatusDropdownOpen(false);
    setModalVisible(true);
  };

  const handleEditStory = (story: any) => {
    setEditingStory(story);
    setTitle(story.outcome_title || "");
    setMetric(story.outcome_metric || "");
    setTestimonial(story.testimonial || "");
    setCategory(story.outcome_category || "Placement");
    setStatus(story.status || "Published");
    setCategoryDropdownOpen(false);
    setStatusDropdownOpen(false);
    setModalVisible(true);
  };

  const handleDeleteStory = (story: any) => {
    const storyId = story.id || story.name;
    if (!storyId) return;

    Alert.alert(
      "Delete Success Story",
      `Are you sure you want to delete "${story.outcome_title || 'this story'}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(storyId);
              await deleteSuccessStory({ id: storyId });
              Alert.alert("Success", "Your success story has been deleted.");
              fetchStories();
            } catch (err: any) {
              console.error("Error deleting story:", err);
              const errorMsg = err?.response?.data?.message || err?.message || "Failed to delete success story.";
              Alert.alert("Delete Failed", errorMsg);
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
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
      if (editingStory) {
        const storyId = editingStory.id || editingStory.name;
        const payload = {
          id: storyId,
          name: storyId,
          story_id: storyId,
          student: editingStory.student || studentData?.name || userName,
          outcome_category: category,
          outcome_title: title.trim(),
          outcome_metric: metric.trim() || null,
          testimonial: testimonial.trim(),
          status: status
        };

        console.log("Updating Success Story payload (Widget):", payload);
        await updateSuccessStory(payload);
        Alert.alert("Success", "Your success story has been updated!");
      } else {
        let resolvedStudentId = studentData?.name;
        if (!resolvedStudentId && userName) {
          const freshProfile = await fetchStudentProfile(userName);
          resolvedStudentId = freshProfile?.name;
        }
        
        const studentId = resolvedStudentId || userName;
        if (!studentId) {
          Alert.alert("Error", "Could not resolve user details. Please verify your login session.");
          setSubmitting(false);
          return;
        }

        const payload = {
          student: studentId,
          outcome_category: category,
          outcome_title: title.trim(),
          outcome_metric: metric.trim() || null,
          testimonial: testimonial.trim(),
          status: status
        };

        await createSuccessStory(payload);
        Alert.alert("Success", "Your success story has been published!");
      }
      
      // Reset form
      setModalVisible(false);
      setEditingStory(null);
      setTitle("");
      setMetric("");
      setTestimonial("");
      setCategory("Placement");
      setStatus("Published");
      
      // Refresh list
      fetchStories();
    } catch (error: any) {
      console.error("Error submitting story:", error);
      const errorMsg = error?.response?.data?.message || error?.message || `Failed to ${editingStory ? "update" : "publish"} your success story.`;
      Alert.alert(editingStory ? "Update Failed" : "Submission Failed", errorMsg);
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
    const colors = ["#9333EA", "#2563EB", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
    const charCode = (story.student || "ST").charCodeAt(0);
    return { backgroundColor: colors[charCode % colors.length] };
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "placement": return Briefcase;
      case "internship": return Award;
      case "higher studies": return Rocket;
      case "startup":
      case "entrepreneurship": return TrendingUp;
      default: return Sparkles;
    }
  };

  const isCollege = !!(collegeName || collegeDetailsName);

  if (loading && stories.length === 0) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', height: 200 }]}>
        <ActivityIndicator size="small" color={colors.accent.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color={colors.accent.DEFAULT} />
            <Text style={styles.title} numberOfLines={1}>
              {isCollege ? "Our Students' Success Stories" : "StrideNex Success Stories"}
            </Text>
          </View>
          <Text style={styles.subtitle}>
            {isCollege ? "Real outcomes achieved by students from our institution" : "Real outcomes achieved by StrideNex students"}
          </Text>
        </View>
        {!isCollege && (
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={handleOpenCreate}
          >
            <Text style={styles.headerBtnText}>Share Story</Text>
          </TouchableOpacity>
        )}
      </View>

      {stories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Sparkles size={28} color="#CBD5E1" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No success stories shared yet.</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={CARD_WIDTH + CARD_MARGIN}
          decelerationRate="fast"
          snapToAlignment="start"
        >
          {stories.map((story, index) => {
            const Icon = getCategoryIcon(story.outcome_category);
            const displayName = getStudentDisplayName(story);
            const initials = getInitials(story);
            const avatarStyle = getAvatarStyle(story);
            const canManage = isMyStory(story);
            const storyId = story.id || story.name;
            
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
                style={[
                  styles.storyCard, 
                  { borderLeftWidth: 4, borderLeftColor: leftBarColor }
                ]}
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
                  <View style={styles.headerRightActions}>
                    <View style={[styles.successBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                      <Text style={[styles.successBadgeText, { color: badgeText }]}>{story.outcome_category}</Text>
                    </View>
                    {!isCollege && canManage && (
                      <View style={styles.cardActionsRow}>
                        <TouchableOpacity 
                          style={styles.cardActionBtn} 
                          onPress={() => handleEditStory(story)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Pencil size={11} color="#F97316" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.cardActionBtn} 
                          onPress={() => handleDeleteStory(story)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          disabled={deletingId === storyId}
                        >
                          {deletingId === storyId ? (
                            <ActivityIndicator size={10} color="#EF4444" />
                          ) : (
                            <Trash2 size={11} color="#EF4444" />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                {/* Testimonial Quote Box */}
                <View style={styles.quoteBox}>
                  <View style={styles.quoteIconWrapper}>
                    <Quote size={18} color="rgba(148, 163, 184, 0.2)" />
                  </View>
                  <Text style={styles.quoteText} numberOfLines={3}>"{story.testimonial}"</Text>
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
                  {story.outcome_metric ? (
                    <View style={styles.metricBadge}>
                      <Text style={styles.metricBadgeText}>{story.outcome_metric}</Text>
                    </View>
                  ) : null}
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      {/* Creation Dialog Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => {
          setCategoryDropdownOpen(false);
          setStatusDropdownOpen(false);
          Keyboard.dismiss();
        }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTitleBox}>
                    <View style={styles.modalHeaderIconBg}>
                      {editingStory ? <Pencil size={16} color="#FFF" /> : <Sparkles size={16} color="#FFF" />}
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>{editingStory ? "Edit Your Success" : "Share Your Success"}</Text>
                      <Text style={styles.modalSubtitle}>{editingStory ? "Update your story details" : "Inspire others with your story"}</Text>
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
                    <Text style={styles.submitBtnText}>{editingStory ? "Update Story" : "Publish Story"}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(241, 245, 249, 0.6)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  headerBtn: {
    backgroundColor: colors.accent.DEFAULT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginHorizontal: 16,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: CARD_MARGIN,
  },
  storyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
    justifyContent: 'space-between',
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  userCollege: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActionBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  successBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    minHeight: 60,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 0.8)',
    position: 'relative',
    overflow: 'hidden',
  },
  quoteIconWrapper: {
    position: 'absolute',
    top: 6,
    right: 8,
  },
  quoteText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 18,
    paddingRight: 24,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  achievementIconBg: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  achievementLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  metricBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metricBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalHeaderIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownHeaderText: {
    fontSize: 15,
    color: '#0F172A',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#334155',
  },
  dropdownItemTextSelected: {
    color: colors.accent.DEFAULT,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  submitBtn: {
    backgroundColor: colors.accent.DEFAULT,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
