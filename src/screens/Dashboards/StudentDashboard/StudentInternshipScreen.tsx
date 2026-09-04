import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Modal,
  RefreshControl,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Briefcase, 
  Send, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Clock, 
  IndianRupee,
  ShieldCheck,
  Bookmark,
  TrendingUp,
  X,
  Target,
  Trophy,
  GraduationCap,
  Info,
  Search
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SwipeableRow, SwipeAction } from '@/components/Shared/SwipeableRow';
import { OfferLetterModal } from '@/components/Shared/OfferLetterModal';
import { useAuth } from '@/context/AuthContext';
import { 
  getStudentInternshipList, 
  applyOpportunity, 
  getStudentByEmail,
  getStudentApplications,
  updateApplicationStatus
} from '@/api/student.services';

export const StudentInternshipScreen = () => {
  const { userName } = useAuth();
  
  // Data list
  const [internships, setInternships] = useState<any[]>([]);
  const [studentApplications, setStudentApplications] = useState<any[]>([]);
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({ total_internships: 0, scheduled_interview_count: 0 });
  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [successfullyApplied, setSuccessfullyApplied] = useState<string[]>([]);
  
  // Details Modal
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Offer Letter Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPdfUrl, setOfferPdfUrl] = useState<string | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [selectedOfferApp, setSelectedOfferApp] = useState<{item: any, type: string} | null>(null);
  const [rejectingOffer, setRejectingOffer] = useState<string | null>(null);
  
  // Cached student profile info
  const [studentProfile, setStudentProfile] = useState<any>(null);

  const getApplicationName = (item: any, type: string) => {
    if (item.application) return item.application;
    if (item.application_name) return item.application_name;
    if (item.application_id) return item.application_id;
    
    const match = studentApplications.find(app => {
      if (type === "Internship") {
        return app.internship === item.name;
      }
      if (type === "Project") {
        return app.project === item.name;
      }
      if (type === "Job") {
        return app.job_profile === item.name;
      }
      return false;
    });
    return match?.name || null;
  };

  const handleAcceptOffer = async (item: any, type: string) => {
    const appName = getApplicationName(item, type);
    if (!appName) {
      Alert.alert("Error", "Application ID not found. Please try refreshing the screen.");
      return;
    }
    
    Alert.alert(
      "Accept Offer",
      "Are you sure you want to accept this offer?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: async () => {
            try {
              setAcceptingOffer(item.name);
              await updateApplicationStatus(appName, "Accepted");
              Alert.alert("Success", "Congratulations! You have accepted the offer.");
              fetchInternshipsData();
            } catch (err: any) {
              console.error("Error accepting offer:", err);
              Alert.alert("Error", err.message || "Failed to accept the offer. Please try again.");
            } finally {
              setAcceptingOffer(null);
              setShowOfferModal(false);
            }
          }
        }
      ]
    );
  };

  const handleRejectOffer = async (item: any, type: string) => {
    const appName = getApplicationName(item, type);
    if (!appName) return;
    
    Alert.alert(
      "Reject Offer",
      "Are you sure you want to reject this offer? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              setRejectingOffer(item.name);
              await updateApplicationStatus(appName, "Rejected");
              Alert.alert("Success", "You have rejected the offer.");
              fetchInternshipsData();
            } catch (err: any) {
              console.error("Error rejecting offer:", err);
              Alert.alert("Error", err.message || "Failed to reject the offer.");
            } finally {
              setRejectingOffer(null);
              setShowOfferModal(false);
            }
          }
        }
      ]
    );
  };

  const handleViewOfferLetter = async (item: any, type: string) => {
    setSelectedOfferApp({ item, type });
    setShowOfferModal(true);
    setLoadingOffer(true);
    setOfferPdfUrl(null);
    
    try {
      const queryParams = new URLSearchParams({
        student: userName || "", // Use the user identifier
        name: item.name || "",
        offer_type: type || "",
        template: type || ""
      }).toString();
      
      const storedToken = await AsyncStorage.getItem("token");
      const token = storedToken ? storedToken.trim() : null;
      const authHeader: Record<string, string> = token ? { "Authorization": `token ${token}` } : {};

      const response = await fetch(`https://devstridenex.quantcloud.in/api/method/stridenex_app.api_stridenex_app.app.get_offer_letter?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeader
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to load offer letter");
      }
      
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setOfferPdfUrl(base64data);
        setLoadingOffer(false);
      };
      
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Could not load the offer letter.");
      setShowOfferModal(false);
      setLoadingOffer(false);
    }
  };

  // Fetch student profile details (course, department, etc.) to use as query filters
  const fetchStudentProfile = async () => {
    if (!userName) return null;
    try {
      const response = await getStudentByEmail(userName);
      const profile = response?.message?.data || response?.data || response || {};
      setStudentProfile(profile);
      return profile;
    } catch (err) {
      console.error("Error fetching student profile:", err);
      return null;
    }
  };

  const [search, setSearch] = useState("");

  // Fetch Internships list
  const fetchInternshipsData = useCallback(async (profileData?: any, searchVal?: string) => {
    try {
      const profile = profileData || studentProfile || {};
      let appsList: any[] = [];
      if (userName) {
        try {
          const resApps = await getStudentApplications({ student: userName, opportunity_type: "Internship" });
          appsList = resApps?.data?.data || resApps?.message?.data || resApps?.data || resApps?.message || [];
          setStudentApplications(Array.isArray(appsList) ? appsList : []);
        } catch (err) {
          console.error("Error fetching student applications list:", err);
        }
      }

      const response = await getStudentInternshipList(
        userName || undefined,
        profile.course || null,
        profile.department || null,
        profile.current_year || profile.academic_year || null,
        searchVal !== undefined ? searchVal : search
      );
      const dataContainer = (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) ? response : (response?.message && typeof response.message === 'object' ? response.message : response);
      const data = dataContainer?.data?.internships || dataContainer?.internships || [];
      
      const mappedInternships = (Array.isArray(data) ? data : []).map((item: any) => {
        const match = appsList.find(app => app.internship === item.name);
        if (match) {
          return { ...item, applied_status: match.status };
        }
        return item;
      });

      const stats = dataContainer?.data?.statistics || dataContainer?.statistics || {};
      setInternships(mappedInternships);
      setStatistics({
        total_internships: stats.total_internships ?? mappedInternships.length,
        scheduled_interview_count: stats.scheduled_interview_count ?? 0,
      });
    } catch (err) {
      console.error("Error fetching internships:", err);
    }
  }, [userName, studentProfile, search]);

  // Load all data
  const loadData = useCallback(async (showIndicator = true) => {
    if (showIndicator) setLoading(true);
    
    // First retrieve the profile so we get course/dept filters
    const profile = await fetchStudentProfile();
    
    // Fetch lists
    await fetchInternshipsData(profile, search);
    
    setLoading(false);
  }, [userName, search, fetchInternshipsData]);

  useEffect(() => {
    loadData();
  }, [userName]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (studentProfile) {
        fetchInternshipsData(studentProfile, search);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const onRefresh = async () => {
    setRefreshing(true);
    const profile = await fetchStudentProfile();
    await fetchInternshipsData(profile, search);
    setRefreshing(false);
  };

  // Apply for Internship handler
  const handleApplyInternship = async (internship: any) => {
    if (!userName) {
      Alert.alert("Authentication Required", "Please log in to apply.");
      return;
    }

    try {
      setApplying(internship.name);
      const payload = {
        student: userName,
        opportunity_type: "Internship",
        opportunity_name: internship.name,
        notes: "Very interested in this internship, available immediately."
      };

      const response = await applyOpportunity(payload);

      if (response && (response.status === 200 || response.status === "200" || response.message?.status === 200 || response.message?.message?.includes("success"))) {
        Alert.alert("Success", `Applied successfully for ${internship.role_name || internship.title || 'the internship'}!`);
        loadData(false);
      } else {
        const errMsg = response && typeof response.message === 'object' 
          ? response.message.message 
          : response?.message;
        Alert.alert("Error", errMsg || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.error("Application error:", err);
      Alert.alert("Error", err?.message || "Something went wrong. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  // Helper for Internship status styling
  const getInternshipStatusConfig = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'applied':
        return { bg: "#EFF6FF", text: "#2563EB", border: "#DBEAFE", label: "Applied" };
      case 'shortlisted':
        return { bg: "#ECFDF5", text: "#059669", border: "#D1FAE5", label: "Shortlisted" };
      case 'interview scheduled':
        return { bg: "#F5F3FF", text: "#7C3AED", border: "#EDE9FE", label: "Interview Scheduled" };
      case 'tech interview':
        return { bg: "#EDE9FE", text: "#6D28D9", border: "#DDD6FE", label: "Tech Interview" };
      case 'rejected':
        return { bg: "#FEF2F2", text: "#DC2626", border: "#FEE2E2", label: "Rejected" };
      case 'selected':
        return { bg: "#FFFBEB", text: "#D97706", border: "#FEF3C7", label: "Selected" };
      case 'accepted':
        return { bg: "#ECFDF5", text: "#059669", border: "#D1FAE5", label: "Accepted" };
      default:
        return { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0", label: status || "N/A" };
    }
  };

  // Computed stats lists
  const internshipStats = useMemo(() => [
    { id: 1, title: "APPLIED", value: internships.filter(i => i.applied_status === "Applied").length, icon: Send, color: "#3B82F6" },
    { id: 2, title: "SHORTLISTED", value: internships.filter(i => i.applied_status === "Shortlisted").length, icon: CheckCircle2, color: "#10B981" },
    { id: 3, title: "INTERVIEWS", value: statistics.scheduled_interview_count, icon: Calendar, color: "#8B5CF6" },
    { id: 4, title: "MATCHING", value: statistics.total_internships || internships.length, icon: Briefcase, color: colors.accent.DEFAULT },
  ], [internships, statistics]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        <Text style={styles.loadingText}>Fetching internships...</Text>
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
            <Briefcase size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>CAREER OPPORTUNITIES</Text>
          </View>
          <Text style={styles.title}>Internship Ledger</Text>
          <Text style={styles.subtitle}>Apply to verified roles and tracking slots</Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInRight.delay(200)} style={styles.statsRow}>
          {internshipStats.map((stat) => (
            <StatsCard 
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInUp.delay(250)} style={styles.searchContainer}>
          <Search size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search internships..." 
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Animated.View>

        {/* Matching Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleSimple}>Open Openings</Text>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <TrendingUp size={14} color="#64748B" />
            <Text style={styles.filterText}>Relevance</Text>
          </TouchableOpacity>
        </View>

        {/* Listings */}
        <View style={styles.listContainer}>
          {internships.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Briefcase size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No matching internships found.</Text>
            </View>
          ) : (
            internships.map((internship, index) => {
              const statusConf = getInternshipStatusConfig(internship.applied_status || "");
              const isClosed = internship.status?.toLowerCase() === 'closed';
              const hasApplied = internship.applied_status && internship.applied_status !== "Not Applied";
              const isCurrentApplying = applying === internship.name;

              const actions: SwipeAction[] = [
                {
                  label: 'Details',
                  icon: Info,
                  color: '#2563EB',
                  bgColor: '#EFF6FF',
                  onPress: () => {
                    setSelectedInternship(internship);
                    setShowDetailsModal(true);
                  }
                }
              ];

              if (!isClosed && !hasApplied) {
                actions.push({
                  label: 'Apply',
                  icon: Briefcase,
                  color: '#10B981',
                  bgColor: '#ECFDF5',
                  onPress: () => handleApplyInternship(internship)
                });
              } else if (hasApplied) {
                actions.push({
                  label: String(statusConf.label || 'Applied'),
                  icon: CheckCircle2,
                  color: statusConf.text || '#2563EB',
                  bgColor: statusConf.bg || '#EFF6FF',
                  onPress: () => {}
                });
                
                if (internship.applied_status?.toLowerCase() === "selected") {
                  actions.push({
                    label: 'View Offer',
                    icon: CheckCircle2,
                    color: '#059669',
                    bgColor: '#ECFDF5',
                    onPress: () => handleViewOfferLetter(internship, "Internship")
                  });
                }
              }

              return (
                <Animated.View 
                  key={internship.name || index} 
                  entering={FadeInUp.delay(300 + index * 100)}
                >
                  <SwipeableRow actions={actions}>
                    <View style={[styles.internshipCard, isClosed && { borderLeftColor: '#94A3B8' }]}>
                      <View style={styles.cardTop}>
                        <View style={styles.companyInfo}>
                          <View style={[styles.companyLogo, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                            <Text style={[styles.logoText, { color: colors.accent.DEFAULT }]}>
                              {(internship.role_name || internship.title || "I")[0]}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.jobTitle} numberOfLines={1}>
                              {internship.role_name || internship.title || "Internship Role"}
                            </Text>
                            <Text style={styles.companyName} numberOfLines={1}>
                              {internship.industry || "Industry Partner"}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.matchBadge}>
                          <Text style={[styles.matchValue, { color: '#059669' }]}>
                            {internship.match_score || 100}%
                          </Text>
                          <Text style={styles.matchLabel}>MATCH</Text>
                        </View>
                      </View>

                      {/* Status Badges */}
                      <View style={styles.statusBadgesRow}>
                        {isClosed ? (
                          <View style={[styles.statusTag, styles.statusClosed]}>
                            <Text style={styles.statusTagTextClosed}>Closed</Text>
                          </View>
                        ) : (
                          <View style={[styles.statusTag, styles.statusActive]}>
                            <Text style={styles.statusTagTextActive}>Active</Text>
                          </View>
                        )}
                        
                        {hasApplied && (
                          <View style={[styles.statusTag, { backgroundColor: statusConf.bg, borderColor: statusConf.border }]}>
                            <Text style={[styles.statusTagTextActive, { color: statusConf.text }]}>
                              {statusConf.label}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Info Badges */}
                      <View style={styles.badgeRow}>
                        <View style={styles.infoBadge}>
                          <MapPin size={10} color="#64748B" />
                          <Text style={styles.badgeText}>{internship.work_mode || internship.location || "Remote"}</Text>
                        </View>
                        <View style={styles.infoBadge}>
                          <Clock size={10} color="#64748B" />
                          <Text style={styles.badgeText}>{internship.duration ? `${internship.duration} Days` : "3 Months"}</Text>
                        </View>
                        <View style={[styles.infoBadge, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                          <IndianRupee size={10} color="#059669" />
                          <Text style={[styles.badgeText, { color: '#059669', fontWeight: '700' }]}>
                            {internship.stipend ? `₹${Number(internship.stipend).toLocaleString('en-IN')}` : "Best in Industry"}
                          </Text>
                        </View>
                        {internship.openings ? (
                          <View style={[styles.infoBadge, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                            <Text style={[styles.badgeText, { color: '#2563EB', fontWeight: '700' }]}>
                              {internship.openings} Opening{internship.openings !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Skills Tags */}
                      {internship.skills && internship.skills.length > 0 && (
                        <View style={[styles.skillsRow, { marginBottom: 0 }]}>
                          {internship.skills.slice(0, 4).map((s: any, si: number) => (
                            <View key={si} style={styles.skillChip}>
                              <Text style={styles.skillChipText}>{s.skill}</Text>
                            </View>
                          ))}
                          {internship.skills.length > 4 && (
                            <View style={styles.skillChipMore}>
                              <Text style={styles.skillChipMoreText}>+{internship.skills.length - 4}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </SwipeableRow>
                </Animated.View>
              );
            })
          )}
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Details modal */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={showDetailsModal} 
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <View style={styles.modalIconBox}>
                  <Briefcase size={22} color="#fff" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.modalTitleText} numberOfLines={1}>
                    {selectedInternship?.role_name || selectedInternship?.title || 'Internship Details'}
                  </Text>
                  <Text style={styles.modalSubtitleText} numberOfLines={1}>
                    {selectedInternship?.industry || 'Industry Partner'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setShowDetailsModal(false)} 
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Scrollable details content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.detailsContentContainer}>
                
                {/* Meta details list */}
                <Text style={styles.modalSectionLabel}>Overview Details</Text>
                <View style={styles.metaBoxContainer}>
                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconWrap, { backgroundColor: '#EFF6FF' }]}>
                      <MapPin size={16} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.metaLabelText}>LOCATION</Text>
                      <Text style={styles.metaValText}>{selectedInternship?.location || 'Remote'}</Text>
                    </View>
                  </View>

                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconWrap, { backgroundColor: '#ECFDF5' }]}>
                      <IndianRupee size={16} color="#059669" />
                    </View>
                    <View>
                      <Text style={styles.metaLabelText}>STIPEND</Text>
                      <Text style={styles.metaValText}>{selectedInternship?.stipend || 'Best in Industry'}</Text>
                    </View>
                  </View>

                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconWrap, { backgroundColor: '#F5F3FF' }]}>
                      <Clock size={16} color="#7C3AED" />
                    </View>
                    <View>
                      <Text style={styles.metaLabelText}>DURATION</Text>
                      <Text style={styles.metaValText}>
                        {selectedInternship?.duration ? `${selectedInternship.duration} Days` : 'Not specified'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* About description */}
                <Text style={styles.modalSectionLabel}>About</Text>
                <View style={styles.descCard}>
                  <Text style={styles.descCardText}>
                    {selectedInternship?.description || "No description provided by the industry partner."}
                  </Text>
                </View>

                {/* Eligibility requirements */}
                <Text style={styles.modalSectionLabel}>Eligibility & Openings</Text>
                <View style={styles.metaGrid}>
                  <View style={styles.gridCard}>
                    <Text style={styles.metaLabelText}>ELIGIBILITY</Text>
                    <Text style={styles.gridValText}>
                      {selectedInternship?.eligibility || "Open to all relevant backgrounds."}
                    </Text>
                  </View>
                  <View style={styles.gridCard}>
                    <Text style={styles.metaLabelText}>OPENINGS</Text>
                    <Text style={styles.gridValText}>
                      {selectedInternship?.openings || 1} candidates
                    </Text>
                  </View>
                </View>

                {/* Skills requirement */}
                {selectedInternship?.skills && Array.isArray(selectedInternship.skills) && selectedInternship.skills.length > 0 && (
                  <>
                    <Text style={styles.modalSectionLabel}>Skills Required</Text>
                    <View style={styles.skillsTagRow}>
                      {selectedInternship.skills.map((s: any, sIdx: number) => (
                        <View key={sIdx} style={styles.skillBadgeBox}>
                          <Text style={styles.skillBadgeText}>{s.skill}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </ScrollView>

            {/* Footer action buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setShowDetailsModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>Close</Text>
              </TouchableOpacity>
              
              {selectedInternship?.applied_status?.toLowerCase() === 'selected' ? (
                <TouchableOpacity 
                  style={[styles.modalApplyBtn, { backgroundColor: colors.success }]}
                  onPress={() => {
                    handleViewOfferLetter(selectedInternship, "Internship");
                    setShowDetailsModal(false);
                  }}
                >
                  <Text style={[styles.modalApplyBtnText, { color: '#FFFFFF' }]}>View Offer Letter</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  activeOpacity={0.7}
                  disabled={selectedInternship?.status?.toLowerCase() === 'closed' || (selectedInternship?.applied_status && selectedInternship.applied_status !== "Not Applied")}
                  onPress={() => {
                    handleApplyInternship(selectedInternship);
                    setShowDetailsModal(false);
                  }}
                  style={[
                    styles.modalApplyBtn,
                    selectedInternship?.status?.toLowerCase() === 'closed' && { backgroundColor: '#F1F5F9' },
                    (selectedInternship?.applied_status && selectedInternship.applied_status !== "Not Applied") && { backgroundColor: '#EFF6FF' }
                  ]}
                >
                  <Text style={[
                    styles.modalApplyBtnText,
                    selectedInternship?.status?.toLowerCase() === 'closed' && { color: '#94A3B8' },
                    (selectedInternship?.applied_status && selectedInternship.applied_status !== "Not Applied") && { color: '#2563EB' }
                  ]}>
                    {selectedInternship?.applied_status && selectedInternship.applied_status !== "Not Applied" ? selectedInternship.applied_status : (selectedInternship?.status?.toLowerCase() === 'closed' ? 'Closed' : 'Apply Now')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      {/* Offer Letter Modal */}
      <OfferLetterModal 
        visible={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        pdfUrl={offerPdfUrl}
        isLoading={loadingOffer}
        title="Internship Offer Letter"
        isAccepting={!!(selectedOfferApp && acceptingOffer === selectedOfferApp.item.name)}
        isRejecting={!!(selectedOfferApp && rejectingOffer === selectedOfferApp.item.name)}
        onAccept={() => selectedOfferApp && handleAcceptOffer(selectedOfferApp.item, selectedOfferApp.type)}
        onReject={() => selectedOfferApp && handleRejectOffer(selectedOfferApp.item, selectedOfferApp.type)}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 12,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 110,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 24,
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  listContainer: {
    gap: 16,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    borderRadius: 24,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  internshipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  matchBadge: {
    alignItems: 'flex-end',
  },
  matchValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  matchLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 1,
  },
  statusBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statusTag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  statusTagTextActive: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
  },
  statusClosed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  statusTagTextClosed: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skillChip: { backgroundColor: '#F0F9FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#BAE6FD' },
  skillChipText: { fontSize: 10, fontWeight: '700', color: '#0369A1' },
  skillChipMore: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  skillChipMoreText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.accent.DEFAULT,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  footerSpacer: {
    height: 40,
  },
  // Modal layout
  modalOverlay: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
  },
  modalScroll: {
    paddingBottom: 110,
  },
  detailsContentContainer: {
    padding: 20,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  metaBoxContainer: {
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabelText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metaValText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  descCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descCardText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 18,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridValText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadgeBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalApplyBtn: {
    flex: 2,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFEADB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalApplyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF6B00',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 16,
    marginBottom: 8,
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
    height: 45,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
});
