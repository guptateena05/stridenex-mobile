import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Users, User, Search, Plus, X, Globe, Lock, ArrowLeft, Folder, Tag, TrendingUp, MessageSquare } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { api, createCategory, createPost, getPosts, getPostDetail, postComment, joinCommunity, leaveCommunity } from '@/api/api.services';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Community {
  name: string;
  community_name: string;
  description: string;
  community_type: string;
  user_type: string;
  community_owner: string;
  member_count?: number;
}

interface SharedCommunityScreenProps {
  userType: 'mentor' | 'college' | 'industry';
}

export const SharedCommunityScreen = ({ userType }: SharedCommunityScreenProps) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedChannels, setJoinedChannels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedChannel, setSelectedChannel] = useState<Community | null>(null);
  const [channelDetails, setChannelDetails] = useState<any>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);
  const [isMembersExpanded, setIsMembersExpanded] = useState(true);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    community_name: '',
    description: '',
    community_type: 'Public',
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [formDataCategory, setFormDataCategory] = useState({ category_name: '', description: '' });

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);
  const [newTagTitle, setNewTagTitle] = useState("");

  // Post Thread State
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postDetails, setPostDetails] = useState<any>(null);
  const [isFetchingPostDetails, setIsFetchingPostDetails] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, [userType]);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || await AsyncStorage.getItem('userName') || await AsyncStorage.getItem('currentUser') || '';
      const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);
      const response = await api.post('method/stridenex_app.stridenex_app.doctype.community.community.get_communities', {
        user: email,
        user_type: capitalizedUserType
      });
      if (response.data) {
        let communitiesArray = response.data?.message?.data || response.data?.data?.data || response.data?.data || response.data?.message || [];
        if (!Array.isArray(communitiesArray)) {
          if (Array.isArray(response.data?.message?.communities)) communitiesArray = response.data.message.communities;
          else if (Array.isArray(response.data?.data?.communities)) communitiesArray = response.data.data.communities;
          else communitiesArray = [];
        }
        setCommunities(Array.isArray(communitiesArray) ? communitiesArray : []);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunityClick = async (community: Community) => {
    setSelectedChannel(community);
    setIsFetchingDetails(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || await AsyncStorage.getItem('userName') || await AsyncStorage.getItem('currentUser') || '';
      const response = await api.post('method/stridenex_app.stridenex_app.doctype.community.community.get_community', {
        community: community.name
      });
      if (response.data) {
        const data = response.data?.message?.data || response.data?.data?.data || response.data?.message;
        if (data) {
          setChannelDetails(data);
        } else {
          setChannelDetails(community);
        }
      }
    } catch (error) {
      console.error("Error fetching community details:", error);
      setChannelDetails(community); // Fallback
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleJoinChannel = async (community: any) => {
    const isAlreadyJoined = joinedChannels.includes(community.name) || community?.action === 'leave';
    try {
      if (isAlreadyJoined) {
        handleCommunityClick(community);
      } else {
        const email = await AsyncStorage.getItem('userEmail') || await AsyncStorage.getItem('userName') || await AsyncStorage.getItem('currentUser') || '';
        await joinCommunity({
          community: community.name,
          student: email
        });
        setJoinedChannels((prev) => [...prev, community.name]);
        fetchCommunities();
        handleCommunityClick(community);
      }
    } catch (error) {
      console.error("Error toggling channel membership:", error);
    }
  };



  const handleCreateCommunity = async () => {
    if (!formData.community_name || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || await AsyncStorage.getItem('userName') || await AsyncStorage.getItem('currentUser') || '';
      const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);
      const response = await api.post('method/stridenex_app.stridenex_app.doctype.community.community.create_community', {
        ...formData,
        user_type: capitalizedUserType,
        community_owner: email
      });
      
      const successMsg = response.data?.message?.message || response.data?.message || "Community created successfully!";
      Alert.alert('Success', typeof successMsg === 'string' ? successMsg : "Community created successfully!");
      setIsModalVisible(false);
      setFormData({ community_name: '', description: '', community_type: 'Public' });
      fetchCommunities();
    } catch (error: any) {
      console.error("Error creating community:", error);
      const errMsg = error?.response?.data?.message?.message || error?.response?.data?.message || error.message || 'Failed to create community.';
      Alert.alert('Error', typeof errMsg === 'string' ? errMsg : 'Failed to create community.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!formDataCategory.category_name || !formDataCategory.description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setIsSubmittingCategory(true);
    try {
      const response = await api.post('method/stridenex_app.stridenex_app.doctype.community.community.create_category', {
        ...formDataCategory,
        parent_category: selectedChannel?.name
      });

      if (response.data?.message?.success === false || response.data?.success === false) {
        throw new Error(response.data?.message?.message || response.data?.message || "Failed to create category");
      }

      const successMsg = response.data?.message?.message || response.data?.message || "Category created successfully!";
      Alert.alert('Success', typeof successMsg === 'string' ? successMsg : "Category created successfully!");
      setIsCategoryModalOpen(false);
      setFormDataCategory({ category_name: '', description: '' });
      fetchCommunities();
      if (selectedChannel) {
        const res = await api.post('method/stridenex_app.stridenex_app.doctype.community.community.get_community', {
          community: selectedChannel.name
        });
        if (res.data) {
          const data = res.data?.message?.data || res.data?.data?.data || res.data?.message;
          if (data) setChannelDetails(data);
        }
      }
    } catch (error: any) {
      console.error("Error creating category:", error);
      const errMsg = error?.response?.data?.message?.message || error?.response?.data?.message || error.message || 'Failed to create category.';
      Alert.alert('Error', typeof errMsg === 'string' ? errMsg : 'Failed to create category.');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagTitle.trim()) return;
    try {
      setIsSubmittingTag(true);
      const response = await api.post(
        "method/stridenex_app.stridenex_app.doctype.community.community.create_tag",
        { title: newTagTitle.trim() }
      );
      
      if (response?.data?.message?.success === false || response?.data?.success === false) {
        throw new Error(response?.data?.message?.message || response?.data?.message || "Failed to create tag");
      }

      const successMsg = response?.data?.message?.message || response?.data?.message || "Tag created successfully!";
      Alert.alert("Success", typeof successMsg === 'string' ? successMsg : "Tag created successfully!");
      setIsTagModalOpen(false);
      setNewTagTitle("");
      
      fetchCommunities();
      // refresh channel details
      if (selectedChannel) {
        handleCommunityClick(selectedChannel);
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message?.message || error?.response?.data?.message || error.message || "Failed to create tag";
      Alert.alert("Error", typeof errMsg === 'string' ? errMsg : "Failed to create tag");
    } finally {
      setIsSubmittingTag(false);
    }
  };

  const fetchPosts = async (catName: string) => {
    try {
      setIsFetchingPosts(true);
      const response = await getPosts({
        community: selectedChannel?.name || '',
        category: catName
      });
      if (response?.message?.success === false || response?.success === false) {
        throw new Error(response?.message?.message || response?.message || "Failed to fetch posts");
      }
      if (response?.data) {
        setPosts(response.data);
      } else if (response?.message?.data) {
        setPosts(response.message.data);
      }
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      const errMsg = error?.response?.data?.message?.message || error?.response?.data?.message || error.message || 'Failed to fetch posts.';
      Alert.alert('Error', typeof errMsg === 'string' ? errMsg : 'Failed to fetch posts.');
    } finally {
      setIsFetchingPosts(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchPosts(selectedCategory.category_name || selectedCategory.name);
    }
  }, [selectedCategory]);

  const handlePostClick = async (post: any) => {
    setSelectedPost(post);
    setPostDetails(null);
    setIsFetchingPostDetails(true);
    setNewComment("");
    setReplyingToCommentId("");
    try {
      const response = await getPostDetail({ post: post.name });
      if (response?.message?.data) {
        setPostDetails(response.message.data);
      } else if (response?.data?.data) {
        setPostDetails(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching post details:", error);
      Alert.alert('Error', 'Failed to load post details.');
    } finally {
      setIsFetchingPostDetails(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }
    try {
      setIsSubmittingComment(true);
      const studentEmail = await AsyncStorage.getItem("userEmail") || "";
      
      const response = await postComment({
        post: selectedPost.name,
        comment: newComment,
        parent_comment: replyingToCommentId,
        student: studentEmail
      });

      if (response?.message?.success === false || response?.success === false) {
        throw new Error(response?.message?.message || response?.message || "Failed to post comment");
      }

      setNewComment("");
      setReplyingToCommentId("");
      
      // Refresh post details
      const detailResponse = await getPostDetail({ post: selectedPost.name });
      if (detailResponse?.message?.data) {
        setPostDetails(detailResponse.message.data);
      } else if (detailResponse?.data?.data) {
        setPostDetails(detailResponse.data.data);
      }
    } catch (error: any) {
      console.error("Error posting comment:", error);
      Alert.alert('Error', error.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Post content cannot be empty');
      return;
    }
    try {
      setIsSubmittingPost(true);
      let email = await AsyncStorage.getItem('currentUser') || await AsyncStorage.getItem('userEmail') || await AsyncStorage.getItem('userName') || '';
      
      if (!email) {
        Alert.alert('Error', 'User not found. Please log in again.');
        setIsSubmittingPost(false);
        return;
      }

      const response = await createPost({
        community: selectedChannel?.name || '',
        user: email,
        content: newPostContent,
        post_type: "Text",
        category: selectedCategory.category_name || selectedCategory.name
      });
      
      if (response?.message?.success === false || response?.success === false) {
        throw new Error(response?.message?.message || response?.message || "Failed to create post");
      }

      const successMsg = response?.message?.message || response?.data?.message || "Post created successfully!";
      Alert.alert('Success', typeof successMsg === 'string' ? successMsg : "Post created successfully!");
      setNewPostContent("");
      // Refresh posts
      fetchPosts(selectedCategory.category_name || selectedCategory.name);
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errMsg = error?.response?.data?.message?.message || error?.response?.data?.message || error.message || 'Failed to create post.';
      Alert.alert('Error', typeof errMsg === 'string' ? errMsg : 'Failed to create post.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const filteredCommunities: Community[] = (communities || []).filter(c => 
    c.community_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedPost) {
    return (
      <SafeAreaView style={styles.forumContainer} edges={['top', 'bottom']}>
        <View style={styles.forumHeader}>
          <TouchableOpacity 
            onPress={() => setSelectedPost(null)} 
            style={styles.forumBackBtn}
          >
            <ArrowLeft size={20} color="#94A3B8" />
            <Text style={styles.forumBackTxt}>Back</Text>
          </TouchableOpacity>
          <View style={styles.forumTitleGroup}>
            <Text style={styles.forumTitle} numberOfLines={1}>
              Post Detail
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {isFetchingPostDetails ? (
            <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 40 }} />
          ) : postDetails ? (
            <View style={{ paddingBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>{postDetails.author}</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>{new Date(postDetails.posted_on).toLocaleString()}</Text>
              </View>
              
              <Text style={{ color: '#E2E8F0', lineHeight: 22, fontSize: 15, marginBottom: 16 }}>
                {postDetails.content}
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 24, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1F2023', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: postDetails.is_liked ? '#FF6B00' : '#64748B', fontSize: 18 }}>♥</Text>
                  <Text style={{ color: '#94A3B8', fontWeight: '600' }}>{postDetails.like_count} Likes</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={16} color="#64748B" />
                  <Text style={{ color: '#94A3B8', fontWeight: '600' }}>{postDetails.comment_count} Comments</Text>
                </View>
              </View>
              
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Comments</Text>
              {postDetails.comments && postDetails.comments.length > 0 ? (
                postDetails.comments.map((comment: any, idx: number) => (
                  <View key={idx} style={{ backgroundColor: '#1F2023', padding: 12, borderRadius: 12, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>{comment.comment_by || comment.student || "Anonymous"}</Text>
                      <Text style={{ color: '#94A3B8', fontSize: 10 }}>{new Date(comment.posted_on || comment.creation).toLocaleDateString()}</Text>
                    </View>
                    <Text style={{ color: '#CBD5E1', fontSize: 14, marginBottom: 8 }}>{comment.content}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#64748B', fontStyle: 'italic', textAlign: 'center', marginTop: 12 }}>No comments yet.</Text>
              )}
            </View>
          ) : (
            <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 40 }}>Failed to load post details.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (selectedCategory) {
    return (
      <SafeAreaView style={styles.forumContainer} edges={['top', 'bottom']}>
        {/* Thread Header */}
        <View style={styles.forumHeader}>
          <TouchableOpacity 
            onPress={() => setSelectedCategory(null)} 
            style={styles.forumBackBtn}
          >
            <ArrowLeft size={20} color="#94A3B8" />
            <Text style={styles.forumBackTxt}>Back</Text>
          </TouchableOpacity>
          <View style={styles.forumTitleGroup}>
            <Text style={styles.forumTitle} numberOfLines={1}>
              {selectedCategory.category_name || selectedCategory.name}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.forumBody} contentContainerStyle={{ paddingBottom: 32 }}>
          {isFetchingPosts ? (
            <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 40 }} />
          ) : posts.length > 0 ? (
            posts.map((post: any, idx: number) => (
              <TouchableOpacity 
                key={idx} 
                style={{ backgroundColor: '#121315', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1F2023', marginHorizontal: 16, marginTop: idx === 0 ? 16 : 0 }}
                onPress={() => handlePostClick(post)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{post.author || post.user || "User"}</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 12 }}>{new Date(post.posted_on || post.creation || Date.now()).toLocaleDateString()}</Text>
                </View>
                <Text style={{ color: '#E2E8F0', lineHeight: 20 }}>{post.content}</Text>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 12, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: post.is_liked ? '#FF6B00' : '#64748B', fontSize: 16 }}>♥</Text>
                    <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>{post.like_count || 0}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MessageSquare size={14} color="#64748B" />
                    <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>{post.comment_count || 0}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', marginTop: 40, padding: 24, borderWidth: 1, borderColor: '#1F2023', borderRadius: 12, borderStyle: 'dashed', marginHorizontal: 16 }}>
              <MessageSquare size={32} color="#475569" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>No posts yet</Text>
              <Text style={{ color: '#94A3B8', textAlign: 'center' }}>Be the first to start the discussion in this category!</Text>
            </View>
          )}
        </ScrollView>

        {/* Create Post Input Layer */}
        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#1F2023', backgroundColor: '#121315', flexDirection: 'row', alignItems: 'center' }}>
          <TextInput 
            value={newPostContent}
            onChangeText={setNewPostContent}
            placeholder={`Post in ${selectedCategory.category_name || selectedCategory.name}...`}
            placeholderTextColor="#475569"
            style={{ flex: 1, backgroundColor: '#0E0F10', borderWidth: 1, borderColor: '#1F2023', borderRadius: 24, paddingHorizontal: 16, height: 48, color: '#FFF' }}
          />
          <TouchableOpacity 
            onPress={handleCreatePost}
            disabled={isSubmittingPost || !newPostContent.trim()}
            style={{ marginLeft: 12, height: 48, paddingHorizontal: 20, borderRadius: 24, backgroundColor: (!newPostContent.trim() || isSubmittingPost) ? '#334155' : '#FF6B00', alignItems: 'center', justifyContent: 'center' }}
          >
            {isSubmittingPost ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedChannel) {
    return (
      <SafeAreaView style={styles.forumContainer} edges={['top', 'bottom']}>
        {/* Forum Header */}
        <View style={styles.forumHeader}>
          <TouchableOpacity 
            onPress={() => {
              setSelectedChannel(null);
              setChannelDetails(null);
            }} 
            style={styles.forumBackBtn}
          >
            <ArrowLeft size={20} color="#94A3B8" />
            <Text style={styles.forumBackTxt}>Back</Text>
          </TouchableOpacity>
          <View style={styles.forumTitleGroup}>
            <Text style={styles.forumTitle} numberOfLines={1}>
              {selectedChannel.community_name || selectedChannel.name}
            </Text>
          </View>

        </View>

        <ScrollView style={styles.forumBody} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Header Greeting Banner */}
          <View style={styles.forumGreetingCard}>
            <Text style={styles.forumGreetingTitle}>Welcome to discussions!</Text>
            <Text style={styles.forumGreetingSub}>
              {channelDetails?.description || selectedChannel.description || 'A space to collaborate, support each other, and grow.'}
            </Text>
          </View>

          {/* Categories Accordion */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              style={[styles.accordionHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Folder size={16} color="#FF6B00" />
                <Text style={styles.accordionTitle}>Categories</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity onPress={() => setIsCategoryModalOpen(true)}>
                  <Plus size={16} color="#94A3B8" />
                </TouchableOpacity>
                <Text style={styles.accordionArrow}>{isCategoriesExpanded ? "▼" : "▶"}</Text>
              </View>
            </TouchableOpacity>
            
              {isCategoriesExpanded && (
                <View style={styles.accordionContent}>
                  {!channelDetails ? (
                    <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 12 }} />
                  ) : (channelDetails.categories && channelDetails.categories.length > 0) ? (
                    channelDetails.categories.map((cat: any, idx: number) => (
                      <TouchableOpacity key={cat.name || idx} onPress={() => setSelectedCategory(cat)} style={[styles.accordionItem, { paddingVertical: 12 }]}>
                        <View style={[styles.accordionBullet, { backgroundColor: '#FF6B00' }]} />
                        <Text style={[styles.accordionItemText, { color: '#FFF', fontWeight: '500' }]}>{cat.category_name || cat.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noCategoriesText}>No categories defined</Text>
                  )}
                </View>
              )}
          </View>

          {/* Tags Accordion */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setIsTagsExpanded(!isTagsExpanded)}
              style={[styles.accordionHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Tag size={16} color="#FF6B00" />
                <Text style={styles.accordionTitle}>Tags</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity onPress={() => setIsTagModalOpen(true)}>
                  <Plus size={16} color="#94A3B8" />
                </TouchableOpacity>
                <Text style={styles.accordionArrow}>{isTagsExpanded ? "▼" : "▶"}</Text>
              </View>
            </TouchableOpacity>
            
            {isTagsExpanded && (
              <View style={[styles.accordionContent, { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 8 }]}>
                {!channelDetails ? (
                  <ActivityIndicator size="small" color="#FF6B00" />
                ) : (channelDetails.tags && channelDetails.tags.length > 0) ? (
                  channelDetails.tags.map((tag: any, idx: number) => (
                    <View key={tag.name || idx} style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>#{tag.title || tag.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#64748B', fontSize: 12 }}>No tags defined</Text>
                )}
              </View>
            )}
          </View>
          
           {/* Members Info */}
           <View style={styles.accordionContainer}>
             <View style={styles.accordionHeader}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <Users size={16} color="#FF6B00" />
                 <Text style={styles.accordionTitle}>Community Info</Text>
               </View>
             </View>
             <View style={styles.accordionContent}>
                <Text style={{ color: '#94A3B8', fontSize: 14 }}>
                   Members: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{channelDetails?.member_count || selectedChannel.member_count || 1}</Text>
                </Text>
                <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 6 }}>
                   Type: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{channelDetails?.community_type || selectedChannel.community_type || 'Public'}</Text>
                </Text>
                <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 6 }}>
                   Owner: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{channelDetails?.community_owner || selectedChannel.community_owner}</Text>
                </Text>
             </View>
           </View>

           {/* Members List Accordion */}
           <View style={styles.accordionContainer}>
             <TouchableOpacity 
               activeOpacity={0.7}
               onPress={() => setIsMembersExpanded(!isMembersExpanded)}
               style={styles.accordionHeader}
             >
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <Users size={16} color="#FF6B00" />
                 <Text style={styles.accordionTitle}>Members ({channelDetails?.members?.length || 0})</Text>
               </View>
               <Text style={styles.accordionArrow}>{isMembersExpanded ? "▼" : "▶"}</Text>
             </TouchableOpacity>
             
             {isMembersExpanded && (
               <View style={styles.accordionContent}>
                 {!channelDetails ? (
                   <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 12 }} />
                 ) : (channelDetails.members && channelDetails.members.length > 0) ? (
                   channelDetails.members.map((member: any, idx: number) => (
                      <React.Fragment key={member.name || idx}>
                        <View style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          gap: 12,
                          paddingVertical: 12,
                          borderBottomWidth: idx < channelDetails.members.length - 1 ? 1 : 0,
                          borderBottomColor: '#1F2023'
                        }}>
                          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} color="#94A3B8" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>{member.member || member.name}</Text>
                            <Text style={{ color: '#94A3B8', fontSize: 12 }}>Joined {member.joined_on || 'Recently'}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ backgroundColor: member.role === 'Admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: member.role === 'Admin' ? '#60A5FA' : '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {member.role || "Member"}
                              </Text>
                            </View>
                            <View style={{ backgroundColor: member.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: member.status === 'Approved' ? '#34D399' : '#FBBF24', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {member.status || "Pending"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </React.Fragment>
                   ))
                 ) : (
                   <Text style={styles.noCategoriesText}>No members found</Text>
                 )}
               </View>
             )}
           </View>
         </ScrollView>
        {/* Create Tag Modal */}
        <Modal 
          visible={isTagModalOpen} 
          transparent 
          animationType="fade" 
          onRequestClose={() => {
            setIsTagModalOpen(false);
            setNewTagTitle("");
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Tag</Text>
                <TouchableOpacity onPress={() => setIsTagModalOpen(false)} style={styles.closeButton}>
                  <X size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.formContainer}>
                <Text style={styles.label}>Tag Title *</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. react, help, bug"
                  placeholderTextColor="#64748B"
                  value={newTagTitle}
                  onChangeText={setNewTagTitle}
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  onPress={() => {
                    setIsTagModalOpen(false);
                    setNewTagTitle("");
                  }} 
                  style={styles.cancelButton}
                  disabled={isSubmittingTag}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleCreateTag} 
                  style={[styles.submitButton, isSubmittingTag && styles.submitButtonDisabled]}
                  disabled={isSubmittingTag}
                >
                  {isSubmittingTag ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Communities</Text>
          <Text style={styles.subtitle}>Connect and collaborate with peers.</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={() => setIsModalVisible(true)}>
          <Plus size={20} color="#FFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={"#3B82F6"} style={{ marginTop: 40 }} />
      ) : filteredCommunities.length > 0 ? (
        <ScrollView contentContainerStyle={styles.listContainer}>
            {filteredCommunities.map((community: any, index: number) => (
              <TouchableOpacity key={community.name || index} style={styles.card} onPress={() => handleCommunityClick(community)}>
                {isFetchingDetails && (selectedChannel as any)?.name === community.name && (
                  <View style={StyleSheet.absoluteFillObject}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator size="large" color={"#3B82F6"} />
                    </View>
                  </View>
                )}
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                  {community.community_type === 'Private' ? (
                    <Lock size={20} color={"#3B82F6"} />
                  ) : (
                    <Globe size={20} color={"#3B82F6"} />
                  )}
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{community.community_type || 'Public'}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{community.community_name}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {community.description || "No description provided."}
              </Text>
              <View style={styles.cardFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Users size={14} color={colors.text.secondary} />
                  <Text style={styles.memberText}>{community.member_count || 1} members</Text>
                </View>
                <TouchableOpacity 
                   onPress={() => handleJoinChannel(community)}
                   style={[
                     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
                     { backgroundColor: (joinedChannels.includes(community.name) || community.action === 'leave') ? "#3B82F6" : 'transparent', borderWidth: 1, borderColor: "#3B82F6" }
                   ]}
                 >
                   <Text 
                     style={[
                       { fontSize: 12, fontWeight: 'bold' },
                       { color: (joinedChannels.includes(community.name) || community.action === 'leave') ? '#FFFFFF' : "#3B82F6" }
                     ]}
                   >
                     {community.action === 'leave' || joinedChannels.includes(community.name) ? 'Joined' : 'Join'}
                   </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Users size={48} color={colors.text.secondary} />
          <Text style={styles.emptyTitle}>No communities found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try adjusting your search terms.' : "You haven't created or joined any communities yet."}
          </Text>
        </View>
      )}

      {/* Create Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Community</Text>
              <TouchableOpacity onPress={() => !isSubmitting && setIsModalVisible(false)} style={styles.closeButton}>
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.label}>Community Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. React Developers"
                value={formData.community_name}
                onChangeText={(text) => setFormData({...formData, community_name: text})}
              />
              
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is this community about?"
                multiline
                numberOfLines={3}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                textAlignVertical="top"
              />
              
              <Text style={styles.label}>Privacy Type</Text>
              <View style={styles.typeButtonsRow}>
                <TouchableOpacity
                  style={[styles.typeButton, formData.community_type === 'Public' && styles.typeButtonActive]}
                  onPress={() => setFormData({...formData, community_type: 'Public'})}
                >
                  <Globe size={16} color={formData.community_type === 'Public' ? "#3B82F6" : colors.text.secondary} />
                  <Text style={[styles.typeButtonText, formData.community_type === 'Public' && styles.typeButtonTextActive]}>Public</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, formData.community_type === 'Private' && styles.typeButtonActive]}
                  onPress={() => setFormData({...formData, community_type: 'Private'})}
                >
                  <Lock size={16} color={formData.community_type === 'Private' ? "#3B82F6" : colors.text.secondary} />
                  <Text style={[styles.typeButtonText, formData.community_type === 'Private' && styles.typeButtonTextActive]}>Private</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setIsModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
                onPress={handleCreateCommunity}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Category Modal */}
      <Modal visible={isCategoryModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Category</Text>
              <TouchableOpacity onPress={() => !isSubmittingCategory && setIsCategoryModalOpen(false)} style={styles.closeButton}>
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.label}>Category Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Technology"
                value={formDataCategory.category_name}
                onChangeText={(text) => setFormDataCategory({...formDataCategory, category_name: text})}
                placeholderTextColor={colors.text.secondary}
              />
              
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is this category about?"
                value={formDataCategory.description}
                onChangeText={(text) => setFormDataCategory({...formDataCategory, description: text})}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={colors.text.secondary}
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setIsCategoryModalOpen(false)}
                disabled={isSubmittingCategory}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmittingCategory && styles.submitButtonDisabled]} 
                onPress={handleCreateCategory}
                disabled={isSubmittingCategory}
              >
                {isSubmittingCategory ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: typography.fontWeight.semibold,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontWeight: typography.fontWeight.medium,
    fontSize: 14,
    color: colors.text.primary,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 29, 149, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 6,
  },
  memberText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  textArea: {
    height: 100,
  },
  typeButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(76, 29, 149, 0.05)',
    borderColor: "#3B82F6",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  typeButtonTextActive: {
    color: "#3B82F6",
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
  },
  forumContainer: {
    flex: 1,
    backgroundColor: '#0E0F10',
  },
  forumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2023',
    backgroundColor: '#121315',
  },
  forumBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  forumBackTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  forumTitleGroup: {
    flex: 1,
    alignItems: 'center',
  },
  forumTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    maxWidth: 160,
  },
  forumBody: {
    flex: 1,
    padding: 16,
  },
  forumGreetingCard: {
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.1)',
    marginBottom: 20,
  },
  forumGreetingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  forumGreetingSub: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
  },
  accordionContainer: {
    backgroundColor: '#121315',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2023',
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#16171A',
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accordionArrow: {
    fontSize: 10,
    color: '#64748B',
  },
  accordionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2023',
  },
  accordionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  accordionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  accordionItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  noCategoriesText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  tagBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
