import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getShortsFeed, saveShort, getSavedShorts } from '@/api/student.services';
import { useAuth } from '@/context/AuthContext';
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
  Video,
  ListVideo,
  LayoutGrid,
  PlaySquare
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

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
  { id: 4, title: "Python List Comprehension", category: "Python", duration: "30 sec", views: "156K", author: "pythonista", authorHandle: "@pythonista", authorAvatar: "PY", tags: ["Python", "Coding"], isSaved: true, videoUrl: videoData[3].url, posterUrl: videoData[3].poster, color: "blue" },
  { id: 5, title: "Big O Notation", category: "Algorithms", duration: "35 sec", views: "300K", author: "algoexpert", authorHandle: "@algoexpert", authorAvatar: "AE", tags: ["DSA", "Interviews"], isSaved: false, videoUrl: videoData[0].url, posterUrl: videoData[0].poster, color: "blue" },
  { id: 6, title: "React Context API", category: "React", duration: "45 sec", views: "110K", author: "reactdev", authorHandle: "@reactdev", authorAvatar: "RD", tags: ["React", "Frontend"], isSaved: false, videoUrl: videoData[1].url, posterUrl: videoData[1].poster, color: "yellow" },
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

const { width } = Dimensions.get('window');
const SHORT_CARD_WIDTH = width * 0.65;
const GRID_SPACING = 4;
const GRID_COLUMNS = 3;
const GRID_ITEM_WIDTH = (width - 32 - (GRID_SPACING * (GRID_COLUMNS - 1))) / GRID_COLUMNS;
const GRID_ITEM_HEIGHT = GRID_ITEM_WIDTH * (16 / 9);

// Reusable Video Player Logic inside a common wrapper
const VideoPlayerWebView = ({ video, isPlaying }: { video: any, isPlaying: boolean }) => {
  const webViewRef = useRef<WebView>(null);
  const [token, setToken] = useState<string | null>(null);

  React.useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
      } catch (err) {
        console.log("Error loading token in WebView wrapper", err);
      }
    };
    getToken();
  }, []);

  // When isPlaying changes, we manually inject JS via effect
  React.useEffect(() => {
    if (isPlaying) {
      setTimeout(() => {
        webViewRef.current?.injectJavaScript('var vid = document.getElementById("short_video"); if(vid){ vid.volume = 1; vid.muted = false; vid.play(); } true;');
      }, 300); // small delay to wait for webview load
    } else {
      webViewRef.current?.injectJavaScript('var vid = document.getElementById("short_video"); if(vid) { vid.pause(); } true;');
    }
  }, [isPlaying]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body { margin: 0; padding: 0; background-color: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
          video { object-fit: contain; width: 100%; height: 100%; background: #000; }
          #loader { position: absolute; color: white; font-family: sans-serif; font-size: 14px; }
        </style>
      </head>
      <body>
        <div id="loader">Loading video...</div>
        <video id="short_video" preload="auto" loop playsinline style="display: none;"></video>
        
        <script>
          const videoUrl = "${video.videoUrl}";
          const token = ${token ? JSON.stringify(token) : 'null'};
          const videoElement = document.getElementById("short_video");
          const loaderElement = document.getElementById("loader");

          async function loadVideo() {
            try {
              const headers = {};
              if (token) {
                headers["Authorization"] = "token " + token;
              }
              const response = await fetch(videoUrl, { headers });
              if (!response.ok) throw new Error("Fetch failed");
              const blob = await response.blob();
              const objectUrl = URL.createObjectURL(blob);
              videoElement.src = objectUrl;
              loaderElement.style.display = "none";
              videoElement.style.display = "block";
              
              if (${isPlaying}) {
                videoElement.play().catch(err => console.log("Play failed", err));
              }
            } catch (error) {
              console.error("Blob load failed, falling back to direct src", error);
              videoElement.src = videoUrl;
              loaderElement.style.display = "none";
              videoElement.style.display = "block";
              if (${isPlaying}) {
                videoElement.play().catch(err => console.log("Play failed", err));
              }
            }
          }
          loadVideo();
        </script>
      </body>
    </html>
  `;

  return (
    <WebView 
      ref={webViewRef}
      source={{ html: htmlContent, baseUrl: 'https://devstridenex.quantcloud.in' }} 
      style={StyleSheet.absoluteFillObject}
      scrollEnabled={false}
      bounces={false}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
    />
  );
};

// 1. Horizontal Scroll Standard Video Card (for Home Tab)
const VideoPlayerCard = ({ video, isSaved, onToggleSave }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={styles.videoCardWrapper}>
      <View style={styles.videoPlayerContainer}>
        <VideoPlayerWebView video={video} isPlaying={isPlaying} />
        
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject} 
          activeOpacity={0.9} 
          onPress={() => setIsPlaying(!isPlaying)}
        >
          {!isPlaying && (
            <View style={styles.playIconOverlay}>
              <View style={styles.playIconCircle}>
                <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 4 }} />
              </View>
            </View>
          )}
        </TouchableOpacity>

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
      </View>
    </View>
  );
};

// 2. Vertical Listed Video Card (for Videos Tab - 16:9 full width)
const StandardVideoCard = ({ video }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={styles.standardVideoCard}>
       <View style={styles.standardVideoPlayer}>
         <VideoPlayerWebView video={{...video, posterUrl: video.posterUrl}} isPlaying={isPlaying} />
         <TouchableOpacity 
            style={StyleSheet.absoluteFillObject} 
            activeOpacity={0.9} 
            onPress={() => setIsPlaying(!isPlaying)}
          >
            {!isPlaying && (
              <View style={styles.playIconOverlay}>
                <View style={styles.playIconCircle}>
                  <Play size={28} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 4 }} />
                </View>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.videoOverlay}>
             <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{video.duration || '5:32'}</Text>
             </View>
          </View>
       </View>
       
       <View style={styles.standardVideoInfo}>
         <View style={styles.standardAvatar}>
           <Text style={styles.tinyAvatarText}>{video.authorAvatar}</Text>
         </View>
         <View style={styles.standardTextContent}>
           <Text style={styles.standardTitle} numberOfLines={2}>{video.title}</Text>
           <Text style={styles.standardMeta}>{video.authorHandle} • {video.views} views • 2 days ago</Text>
         </View>
       </View>
    </View>
  );
};

// 3. Vertical Video Card (for Shorts Tab - 9:16 aspect ratio full width)
const VerticalShortCard = ({ video }: any) => {
   const [isPlaying, setIsPlaying] = useState(false);

   return (
     <View style={styles.verticalShortCard}>
       {isPlaying ? (
         <View style={StyleSheet.absoluteFill}>
           <VideoPlayerWebView video={video} isPlaying={isPlaying} />
         </View>
       ) : (
         <ImageBackground source={{ uri: video.posterUrl }} style={styles.verticalShortImage} resizeMode="cover">
           <View style={styles.verticalShortOverlay}>
              <View style={styles.verticalShortInfo}>
                 <Text style={styles.verticalShortTitle} numberOfLines={2}>{video.title}</Text>
                 <View style={styles.verticalShortAuthorRow}>
                    <View style={styles.verticalShortAvatar}>
                       <Text style={styles.verticalTinyAvatarText}>{video.authorAvatar}</Text>
                    </View>
                    <Text style={styles.verticalShortAuthor}>{video.authorHandle}</Text>
                 </View>
              </View>
              <View style={styles.verticalShortActions}>
                 <View style={styles.verticalActionItem}>
                    <Eye size={24} color="#FFFFFF" />
                    <Text style={styles.verticalActionText}>{video.views}</Text>
                 </View>
                 <View style={styles.verticalActionItem}>
                    <Bookmark size={24} color="#FFFFFF" />
                    <Text style={styles.verticalActionText}>Save</Text>
                 </View>
              </View>
           </View>
           <View style={styles.centerPlayWrapper}>
             <View style={styles.playIconCircle}>
                <Play size={32} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 6 }} />
             </View>
           </View>
         </ImageBackground>
       )}
       
       <TouchableOpacity 
         style={StyleSheet.absoluteFillObject} 
         activeOpacity={0.9} 
         onPress={() => setIsPlaying(!isPlaying)} 
       />
     </View>
   );
};

// Main Screen Component
export const StudentShortsScreen = () => {
  const { userName } = useAuth();
  const [activeTab, setActiveTab] = useState('Home');
  const [shortsList, setShortsList] = useState<any[]>([]);
  const [savedShortsList, setSavedShortsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  const fetchSaved = async () => {
    if (!userName) return;
    try {
      setLoadingSaved(true);
      const res = await getSavedShorts(userName);
      console.log("Mobile Saved shorts response:", res);
      let rawSaved = [];
      if (res && Array.isArray(res.message)) {
        rawSaved = res.message;
      } else if (res && Array.isArray(res.data)) {
        rawSaved = res.data;
      }
      
      // Match the correct "short" field from the Frappe saved record response
      const savedIds = rawSaved.map((item: any) => String(item.short));
      setSavedItems(savedIds);

      // Filter shortsList to find details
      const filtered = shortsList.filter(short => savedIds.includes(String(short.id)));

      const mappedSaved = filtered.map((short: any) => {
        const skill = short.category || "General";
        const icon = skill.toLowerCase().includes("python") ? "🐍" : skill.toLowerCase().includes("pandas") ? "🐼" : "🗄️";
        return {
          id: short.id,
          title: short.title,
          category: skill,
          savedDate: "Saved",
          icon: icon,
          color: "blue"
        };
      });
      setSavedShortsList(mappedSaved);
    } catch (err) {
      console.error("Error loading saved shorts on mobile:", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        setLoading(true);
        const res = await getShortsFeed(userName || undefined);
        console.log("Mobile Shorts API response:", res);
        
        let rawShorts = [];
        if (res && Array.isArray(res.message)) {
          rawShorts = res.message;
        } else if (res && Array.isArray(res.data)) {
          rawShorts = res.data;
        }

        const BASE_DOMAIN = "https://devstridenex.quantcloud.in";
        const savedIdsFromFeed: string[] = [];
        const mapped = rawShorts.map((item: any) => {
          const videoUrl = item.video ? (item.video.startsWith('http') ? item.video : `${BASE_DOMAIN}${item.video}`) : '';
          const posterUrl = item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${BASE_DOMAIN}${item.thumbnail}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'; // fallback poster image
          
          const skill = item.skill || "Skill";
          const authorAvatar = skill.substring(0, 2).toUpperCase();

          if (item.is_saved) {
            savedIdsFromFeed.push(String(item.name));
          }

          return {
            id: item.name,
            title: item.title || "Untitled Short",
            category: skill,
            duration: item.duration_display || `${item.duration_seconds || 30} sec`,
            views: item.views_display || `${item.view_count || 0}`,
            author: "StrideNex",
            authorHandle: "@stridenex",
            authorAvatar: authorAvatar,
            tags: [skill],
            isSaved: Boolean(item.is_saved),
            videoUrl: videoUrl,
            posterUrl: posterUrl,
            color: "blue"
          };
        });

        setShortsList(mapped);
        if (savedIdsFromFeed.length > 0) {
          setSavedItems(prev => {
            const combined = new Set([...prev, ...savedIdsFromFeed]);
            return Array.from(combined);
          });
        }
      } catch (error) {
        console.error("Error loading shorts in mobile screen:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShorts();
    // Do not auto-fetch saved shorts metadata details on mount (only query short ids for bookmark sync)
    const fetchSavedIds = async () => {
      if (!userName) return;
      try {
        const res = await getSavedShorts(userName);
        let rawSaved = [];
        if (res && Array.isArray(res.message)) {
          rawSaved = res.message;
        } else if (res && Array.isArray(res.data)) {
          rawSaved = res.data;
        }
        const savedIds = rawSaved.map((item: any) => String(item.short));
        setSavedItems(savedIds);
      } catch (e) {}
    };
    fetchSavedIds();
  }, [userName]);

  const toggleSave = async (id: any) => {
    if (!userName) {
      console.log("User not logged in");
      return;
    }

    const isAlreadySaved = savedItems.includes(String(id));

    try {
      // Opt-in UI update
      setSavedItems(prev => prev.includes(String(id)) ? prev.filter(item => item !== String(id)) : [...prev, String(id)]);

      // Call API
      const res = await saveShort({
        user: userName,
        short_name: String(id)
      });
      console.log("Save short mobile response:", res);

      // Refresh saved shorts list
      fetchSaved();
    } catch (error) {
      console.error("Error saving short on mobile:", error);
      // Rollback UI update
      setSavedItems(prev => isAlreadySaved ? [...prev, String(id)] : prev.filter(item => item !== String(id)));
    }
  };

  const TABS = ['Home', 'Videos', 'Shorts', 'Saved', 'Playlists'];

  const renderHomeContent = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 14, color: '#64748B' }}>Loading study shorts...</Text>
        </View>
      );
    }

    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <View style={styles.trendingSection}>
           <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                 <TrendingUp size={18} color={colors.accent.DEFAULT} />
                 <Text style={styles.sectionTitleText}>Trending Shorts</Text>
              </View>
           </View>
           
           {shortsList.length === 0 ? (
             <View style={{ paddingVertical: 20, alignItems: 'center' }}>
               <Text style={{ color: '#94A3B8', fontSize: 14 }}>No study shorts available.</Text>
             </View>
           ) : (
             <ScrollView 
               horizontal 
               showsHorizontalScrollIndicator={false}
               contentContainerStyle={styles.horizontalScrollContent}
             >
                {shortsList.slice(0, 4).map((short) => (
                  <VideoPlayerCard 
                    key={short.id} 
                    video={short} 
                    isSaved={savedItems.includes(short.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
             </ScrollView>
           )}
        </View>

        <View style={styles.savedSection}>
           <View style={styles.savedCard}>
              <View style={styles.savedHeader}>
                 <Bookmark size={16} color={colors.accent.DEFAULT} />
                 <Text style={styles.savedTitleText}>Saved Topics</Text>
              </View>
              <View style={styles.savedList}>
                 {savedShortsList.length === 0 ? (
                   <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 10 }}>No saved topics yet</Text>
                 ) : (
                   savedShortsList.map((saved) => (
                     <TouchableOpacity key={saved.id} style={styles.savedItem}>
                        <View style={styles.savedIconBox}>
                           <Text style={styles.savedIconText}>{saved.icon}</Text>
                        </View>
                        <View style={styles.savedItemContent}>
                           <Text style={styles.savedItemTitle}>{saved.title}</Text>
                           <Text style={styles.savedItemDate}>{saved.savedDate}</Text>
                        </View>
                     </TouchableOpacity>
                   ))
                 )}
              </View>
              <TouchableOpacity style={styles.viewSavedBtn}>
                 <Text style={styles.viewSavedBtnText}>View All Saved</Text>
              </TouchableOpacity>
           </View>
        </View>
        
        <View style={styles.footerSpacer} />
      </Animated.View>
    );
  };

  const renderVideosContent = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 14, color: '#64748B' }}>Loading videos...</Text>
        </View>
      );
    }

    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.videosFeed}>
         {shortsList.length === 0 ? (
           <View style={{ paddingVertical: 40, alignItems: 'center' }}>
             <Text style={{ color: '#94A3B8', fontSize: 14 }}>No study videos available.</Text>
           </View>
         ) : (
           shortsList.map((video) => (
             <StandardVideoCard key={video.id} video={video} />
           ))
         )}
         <View style={styles.footerSpacer} />
      </Animated.View>
    );
  };

  const renderShortsContent = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 14, color: '#64748B' }}>Loading study shorts...</Text>
        </View>
      );
    }

    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.shortsFeedWrap}>
        <View style={styles.shortsFeed}>
          {shortsList.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8', fontSize: 14 }}>No study shorts available.</Text>
            </View>
          ) : (
            shortsList.map(short => (
              <VerticalShortCard key={short.id} video={short} />
            ))
          )}
        </View>
        <View style={styles.footerSpacer} />
      </Animated.View>
    );
  };

  const renderSavedContent = () => {
    if (loadingSaved) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 14, color: '#64748B' }}>Loading saved shorts...</Text>
        </View>
      );
    }

    // Filter shortsList to display only saved shorts in 9:16 layout
    const savedVideos = shortsList.filter(short => savedItems.includes(String(short.id)));

    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.shortsFeedWrap}>
        <View style={styles.shortsFeed}>
          {savedVideos.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center', width: '100%' }}>
              <Text style={{ color: '#94A3B8', fontSize: 14 }}>No saved shorts yet.</Text>
            </View>
          ) : (
            savedVideos.map(short => (
              <VerticalShortCard key={short.id} video={short} />
            ))
          )}
        </View>
        <View style={styles.footerSpacer} />
      </Animated.View>
    );
  };

  const renderPlaylistsContent = () => (
    <Animated.View entering={FadeIn.duration(400)} style={styles.playlistsFeed}>
      <View style={styles.emptyStateContainer}>
         <ListVideo size={48} color="#CBD5E1" strokeWidth={1} style={{ marginBottom: 16 }} />
         <Text style={styles.emptyStateTitle}>No Playlists Yet</Text>
         <Text style={styles.emptyStateText}>Playlists you create or save will appear here.</Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Scrollable Container covering Header, Tab Bar, and Content */}
      <ScrollView style={styles.container} contentContainerStyle={styles.content} stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        
        {/* Header Block */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.headerBlock}>
          <Text style={styles.title}>Learn & Watch</Text>
          <Text style={styles.subtitle}>Curated tech bites at your fingertips</Text>
        </Animated.View>

        {/* Tab Bar Container (Sticky) */}
        <View style={styles.tabContainerWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                onPress={() => {
                  setActiveTab(tab);
                  if (tab === 'Saved') {
                    fetchSaved(); // Call API ONLY when user navigates to the Saved tab
                  }
                }}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Dynamic Tab Content */}
        <View style={styles.tabSizer}>
          {activeTab === 'Home' && renderHomeContent()}
          {activeTab === 'Videos' && renderVideosContent()}
          {activeTab === 'Shorts' && renderShortsContent()}
          {activeTab === 'Saved' && renderSavedContent()}
          {activeTab === 'Playlists' && renderPlaylistsContent()}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },

  tabContainerWrapper: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  tabBar: {
    paddingHorizontal: 0,
  },
  tabContent: {
    flexGrow: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 24,
  },
  tabButton: {
    paddingVertical: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent.DEFAULT,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: colors.accent.DEFAULT,
    fontWeight: '800',
  },

  tabSizer: {
    paddingTop: 20,
  },

  /* --- Home Tab Styles --- */
  trendingSection: { marginBottom: 32, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitleText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  horizontalScrollContent: { gap: 16, paddingRight: 16 },
  
  videoCardWrapper: { width: SHORT_CARD_WIDTH },
  videoPlayerContainer: { width: '100%', aspectRatio: 9/16, backgroundColor: '#000000', borderRadius: 16, overflow: 'hidden', marginBottom: 12, position: 'relative' },
  playIconOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  playIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 107, 0, 0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 8, justifyContent: 'flex-start', alignItems: 'flex-end', pointerEvents: 'none' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 },
  durationText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  videoInfoContainer: { paddingHorizontal: 4 },
  videoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  videoTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  videoMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tinyAvatar: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  tinyAvatarText: { fontSize: 7, fontWeight: '800', color: '#64748B' },
  authorHandle: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  metaDot: { fontSize: 10, color: '#CBD5E1' },
  viewsText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  bookmarkBtn: { padding: 4 },

  savedSection: { marginBottom: 24, paddingHorizontal: 16 },
  savedCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1.5, borderColor: '#F1F5F9', borderLeftWidth: 4, borderLeftColor: '#FF6B00' },
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

  /* --- Videos Tab Styles --- */
  videosFeed: { paddingBottom: 20 },
  standardVideoCard: { marginBottom: 24 },
  standardVideoPlayer: { width: '100%', aspectRatio: 16/9, backgroundColor: '#000' },
  standardVideoInfo: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  standardAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  standardTextContent: { flex: 1 },
  standardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  standardMeta: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  /* --- Shorts Tab Styles (Vertical Feed) --- */
  shortsFeedWrap: { paddingHorizontal: 0 },
  shortsFeed: { gap: 0 },
  verticalShortCard: { width: '100%', height: width * (16/9), backgroundColor: '#000', marginBottom: 24 },
  verticalShortImage: { width: '100%', height: '100%', justifyContent: 'space-between' },
  verticalShortOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  verticalShortInfo: { flex: 1, paddingRight: 24 },
  verticalShortTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 8, lineHeight: 22 },
  verticalShortAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verticalShortAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  verticalTinyAvatarText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  verticalShortAuthor: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  verticalShortActions: { alignItems: 'center', gap: 20 },
  verticalActionItem: { alignItems: 'center', gap: 4 },
  verticalActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  centerPlayWrapper: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  /* --- Playlists Tab Styles --- */
  playlistsFeed: { padding: 16 },
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyStateTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 32 },

  footerSpacer: { height: 40 }
});
