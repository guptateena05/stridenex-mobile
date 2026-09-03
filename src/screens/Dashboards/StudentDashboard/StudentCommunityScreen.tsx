import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, MessageSquare, Heart, Search, ArrowLeft, Folder, Tag, Plus, Send, X, ChevronRight, Check, Clock, Lock, Shield, CheckCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCommunities, joinCommunity, leaveCommunity, getPosts, getPostDetail, postComment, createPost, createCategory, createTag, getCommunityDetail, toggleCommentLike } from '@/api/api.services';
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

  const getErrorMessage = (err: any, defaultMsg: string) => {
    const data = err?.response?.data;
    if (data) {
      if (typeof data.message === 'string') return data.message;
      if (typeof data.message === 'object' && data.message?.message) return data.message.message;
      if (typeof data.message === 'object' && data.message?.error) return data.message.error;
      if (typeof data.error === 'string') return data.error;
    }
    if (typeof err?.message === 'string') return err.message;
    return defaultMsg;
  };

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [joiningChannelId, setJoiningChannelId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [successModal, setSuccessModal] = useState<{ visible: boolean, title: string, message: string, isPrivate: boolean, onOk?: () => void }>({ visible: false, title: "", message: "", isPrivate: false });

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
    const isJoined = joinedChannels.includes(channelId) || Number(commObj?.is_member) === 1 || commObj?.is_member === true || commObj?.action === 'leave';
    const isPending = commObj?.action === "pending" || commObj?.action === "Pending" || commObj?.status === "Pending";

    if (isPending) return;

    if (!isJoined) {
      setJoiningChannelId(channelId);
      setTermsAccepted(false);
      setShowTermsModal(true);
      return;
    }

    try {
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
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err, "Could not process action"));
    } finally {
      setChannelDetailsLoading(false);
    }
  };

  const confirmJoinChannel = async () => {
    if (!joiningChannelId || !studentEmail) return;
    const commObj = communities.find(c => c.id === joiningChannelId);
    try {
      setIsJoining(true);
      await joinCommunity({ community: joiningChannelId, student: studentEmail });
      
      if (commObj?.category === 'Private' || commObj?.community_type === 'Private') {
        setCommunities(prev => prev.map(c => c.id === joiningChannelId ? { ...c, action: 'pending' } : c));
        setShowTermsModal(false);
        setTimeout(() => {
          setSuccessModal({
            visible: true,
            title: "Request Sent",
            message: `Your request to join ${commObj?.prettyName} has been sent for approval.`,
            isPrivate: true,
            onOk: () => setSuccessModal(prev => ({ ...prev, visible: false }))
          });
        }, 300);
      } else {
        setJoinedChannels(prev => [...prev, joiningChannelId]);
        loadCommunities(false);
        setShowTermsModal(false);
        setTimeout(() => {
          setSuccessModal({
            visible: true,
            title: "Success",
            message: `You have successfully joined ${commObj?.prettyName || 'the community'}!`,
            isPrivate: false,
            onOk: async () => {
              setSuccessModal(prev => ({ ...prev, visible: false }));
              try {
                setChannelDetailsLoading(true);
                const detailRes = await getCommunityDetail({ community: joiningChannelId });
                const channelDetails = detailRes?.message?.data || detailRes?.data || null;

                if (channelDetails) {
                  setSelectedChannel({
                    ...commObj,
                    ...channelDetails,
                    prettyName: formatChannelNameStr(channelDetails.community_name || channelDetails.name),
                  });
                } else {
                  setSelectedChannel(commObj as any);
                }
              } catch (err: any) {
                Alert.alert("Error", getErrorMessage(err, "Could not process action"));
              } finally {
                setChannelDetailsLoading(false);
              }
            }
          });
        }, 300);
      }
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err, "Could not join community"));
    } finally {
      setIsJoining(false);
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

        <ScrollView style={styles.body}>
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
  const joiningCommObj = communities.find(c => c.id === joiningChannelId);
  const isJoiningPrivate = joiningCommObj?.category === 'Private' || joiningCommObj?.community_type === 'Private';

  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listTitle}>Communities</Text>
            <Text style={styles.listSubtitle}>Join peer groups, share knowledge, and grow together</Text>
          </View>
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
              <TouchableOpacity key={idx} style={styles.communityCard} onPress={() => (isJoined && !isPending) ? handleJoinChannel(community.id) : null}>
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
                {isPending ? (
                  <View style={[styles.joinBtn, { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', gap: 4, width: 'auto', paddingHorizontal: 8 }]}>
                    <Clock size={12} color="#D97706" />
                    <Text style={[styles.joinBtnText, { color: '#D97706' }]}>Pending</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
                    onPress={() => handleJoinChannel(community.id)}
                  >
                    <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextActive]}>{isJoined ? "View" : "Join"}</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      {/* Terms and Conditions Modal */}
      <Modal visible={showTermsModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { padding: 0, overflow: 'hidden' }]}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: isJoiningPrivate ? '#9333EA' : '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  {isJoiningPrivate ? <Lock size={20} color="#FFFFFF" /> : <Shield size={20} color="#FFFFFF" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>
                    {isJoiningPrivate ? 'Request to Join Private Space' : 'Community Guidelines'}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                    {isJoiningPrivate ? 'Requires owner approval to access' : 'Please read before joining'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => setShowTermsModal(false)}
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ padding: 20 }}>
              {/* Banner */}
              {isJoiningPrivate && (
                <View style={{ backgroundColor: '#FAF5FF', borderWidth: 1, borderColor: '#E9D5FF', borderRadius: 12, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Lock size={16} color="#9333EA" style={{ marginTop: 2, marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#6B21A8', marginBottom: 4 }}>Private Community Approval</Text>
                    <Text style={{ fontSize: 13, color: '#7E22CE', lineHeight: 18 }}>This is a private community. Submitting this request will send your profile for approval to the community owner.</Text>
                  </View>
                </View>
              )}

              <Text style={{ fontSize: 14, color: '#334155', lineHeight: 22, marginBottom: 16 }}>
                Welcome to our community! To ensure a safe, collaborative, and professional environment, we ask all members to adhere to the following guidelines:
              </Text>
              
              <View style={{ marginBottom: 12, flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: '#0F172A', marginRight: 6 }}>•</Text>
                <Text style={{ fontSize: 14, color: '#334155', lineHeight: 22, flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#0F172A' }}>Respect Everyone: </Text>
                  Treat all members with respect. Harassment, discrimination, or abusive language will not be tolerated.
                </Text>
              </View>
              
              <View style={{ marginBottom: 12, flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: '#0F172A', marginRight: 6 }}>•</Text>
                <Text style={{ fontSize: 14, color: '#334155', lineHeight: 22, flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#0F172A' }}>No Spam or Self-Promotion: </Text>
                  Keep discussions relevant to the community topic. Do not post spam or unsolicited promotional material.
                </Text>
              </View>
              
              <View style={{ marginBottom: 12, flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: '#0F172A', marginRight: 6 }}>•</Text>
                <Text style={{ fontSize: 14, color: '#334155', lineHeight: 22, flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#0F172A' }}>Protect Privacy: </Text>
                  Do not share personal information of others or sensitive data without explicit permission.
                </Text>
              </View>
              
              <View style={{ marginBottom: 12, flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: '#0F172A', marginRight: 6 }}>•</Text>
                <Text style={{ fontSize: 14, color: '#334155', lineHeight: 22, flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#0F172A' }}>Constructive Feedback: </Text>
                  When reviewing others' work or answering questions, be constructive, helpful, and kind.
                </Text>
              </View>
              
              <View style={{ marginBottom: 4, flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: '#0F172A', marginRight: 6 }}>•</Text>
                <Text style={{ fontSize: 14, color: '#334155', lineHeight: 22, flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#0F172A' }}>Compliance: </Text>
                  {isJoiningPrivate ? 
                    'By joining this community, you agree to comply with all platform rules.' :
                    "By joining this community, you agree to comply with StrideNex's overarching Terms of Use and Privacy Policy."
                  }
                </Text>
              </View>

              {!isJoiningPrivate && (
                <Text style={{ fontSize: 14, color: '#334155', lineHeight: 22, marginTop: 12, marginBottom: 4 }}>
                  Failure to follow these rules may result in temporary suspension or permanent removal from the community.
                </Text>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: termsAccepted ? (isJoiningPrivate ? '#C084FC' : '#3B82F6') : '#CBD5E1', backgroundColor: termsAccepted ? (isJoiningPrivate ? '#C084FC' : '#3B82F6') : '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  {termsAccepted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={{ fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 }}>
                  I have read and agree to follow the community guidelines and terms of use.
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity 
                  style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
                  onPress={() => setShowTermsModal(false)}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#334155' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, backgroundColor: termsAccepted ? (isJoiningPrivate ? '#C084FC' : '#3B82F6') : (isJoiningPrivate ? '#E9D5FF' : '#DBEAFE'), alignItems: 'center', justifyContent: 'center' }}
                  disabled={!termsAccepted || isJoining}
                  onPress={confirmJoinChannel}
                >
                  {isJoining ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '700', color: termsAccepted ? '#FFFFFF' : (isJoiningPrivate ? '#9333EA' : '#2563EB') }}>
                      {isJoiningPrivate ? 'Accept & Request to Join' : 'Accept & Join'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={successModal.visible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { padding: 0, overflow: 'hidden', alignItems: 'center' }]}>
            <View style={{ padding: 24, alignItems: 'center', width: '100%' }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: successModal.isPrivate ? '#FAF5FF' : '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {successModal.isPrivate ? (
                  <CheckCircle size={32} color="#9333EA" strokeWidth={2.5} />
                ) : (
                  <CheckCircle size={32} color="#2563EB" strokeWidth={2.5} />
                )}
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 8, textAlign: 'center' }}>
                {successModal.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
                {successModal.message}
              </Text>
              
              <TouchableOpacity 
                style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: successModal.isPrivate ? '#9333EA' : '#2563EB', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => successModal.onOk && successModal.onOk()}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Okay</Text>
              </TouchableOpacity>
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
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#0F172A', marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  modalCancel: { fontSize: 14, fontWeight: '600', color: '#64748B', padding: 10 },
  modalSubmit: { backgroundColor: '#FF6B00', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalSubmitText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
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
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
});
