import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, MessageSquare, Heart, Search, ArrowLeft, Folder, Tag, Plus, Send, X, ChevronRight, Check, Clock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCommunities, joinCommunity, leaveCommunity, getPosts, getPostDetail, postComment, createPost, createCategory, createTag, getCommunityDetail, api, toggleCommentLike, updateCommunityMemberStatus } from '@/api/api.services';

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

interface SharedCommunityScreenProps {
  userType: 'mentor' | 'college' | 'industry' | 'student';
}

export const SharedCommunityScreen = ({ userType }: SharedCommunityScreenProps) => {
  const insets = useSafeAreaInsets();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [joinedChannels, setJoinedChannels] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);

  // Tabs
  const [activeSubTab, setActiveSubTab] = useState<"categories" | "members">("categories");
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  // Post/Thread state
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [postDetails, setPostDetails] = useState<any>(null);
  const [repliesLoading, setRepliesLoading] = useState<boolean>(false);

  // Modals
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Form Data
  const [newCommName, setNewCommName] = useState("");
  const [newCommDesc, setNewCommDesc] = useState("");
  const [newCommType, setNewCommType] = useState("Public");
  
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  
  // Suggested Categories State
  const [showCategoryOptionsModal, setShowCategoryOptionsModal] = useState(false);
  const [selectedSuggestedCategory, setSelectedSuggestedCategory] = useState<any>(null);
  
  const SUGGESTED_CATEGORIES = [
    { name: "Academics", emoji: "📚", desc: "Discuss classes, courses, exams, share lecture notes and study guides." },
    { name: "Placements", emoji: "💼", desc: "Discuss job search, internships, interview experiences, resume reviews, and advice." },
    { name: "Projects", emoji: "🚀", desc: "Find project teammates, share progress, post ideas, or collaborate on hackathons." },
    { name: "Coding", emoji: "💻", desc: "Talk programming languages, framework updates, algorithms, system design, and dev news." },
    { name: "Design", emoji: "🎨", desc: "Share layouts, logo design, receive UI/UX feedback, and show off design portfolios." },
    { name: "General", emoji: "💬", desc: "Get to know peers, discuss campus events, make general announcements, and casual chats." },
  ];

  const [newTagTitle, setNewTagTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail") || await AsyncStorage.getItem("currentUser") || await AsyncStorage.getItem("userName") || "";
      setUserEmail(email);
    };
    fetchEmail();
  }, []);

  const loadCommunities = async (showIndicator = true) => {
    if (showIndicator) setLoading(true);
    try {
      const email = await AsyncStorage.getItem("userEmail") || await AsyncStorage.getItem("currentUser") || await AsyncStorage.getItem("userName") || "";
      const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);
      
      const res = await api.post('method/stridenex_app.stridenex_app.doctype.community.community.get_communities', {
        user: email,
        user_type: capitalizedUserType
      });
      
      const list = res?.data?.message?.data || res?.data?.data?.data || res?.data?.data || res?.data?.message || [];
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
  }, [userType]);

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

  const fetchAndShowChannelDetails = async (channelId: string, commObj: any) => {
    try {
      setChannelDetailsLoading(true);
      const detailRes = await getCommunityDetail({ community: channelId });
      const channelDetails = detailRes?.message?.data || detailRes?.data || detailRes?.data?.message?.data || null;

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

  const handleJoinChannel = async (channelId: string) => {
    const commObj = communities.find(c => c.id === channelId);
    const isJoined = joinedChannels.includes(channelId) || Number(commObj?.is_member) === 1 || commObj?.is_member === true || commObj?.action === 'leave';
    const isPending = commObj?.action === "pending" || commObj?.action === "Pending" || commObj?.status === "Pending";

    if (isPending) return;

    if (!isJoined && userType === 'student') {
      try {
        setIsJoining(true);
        await joinCommunity({ community: channelId, student: userEmail });
        
        if (commObj?.category === 'Private') {
          Alert.alert("Request Sent", `Your request to join ${commObj?.prettyName} has been sent for approval.`);
          setCommunities(prev => prev.map(c => c.id === channelId ? { ...c, action: 'pending' } : c));
        } else {
          setJoinedChannels(prev => [...prev, channelId]);
          Alert.alert("Success", `You have successfully joined ${commObj?.prettyName || 'the community'}!`);
          loadCommunities(false);
          await fetchAndShowChannelDetails(channelId, commObj);
        }
      } catch (err) {
        Alert.alert("Error", "Could not join community");
      } finally {
        setIsJoining(false);
      }
      return;
    }
    
    await fetchAndShowChannelDetails(channelId, commObj);
  };

  const handleLeaveChannel = async () => {
    if (!selectedChannel) return;
    try {
      await leaveCommunity({ community: selectedChannel.id, student: userEmail });
      setJoinedChannels(prev => prev.filter(id => id !== selectedChannel.id));
      setSelectedChannel(null);
      loadCommunities(false);
      Alert.alert("Success", "You have left the community.");
    } catch (err) {
      Alert.alert("Error", "Could not leave community");
    }
  };

  const handleApproveMember = async (memberName: string) => {
    try {
      await updateCommunityMemberStatus({ name: memberName, status: 'Approved' });
      setSelectedChannel((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((m: any) => m.name === memberName ? { ...m, status: 'Approved' } : m)
        };
      });
      Alert.alert("Success", "Member approved successfully.");
    } catch (err: any) {
      Alert.alert("Error", "Could not approve member.");
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

  const handleCreateTopic = async () => {
    if (!newTopicContent.trim()) return;
    try {
      await createPost({
        community: selectedChannel?.id,
        user: userEmail,
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

  const handleToggleCommentLike = async (commentId: string) => {
    try {
      await toggleCommentLike({ comment: commentId });
      if (selectedPost) {
        const res = await getPostDetail({ post: selectedPost.name });
        setPostDetails(res?.message?.data || res?.data?.data || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommName.trim() || !newCommDesc.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);
      await api.post('method/stridenex_app.stridenex_app.doctype.community.community.create_community', {
        community_name: newCommName,
        description: newCommDesc,
        community_type: newCommType,
        user_type: capitalizedUserType,
        community_owner: userEmail
      });
      setShowCreateCommunityModal(false);
      setNewCommName("");
      setNewCommDesc("");
      loadCommunities(false);
    } catch (err) {
      Alert.alert("Error", "Failed to create community");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    const exists = selectedChannel?.categories?.some((c: any) => (c.category_name || c.name)?.toLowerCase() === newCatName.trim().toLowerCase());
    if (exists) {
      Alert.alert("Already Present", "This category is already present.");
      return;
    }
    
    try {
      await createCategory({
        category_name: newCatName.trim(),
        description: newCatDesc.trim(),
        parent_category: selectedChannel?.id
      });
      setShowCreateCategoryModal(false);
      setNewCatName("");
      setNewCatDesc("");
      
      const detailRes = await getCommunityDetail({ community: selectedChannel?.id });
      const channelDetails = detailRes?.message?.data || detailRes?.data || null;
      if (channelDetails) {
        setSelectedChannel({ ...selectedChannel, ...channelDetails });
      }
    } catch (err: any) {
      const errStr = typeof err?.response?.data === 'string' ? err.response.data : JSON.stringify(err?.response?.data || err?.message || "").toLowerCase();
      if (errStr.includes("duplicate") || errStr.includes("exist") || errStr.includes("present") || errStr.includes("unique")) {
        Alert.alert("Already Present", "This category is already present.");
      } else {
        Alert.alert("Error", "Failed to create category");
      }
    }
  };

  const handleCreateSuggestedCategory = async () => {
    if (!selectedSuggestedCategory) return;
    
    const exists = selectedChannel?.categories?.some((c: any) => (c.category_name || c.name)?.toLowerCase() === selectedSuggestedCategory.name.toLowerCase());
    if (exists) {
      Alert.alert("Already Present", "This category is already present in your community.");
      return;
    }
    
    try {
      await createCategory({
        category_name: selectedSuggestedCategory.name,
        description: selectedSuggestedCategory.desc,
        parent_category: selectedChannel?.id
      });
      setShowCategoryOptionsModal(false);
      setSelectedSuggestedCategory(null);
      
      const detailRes = await getCommunityDetail({ community: selectedChannel?.id });
      const channelDetails = detailRes?.message?.data || detailRes?.data || null;
      if (channelDetails) {
        setSelectedChannel({ ...selectedChannel, ...channelDetails });
      }
    } catch (err: any) {
      const errStr = typeof err?.response?.data === 'string' ? err.response.data : JSON.stringify(err?.response?.data || err?.message || "").toLowerCase();
      if (errStr.includes("duplicate") || errStr.includes("exist") || errStr.includes("present") || errStr.includes("unique")) {
        Alert.alert("Already Present", "This category is already present in your community.");
      } else {
        Alert.alert("Error", "Failed to create category");
      }
    }
  };

  const handleCreateTag = async () => {
    if (!newTagTitle.trim()) return;
    const exists = selectedChannel?.tags?.some((t: any) => (t.title || t.name)?.toLowerCase() === newTagTitle.trim().toLowerCase());
    if (exists) {
      Alert.alert("Already Present", "This tag is already present.");
      return;
    }
    
    try {
      await createTag({ title: newTagTitle.trim() });
      setShowCreateTagModal(false);
      setNewTagTitle("");
      
      const detailRes = await getCommunityDetail({ community: selectedChannel?.id });
      const channelDetails = detailRes?.message?.data || detailRes?.data || null;
      if (channelDetails) {
        setSelectedChannel({ ...selectedChannel, ...channelDetails });
      }
    } catch (err: any) {
      const errStr = typeof err?.response?.data === 'string' ? err.response.data : JSON.stringify(err?.response?.data || err?.message || "").toLowerCase();
      if (errStr.includes("duplicate") || errStr.includes("exist") || errStr.includes("present") || errStr.includes("unique")) {
        Alert.alert("Already Present", "This tag is already present.");
      } else {
        Alert.alert("Error", "Failed to create tag");
      }
    }
  };

  const filteredCommunities = communities.filter(c => c.prettyName?.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase()));

  // ============================================
  // VIEWS
  // ============================================

  if (selectedPost) {
    return (
      <View style={[styles.container]}>
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
                  <View style={[styles.postAvatar, { width: 48, height: 48, borderRadius: 24 }]}>
                    <Text style={[styles.postAvatarTxt, { fontSize: 18 }]}>{((postDetails?.author || selectedPost?.author) || '?').substring(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postDetailAuthor}>{postDetails?.author || selectedPost?.author}</Text>
                    <Text style={styles.postDetailTime}>{(postDetails?.posted_on || selectedPost?.posted_on)?.replace('T', ' ').substring(0, 19)}</Text>
                  </View>
                </View>
                <Text style={styles.postDetailContent}>{postDetails?.content || selectedPost?.content}</Text>
              </View>

              <Text style={styles.repliesTitle}>Replies</Text>
              {postDetails?.comments?.map((comment: any, idx: number) => (
                <View key={idx} style={styles.replyCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={[styles.postAvatar, { width: 36, height: 36, borderRadius: 18, marginTop: 4 }]}>
                      <Text style={[styles.postAvatarTxt, { fontSize: 14 }]}>{(comment.comment_by || '?').substring(0, 1).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.replyBubble}>
                        <Text style={styles.postDetailAuthor}>{comment.comment_by}</Text>
                        <Text style={styles.replyContentText}>{comment.content}</Text>
                      </View>
                      
                      <View style={styles.replyFooter}>
                        <Text style={styles.replyTime}>{comment.posted_on?.replace('T', ' ').substring(0, 19)}</Text>
                        <TouchableOpacity onPress={() => handleToggleCommentLike(comment.name)} style={styles.replyLikeBtn}>
                          <Heart size={14} color={comment.is_liked_by_user ? "#EF4444" : "#64748B"} fill={comment.is_liked_by_user ? "#EF4444" : "none"} />
                          <Text style={[styles.replyLikeTxt, comment.is_liked_by_user && { color: "#EF4444" }]}>{comment.like_count || 0}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  if (selectedCategory) {
    return (
      <View style={[styles.container]}>
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
                <View style={styles.postCardInner}>
                  <View style={styles.postHeaderRow}>
                    <View style={styles.postAvatar}>
                      <Text style={styles.postAvatarTxt}>{(post.author || '?').substring(0, 1).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.postCardAuthor} numberOfLines={1}>{post.author}</Text>
                      <Text style={styles.postCardTime}>{post.posted_on?.replace('T', ' ').substring(0, 19)}</Text>
                    </View>
                    <ChevronRight size={20} color="#CBD5E1" />
                  </View>
                  <Text style={styles.postCardContent} numberOfLines={3}>{post.content}</Text>
                  
                  <View style={styles.postDivider} />
                  
                  <View style={styles.postCardActions}>
                    <View style={styles.postActionBadge}>
                      <Heart size={14} color="#64748B" />
                      <Text style={styles.postActionTxt}>{post.like_count || 0}</Text>
                    </View>
                    <View style={styles.postActionBadge}>
                      <MessageSquare size={14} color="#64748B" />
                      <Text style={styles.postActionTxt}>{post.comment_count || 0}</Text>
                    </View>
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
      <View style={[styles.container]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedChannel(null)} style={styles.headerBack}>
            <ArrowLeft size={20} color="#334155" />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{selectedChannel.prettyName}</Text>
          {/* Leave button removed for admin roles */}
        </View>

        <View style={styles.tabsWrapper}>
          <TouchableOpacity style={[styles.tabBtn, activeSubTab === 'categories' && styles.tabBtnActive]} onPress={() => setActiveSubTab('categories')}>
            <Text style={[styles.tabBtnText, activeSubTab === 'categories' && styles.tabBtnTextActive]}>Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeSubTab === 'members' && styles.tabBtnActive]} onPress={() => setActiveSubTab('members')}>
            <Text style={[styles.tabBtnText, activeSubTab === 'members' && styles.tabBtnTextActive]}>Members</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body}>
          {activeSubTab === 'categories' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity 
                  style={styles.addBtn} 
                  onPress={() => {
                    if (userType !== 'student') {
                      setShowCategoryOptionsModal(true);
                    } else {
                      setShowCreateCategoryModal(true);
                    }
                  }}
                >
                  <Plus size={14} color="#FF6B00" />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
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
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreateTagModal(true)}>
                  <Plus size={14} color="#FF6B00" />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
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

          {activeSubTab === 'members' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Members ({selectedChannel?.members?.length || 0})</Text>
              </View>
              {selectedChannel?.members?.map((member: any, idx: number) => (
                <View key={idx} style={[styles.memberCard, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarTxt}>{(member.member || member.name || '?').substring(0, 1).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.memberName} numberOfLines={1}>{member.member || member.name}</Text>
                      <Text style={styles.memberRole}>{member.role || 'Member'} • Joined {member.joined_on?.substring(0, 10)}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {(member.role?.toUpperCase() === 'ADMIN' || member.role?.toUpperCase() === 'MEMBER') && (
                      <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9', marginRight: 4 }]}>
                        <Text style={[styles.statusTxt, { color: '#475569', fontSize: 10, letterSpacing: 0.5 }]}>{member.role?.toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={[styles.statusBadge, { backgroundColor: member.status === 'Approved' ? '#ECFDF5' : '#FEF3C7', paddingHorizontal: 10 }]}>
                      <Text style={[styles.statusTxt, { color: member.status === 'Approved' ? '#059669' : '#D97706', fontSize: 10, letterSpacing: 0.5 }]}>{member.status?.toUpperCase() || 'PENDING'}</Text>
                    </View>
                    {(member.status === 'Pending' || member.status === 'pending') && (
                      <TouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 }}
                        onPress={() => handleApproveMember(member.name)}
                      >
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Approve</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
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

        {/* Suggested Categories Modal */}
        <Modal visible={showCategoryOptionsModal} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={[styles.modalContent, { width: '100%', maxHeight: '85%' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Folder size={20} color="#0F172A" />
                  <Text style={[styles.modalTitle, { marginBottom: 0 }]}>Create Category</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCategoryOptionsModal(false)}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              
              <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 16, lineHeight: 18 }}>
                Select a suggested category style to quickly set up your channel discussion, or create a completely custom one:
              </Text>

              <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {SUGGESTED_CATEGORIES.map((cat, idx) => {
                    const isSelected = selectedSuggestedCategory?.name === cat.name;
                    return (
                      <TouchableOpacity 
                        key={idx} 
                        style={[
                          styles.suggestedCard, 
                          isSelected && styles.suggestedCardActive
                        ]}
                        onPress={() => setSelectedSuggestedCategory(cat)}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                          <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>{cat.name}</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>{cat.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
                <TouchableOpacity 
                  style={styles.customBtn}
                  onPress={() => {
                    setShowCategoryOptionsModal(false);
                    setShowCreateCategoryModal(true);
                  }}
                >
                  <Text style={styles.customBtnText}>Create Custom Category</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.suggestedBtn, !selectedSuggestedCategory && styles.suggestedBtnDisabled]}
                  onPress={handleCreateSuggestedCategory}
                  disabled={!selectedSuggestedCategory}
                >
                  <Text style={[styles.suggestedBtnText, !selectedSuggestedCategory && styles.suggestedBtnTextDisabled]}>
                    Create Suggested Category
                  </Text>
                </TouchableOpacity>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listTitle}>Communities</Text>
            <Text style={styles.listSubtitle}>Join peer groups, share knowledge, and grow together</Text>
          </View>
          <TouchableOpacity style={styles.createCommBtn} onPress={() => setShowCreateCommunityModal(true)}>
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
            const isJoined = joinedChannels.includes(community.id) || Number(community.is_member) === 1 || community.is_member === true || community.action === 'leave';
            const isPending = community.action === "pending" || community.action === "Pending" || community.status === "Pending";
            return (
              <TouchableOpacity key={idx} style={[styles.communityCard, { flexDirection: 'column', alignItems: 'stretch' }]} onPress={() => (isJoined || userType !== 'student') && !isPending ? handleJoinChannel(community.id) : (!isJoined && !isPending && userType === 'student' ? handleJoinChannel(community.id) : null)}>
                <View style={{ flexDirection: 'row', width: '100%', marginBottom: userType === 'student' ? 16 : 0 }}>
                  <View style={styles.communityIconWrapper}>
                    <Text style={styles.communityIconTxt}>{community.icon}</Text>
                  </View>
                  <View style={styles.communityInfo}>
                    <Text style={styles.communityName} numberOfLines={1}>{community.prettyName}</Text>
                    <Text style={styles.communityDesc} numberOfLines={2}>{community.description || "A community space to collaborate."}</Text>
                    <View style={styles.communityMeta}>
                      <View style={styles.metaBadge}><Users size={12} color="#64748B" /><Text style={styles.metaTxt}>{community.member_count || 0}</Text></View>
                      <View style={[styles.metaBadge, { backgroundColor: community.category === 'Private' ? '#F3E8FF' : '#EFF6FF' }]}>
                        <Tag size={12} color={community.category === 'Private' ? '#9333EA' : '#2563EB'} />
                        <Text style={[styles.metaTxt, { color: community.category === 'Private' ? '#9333EA' : '#2563EB' }]}>{community.category}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {userType === 'student' && (
                  isPending ? (
                    <View
                      style={[
                        { width: '100%', height: 44, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
                        { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' }
                      ]}
                    >
                      <Clock size={16} color="#D97706" />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#D97706' }}>
                        Pending Approval
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        { width: '100%', height: 44, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
                        isJoined 
                          ? { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' }
                          : { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA' }
                      ]}
                      onPress={() => handleJoinChannel(community.id)}
                    >
                      {isJoined && <Check size={16} color="#059669" strokeWidth={3} />}
                      {!isJoined && <Plus size={16} color="#EA580C" strokeWidth={2.5} />}
                      <Text style={{ 
                        fontSize: 14, 
                        fontWeight: '700', 
                        color: isJoined ? '#059669' : '#EA580C' 
                      }}>
                        {isJoined ? "Joined" : (community.category === "Private" ? "Request to Join" : "Join Community")}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      {/* Create Community Modal */}
      <Modal visible={showCreateCommunityModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Create Community</Text>
              <TouchableOpacity onPress={() => setShowCreateCommunityModal(false)}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.modalInput} placeholder="Community Name" placeholderTextColor="#94A3B8" value={newCommName} onChangeText={setNewCommName} />
            <TextInput style={[styles.modalInput, { height: 80 }]} placeholder="Description" placeholderTextColor="#94A3B8" value={newCommDesc} onChangeText={setNewCommDesc} multiline />
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <TouchableOpacity 
                style={[styles.typeBtn, newCommType === 'Public' && styles.typeBtnActive]} 
                onPress={() => setNewCommType('Public')}
              >
                <Text style={[styles.typeBtnTxt, newCommType === 'Public' && styles.typeBtnTxtActive]}>Public</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, newCommType === 'Private' && styles.typeBtnActive]} 
                onPress={() => setNewCommType('Private')}
              >
                <Text style={[styles.typeBtnTxt, newCommType === 'Private' && styles.typeBtnTxtActive]}>Private</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowCreateCommunityModal(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleCreateCommunity} style={styles.modalSubmit}><Text style={styles.modalSubmitText}>Create</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  listSubtitle: { fontSize: 14, color: '#475569', marginTop: 4, paddingRight: 40 },
  createCommBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
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
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24, gap: 4 },
  addBtnText: { fontSize: 12, fontWeight: '700', color: '#FF6B00' },
  actionText: { fontSize: 13, fontWeight: '600', color: '#FF6B00' },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, marginBottom: 12, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#FF6B00' },
  categoryName: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  categoryDesc: { fontSize: 14, color: '#64748B', marginTop: 4, lineHeight: 20 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagBadge: { backgroundColor: '#F0F9FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#BAE6FD' },
  tagText: { fontSize: 13, fontWeight: '700' },
  postCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, overflow: 'hidden' },
  postCardInner: { padding: 16, borderLeftWidth: 4, borderLeftColor: '#FF6B00' },
  postHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#FFEDD5' },
  postAvatarTxt: { fontSize: 16, fontWeight: '800', color: '#FF6B00' },
  postCardAuthor: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  postCardTime: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  postCardContent: { fontSize: 15, color: '#334155', lineHeight: 24, marginBottom: 16 },
  postDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  postCardActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  postActionBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  postActionTxt: { fontSize: 13, color: '#64748B', fontWeight: '700' },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 20 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 15, color: '#0F172A', marginBottom: 12 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  typeBtnActive: { backgroundColor: '#FFF7ED', borderColor: '#FF6B00' },
  typeBtnTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  typeBtnTxtActive: { color: '#FF6B00' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  modalCancel: { fontSize: 15, fontWeight: '600', color: '#64748B', padding: 12 },
  modalSubmit: { backgroundColor: '#FF6B00', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  modalSubmitText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  postDetailCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 24, shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderTopWidth: 4, borderTopColor: '#FF6B00' },
  postDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  postDetailAuthor: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  postDetailTime: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  postDetailContent: { fontSize: 16, color: '#334155', lineHeight: 26 },
  repliesTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 16, marginLeft: 4 },
  replyCard: { marginBottom: 16 },
  replyBubble: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, borderTopLeftRadius: 4, marginLeft: 12 },
  replyContentText: { fontSize: 15, color: '#334155', marginTop: 4, lineHeight: 22 },
  replyFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingLeft: 16, gap: 16 },
  replyTime: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  replyLikeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  replyLikeTxt: { fontSize: 13, color: '#64748B', fontWeight: '700' },
  replyInputWrapper: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  replyInput: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, maxHeight: 120, fontSize: 15, color: '#0F172A', marginRight: 12 },
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#F8FAFC' },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberAvatarTxt: { fontSize: 16, fontWeight: '700', color: '#0369A1' },
  memberName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  memberRole: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusTxt: { fontSize: 11, fontWeight: '700' },
  suggestedCard: { width: '48%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, marginBottom: 12 },
  suggestedCardActive: { borderColor: '#FF6B00', backgroundColor: '#FFF7ED' },
  customBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
  customBtnText: { color: '#FF6B00', fontSize: 14, fontWeight: '700' },
  suggestedBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
  suggestedBtnDisabled: { backgroundColor: '#F1F5F9' },
  suggestedBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  suggestedBtnTextDisabled: { color: '#94A3B8' }
});
