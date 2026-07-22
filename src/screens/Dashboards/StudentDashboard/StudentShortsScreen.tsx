import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground, 
  FlatList, 
  ActivityIndicator,
  useWindowDimensions,
  Animated,
  Easing,
  Modal,
  TextInput,
  Share,
  ScrollView,
  ToastAndroid,
  Platform,
  Alert,
  Clipboard,
  Linking
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getShortsFeed, saveShort, unsaveShort, getSavedShorts, toggleLikeShort, addShortComment, getShortComments } from '@/api/student.services';
import { useAuth } from '@/context/AuthContext';
import { WebView } from 'react-native-webview';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { 
  Bookmark,
  BookmarkCheck,
  Eye,
  Play,
  Heart,
  MessageSquare,
  Share2,
  RotateCw,
  MoreVertical,
  Volume2,
  VolumeX,
  Search,
  Menu,
  Music,
  X,
  Send,
  Plus,
  Compass,
  Copy,
  MoreHorizontal,
  Paperclip
} from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';

// Reusable Video Player Logic inside a common wrapper
const VideoPlayerWebView = ({ video, isPlaying, isMuted }: { video: any, isPlaying: boolean, isMuted: boolean }) => {
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
    webViewRef.current?.injectJavaScript(`
      window.isPlayingState = ${isPlaying};
      var vid = document.getElementById("short_video");
      if (vid) {
        if (${isPlaying}) {
          vid.muted = ${isMuted}; 
          vid.play().catch(function(e) { 
            console.log("Play blocked, trying muted", e); 
            vid.muted = true; 
            vid.play().catch(function(err) { console.log("Play failed", err); }); 
          }); 
        } else {
          vid.pause();
        }
      }
      true;
    `);
  }, [isPlaying, isMuted, isTokenLoaded]);

  // Sync mute state dynamically
  useEffect(() => {
    if (!isTokenLoaded) return;
    webViewRef.current?.injectJavaScript(`
      window.isMutedState = ${isMuted};
      var vid = document.getElementById("short_video");
      if (vid) { 
        vid.muted = ${isMuted}; 
      } 
      true;
    `);
  }, [isMuted, isTokenLoaded]);

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
        <video id="short_video" preload="auto" loop playsinline autoplay style="display: none;"></video>
        
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
              
              videoElement.muted = window.isMutedState || false;
              if (window.isPlayingState) {
                videoElement.play().catch(function(err) {
                  console.log("Play failed, retrying muted", err);
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
              
              videoElement.muted = window.isMutedState || false;
              if (window.isPlayingState) {
                videoElement.play().catch(function(err) {
                  console.log("Fallback play failed", err);
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
const VerticalShortCard = ({ 
  video, 
  isPlaying: autoPlay, 
  isSaved, 
  isLiked, 
  isMuted, 
  onToggleSave, 
  onToggleLike, 
  onToggleMute, 
  onOpenDescription,
  onOpenComments,
  onOpenMoreOptions,
  onOpenDrawer,
  onOpenShare,
  cardHeight,
  likeCount
}: any) => {
   const [isPlaying, setIsPlaying] = useState(autoPlay);
   const insets = useSafeAreaInsets();

   useEffect(() => {
     setIsPlaying(autoPlay);
   }, [autoPlay]);

   return (
     <View style={[styles.verticalShortCard, { height: cardHeight }]}>
       {/* Background: Video Player or Poster Image */}
       {isPlaying ? (
         <View style={StyleSheet.absoluteFill}>
           <VideoPlayerWebView video={video} isPlaying={isPlaying} isMuted={isMuted} />
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

       {/* Top Row Controls Overlay */}
       <View style={[styles.topControlsOverlay, { paddingTop: Math.max(insets.top, 16) }]} pointerEvents="box-none">
         <TouchableOpacity style={styles.topCircleBtn} onPress={onOpenDrawer}>
           <Menu size={22} color="#FFFFFF" />
         </TouchableOpacity>

         <View style={styles.topRightControls}>
           <TouchableOpacity style={styles.topCircleBtn} onPress={onToggleMute}>
             {isMuted ? (
               <VolumeX size={22} color="#FFFFFF" />
             ) : (
               <Volume2 size={22} color="#FFFFFF" />
             )}
           </TouchableOpacity>

           <TouchableOpacity style={styles.topCircleBtn} onPress={() => Alert.alert("Search", "Search educational shorts is coming soon!")}>
             <Search size={22} color="#FFFFFF" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.topCircleBtn} onPress={() => onOpenMoreOptions(video)}>
             <MoreVertical size={22} color="#FFFFFF" />
           </TouchableOpacity>
         </View>
       </View>

       {/* Floating UI overlay on top of background */}
       <View style={styles.verticalShortOverlay} pointerEvents="box-none">
          {/* Bottom Left Info */}
          <View style={styles.verticalShortInfo} pointerEvents="box-none">
             {/* Profile avatar & handle */}
             <View style={styles.verticalShortAuthorRow} pointerEvents="box-none">
                <View style={styles.verticalShortAvatar}>
                   <Text style={styles.verticalTinyAvatarText}>{video.authorAvatar}</Text>
                </View>
                <Text style={styles.verticalShortAuthor}>{video.authorHandle}</Text>
             </View>

             {/* Description: 1 line limit, click opens bottomsheet */}
             <TouchableOpacity activeOpacity={0.8} onPress={() => onOpenDescription(video)} style={styles.descriptionTextContainer}>
                <Text style={styles.verticalShortTitle} numberOfLines={1} ellipsizeMode="tail">
                   {video.title}
                </Text>
                {video.description ? (
                  <Text style={styles.verticalShortDesc} numberOfLines={2} ellipsizeMode="tail">
                    {video.description}
                  </Text>
                ) : null}
                {video.tags && video.tags.length > 0 ? (
                  <Text style={styles.verticalShortTags}>
                    {video.tags.map((t: string) => t.startsWith('#') ? t : `#${t}`).join(' ')}
                  </Text>
                ) : null}
             </TouchableOpacity>
          </View>

          {/* Right Floating Actions (YouTube Shorts Style) */}
          <View style={styles.verticalShortActions}>
             {/* Like item */}
             <TouchableOpacity 
               onPress={() => onToggleLike?.(video.id)}
               style={styles.verticalActionItem}
             >
                <View style={styles.actionIconCircle}>
                   <Heart size={26} color={isLiked ? "#FF0000" : "#FFFFFF"} fill={isLiked ? "#FF0000" : "transparent"} />
                </View>
                <Text style={styles.verticalActionText}>{likeCount}</Text>
             </TouchableOpacity>

             {/* Comment item */}
             <TouchableOpacity 
               onPress={() => onOpenComments(video)}
               style={styles.verticalActionItem}
             >
                <View style={styles.actionIconCircle}>
                   <MessageSquare size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.verticalActionText}>{video.commentCount || 28}</Text>
             </TouchableOpacity>

             {/* Save/Unsave item in the actions column */}
             <TouchableOpacity 
               onPress={() => onToggleSave?.(video.id)}
               style={styles.verticalActionItem}
             >
                <View style={styles.actionIconCircle}>
                   {isSaved ? (
                     <BookmarkCheck size={26} color={colors.accent.DEFAULT} fill={colors.accent.DEFAULT} />
                   ) : (
                     <Bookmark size={26} color="#FFFFFF" />
                   )}
                </View>
                <Text style={styles.verticalActionText}>Save</Text>
             </TouchableOpacity>

             {/* Share item */}
             <TouchableOpacity 
               onPress={() => onOpenShare?.(video)}
               style={styles.verticalActionItem}
             >
                <View style={styles.actionIconCircle}>
                   <Share2 size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.verticalActionText}>Share</Text>
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

       {/* Very bottom Red progress line */}
       <View style={styles.bottomProgressBarBg}>
          <View style={[styles.bottomProgressBarFill, { width: isPlaying ? '60%' : '15%' }]} />
       </View>
     </View>
   );
};

// Main Screen Component
export const StudentShortsScreen = () => {
  const { userName } = useAuth();
  const navigation = useNavigation<any>();

  const [shortsList, setShortsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // Bottom Sheet/Modal States
  const [selectedShort, setSelectedShort] = useState<any>(null);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);
  const [isSavedVideosListVisible, setIsSavedVideosListVisible] = useState(false);
  const [isShareSheetVisible, setIsShareSheetVisible] = useState(false);

  // Comments List state mapped by short name/id
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name?: string; author: string } | null>(null);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);

  const formatComments = (rawList: any[]): any[] => {
    if (!Array.isArray(rawList)) return [];

    const mapComment = (item: any): any => {
      const commentId = String(item.name || item.id || Math.random());
      const authorEmail = item.comment_by || item.owner || item.user || item.author || "Anonymous";
      const authorName = authorEmail.includes("@") 
        ? authorEmail.split("@")[0].split(/[._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : authorEmail;
      const initials = authorName.substring(0, 2).toUpperCase() || "AN";
      const timeStr = item.creation ? item.creation.substring(0, 16) : (item.time || "Just now");
      
      const nestedReplies = Array.isArray(item.replies) ? item.replies.map(mapComment) : [];

      return {
        id: commentId,
        name: item.name || item.id || commentId,
        short: item.short,
        content: item.content || item.comment || item.text || "",
        text: item.content || item.comment || item.text || "",
        author: authorName,
        authorEmail: authorEmail,
        avatar: initials,
        time: timeStr,
        parent_comment: item.parent_comment || "",
        likes: item.like_count ?? item.likes ?? 0,
        isPinned: Boolean(item.is_pinned),
        replies: nestedReplies
      };
    };

    const isAlreadyNested = rawList.some(item => Array.isArray(item.replies));
    if (isAlreadyNested) {
      return rawList.map(mapComment);
    }

    const map: Record<string, any> = {};
    const rootComments: any[] = [];

    rawList.forEach((item: any) => {
      const formatted = mapComment(item);
      map[formatted.id] = formatted;
    });

    rawList.forEach((item: any) => {
      const commentId = String(item.name || item.id);
      const parentId = item.parent_comment ? String(item.parent_comment) : "";
      const commentObj = map[commentId];

      if (parentId && map[parentId]) {
        if (!map[parentId].replies.some((r: any) => r.id === commentId)) {
          map[parentId].replies.push(commentObj);
        }
      } else if (!parentId || !map[parentId]) {
        if (!rootComments.some((c: any) => c.id === commentId)) {
          rootComments.push(commentObj);
        }
      }
    });

    return rootComments;
  };

  const fetchCommentsForShort = async (shortId: string) => {
    if (!shortId) return;
    try {
      setCommentsLoading(true);
      const res = await getShortComments(String(shortId));
      let rawList = [];
      if (res && Array.isArray(res.message)) {
        rawList = res.message;
      } else if (res && Array.isArray(res.data)) {
        rawList = res.data;
      } else if (res && res.message && Array.isArray(res.message.data)) {
        rawList = res.message.data;
      }
      const formatted = formatComments(rawList);
      setCommentsMap(prev => ({
        ...prev,
        [shortId]: formatted
      }));
    } catch (err) {
      console.error("Error fetching comments for short:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Infinite Scroll / Window Calculations
  const { height } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(height);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedShorts, setDisplayedShorts] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const isBatchLoadingRef = useRef(false);
  const activeTogglesRef = useRef<Set<string>>(new Set());
  const BATCH_SIZE = 5;

  const fetchSaved = async () => {
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
    } catch (err) {
      console.error("Error loading saved shorts on mobile:", err);
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
          const posterUrl = item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${BASE_DOMAIN}${item.thumbnail}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'; 
          
          const skill = item.skill || "Skill";
          const authorAvatar = skill.substring(0, 2).toUpperCase();

          if (item.is_saved) {
            savedIdsFromFeed.push(String(item.name));
          }
          if (item.is_liked) {
            likedIdsFromFeed.push(String(item.name));
          }

          // Initial mock comments generator
          const mockComments = [
            { id: '1', author: '@codenewbie', avatar: 'CN', text: `This explanation of ${item.title || 'this topic'} is so clean!`, likes: 14, time: '2h' },
            { id: '2', author: '@techguru', avatar: 'TG', text: 'Wow, didn\'t know this could be done in React Native. Thanks!', likes: 8, time: '4h' },
            { id: '3', author: '@learner101', avatar: 'LE', text: 'Can you show how this integrates with the server next time?', likes: 2, time: '1d' }
          ];

          let tagsArray: string[] = [];
          if (Array.isArray(item.tags)) {
            tagsArray = item.tags;
          } else if (typeof item.tags === "string" && item.tags.trim() !== "") {
            tagsArray = item.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
          }
          tagsArray = tagsArray.map((t: string) => t.startsWith('#') ? t : `#${t}`);

          return {
            id: item.name,
            title: item.title || "Untitled Short",
            category: skill,
            duration: item.duration_display || `${item.duration_seconds || 30} sec`,
            views: item.views_display || `${item.view_count || 0}`,
            author: "StrideNex",
            authorHandle: "@stridenex",
            authorAvatar: authorAvatar,
            tags: tagsArray,
            description: item.description || "",
            isSaved: Boolean(item.is_saved),
            videoUrl: videoUrl,
            posterUrl: posterUrl,
            commentCount: mockComments.length,
            comments: mockComments,
            likes: item.likes_count !== undefined ? String(item.likes_count) : (item.likes !== undefined ? String(item.likes) : "0")
          };
        });

        // Initialize comments mapping
        const cMap: Record<string, any[]> = {};
        mapped.forEach((v: any) => {
          cMap[v.id] = v.comments;
        });
        setCommentsMap(cMap);

        // Initialize like counts mapping
        const likesMap: Record<string, number> = {};
        rawShorts.forEach((item: any) => {
          likesMap[String(item.name)] = item.likes_count !== undefined 
            ? Number(item.likes_count) 
            : (item.likes !== undefined ? Number(item.likes) : 0);
        });
        setLikeCounts(likesMap);

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
    fetchSaved();
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
    if (!userName) return;

    const key = `save-${id}`;
    if (activeTogglesRef.current.has(key)) return;
    activeTogglesRef.current.add(key);

    const isAlreadySaved = savedItems.includes(String(id));

    try {
      setSavedItems(prev => prev.includes(String(id)) ? prev.filter(item => item !== String(id)) : [...prev, String(id)]);

      if (isAlreadySaved) {
        await unsaveShort({ user: userName, short_name: String(id) });
        if (Platform.OS === 'android') {
          ToastAndroid.show("Unsaved from your Library", ToastAndroid.SHORT);
        }
      } else {
        await saveShort({ user: userName, short_name: String(id) });
        if (Platform.OS === 'android') {
          ToastAndroid.show("Saved to your Library", ToastAndroid.SHORT);
        }
      }
      fetchSaved();
    } catch (error) {
      console.error("Error saving short on mobile:", error);
      setSavedItems(prev => isAlreadySaved ? [...prev, String(id)] : prev.filter(item => item !== String(id)));
    } finally {
      activeTogglesRef.current.delete(key);
    }
  };

  const toggleLike = async (id: any) => {
    if (!userName) return;

    const key = `like-${id}`;
    if (activeTogglesRef.current.has(key)) return;
    activeTogglesRef.current.add(key);

    const isAlreadyLiked = likedItems.includes(String(id));

    try {
      setLikedItems(prev => prev.includes(String(id)) ? prev.filter(item => item !== String(id)) : [...prev, String(id)]);
      
      setLikeCounts(prev => {
        const currentCount = prev[String(id)] || 0;
        const newCount = isAlreadyLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
        return { ...prev, [String(id)]: newCount };
      });

      const res = await toggleLikeShort({ short: String(id) });
      const serverLikeCount = res?.message?.like_count !== undefined 
        ? Number(res.message.like_count) 
        : (res?.data?.message?.like_count !== undefined 
            ? Number(res.data.message.like_count) 
            : null);
      if (serverLikeCount !== null) {
        setLikeCounts(prev => ({
          ...prev,
          [String(id)]: serverLikeCount
        }));
      }
    } catch (error) {
      console.error("Error toggling like on mobile:", error);
      setLikedItems(prev => isAlreadyLiked ? [...prev, String(id)] : prev.filter(item => item !== String(id)));
      setLikeCounts(prev => {
        const currentCount = prev[String(id)] || 0;
        const newCount = isAlreadyLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
        return { ...prev, [String(id)]: newCount };
      });
    } finally {
      activeTogglesRef.current.delete(key);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  // Open overlays
  const openDescription = (video: any) => {
    setSelectedShort(video);
    setIsDescriptionVisible(true);
  };

  const openComments = (video: any) => {
    setSelectedShort(video);
    setReplyingTo(null);
    setIsCommentsVisible(true);
    if (video && video.id) {
      fetchCommentsForShort(String(video.id));
    }
  };

  const openMoreOptions = (video: any) => {
    setSelectedShort(video);
    setIsMoreOptionsVisible(true);
  };

  const openShare = (video: any) => {
    setSelectedShort(video);
    setIsShareSheetVisible(true);
  };

  const shareToWhatsApp = async (video: any) => {
    const text = `Check out this Educational Short: "${video.title}"\nWatch here: ${video.videoUrl}`;
    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
      }
    } catch (err) {
      console.log("Error sharing to WhatsApp:", err);
      systemShare(video);
    }
  };

  const shareToTelegram = async (video: any) => {
    const text = `Check out this Educational Short: "${video.title}"\nWatch here: ${video.videoUrl}`;
    const url = `tg://msg?text=${encodeURIComponent(text)}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://t.me/share/url?url=${encodeURIComponent(video.videoUrl)}&text=${encodeURIComponent(video.title)}`);
      }
    } catch (err) {
      console.log("Error sharing to Telegram:", err);
      systemShare(video);
    }
  };

  const shareToInstagram = async (video: any) => {
    Clipboard.setString(video.videoUrl);
    Alert.alert(
      "Instagram Share",
      "Video link copied to clipboard! Open Instagram to share it with your friends.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Open Instagram", 
          onPress: async () => {
            const url = "instagram://camera";
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                await Linking.openURL("https://instagram.com");
              }
            } catch (err) {
              console.log("Error opening Instagram:", err);
            }
          }
        }
      ]
    );
  };

  const copyShortsLink = (video: any) => {
    Clipboard.setString(video.videoUrl);
    if (Platform.OS === 'android') {
      ToastAndroid.show("Link copied to clipboard!", ToastAndroid.SHORT);
    } else {
      Alert.alert("Link Copied", "Video URL copied to clipboard!");
    }
  };

  const systemShare = async (video: any) => {
    try {
      await Share.share({
        title: video.title,
        message: `Check out this Educational Short: "${video.title}"\nWatch here: ${video.videoUrl}`,
      });
    } catch (error) {
      console.log("System Share failed:", error);
    }
  };

  const handlePostComment = async () => {
    if (!newCommentText.trim() || !selectedShort) return;
    const shortId = String(selectedShort.id);
    const contentText = newCommentText.trim();
    const parentCommentId = replyingTo ? (replyingTo.name || replyingTo.id) : "";

    setNewCommentText('');
    setReplyingTo(null);

    try {
      await addShortComment({
        short: shortId,
        content: contentText,
        parent_comment: parentCommentId
      });
      await fetchCommentsForShort(shortId);

      setShortsList(prev => prev.map(s => s.id === selectedShort.id ? { ...s, commentCount: (s.commentCount || 0) + 1 } : s));
      setDisplayedShorts(prev => prev.map(s => s.id === selectedShort.id ? { ...s, commentCount: (s.commentCount || 0) + 1 } : s));
    } catch (err) {
      console.error("Error posting short comment:", err);
      Alert.alert("Error", "Failed to post comment. Please try again.");
    }
  };

  const flatListRef = useRef<FlatList>(null);

  const handlePlaySavedShort = (savedId: string) => {
    const idx = shortsList.findIndex(s => s.id === savedId);
    if (idx !== -1) {
      setIsSavedVideosListVisible(false);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: idx, animated: true });
        setActiveIndex(idx);
      }, 300);
    } else {
      Alert.alert("Play Short", "Short is not loaded in feed.");
    }
  };

  const currentComments = selectedShort ? (commentsMap[selectedShort.id] || []) : [];

  const renderCommentItem = (comment: any, isReply = false) => (
    <View key={comment.id} style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={[styles.commentAvatar, isReply && styles.replyAvatar]}>
        <Text style={styles.commentAvatarText}>{comment.avatar}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentMeta}>
          <Text style={styles.commentAuthor}>{comment.author}</Text>
          <Text style={styles.commentTime}>{comment.time}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text || comment.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentActionBtn}
            onPress={() => setReplyingTo({ id: comment.id, name: comment.name || comment.id, author: comment.author })}
          >
            <MessageSquare size={14} color="#64748B" />
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
        </View>
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesList}>
            {comment.replies.map((reply: any) => renderCommentItem(reply, true))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Feed Container */}
      <View 
        style={styles.contentContainer}
        onLayout={({ nativeEvent }) => {
          const { height: layoutHeight } = nativeEvent.layout;
          if (layoutHeight > 0) {
            setContainerHeight(layoutHeight);
          }
        }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.loadingText}>Loading study shorts...</Text>
          </View>
        ) : shortsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No study shorts available.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayedShorts}
            renderItem={({ item, index }) => (
              <VerticalShortCard 
                video={item} 
                isPlaying={index === activeIndex}
                isSaved={savedItems.includes(String(item.id))}
                isLiked={likedItems.includes(String(item.id))}
                isMuted={isMuted}
                onToggleSave={toggleSave}
                onToggleLike={toggleLike}
                onToggleMute={() => setIsMuted(!isMuted)}
                onOpenDescription={openDescription}
                onOpenComments={openComments}
                onOpenMoreOptions={openMoreOptions}
                onOpenShare={openShare}
                onOpenDrawer={() => navigation.dispatch(DrawerActions.openDrawer())}
                cardHeight={containerHeight}
                likeCount={likeCounts[String(item.id)] !== undefined ? likeCounts[String(item.id)] : 0}
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
            getItemLayout={(data, index) => (
              { length: containerHeight, offset: containerHeight * index, index }
            )}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.listFooter}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* --- DESCRIPTION BOTTOM SHEET --- */}
      <Modal
        visible={isDescriptionVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDescriptionVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setIsDescriptionVisible(false)}
        >
          <View style={styles.bottomSheetContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Description</Text>
              <TouchableOpacity onPress={() => setIsDescriptionVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {selectedShort && (
              <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.descFullTitle}>{selectedShort.title}</Text>
                
                {/* Stats Row */}
                <View style={styles.descStatsRow}>
                  <View style={styles.descStatItem}>
                    <Text style={styles.descStatVal}>{selectedShort.views}</Text>
                    <Text style={styles.descStatLabel}>Views</Text>
                  </View>
                  <View style={styles.descDivider} />
                  <View style={styles.descStatItem}>
                    <Text style={styles.descStatVal}>{selectedShort.duration}</Text>
                    <Text style={styles.descStatLabel}>Duration</Text>
                  </View>
                  <View style={styles.descDivider} />
                  <View style={styles.descStatItem}>
                    <Text style={styles.descStatVal}>{selectedShort.category}</Text>
                    <Text style={styles.descStatLabel}>Skill</Text>
                  </View>
                </View>

                {/* Profile creator Row */}
                <View style={styles.descCreatorRow}>
                  <View style={styles.descAvatar}>
                    <Text style={styles.descAvatarText}>{selectedShort.authorAvatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.descAuthorName}>{selectedShort.author}</Text>
                    <Text style={styles.descAuthorHandle}>{selectedShort.authorHandle}</Text>
                  </View>
                </View>

                <View style={styles.descTextContainer}>
                  <Text style={styles.descText}>
                     {selectedShort.description || `This educational short covers ${selectedShort.title}. In this video, we explore core programming skills and practical insights in ${selectedShort.category} to boost your career. Use StrideNex to practice and level up your skills.`}
                  </Text>
                  {selectedShort.tags && selectedShort.tags.length > 0 && (
                    <Text style={styles.descTags}>
                      {selectedShort.tags.map((t: string) => t.startsWith('#') ? t : `#${t}`).join(' ')}
                    </Text>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- COMMENTS BOTTOM SHEET --- */}
      <Modal
        visible={isCommentsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCommentsVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setIsCommentsVisible(false)}
        >
          <View style={styles.bottomSheetContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Comments ({currentComments.length})</Text>
              <TouchableOpacity onPress={() => setIsCommentsVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView contentContainerStyle={styles.commentsScroll} showsVerticalScrollIndicator={false}>
              {commentsLoading ? (
                <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 20 }} />
              ) : currentComments.length === 0 ? (
                <View style={styles.noCommentsWrapper}>
                  <Text style={styles.noCommentsText}>No comments yet. Start the conversation!</Text>
                </View>
              ) : (
                currentComments.map((comment: any) => renderCommentItem(comment))
              )}
            </ScrollView>

            {/* Replying Banner */}
            {replyingTo && (
              <View style={styles.replyingToBanner}>
                <Text style={styles.replyingToText}>
                  Replying to <Text style={{ fontWeight: '700', color: '#0F172A' }}>@{replyingTo.author}</Text>
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            )}

            {/* Comment Input Box */}
            <View style={styles.commentInputBox}>
              <TextInput
                style={styles.commentInput}
                placeholder={replyingTo ? `Reply to @${replyingTo.author}...` : "Add a comment..."}
                placeholderTextColor="#94A3B8"
                value={newCommentText}
                onChangeText={setNewCommentText}
              />
              <TouchableOpacity 
                style={[styles.commentPostBtn, !newCommentText.trim() && styles.disabledPostBtn]}
                onPress={handlePostComment}
                disabled={!newCommentText.trim()}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- MORE OPTIONS BOTTOM SHEET --- */}
      <Modal
        visible={isMoreOptionsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsMoreOptionsVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setIsMoreOptionsVisible(false)}
        >
          <View style={styles.bottomSheetContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Options</Text>
              <TouchableOpacity onPress={() => setIsMoreOptionsVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {selectedShort && (
              <View style={styles.optionsList}>
                <TouchableOpacity 
                  style={styles.optionBtn}
                  onPress={() => {
                    setIsMoreOptionsVisible(false);
                    setTimeout(() => {
                      setIsSavedVideosListVisible(true);
                      fetchSaved();
                    }, 300);
                  }}
                >
                  <BookmarkCheck size={20} color="#0F172A" />
                  <Text style={styles.optionBtnText}>Saved</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionBtn}
                  onPress={() => {
                    setIsMoreOptionsVisible(false);
                    Alert.alert("Playlists", "Short added to Playlist!");
                  }}
                >
                  <Plus size={20} color="#0F172A" />
                  <Text style={styles.optionBtnText}>Add to Playlist</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionBtn}
                  onPress={() => {
                    setIsMoreOptionsVisible(false);
                    if (Platform.OS === 'android') {
                      ToastAndroid.show("We will suggest fewer videos like this", ToastAndroid.SHORT);
                    } else {
                      Alert.alert("Not Interested", "We will suggest fewer videos like this.");
                    }
                  }}
                >
                  <Compass size={20} color="#0F172A" />
                  <Text style={styles.optionBtnText}>Not Interested</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.optionBtn, { borderBottomWidth: 0 }]}
                  onPress={() => {
                    setIsMoreOptionsVisible(false);
                    Alert.alert("Report", "Thank you, we've received your report.");
                  }}
                >
                  <X size={20} color="#EF4444" />
                  <Text style={[styles.optionBtnText, { color: '#EF4444' }]}>Report Video</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- SAVED VIDEOS LIST MODAL --- */}
      <Modal
        visible={isSavedVideosListVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSavedVideosListVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setIsSavedVideosListVisible(false)}
        >
          <View style={styles.bottomSheetContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Saved Shorts Playlist</Text>
              <TouchableOpacity onPress={() => setIsSavedVideosListVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.savedListScroll} showsVerticalScrollIndicator={false}>
              {savedItems.length === 0 ? (
                <View style={styles.emptySavedContainer}>
                  <Bookmark size={48} color="#CBD5E1" />
                  <Text style={styles.emptySavedText}>No saved shorts yet.</Text>
                  <Text style={styles.emptySavedSubtext}>Click the 3-dots on any Short video to save it here!</Text>
                </View>
              ) : (
                shortsList
                  .filter(item => savedItems.includes(String(item.id)))
                  .map(item => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.savedPlaylistItem}
                      onPress={() => handlePlaySavedShort(item.id)}
                    >
                      <ImageBackground 
                        source={{ uri: item.posterUrl }} 
                        style={styles.playlistThumb}
                        imageStyle={{ borderRadius: 8 }}
                        resizeMode="cover"
                      >
                         <View style={styles.playlistPlayIndicator}>
                            <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                         </View>
                      </ImageBackground>
                      <View style={styles.playlistDetails}>
                        <Text style={styles.playlistTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.playlistViews}>{item.views} views • {item.category}</Text>
                        <Text style={styles.playlistAuthor}>{item.authorHandle}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- CUSTOM SHARE SHEET MODAL --- */}
      <Modal
        visible={isShareSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsShareSheetVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setIsShareSheetVisible(false)}
        >
          <View style={styles.bottomSheetContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Share Short</Text>
              <TouchableOpacity onPress={() => setIsShareSheetVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.shareOptionsGrid}>
              {/* WhatsApp Button */}
              <TouchableOpacity 
                style={styles.shareOptionItem}
                onPress={() => {
                  setIsShareSheetVisible(false);
                  if (selectedShort) shareToWhatsApp(selectedShort);
                }}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12.03 2a9.97 9.97 0 0 0-9.97 9.97c0 1.83.49 3.6 1.42 5.16L2 22l5.03-1.32a9.93 9.93 0 0 0 5 1.34h.03a9.97 9.97 0 0 0 9.97-9.97A9.97 9.97 0 0 0 12.03 2zm5.72 14.12c-.25.7-.98 1.28-1.74 1.48-.48.13-1.12.24-3.23-.63-2.69-1.1-4.42-3.83-4.55-4-.13-.17-.98-1.3-.98-2.48s.6-1.74.82-1.98c.22-.24.49-.3.65-.3.17 0 .34 0 .49.01.16.01.37-.06.58.45.21.52.74 1.78.8 1.9.06.12.1.27.02.43-.08.16-.16.27-.27.4-.11.13-.24.3-.34.4-.11.12-.23.25-.1.47.13.22.58.96 1.25 1.56.86.77 1.58 1.01 1.8 1.12.22.12.35.1.48-.05.13-.16.58-.67.74-.9.16-.23.33-.19.55-.11.23.08 1.47.69 1.72.82.26.13.43.2.49.31.06.1.06.6-.19 1.3z"
                      fill="#FFFFFF"
                    />
                  </Svg>
                </View>
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>

              {/* Telegram Button */}
              <TouchableOpacity 
                style={styles.shareOptionItem}
                onPress={() => {
                  setIsShareSheetVisible(false);
                  if (selectedShort) shareToTelegram(selectedShort);
                }}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#0088cc' }]}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M9.78 18.65c-.48 0-.4-.18-.57-.66l-2.03-6.68L18.6 5.62c.52-.35.95-.1.52.28L8.67 15.11l.24 3c.27 0 .39-.12.53-.26l1.3-1.26 2.7 2c.5.28.85.13.97-.47l3.6-17c.18-.73-.28-1.04-.84-.79L3.08 6.42c-.7.28-.69.68-.12.86l4.38 1.37 10.15-6.39c.48-.29.92-.13.56.19z"
                      fill="#FFFFFF"
                    />
                  </Svg>
                </View>
                <Text style={styles.shareOptionText}>Telegram</Text>
              </TouchableOpacity>

              {/* Instagram Button */}
              <TouchableOpacity 
                style={styles.shareOptionItem}
                onPress={() => {
                  setIsShareSheetVisible(false);
                  if (selectedShort) shareToInstagram(selectedShort);
                }}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#E1306C' }]}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="3" width="18" height="18" rx="5" ry="5" stroke="#FFFFFF" strokeWidth="2" />
                    <Circle cx="12" cy="12" r="4" stroke="#FFFFFF" strokeWidth="2" />
                    <Circle cx="17.5" cy="6.5" r="1.5" fill="#FFFFFF" />
                  </Svg>
                </View>
                <Text style={styles.shareOptionText}>Instagram</Text>
              </TouchableOpacity>

              {/* Copy Link Button */}
              <TouchableOpacity 
                style={styles.shareOptionItem}
                onPress={() => {
                  setIsShareSheetVisible(false);
                  if (selectedShort) copyShortsLink(selectedShort);
                }}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#64748B' }]}>
                  <Copy size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>Copy Link</Text>
              </TouchableOpacity>

              {/* System Share (More) Button */}
              <TouchableOpacity 
                style={styles.shareOptionItem}
                onPress={() => {
                  setIsShareSheetVisible(false);
                  if (selectedShort) systemShare(selectedShort);
                }}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#1E293B' }]}>
                  <MoreHorizontal size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  contentContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },

  /* --- Shorts Tab Styles (Vertical Feed) --- */
  verticalShortCard: { 
    width: '100%', 
    backgroundColor: '#000000', 
    position: 'relative',
    overflow: 'hidden'
  },
  
  // Custom Top Overlays
  topControlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom Content Overlay
  verticalShortOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    paddingHorizontal: 16, 
    paddingBottom: 28, 
    paddingTop: 60, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    backgroundColor: 'transparent' 
  },
  verticalShortInfo: { 
    flex: 1, 
    paddingRight: 12,
    marginBottom: 6,
  },
  
  // Title Description Clickable
  descriptionTextContainer: {
    marginVertical: 8,
  },
  verticalShortTitle: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '600', 
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  verticalShortDesc: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  verticalShortTags: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  
  // Creator Row
  verticalShortAuthorRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    marginBottom: 4,
  },
  verticalShortAvatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  verticalTinyAvatarText: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#0F172A' 
  },
  verticalShortAuthor: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  subscribeBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginLeft: 6,
  },
  subscribeBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },

  // Marquee Music sound track style
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  marqueeContainer: {
    width: 150,
    overflow: 'hidden',
  },
  musicText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },

  // Right vertical actions column
  verticalShortActions: { 
    alignItems: 'center', 
    gap: 6,
  },
  verticalActionItem: { 
    alignItems: 'center', 
    gap: 1 
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalActionText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },

  // Vinyl disc spinning rotation
  vinylDiscContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  vinylDiscImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylDiscCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  // Center Play Overlay
  centerPlayWrapper: { 
    ...StyleSheet.absoluteFillObject, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'transparent' 
  },
  playIconCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8 
  },
  centerPlayIcon: {
    marginLeft: 4,
  },

  // Bottom Timeline Progress Indicator
  bottomProgressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bottomProgressBarFill: {
    height: '100%',
    backgroundColor: '#FF0000',
  },

  // Loading and error views
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000'
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000'
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  listFooter: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },

  /* --- BOTTOM SHEETS AND MODALS STYLING --- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
    maxHeight: '75%',
    minHeight: '40%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  sheetContent: {
    paddingVertical: 16,
  },
  
  // Description details
  descFullTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    lineHeight: 22,
  },
  descStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  descStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  descStatVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  descStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  descDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  descCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  descAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  descAuthorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  descAuthorHandle: {
    fontSize: 12,
    color: '#64748B',
  },
  descTextContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  descText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  descTags: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
    marginTop: 8,
  },

  // Options Sheet styling
  optionsList: {
    paddingVertical: 8,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  // Comments sheet styling
  commentsScroll: {
    paddingVertical: 12,
  },
  noCommentsWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 13,
    color: '#64748B',
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  commentBody: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  commentTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  commentText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  commentInputBox: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
  },
  commentPostBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledPostBtn: {
    backgroundColor: '#CBD5E1',
  },

  // Saved playlist list styling
  savedListScroll: {
    paddingVertical: 12,
  },
  emptySavedContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptySavedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 12,
  },
  emptySavedSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  savedPlaylistItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  playlistThumb: {
    width: 100,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistPlayIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  playlistTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16,
  },
  playlistViews: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  playlistAuthor: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  shareOptionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  shareOptionItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shareOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  replyItem: {
    marginTop: 8,
    paddingLeft: 0,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  repliesList: {
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
  },
  replyingToBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  replyingToText: {
    fontSize: 12,
    color: '#64748B',
  },
});
