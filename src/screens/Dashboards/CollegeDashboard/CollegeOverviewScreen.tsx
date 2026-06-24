import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card } from '@/components/Shared/Card';
import { RoleBannerWidget } from '@/components/dashboard/RoleBannerWidget';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { 
  getCollegeDetails, 
  updateCollegeDetails,
  getPlacementStats,
  getBranchWisePerformance,
  getDriveCount,
  getCollegeDrives,
  getDashboardSummary,
  getEmployabilityDistribution,
  getOnboardingGrowth,
  getTopSkillGaps
} from '@/api/college.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Building2,
  Target,
  Database,
  MessageSquare,
  LayoutDashboard,
  Cloud,
  Activity,
  Award,
  Briefcase,
  Clock,
  X,
  GraduationCap,
  Calendar,
  Code
} from 'lucide-react-native';

const actionItems = [
  { id: 1, title: '47 students with score <50', subtitle: 'Graduation risk — immediate intervention', icon: AlertTriangle, color: colors.error },
  { id: 2, title: 'NEP Internship: 68% (target 80%)', subtitle: '342 students need placement by April', icon: Target, color: colors.warning },
  { id: 3, title: '38 new internships posted this week', subtitle: 'TCS, Infosys, Razorpay, Zepto', icon: Briefcase, color: colors.success },
  { id: 4, title: 'UGC Grievance Response Due', subtitle: '2 cases require 24hr committee meeting', icon: Clock, color: colors.error }
];

const branchData = [
  { label: 'Computer Science', value: 420, color: '#10B981', progress: 100 },
  { label: 'Electronics', value: 380, color: '#10B981', progress: 90 },
  { label: 'Mechanical', value: 340, color: '#10B981', progress: 80 },
  { label: 'Civil', value: 290, color: '#F59E0B', progress: 70 },
  { label: 'MBA', value: 180, color: '#10B981', progress: 45 },
  { label: 'Chemical', value: 240, color: '#10B981', progress: 60 },
];

const empDistribution = [
  { label: 'Excellent (85-100)', value: 620, percent: '22%', color: '#10B981' },
  { label: 'Good (70-84)', value: 1140, percent: '40%', color: '#10B981' },
  { label: 'Average (55-69)', value: 740, percent: '26%', color: '#10B981' },
  { label: 'At-Risk (<55)', value: 347, percent: '12%', color: '#F59E0B' },
];

export const CollegeOverviewScreen = () => {
  const insets = useSafeAreaInsets();
  const { userName } = useAuth();
  const navigation = useNavigation<any>();
  const [collegeData, setCollegeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [profileFormValues, setProfileFormValues] = useState<any>({});

  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [placementStats, setPlacementStats] = useState<any>(null);
  const [branchPerformance, setBranchPerformance] = useState<any[]>([]);
  const [driveCounts, setDriveCounts] = useState<any>(null);
  const [upcomingDrivesList, setUpcomingDrivesList] = useState<any[]>([]);
  const [employabilityDistribution, setEmployabilityDistribution] = useState<any>(null);
  const [onboardingGrowth, setOnboardingGrowth] = useState<any>(null);
  const [topSkillGaps, setTopSkillGaps] = useState<any>(null);

  const fetchDetails = useCallback(async (isRefresh = false) => {
    if (!userName) return;
    if (!isRefresh) setLoading(true);
    try {
      const res = await getCollegeDetails(userName);
      const data = res?.data || res?.message?.data || res?.message;
      console.log("COLLEGE_DATA_DEBUG:", JSON.stringify(data));
      if (data && typeof data === 'object') {
        setCollegeData(data);

        const collegeName = data.name || data.college_name || userName;
        const collegeEmail = data.email || userName;

        const [
          statsRes,
          branchRes,
          driveCountRes,
          drivesRes,
          summaryRes,
          distributionRes,
          growthRes,
          skillGapsRes
        ] = await Promise.allSettled([
          getPlacementStats(collegeName),
          getBranchWisePerformance(collegeName),
          getDriveCount(collegeName),
          getCollegeDrives(collegeName),
          getDashboardSummary(collegeEmail),
          getEmployabilityDistribution(collegeEmail),
          getOnboardingGrowth(collegeEmail),
          getTopSkillGaps(collegeEmail)
        ]);

        if (statsRes.status === "fulfilled") {
          const raw = statsRes.value?.message ?? statsRes.value?.data ?? statsRes.value;
          if (raw && raw.data) {
            setPlacementStats(raw.data);
          } else if (raw) {
            setPlacementStats(raw);
          }
        }

        if (branchRes.status === "fulfilled") {
          const raw = branchRes.value?.message ?? branchRes.value?.data ?? branchRes.value;
          if (raw && raw.data) {
            setBranchPerformance(raw.data);
          } else if (Array.isArray(raw)) {
            setBranchPerformance(raw);
          } else if (raw && Array.isArray(raw.message)) {
            setBranchPerformance(raw.message);
          }
        }

        if (driveCountRes.status === "fulfilled") {
          const raw = driveCountRes.value?.message ?? driveCountRes.value?.data ?? driveCountRes.value;
          if (raw && raw.data) {
            setDriveCounts(raw.data);
          } else if (raw) {
            setDriveCounts(raw);
          }
        }

        if (drivesRes.status === "fulfilled") {
          const raw = drivesRes.value?.data ?? drivesRes.value?.message?.data ?? drivesRes.value?.message ?? drivesRes.value;
          let drivesArray: any[] = [];
          if (raw && typeof raw === 'object') {
            drivesArray = Array.isArray(raw.campus_drives)
              ? raw.campus_drives
              : (Array.isArray(raw) ? raw : []);
          }
          setUpcomingDrivesList(drivesArray);
        }

        if (summaryRes.status === "fulfilled") {
          const raw = summaryRes.value?.message ?? summaryRes.value?.data ?? summaryRes.value;
          if (raw && raw.data) {
            setDashboardSummary(raw.data);
          } else if (raw) {
            setDashboardSummary(raw);
          }
        }

        if (distributionRes.status === "fulfilled") {
          const raw = distributionRes.value?.message ?? distributionRes.value?.data ?? distributionRes.value;
          if (raw && raw.data) {
            setEmployabilityDistribution(raw.data);
          } else if (raw) {
            setEmployabilityDistribution(raw);
          }
        }

        if (growthRes.status === "fulfilled") {
          const raw = growthRes.value?.message ?? growthRes.value?.data ?? growthRes.value;
          if (raw && raw.data) {
            setOnboardingGrowth(raw.data);
          } else if (raw) {
            setOnboardingGrowth(raw);
          }
        }

        if (skillGapsRes.status === "fulfilled") {
          const raw = skillGapsRes.value?.message ?? skillGapsRes.value?.data ?? skillGapsRes.value;
          if (raw && raw.data) {
            setTopSkillGaps(raw.data);
          } else if (raw) {
            setTopSkillGaps(raw);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching college details on dashboard overview:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDetails(true);
  }, [fetchDetails]);

  const collegeSubtitle = useMemo(() => {
    if (!collegeData) return "";
    const parts = [];
    if (collegeData.university) parts.push(collegeData.university);
    if (collegeData.college_type) parts.push(collegeData.college_type);
    if (collegeData.year_of_establishment) parts.push(`Estd. ${collegeData.year_of_establishment}`);
    const locationParts = [];
    if (collegeData.city) locationParts.push(collegeData.city);
    if (collegeData.state) locationParts.push(collegeData.state);
    if (locationParts.length > 0) {
      parts.push(locationParts.join(", "));
    }
    return parts.join(" • ");
  }, [collegeData]);

  // Initial Form values derived from fetched profile details
  const initialFormValues = useMemo(() => {
    if (!collegeData) return {};
    return {
      college_name: collegeData.college_name || "",
      trust__governing_body: collegeData.trust__governing_body || "",
      year_of_establishment: collegeData.year_of_establishment ? String(collegeData.year_of_establishment) : "",
      intake_capacity: collegeData.intake_capacity ? String(collegeData.intake_capacity) : "",
      college_code: collegeData.college_code || "",
      email: collegeData.email || userName || "",
      university: collegeData.university || "",
      college_type: collegeData.college_type || "",
      website: collegeData.website || "",
      state: collegeData.state || "",
      district: collegeData.district || "",
      tahsil: collegeData.tahsil || collegeData.taluka || "",
      city: collegeData.city || "",
    };
  }, [collegeData, userName]);

  // Handle DynamicForm dropdown state changes
  const handleFormChange = (newData: any) => {
    setProfileFormValues((prev: any) => {
      const updated = { ...prev, ...newData };
      // Reset nested location fields if their parent fields change
      if (prev.state !== updated.state) {
        updated.district = '';
        updated.tahsil = '';
        updated.city = '';
      } else if (prev.district !== updated.district) {
        updated.tahsil = '';
        updated.city = '';
      } else if (prev.tahsil !== updated.tahsil) {
        updated.city = '';
      }
      return updated;
    });
  };

  // Submit profile updates to API
  const handleUpdateProfile = async (formData: any) => {
    if (!userName) return;
    setUpdateLoading(true);
    try {
      const payload = {
        ...collegeData,
        college_name: formData.college_name || collegeData?.college_name || "",
        trust__governing_body: formData.trust__governing_body || collegeData?.trust__governing_body || "",
        year_of_establishment: formData.year_of_establishment ? Number(formData.year_of_establishment) : undefined,
        intake_capacity: formData.intake_capacity ? Number(formData.intake_capacity) : undefined,
        college_code: formData.college_code || collegeData?.college_code || "",
        university: formData.university || collegeData?.university || "",
        college_type: formData.college_type || collegeData?.college_type || "",
        website: formData.website || collegeData?.website || "",
        state: formData.state || collegeData?.state || "",
        district: formData.district || collegeData?.district || "",
        tahsil: formData.tahsil || collegeData?.tahsil || collegeData?.taluka || "",
        taluka: formData.tahsil || collegeData?.tahsil || collegeData?.taluka || "",
        city: formData.city || collegeData?.city || "",
      };

      await updateCollegeDetails(userName, payload);
      setIsEditModalVisible(false);
      Alert.alert("Success", "College details updated successfully!");
      fetchDetails(true);
    } catch (err: any) {
      console.error("Failed to update college details:", err);
      Alert.alert("Error", err?.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const displayEmployabilityData = useMemo(() => {
    if (!employabilityDistribution) {
      return [
        { label: 'Excellent (85-100)', value: 620, percent: '22%', color: '#10B981' },
        { label: 'Good (70-84)', value: 1140, percent: '40%', color: '#10B981' },
        { label: 'Average (55-69)', value: 740, percent: '26%', color: '#10B981' },
        { label: 'At-Risk (<55)', value: 347, percent: '12%', color: '#F59E0B' },
      ];
    }
    const data = employabilityDistribution;
    const excPercent = data.excellent?.percent !== undefined ? Math.round(Number(data.excellent.percent)) : 0;
    const goodPercent = data.good?.percent !== undefined ? Math.round(Number(data.good.percent)) : 0;
    const avgPercent = data.average?.percent !== undefined ? Math.round(Number(data.average.percent)) : 0;
    const riskPercent = data.at_risk?.percent !== undefined ? Math.round(Number(data.at_risk.percent)) : 0;
    return [
      { label: 'Excellent (85-100)', value: data.excellent?.count ?? 0, percent: `${excPercent}%`, color: '#10B981' },
      { label: 'Good (70-84)', value: data.good?.count ?? 0, percent: `${goodPercent}%`, color: '#10B981' },
      { label: 'Average (55-69)', value: data.average?.count ?? 0, percent: `${avgPercent}%`, color: '#10B981' },
      { label: 'At-Risk (<55)', value: data.at_risk?.count ?? 0, percent: `${riskPercent}%`, color: '#F59E0B' },
    ];
  }, [employabilityDistribution]);

  const displayBranchData = useMemo(() => {
    if (!branchPerformance || branchPerformance.length === 0) {
      return [
        { label: 'Computer Science', value: '420', progress: 87, color: '#10B981' },
        { label: 'Electronics', value: '380', progress: 74, color: '#10B981' },
        { label: 'Mechanical', value: '340', progress: 62, color: '#10B981' },
        { label: 'Civil', value: '290', progress: 58, color: '#F59E0B' },
        { label: 'MBA', value: '180', progress: 79, color: '#10B981' },
        { label: 'Chemical', value: '240', progress: 65, color: '#10B981' },
      ];
    }
    return branchPerformance.map((b: any) => {
      const branchName = b.department || "—";
      const placed = b.placed_students ?? 0;
      const total = b.total_students ?? 0;
      const rateNum = b.placement_rate !== undefined ? Number(b.placement_rate) : 0;
      const color = rateNum >= 50 ? "#10B981" : "#F59E0B";
      return {
        label: branchName,
        value: `${placed}/${total}`,
        progress: rateNum,
        color
      };
    });
  }, [branchPerformance]);

  const displaySkillGaps = useMemo(() => {
    if (!topSkillGaps || !topSkillGaps.skill_gaps || topSkillGaps.skill_gaps.length === 0) {
      return [];
    }
    return topSkillGaps.skill_gaps.map((item: any) => {
      const name = item.skill_name || item.skill || item.name || "Unknown Skill";
      const percentage = item.percentage !== undefined ? Number(item.percentage) : (item.gap_percentage !== undefined ? Number(item.gap_percentage) : (item.percent !== undefined ? Number(item.percent) : 0));
      
      let icon = Code;
      const lowerName = name.toLowerCase();
      if (lowerName.includes("data") || lowerName.includes("sql") || lowerName.includes("db")) {
        icon = Database;
      } else if (lowerName.includes("communication") || lowerName.includes("soft") || lowerName.includes("english")) {
        icon = MessageSquare;
      } else if (lowerName.includes("project") || lowerName.includes("management") || lowerName.includes("lead")) {
        icon = Target;
      }
      
      const color = percentage >= 50 ? colors.error : colors.warning;
      return {
        label: name,
        progress: percentage,
        icon,
        color
      };
    });
  }, [topSkillGaps]);

  const criticalSkillGap = useMemo(() => {
    if (displaySkillGaps.length === 0) return null;
    const sorted = [...displaySkillGaps].sort((a, b) => b.progress - a.progress);
    if (sorted[0].progress >= 50) {
      return sorted[0];
    }
    return null;
  }, [displaySkillGaps]);

  const displayMonthlyData = useMemo(() => {
    if (!onboardingGrowth || !onboardingGrowth.monthly || onboardingGrowth.monthly.length === 0) {
      return [];
    }
    const maxVal = Math.max(...onboardingGrowth.monthly.map((m: any) => {
      return m.value !== undefined ? Number(m.value) : (m.count !== undefined ? Number(m.count) : 0);
    }), 1);
    
    return onboardingGrowth.monthly.map((m: any) => {
      const value = m.value !== undefined ? Number(m.value) : (m.count !== undefined ? Number(m.count) : 0);
      const valPercent = Math.round((value / maxVal) * 100);
      return {
        val: valPercent,
        label: m.month || m.label || ""
      };
    });
  }, [onboardingGrowth]);

  const nextDriveInfo = useMemo(() => {
    if (!upcomingDrivesList || upcomingDrivesList.length === 0) return "Next: TCS - Mar 15";
    
    const futureDrives = upcomingDrivesList
      .map((d: any) => {
        const company = d.industry || d.industry_name || (d.name && d.name.includes("-") ? d.name.split("-")[0] : d.name) || "";
        const dateStr = d.drive_date ? d.drive_date.split(" ")[0] : "";
        const parsedDate = dateStr ? new Date(dateStr) : null;
        return { company, dateStr, parsedDate };
      })
      .filter((d: any) => d.parsedDate && d.parsedDate >= new Date())
      .sort((a: any, b: any) => (a.parsedDate?.getTime() || 0) - (b.parsedDate?.getTime() || 0));

    if (futureDrives.length > 0) {
      const next = futureDrives[0];
      let formattedDate = next.dateStr;
      try {
        if (next.parsedDate) {
          formattedDate = next.parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
      } catch (_) {}
      return `Next: ${next.company} - ${formattedDate}`;
    }

    return "No upcoming drives scheduled";
  }, [upcomingDrivesList]);

  const dynamicStats = useMemo(() => {
    return [
      {
        id: 1,
        title: 'ACTIVE STUDENTS',
        value: dashboardSummary !== null && dashboardSummary !== undefined ? String(dashboardSummary.active_students) : '2,847',
        icon: Users,
        color: '#3B82F6'
      },
      {
        id: 2,
        title: 'AVG EMPLOYABILITY',
        value: dashboardSummary !== null && dashboardSummary !== undefined ? String(dashboardSummary.avg_employability) : '78',
        icon: TrendingUp,
        color: '#10B981'
      },
      {
        id: 3,
        title: 'AT-RISK STUDENTS',
        value: dashboardSummary !== null && dashboardSummary !== undefined ? String(dashboardSummary.at_risk_students) : '143',
        icon: AlertTriangle,
        color: '#EF4444'
      },
      {
        id: 4,
        title: 'NEW THIS SEMESTER',
        value: dashboardSummary !== null && dashboardSummary !== undefined ? String(dashboardSummary.new_this_semester) : '38',
        icon: GraduationCap,
        color: '#F59E0B'
      }
    ];
  }, [dashboardSummary]);

  // Edit fields schema definition (one per row)
  const editFields: FormField[] = useMemo(() => [
    {
      fieldname: 'college_name',
      label: 'College Name',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. Veermata Jijabai Technological Institute'
    },
    {
      fieldname: 'trust__governing_body',
      label: 'Trust / Governing Body',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. VJTI Governing Body'
    },
    {
      fieldname: 'year_of_establishment',
      label: 'Year of Establishment',
      fieldtype: 'Int',
      required: true,
      placeholder: 'e.g. 1887'
    },
    {
      fieldname: 'intake_capacity',
      label: 'Intake Capacity',
      fieldtype: 'Int',
      required: true,
      placeholder: 'e.g. 3000'
    },
    {
      fieldname: 'college_code',
      label: 'College Code',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. VJTI123'
    },
    {
      fieldname: 'email',
      label: 'Email Address',
      fieldtype: 'Data',
      required: true,
      disabled: true,
      placeholder: 'email@domain.com'
    },
    {
      fieldname: 'university',
      label: 'Affiliated University',
      fieldtype: 'Select',
      required: true,
      placeholder: 'Select University',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: "University" },
    },
    {
      fieldname: 'college_type',
      label: 'College Type',
      fieldtype: 'Select',
      required: true,
      placeholder: 'Select College Type',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: "College Type" },
    },
    {
      fieldname: 'website',
      label: 'Website',
      fieldtype: 'Data',
      required: false,
      placeholder: 'e.g. https://www.vjti.ac.in'
    },
    {
      fieldname: 'state',
      label: 'State',
      fieldtype: 'Select',
      required: true,
      placeholder: 'Select State',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: "State" },
    },
    {
      fieldname: 'district',
      label: 'District',
      fieldtype: 'Select',
      required: true,
      placeholder: 'Select District',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: profileFormValues?.state
        ? { doctype: "District", fields: ["name", "district_name"], filters: [["state", "=", profileFormValues.state]], order_by: "district_name asc", limit_page_length: 1000 }
        : undefined,
      disabled: !profileFormValues?.state,
    },
    {
      fieldname: 'tahsil',
      label: 'Taluka / Tahsil',
      fieldtype: 'Select',
      required: true,
      placeholder: 'Select Taluka',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: profileFormValues?.district
        ? { doctype: "Tahsil", fields: ["name", "tahsil_name"], filters: [["district", "=", profileFormValues.district]], order_by: "tahsil_name asc", limit_page_length: 1000 }
        : undefined,
      disabled: !profileFormValues?.district,
    },
    {
      fieldname: 'city',
      label: 'City',
      fieldtype: 'Select',
      required: true,
      placeholder: 'Select City',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: profileFormValues?.tahsil
        ? { doctype: "City", fields: ["name", "city_name"], filters: [["tahsil", "=", profileFormValues.tahsil]], order_by: "city_name asc", limit_page_length: 1000 }
        : undefined,
      disabled: !profileFormValues?.tahsil,
    },
  ], [profileFormValues?.state, profileFormValues?.district, profileFormValues?.tahsil]);

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10b981"]} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Overview</Text>
            <View style={styles.headerBadge}>
              <LayoutDashboard size={10} color="#059669" />
              <Text style={styles.headerBadgeText}>ANALYTICS SUMMARY</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Direct institutional oversight and metrics</Text>
        </Animated.View>

        <View style={{ marginBottom: 12 }}>
          <RoleBannerWidget 
            role="College Administrator"
            fullName={collegeData?.college_name || "Mohan Kumar"} 
            theme="college"
            date={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} 
            progress={75}
            title={collegeData?.college_name || "College Admin"}
            subtitle={collegeSubtitle}
            onEditPress={() => {
              setProfileFormValues(initialFormValues);
              setIsEditModalVisible(true);
            }}
          />
        </View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInRight.delay(150)} style={styles.statsRow}>
          {dynamicStats.map((stat, i) => (
             <StatsCard 
              key={stat.id} 
              title={stat.title.split(' ')[0]} 
              value={stat.value} 
              icon={stat.icon} 
              color={stat.color} 
            />
          ))}
        </Animated.View>

        {/* Distribution Section (Full Width) */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color="#64748B" />
            <Text style={styles.sectionTitle}>Employability Distribution</Text>
          </View>
          <View style={styles.listContainer}>
            {displayEmployabilityData.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.listItemTextRow}>
                  <Text style={styles.listItemLabel}>{item.label}</Text>
                  <Text style={styles.listItemValue}>{item.value} ({item.percent})</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: item.percent as any, backgroundColor: item.color }]} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Performance Section (Full Width) */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Award size={18} color="#64748B" />
            <Text style={styles.sectionTitle}>Branch-wise Performance</Text>
          </View>
          <View style={styles.listContainer}>
            {displayBranchData.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.listItemTextRow}>
                  <Text style={styles.listItemLabel}>{item.label}</Text>
                  <Text style={styles.listItemValue}>{item.progress.toFixed(1)}% ({item.value})</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Action Required & Skill Gaps Stack */}
        <Card style={styles.actionCard}>
           <View style={styles.sectionHeader}>
             <AlertTriangle size={18} color={colors.error} />
             <Text style={styles.sectionTitle}>Action Required</Text>
           </View>
           {actionItems.map((item, index) => (
             <View key={item.id} style={[styles.actionRow, index === actionItems.length - 1 && styles.noBorder]}>
               <View style={[styles.actionIconBox, { backgroundColor: item.color + '10' }]}>
                 <item.icon color={item.color} size={18} />
               </View>
               <View style={styles.actionInfo}>
                 <Text style={styles.actionTitle}>{item.title}</Text>
                 <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
               </View>
             </View>
           ))}
        </Card>

        {/* Skill Gaps Card with Critical Notice */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Database size={18} color="#64748B" />
            <Text style={styles.sectionTitle}>Top Skill Gaps</Text>
          </View>
          {displaySkillGaps.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No skill gap data available</Text>
            </View>
          ) : (
            <>
              <View style={styles.listContainer}>
                {displaySkillGaps.map((item: any, idx: number) => (
                  <View key={idx} style={styles.listItem}>
                    <View style={styles.skillRowMain}>
                       <View style={styles.skillLabelGroup}>
                          <item.icon size={14} color="#64748B" />
                          <Text style={styles.listItemLabel}>{item.label}</Text>
                       </View>
                       <View style={[styles.skillBadge, { backgroundColor: item.color + '10' }]}>
                          <Text style={[styles.skillBadgeText, { color: item.color }]}>{item.progress}% lack this</Text>
                       </View>
                    </View>
                    <View style={[styles.progressBarBg, { height: 4 }]}>
                      <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                ))}
              </View>

              {criticalSkillGap && (
                <View style={styles.criticalGapBox}>
                  <Text style={styles.criticalGapText}>
                    <Text style={{ fontWeight: '800' }}>Critical Gap: </Text>
                    {criticalSkillGap.label} skills impact {criticalSkillGap.progress}% of placement opportunities
                  </Text>
                </View>
              )}
            </>
          )}
        </Card>

        {/* Additional Stats Row */}
        <View style={styles.additionalStatsGrid}>
          <Card style={styles.additionalStatCard}>
             <View style={styles.additionalStatRow}>
                <View style={[styles.additionalIconBox, { backgroundColor: '#F1F5F9' }]}>
                   <Award size={20} color="#475569" />
                </View>
                <View style={{ flex: 1 }}>
                   <Text style={styles.additionalStatLabel}>Placement Rate</Text>
                   <Text style={styles.additionalStatValue}>
                     {placementStats?.placement_rate !== undefined 
                       ? `${Number(placementStats.placement_rate).toFixed(1)}%` 
                       : "86%"}
                   </Text>
                   <Text style={[styles.additionalStatChange, { color: '#059669' }]}>
                     {placementStats?.placement_rate !== undefined ? "Live database metric" : "▲ 5% vs last year"}
                   </Text>
                </View>
             </View>
          </Card>
          <Card style={styles.additionalStatCard}>
             <View style={styles.additionalStatRow}>
                <View style={[styles.additionalIconBox, { backgroundColor: '#F1F5F9' }]}>
                   <Calendar size={20} color="#475569" />
                </View>
                <View style={{ flex: 1 }}>
                   <Text style={styles.additionalStatLabel}>Upcoming Drives</Text>
                   <Text style={styles.additionalStatValue}>
                     {driveCounts?.upcoming_drives !== undefined 
                       ? driveCounts.upcoming_drives 
                       : upcomingDrivesList.filter((d: any) => d.status === "Registrations Open").length || "12"}
                   </Text>
                   <Text style={styles.additionalStatSubtitle} numberOfLines={1}>
                     {nextDriveInfo}
                   </Text>
                </View>
             </View>
          </Card>
        </View>

        {/* Growth Trend Bar Chart */}
        <Card style={[styles.sectionCard, { marginBottom: 40 }]}>
          <View style={styles.flexRowBetween}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Student Onboarding Growth</Text>
             </View>
             <Text style={styles.viewDetailsText}>Details ›</Text>
          </View>
          {displayMonthlyData.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No onboarding growth data available</Text>
            </View>
          ) : (
            <View style={styles.chartContainer}>
               {displayMonthlyData.map((d: any, idx: number) => (
                  <View key={idx} style={styles.chartCol}>
                     <View style={[styles.chartBar, { height: `${d.val}%`, backgroundColor: colors.navy + '20' }]} />
                     <Text style={styles.chartLabel}>{d.label}</Text>
                  </View>
               ))}
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Edit Profile Modal / Bottom Sheet */}
      <Modal animationType="slide" transparent={true} visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit College Settings</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
               <View style={{ padding: 20 }}>
                 <DynamicForm
                   fields={editFields}
                   onSubmit={handleUpdateProfile}
                   initialValues={profileFormValues}
                   onChange={handleFormChange}
                   loading={updateLoading}
                   buttonLabel="Save Changes"
                 />
               </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    paddingVertical: 4,
  },
  statWrapper: {
    width: '25%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  listContainer: { gap: 16 },
  listItem: { gap: 8 },
  listItemTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listItemLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  listItemValue: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  actionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  actionIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  actionSubtitle: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  skillRowMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  skillBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  skillBadgeText: { fontSize: 10, fontWeight: '800' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, paddingTop: 20 },
  chartCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  chartBar: { width: '50%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabel: { fontSize: 9, color: '#64748B', marginTop: 8, fontWeight: '700' },
  viewDetailsText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  flexRowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 20 },
  modalScroll: { paddingBottom: 60 },
  criticalGapBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  criticalGapText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    lineHeight: 16,
  },
  additionalStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  additionalStatCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  additionalStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  additionalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  additionalStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  additionalStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  additionalStatChange: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },
  additionalStatSubtitle: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 24,
    marginHorizontal: -4,
  },
  emptyStateContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    width: '100%',
  },
  emptyStateText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
