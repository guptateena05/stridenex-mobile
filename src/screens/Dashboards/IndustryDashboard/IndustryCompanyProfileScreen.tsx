import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, Modal, Alert, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import {
  Building2,
  Edit3,
  Star,
  Globe,
  MapPin,
  Layers,
  Target,
  Users,
  Zap,
  ShieldCheck,
  X,
  Plus,
  Trash2,
  ListChecks,
  Briefcase,
  Calendar,
  Clock
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useIndustry } from '@/context/IndustryContext';
import {
  updateIndustry,
  getSkillDomain,
  createSkillDomain,
  updateSkillDomain,
  deleteSkillDomain,
  addHiringRound,
  updateHiringRound,
  deleteHiringRound,
  createSpecialization,
  createSkill,
  createDesignation,
  createDomain,
  createSubDomain,
  getApplicationStatusCount
} from '@/api/industry.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';

const { width } = Dimensions.get('window');

export const IndustryCompanyProfileScreen = () => {
  const { industryData, loading, error, refreshIndustryData } = useIndustry();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Skill Domains State
  const [skillDomains, setSkillDomains] = useState<any[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [isSkillModalVisible, setIsSkillModalVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [skillFormValues, setSkillFormValues] = useState<any>({});

  // Hiring Rounds State
  const [isHiringModalVisible, setIsHiringModalVisible] = useState(false);
  const [editingHiring, setEditingHiring] = useState<any>(null);

  // Application Pipeline State
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(false);

  const fetchPipelineCounts = useCallback(async () => {
    const industryId = industryData?.name || industryData?.company_name;
    if (!industryId) return;

    try {
      setPipelineLoading(true);
      const response = await getApplicationStatusCount(industryId);
      const apiData = response?.data || response?.message || {};

      const initialStages = [
        { stage: "New Applications", apiKey: "Applied", color: "#1E293B" },
        { stage: "AI Pre-screened", apiKey: "Shortlisted", color: "#3B82F6" },
        { stage: "HR Shortlisted", apiKey: "HR", color: "#F97316" },
        { stage: "Interview Round 1", apiKey: "Tech Interview", color: "#FB923C" },
        { stage: "Final Round", apiKey: "Final", color: "#10B981" },
        { stage: "Offers Extended", apiKey: "Selected", color: "#059669" }
      ];

      const counts = Object.values(apiData).map(v => Number(v) || 0);
      const maxCount = Math.max(...counts, 1);

      const updatedStages = initialStages.map(stage => {
        const count = Number(apiData[stage.apiKey]) || 0;
        return {
          ...stage,
          count,
          width: `${Math.max((count / maxCount) * 100, 5)}%`
        };
      });

      setPipelineData(updatedStages);
    } catch (err) {
      console.error("Error fetching pipeline counts in profile:", err);
    } finally {
      setPipelineLoading(false);
    }
  }, [industryData?.name, industryData?.company_name]);

  const fetchSkills = useCallback(async () => {
    // Try to get industry identifier from name or company_name
    const industryId = industryData?.name || industryData?.company_name;
    if (!industryId) return;

    try {
      setSkillsLoading(true);
      const response = await getSkillDomain(industryId);

      // Extensive fallback parsing for Frappe API responses
      let data = [];
      if (response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && Array.isArray(response.message)) {
        data = response.message;
      } else if (response && response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response && response.message && Array.isArray(response.message.data)) {
        data = response.message.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      setSkillDomains(data);
    } catch (err) {
      console.error("Error fetching skill domains:", err);
    } finally {
      setSkillsLoading(false);
    }
  }, [industryData?.name, industryData?.company_name]);

  useEffect(() => {
    fetchSkills();
    fetchPipelineCounts();
  }, [fetchSkills, fetchPipelineCounts]);

  const companyStats = useMemo(() => [
    { label: "Industry", value: industryData?.industry_sector || "N/A", icon: Layers, color: "#3B82F6", bg: "#EFF6FF" },
    { label: "Size", value: industryData?.employee_head_count || "N/A", icon: Users, color: "#F97316", bg: "#FFF7ED" },
    { label: "HQ", value: industryData?.headquarters || "N/A", icon: MapPin, color: "#10B981", bg: "#ECFDF5" },
    { label: "Website", value: industryData?.company_website || "N/A", icon: Globe, color: "#6366F1", bg: "#EEF2FF" },
    { label: "Stage", value: "Verified", icon: Star, color: "#F59E0B", bg: "#FFFBEB" },
    { label: "CIN", value: industryData?.cin || "N/A", icon: ShieldCheck, color: "#475569", bg: "#F1F5F9" },
  ], [industryData]);

  const editFields: FormField[] = [
    {
      fieldname: 'company_name',
      label: 'Company Name',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter company name',
    },
    {
      fieldname: 'business_type',
      label: 'Business Type',
      fieldtype: 'Select',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Business Type' },
    },
    {
      fieldname: 'industry_sector',
      label: 'Industry Sector',
      fieldtype: 'Select',
      required: true,
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Industry Sector' },
    },
    {
      fieldname: 'company_website',
      label: 'Company Website',
      fieldtype: 'Data',
      placeholder: 'e.g. https://company.com',
    },
    {
      fieldname: 'employee_head_count',
      label: 'Employee Size',
      fieldtype: 'Select',
      required: true,
      options: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    },
    {
      fieldname: 'cin',
      label: 'CIN Number',
      fieldtype: 'Data',
      placeholder: 'Enter CIN Number',
    },
    {
      fieldname: 'gst_number',
      label: 'GST Number',
      fieldtype: 'Data',
      placeholder: 'Enter GST Number',
    },
    {
      fieldname: 'turn_over_in_cr',
      label: 'Turnover (in Cr)',
      fieldtype: 'Data',
      placeholder: 'Enter Turnover',
    },
    {
      fieldname: 'internship_per_year',
      label: 'Internships per Year',
      fieldtype: 'Data',
      placeholder: 'e.g. 10',
    },
    {
      fieldname: 'average_fresher_recruited_per_year',
      label: 'Avg Freshers Recruited/Year',
      fieldtype: 'Data',
      placeholder: 'e.g. 5',
    },
    {
      fieldname: 'about',
      label: 'About / Mission',
      fieldtype: 'Long Text',
      required: true,
      placeholder: 'Tell us about your company mission...',
    },
    {
      fieldname: 'specializations',
      label: 'Specializations',
      fieldtype: 'Select',
      multiSelect: true,
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Specialization' },
      allowCustom: true,
    },
    {
      fieldname: 'address_line_1',
      label: 'Address Line 1',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Building, Street...',
    },
    {
      fieldname: 'address_line_2',
      label: 'Address Line 2',
      fieldtype: 'Data',
      placeholder: 'Area, Locality...',
    },
    {
      fieldname: 'country',
      label: 'Country',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter Country',
    },
    {
      fieldname: 'state',
      label: 'State',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter State',
    },
    {
      fieldname: 'district',
      label: 'District',
      fieldtype: 'Data',
      placeholder: 'Enter District',
    },
    {
      fieldname: 'tahsil',
      label: 'Taluka (Tahsil)',
      fieldtype: 'Data',
      placeholder: 'Enter Taluka',
    },
    {
      fieldname: 'city',
      label: 'City',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter City',
    },
    {
      fieldname: 'pincode',
      label: 'Pincode',
      fieldtype: 'Data',
      required: true,
      placeholder: '6-digit PIN',
    },
    {
      fieldname: 'map_link',
      label: 'Map Link (URL)',
      fieldtype: 'Data',
      placeholder: 'Google Maps URL',
    },
  ];

  const skillFields: FormField[] = useMemo(() => [
    {
      fieldname: 'domain',
      label: 'Domain Name',
      fieldtype: 'Select',
      required: true,
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Domain' },
      allowCustom: true,
    },
    {
      fieldname: 'sub_domain',
      label: 'Sub Domain',
      fieldtype: 'Select',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Sub Domain', filters: skillFormValues?.domain ? { domain: skillFormValues.domain } : undefined },
      allowCustom: true,
      disabled: !skillFormValues?.domain,
    },
    {
      fieldname: 'skills',
      label: 'Skills We Audit',
      fieldtype: 'Select',
      multiSelect: true,
      required: true,
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Skill' },
      allowCustom: true,
    },
    {
      fieldname: 'roles',
      label: 'Designations',
      fieldtype: 'Select',
      multiSelect: true,
      required: true,
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Designation' },
      allowCustom: true,
    }
  ], [skillFormValues?.domain]);

  const hiringFields: FormField[] = [
    {
      fieldname: 'round',
      label: 'Round Name',
      fieldtype: 'Select',
      required: true,
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Hiring Process' },
    },
    {
      fieldname: 'based_on',
      label: 'Based On',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. Coding & Data Structures',
    },
    {
      fieldname: 'duration',
      label: 'Duration (min)',
      fieldtype: 'Int',
      required: true,
      placeholder: 'e.g. 45',
    }
  ];

  const handleUpdateProfile = async (formData: any) => {
    if (!industryData?.name) return;

    setUpdateLoading(true);
    try {
      const {
        address_line_1, address_line_2, city, state, district, tahsil, country, pincode, map_link,
        specializations, ...rest
      } = formData;

      // Transform data to match backend structure
      const payload = {
        ...rest,
        specializations: (specializations || []).map((s: string) => ({ specialization: s })),
        location: {
          address_line_1,
          address_line_2,
          city,
          state,
          district,
          tahsil,
          country,
          pincode,
          map_link,
        },
        operating_hours: industryData.operating_hours || []
      };

      await updateIndustry(industryData.name, payload);
      await refreshIndustryData();
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCreateCustomValue = async (fieldName: string, value: string) => {
    try {
      if (fieldName === 'specializations') {
        await createSpecialization(value);
      } else if (fieldName === 'skills') {
        await createSkill(value);
      } else if (fieldName === 'roles') {
        await createDesignation(value);
      } else if (fieldName === 'domain') {
        await createDomain(value);
      } else if (fieldName === 'sub_domain') {
        if (!skillFormValues?.domain) {
          throw new Error('Please select a Domain first');
        }
        await createSubDomain(value, skillFormValues.domain);
      }
    } catch (err) {
      console.error(`Error creating custom value for ${fieldName}:`, err);
      throw err;
    }
  };

  const handleSkillSubmit = async (formData: any) => {
    const industryId = industryData?.name || industryData?.company_name;
    if (!industryId) return;

    setUpdateLoading(true);
    try {
      const payload = {
        industry: industryId,
        domain: formData.domain,
        sub_domain: formData.sub_domain,
        skills: (formData.skills || []).map((s: string) => ({ skill: s })),
        roles: (formData.roles || []).map((r: string) => ({ designation: r })),
      };

      if (editingSkill) {
        await updateSkillDomain(editingSkill.name, { ...payload, name: editingSkill.name });
      } else {
        await createSkillDomain(payload);
      }

      await fetchSkills();
      setIsSkillModalVisible(false);
      setEditingSkill(null);
      Alert.alert('Success', `Skill domain ${editingSkill ? 'updated' : 'added'} successfully`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save skill domain');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteSkill = async (name: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this skill domain?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdateLoading(true);
              await deleteSkillDomain(name);
              await fetchSkills();
              Alert.alert('Success', 'Skill domain deleted');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete skill domain');
            } finally {
              setUpdateLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleHiringSubmit = async (formData: any) => {
    const industryId = industryData?.name || industryData?.company_name;
    if (!industryId) return;

    setUpdateLoading(true);
    try {
      const payload = {
        ...formData,
        industry_name: industryId,
        row_name: editingHiring?.name
      };

      if (editingHiring) {
        await updateHiringRound(payload);
      } else {
        await addHiringRound(payload);
      }

      await refreshIndustryData();
      setIsHiringModalVisible(false);
      setEditingHiring(null);
      Alert.alert('Success', `Hiring round ${editingHiring ? 'updated' : 'added'} successfully`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save hiring round');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteHiring = async (rowName: string) => {
    const industryId = industryData?.name || industryData?.company_name;
    if (!industryId) return;
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this hiring round?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const industryId = industryData?.name || industryData?.company_name;
              setUpdateLoading(true);
              if (industryId) {
                await deleteHiringRound(industryId, rowName);
                await refreshIndustryData();
                Alert.alert('Success', 'Hiring round deleted');
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete hiring round');
            } finally {
              setUpdateLoading(false);
            }
          }
        }
      ]
    );
  };

  const initialFormValues = useMemo(() => {
    if (!industryData) return {};
    return {
      ...industryData,
      specializations: (industryData.specializations || []).map((s: any) => s.specialization || s),
      address_line_1: industryData.location?.address_line_1 || '',
      address_line_2: industryData.location?.address_line_2 || '',
      city: industryData.location?.city || '',
      state: industryData.location?.state || '',
      district: industryData.location?.district || '',
      tahsil: industryData.location?.tahsil || '',
      country: industryData.location?.country || '',
      pincode: industryData.location?.pincode || '',
      map_link: industryData.location?.map_link || '',
    };
  }, [industryData]);

  if (loading && !industryData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading company details...</Text>
      </View>
    );
  }

  if (error && !industryData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refreshIndustryData}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => { refreshIndustryData(); fetchSkills(); fetchPipelineCounts(); }} />
        }
      >
        <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.headerBadge}>
              <Building2 size={10} color={colors.purple[600]} />
              <Text style={styles.headerBadgeText}>COMPANY DETAILS</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Manage your employer branding and details</Text>
        </Animated.View>

        {/* Banner */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.heroBanner}>
          <View style={styles.heroGlow} />

          <View style={styles.heroTopRow}>
            <View style={styles.companyLogoFrame}>
              <View style={styles.companyLogoInner} />
            </View>
            <View style={styles.heroInfo}>
              <View style={styles.heroTitleRow}>
                <Text style={styles.heroTitle}>{industryData?.company_name || 'My Company'}</Text>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={10} color="#059669" />
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={styles.heroSub} numberOfLines={1}>
                {industryData?.headquarters || industryData?.location?.city || 'Location not set'} • {industryData?.industry_sector || 'Industry not set'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setIsEditModalVisible(true)}
            >
              <Edit3 size={16} color="#4c1d95" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>--</Text>
              <Text style={styles.heroStatLabel}>OPEN ROLES</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: '#D97706' }]}>4.5</Text>
              <Text style={styles.heroStatLabel}>RATING</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: '#059669' }]}>--</Text>
              <Text style={styles.heroStatLabel}>HIRED</Text>
            </View>
          </View>
        </Animated.View>

        {/* Overview section */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconSquare}>
              <Zap size={14} color="#FFF" />
            </View>
            <Text style={styles.cardTitleText}>COMPANY OVERVIEW</Text>
          </View>

          <View style={styles.missionContainer}>
            <Text style={styles.missionLabel}>THE MISSION</Text>
            <Text style={styles.missionText}>
              {industryData?.about || "No mission statement or overview provided yet. Update your profile to add one."}
            </Text>
          </View>

          {industryData?.specializations && industryData.specializations.length > 0 && (
            <View style={styles.missionContainer}>
              <Text style={styles.missionLabel}>SPECIALIZATIONS</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {industryData.specializations.map((s: any, idx: number) => (
                  <View key={idx} style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 12, color: '#475569', fontWeight: '600' }}>{s.specialization || s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.companyStatsGrid}>
            {companyStats.map((stat, idx) => (
              <View key={idx} style={styles.companyStatCard}>
                <View style={styles.companyStatTop}>
                  <View style={[styles.companyStatIcon, { backgroundColor: stat.bg }]}>
                    <stat.icon size={12} color={stat.color} />
                  </View>
                  <Text style={styles.companyStatLabel}>{stat.label}</Text>
                </View>
                <Text style={styles.companyStatValue} numberOfLines={1}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Skills We Audit Section */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.card}>
          <View style={styles.cardHeaderWithAction}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconSquare, { backgroundColor: colors.blue[600] }]}>
                <Target size={14} color="#FFF" />
              </View>
              <Text style={styles.cardTitleText}>SKILLS WE AUDIT</Text>
            </View>
            <TouchableOpacity
              style={styles.addIconBtn}
              onPress={() => { setEditingSkill(null); setSkillFormValues({}); setIsSkillModalVisible(true); }}
            >
              <Plus size={18} color={colors.blue[600]} />
            </TouchableOpacity>
          </View>

          {skillsLoading ? (
            <ActivityIndicator size="small" color={colors.blue[600]} style={{ marginVertical: 20 }} />
          ) : skillDomains.length > 0 ? (
            <View style={styles.listContainer}>
              {skillDomains.map((domain, idx) => (
                <View key={idx} style={styles.listItem}>
                  <View style={styles.listItemHeader}>
                    <Text style={styles.listItemTitle}>{domain.domain || domain.skill_domain}</Text>
                    <View style={styles.listItemActions}>
                      <TouchableOpacity onPress={() => { 
                        setEditingSkill(domain); 
                        setSkillFormValues({
                          ...domain,
                          skills: (domain.skills || []).map((s: any) => s.skill),
                          roles: (domain.roles || []).map((r: any) => r.designation)
                        });
                        setIsSkillModalVisible(true); 
                      }}>
                        <Edit3 size={14} color={colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteSkill(domain.name)} style={{ marginLeft: 12 }}>
                        <Trash2 size={14} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.listItemSub}>{domain.sub_domain}</Text>
                  <View style={styles.tagCloud}>
                    {(domain.skills || []).map((s: any, sIdx: number) => (
                      <View key={sIdx} style={styles.miniTag}>
                        <Text style={styles.miniTagText}>{s.skill}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.listItemFooter}>
                    <Briefcase size={12} color={colors.text.secondary} />
                    <Text style={styles.listItemFooterText}>
                      {(domain.roles || []).map((r: any) => r.designation).join(' • ')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No skill domains added yet.</Text>
          )}
        </Animated.View>

        {/* Hiring Pipeline Section */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.card}>
          <View style={styles.cardHeaderWithAction}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconSquare, { backgroundColor: colors.emerald[600] }]}>
                <ListChecks size={14} color="#FFF" />
              </View>
              <Text style={styles.cardTitleText}>HIRING PIPELINE</Text>
            </View>
            <TouchableOpacity
              style={styles.addIconBtn}
              onPress={() => { setEditingHiring(null); setIsHiringModalVisible(true); }}
            >
              <Plus size={18} color={colors.emerald[600]} />
            </TouchableOpacity>
          </View>

          {industryData?.hiring_process && industryData.hiring_process.length > 0 ? (
            <View style={styles.listContainer}>
              {industryData.hiring_process.map((round, idx) => (
                <View key={idx} style={styles.hiringItem}>
                  <View style={styles.hiringItemLeft}>
                    <View style={styles.hiringDot} />
                    <View>
                      <Text style={styles.hiringTitle}>{round.round}</Text>
                      <Text style={styles.hiringSub}>Based on: {round.based_on}</Text>
                    </View>
                  </View>
                  <View style={styles.hiringItemRight}>
                    <View style={styles.hiringTime}>
                      <Clock size={10} color={colors.text.secondary} />
                      <Text style={styles.hiringTimeText}>{round.duration} min</Text>
                    </View>
                    <TouchableOpacity onPress={() => { setEditingHiring(round); setIsHiringModalVisible(true); }} style={{ marginLeft: 12 }}>
                      <Edit3 size={14} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteHiring(round.name!)} style={{ marginLeft: 12 }}>
                      <Trash2 size={14} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No hiring rounds defined.</Text>
          )}
        </Animated.View>



        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Main Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Company Profile</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <DynamicForm
                fields={editFields}
                initialValues={initialFormValues}
                onSubmit={handleUpdateProfile}
                onCreateCustomValue={handleCreateCustomValue}
                buttonLabel="Save Changes"
                loading={updateLoading}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Skill Domain Modal */}
      <Modal
        visible={isSkillModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSkillModalVisible(false)}
      >
        <View style={styles.modalOverlayCentered}>
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingSkill ? 'Edit' : 'Add'} Skill Domain</Text>
              <TouchableOpacity onPress={() => setIsSkillModalVisible(false)}>
                <X size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              <DynamicForm
                fields={skillFields}
                initialValues={skillFormValues}
                onChange={setSkillFormValues}
                onSubmit={handleSkillSubmit}
                onCreateCustomValue={handleCreateCustomValue}
                buttonLabel="Save Skill Domain"
                loading={updateLoading}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Hiring Round Modal */}
      <Modal
        visible={isHiringModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsHiringModalVisible(false)}
      >
        <View style={styles.modalOverlayCentered}>
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingHiring ? 'Edit' : 'Add'} Hiring Round</Text>
              <TouchableOpacity onPress={() => setIsHiringModalVisible(false)}>
                <X size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              <DynamicForm
                fields={hiringFields}
                initialValues={editingHiring || {}}
                onSubmit={handleHiringSubmit}
                buttonLabel="Save Round"
                loading={updateLoading}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontFamily: typography.fontFamily.display },
  errorText: { fontSize: 14, color: colors.error, textAlign: 'center', marginHorizontal: 20 },
  retryBtn: { marginTop: 16, backgroundColor: colors.primary.DEFAULT, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontWeight: 'bold' },

  header: { marginBottom: 12, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(147, 51, 234, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: colors.purple[600], letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  heroBanner: { backgroundColor: '#F1F5F9', borderRadius: 24, padding: 16, position: 'relative', overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  heroGlow: { position: 'absolute', top: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(76, 29, 149, 0.03)' },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, zIndex: 10 },
  companyLogoFrame: { width: 52, height: 52, backgroundColor: '#FFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  companyLogoInner: { width: 28, height: 28, backgroundColor: '#FACC15', borderRadius: 6 },
  editBtn: { backgroundColor: '#FFF', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  heroInfo: { flex: 1, marginLeft: 12, zIndex: 10 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  heroTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#D1FAE5' },
  verifiedText: { fontSize: 8, fontWeight: '900', color: '#059669', letterSpacing: 0.5 },
  heroSub: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  heroStatsRow: { flexDirection: 'row', gap: 10, zIndex: 10 },
  heroStatItem: { flex: 1, backgroundColor: '#FFF', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  heroStatValue: { fontSize: 18, fontWeight: '900', color: colors.purple[600], marginBottom: 2 },
  heroStatLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  cardHeaderWithAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconSquare: { width: 28, height: 28, backgroundColor: '#0F172A', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardTitleText: { fontSize: 12, fontWeight: '900', color: '#0F172A', letterSpacing: 1 },
  addIconBtn: { padding: 4 },

  missionContainer: { marginBottom: 24 },
  missionLabel: { fontSize: 10, fontWeight: '900', color: '#2563EB', letterSpacing: 1.5, marginBottom: 8 },
  missionText: { fontSize: 14, color: '#334155', fontWeight: '600', lineHeight: 22 },

  companyStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  companyStatCard: { width: '48%', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 12, marginBottom: 4 },
  companyStatTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  companyStatIcon: { padding: 6, borderRadius: 8 },
  companyStatLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  companyStatValue: { fontSize: 13, fontWeight: '900', color: '#0F172A' },

  listContainer: { marginTop: 8 },
  listItem: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  listItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  listItemTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  listItemActions: { flexDirection: 'row', alignItems: 'center' },
  listItemSub: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 12 },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  miniTag: { backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  miniTagText: { fontSize: 10, color: '#475569', fontWeight: '700' },
  listItemFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  listItemFooterText: { fontSize: 11, color: '#64748B', fontWeight: '600' },

  hiringItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  hiringItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  hiringDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald[500] },
  hiringTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  hiringSub: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  hiringItemRight: { flexDirection: 'row', alignItems: 'center' },
  hiringTime: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  hiringTimeText: { fontSize: 10, fontWeight: '700', color: colors.emerald[700] },

  emptyText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, fontStyle: 'italic', marginVertical: 20 },
  footerSpacer: { height: 40 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalOverlayCentered: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', paddingTop: 24 },
  modalContentSmall: { backgroundColor: '#FFF', borderRadius: 24, width: '100%', maxHeight: '80%', paddingVertical: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', fontFamily: typography.fontFamily.display },
  closeBtn: { padding: 4 },
  modalScrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

  // Pipeline Styles
  pipelineContainer: { marginTop: 12, gap: 12 },
  pipelineRow: { flexDirection: 'row', alignItems: 'center' },
  pipelineLabel: { width: 100, fontSize: 11, fontWeight: '600', color: '#475569' },
  pipelineBarContainer: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginHorizontal: 10, overflow: 'hidden' },
  pipelineBarFill: { height: '100%', borderRadius: 3 },
  pipelineCount: { width: 24, textAlign: 'right', fontSize: 12, fontWeight: '800', color: '#1E293B' },
});
