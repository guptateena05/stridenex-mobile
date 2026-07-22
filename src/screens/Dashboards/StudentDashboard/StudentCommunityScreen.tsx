import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList, TextInput, ActivityIndicator, RefreshControl, Modal, BackHandler, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Search, 
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Zap,
  ArrowLeft,
  Folder,
  Tag,
  Plus,
  Send,
  Sparkles,
  MessageCircle,
  Paperclip,
  X,
  FileText
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { listChannels, joinChannel, getCategoryList, listMessages, leaveChannel, sendMessage, getReplies, getTags, createTag } from '@/api/student.services';
import * as DocumentPicker from '@react-native-documents/picker';

const categoryColors: Record<string, string> = {
  Open: "#10B981",
  Public: "#3B82F6",
  Private: "#8B5CF6",
  Technical: "#3B82F6",
  Startup: "#F59E0B",
  Research: "#8B5CF6",
  Business: "#10B981",
  Design: "#EC4899",
  Placements: "#F97316"
};

const formatChannelNameStr = (name: string): string => {
  if (!name) return "";
  if (name.includes(" _ ")) {
    return name
      .split(" _ ")
      .map((part) => {
        const username = part.split("@")[0];
        return username
          .split(/[._-]/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      })
      .join(" & ");
  }
  return name
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getFallbackIcon = (name: string, type: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("code") || lower.includes("python") || lower.includes("dsa") || lower.includes("dev")) return "💻";
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui") || lower.includes("art")) return "🎨";
  if (lower.includes("startup") || lower.includes("founder") || lower.includes("entrepreneur")) return "🚀";
  if (lower.includes("research") || lower.includes("ml") || lower.includes("ai")) return "🧠";
  if (lower.includes("placement") || lower.includes("job") || lower.includes("career")) return "💼";
  if (lower.includes("general")) return "💬";
  
  if (type === "Private") return "🔒";
  return "🌐";
};

const fallbackCommunities = [
  { id: "1", name: "DSA & Competitive Coding", members: "4.8k", online: 312, category: "Technical", icon: "💻", color: "#3B82F6" },
  { id: "2", name: "Startup Founders India", members: "2.1k", online: 178, category: "Startup", icon: "🚀", color: "#F59E0B" },
  { id: "3", name: "ML/AI Research Hub", members: "3.6k", online: 247, category: "Research", icon: "🧠", color: "#8B5CF6" },
  { id: "4", name: "MBA & Business Strategy", members: "1.8k", online: 134, category: "Business", icon: "📊", color: "#10B981" },
  { id: "5", name: "Design & UX Circle", members: "1.2k", online: 98, category: "Design", icon: "🎨", color: "#EC4899" },
  { id: "6", name: "Campus Placements 2025", members: "8.9k", online: 560, category: "Placements", icon: "💼", color: "#F97316" },
];

const feedPosts = [
  {
    id: "1",
    author: "Riya S.",
    initials: "RS",
    community: "DSA & Competitive Coding",
    timestamp: "2h ago",
    content: "Just cracked my first LeetCode Hard — Binary Search on Answer pattern. Sharing approach 🎉",
    likes: 48,
    comments: 12
  },
  {
    id: "2",
    author: "Arjun M.",
    initials: "AM",
    community: "Startup Founders India",
    timestamp: "5h ago",
    content: "We just closed our seed round! Key lesson: build with users, not for users. 🚀",
    likes: 124,
    comments: 34
  },
  {
    id: "3",
    author: "Priya K.",
    initials: "PK",
    community: "ML/AI Research Hub",
    timestamp: "1d ago",
    content: "RAG vs fine-tuning for domain-specific tasks — traditional FT still wins in my experiments. Thoughts?",
    likes: 67,
    comments: 21
  }
];

export const StudentCommunityScreen = ({ navigation }: any) => {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [joinedChannels, setJoinedChannels] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');

  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);

  useEffect(() => {
    navigation?.setOptions({ headerShown: !selectedChannel });
  }, [selectedChannel, navigation]);

  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState<boolean>(true);

  const [tagsList, setTagsList] = useState<any[]>([]);
  const [tagsLoading, setTagsLoading] = useState<boolean>(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState<boolean>(false);
  const [newTagTitle, setNewTagTitle] = useState<string>("");
  const [isCreatingTag, setIsCreatingTag] = useState<boolean>(false);

  const fetchTags = async () => {
    try {
      setTagsLoading(true);
      const res = await getTags();
      const list = res?.message?.data || res?.data?.message?.data || (Array.isArray(res?.message) ? res.message : []);
      setTagsList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error loading tags list:", err);
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChannel?.id) {
      fetchTags();
    } else {
      setTagsList([]);
    }
  }, [selectedChannel?.id]);

  const handleMobileCreateTag = async () => {
    if (!newTagTitle.trim()) return;
    try {
      setIsCreatingTag(true);
      await createTag(newTagTitle.trim());
      setShowCreateTagModal(false);
      setNewTagTitle("");
      fetchTags();
    } catch (err) {
      console.error("Error creating tag on mobile:", err);
    } finally {
      setIsCreatingTag(false);
    }
  };


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await getCategoryList(selectedChannel.id);
        const list = res?.message || res?.data || [];
        setCategoriesList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error loading categories list:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    if (selectedChannel?.id) {
      fetchCategories();
    } else {
      setCategoriesList([]);
    }
  }, [selectedChannel?.id]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(true);
  const [repliesLoading, setRepliesLoading] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<"categories" | "discussions">("categories");
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [forumSearch, setForumSearch] = useState<string>("");
  const [replyText, setReplyText] = useState<string>("");
  const [replyFile, setReplyFile] = useState<any | null>(null);
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);

  const handlePickReplyFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.allFiles],
        allowMultiSelection: false,
      });

      if (result) {
        const file = Array.isArray(result) ? result[0] : result;

        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert('File Size Error', 'File size should be less than 10MB');
          return;
        }

        const fileObject = {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: file.name || 'image.jpg',
          size: file.size,
        };

        setReplyFile(fileObject);
        if (file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          setReplyImagePreview(file.uri);
        } else {
          setReplyImagePreview(null);
        }
      }
    } catch (err: any) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED' || err.code === 'CANCELED') {
        console.log('User cancelled file picker');
      } else {
        console.error('Error picking file:', err);
        Alert.alert('Error', 'Failed to pick file. Please try again.');
      }
    }
  };

  const handleRemoveReplyFile = () => {
    setReplyFile(null);
    setReplyImagePreview(null);
  };
  const [forumCategories, setForumCategories] = useState<any>({
    Community: {
      name: "Community",
      description: "Discussions about where we come together, how we collaborate, finding each other.",
      color: "#0091FF",
      subtags: ["Introductions", "News", "Events"],
      topicsPerMonth: "1/mo",
      posts: [
        {
          id: "c1",
          title: "Contributions Review Spring Cleaning Hackathon",
          author: "Alex Rivera",
          timeAgo: "2d",
          likes: 12,
          comments: 4,
          content: "Hey everyone! Let's get together for our monthly hackathon. We'll be reviewing code and cleaning up our open issues.",
          replies: [
            { author: "Sarah Jenkins", content: "Count me in! I'll focus on frontend issues.", time: "1d ago" },
            { author: "Vikram Shah", content: "I can help review PRs for the core library.", time: "12h ago" }
          ]
        },
        {
          id: "c2",
          title: "PXC: A New Approach to Interactive Learning Content",
          author: "Prof. Clara",
          timeAgo: "19d",
          likes: 24,
          comments: 8,
          content: "Sharing our latest study on interactive learning frameworks. This model has shown a 30% increase in student engagement.",
          replies: []
        }
      ]
    },
    "Site Operators": {
      name: "Site Operators",
      description: "Discussion about running platforms, setting up servers, configurations.",
      color: "#00E676",
      subtags: ["Site Operations Help", "Tutor Help"],
      topicsPerMonth: "14/mo",
      posts: [
        {
          id: "s1",
          title: "📌 How to get help",
          author: "System Admin",
          timeAgo: "Aug 2019",
          likes: 45,
          comments: 0,
          content: "Before creating a support ticket, please verify your logs and check the documentation wiki.",
          replies: []
        },
        {
          id: "s2",
          title: "How to enable Special Exams in Studio?",
          author: "Elena Rostova",
          timeAgo: "22h",
          likes: 6,
          comments: 1,
          content: "I'm trying to set up timed and proctored exams. Where do I toggle this feature in the advanced settings?",
          replies: [
            { author: "Tutor Bot", content: "You need to add 'proctoring' to the Advanced Settings array in Studio.", time: "18h ago" }
          ]
        }
      ]
    },
    Educators: {
      name: "Educators",
      description: "Educators' discussion: course creation, learning theory, organizational logistics.",
      color: "#D500F9",
      subtags: ["Instructional Design", "Authoring"],
      topicsPerMonth: "4/mo",
      posts: [
        {
          id: "e1",
          title: "Open edX for IT infrastructure and DevOps training",
          author: "Dr. Rachel",
          timeAgo: "10d",
          likes: 19,
          comments: 3,
          content: "How are you structured labs for hands-on shell practice inside the LMS? Suggestions appreciated.",
          replies: []
        }
      ]
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryQuestions, setCategoryQuestions] = useState<Record<string, any[]>>({});
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  const processApiMessages = (allMsgs: any[], catName: string): any[] => {
    const questions = allMsgs.filter(m => !m.is_reply && !m.linked_message);
    const replies = allMsgs.filter(m => m.is_reply || m.linked_message);
    
    return questions.map(q => {
      const textContent = stripHtml(q.text || "");
      const title = textContent.split("\n")[0] || "Untitled Question";
      const displayTitle = title.length > 80 ? title.substring(0, 80) + "..." : title;
      
      const qReplies = replies
        .filter(r => r.linked_message === q.name)
        .map(r => {
          const fileUrl = r.file_url || r.attached_file || r.file || r.attachment;
          return {
            author: r.owner ? r.owner.split("@")[0].split(/[._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Anonymous",
            content: stripHtml(r.text || ""),
            time: r.creation ? r.creation.substring(0, 16) : "Just now",
            fileUrl: fileUrl,
            fileName: r.file_name || (fileUrl ? fileUrl.split("/").pop() : undefined),
            isImage: fileUrl ? !!fileUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) : false
          };
        });

      return {
        id: q.name,
        title: displayTitle,
        author: q.owner ? q.owner.split("@")[0].split(/[._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Anonymous",
        timeAgo: q.creation ? q.creation.substring(0, 16) : "Recent",
        likes: q.likes || Math.floor(Math.random() * 15) + 2,
        comments: qReplies.length,
        content: textContent,
        category: catName,
        replies: qReplies,
        tags: ["api-integrated", q.message_type || "Question"]
      };
    });
  };

  const fetchCategoryQuestions = useCallback(async (catName: string) => {
    if (!selectedChannel?.id) return;
    try {
      setApiLoading(true);
      const res = await listMessages(selectedChannel.id, catName);
      const list = res?.message || res?.data || [];
      const posts = processApiMessages(list, catName);
      setCategoryQuestions(prev => ({
        ...prev,
        [catName]: posts
      }));
    } catch (err) {
      console.error("Error loading category messages:", err);
      setCategoryQuestions(prev => {
        if (!prev[catName]) {
          return {
            ...prev,
            [catName]: forumCategories[catName]?.posts || []
          };
        }
        return prev;
      });
    } finally {
      setApiLoading(false);
    }
  }, [selectedChannel?.id, forumCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryQuestions(selectedCategory);
    }
  }, [selectedCategory, fetchCategoryQuestions]);

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  const isApiPostId = (id: string) => {
    if (!id) return false;
    if (id.startsWith("p_") || id.startsWith("feed_")) return false;
    if (id === "c1" || id === "c2" || id === "s1" || id === "s2" || id === "e1" || id === "e2") return false;
    return true;
  };

  const handleSelectPost = async (post: any) => {
    setSelectedPost(post);
    if (post && post.id && isApiPostId(post.id)) {
      try {
        setRepliesLoading(true);
        const res = await getReplies(post.id);
        const list = res?.message?.replies || res?.data?.message?.replies || (Array.isArray(res?.message) ? res.message : (Array.isArray(res?.data) ? res.data : []));
        if (Array.isArray(list)) {
          const apiReplies = list.map((r: any) => {
            const fileUrl = r.file_url || r.attached_file || r.file || r.attachment;
            return {
              author: r.owner ? r.owner.split("@")[0].split(/[._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Anonymous",
              content: stripHtml(r.text || ""),
              time: r.creation ? r.creation.substring(0, 16) : "Just now",
              fileUrl: fileUrl,
              fileName: r.file_name || (fileUrl ? fileUrl.split("/").pop() : undefined),
              isImage: fileUrl ? !!fileUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) : false
            };
          });
          setSelectedPost((prev: any) => prev && prev.id === post.id ? {
            ...prev,
            replies: apiReplies,
            comments: apiReplies.length
          } : prev);
        }
      } catch (err) {
        console.error("Error fetching replies in mobile:", err);
      } finally {
        setRepliesLoading(false);
      }
    }
  };

  const fetchChannelMessages = useCallback(async () => {
    if (!selectedChannel?.id) return;
    try {
      setMessagesLoading(true);
      const res = await listMessages(selectedChannel.id);
      const list = res?.message || res?.data || [];
      setMessages(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  }, [selectedChannel?.id]);

  useEffect(() => {
    if (activeSubTab === "discussions" && selectedChannel?.id) {
      fetchChannelMessages();
    }
  }, [activeSubTab, selectedChannel?.id, fetchChannelMessages]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTopicTitle, setNewTopicTitle] = useState<string>("");
  const [newTopicContent, setNewTopicContent] = useState<string>("");
  const [newTopicCategory, setNewTopicCategory] = useState<string>("Community");



  const fetchCommunityChannels = async () => {
    try {
      const data = await listChannels();
      if (data && data.message) {
        const mapped = data.message.map((channel: any) => {
          const prettyName = formatChannelNameStr(channel.channel_name);
          const cat = channel.type || "Public";
          return {
            id: channel.name,
            name: prettyName,
            members: channel.member_count !== undefined ? String(channel.member_count) : "0",
            category: cat,
            icon: getFallbackIcon(channel.channel_name, cat),
            color: categoryColors[cat] || "#3B82F6",
            messageCount: channel.message_count !== undefined ? channel.message_count : 0,
          };
        });
        setChannels(mapped);
      }
    } catch (error) {
      console.error("Error loading channels:", error);
    }
  };

  const loadData = async (showIndicator = true) => {
    if (showIndicator) setLoading(true);
    await fetchCommunityChannels();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [selectedPost, selectedCategory, selectedChannel]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommunityChannels();
    setRefreshing(false);
  };

  const handleJoinChannel = async (channelId: string) => {
    const isAlreadyJoined = joinedChannels.includes(channelId);
    const commObj = activeList.find(c => c.id === channelId);

    if (isAlreadyJoined) {
      setSelectedChannel(commObj || { id: channelId, name: channelId, category: "Public" });
      return;
    }

    try {
      await joinChannel(channelId);
      setJoinedChannels((prev) => [...prev, channelId]);
      setSelectedChannel(commObj || { id: channelId, name: channelId, category: "Public" });
    } catch (error) {
      console.error("Error joining channel:", error);
    }
  };

  const handleLeaveChannel = async () => {
    if (!selectedChannel) return;
    try {
      const channelId = selectedChannel.id;
      await leaveChannel(channelId);
      setJoinedChannels((prev) => prev.filter(id => id !== channelId));
      setSelectedChannel(null);
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  };

  const activeList = channels.length > 0 ? channels : fallbackCommunities;
  const filteredList = activeList.filter(community => 
    community.name.toLowerCase().includes(search.toLowerCase()) ||
    (community.category && community.category.toLowerCase().includes(search.toLowerCase()))
  );

  if (selectedChannel) {
    const allPosts = Object.values(forumCategories).flatMap((cat: any) => 
      cat.posts.map((post: any) => ({ ...post, category: cat.name, color: cat.color }))
    );

    const filteredPosts = allPosts.filter((p: any) => 
      p.title.toLowerCase().includes(forumSearch.toLowerCase()) || 
      p.content.toLowerCase().includes(forumSearch.toLowerCase())
    );

    const handleCreateTopic = () => {
      if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
      const newPostObj = {
        id: `p_${Date.now()}`,
        title: newTopicTitle,
        author: "You (Student)",
        timeAgo: "Just now",
        likes: 1,
        comments: 0,
        content: newTopicContent,
        replies: []
      };

      setForumCategories((prev: any) => ({
        ...prev,
        [newTopicCategory]: {
          ...prev[newTopicCategory],
          posts: [newPostObj, ...prev[newTopicCategory].posts]
        }
      }));

      setNewTopicTitle("");
      setNewTopicContent("");
      setShowCreateModal(false);
    };

    const handleReplyToPost = async () => {
      if ((!replyText.trim() && !replyFile) || !selectedPost) return;
      
      const postId = selectedPost.id;
      const categoryName = selectedCategory || selectedPost.category || "Community";
      
      let newReply: any = {
        author: "You (Student)",
        content: replyText,
        time: "Just now",
        ...(replyFile ? {
          fileUrl: replyFile.uri,
          fileName: replyFile.name,
          isImage: replyFile.type?.startsWith('image/') || replyFile.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        } : {})
      };

      try {
        const payload: any = {
          channel_id: selectedChannel.id,
          reply_to_message: selectedPost.content || selectedPost.title || postId,
          channel_category: categoryName,
          text: replyText
        };
        if (replyFile) {
          payload.file = replyFile;
        }

        const res = await sendMessage(payload);
        const msg = res?.message || res?.data?.message || res?.data;
        if (msg) {
          const fileUrl = msg.file_url || msg.attached_file || msg.file || replyFile?.uri;
          newReply = {
            author: msg.owner ? msg.owner.split("@")[0].split(/[._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "You (Student)",
            content: stripHtml(msg.text || ""),
            time: msg.creation ? msg.creation.substring(0, 16) : "Just now",
            ...(fileUrl ? {
              fileUrl,
              fileName: msg.file_name || replyFile?.name || "Attached File",
              isImage: !!(fileUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) || replyFile?.type?.startsWith('image/'))
            } : {})
          };
        }
      } catch (err) {
        console.error("Error sending reply on mobile:", err);
      }

      // Update local states
      setCategoryQuestions((prev: any) => {
        const catQuestions = prev[categoryName] || [];
        const updated = catQuestions.map((p: any) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments + 1,
              replies: [...p.replies, newReply]
            };
          }
          return p;
        });
        return {
          ...prev,
          [categoryName]: updated
        };
      });

      // Maintain forumCategories state for safety/fallback
      setForumCategories((prev: any) => {
        const cat = prev[categoryName];
        if (cat) {
          const updated = cat.posts.map((p: any) => {
            if (p.id === postId) {
              return {
                ...p,
                comments: p.comments + 1,
                replies: [...p.replies, newReply]
              };
            }
            return p;
          });
          return {
            ...prev,
            [categoryName]: {
              ...cat,
              posts: updated
            }
          };
        }
        return prev;
      });

      setSelectedPost((prev: any) => prev ? {
        ...prev,
        comments: prev.comments + 1,
        replies: [...prev.replies, newReply]
      } : null);

      setReplyText("");
      setReplyFile(null);
      setReplyImagePreview(null);
    };

    return (
      <SafeAreaView style={styles.forumContainer} edges={['top', 'bottom']}>
        {/* Forum Header */}
        <View style={styles.forumHeader}>
          <TouchableOpacity 
            onPress={() => {
              if (selectedPost) {
                setSelectedPost(null);
              } else if (selectedCategory) {
                setSelectedCategory(null);
              } else {
                setSelectedChannel(null);
              }
            }} 
            style={styles.forumBackBtn}
          >
            <ArrowLeft size={20} color="#94A3B8" />
            <Text style={styles.forumBackTxt}>Back</Text>
          </TouchableOpacity>
          <View style={styles.forumTitleGroup}>
            <Text style={styles.forumTitle} numberOfLines={1}>
              {selectedPost ? "Discussion" : (selectedCategory || selectedChannel.name)}
            </Text>
          </View>
          {!selectedPost && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity 
                onPress={handleLeaveChannel} 
                style={[styles.createTopicBtn, { backgroundColor: '#EF4444', paddingHorizontal: 10 }]}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>Leave</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowCreateModal(true)} 
                style={styles.createTopicBtn}
              >
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {selectedPost ? (
          /* Post Detail View */
          <ScrollView style={styles.forumBody} contentContainerStyle={{ paddingBottom: 32 }}>
            <View style={styles.forumPostCard}>
              <View style={styles.forumPostHeader}>
                <View style={styles.forumAuthorAvatar}>
                  <Text style={styles.forumAuthorAvatarText}>
                    {selectedPost.author.substring(0, 2)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.forumPostAuthor}>{selectedPost.author}</Text>
                  <Text style={styles.forumPostTime}>{selectedPost.timeAgo}</Text>
                </View>
              </View>
              <Text style={styles.forumPostTitleDetail}>{selectedPost.title}</Text>
              <Text style={styles.forumPostContentDetail}>{selectedPost.content}</Text>
              
              <View style={styles.forumPostFooter}>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedPost((prev: any) => prev ? { ...prev, likes: prev.likes + 1 } : null);
                  }}
                  style={styles.forumActionItem}
                >
                  <Heart size={14} color="#EF4444" fill="#EF4444" />
                  <Text style={styles.forumActionText}>{selectedPost.likes} Likes</Text>
                </TouchableOpacity>
                <View style={styles.forumActionItem}>
                  <MessageSquare size={14} color="#94A3B8" />
                  <Text style={styles.forumActionText}>{selectedPost.comments} Replies</Text>
                </View>
              </View>
            </View>

            {/* Replies List */}
            <Text style={styles.repliesTitleHeader}>Replies</Text>
            {repliesLoading ? (
              <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 20 }} />
            ) : selectedPost.replies.length === 0 ? (
              <View style={styles.noRepliesCard}>
                <Text style={styles.noRepliesText}>No replies yet. Be the first to start the conversation!</Text>
              </View>
            ) : (
              selectedPost.replies.map((reply: any, idx: number) => (
                <View key={idx} style={styles.replyCard}>
                  <View style={styles.replyHeader}>
                    <Text style={styles.replyAuthor}>{reply.author}</Text>
                    <Text style={styles.replyTime}>{reply.time}</Text>
                  </View>
                  {reply.content ? <Text style={styles.replyContent}>{reply.content}</Text> : null}
                  {(reply.fileUrl || reply.file || reply.image) && (
                    <View style={styles.replyAttachmentContainer}>
                      {reply.isImage || (typeof (reply.fileUrl || reply.image) === 'string' && (reply.fileUrl || reply.image).match(/\.(jpg|jpeg|png|gif|webp)/i)) ? (
                        <Image 
                          source={{ uri: reply.fileUrl || reply.image || reply.file?.uri }} 
                          style={styles.replyAttachedImage} 
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.replyAttachedFileBadge}>
                          <FileText size={14} color="#3B82F6" />
                          <Text style={styles.replyAttachedFileName} numberOfLines={1}>
                            {reply.fileName || reply.file?.name || 'Attached File'}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            )}

            {/* Selected File / Image Preview */}
            {replyFile && (
              <View style={styles.replyPreviewContainer}>
                {replyImagePreview ? (
                  <View style={styles.replyImagePreviewWrapper}>
                    <Image source={{ uri: replyImagePreview }} style={styles.replyImagePreviewThumbnail} />
                    <TouchableOpacity onPress={handleRemoveReplyFile} style={styles.removePreviewBtn}>
                      <X size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.replyFilePreviewWrapper}>
                    <FileText size={16} color="#3B82F6" />
                    <Text style={styles.replyFilePreviewName} numberOfLines={1}>
                      {replyFile.name}
                    </Text>
                    <TouchableOpacity onPress={handleRemoveReplyFile} style={styles.removePreviewBtn}>
                      <X size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Add Reply Input Block */}
            <View style={styles.replyInputBox}>
              <TouchableOpacity onPress={handlePickReplyFile} style={styles.attachBtn}>
                <Paperclip size={18} color={replyFile ? "#FF6B00" : "#94A3B8"} />
              </TouchableOpacity>
              <TextInput 
                placeholder="Write a reply..."
                placeholderTextColor="#64748B"
                value={replyText}
                onChangeText={setReplyText}
                style={styles.replyInputField}
              />
              <TouchableOpacity 
                onPress={handleReplyToPost} 
                style={[
                  styles.replySendBtn,
                  (!replyText.trim() && !replyFile) && { opacity: 0.5 }
                ]}
                disabled={!replyText.trim() && !replyFile}
              >
                <Send size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : selectedCategory ? (
          /* Category Detail View */
          <ScrollView style={styles.forumBody} contentContainerStyle={{ paddingBottom: 32 }}>
            <View style={styles.forumGreetingCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <View style={[styles.catColorIndicator, { backgroundColor: forumCategories[selectedCategory]?.color || '#3B82F6', width: 12, height: 12, borderRadius: 2 }]} />
                <Text style={[styles.forumGreetingTitle, { fontSize: 18 }]}>{selectedCategory}</Text>
              </View>
              <Text style={styles.forumGreetingSub}>{forumCategories[selectedCategory]?.description}</Text>
              
              <View style={styles.forumSearchBox}>
                <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder={`Search in ${selectedCategory}...`}
                  placeholderTextColor="#64748B"
                  value={forumSearch}
                  onChangeText={setForumSearch}
                  style={styles.forumSearchInput}
                />
              </View>
            </View>

            <View style={{ gap: 12, paddingHorizontal: 16 }}>
              {apiLoading ? (
                <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 30 }} />
              ) : (categoryQuestions[selectedCategory] || []).length === 0 ? (
                <Text style={styles.noCategoriesText}>No questions found in this category.</Text>
              ) : (
                (categoryQuestions[selectedCategory] || [])
                  .filter((p: any) => {
                    const matchesSearch = p.title.toLowerCase().includes(forumSearch.toLowerCase()) || 
                                         p.content.toLowerCase().includes(forumSearch.toLowerCase());
                    const matchesTag = !selectedTag || 
                                       (p.tags && p.tags.some((t: string) => t.toLowerCase() === selectedTag.toLowerCase())) ||
                                       p.content.toLowerCase().includes(selectedTag.toLowerCase()) ||
                                       p.title.toLowerCase().includes(selectedTag.toLowerCase());
                    return matchesSearch && matchesTag;
                  })
                  .map((post: any) => (
                    <TouchableOpacity 
                      key={post.id}
                      onPress={() => handleSelectPost(post)}
                      style={styles.listPostCard}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <View style={{ backgroundColor: '#FF6B0020', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: '#FF6B00', fontSize: 9, fontWeight: '700' }}>QUESTION</Text>
                        </View>
                        <Text style={{ color: '#64748B', fontSize: 10 }}>by {post.author} • {post.timeAgo}</Text>
                      </View>
                      <Text style={styles.listPostTitle}>{post.title}</Text>
                      <Text style={styles.listPostDesc} numberOfLines={2}>{post.content}</Text>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Heart size={12} color="#EF4444" fill="#EF4444" />
                          <Text style={{ color: '#64748B', fontSize: 10 }}>{post.likes}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MessageSquare size={12} color="#64748B" />
                          <Text style={{ color: '#64748B', fontSize: 10 }}>{post.comments} replies</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
              )}
            </View>
          </ScrollView>
        ) : (
          /* Forum Overview Screen */
          <ScrollView style={styles.forumBody} contentContainerStyle={{ paddingBottom: 32 }}>
            {/* Header Greeting Banner */}
            <View style={styles.forumGreetingCard}>
              <Text style={styles.forumGreetingTitle}>Welcome to discussions!</Text>
              <Text style={styles.forumGreetingSub}>A space to collaborate, support each other, and grow.</Text>
              
              <View style={styles.forumSearchBox}>
                <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search discussions..."
                  placeholderTextColor="#64748B"
                  value={forumSearch}
                  onChangeText={setForumSearch}
                  style={styles.forumSearchInput}
                />
              </View>
            </View>

            {/* Collapsible Categories Accordion (API Integrated) */}
            <View style={styles.accordionContainer}>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                style={styles.accordionHeader}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Folder size={16} color="#FF6B00" />
                  <Text style={styles.accordionTitle}>Categories</Text>
                </View>
                <Text style={styles.accordionArrow}>{isCategoriesExpanded ? "▼" : "▶"}</Text>
              </TouchableOpacity>
              
              {isCategoriesExpanded && (
                <View style={styles.accordionContent}>
                  {categoriesLoading ? (
                    <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 12 }} />
                  ) : categoriesList.length === 0 ? (
                    <Text style={styles.noCategoriesText}>No categories found</Text>
                  ) : (
                    categoriesList.map((cat, idx) => (
                      <TouchableOpacity 
                        key={cat.name || idx} 
                        onPress={() => setSelectedCategory(cat.category_name || cat.name)}
                        style={styles.accordionItem}
                      >
                        <View style={styles.accordionBullet} />
                        <Text style={styles.accordionItemText}>{cat.category_name || cat.name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            {/* Collapsible Tags Accordion */}
            <View style={styles.accordionContainer}>
              <View style={[styles.accordionHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => setIsTagsExpanded(!isTagsExpanded)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}
                >
                  <Tag size={16} color="#FF6B00" />
                  <Text style={styles.accordionTitle}>Tags</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity 
                    onPress={() => setShowCreateTagModal(true)}
                    style={{ padding: 4 }}
                  >
                    <Plus size={16} color="#94A3B8" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsTagsExpanded(!isTagsExpanded)}>
                    <Text style={styles.accordionArrow}>{isTagsExpanded ? "▼" : "▶"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {isTagsExpanded && (
                <View style={[styles.accordionContent, { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 8 }]}>
                  {tagsLoading ? (
                    <ActivityIndicator size="small" color="#FF6B00" />
                  ) : tagsList.length === 0 ? (
                    <Text style={{ color: '#64748B', fontSize: 12 }}>No tags found</Text>
                  ) : (
                    tagsList.map((tag) => {
                      const tagVal = tag.title || tag.name;
                      const isSelected = selectedTag === tagVal;
                      return (
                        <TouchableOpacity 
                          key={tag.name} 
                          onPress={() => setSelectedTag(isSelected ? null : tagVal)}
                          style={[
                            styles.tagBadge, 
                            isSelected && styles.tagBadgeActive
                          ]}
                        >
                          <Text style={[
                            styles.tagBadgeText,
                            isSelected && styles.tagBadgeTextActive
                          ]}>#{tagVal}</Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
            </View>

            {/* Sub-navigation tabs */}
            <View style={styles.forumSubTabs}>
              {(["categories", "discussions"] as const).map((tab) => (
                <TouchableOpacity 
                  key={tab}
                  onPress={() => setActiveSubTab(tab)}
                  style={[styles.forumSubTabButton, activeSubTab === tab && styles.forumSubTabButtonActive]}
                >
                  <Text style={[styles.forumSubTabButtonText, activeSubTab === tab && styles.forumSubTabButtonTextActive]}>
                    {tab === "discussions" ? "Discussions Feed" : "Categories"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {activeSubTab === "categories" && !forumSearch ? (
              /* Categories Board view matching edX */
              <View style={{ gap: 14, paddingHorizontal: 16 }}>
                {Object.values(forumCategories).map((cat: any) => (
                  <TouchableOpacity 
                    key={cat.name} 
                    onPress={() => setSelectedCategory(cat.name)}
                    style={styles.forumCategoryCard}
                  >
                    <View style={styles.catLeftBorder} />
                    <View style={styles.forumCategoryMain}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.catColorIndicator, { backgroundColor: cat.color }]} />
                        <Text style={styles.forumCategoryName}>{cat.name}</Text>
                      </View>
                      <Text style={styles.forumCategoryDesc}>{cat.description}</Text>
                      
                      <View style={styles.forumCategoryTags}>
                        {cat.subtags.map((sub: string) => (
                          <View key={sub} style={styles.forumSubtagBadge}>
                            <Text style={styles.forumSubtagText}>{sub}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Latest Topics inside Category */}
                      <View style={styles.categoryLatestHeader}>
                        <Text style={styles.categoryLatestLabel}>Latest Topics ({cat.topicsPerMonth})</Text>
                      </View>
                      <View style={{ gap: 8, marginTop: 4 }}>
                        {cat.posts.map((post: any) => (
                          <TouchableOpacity 
                            key={post.id}
                            onPress={() => handleSelectPost(post)}
                            style={styles.catPostRow}
                          >
                            <Text style={styles.catPostTitle} numberOfLines={1}>• {post.title}</Text>
                            <Text style={styles.catPostTime}>{post.timeAgo}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              /* Discussions Feed (API Integrated) */
              <View style={{ gap: 12, paddingHorizontal: 16 }}>
                {messagesLoading ? (
                  <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 20 }} />
                ) : messages.length === 0 ? (
                  <Text style={styles.noCategoriesText}>No discussions started yet.</Text>
                ) : (
                  messages.filter(msg => {
                    const cleanedText = stripHtml(msg.text);
                    const matchesSearch = cleanedText.toLowerCase().includes(forumSearch.toLowerCase()) || msg.owner.toLowerCase().includes(forumSearch.toLowerCase());
                    const matchesTag = !selectedTag || cleanedText.toLowerCase().includes(selectedTag.toLowerCase());
                    return matchesSearch && matchesTag;
                  }).map((msg, index) => (
                    <View 
                      key={msg.name || index} 
                      style={styles.listPostCard}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <View style={[styles.catColorIndicator, { backgroundColor: msg.message_type === 'System' ? '#64748B' : '#FF6B00' }]} />
                        <Text style={styles.listPostCat}>{msg.message_type || 'Text'}</Text>
                        <Text style={{ color: '#475569', fontSize: 10 }}>•</Text>
                        <Text style={styles.listPostAuthorMeta}>by {msg.owner} • {msg.creation}</Text>
                      </View>
                      <Text style={styles.listPostDesc}>{stripHtml(msg.text)}</Text>
                    </View>
                  ))
                )}
              </View>
            )}

          </ScrollView>
        )}

        {/* Create Topic Modal */}
        <Modal 
          visible={showCreateModal} 
          transparent 
          animationType="slide" 
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Topic</Text>
              
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput 
                placeholder="What is your topic about?"
                placeholderTextColor="#64748B"
                value={newTopicTitle}
                onChangeText={setNewTopicTitle}
                style={styles.modalInput}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.selectBox}>
                {Object.keys(forumCategories).map(name => (
                  <TouchableOpacity 
                    key={name}
                    onPress={() => setNewTopicCategory(name)}
                    style={[styles.selectOption, newTopicCategory === name && styles.selectOptionActive]}
                  >
                    <Text style={[styles.selectOptionText, newTopicCategory === name && styles.selectOptionTextActive]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput 
                placeholder="Share more details, questions, or resources..."
                placeholderTextColor="#64748B"
                value={newTopicContent}
                onChangeText={setNewTopicContent}
                multiline
                numberOfLines={4}
                style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreateTopic} style={styles.modalSubmitBtn}>
                  <Text style={styles.modalSubmitBtnText}>Publish</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Create Tag Modal */}
        <Modal 
          visible={showCreateTagModal} 
          transparent 
          animationType="fade" 
          onRequestClose={() => {
            setShowCreateTagModal(false);
            setNewTagTitle("");
          }}
        >
          <View style={styles.modalBg}>
            <View style={[styles.modalContent, { maxWidth: 300 }]}>
              <Text style={styles.modalTitle}>Create New Tag</Text>
              
              <Text style={styles.inputLabel}>Tag Title</Text>
              <TextInput 
                placeholder="e.g. react, help, bug"
                placeholderTextColor="#64748B"
                value={newTagTitle}
                onChangeText={setNewTagTitle}
                style={styles.modalInput}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowCreateTagModal(false);
                    setNewTagTitle("");
                  }} 
                  style={styles.modalCancelBtn}
                  disabled={isCreatingTag}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleMobileCreateTag} 
                  style={[styles.modalSubmitBtn, isCreatingTag && { opacity: 0.5 }]}
                  disabled={isCreatingTag}
                >
                  <Text style={styles.modalSubmitBtnText}>
                    {isCreatingTag ? "Creating..." : "Create"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

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
          <View style={styles.headerBadge}>
            <Users size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>STUDENT ECOSYSTEM</Text>
          </View>
          <Text style={styles.title}>Communities</Text>
          <Text style={styles.subtitle}>Join peer groups and share knowledge</Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.searchContainer}>
          <Search size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search communities, threads..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.filterButton}>
             <TrendingUp size={14} color="#64748B" />
          </TouchableOpacity>
        </Animated.View>

        {/* Popular Communities Section */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitleSimple}>Popular Communities</Text>
           <TouchableOpacity>
              <Text style={styles.viewAllText}>Browse All</Text>
           </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          </View>
        ) : filteredList.length === 0 ? (
          <View style={{ height: 160, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, marginHorizontal: 4, borderWidth: 1.5, borderColor: '#F1F5F9' }}>
            <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600' }}>No communities found</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalContent}
          >
            {filteredList.map((community, index) => (
              <Animated.View 
                key={community.id} 
                entering={FadeInRight.delay(200 + index * 100)}
              >
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => handleJoinChannel(community.id)}
                  style={styles.communityCard}
                >
                   <View style={[styles.communityIconContainer, { backgroundColor: `${community.color}10` }]}>
                      <Text style={styles.communityEmoji}>{community.icon}</Text>
                   </View>
                   <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
                   <View style={styles.communityStats}>
                      <Text style={styles.communityMembers}>{community.members} Members</Text>
                      {community.messageCount !== undefined ? (
                         <View style={styles.onlineContainer}>
                            <MessageSquare size={10} color="#94A3B8" />
                            <Text style={[styles.onlineText, { color: '#64748B' }]}>{community.messageCount} msgs</Text>
                         </View>
                      ) : (
                         <View style={styles.onlineContainer}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineText}>{community.online}</Text>
                         </View>
                      )}
                   </View>
                   <TouchableOpacity 
                     onPress={() => handleJoinChannel(community.id)}
                     style={[
                       styles.joinButton, 
                       { 
                         borderColor: community.color,
                         backgroundColor: joinedChannels.includes(community.id) ? community.color : 'transparent'
                       }
                     ]}
                   >
                      <Text 
                        style={[
                          styles.joinButtonText, 
                          { color: joinedChannels.includes(community.id) ? '#FFFFFF' : community.color }
                        ]}
                      >
                        {joinedChannels.includes(community.id) ? 'Joined' : 'Join'}
                      </Text>
                   </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        )}

        {/* Community Feed Section */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
           <Text style={styles.sectionTitleSimple}>Community Feed</Text>
        </View>

        <View style={styles.feedContainer}>
           {feedPosts.map((post, index) => (
             <Animated.View 
               key={post.id} 
               entering={FadeInUp.delay(300 + index * 100)}
               style={styles.postCard}
             >
                <View style={styles.postHeader}>
                   <View style={styles.authorInfo}>
                      <View style={styles.avatar}>
                         <Text style={styles.avatarText}>{post.initials}</Text>
                      </View>
                      <View>
                         <Text style={styles.authorName}>{post.author}</Text>
                         <Text style={styles.postMeta}>{post.community} • {post.timestamp}</Text>
                      </View>
                   </View>
                   <TouchableOpacity>
                      <MoreHorizontal size={18} color="#94A3B8" />
                   </TouchableOpacity>
                </View>
                
                <Text style={styles.postContent}>{post.content}</Text>
                
                <View style={styles.postActions}>
                   <View style={styles.postActionLeft}>
                      <TouchableOpacity style={styles.actionItem}>
                         <Heart size={18} color="#64748B" />
                         <Text style={styles.actionText}>{post.likes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionItem}>
                         <MessageSquare size={18} color="#64748B" />
                         <Text style={styles.actionText}>{post.comments}</Text>
                      </TouchableOpacity>
                   </View>
                   <TouchableOpacity style={styles.actionItem}>
                      <Share2 size={18} color="#64748B" />
                   </TouchableOpacity>
                </View>
             </Animated.View>
           ))}
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
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
    marginBottom: 6,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  filterButton: {
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleSimple: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent.DEFAULT,
  },
  horizontalScroll: {
    marginHorizontal: -16,
  },
  horizontalContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  communityCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  communityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  communityEmoji: {
    fontSize: 22,
  },
  communityName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    height: 38,
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  communityMembers: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  joinButton: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  feedContainer: {
    gap: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accent.DEFAULT,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  postMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 1,
  },
  postContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  postActionLeft: {
    flexDirection: 'row',
    gap: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  footerSpacer: {
    height: 40,
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
  createTopicBtn: {
    padding: 8,
    backgroundColor: '#FF6B00',
    borderRadius: 8,
  },
  forumBody: {
    flex: 1,
    padding: 16,
  },
  forumPostCard: {
    backgroundColor: '#121315',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1F2023',
    marginBottom: 20,
  },
  forumPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  forumAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1E2024',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forumAuthorAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  forumPostAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  forumPostTime: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  forumPostTitleDetail: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 8,
  },
  forumPostContentDetail: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  forumPostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2023',
  },
  forumActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  forumActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  repliesTitleHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingLeft: 4,
  },
  noRepliesCard: {
    padding: 24,
    backgroundColor: '#121315',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2023',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noRepliesText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  replyCard: {
    backgroundColor: '#121315',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2023',
    marginBottom: 10,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  replyTime: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  replyContent: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    fontWeight: '500',
  },
  replyAttachmentContainer: {
    marginTop: 8,
  },
  replyAttachedImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  replyAttachedFileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  replyAttachedFileName: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  replyPreviewContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  replyImagePreviewWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  replyImagePreviewThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  removePreviewBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    padding: 3,
  },
  replyFilePreviewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  replyFilePreviewName: {
    fontSize: 12,
    color: '#E2E8F0',
    maxWidth: 200,
  },
  attachBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#121315',
    borderColor: '#1F2023',
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 10,
  },
  replyInputField: {
    flex: 1,
    height: 44,
    backgroundColor: '#121315',
    borderColor: '#1F2023',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#FFFFFF',
  },
  replySendBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forumGreetingCard: {
    backgroundColor: '#121315',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2023',
    marginBottom: 24,
  },
  forumGreetingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  forumGreetingSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 16,
  },
  forumSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E0F10',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: '#1F2023',
  },
  forumSearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  forumSubTabs: {
    flexDirection: 'row',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2023',
    paddingBottom: 8,
    marginBottom: 16,
  },
  forumSubTabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  forumSubTabButtonActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },
  forumSubTabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'capitalize',
  },
  forumSubTabButtonTextActive: {
    color: '#FF6B00',
  },
  forumCategoryCard: {
    backgroundColor: '#121315',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2023',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  catLeftBorder: {
    width: 4,
    backgroundColor: '#FF6B00',
  },
  forumCategoryMain: {
    flex: 1,
    padding: 16,
  },
  catColorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  forumCategoryName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  forumCategoryDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  forumCategoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    marginBottom: 12,
  },
  forumSubtagBadge: {
    backgroundColor: '#1E2024',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  forumSubtagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  categoryLatestHeader: {
    borderTopWidth: 1,
    borderTopColor: '#1F2023',
    paddingTop: 10,
    marginTop: 8,
  },
  categoryLatestLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  catPostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  catPostTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
    flex: 1,
    marginRight: 10,
  },
  catPostTime: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  listPostCard: {
    backgroundColor: '#121315',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2023',
  },
  listPostCat: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
    textTransform: 'uppercase',
  },
  listPostAuthorMeta: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  listPostTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  listPostDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  listPostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E2024',
    paddingTop: 8,
  },
  listPostStat: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#121315',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#28292E',
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#0E0F10',
    borderColor: '#28292E',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  selectBox: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  selectOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0E0F10',
    borderWidth: 1,
    borderColor: '#28292E',
    alignItems: 'center',
  },
  selectOptionActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    borderColor: '#FF6B00',
  },
  selectOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  selectOptionTextActive: {
    color: '#FF6B00',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accordionContainer: {
    backgroundColor: '#121315',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2023',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  accordionArrow: {
    fontSize: 10,
    color: '#64748B',
  },
  accordionContent: {
    marginTop: 12,
    gap: 8,
  },
  accordionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  accordionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B00',
  },
  accordionItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  noCategoriesText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 8,
  },
  tagBadge: {
    backgroundColor: '#1E2024',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#28292E',
  },
  tagBadgeActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tagBadgeTextActive: {
    color: '#FFFFFF',
  },
});
