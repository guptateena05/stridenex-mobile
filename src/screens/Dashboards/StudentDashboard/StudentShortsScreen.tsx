import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  Eye,
  Clock,
  Sparkles,
  ChevronRight,
  Play,
  Video
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Sample video URLs mapping
const videoData = [
  { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg" },
  { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg" },
  { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg" },
  { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg" }
];

// Trending shorts data
const trendingShorts = [
  { id: 1, title: "System Design in 30s", category: "Architecture", duration: "30 sec", views: "128K", author: "techbro", authorHandle: "@techbro", authorAvatar: "TB", tags: ["System Design", "Architecture"], isSaved: false, videoUrl: videoData[0].url, posterUrl: videoData[0].poster, color: "blue" },
  { id: 2, title: "Async/Await explained", category: "JavaScript", duration: "30 sec", views: "89K", author: "jsmaster", authorHandle: "@jsmaster", authorAvatar: "JM", tags: ["JavaScript", "Promises"], isSaved: true, videoUrl: videoData[1].url, posterUrl: videoData[1].poster, color: "yellow" },
  { id: 3, title: "SQL Joins visualized", category: "SQL", duration: "30 sec", views: "210K", author: "databaseguru", authorHandle: "@databaseguru", authorAvatar: "DG", tags: ["SQL", "Database"], isSaved: false, videoUrl: videoData[2].url, posterUrl: videoData[2].poster, color: "blue" },
  { id: 4, title: "Python List Comprehension", category: "Python", duration: "30 sec", views: "156K", author: "pythonista", authorHandle: "@pythonista", authorAvatar: "PY", tags: ["Python", "Coding"], isSaved: true, videoUrl: videoData[3].url, posterUrl: videoData[3].poster, color: "blue" }
];

// Saved shorts data
const savedShorts = [
  { id: 1, title: "Python List Comprehension", category: "Python", savedDate: "Saved 2d ago", icon: "🐍", color: "blue" },
  { id: 2, title: "SQL Joins visualized", category: "SQL", savedDate: "Saved 4d ago", icon: "🗄️", color: "blue" },
  { id: 3, title: "Async/Await explained", category: "JavaScript", savedDate: "Saved 1w ago", icon: "🟨", color: "yellow" }
];

// Recommended shorts data
const recommendedShorts = [
  { id: 1, title: "Bias-Variance Tradeoff", duration: "28s", match: "97%", views: "45K", category: "Machine Learning" },
  { id: 2, title: "Feature Scaling methods", duration: "30s", match: "94%", views: "38K", category: "Machine Learning" },
  { id: 3, title: "Confusion Matrix explained", duration: "25s", match: "91%", views: "52K", category: "Machine Learning" },
  { id: 4, title: "Gradient Descent visualized", duration: "32s", match: "89%", views: "41K", category: "Deep Learning" }
];

const VideoPlayerCard = ({ video, isSaved, onToggleSave }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; background-color: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden;">
        <video id="short_video" width="100%" height="100%" preload="none" poster="${video.posterUrl}" loop playsinline style="object-fit: cover; background: #000 url('${video.posterUrl}') center center / cover no-repeat; opacity: 1;">
          <source src="${video.videoUrl}" type="video/mp4">
        </video>
      </body>
    </html>
  `;

  const togglePlay = () => {
    if (isPlaying) {
      webViewRef.current?.injectJavaScript('document.getElementById("short_video").pause(); true;');
      setIsPlaying(false);
    } else {
      webViewRef.current?.injectJavaScript('var vid = document.getElementById("short_video"); vid.volume = 1; vid.muted = false; vid.play(); true;');
      setIsPlaying(true);
    }
  };

  return (
    <View style={styles.videoCardWrapper}>
      <View style={styles.videoPlayerContainer}>
        <WebView 
          ref={webViewRef}
          source={{ html: htmlContent }} 
          style={styles.webView}
          scrollEnabled={false}
          bounces={false}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
        
        {/* Play/Pause Overlay */}
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject} 
          activeOpacity={0.9} 
          onPress={togglePlay}
        >
          {!isPlaying && (
            <View style={styles.playIconOverlay}>
              <View style={styles.playIconCircle}>
                <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 4 }} />
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Overlays */}
        <View style={styles.videoOverlay}>
           <View style={styles.durationBadge}>
              <Clock size={10} color="#FFFFFF" />
              <Text style={styles.durationText}>{video.duration}</Text>
           </View>
        </View>
      </View>

      <View style={styles.videoInfoContainer}>
        <View style={styles.videoHeaderRow}>
           <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.videoTitle} numberOfLines={1}>{video.title}</Text>
              <View style={styles.videoMetaRow}>
                 <View style={styles.tinyAvatar}>
                    <Text style={styles.tinyAvatarText}>{video.authorAvatar}</Text>
                 </View>
                 <Text style={styles.authorHandle}>{video.authorHandle}</Text>
                 <Text style={styles.metaDot}>•</Text>
                 <Eye size={10} color="#94A3B8" />
                 <Text style={styles.viewsText}>{video.views}</Text>
              </View>
           </View>
           <TouchableOpacity onPress={() => onToggleSave(video.id)} style={styles.bookmarkBtn}>
              {isSaved ? (
                <BookmarkCheck size={18} color={colors.accent.DEFAULT} fill={colors.accent.DEFAULT} />
              ) : (
                <Bookmark size={18} color="#94A3B8" />
              )}
           </TouchableOpacity>
        </View>
        <View style={styles.tagsRow}>
           {video.tags.map((tag: string, idx: number) => (
             <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
             </View>
           ))}
        </View>
      </View>
    </View>
  );
};

export const StudentShortsScreen = () => {
  const [savedItems, setSavedItems] = useState<number[]>(
    trendingShorts.filter(s => s.isSaved).map(s => s.id)
  );

  const toggleSave = (id: number) => {
    setSavedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
             <Video size={10} color={colors.accent.DEFAULT} />
             <Text style={styles.headerBadgeText}>BITE-SIZED LEARNING</Text>
          </View>
          <Text style={styles.title}>Study Shorts</Text>
          <Text style={styles.subtitle}>30-second skill videos — swipe, learn, level up</Text>
        </Animated.View>

        {/* Trending Section */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.trendingSection}>
           <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                 <TrendingUp size={18} color={colors.accent.DEFAULT} />
                 <Text style={styles.sectionTitleText}>Trending</Text>
              </View>
              <TouchableOpacity>
                 <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
           </View>
           
           <ScrollView 
             horizontal 
             showsHorizontalScrollIndicator={false}
             contentContainerStyle={styles.horizontalScrollContent}
           >
              {trendingShorts.map((short) => (
                <VideoPlayerCard 
                  key={short.id} 
                  video={short} 
                  isSaved={savedItems.includes(short.id)}
                  onToggleSave={toggleSave}
                />
              ))}
           </ScrollView>
        </Animated.View>

        {/* Saved Shorts Section */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.savedSection}>
           <View style={styles.savedCard}>
              <View style={styles.savedHeader}>
                 <Bookmark size={16} color={colors.accent.DEFAULT} />
                 <Text style={styles.savedTitleText}>Saved Shorts</Text>
              </View>
              <View style={styles.savedList}>
                 {savedShorts.map((saved) => (
                   <TouchableOpacity key={saved.id} style={styles.savedItem}>
                      <View style={styles.savedIconBox}>
                         <Text style={styles.savedIconText}>{saved.icon}</Text>
                      </View>
                      <View style={styles.savedItemContent}>
                         <Text style={styles.savedItemTitle}>{saved.title}</Text>
                         <Text style={styles.savedItemDate}>{saved.savedDate}</Text>
                      </View>
                   </TouchableOpacity>
                 ))}
              </View>
              <TouchableOpacity style={styles.viewSavedBtn}>
                 <Text style={styles.viewSavedBtnText}>View All Saved</Text>
              </TouchableOpacity>
           </View>
        </Animated.View>

        {/* Recommended For You Section */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.recommendedSection}>
           <View style={styles.recommendedCard}>
              <View style={styles.recommendedHeader}>
                 <View style={styles.recommendedTitleRow}>
                    <Sparkles size={16} color={colors.accent.DEFAULT} />
                    <Text style={styles.recommendedTitleText}>Recommended for Gaps</Text>
                 </View>
                 <View style={styles.recommendedTopicBadge}>
                    <Text style={styles.recommendedTopicText}>ML • Model Eval</Text>
                 </View>
              </View>
              
              <View style={styles.recommendedList}>
                 {recommendedShorts.map((rec, idx) => (
                   <TouchableOpacity key={rec.id} style={[styles.recItem, idx === recommendedShorts.length - 1 && styles.recItemLast]}>
                      <View style={styles.recItemLeft}>
                         <View style={styles.playIconBox}>
                            <Play size={10} color={colors.accent.DEFAULT} fill={colors.accent.DEFAULT} />
                         </View>
                         <View>
                            <Text style={styles.recItemTitle}>{rec.title}</Text>
                            <View style={styles.recMetaRow}>
                               <View style={styles.recCategoryBadge}>
                                  <Text style={styles.recCategoryText}>{rec.category}</Text>
                               </View>
                               <Text style={styles.recMetaText}>{rec.duration}</Text>
                               <Text style={styles.metaDot}>•</Text>
                               <Text style={styles.recMetaText}>{rec.views}</Text>
                            </View>
                         </View>
                      </View>
                      <View style={styles.recMatchBadge}>
                         <Text style={styles.recMatchText}>{rec.match}</Text>
                      </View>
                      <ChevronRight size={14} color="#CBD5E1" />
                   </TouchableOpacity>
                 ))}
              </View>

              <TouchableOpacity style={styles.viewRecsBtn}>
                 <Text style={styles.viewRecsBtnText}>View All Recommendations</Text>
                 <ChevronRight size={12} color={colors.accent.DEFAULT} />
              </TouchableOpacity>
           </View>
        </Animated.View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const CARD_WIDTH = Dimensions.get('window').width * 0.65;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
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
  
  trendingSection: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitleText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  viewAllText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  
  horizontalScrollContent: { gap: 16, paddingRight: 16 },
  videoCardWrapper: { width: CARD_WIDTH },
  videoPlayerContainer: { width: '100%', aspectRatio: 9/16, backgroundColor: '#000000', borderRadius: 16, overflow: 'hidden', marginBottom: 12, position: 'relative' },
  webView: { flex: 1, backgroundColor: '#000000' },
  playIconOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  playIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 107, 0, 0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 8, justifyContent: 'flex-start', alignItems: 'flex-end', pointerEvents: 'none' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  durationText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  
  videoInfoContainer: { paddingHorizontal: 4 },
  videoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  videoTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  videoMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tinyAvatar: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  tinyAvatarText: { fontSize: 7, fontWeight: '800', color: '#64748B' },
  authorHandle: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  metaDot: { fontSize: 10, color: '#CBD5E1' },
  viewsText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  bookmarkBtn: { padding: 4 },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  tagText: { fontSize: 9, fontWeight: '600', color: '#64748B' },
  
  savedSection: { marginBottom: 24 },
  savedCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  savedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  savedTitleText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  savedList: { padding: 16, gap: 16 },
  savedItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  savedIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  savedIconText: { fontSize: 16 },
  savedItemContent: { flex: 1 },
  savedItemTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  savedItemDate: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  viewSavedBtn: { padding: 14, borderTopWidth: 1, borderTopColor: '#F8FAFC', alignItems: 'center' },
  viewSavedBtnText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  
  recommendedSection: { marginBottom: 24 },
  recommendedCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  recommendedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, backgroundColor: '#FFF7ED', borderBottomWidth: 1, borderBottomColor: '#FFEDD5' },
  recommendedTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 8 },
  recommendedTitleText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  recommendedTopicBadge: { backgroundColor: '#FFEDD5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FDBA74' },
  recommendedTopicText: { fontSize: 9, fontWeight: '800', color: '#C2410C' },
  
  recommendedList: { backgroundColor: '#FFFFFF' },
  recItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  recItemLast: { borderBottomWidth: 0 },
  recItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  playIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255, 107, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
  recItemTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  recMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recCategoryBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  recCategoryText: { fontSize: 9, fontWeight: '600', color: '#64748B' },
  recMetaText: { fontSize: 10, color: '#64748B', fontWeight: '500' },
  recMatchBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', marginRight: 4 },
  recMatchText: { fontSize: 9, fontWeight: '800', color: '#059669' },
  
  viewRecsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 14, borderTopWidth: 1, borderTopColor: '#F8FAFC', backgroundColor: '#F8FAFC' },
  viewRecsBtnText: { fontSize: 12, fontWeight: '700', color: colors.accent.DEFAULT },

  footerSpacer: { height: 40 }
});
