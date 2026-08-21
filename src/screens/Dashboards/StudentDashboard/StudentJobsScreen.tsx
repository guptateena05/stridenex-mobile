import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  Target,
  Users,
  Clock,
  MapPin,
  X,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Info,
  TrendingUp,
  IndianRupee,
  FileText
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { getJobProfiles, applyOpportunity, getStudentApplications, updateApplicationStatus } from '@/api/student.services';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SwipeableRow, SwipeAction } from '@/components/Shared/SwipeableRow';
import { OfferLetterModal } from '@/components/Shared/OfferLetterModal';
import * as DocumentPicker from '@react-native-documents/picker';

export const StudentJobsScreen = () => {
  const { userName } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [studentApplications, setStudentApplications] = useState<any[]>([]);
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [applying, setApplying] = useState<string | null>(null);
  const [successfullyApplied, setSuccessfullyApplied] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Offer Letter Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPdfUrl, setOfferPdfUrl] = useState<string | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [selectedOfferApp, setSelectedOfferApp] = useState<{item: any, type: string} | null>(null);
  const [rejectingOffer, setRejectingOffer] = useState<string | null>(null);

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
              fetchJobsData();
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
              fetchJobsData();
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
        student: userName || "",
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

  const getJobStatusConfig = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'applied':
        return { bg: "#EFF6FF", text: "#2563EB", border: "#DBEAFE", label: "Applied" };
      case 'shortlisted':
        return { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE", label: "Shortlisted" };
      case 'tech interview':
        return { bg: "#EEF2F6", text: "#6D28D9", border: "#E2E8F0", label: "Tech Interview" };
      case 'hr':
        return { bg: "#FFF1F2", text: "#DB2777", border: "#FFE4E6", label: "HR" };
      case 'selected':
        return { bg: "#FFFBEB", text: "#D97706", border: "#FEF3C7", label: "Selected" };
      case 'accepted':
        return { bg: "#ECFDF5", text: "#059669", border: "#D1FAE5", label: "Accepted" };
      case 'rejected':
        return { bg: "#FEF2F2", text: "#DC2626", border: "#FEE2E2", label: "Rejected" };
      default:
        return { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0", label: status || "N/A" };
    }
  };
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [expectedSalary, setExpectedSalary] = useState("");
  const [coverLetter, setCoverLetter] = useState("I am interested in this position.");
  const [applyModalLoading, setApplyModalLoading] = useState(false);

  const fetchJobsData = useCallback(async () => {
    try {
      setLoading(true);
      let appsList: any[] = [];
      if (userName) {
        try {
          const res = await getStudentApplications({ student: userName, opportunity_type: "Job" });
          appsList = res?.data?.data || res?.message?.data || res?.data || res?.message || [];
          setStudentApplications(Array.isArray(appsList) ? appsList : []);
        } catch(err) {
          console.error("Error fetching student applications list:", err);
        }
      }

      const response = await getJobProfiles(userName || undefined);
      const dataObj = response?.data || response?.message?.data || response?.message || response || [];
      let list = [];
      if (Array.isArray(dataObj)) {
        list = dataObj;
      } else if (dataObj && typeof dataObj === 'object' && Array.isArray(dataObj.data)) {
        list = dataObj.data;
      }

      const mappedJobs = list.map((item: any) => {
        const match = appsList.find((app: any) => app.job_profile === item.name);
        if (match) {
          return { ...item, applied_status: match.status };
        }
        return { ...item, applied_status: item.status || null };
      });

      setJobs(mappedJobs);
    } catch (err) {
      console.error("Error fetching jobs for student:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userName]);

  const loadAppliedJobs = async () => {
    try {
      const stored = await AsyncStorage.getItem('@applied_job_profiles');
      if (stored) {
        setSuccessfullyApplied(JSON.parse(stored));
      }
    } catch (e) {
      console.log("Error loading applied jobs from AsyncStorage:", e);
    }
  };

  useEffect(() => {
    fetchJobsData();
    loadAppliedJobs();
  }, [fetchJobsData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobsData();
  };

  const handleApplyJob = (job: any) => {
    if (!userName) {
      Alert.alert("Authentication Required", "Please log in to apply.");
    }
    setSelectedJob(job);
    setExpectedSalary("");
    setCoverLetter("I am interested in this position.");
    setShowApplyModal(true);
  };



  const handleSubmitApplication = async () => {
    if (!expectedSalary) {
      Alert.alert("Error", "Expected salary is required.");
      return;
    }

    try {
      setApplyModalLoading(true);
      
      await applyOpportunity({
        student: userName || "",
        opportunity_type: "Job",
        opportunity_name: selectedJob.name,
        notes: coverLetter,
        expected_salary: expectedSalary
      });

      const updatedApplied = [...successfullyApplied, selectedJob.name];
      setSuccessfullyApplied(updatedApplied);
      await AsyncStorage.setItem('@applied_job_profiles', JSON.stringify(updatedApplied));

      Alert.alert("Success", `Applied successfully for ${selectedJob.job_title}!`);
      setShowApplyModal(false);
      setShowDetailsModal(false);
    } catch (err: any) {
      console.error("Application error:", err);
      Alert.alert("Error", err?.message || "Failed to submit application.");
    } finally {
      setApplyModalLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const s = search.toLowerCase();
    return jobs.filter(
      (job) =>
        (job.job_title && job.job_title.toLowerCase().includes(s)) ||
        (job.industry && job.industry.toLowerCase().includes(s)) ||
        (job.location && job.location.toLowerCase().includes(s))
    );
  }, [jobs, search]);

  const formatSalary = (from: any, to: any) => {
    if (!from && !to) return "Best in Industry";
    const formatVal = (val: any) => {
      const num = Number(val);
      if (num >= 100000) {
        return `${(num / 100000).toFixed(1)}L`;
      }
      return `${num}`;
    };
    return `₹${formatVal(from)}-${formatVal(to)} LPA`;
  };

  const statsCards = [
    { title: "TOTAL JOBS", value: filteredJobs.length, icon: Briefcase, color: "#0A8099" },
    { title: "APPLIED JOBS", value: successfullyApplied.length, icon: CheckCircle2, color: "#16A34A" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent.DEFAULT]} />}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Briefcase size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>CAREER OPPORTUNITIES</Text>
          </View>
          <Text style={styles.title}>Job ledger</Text>
          <Text style={styles.subtitle}>Apply to top-tier full-time or part-time job opportunities</Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInRight.delay(200)} style={styles.statsRow}>
          {statsCards.map((stat, idx) => (
            <StatsCard 
              key={idx}
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
            placeholder="Search jobs, companies, location..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </Animated.View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleSimple}>Open Openings</Text>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <TrendingUp size={14} color="#64748B" />
            <Text style={styles.filterText}>Relevance</Text>
          </TouchableOpacity>
        </View>

        {/* Listings */}
        <View style={styles.listContainer}>
          {loading && jobs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
            </View>
          ) : filteredJobs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Briefcase size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No matching jobs found.</Text>
            </View>
          ) : (
            filteredJobs.map((job, index) => {
              const hasApplied = successfullyApplied.includes(job.name) || (job.applied_status && job.applied_status !== "Not Applied");
              const isClosed = job.status?.toLowerCase() === 'closed';

              const actions: SwipeAction[] = [
                {
                  label: 'Details',
                  icon: Info,
                  color: '#2563EB',
                  bgColor: '#EFF6FF',
                  onPress: () => {
                    setSelectedJob(job);
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
                  onPress: () => handleApplyJob(job)
                });
              } else if (hasApplied) {
                actions.push({
                  label: String(job.applied_status || 'Applied'),
                  icon: CheckCircle2,
                  color: '#2563EB',
                  bgColor: '#EFF6FF',
                  onPress: () => {}
                });

                if (job.applied_status?.toLowerCase() === "selected") {
                  actions.push({
                    label: 'View Offer',
                    icon: CheckCircle2,
                    color: '#059669',
                    bgColor: '#ECFDF5',
                    onPress: () => handleViewOfferLetter(job, "Job")
                  });
                }
              }

              return (
                <Animated.View 
                  key={job.name || index} 
                  entering={FadeInUp.delay(300 + index * 100)}
                >
                  <SwipeableRow actions={actions}>
                    <TouchableOpacity
                      activeOpacity={0.95}
                      onPress={() => {
                        setSelectedJob(job);
                        setShowDetailsModal(true);
                      }}
                      style={[styles.jobCard, isClosed && { borderLeftColor: '#94A3B8' }]}
                    >
                      <View style={styles.cardTop}>
                        <View style={styles.companyInfo}>
                          <View style={[styles.companyLogo, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                            <Text style={[styles.logoText, { color: colors.accent.DEFAULT }]}>
                              {(job.job_title || "J")[0]}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.jobTitle} numberOfLines={1}>
                              {job.job_title || "Job Role"}
                            </Text>
                            <Text style={styles.companyName} numberOfLines={1}>
                              {job.industry || "Industry Partner"}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.matchBadge}>
                          <Text style={[styles.matchValue, { color: '#059669' }]}>
                            100%
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
                          <View style={[styles.statusTag, {
                            backgroundColor: getJobStatusConfig(job.applied_status || "").bg,
                            borderColor: getJobStatusConfig(job.applied_status || "").border,
                            borderWidth: 1
                          }]}>
                            <Text style={[styles.statusTagTextActive, {
                              color: getJobStatusConfig(job.applied_status || "").text
                            }]}>
                              {getJobStatusConfig(job.applied_status || "").label}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Info Badges */}
                      <View style={styles.badgeRow}>
                        <View style={styles.infoBadge}>
                          <MapPin size={10} color="#64748B" />
                          <Text style={styles.badgeText}>{job.location || "Remote"}</Text>
                        </View>
                        <View style={styles.infoBadge}>
                          <Clock size={10} color="#64748B" />
                          <Text style={styles.badgeText}>{job.employment_type || "Full Time"}</Text>
                        </View>
                        <View style={[styles.infoBadge, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                          <IndianRupee size={10} color="#059669" />
                          <Text style={[styles.badgeText, { color: '#059669', fontWeight: '700' }]}>
                            {formatSalary(job.salary_from, job.salary_to)}
                          </Text>
                        </View>
                        {job.openings ? (
                          <View style={[styles.infoBadge, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                            <Text style={[styles.badgeText, { color: '#2563EB', fontWeight: '700' }]}>
                              {job.openings} Opening{job.openings !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Skills Tags */}
                      {job.skills_required && job.skills_required.length > 0 && (
                        <View style={[styles.skillsRow, { marginBottom: 0 }]}>
                          {job.skills_required.slice(0, 4).map((s: any, si: number) => (
                            <View key={si} style={styles.skillChip}>
                              <Text style={styles.skillChipText}>{s.skill}</Text>
                            </View>
                          ))}
                          {job.skills_required.length > 4 && (
                            <View style={styles.skillChipMore}>
                              <Text style={styles.skillChipMoreText}>+{job.skills_required.length - 4}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
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
                    {selectedJob?.job_title || 'Job Details'}
                  </Text>
                  <Text style={styles.modalSubtitleText} numberOfLines={1}>
                    {selectedJob?.industry || 'Industry Partner'}
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
                
                {/* Meta details grid */}
                <View style={{ gap: 8 }}>
                  <Text style={styles.modalSectionLabel}>Overview</Text>
                  <View style={styles.metaBoxContainer}>
                    <View style={styles.metaItem}>
                      <View style={[styles.metaIconWrap, { backgroundColor: '#F0FDF4' }]}>
                        <IndianRupee size={14} color="#15803D" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.metaLabelText}>SALARY RANGE</Text>
                        <Text style={styles.metaValText} numberOfLines={1}>
                          {formatSalary(selectedJob?.salary_from, selectedJob?.salary_to)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaItem}>
                      <View style={[styles.metaIconWrap, { backgroundColor: '#EFF6FF' }]}>
                        <Users size={14} color="#1D4ED8" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.metaLabelText}>OPENINGS</Text>
                        <Text style={styles.metaValText} numberOfLines={1}>
                          {selectedJob?.openings || '0'} Positions
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaItem}>
                      <View style={[styles.metaIconWrap, { backgroundColor: '#FFF7ED' }]}>
                        <Clock size={14} color="#C2410C" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.metaLabelText}>JOB TYPE</Text>
                        <Text style={styles.metaValText} numberOfLines={1}>
                          {selectedJob?.employment_type || 'Full Time'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaItem}>
                      <View style={[styles.metaIconWrap, { backgroundColor: '#F5F5F4' }]}>
                        <MapPin size={14} color="#44403C" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.metaLabelText}>LOCATION</Text>
                        <Text style={styles.metaValText} numberOfLines={1}>
                          {selectedJob?.location || 'Remote'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View style={{ gap: 8 }}>
                  <Text style={styles.modalSectionLabel}>Job Description</Text>
                  <View style={styles.descCard}>
                    <Text style={styles.descCardText}>
                      {selectedJob?.job_description || 'No description provided.'}
                    </Text>
                  </View>
                </View>

                {/* Skills */}
                {selectedJob?.skills_required && selectedJob?.skills_required.length > 0 && (
                  <View style={{ gap: 8 }}>
                    <Text style={styles.modalSectionLabel}>Required Skills</Text>
                    <View style={styles.modalSkillsRow}>
                      {selectedJob.skills_required.map((s: any, si: number) => (
                        <View key={si} style={styles.modalSkillChip}>
                          <Text style={styles.modalSkillChipText}>{s.skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Contact information */}
                {(selectedJob?.contact_person || selectedJob?.contact_email || selectedJob?.contact_phone) && (
                  <View style={{ gap: 8 }}>
                    <Text style={styles.modalSectionLabel}>Contact Information</Text>
                    <View style={styles.descCard}>
                      {selectedJob?.contact_person && (
                        <Text style={styles.contactText}>Person: {selectedJob.contact_person}</Text>
                      )}
                      {selectedJob?.contact_email && (
                        <Text style={styles.contactText}>Email: {selectedJob.contact_email}</Text>
                      )}
                      {selectedJob?.contact_phone && (
                        <Text style={styles.contactText}>Phone: {selectedJob.contact_phone}</Text>
                      )}
                    </View>
                  </View>
                )}

              </View>
            </ScrollView>
            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowDetailsModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
              
              {selectedJob?.applied_status?.toLowerCase() === 'selected' ? (
                <TouchableOpacity 
                  style={[styles.confirmBtn, { backgroundColor: colors.success }]}
                  onPress={() => {
                    handleViewOfferLetter(selectedJob, "Job");
                    setShowDetailsModal(false);
                  }}
                >
                  <Text style={[styles.confirmBtnText, { color: '#FFFFFF' }]}>View Offer Letter</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={(successfullyApplied.includes(selectedJob?.name) || (selectedJob?.applied_status && selectedJob.applied_status !== "Not Applied")) || applying === selectedJob?.name}
                  onPress={() => {
                    handleApplyJob(selectedJob);
                    setShowDetailsModal(false);
                  }}
                  style={[
                    styles.confirmBtn, 
                    (successfullyApplied.includes(selectedJob?.name) || (selectedJob?.applied_status && selectedJob.applied_status !== "Not Applied")) && styles.appliedButton
                  ]}
                >
                  <Text style={[
                    styles.confirmBtnText, 
                    (successfullyApplied.includes(selectedJob?.name) || (selectedJob?.applied_status && selectedJob.applied_status !== "Not Applied")) && styles.appliedButtonText
                  ]}>
                    {(successfullyApplied.includes(selectedJob?.name) || (selectedJob?.applied_status && selectedJob.applied_status !== "Not Applied")) 
                      ? (selectedJob?.applied_status || 'Applied') 
                      : 'Apply Now'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Apply modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showApplyModal}
        onRequestClose={() => setShowApplyModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <View style={[styles.modalIconBox, { backgroundColor: '#F97316' }]}>
                  <FileText size={22} color="#fff" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.modalTitleText} numberOfLines={1}>
                    Apply for Job
                  </Text>
                  <Text style={styles.modalSubtitleText} numberOfLines={1}>
                    {selectedJob?.job_title}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowApplyModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Scrollable form content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={{ gap: 16, paddingBottom: 24 }}>

                {/* Expected Salary */}
                <View style={{ gap: 6 }}>
                  <Text style={styles.inputLabel}>Expected Salary (Annual INR) <Text style={{ color: '#EF4444' }}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 600000"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={expectedSalary}
                    onChangeText={setExpectedSalary}
                  />
                </View>

                {/* Cover Letter */}
                <View style={{ gap: 6 }}>
                  <Text style={styles.inputLabel}>Cover Letter</Text>
                  <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Tell the employer why you're a great fit..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={coverLetter}
                    onChangeText={setCoverLetter}
                  />
                </View>

              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowApplyModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={applyModalLoading}
                onPress={handleSubmitApplication}
                style={[styles.confirmBtn, { backgroundColor: '#F97316' }]}
              >
                {applyModalLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Submit Application</Text>
                )}
              </TouchableOpacity>
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
        title="Job Offer Letter"
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    height: 48,
    marginBottom: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    padding: 0,
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
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
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
  jobCard: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: typography.fontFamily.display,
    letterSpacing: -0.5,
  },
  modalSubtitleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  detailsContentContainer: {
    gap: 16,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaBoxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  metaIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabelText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
  },
  metaValText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 2,
  },
  descCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: 16,
  },
  descCardText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  modalSkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSkillChip: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalSkillChipText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '600',
  },
  contactText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  confirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  appliedButton: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
  },
  appliedButtonText: {
    color: '#64748B',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: colors.navy,
    fontWeight: '500',
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 10,
    color: '#94A3B8',
  },
  footerSpacer: {
    height: 40,
  }
});
