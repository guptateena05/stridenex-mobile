import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, MessageSquare, Heart, Search, ArrowLeft, Folder, Tag, Plus, Send, X, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCommunities, joinCommunity, leaveCommunity, getPosts, getPostDetail, postComment, createPost, createCategory, createTag, getCommunityDetail } from '@/api/api.services';
import * as DocumentPicker from '@react-native-documents/picker';

const formatChannelNameStr = (name: string): string => {
  if (!name) return "";
  return name.split(/[._-]/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

const getFallbackIcon = (name: string, type: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("code") || lower.includes("python") || lower.includes("dsa") || lower.includes("dev")) return "💻";
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui") || lower.includes("art")) return "🎨";
  if (lower.includes("startup") || lower.includes("founder") || lower.includes("entrepreneur")) return "🚀";
  if (lower.includes("research") || lower.includes("ml") || lower.includes("ai")) return "🧠";
  if (lower.includes("placement") || lower.includes("job") || lower.includes("career")) return "💼";
  if (type === "Private") return "🔒";
  return "🌐";
};

export const StudentCommunityScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [joinedChannels, setJoinedChannels] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);

  // Tabs
  const [activeSubTab, setActiveSubTab] = useState<"categories" | "discussions">("categories");
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  // Post/Thread state
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [postDetails, setPostDetails] = useState<any>(null);
  const [repliesLoading, setRepliesLoading] = useState<boolean>(false);

  // Modals
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);

  // Form Data
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newTagTitle, setNewTagTitle] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [replyText, setReplyText] = useState("");

  const [studentEmail, setStudentEmail] = useState("");

  useEffect(() => {
    navigation?.setOptions({ headerShown: !selectedChannel });
  }, [selectedChannel, navigation]);

  useEffect(() => {
    const fetchEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail") || await AsyncStorage.getItem("currentUser") || "";
      setStudentEmail(email);
    };
    fetchEmail();
  }, []);

  const loadCommunities = async (showIndicator = true) => {
    if (showIndicator) setLoading(true);
    try {
      const email = await AsyncStorage.getItem("userEmail") || await AsyncStorage.getItem("currentUser") || await AsyncStorage.getItem("userName") || "";
      const res = await getCommunities({ user: email });
      const list = res?.message?.data || res?.data?.data || res?.data || res?.message || [];
      if (Array.isArray(list)) {
        const mapped = list.map((c: any) => ({
          ...c,
          id: c.name,
          prettyName: formatChannelNameStr(c.community_name || c.name),
          icon: getFallbackIcon(c.community_name || c.name, c.community_type),
          category: c.community_type || "Public",
        }));
        setCommunities(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCommunities(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const handleBackPress = () => {
      if (selectedPost) {
        setSelectedPost(null);
        return true;
      }
      if (selectedCategory) {
        setSelectedCategory(null);
        return true;
      }
      if (selectedChannel) {
        setSelectedChannel(null);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [selectedPost, selectedCategory, selectedChannel]);

  const [channelDetailsLoading, setChannelDetailsLoading] = useState(false);

  const handleJoinChannel = async (channelId: string) => {
    const commObj = communities.find(c => c.id === channelId);
    const isMember = commObj?.action === "leave" || joinedChannels.includes(channelId) || commObj?.is_member === 1;

    try {
      if (!isMember) {
        await joinCommunity({ community: channelId, student: studentEmail });
        setJoinedChannels(prev => [...prev, channelId]);
        loadCommunities(false);
      }
      
      setChannelDetailsLoading(true);
      const detailRes = await getCommunityDetail({ community: channelId });
      const channelDetails = detailRes?.message?.data || detailRes?.data || null;

      if (channelDetails) {
        setSelectedChannel({
          ...commObj,
          ...channelDetails,
          prettyName: formatChannelNameStr(channelDetails.community_name || channelDetails.name),
        });
      } else {
        setSelectedChannel(commObj);
      }
    } catch (err) {
      Alert.alert("Error", "Could not process action");
    } finally {
      setChannelDetailsLoading(false);
    }
  };

  const handleLeaveChannel = async () => {
    if (!selectedChannel) return;
    try {
      await leaveCommunity({ community: selectedChannel.id, student: studentEmail });
      setJoinedChannels(prev => prev.filter(id => id !== selectedChannel.id));
      setSelectedChannel(null);
      loadCommunities(false);
    } catch (err) {
      Alert.alert("Error", "Could not leave community");
    }
  };

  const loadPosts = async (categoryName: string) => {
    try {
      setPostsLoading(true);
      const res = await getPosts({ community: selectedChannel?.id, category: categoryName });
      const list = res?.message?.data || res?.data || [];
      setPosts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      loadPosts(selectedCategory.category_name || selectedCategory.name);
    }
  }, [selectedCategory]);

  const handlePostClick = async (post: any) => {
    setSelectedPost(post);
    try {
      setRepliesLoading(true);
      const res = await getPostDetail({ post: post.name });
      const details = res?.message?.data || res?.data?.data || null;
      setPostDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await postComment({
        post: selectedPost.name,
        comment: replyText,
        parent_comment: "",
        student: studentEmail
      });
      setReplyText("");
      const res = await getPostDetail({ post: selectedPost.name });
      setPostDetails(res?.message?.data || res?.data?.data || null);
    } catch (err) {
      Alert.alert("Error", "Failed to post comment");
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicContent.trim()) return;
    try {
      await createPost({
        community: selectedChannel?.id,
        user: studentEmail,
        content: newTopicContent,
        post_type: "Text",
        category: selectedCategory?.category_name || selectedCategory?.name || "General"
      });
      setNewTopicContent("");
      if (selectedCategory) {
        loadPosts(selectedCategory.category_name || selectedCategory.name);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to create post");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await createCategory({
        category_name: newCatName,
        description: newCatDesc,
        parent_category: selectedChannel?.id
      });
      setShowCreateCategoryModal(false);
      setNewCatName("");
      setNewCatDesc("");
      loadCommunities(false);
    } catch (err) {
      Alert.alert("Error", "Failed to create category");
    }
  };

  const handleCreateTag = async () => {
    if (!newTagTitle.trim()) return;
    try {
      await createTag({ title: newTagTitle });
      setShowCreateTagModal(false);
      setNewTagTitle("");
      loadCommunities(false);
    } catch (err) {
      Alert.alert("Error", "Failed to create tag");
    }
  };

  const filteredCommunities = communities.filter(c => c.prettyName?.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase()));

  // ============================================
  // VIEWS
  // ============================================

  if (selectedPost) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedPost(null)} style={styles.headerBack}>
            <ArrowLeft size={20} color="#334155" />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Discussion</Text>
        </View>
        <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 20 }}>
          {repliesLoading ? <ActivityIndicator size="small" color="#FF6B00" style={{ marginTop: 20 }} /> : (
            <>
              <View style={styles.postDetailCard}>
                <View style={styles.postHeaderRow}>
                  <View style={styles.postAvatar}>
                    <Text style={styles.postAvatarTxt}>{((postDetails?.author || selectedPost?.author) || '?').substring(0, 1).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.postDetailAuthor}>{postDetails?.author || selectedPost?.author}</Text>
                    <Text style={styles.postDetailTime}>{(postDetails?.posted_on || selectedPost?.posted_on)?.replace('T', ' ').substring(0, 19)}</Text>
                  </View>
                </View>
                <Text style={styles.postDetailContent}>{postDetails?.content || selectedPost?.content}</Text>
              </View>

              <Text style={styles.repliesTitle}>Replies</Text>
              {postDetails?.comments?.map((comment: any, idx: number) => (
                <View key={idx} style={styles.replyCard}>
                  <View style={styles.postHeaderRow}>
                    <View style={[styles.postAvatar, { width: 32, height: 32, borderRadius: 16 }]}>
                      <Text style={[styles.postAvatarTxt, { fontSize: 14 }]}>{(comment.comment_by || '?').substring(0, 1).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.postDetailAuthor}>{comment.comment_by}</Text>
                      <Text style={styles.postDetailTime}>{comment.posted_on?.replace('T', ' ').substring(0, 19)}</Text>
                    </View>
                  </View>
                  <Text style={styles.replyContent}>{comment.content}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
        <View style={styles.replyInputWrapper}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor="#94A3B8"
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleReply}>
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (selectedCategory) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.headerBack}>
            <ArrowLeft size={20} color="#334155" />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{selectedCategory.category_name || selectedCategory.name}</Text>
        </View>
        <ScrollView style={styles.body}>
          {postsLoading ? <ActivityIndicator size="small" color="#FF6B00" style={{ marginTop: 20 }} /> : (
            posts.length > 0 ? posts.map((post, idx) => (
              <TouchableOpacity key={idx} style={styles.postCard} onPress={() => handlePostClick(post)}>
                <View style={styles.postHeaderRow}>
                  <View style={styles.postAvatar}>
                    <Text style={styles.postAvatarTxt}>{(post.author || '?').substring(0, 1).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.postCardAuthor}>{post.author}</Text>
                    <Text style={styles.postCardTime}>{post.posted_on?.replace('T', ' ').substring(0, 19)}</Text>
                  </View>
                </View>
                <Text style={styles.postCardContent}>{post.content}</Text>
                
                <View style={styles.postCardActions}>
                  <View style={styles.postAction}>
                    <Heart size={14} color="#64748B" />
                    <Text style={styles.postActionTxt}>{post.like_count || 0}</Text>
                  </View>
                  <View style={styles.postAction}>
                    <MessageSquare size={14} color="#64748B" />
                    <Text style={styles.postActionTxt}>{post.comment_count || 0}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )) : <Text style={styles.emptyText}>No posts found in this category.</Text>
          )}
        </ScrollView>

        <View style={styles.replyInputWrapper}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Post something in ${selectedCategory.category_name || selectedCategory.name}...`}
            placeholderTextColor="#94A3B8"
            value={newTopicContent}
            onChangeText={setNewTopicContent}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleCreateTopic}>
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (selectedChannel) {
    const categories = selectedChannel.categories || [];
    const tags = selectedChannel.tags || [];

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedChannel(null)} style={styles.headerBack}>
            <ArrowLeft size={20} color="#334155" />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{selectedChannel.prettyName}</Text>
          <TouchableOpacity onPress={handleLeaveChannel} style={[styles.headerBtn, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.headerBtnText}>Leave</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsWrapper}>
          <TouchableOpacity style={[styles.tabBtn, activeSubTab === 'categories' && styles.tabBtnActive]} onPress={() => setActiveSubTab('categories')}>
            <Text style={[styles.tabBtnText, activeSubTab === 'categories' && styles.tabBtnTextActive]}>Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeSubTab === 'discussions' && styles.tabBtnActive]} onPress={() => setActiveSubTab('discussions')}>
            <Text style={[styles.tabBtnText, activeSubTab === 'discussions' && styles.tabBtnTextActive]}>Discussions</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body}>
          {activeSubTab === 'categories' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
              </View>
              {categories.map((cat: any, idx: number) => (
                <TouchableOpacity key={idx} style={styles.categoryCard} onPress={() => setSelectedCategory(cat)}>
                  <Folder size={20} color="#FF6B00" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.categoryName}>{cat.category_name || cat.name}</Text>
                    <Text style={styles.categoryDesc}>{cat.description || "Discussion category"}</Text>
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </TouchableOpacity>
              ))}

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tags</Text>
              </View>
              <View style={styles.tagsContainer}>
                {tags.map((tag: any, idx: number) => (
                  <View key={idx} style={styles.tagBadge}>
                    <Text style={styles.tagText}>#{tag.title || tag.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeSubTab === 'discussions' && (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={styles.emptyText}>Please select a category to view discussions.</Text>
            </View>
          )}
        </ScrollView>

        {/* Modals */}
        <Modal visible={showCreateCategoryModal} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Category</Text>
              <TextInput style={styles.modalInput} placeholder="Category Name" placeholderTextColor="#94A3B8" value={newCatName} onChangeText={setNewCatName} />
              <TextInput style={[styles.modalInput, { height: 60 }]} placeholder="Description" placeholderTextColor="#94A3B8" value={newCatDesc} onChangeText={setNewCatDesc} multiline />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowCreateCategoryModal(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleCreateCategory} style={styles.modalSubmit}><Text style={styles.modalSubmitText}>Create</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showCreateTagModal} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Tag</Text>
              <TextInput style={styles.modalInput} placeholder="Tag Title" placeholderTextColor="#94A3B8" value={newTagTitle} onChangeText={setNewTagTitle} />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowCreateTagModal(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleCreateTag} style={styles.modalSubmit}><Text style={styles.modalSubmitText}>Create</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    );
  }

  // LIST VIEW
  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Student Communities</Text>
        <Text style={styles.listSubtitle}>Join peer groups, share knowledge, and grow together</Text>
      </View>
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <View style={styles.searchBox}>
          <Search size={18} color="#94A3B8" style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B00']} />} contentContainerStyle={{ padding: 16 }}>
        {loading ? <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 40 }} /> : (
          filteredCommunities.map((community, idx) => {
            const isJoined = joinedChannels.includes(community.id) || community.is_member === 1 || community.action === 'leave';
            return (
              <TouchableOpacity key={idx} style={styles.communityCard} onPress={() => isJoined ? handleJoinChannel(community.id) : null}>
                <View style={styles.communityIconWrapper}>
                  <Text style={styles.communityIconTxt}>{community.icon}</Text>
                </View>
                <View style={styles.communityInfo}>
                  <Text style={styles.communityName} numberOfLines={1}>{community.prettyName}</Text>
                  <Text style={styles.communityDesc} numberOfLines={2}>{community.description || "A community space to collaborate."}</Text>
                  <View style={styles.communityMeta}>
                    <View style={styles.metaBadge}><Users size={12} color="#64748B" /><Text style={styles.metaTxt}>{community.member_count || 0}</Text></View>
                    <View style={styles.metaBadge}><Tag size={12} color="#64748B" /><Text style={styles.metaTxt}>{community.category}</Text></View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
                  onPress={() => handleJoinChannel(community.id)}
                >
                  <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextActive]}>{isJoined ? "View" : "Join"}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', justifyContent: 'space-between' },
  headerBack: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBackText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'center', marginHorizontal: 12 },
  headerBtn: { backgroundColor: '#FF6B00', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  headerBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  body: { flex: 1, padding: 16 },
  listHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#F8FAFC' },
  listTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  listSubtitle: { fontSize: 14, color: '#475569', marginTop: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', height: 48, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, paddingHorizontal: 12, fontSize: 15, color: '#0F172A' },
  communityCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3, alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#FF6B00' },
  communityIconWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  communityIconTxt: { fontSize: 26 },
  communityInfo: { flex: 1 },
  communityName: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  communityDesc: { fontSize: 13, color: '#64748B', marginBottom: 10, lineHeight: 18 },
  communityMeta: { flexDirection: 'row', gap: 10 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 6 },
  metaTxt: { fontSize: 12, color: '#475569', fontWeight: '600' },
  joinBtn: { backgroundColor: '#FF6B00', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginLeft: 12, shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 },
  joinBtnActive: { backgroundColor: '#F1F5F9', shadowOpacity: 0, elevation: 0 },
  joinBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  joinBtnTextActive: { color: '#475569' },
  tabsWrapper: { flexDirection: 'row', padding: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 8 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  tabBtnActive: { backgroundColor: '#FFF7ED' },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabBtnTextActive: { color: '#FF6B00' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  actionText: { fontSize: 13, fontWeight: '600', color: '#FF6B00' },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, marginBottom: 12, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#FF6B00' },
  categoryName: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  categoryDesc: { fontSize: 14, color: '#64748B', marginTop: 4, lineHeight: 20 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagBadge: { backgroundColor: '#F0F9FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#BAE6FD' },
  tagText: { fontSize: 13, fontWeight: '700', color: '#0369A1' },
  postCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: '#F8FAFC' },
  postHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  postAvatarTxt: { fontSize: 18, fontWeight: '700', color: '#0369A1' },
  postCardAuthor: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  postCardTime: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  postCardContent: { fontSize: 15, color: '#334155', lineHeight: 22, marginBottom: 16 },
  postCardActions: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postActionTxt: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 20 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#0F172A', marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  modalCancel: { fontSize: 14, fontWeight: '600', color: '#64748B', padding: 10 },
  modalSubmit: { backgroundColor: '#FF6B00', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalSubmitText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  postDetailCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F8FAFC', marginBottom: 20, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  postDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  postDetailAuthor: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  postDetailTime: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  postDetailContent: { fontSize: 15, color: '#334155', lineHeight: 24, paddingLeft: 4 },
  repliesTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12, marginLeft: 4 },
  replyCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F8FAFC', marginBottom: 12, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  replyContent: { fontSize: 14, color: '#334155', marginTop: 4, paddingLeft: 44 },
  replyInputWrapper: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  replyInput: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, maxHeight: 120, fontSize: 15, color: '#0F172A', marginRight: 12 },
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
});
