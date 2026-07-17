import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground, 
  FlatList, 
  ActivityIndicator,
  useWindowDimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getShortsFeed, saveShort, unsaveShort, getSavedShorts, toggleLikeShort } from '@/api/student.services';
import { useAuth } from '@/context/AuthContext';
import { WebView } from 'react-native-webview';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Bookmark,
  BookmarkCheck,
  Eye,
  Play,
  Heart
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Reusable Video Player Logic inside a common wrapper
const VideoPlayerWebView = ({ video, isPlaying }: { video: any, isPlaying: boolean }) => {
  const webViewRef = useRef<WebView>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
      } catch (err) {
        console.log("Error loading token in WebView wrapper", err);
      } finally {
        setIsTokenLoaded(true);
      }
    };
    getToken();
  }, []);

  // When isPlaying changes, we manually inject JS via effect
  useEffect(() => {
    if (!isTokenLoaded) return;
    if (isPlaying) {
      setTimeout(() => {
        webViewRef.current?.injectJavaScript('var vid = document.getElementById("short_video"); if(vid){ vid.muted = false; vid.play().catch(function(e) { console.log("Unmuted play blocked, playing muted", e); vid.muted = true; vid.play().catch(function(err) { console.log("Play failed", err); }); }); } true;');
      }, 300); // small delay to wait for webview load
    } else {
      webViewRef.current?.injectJavaScript('var vid = document.getElementById("short_video"); if(vid) { vid.pause(); } true;');
    }
  }, [isPlaying, isTokenLoaded]);

  if (!isTokenLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

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
        <video id="short_video" preload="auto" loop playsinline autoplay muted style="display: none;"></video>
        
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
                videoElement.muted = false;
                videoElement.play().catch(function(err) {
                  console.log("Autoplay unmuted failed, trying muted", err);
                  videoElement.muted = true;
                  videoElement.play().catch(function(e) {
                    console.log("Muted autoplay failed", e);
                  });
                });
              }
            } catch (error) {
              console.error("Blob load failed, falling back to direct src", error);
              videoElement.src = videoUrl;
              loaderElement.style.display = "none";
              videoElement.style.display = "block";
              if (${isPlaying}) {
                videoElement.muted = false;
                videoElement.play().catch(function(err) {
                  console.log("Autoplay unmuted failed, trying muted", err);
                  videoElement.muted = true;
                  videoElement.play().catch(function(e) {
                    console.log("Muted autoplay failed", e);
                  });
                });
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

// Vertical Video Card (for Shorts Tab - Reels style)
const VerticalShortCard = ({ video, isPlaying: autoPlay, isSaved, isLiked, onToggleSave, onToggleLike, cardHeight }: any) => {
   const [isPlaying, setIsPlaying] = useState(autoPlay);

   useEffect(() => {
     setIsPlaying(autoPlay);
   }, [autoPlay]);

   return (
     <View style={[styles.verticalShortCard, { height: cardHeight }]}>
       {/* Background: Video Player or Poster Image */}
       {isPlaying ? (
         <View style={StyleSheet.absoluteFill}>
           <VideoPlayerWebView video={video} isPlaying={isPlaying} />
         </View>
       ) : (
         <ImageBackground source={{ uri: video.posterUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
       )}

       {/* Tap handler for background play/pause toggle */}
       <TouchableOpacity 
         style={StyleSheet.absoluteFillObject} 
         activeOpacity={1} 
         onPress={() => setIsPlaying(!isPlaying)} 
       />

       {/* Floating UI overlay on top of background */}
       <View style={styles.verticalShortOverlay} pointerEvents="box-none">
          <View style={styles.verticalShortInfo} pointerEvents="box-none">
             <Text style={styles.verticalShortTitle} numberOfLines={2}>{video.title}</Text>
             <View style={styles.verticalShortAuthorRow} pointerEvents="box-none">
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
             <TouchableOpacity 
               onPress={() => onToggleLike?.(video.id)}
               style={styles.verticalActionItem}
             >
                <Heart size={24} color={isLiked ? "#EF4444" : "#FFFFFF"} fill={isLiked ? "#EF4444" : "transparent"} />
                <Text style={styles.verticalActionText}>{isLiked ? 'Liked' : 'Like'}</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               onPress={() => onToggleSave?.(video.id)}
               style={styles.verticalActionItem}
             >
                {isSaved ? (
                   <BookmarkCheck size={24} color={colors.accent.DEFAULT} fill={colors.accent.DEFAULT} />
                ) : (
                   <Bookmark size={24} color="#FFFFFF" />
                )}
                <Text style={styles.verticalActionText}>{isSaved ? 'Saved' : 'Save'}</Text>
             </TouchableOpacity>
          </View>
       </View>

       {/* Center Play Overlay when paused */}
       {!isPlaying && (
         <View style={styles.centerPlayWrapper} pointerEvents="none">
           <View style={styles.playIconCircle}>
              <Play size={32} color="#FFFFFF" fill="#FFFFFF" style={styles.centerPlayIcon} />
           </View>
         </View>
       )}
     </View>
   );
};

// Main Screen Component
export const StudentShortsScreen = () => {
  const { userName } = useAuth();
  const [activeTab, setActiveTab] = useState('Shorts');
  const [shortsList, setShortsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<any[]>([]);

  // Throttled Infinite Scroll/Batch States
  const { height } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(height - 180);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedShorts, setDisplayedShorts] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const isBatchLoadingRef = useRef(false);
  const activeTogglesRef = useRef<Set<string>>(new Set());
  const BATCH_SIZE = 5;

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
      
      const savedIds = rawSaved.map((item: any) => String(item.short));
      setSavedItems(savedIds);
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
        const likedIdsFromFeed: string[] = [];
        const mapped = rawShorts.map((item: any) => {
          const videoUrl = item.video ? (item.video.startsWith('http') ? item.video : `${BASE_DOMAIN}${item.video}`) : '';
          const posterUrl = item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${BASE_DOMAIN}${item.thumbnail}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'; // fallback poster image
          
          const skill = item.skill || "Skill";
          const authorAvatar = skill.substring(0, 2).toUpperCase();

          if (item.is_saved) {
            savedIdsFromFeed.push(String(item.name));
          }
          if (item.is_liked) {
            likedIdsFromFeed.push(String(item.name));
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
        if (likedIdsFromFeed.length > 0) {
          setLikedItems(prev => {
            const combined = new Set([...prev, ...likedIdsFromFeed]);
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
      } catch {}
    };
    fetchSavedIds();
  }, [userName]);

  // Set initial batch once shortsList is fetched
  useEffect(() => {
    if (shortsList.length > 0) {
      setDisplayedShorts(shortsList.slice(0, BATCH_SIZE));
    }
  }, [shortsList]);

  // Load next batch throttled
  const loadNextBatch = () => {
    if (isBatchLoadingRef.current) return;
    if (displayedShorts.length >= shortsList.length) return;

    isBatchLoadingRef.current = true;
    setLoadingMore(true);

    setTimeout(() => {
      setDisplayedShorts(prev => {
        const nextCount = prev.length + BATCH_SIZE;
        return shortsList.slice(0, nextCount);
      });
      setLoadingMore(false);
      isBatchLoadingRef.current = false;
    }, 1200);
  };

  const toggleSave = async (id: any) => {
    if (!userName) {
      console.log("User not logged in");
      return;
    }

    const key = `save-${id}`;
    if (activeTogglesRef.current.has(key)) {
      console.log("Save toggle already in progress for", id);
      return;
    }
    activeTogglesRef.current.add(key);

    const isAlreadySaved = savedItems.includes(String(id));

    try {
      // Opt-in UI update
      setSavedItems(prev => prev.includes(String(id)) ? prev.filter(item => item !== String(id)) : [...prev, String(id)]);

      // Call API
      if (isAlreadySaved) {
        const res = await unsaveShort({
          user: userName,
          short_name: String(id)
        });
        console.log("Unsave short mobile response:", res);
      } else {
        const res = await saveShort({
          user: userName,
          short_name: String(id)
        });
        console.log("Save short mobile response:", res);
      }

      // Refresh saved shorts list
      fetchSaved();
    } catch (error) {
      console.error("Error saving short on mobile:", error);
      // Rollback UI update
      setSavedItems(prev => isAlreadySaved ? [...prev, String(id)] : prev.filter(item => item !== String(id)));
    } finally {
      activeTogglesRef.current.delete(key);
    }
  };

  const toggleLike = async (id: any) => {
    if (!userName) {
      console.log("User not logged in");
      return;
    }

    const key = `like-${id}`;
    if (activeTogglesRef.current.has(key)) {
      console.log("Like toggle already in progress for", id);
      return;
    }
    activeTogglesRef.current.add(key);

    const isAlreadyLiked = likedItems.includes(String(id));

    try {
      // Opt-in UI update
      setLikedItems(prev => prev.includes(String(id)) ? prev.filter(item => item !== String(id)) : [...prev, String(id)]);

      // Call API
      const res = await toggleLikeShort({
        short: String(id)
      });
      console.log("Toggle like short mobile response:", res);
    } catch (error) {
      console.error("Error toggling like on mobile:", error);
      // Rollback UI update
      setLikedItems(prev => isAlreadyLiked ? [...prev, String(id)] : prev.filter(item => item !== String(id)));
    } finally {
      activeTogglesRef.current.delete(key);
    }
  };

  const TABS = ['Shorts', 'Saved'];

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const renderShortsContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          <Text style={styles.loadingText}>Loading study shorts...</Text>
        </View>
      );
    }

    if (shortsList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No study shorts available.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={displayedShorts}
        renderItem={({ item, index }) => (
          <VerticalShortCard 
            video={item} 
            isPlaying={index === activeIndex}
            isSaved={savedItems.includes(String(item.id))}
            isLiked={likedItems.includes(String(item.id))}
            onToggleSave={toggleSave}
            onToggleLike={toggleLike}
            cardHeight={containerHeight}
          />
        )}
        keyExtractor={item => String(item.id)}
        pagingEnabled
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onEndReached={loadNextBatch}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.listFooter}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : null
        }
      />
    );
  };

  const renderSavedContent = () => {
    if (loadingSaved) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          <Text style={styles.loadingText}>Loading saved shorts...</Text>
        </View>
      );
    }

    const savedVideos = shortsList.filter(short => savedItems.includes(String(short.id)));

    if (savedVideos.length === 0) {
      return (
        <View style={styles.emptySavedContainer}>
          <Text style={styles.emptySavedText}>No saved shorts yet.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={savedVideos}
        renderItem={({ item }) => (
          <VerticalShortCard 
            video={item} 
            isPlaying={false}
            isSaved={true}
            isLiked={likedItems.includes(String(item.id))}
            onToggleSave={toggleSave}
            onToggleLike={toggleLike}
            cardHeight={containerHeight}
          />
        )}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Header Block */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.headerBlock}>
        <Text style={styles.title}>Learn & Watch</Text>
        <Text style={styles.subtitle}>Curated tech bites at your fingertips</Text>
      </Animated.View>

      {/* Tab Bar Container */}
      <View style={styles.tabContainerWrapper}>
        <View style={styles.tabContent}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => {
                setActiveTab(tab);
                if (tab === 'Saved') {
                  fetchSaved();
                }
              }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content Area */}
      <View 
        style={styles.contentContainer}
        onLayout={({ nativeEvent }) => {
          const { height: layoutHeight } = nativeEvent.layout;
          if (layoutHeight > 0) {
            setContainerHeight(layoutHeight);
          }
        }}
      >
        {activeTab === 'Shorts' && renderShortsContent()}
        {activeTab === 'Saved' && renderSavedContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
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
  tabContent: {
    flexDirection: 'row',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
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

  contentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* --- Shorts Tab Styles (Vertical Feed) --- */
  verticalShortCard: { width: '100%', backgroundColor: '#000', position: 'relative' },
  verticalShortOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  verticalShortInfo: { flex: 1, paddingRight: 24 },
  verticalShortTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 8, lineHeight: 22 },
  verticalShortAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verticalShortAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  verticalTinyAvatarText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  verticalShortAuthor: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  verticalShortActions: { alignItems: 'center', gap: 20 },
  verticalActionItem: { alignItems: 'center', gap: 4 },
  verticalActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  centerPlayWrapper: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  playIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 107, 0, 0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  centerPlayIcon: {
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  emptySavedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptySavedText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  listFooter: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
