import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
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
  Zap
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const communities = [
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

export const StudentCommunityScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.searchText}>Search communities, threads...</Text>
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

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalContent}
        >
          {communities.map((community, index) => (
            <Animated.View 
              key={community.id} 
              entering={FadeInRight.delay(200 + index * 100)}
              style={styles.communityCard}
            >
               <View style={[styles.communityIconContainer, { backgroundColor: `${community.color}10` }]}>
                  <Text style={styles.communityEmoji}>{community.icon}</Text>
               </View>
               <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
               <View style={styles.communityStats}>
                  <Text style={styles.communityMembers}>{community.members} Members</Text>
                  <View style={styles.onlineContainer}>
                     <View style={styles.onlineDot} />
                     <Text style={styles.onlineText}>{community.online}</Text>
                  </View>
               </View>
               <TouchableOpacity style={[styles.joinButton, { borderColor: community.color }]}>
                  <Text style={[styles.joinButtonText, { color: community.color }]}>Join</Text>
               </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

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
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.accent.DEFAULT,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
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
  searchText: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
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
    borderWidth: 1.5,
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
  }
});
