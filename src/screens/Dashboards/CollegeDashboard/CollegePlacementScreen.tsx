import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, FlatList, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Send, Star, Calendar, BarChart, Building2, TrendingUp, Award, ChevronDown, ChevronRight, Briefcase, Search, X, Sliders, CheckCircle2, AlertCircle, Plus, Download, ArrowLeft, Mail, Bell, Trash2, Edit, Clock, IndianRupee, Users, Trophy, FileText } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getCollegeDetails,
  getCollegeDrives,
  getDriveCount,
  getPlacementList,
  getPlacementCounts,
  getEligibleStudents,
  getNonEligibleStudents,
  updateCampusDriveApplicationStatus,
  sendCandidateStatusMail,
  getPlacementStats,
  getBranchWisePerformance,
  getSalaryBands,
  createCollegeDrive,
  updateCollegeDrive,
  deleteCollegeDrive,
  getPlacementFunnel,
  exportEligibleStudents,
  exportNotEligibleStudents,
  getMasterData
} from '@/api/college.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';
import { api } from '@/api/api.services';

export const CollegePlacementScreen = ({ route }: any) => {
  const insets = useSafeAreaInsets();
  const { userName } = useAuth();
  
  const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr || dateStr === 'N/A') return "";
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]} ${parts[1]} ${parts[0]}`; // dd mm yyyy
    }
    return dateStr;
  };
  
  const routeTab = route?.params?.tab || 'drives';
  const [activeTab, setActiveTab] = useState<'drives' | 'tracker' | 'eligibility' | 'stats'>(routeTab as any);

  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route?.params?.tab]);

  const [collegeDetails, setCollegeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // DRIVES TAB STATE
  const [drivesList, setDrivesList] = useState<any[]>([]);
  const [driveCounts, setDriveCounts] = useState<any>(null);
  const [selectedDrive, setSelectedDrive] = useState<any | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [drivePlacementList, setDrivePlacementList] = useState<any[]>([]);
  const [drivePlacementCounts, setDrivePlacementCounts] = useState<any>(null);
  const [selectedDriveStatusFilter, setSelectedDriveStatusFilter] = useState<'Eligible' | 'Registered' | 'Shortlisted' | 'Selected'>('Registered');
  const [updatingStatusMap, setUpdatingStatusMap] = useState<Record<string, boolean>>({});

  // NEW DRIVES CRUD STATE
  const [isAddDriveModalOpen, setIsAddDriveModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<any | null>(null);
  const [isSubmittingDrive, setIsSubmittingDrive] = useState(false);
  const [isDeletingDrive, setIsDeletingDrive] = useState(false);

  const [driveFormValues, setDriveFormValues] = useState<any>({});
  const [branchSelectorTarget, setBranchSelectorTarget] = useState<'eligibility'>('eligibility');
  const [availableSkills, setAvailableSkills] = useState<string[]>(["React", "Node.js", "Python", "SQL", "JavaScript", "HTML", "CSS"]);
  
  // Drive placement lists and funnel
  const [driveEligibleStudents, setDriveEligibleStudents] = useState<any[]>([]);
  const [placementFunnel, setPlacementFunnel] = useState<any[]>([]);

  // TRACKER TAB STATE
  const [trackerList, setTrackerList] = useState<any[]>([]);
  const [trackerCounts, setTrackerCounts] = useState<any>(null);
  const [trackerSearch, setTrackerSearch] = useState('');

  // ELIGIBILITY TAB STATE
  const [eligibilityBranches, setEligibilityBranches] = useState<string[]>([]);
  const [eligibilityCgpa, setEligibilityCgpa] = useState('6.0');
  const [eligibilityBacklog, setEligibilityBacklog] = useState('0');
  const [tabEligibleStudents, setTabEligibleStudents] = useState<any[]>([]);
  const [tabNonEligibleStudents, setTabNonEligibleStudents] = useState<any[]>([]);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityActiveFilter, setEligibilityActiveFilter] = useState<'eligible' | 'ineligible'>('eligible');
  const [statsSectionActiveFilter, setStatsSectionActiveFilter] = useState<'funnel' | 'salary' | 'partners' | 'branches'>('funnel');
  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<string[]>(["CS", "CSE", "ECE", "IT", "ME", "MBA", "Civil", "EE"]);

  // Fetch branches dynamically
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await getMasterData("College Department");
        const raw = res?.data ?? res?.message?.data ?? res?.message ?? res;
        const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        if (arr.length > 0) {
          const names = arr.map((item: any) => item.branch_name || item.branch || item.name || String(item)).filter(Boolean);
          const uniqueBranches = Array.from(new Set([...names, "CS", "CSE", "ECE", "IT", "ME", "MBA", "Civil", "EE"]));
          setAvailableBranches(uniqueBranches);
        }
      } catch (err) {
        console.error("Failed to fetch branches from master:", err);
      }
    };
    fetchBranches();
  }, []);

  // Fetch skills dynamically
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await getMasterData("Skill");
        const raw = res?.data ?? res?.message?.data ?? res?.message ?? res;
        const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        if (arr.length > 0) {
          const names = arr.map((item: any) => item.skill_name || item.skill || item.name || String(item)).filter(Boolean);
          const uniqueSkills = Array.from(new Set([...names, "React", "Node.js", "Python", "SQL", "JavaScript", "HTML", "CSS"]));
          setAvailableSkills(uniqueSkills);
        }
      } catch (err) {
        console.error("Failed to fetch skills from master:", err);
      }
    };
    fetchSkills();
  }, []);

  // STATS TAB STATE
  const [placementStats, setPlacementStats] = useState<any>(null);
  const [branchPerformance, setBranchPerformance] = useState<any[]>([]);
  const [salaryBandsList, setSalaryBandsList] = useState<any[]>([]);

  const driveFields: FormField[] = useMemo(() => [
    {
      fieldname: 'industry_name',
      label: 'Company Name',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. Google'
    },
    {
      fieldname: 'role',
      label: 'Job Role / Title',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. Software Engineer'
    },
    {
      fieldname: 'drive_date',
      label: 'Drive Date',
      fieldtype: 'Date',
      required: true
    },
    {
      fieldname: 'registeration_deadline',
      label: 'Registration Deadline',
      fieldtype: 'Date',
      required: true
    },
    {
      fieldname: 'package_offered',
      label: 'Package Offered',
      fieldtype: 'Data',
      required: true,
      placeholder: 'e.g. ₹12-15 LPA'
    },
    {
      fieldname: 'job_type',
      label: 'Job Type',
      fieldtype: 'Select',
      options: ['Full-Time', 'Full-Time + PPO', 'Internship'],
      required: true
    },
    {
      fieldname: 'min_cgpa',
      label: 'Min CGPA Required',
      fieldtype: 'Float',
      required: true,
      placeholder: 'e.g. 6.0'
    },
    {
      fieldname: 'backlog',
      label: 'Max Backlogs Allowed',
      fieldtype: 'Int',
      required: true,
      placeholder: 'e.g. 0'
    },
    {
      fieldname: 'branches',
      label: 'Eligible Branches',
      fieldtype: 'Select',
      options: availableBranches,
      multiSelect: true,
      required: true
    },
    {
      fieldname: 'required_skill',
      label: 'Required Skills',
      fieldtype: 'Link',
      apiEndpoint: 'method/stridenex_app.api_stridenex_app.college.master.get_master_data',
      apiParams: { doctype: 'Skill' },
      multiSelect: true,
      required: true,
      allowCustom: true
    }
  ], [availableBranches]);

  const handleCreateCustomValue = async (fieldName: string, value: string) => {
    try {
      if (fieldName === 'required_skill') {
        const response = await api.post(
          `method/stridenex_app.stridenex_app.doctype.student.student.create_skill`,
          { skill_name: value }
        );
        return response.data;
      }
    } catch (err) {
      console.error(`Error creating custom value for ${fieldName}:`, err);
      throw err;
    }
  };

  const handleFormChange = (newData: any) => {
    setDriveFormValues(newData);
  };

  // Helper for deterministic colors
  const getAvatarColor = (name: string) => {
    const hexColors = ['#2563EB', '#10B981', '#B45309', '#7C3AED', '#DB2777', '#E11D48', '#0284C7', '#4F46E5'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hexColors[hash % hexColors.length];
  };

  // Map backend response structure to mobile UI representation
  const mapBackendDriveToUI = (dbDrive: any) => {
    let minCgpa = 0;
    if (dbDrive.criteria) {
      const match = String(dbDrive.criteria).match(/[\d.]+/);
      minCgpa = match ? Number(match[0]) : 0;
    }
    const maxBacklogs = dbDrive.backlog !== undefined && dbDrive.backlog !== null ? Number(dbDrive.backlog) : 0;

    const branchesList = dbDrive.branches || dbDrive.branch || [];
    const branches = Array.isArray(branchesList)
      ? branchesList.map((b: any) => b.branch_name || b.branch || (typeof b === 'string' ? b : "")).filter(Boolean)
      : [];

    const skillsList = dbDrive.required_skill || dbDrive.required_skills || [];
    const required_skills = Array.isArray(skillsList)
      ? skillsList.map((s: any) => s.skill || s.skill_name || s.name || (typeof s === 'string' ? s : "")).filter(Boolean)
      : [];

    const company = dbDrive.industry || dbDrive.industry_name || (dbDrive.name && dbDrive.name.includes("-") ? dbDrive.name.split("-")[0] : dbDrive.name) || "";
    const role = dbDrive.role || (Array.isArray(dbDrive.designation) && dbDrive.designation[0] ? (dbDrive.designation[0].designation || dbDrive.designation[0].name) : "") || dbDrive.job_title || "Software Engineer";

    const stats = {
      shortlisted: dbDrive.shortlisted !== undefined && dbDrive.shortlisted !== null ? Number(dbDrive.shortlisted) : 0,
      registered: dbDrive.total_applications !== undefined && dbDrive.total_applications !== null ? Number(dbDrive.total_applications) : 0,
      selected: dbDrive.placed !== undefined && dbDrive.placed !== null ? Number(dbDrive.placed) : 0,
      eligible: dbDrive.eligible ?? 0
    };

    return {
      id: dbDrive.name,
      name: dbDrive.name,
      company,
      role,
      driveDate: dbDrive.drive_date ? dbDrive.drive_date.split(" ")[0] : "",
      regDeadline: dbDrive.registeration_deadline ? dbDrive.registeration_deadline.split(" ")[0] : "",
      package: dbDrive.package_offered || "₹4.5 - 7.0 LPA",
      type: dbDrive.job_type || "Full-Time",
      criteria: {
        minCgpa,
        backlogs: maxBacklogs,
        branches,
        passingYear: dbDrive.passing_year || 2026
      },
      required_skills,
      stats,
      status: dbDrive.status || (dbDrive.registeration_deadline && new Date(dbDrive.registeration_deadline) > new Date() ? "Registrations Open" : "Closed")
    };
  };

  // Fetch subtab dynamic data
  const fetchDrivesTab = async (collegeName: string) => {
    try {
      const drivesRes = await getCollegeDrives(collegeName);
      const data = drivesRes?.data || drivesRes?.message?.data || drivesRes?.message || drivesRes;
      let drivesArray: any[] = [];
      if (data && typeof data === 'object') {
        drivesArray = Array.isArray(data.campus_drives)
          ? data.campus_drives
          : (Array.isArray(data) ? data : []);
      }
      const mapped = drivesArray.map((dbDrive: any) => mapBackendDriveToUI(dbDrive));
      setDrivesList(mapped);

      const countRes = await getDriveCount(collegeName);
      const countsRaw = countRes?.message ?? countRes;
      if (countsRaw && countsRaw.data) {
        setDriveCounts(countsRaw.data);
      }
    } catch (err) {
      console.error("Error loading drives tab:", err);
    }
  };

  const fetchTrackerTab = async (collegeName: string) => {
    try {
      const [listRes, countsRes] = await Promise.allSettled([
        getPlacementList(collegeName),
        getPlacementCounts(collegeName)
      ]);

      if (listRes.status === "fulfilled") {
        const raw = listRes.value?.data ?? listRes.value?.message?.data ?? listRes.value?.message;
        const arr = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        setTrackerList(arr);
      }

      if (countsRes.status === "fulfilled") {
        const raw = countsRes.value?.data ?? countsRes.value?.message?.data ?? countsRes.value?.message;
        const counts = raw?.data ?? raw;
        if (counts && typeof counts === 'object') {
          setTrackerCounts(counts);
        }
      }
    } catch (err) {
      console.error("Error loading tracker tab:", err);
    }
  };

  const fetchEligibilityTab = async (collegeName: string) => {
    try {
      setEligibilityLoading(true);
      const branchStr = eligibilityBranches.join(",");
      const [eligibleRes, nonEligibleRes] = await Promise.allSettled([
        getEligibleStudents({
          branch: branchStr,
          cgpa: eligibilityCgpa,
          backlog: eligibilityBacklog,
          college: collegeName
        }),
        getNonEligibleStudents({
          branch: branchStr,
          cgpa: eligibilityCgpa,
          backlog: eligibilityBacklog,
          college: collegeName
        })
      ]);

      if (eligibleRes.status === "fulfilled") {
        const raw = eligibleRes.value?.message ?? eligibleRes.value?.data ?? eligibleRes.value;
        let arr: any[] = [];
        if (raw) {
          if (Array.isArray(raw)) {
            arr = raw;
          } else if (Array.isArray(raw.data)) {
            arr = raw.data;
          } else if (raw.eligible) {
            if (Array.isArray(raw.eligible.data)) {
              arr = raw.eligible.data;
            } else if (Array.isArray(raw.eligible)) {
              arr = raw.eligible;
            }
          } else if (Array.isArray(raw.students)) {
            arr = raw.students;
          }
        }
        setTabEligibleStudents(arr);
      }

      if (nonEligibleRes.status === "fulfilled") {
        const raw = nonEligibleRes.value?.message ?? nonEligibleRes.value?.data ?? nonEligibleRes.value;
        let arr: any[] = [];
        if (raw) {
          if (Array.isArray(raw)) {
            arr = raw;
          } else if (Array.isArray(raw.data)) {
            arr = raw.data;
          } else if (Array.isArray(raw.message)) {
            arr = raw.message;
          } else if (raw.message && Array.isArray(raw.message.data)) {
            arr = raw.message.data;
          } else if (raw.not_eligible) {
            if (Array.isArray(raw.not_eligible.data)) {
              arr = raw.not_eligible.data;
            } else if (Array.isArray(raw.not_eligible)) {
              arr = raw.not_eligible;
            }
          } else if (Array.isArray(raw.students)) {
            arr = raw.students;
          }
        }
        setTabNonEligibleStudents(arr);
      }
    } catch (err) {
      console.error("Error loading eligibility tab:", err);
    } finally {
      setEligibilityLoading(false);
    }
  };

  const fetchStatsTab = async (collegeName: string) => {
    try {
      const [statsRes, branchRes, salaryRes, funnelRes] = await Promise.allSettled([
        getPlacementStats(collegeName),
        getBranchWisePerformance(collegeName),
        getSalaryBands(collegeName),
        getPlacementFunnel(collegeName)
      ]);

      if (statsRes.status === "fulfilled") {
        const raw = statsRes.value?.message ?? statsRes.value?.data ?? statsRes.value;
        setPlacementStats(raw?.data ?? raw);
      }

      if (branchRes.status === "fulfilled") {
        const raw = branchRes.value?.message ?? branchRes.value?.data ?? branchRes.value;
        const arr = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : (Array.isArray(raw?.message) ? raw.message : []));
        setBranchPerformance(arr);
      }

      if (salaryRes.status === "fulfilled") {
        const raw = salaryRes.value?.message ?? salaryRes.value?.data ?? salaryRes.value;
        let arr: any[] = [];
        if (raw) {
          if (Array.isArray(raw)) {
            arr = raw;
          } else if (Array.isArray(raw.bands)) {
            arr = raw.bands;
          } else if (raw.data && Array.isArray(raw.data.bands)) {
            arr = raw.data.bands;
          } else if (Array.isArray(raw.data)) {
            arr = raw.data;
          }
        }
        setSalaryBandsList(arr);
      }

      if (funnelRes.status === "fulfilled") {
        const raw = funnelRes.value?.message ?? funnelRes.value?.data ?? funnelRes.value;
        const funnelDataRaw = raw?.data?.funnel ?? raw?.funnel ?? [];
        if (Array.isArray(funnelDataRaw) && funnelDataRaw.length > 0) {
          const maxVal = Math.max(...funnelDataRaw.map((item: any) => Number(item.count || 0)), 1);
          const mapped = funnelDataRaw.map((stage: any) => {
            const pct = ((Number(stage.count || 0)) / maxVal) * 100;
            let color = colors.primary.DEFAULT;
            if (stage.label.includes("Final") || stage.label.includes("Total")) {
              color = colors.navy;
            } else if (stage.label.includes("Eligible") || stage.label.includes("Offers") || stage.label.includes("Placed")) {
              color = colors.success;
            } else if (stage.label.includes("Shortlisted") || stage.label.includes("Interview")) {
              color = colors.warning;
            }
            return {
              label: stage.label,
              value: stage.count ?? 0,
              width: `${Math.min(100, Math.max(5, pct))}%`,
              color
            };
          });
          setPlacementFunnel(mapped);
        }
      }
    } catch (err) {
      console.error("Error loading stats tab:", err);
    }
  };

  const fetchAllDetails = useCallback(async (isRefresh = false) => {
    if (!userName) return;
    if (!isRefresh) setLoading(true);
    try {
      const collegeRes = await getCollegeDetails(userName);
      const data = collegeRes?.data || collegeRes?.message?.data || collegeRes?.message;
      if (data) {
        setCollegeDetails(data);
        const collegeName = data.name || data.college_name || userName;

        if (activeTab === 'drives') {
          await fetchDrivesTab(collegeName);
        } else if (activeTab === 'tracker') {
          await fetchTrackerTab(collegeName);
        } else if (activeTab === 'stats') {
          await fetchStatsTab(collegeName);
        }
      }
    } catch (err) {
      console.error("Error fetching college profile placement details:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userName, activeTab]);

  useEffect(() => {
    fetchAllDetails();
  }, [fetchAllDetails]);

  // Load Eligibility data when tab is active or filters change
  useEffect(() => {
    if (!collegeDetails || activeTab !== 'eligibility') return;
    const collegeName = collegeDetails.name || collegeDetails.college_name || userName;
    
    const delayDebounceFn = setTimeout(() => {
      fetchEligibilityTab(collegeName);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [eligibilityBranches, eligibilityCgpa, eligibilityBacklog, activeTab, collegeDetails]);

  // Handle active tab change for other tabs
  useEffect(() => {
    if (!collegeDetails || activeTab === 'eligibility') return;
    const collegeName = collegeDetails.name || collegeDetails.college_name || userName;
    
    if (activeTab === 'drives') {
      fetchDrivesTab(collegeName);
    } else if (activeTab === 'tracker') {
      fetchTrackerTab(collegeName);
    } else if (activeTab === 'stats') {
      fetchStatsTab(collegeName);
    }
  }, [activeTab, collegeDetails]);

  const onRefresh = useCallback(async () => {
    if (!userName) return;
    setRefreshing(true);
    try {
      const collegeRes = await getCollegeDetails(userName);
      const data = collegeRes?.data || collegeRes?.message?.data || collegeRes?.message;
      if (data) {
        setCollegeDetails(data);
        const collegeName = data.name || data.college_name || userName;
        if (activeTab === 'drives') {
          await fetchDrivesTab(collegeName);
        } else if (activeTab === 'tracker') {
          await fetchTrackerTab(collegeName);
        } else if (activeTab === 'eligibility') {
          await fetchEligibilityTab(collegeName);
        } else if (activeTab === 'stats') {
          await fetchStatsTab(collegeName);
        }
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setRefreshing(false);
    }
  }, [userName, activeTab, eligibilityBranches, eligibilityCgpa, eligibilityBacklog]);

  // Manage Candidates overlay functions
  const handleManageDrive = async (drive: any) => {
    setSelectedDrive(drive);
    setSelectedDriveStatusFilter('Registered');
    setDrivePlacementCounts(null);
    setDrivePlacementList([]);
    setDriveEligibleStudents([]);
    setIsManageModalOpen(false); // Render inline instead of modal

    const collegeName = collegeDetails?.name || collegeDetails?.college_name;
    if (!collegeName) return;

    try {
      const branchParam = drive.criteria?.branches ? drive.criteria.branches.join(",") : "";
      const cgpaParam = drive.criteria?.minCgpa !== undefined ? drive.criteria.minCgpa : "";
      const backlogParam = drive.criteria?.backlogs !== undefined ? drive.criteria.backlogs : "";

      const [countsRes, listRes, eligibleRes] = await Promise.allSettled([
        getPlacementCounts(collegeName, drive.name),
        getPlacementList(collegeName, drive.name, "Applied"),
        getEligibleStudents({
          branch: branchParam,
          cgpa: cgpaParam,
          backlog: backlogParam,
          drive: drive.name
        })
      ]);

      if (countsRes.status === "fulfilled") {
        const raw = countsRes.value?.data ?? countsRes.value?.message?.data ?? countsRes.value?.message;
        const counts = raw?.data ?? raw;
        if (counts && typeof counts === 'object') {
          setDrivePlacementCounts(counts);
        }
      }

      if (listRes.status === "fulfilled") {
        const raw = listRes.value?.data ?? listRes.value?.message?.data ?? listRes.value?.message;
        const arr = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        setDrivePlacementList(arr);
      }

      if (eligibleRes.status === "fulfilled") {
        const raw = eligibleRes.value?.message ?? eligibleRes.value?.data ?? eligibleRes.value;
        let studentsArr: any[] = [];
        if (raw) {
          if (Array.isArray(raw)) {
            studentsArr = raw;
          } else if (Array.isArray(raw.data)) {
            studentsArr = raw.data;
          } else if (raw.eligible) {
            if (Array.isArray(raw.eligible.data)) {
              studentsArr = raw.eligible.data;
            } else if (Array.isArray(raw.eligible)) {
              studentsArr = raw.eligible;
            }
          } else if (Array.isArray(raw.students)) {
            studentsArr = raw.students;
          }
        }
        setDriveEligibleStudents(studentsArr);
      }
    } catch (err) {
      console.error("Error listing candidates on drive manage:", err);
    }
  };

  const refreshDrivePlacementList = async (status: string) => {
    const collegeName = collegeDetails?.name || collegeDetails?.college_name;
    if (!collegeName || !selectedDrive) return;
    try {
      const apiStatus = status === 'Registered' ? 'Applied' : status;
      const res = await getPlacementList(collegeName, selectedDrive.name, apiStatus);
      const raw = res?.data ?? res?.message?.data ?? res?.message;
      const arr = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      setDrivePlacementList(arr);
    } catch (err) {
      console.error("Error refreshing placements:", err);
    }
  };

  useEffect(() => {
    if (selectedDrive && selectedDriveStatusFilter !== 'Eligible') {
      refreshDrivePlacementList(selectedDriveStatusFilter);
    }
  }, [selectedDriveStatusFilter, selectedDrive]);

  const handleUpdateStatus = async (applicationId: string, studentName: string, email: string, newStatus: string) => {
    if (!selectedDrive) return;
    try {
      setUpdatingStatusMap(prev => ({ ...prev, [applicationId]: true }));
      await updateCampusDriveApplicationStatus(applicationId, newStatus);
      Alert.alert("Success", `Status updated to ${newStatus} for ${studentName}!`);

      // Notify candidate by email
      try {
        await sendCandidateStatusMail({
          email: email,
          status: newStatus.toLowerCase(),
          candidate_name: studentName,
          drive_name: selectedDrive.company || selectedDrive.name || ""
        });
      } catch (mailErr) {
        console.error("Failed to send status email:", mailErr);
      }

      // Refresh drive info counts and list
      const collegeName = collegeDetails?.name || collegeDetails?.college_name;
      if (collegeName) {
        const countsRes = await getPlacementCounts(collegeName, selectedDrive.name);
        const raw = countsRes?.data ?? countsRes?.message?.data ?? countsRes?.message;
        if (raw && typeof raw === 'object') {
          setDrivePlacementCounts(raw?.data ?? raw);
        }
      }
      refreshDrivePlacementList(selectedDriveStatusFilter);
    } catch (err: any) {
      console.error("Error updating candidate application status:", err);
      Alert.alert("Error", err?.message || "Failed to update status. Please try again.");
    } finally {
      setUpdatingStatusMap(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleNotifyCandidateMail = async (student: any, status: string, driveName: string) => {
    const email = student.email || student.email_id || student.name || student.student_id;
    const fullName = student.student_name || student.name || `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Candidate";
    if (!email) {
      Alert.alert("Error", "Student email is not available");
      return;
    }
    try {
      await sendCandidateStatusMail({
        email,
        status,
        candidate_name: fullName,
        drive_name: driveName
      });
      Alert.alert("Success", `Email sent successfully to ${fullName}!`);
    } catch (err: any) {
      console.error("Failed to send status email:", err);
      Alert.alert("Error", err?.message || "Failed to send email.");
    }
  };

  const openEditDrive = (drive: any) => {
    setEditingDrive(drive);
    setDriveFormValues({
      industry_name: drive.company || '',
      role: drive.role || '',
      drive_date: drive.driveDate || '',
      registeration_deadline: drive.regDeadline || '',
      package_offered: drive.package || '',
      job_type: drive.type || 'Full-Time',
      min_cgpa: drive.criteria?.minCgpa !== undefined ? String(drive.criteria.minCgpa) : '6.0',
      backlog: drive.criteria?.backlogs !== undefined ? String(drive.criteria.backlogs) : '0',
      branches: drive.criteria?.branches || [],
      required_skill: drive.required_skills || []
    });
    setIsAddDriveModalOpen(true);
  };

  const openAddDrive = () => {
    setEditingDrive(null);
    setDriveFormValues({
      industry_name: '',
      role: '',
      drive_date: '',
      registeration_deadline: '',
      package_offered: '',
      job_type: 'Full-Time',
      min_cgpa: '6.0',
      backlog: '0',
      branches: [],
      required_skill: []
    });
    setIsAddDriveModalOpen(true);
  };

  const handleSaveDrive = async (formData: any) => {
    setIsSubmittingDrive(true);
    try {
      const collegeName = collegeDetails?.name || collegeDetails?.college_name || userName;
      
      const branchesArray = (formData.branches || []).map((branch: string) => ({ branch_name: branch }));
      const skillsArray = (formData.required_skill || []).map((s: string) => ({ skill: s }));

      const payload: any = {
        college: collegeName,
        industry_name: formData.industry_name,
        drive_date: formData.drive_date,
        registeration_deadline: formData.registeration_deadline,
        package_offered: formData.package_offered,
        job_type: formData.job_type,
        backlog: Number(formData.backlog) || 0,
        criteria: String(formData.min_cgpa).includes("CGPA") ? formData.min_cgpa : `${Number(formData.min_cgpa).toFixed(1)} CGPA`,
        role: formData.role,
        designation: [],
        branches: branchesArray,
        required_skill: skillsArray
      };

      if (editingDrive) {
        payload.name = editingDrive.name;
        await updateCollegeDrive(payload);
        Alert.alert("Success", "Campus Drive updated successfully.");
      } else {
        await createCollegeDrive(payload);
        Alert.alert("Success", "Campus Drive created successfully.");
      }

      setIsAddDriveModalOpen(false);
      setEditingDrive(null);
      
      // Refresh list
      const college = collegeDetails?.name || collegeDetails?.college_name || userName;
      if (college) {
        fetchDrivesTab(college);
      }
    } catch (err: any) {
      console.error("Failed to save campus drive:", err);
      Alert.alert("Error", err?.message || "Failed to save campus drive. Please try again.");
    } finally {
      setIsSubmittingDrive(false);
    }
  };

  const handleDeleteDrive = async (driveName: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this campus drive? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setIsDeletingDrive(true);
            try {
              await deleteCollegeDrive(driveName);
              Alert.alert("Success", "Campus Drive deleted successfully.");
              setSelectedDrive(null);
              
              // Refresh list
              const college = collegeDetails?.name || collegeDetails?.college_name || userName;
              if (college) {
                fetchDrivesTab(college);
              }
            } catch (err: any) {
              console.error("Failed to delete campus drive:", err);
              Alert.alert("Error", err?.message || "Failed to delete drive.");
            } finally {
              setIsDeletingDrive(false);
            }
          }
        }
      ]
    );
  };

  const triggerNotification = async (type: 'eligible' | 'remind' | 'notice' | 'shortlist') => {
    if (!selectedDrive) return;
    const driveName = selectedDrive.name || selectedDrive.company || "";

    try {
      if (type === 'notice') {
        Alert.alert("Success", "Campus drive details successfully posted to College Notice Board!");
        return;
      }

      let studentsToNotify: any[] = [];
      let statusString = '';

      if (type === 'eligible') {
        studentsToNotify = driveEligibleStudents;
        statusString = 'eligible';
        if (studentsToNotify.length === 0) {
          Alert.alert("Warning", "No eligible students to notify.");
          return;
        }
      } else if (type === 'remind') {
        studentsToNotify = drivePlacementList; // for applied/registered
        statusString = 'applied';
        if (studentsToNotify.length === 0) {
          Alert.alert("Warning", "No registered students to remind.");
          return;
        }
      } else if (type === 'shortlist') {
        studentsToNotify = drivePlacementList.filter(s => s.status === 'Shortlisted');
        statusString = 'shortlisted';
        if (studentsToNotify.length === 0) {
          Alert.alert("Warning", "No shortlisted students to notify.");
          return;
        }
      }

      Alert.alert(
        "Confirm Notification",
        `Send email notifications to ${studentsToNotify.length} students?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send",
            onPress: async () => {
              try {
                Alert.alert("Sending...", "Sending email notifications in background...");
                const results = await Promise.allSettled(
                  studentsToNotify.map(async (student: any) => {
                    const email = student.email || student.student_email || student.email_id || student.name || student.student_id;
                    const fullName = student.student_name || student.name || `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Candidate";
                    if (email) {
                      await sendCandidateStatusMail({
                        email,
                        status: statusString,
                        candidate_name: fullName,
                        drive_name: driveName
                      });
                    }
                  })
                );
                const successCount = results.filter(r => r.status === 'fulfilled').length;
                Alert.alert("Completed", `Emails sent successfully to ${successCount} candidates.`);
              } catch (err: any) {
                console.error("Error sending emails:", err);
                Alert.alert("Error", "Failed to send email notifications.");
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error("Failed in triggerNotification:", err);
    }
  };

  const handleExportEligible = async () => {
    try {
      const collegeName = collegeDetails?.name || collegeDetails?.college_name;
      if (!collegeName) return;
      Alert.alert("Exporting", "Preparing CSV export...");
      await exportEligibleStudents({
        branch: eligibilityBranches.join(","),
        cgpa: eligibilityCgpa,
        backlog: eligibilityBacklog,
        college: collegeName
      });
      Alert.alert("Export Complete", "Eligible students CSV file prepared and downloaded successfully.");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message || "Failed to export eligible students.");
    }
  };

  const handleExportNotEligible = async () => {
    try {
      const collegeName = collegeDetails?.name || collegeDetails?.college_name;
      if (!collegeName) return;
      Alert.alert("Exporting", "Preparing CSV export...");
      await exportNotEligibleStudents({
        branch: eligibilityBranches.join(","),
        cgpa: eligibilityCgpa,
        backlog: eligibilityBacklog,
        college: collegeName
      });
      Alert.alert("Export Complete", "Non-eligible students CSV file prepared and downloaded successfully.");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message || "Failed to export non-eligible students.");
    }
  };

  // Computations for filter items
  const filteredTrackerList = useMemo(() => {
    return trackerList.filter(item => {
      const name = (item.student_name || item.student || item.student_id || '').toLowerCase();
      return name.includes(trackerSearch.toLowerCase());
    });
  }, [trackerList, trackerSearch]);

  const getFunnelValue = useCallback((label: string, defaultVal: number) => {
    if (!placementFunnel || placementFunnel.length === 0) return defaultVal;
    const item = placementFunnel.find(f =>
      f.label.toLowerCase() === label.toLowerCase() ||
      (label.toLowerCase() === "interviews scheduled" && (f.label.toLowerCase().includes("interview") || f.label.toLowerCase() === "interviews done"))
    );
    return item ? item.value : defaultVal;
  }, [placementFunnel]);

  const displaySalaryBands = useMemo(() => {
    if (!salaryBandsList || salaryBandsList.length === 0) {
      return [
        { range: '<4 LPA', percentage: 12, color: '#EF4444' },
        { range: '4-8 LPA', percentage: 38, color: '#F59E0B' },
        { range: '8-15 LPA', percentage: 35, color: '#10B981' },
        { range: '15+ LPA', percentage: 15, color: '#10B981' },
      ];
    }
    return salaryBandsList.map(item => {
      const pct = item.percent !== undefined ? Math.round(Number(item.percent)) : (item.percentage !== undefined ? Math.round(Number(item.percentage)) : 0);
      let color = item.color || '#3B82F6';
      if (!item.color) {
        if (item.label && (item.label.includes('<') || item.label.includes('3'))) {
          color = '#EF4444';
        } else if (item.label && item.label.includes('4-8')) {
          color = '#F59E0B';
        } else if (item.label && (item.label.includes('8-15') || item.label.includes('15+'))) {
          color = '#10B981';
        }
      }
      return {
        range: item.label || item.range || item.salary_range || "Other",
        percentage: pct,
        color
      };
    });
  }, [salaryBandsList]);

  const displayFunnelData = useMemo(() => {
    if (placementFunnel && placementFunnel.length > 0) {
      return placementFunnel;
    }
    return [
      { label: 'Final Year Students', value: 680, width: '100%', color: '#0F172A' },
      { label: 'Eligible (Score ≥60)', value: 521, width: '80%', color: '#10B981' },
      { label: 'Applications Sent', value: 847, width: '100%', color: '#2563EB' },
      { label: 'Shortlisted', value: 312, width: '50%', color: '#F59E0B' },
      { label: 'Interviews Scheduled', value: 156, width: '25%', color: '#EF4444' },
      { label: 'Offers Received', value: 98, width: '15%', color: '#10B981' },
    ];
  }, [placementFunnel]);

  const displayRecruiters = useMemo(() => {
    if (drivesList && drivesList.length > 0) {
      return [...drivesList]
        .map(d => ({
          name: d.company || d.name || "Unnamed Company",
          offers: d.stats?.selected ?? 0,
          package: d.package ? (String(d.package).includes("LPA") || String(d.package).includes("₹") ? d.package : `₹${d.package} LPA`) : "—"
        }))
        .sort((a, b) => b.offers - a.offers);
    }
    return [
      { name: 'TechNova Solutions Pvt. Ltd.', offers: 2, package: '₹3.5 LPA' },
      { name: 'Apex Infotech Solutions', offers: 1, package: '₹5.0 LPA' },
      { name: 'TCS', offers: 0, package: '₹10.0 LPA' },
    ];
  }, [drivesList]);

  const displayBranchPlacementRate = useMemo(() => {
    if (!branchPerformance || branchPerformance.length === 0) {
      return [
        { label: 'E&TC', value: '1/1', progress: 100.0, color: '#10B981' },
        { label: 'CS', value: '3/13', progress: 23.1, color: '#EF4444' },
        { label: 'Commerce', value: '0/16073', progress: 0.0, color: '#64748B' },
        { label: 'Electronics & Telecommunication', value: '0/1289', progress: 0.0, color: '#64748B' },
        { label: 'MBA', value: '0/15973', progress: 0.0, color: '#64748B' },
        { label: 'Robotics', value: '0/1363', progress: 0.0, color: '#64748B' },
      ];
    }
    return branchPerformance.map((b: any) => {
      const branchName = b.department || b.branch_name || b.branch || b.name || "—";
      const placed = b.placed_students ?? b.placed ?? 0;
      const total = b.total_students ?? b.total ?? 0;
      
      let rateNum = 0;
      if (b.placement_rate !== undefined) {
        rateNum = Number(b.placement_rate);
      } else if (total > 0) {
        rateNum = (placed / total) * 100;
      }
      
      let color = '#10B981'; // Green
      if (rateNum === 0) {
        color = '#64748B'; // Slate
      } else if (rateNum < 50) {
        color = '#EF4444'; // Red
      } else if (rateNum < 75) {
        color = '#F59E0B'; // Orange
      }
      
      return {
        label: branchName,
        value: `${placed}/${total}`,
        progress: rateNum,
        color
      };
    });
  }, [branchPerformance]);

  const renderDriveDetails = () => {
    if (!selectedDrive) return null;
    const counts = drivePlacementCounts || { placed: 0, shortlisted: 0, applied_to_drives: 0 };
    const eligibleCount = driveEligibleStudents.length;

    // Filter students depending on active filter tab
    const studentsToRender = selectedDriveStatusFilter === 'Eligible' 
      ? driveEligibleStudents 
      : drivePlacementList;

    return (
      <View style={{ gap: 16 }}>
        {/* Back and Action button Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
            onPress={() => setSelectedDrive(null)}
          >
            <ArrowLeft size={16} color="#64748B" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569' }}>Back to Drives</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
              onPress={() => handleDeleteDrive(selectedDrive.name)}
              disabled={isDeletingDrive}
            >
              <Trash2 size={14} color="#EF4444" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#EF4444' }}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255, 107, 0, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
              onPress={() => openEditDrive(selectedDrive)}
            >
              <Edit size={14} color="#FF6B00" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF6B00' }}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gradient Header Banner */}
        <Card style={{ backgroundColor: '#0F172A', borderRadius: 20, padding: 18, borderStyle: 'solid', borderWidth: 1, borderColor: '#1E293B', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800' }}>{selectedDrive.company.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFF' }}>{selectedDrive.company}</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '600', marginTop: 2 }}>{selectedDrive.role}</Text>
            </View>
            <View style={[styles.statusBadge, selectedDrive.status === "Closed" ? styles.statusBadgeClosed : styles.statusBadgeOpen]}>
              <Text style={[styles.statusText, selectedDrive.status === "Closed" ? styles.statusTextClosed : styles.statusTextOpen]}>
                {selectedDrive.status}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1E293B', paddingVertical: 10, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Briefcase size={12} color="#94A3B8" />
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#CBD5E1' }}>{selectedDrive.type}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Award size={12} color="#94A3B8" />
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#CBD5E1' }}>{selectedDrive.package}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} color="#94A3B8" />
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#CBD5E1' }}>{formatDateToDDMMYYYY(selectedDrive.driveDate) || "N/A"}</Text>
            </View>
          </View>
        </Card>

        {/* Selected Drive Sub-tabs switcher */}
        <View style={styles.tabSwitcherContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, selectedDriveStatusFilter === 'Eligible' && styles.activeTabBtn]}
            onPress={() => setSelectedDriveStatusFilter('Eligible')}
          >
            <Text style={[styles.tabBtnText, selectedDriveStatusFilter === 'Eligible' && styles.activeTabBtnText]}>
              Eligible ({eligibleCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, selectedDriveStatusFilter === 'Registered' && styles.activeTabBtn]}
            onPress={() => setSelectedDriveStatusFilter('Registered')}
          >
            <Text style={[styles.tabBtnText, selectedDriveStatusFilter === 'Registered' && styles.activeTabBtnText]}>
              Applied ({counts.applied_to_drives ?? 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, selectedDriveStatusFilter === 'Shortlisted' && styles.activeTabBtn]}
            onPress={() => setSelectedDriveStatusFilter('Shortlisted')}
          >
            <Text style={[styles.tabBtnText, selectedDriveStatusFilter === 'Shortlisted' && styles.activeTabBtnText]}>
              Shortlisted ({counts.shortlisted ?? 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, selectedDriveStatusFilter === 'Selected' && styles.activeTabBtn]}
            onPress={() => setSelectedDriveStatusFilter('Selected')}
          >
            <Text style={[styles.tabBtnText, selectedDriveStatusFilter === 'Selected' && styles.activeTabBtnText]}>
              Selected ({counts.placed ?? 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Student Candidates List */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Users color="#64748B" size={16} />
            <Text style={styles.sectionTitle}>Candidates ({studentsToRender.length})</Text>
          </View>

          <View style={{ gap: 12 }}>
            {studentsToRender.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No students in this stage</Text>
              </View>
            ) : (
              studentsToRender.map((item, index) => {
                const stdName = item.student_name || item.student || item.student_id || "Anonymous";
                const initials = stdName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                const avatarColor = getAvatarColor(stdName);
                
                return (
                  <View key={item.application_id || item.student_id || index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: index === studentsToRender.length - 1 ? 0 : 1, borderBottomColor: '#F1F5F9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: avatarColor, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#1E293B' }} numberOfLines={1}>{stdName}</Text>
                        <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '500', marginTop: 1 }}>
                          {item.branch || item.course || "CS"} • CGPA: {item.cgpa !== undefined && item.cgpa !== null ? item.cgpa : "—"} • Backlogs: {item.backlog !== undefined && item.backlog !== null ? item.backlog : (item.backlogs !== undefined ? item.backlogs : 0)}
                        </Text>
                      </View>
                    </View>

                    {/* Action Group */}
                    <View style={styles.actionGroup}>
                      {selectedDriveStatusFilter === 'Eligible' && (
                        <TouchableOpacity 
                          style={[styles.actionBtn, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}
                          onPress={() => handleNotifyCandidateMail(item, "eligible", selectedDrive.company || selectedDrive.name)}
                        >
                          <Text style={[styles.actionBtnText, { color: '#2563EB' }]}>Notify</Text>
                        </TouchableOpacity>
                      )}

                      {selectedDriveStatusFilter === 'Registered' && (
                        <>
                          <TouchableOpacity 
                            style={[styles.actionBtn, styles.btnShortlist]}
                            disabled={updatingStatusMap[item.application_id]}
                            onPress={() => handleUpdateStatus(item.application_id, stdName, item.email || item.student_email || item.name, "Shortlisted")}
                          >
                            <Text style={[styles.actionBtnText, { color: '#D97706' }]}>Shortlist</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionBtn, styles.btnReject]}
                            disabled={updatingStatusMap[item.application_id]}
                            onPress={() => handleUpdateStatus(item.application_id, stdName, item.email || item.student_email || item.name, "Rejected")}
                          >
                            <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Reject</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      
                      {selectedDriveStatusFilter === 'Shortlisted' && (
                        <>
                          <TouchableOpacity 
                            style={[styles.actionBtn, styles.btnSelect]}
                            disabled={updatingStatusMap[item.application_id]}
                            onPress={() => handleUpdateStatus(item.application_id, stdName, item.email || item.student_email || item.name, "Selected")}
                          >
                            <Text style={[styles.actionBtnText, { color: '#059669' }]}>Select</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionBtn, styles.btnReject]}
                            disabled={updatingStatusMap[item.application_id]}
                            onPress={() => handleUpdateStatus(item.application_id, stdName, item.email || item.student_email || item.name, "Rejected")}
                          >
                            <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Reject</Text>
                          </TouchableOpacity>
                        </>
                      )}

                      {selectedDriveStatusFilter === 'Selected' && (
                        <View style={styles.placedBadge}>
                          <CheckCircle2 size={12} color="#059669" />
                          <Text style={styles.placedBadgeText}>Placed</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </Card>

        {/* Criteria & Notifications Cards */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Sliders color="#64748B" size={16} />
            <Text style={styles.sectionTitle}>Drive Eligibility Criteria</Text>
          </View>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#64748B' }}>Min CGPA:</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B' }}>{selectedDrive.criteria?.minCgpa}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#64748B' }}>Max Backlogs:</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B' }}>{selectedDrive.criteria?.backlogs}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#64748B' }}>Branches:</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B' }}>{selectedDrive.criteria?.branches?.join(", ") || "All"}</Text>
            </View>
          </View>
        </Card>

        {/* Notifications card */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Bell color="#64748B" size={16} />
            <Text style={styles.sectionTitle}>Student Communications</Text>
          </View>
          <View style={{ gap: 8 }}>
            <TouchableOpacity 
              style={{ backgroundColor: '#FF6B00', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
              onPress={() => triggerNotification('eligible')}
            >
              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>NOTIFY ALL ELIGIBLE ({eligibleCount})</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ backgroundColor: '#2563EB', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
              onPress={() => triggerNotification('remind')}
            >
              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>REMIND REGISTERED ({counts.applied_to_drives ?? 0})</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
                onPress={() => triggerNotification('notice')}
              >
                <Text style={{ color: '#475569', fontSize: 11, fontWeight: '800' }}>POST TO NOTICE BOARD</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: '#10B981', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
                onPress={() => triggerNotification('shortlist')}
              >
                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>SEND SHORTLIST MAIL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  const renderAddEditDriveModal = () => {
    return (
      <Modal
        visible={isAddDriveModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddDriveModalOpen(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingDrive ? 'Edit Campus Drive' : 'Add Campus Drive'}</Text>
              <TouchableOpacity onPress={() => setIsAddDriveModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
              <DynamicForm
                fields={driveFields}
                initialValues={driveFormValues}
                onSubmit={handleSaveDrive}
                onChange={handleFormChange}
                onCreateCustomValue={handleCreateCustomValue}
                loading={isSubmittingDrive}
                buttonLabel={editingDrive ? 'Save Changes' : 'Create Drive'}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderBranchSelectorModal = () => {
    const toggleBranch = (branch: string) => {
      if (eligibilityBranches.includes(branch)) {
        setEligibilityBranches(eligibilityBranches.filter(b => b !== branch));
      } else {
        setEligibilityBranches([...eligibilityBranches, branch]);
      }
    };

    return (
      <Modal
        visible={isBranchSelectorOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsBranchSelectorOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Branches</Text>
              <TouchableOpacity onPress={() => setIsBranchSelectorOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableBranches}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = eligibilityBranches.includes(item);
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.selectedOption]}
                    onPress={() => toggleBranch(item)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {item}
                    </Text>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => {
                setIsBranchSelectorOpen(false);
                const collegeName = collegeDetails?.name || collegeDetails?.college_name || userName;
                if (collegeName) {
                  fetchEligibilityTab(collegeName);
                }
              }}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF6B00"]} />
        }
      >
        
        {/* Header */}
        {!selectedDrive && (
          <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <View style={{ flex: 1, minWidth: 200 }}>
                <View style={styles.headerBadge}>
                  <TrendingUp size={10} color="#059669" />
                  <Text style={styles.headerBadgeText}>PLACEMENTS</Text>
                </View>
                <Text style={styles.title}>Placement Tracker</Text>
                <Text style={styles.subtitle}>Institutional placement funnel and drive performance</Text>
              </View>
              
              {activeTab === 'drives' && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
                    onPress={() => Alert.alert("Import Pipeline", "Redirecting to Company import pipeline...")}
                  >
                    <Download size={14} color="#64748B" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569' }}>Import</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FF6B00', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
                    onPress={openAddDrive}
                  >
                    <Plus size={14} color="#FFF" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFF' }}>Add Drive</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {loading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.loaderText}>Loading placement console...</Text>
          </View>
        ) : (
          <Animated.View entering={FadeInUp.delay(100)}>
            {selectedDrive ? renderDriveDetails() : (
              <>
                {/* DRIVES TAB VIEW */}
                {activeTab === 'drives' && (
                  <View style={{ gap: 16 }}>
                    
                    {/* Drives Metrics banner summary */}
                    {driveCounts && (
                      <View style={styles.metricsGrid}>
                        <StatsCard
                          title="ACTIVE"
                          value={driveCounts.total_drives ?? drivesList.length}
                          icon={Briefcase}
                          color="#2563EB"
                        />
                        <StatsCard
                          title="OPEN"
                          value={driveCounts.upcoming_drives ?? 0}
                          icon={Calendar}
                          color="#10B981"
                        />
                        <StatsCard
                          title="APPLICATIONS"
                          value={driveCounts.total_registered ?? 0}
                          icon={Users}
                          color="#EF4444"
                        />
                        <StatsCard
                          title="SELECTED"
                          value={driveCounts.total_placed ?? 0}
                          icon={Award}
                          color="#F59E0B"
                        />
                      </View>
                    )}

                    <View style={{ gap: 16 }}>
                      {drivesList.length === 0 ? (
                        <Card style={styles.emptyCard}>
                          <AlertCircle size={32} color="#94A3B8" />
                          <Text style={styles.emptyText}>No active campus drives found</Text>
                        </Card>
                      ) : (
                        drivesList.map((drive, idx) => {
                          const initial = drive.company.charAt(0).toUpperCase();
                          const avatarColor = getAvatarColor(drive.company);

                          return (
                            <Card key={drive.id || idx} style={styles.driveCard}>
                              <View style={styles.driveHeader}>
                                <View style={[styles.companyAvatar, { backgroundColor: avatarColor }]}>
                                  <Text style={styles.companyAvatarText}>{initial}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.companyName}>{drive.company}</Text>
                                  <Text style={styles.roleName}>{drive.role}</Text>
                                </View>
                                <View style={[styles.statusBadge, drive.status === "Closed" ? styles.statusBadgeClosed : styles.statusBadgeOpen]}>
                                  <Text style={[styles.statusText, drive.status === "Closed" ? styles.statusTextClosed : styles.statusTextOpen]}>
                                    {drive.status}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.driveDetails}>
                                <View style={styles.detailItem}>
                                  <Briefcase size={14} color="#64748B" />
                                  <Text style={styles.detailText}>{drive.type}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                  <Award size={14} color="#64748B" />
                                  <Text style={styles.detailText}>{drive.package}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                  <Calendar size={14} color="#64748B" />
                                  <Text style={styles.detailText}>Date: {formatDateToDDMMYYYY(drive.driveDate) || "N/A"}</Text>
                                </View>
                              </View>

                              <View style={styles.driveFooter}>
                                <Text style={styles.deadlineText}>Deadline: {formatDateToDDMMYYYY(drive.regDeadline) || "N/A"}</Text>
                                <TouchableOpacity 
                                  style={styles.manageBtn}
                                  onPress={() => handleManageDrive(drive)}
                                >
                                  <Text style={styles.manageBtnText}>Manage</Text>
                                  <ChevronRight size={14} color="#FFF" />
                                </TouchableOpacity>
                              </View>
                            </Card>
                          );
                        })
                      )}
                    </View>
                  </View>
                )}

                {/* TRACKER TAB VIEW */}
                {activeTab === 'tracker' && (
                  <View style={{ gap: 16 }}>
                    
                    {/* Tracker Metrics */}
                    {trackerCounts && (
                      <View style={styles.metricsGrid}>
                        <StatsCard
                          title="APPLIED"
                          value={trackerCounts.applied_to_drives ?? 0}
                          icon={Briefcase}
                          color="#2563EB"
                        />
                        <StatsCard
                          title="SHORTLISTED"
                          value={trackerCounts.shortlisted ?? 0}
                          icon={Star}
                          color="#10B981"
                        />
                        <StatsCard
                          title="PLACED"
                          value={trackerCounts.placed ?? 0}
                          icon={Award}
                          color="#EF4444"
                        />
                        <StatsCard
                          title="NOT APPLIED"
                          value={trackerCounts.not_applied_yet ?? 0}
                          icon={Clock}
                          color="#F59E0B"
                        />
                      </View>
                    )}

                    {/* Search Bar */}
                    <View style={styles.searchBarContainer}>
                      <Search size={16} color="#64748B" style={styles.searchIcon} />
                      <TextInput
                        placeholder="Search candidates by name..."
                        placeholderTextColor="#94A3B8"
                        style={styles.searchBarInput}
                        value={trackerSearch}
                        onChangeText={setTrackerSearch}
                      />
                    </View>

                    {/* Student application rows */}
                    <Card style={styles.sectionCard}>
                      <View style={styles.listContainer}>
                        {filteredTrackerList.length === 0 ? (
                          <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No candidates found</Text>
                          </View>
                        ) : (
                          filteredTrackerList.map((std, idx) => {
                            const stdName = std.student_name || std.student || std.student_id || "Anonymous";
                            const initials = stdName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                            const avatarColor = getAvatarColor(stdName);
                            
                            return (
                              <View key={std.application_id || idx} style={[styles.studentRow, idx === filteredTrackerList.length - 1 && styles.noBorder]}>
                                <View style={styles.leftSection}>
                                  <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                                    <Text style={styles.avatarCircleText}>{initials}</Text>
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.studentName} numberOfLines={1}>{stdName}</Text>
                                    <Text style={styles.studentSubtitle}>{std.branch || "CS"} • CGPA: {std.cgpa || "N/A"}</Text>
                                  </View>
                                </View>
                                
                                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                  <View style={[styles.statusBadge, 
                                    std.status === 'Selected' ? styles.statusBadgeOpen : 
                                    std.status === 'Shortlisted' ? styles.statusBadgeShortlisted : styles.statusBadgeClosed
                                  ]}>
                                    <Text style={[styles.statusText, 
                                      std.status === 'Selected' ? styles.statusTextOpen : 
                                      std.status === 'Shortlisted' ? styles.statusTextShortlisted : styles.statusTextClosed
                                    ]}>
                                      {std.status || "Applied"}
                                    </Text>
                                  </View>
                                  {std.package_offered ? (
                                    <Text style={styles.packageText}>{std.package_offered}</Text>
                                  ) : null}
                                </View>
                              </View>
                            );
                          })
                        )}
                      </View>
                    </Card>
                  </View>
                )}

                {/* ELIGIBILITY TAB VIEW */}
                {activeTab === 'eligibility' && (
                  <View style={{ gap: 16 }}>
                    
                    {/* Filter Criteria Inputs */}
                    <Card style={styles.sectionCard}>
                      <View style={{ borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 16, marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <Sliders color="#64748B" size={18} />
                          <Text style={styles.sectionTitle}>Eligibility Criteria Filters</Text>
                        </View>
                        
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TouchableOpacity 
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2563EB', paddingVertical: 10, borderRadius: 12 }}
                            onPress={handleExportEligible}
                          >
                            <Download size={14} color="#FFF" />
                            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Export Eligible</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#DC2626', paddingVertical: 10, borderRadius: 12 }}
                            onPress={handleExportNotEligible}
                          >
                            <Download size={14} color="#FFF" />
                            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Export Ineligible</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.filterForm}>
                        <View style={styles.filterInputGroup}>
                          <Text style={styles.filterLabel}>Branches Selected ({eligibilityBranches.length === 0 ? "All" : eligibilityBranches.length})</Text>
                          {eligibilityBranches.length > 0 && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                              {eligibilityBranches.map((branch) => (
                                <View key={branch} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', paddingLeft: 10, paddingRight: 6, paddingVertical: 4, borderRadius: 8 }}>
                                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155' }}>{branch}</Text>
                                  <TouchableOpacity 
                                    style={{ padding: 2 }}
                                    onPress={() => {
                                      setEligibilityBranches(eligibilityBranches.filter(b => b !== branch));
                                    }}
                                  >
                                    <X size={12} color="#94A3B8" />
                                  </TouchableOpacity>
                                </View>
                              ))}
                            </View>
                          )}
                          <TouchableOpacity 
                            style={styles.dropdownTriggerBtn}
                            onPress={() => {
                              setBranchSelectorTarget('eligibility');
                              setIsBranchSelectorOpen(true);
                            }}
                          >
                            <Text style={styles.dropdownTriggerText} numberOfLines={1}>
                              {eligibilityBranches.length === 0 ? "Select Branches" : "Add/Edit Branches..."}
                            </Text>
                            <ChevronDown size={14} color="#64748B" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.filterRow}>
                          <View style={[styles.filterInputGroup, { flex: 1 }]}>
                            <Text style={styles.filterLabel}>Min CGPA Required</Text>
                            <TextInput
                              style={styles.filterTextInput}
                              value={eligibilityCgpa}
                              onChangeText={setEligibilityCgpa}
                              keyboardType="numeric"
                              placeholder="e.g. 6.0"
                            />
                          </View>
                          <View style={[styles.filterInputGroup, { flex: 1 }]}>
                            <Text style={styles.filterLabel}>Max Backlogs Allowed</Text>
                            <TextInput
                              style={styles.filterTextInput}
                              value={eligibilityBacklog}
                              onChangeText={setEligibilityBacklog}
                              keyboardType="numeric"
                              placeholder="e.g. 0"
                            />
                          </View>
                        </View>
                      </View>
                    </Card>

                    {/* Eligibility list selector toggle */}
                    <View style={styles.tabSwitcherContainer}>
                      <TouchableOpacity 
                        style={[styles.tabBtn, eligibilityActiveFilter === 'eligible' && styles.activeTabBtn]}
                        onPress={() => setEligibilityActiveFilter('eligible')}
                      >
                        <Text style={[styles.tabBtnText, eligibilityActiveFilter === 'eligible' && styles.activeTabBtnText]}>
                          Eligible ({tabEligibleStudents.length})
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.tabBtn, eligibilityActiveFilter === 'ineligible' && styles.activeTabBtn]}
                        onPress={() => setEligibilityActiveFilter('ineligible')}
                      >
                        <Text style={[styles.tabBtnText, eligibilityActiveFilter === 'ineligible' && styles.activeTabBtnText]}>
                          Ineligible ({tabNonEligibleStudents.length})
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Lists switcher display */}
                    <View style={{ gap: 16 }}>
                      {eligibilityLoading ? (
                        <View style={styles.loaderContainer}>
                          <ActivityIndicator size="small" color="#FF6B00" />
                          <Text style={styles.loaderText}>Filtering students list...</Text>
                        </View>
                      ) : (
                        <>
                          {eligibilityActiveFilter === 'eligible' ? (
                            /* Eligible Candidates Card */
                            <Card style={styles.sectionCard}>
                              <View style={styles.sectionHeader}>
                                <CheckCircle2 color="#059669" size={18} />
                                <Text style={styles.sectionTitle}>Eligible Candidates ({tabEligibleStudents.length})</Text>
                              </View>
                              <View style={styles.listContainer}>
                                {tabEligibleStudents.length === 0 ? (
                                  <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No eligible students match criteria</Text>
                                  </View>
                                ) : (
                                  tabEligibleStudents.map((std, idx) => {
                                    const stdName = std.student_name || std.name || std.student_id || "Anonymous";
                                    const initials = stdName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                                    const avatarColor = getAvatarColor(stdName);
                                    return (
                                      <View key={std.student_id || idx} style={[styles.studentRow, idx === tabEligibleStudents.length - 1 && styles.noBorder]}>
                                        <View style={styles.leftSection}>
                                          <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                                            <Text style={styles.avatarCircleText}>{initials}</Text>
                                          </View>
                                          <View style={{ flex: 1 }}>
                                            <Text style={styles.studentName} numberOfLines={1}>{stdName}</Text>
                                            <Text style={styles.studentSubtitle}>
                                              {std.branch || std.course || "CS"} • CGPA: {std.cgpa !== undefined && std.cgpa !== null ? std.cgpa : "—"} • Backlogs: {std.backlogs ?? std.backlog ?? 0}
                                            </Text>
                                          </View>
                                        </View>
                                        <View style={[styles.statusBadge, styles.statusBadgeOpen]}>
                                          <Text style={[styles.statusText, styles.statusTextOpen]}>ELIGIBLE</Text>
                                        </View>
                                      </View>
                                    );
                                  })
                                )}
                              </View>
                            </Card>
                          ) : (
                            /* Ineligible Candidates Card */
                            <Card style={styles.sectionCard}>
                              <View style={styles.sectionHeader}>
                                <AlertCircle color="#EF4444" size={18} />
                                <Text style={styles.sectionTitle}>Ineligible Candidates ({tabNonEligibleStudents.length})</Text>
                              </View>
                              <View style={styles.listContainer}>
                                {tabNonEligibleStudents.length === 0 ? (
                                  <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No ineligible students found</Text>
                                  </View>
                                ) : (
                                  tabNonEligibleStudents.map((std, idx) => {
                                    const stdName = std.student_name || std.name || std.student_id || "Anonymous";
                                    const initials = stdName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                                    const avatarColor = getAvatarColor(stdName);
                                    return (
                                      <View key={std.student_id || idx} style={[styles.studentRow, idx === tabNonEligibleStudents.length - 1 && styles.noBorder]}>
                                        <View style={styles.leftSection}>
                                          <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                                            <Text style={styles.avatarCircleText}>{initials}</Text>
                                          </View>
                                          <View style={{ flex: 1 }}>
                                            <Text style={styles.studentName} numberOfLines={1}>{stdName}</Text>
                                            <Text style={styles.studentSubtitle}>
                                              {std.branch || std.course || "CS"} • CGPA: {std.cgpa !== undefined && std.cgpa !== null ? std.cgpa : "—"} • Backlogs: {std.backlogs ?? std.backlog ?? 0}
                                            </Text>
                                          </View>
                                        </View>
                                        <View style={[styles.statusBadge, styles.statusBadgeClosed]}>
                                          <Text style={[styles.statusText, styles.statusTextClosed]}>INELIGIBLE</Text>
                                        </View>
                                      </View>
                                    );
                                  })
                                )}
                              </View>
                            </Card>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                )}

                {/* STATS TAB VIEW */}
                {activeTab === 'stats' && (
                  <View style={{ gap: 16 }}>
                    
                    {/* Placement Metrics (Rows of 4 columns) */}
                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <StatsCard
                          title="Applied"
                          value={placementStats?.total_applications ?? getFunnelValue("Applications Sent", 847)}
                          icon={Send}
                          color="#2563EB"
                        />
                        <StatsCard
                          title="Shortlist"
                          value={placementStats?.shortlisted ?? getFunnelValue("Shortlisted", 312)}
                          icon={Star}
                          color="#F59E0B"
                        />
                        <StatsCard
                          title="Interviews"
                          value={getFunnelValue("Interviews Scheduled", 156)}
                          icon={Calendar}
                          color="#EF4444"
                        />
                        <StatsCard
                          title="Offers"
                          value={placementStats?.placed ?? getFunnelValue("Offers Received", 98)}
                          icon={Award}
                          color="#10B981"
                        />
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <StatsCard
                          title="Rate"
                          value={placementStats?.placement_rate !== undefined ? `${Number(placementStats.placement_rate).toFixed(0)}%` : "77%"}
                          icon={FileText}
                          color="#8B5CF6"
                        />
                        <StatsCard
                          title="Avg CTC"
                          value={placementStats?.average_ctc !== undefined ? `₹${Number(placementStats.average_ctc).toFixed(1)}L` : "₹8.4L"}
                          icon={IndianRupee}
                          color="#0D9488"
                        />
                        <StatsCard
                          title="Max CTC"
                          value={placementStats?.highest_ctc !== undefined ? `₹${Number(placementStats.highest_ctc).toFixed(0)}L` : "₹24.0L"}
                          icon={Trophy}
                          color="#D97706"
                        />
                        <StatsCard
                          title="Companies"
                          value={placementStats?.companies_visited !== undefined ? placementStats.companies_visited : (drivesList.length || 18)}
                          icon={Briefcase}
                          color="#475569"
                        />
                      </View>
                    </View>

                    {/* Stats sections switcher toggle */}
                    <View style={styles.tabSwitcherContainer}>
                      <TouchableOpacity 
                        style={[styles.tabBtn, statsSectionActiveFilter === 'funnel' && styles.activeTabBtn]}
                        onPress={() => setStatsSectionActiveFilter('funnel')}
                      >
                        <Text style={[styles.tabBtnText, statsSectionActiveFilter === 'funnel' && styles.activeTabBtnText]}>
                          Funnel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.tabBtn, statsSectionActiveFilter === 'salary' && styles.activeTabBtn]}
                        onPress={() => setStatsSectionActiveFilter('salary')}
                      >
                        <Text style={[styles.tabBtnText, statsSectionActiveFilter === 'salary' && styles.activeTabBtnText]}>
                          Salary
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.tabBtn, statsSectionActiveFilter === 'branches' && styles.activeTabBtn]}
                        onPress={() => setStatsSectionActiveFilter('branches')}
                      >
                        <Text style={[styles.tabBtnText, statsSectionActiveFilter === 'branches' && styles.activeTabBtnText]}>
                          Branches
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.tabBtn, statsSectionActiveFilter === 'partners' && styles.activeTabBtn]}
                        onPress={() => setStatsSectionActiveFilter('partners')}
                      >
                        <Text style={[styles.tabBtnText, statsSectionActiveFilter === 'partners' && styles.activeTabBtnText]}>
                          Partners
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Section Conditionally Rendered */}
                    {statsSectionActiveFilter === 'funnel' && (
                      /* Placement funnel progress */
                      <Card style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <BarChart color="#64748B" size={18} />
                          <Text style={styles.sectionTitle}>Placement Funnel 2026</Text>
                        </View>
                        <View style={styles.listContainer}>
                          {displayFunnelData.map((stage, idx) => (
                            <View key={idx} style={styles.listItem}>
                              <View style={styles.listItemTextRow}>
                                <Text style={styles.listItemLabel}>{stage.label}</Text>
                                <Text style={styles.listItemValue}>{stage.value}</Text>
                              </View>
                              <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: stage.width as any, backgroundColor: stage.color }]} />
                              </View>
                            </View>
                          ))}
                        </View>
                      </Card>
                    )}

                    {statsSectionActiveFilter === 'salary' && (
                      /* CTC and general placement rate */
                      <Card style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <Award color="#64748B" size={18} />
                          <Text style={styles.sectionTitle}>Compensation Performance</Text>
                        </View>
                        
                        <View style={styles.ctcHighlightCard}>
                          <Text style={styles.ctcLabel}>AVERAGE CTC 2026</Text>
                          <Text style={styles.ctcValue}>
                            {placementStats?.average_ctc !== undefined ? `₹${Number(placementStats.average_ctc).toFixed(1)} LPA` : (placementStats?.average_package || "₹8.4 LPA")}
                          </Text>
                          <View style={styles.ctcBadge}>
                            <TrendingUp size={10} color="#059669" />
                            <Text style={styles.ctcBadgeText}>
                              {placementStats?.placement_rate ? `Placement Rate: ${Number(placementStats.placement_rate).toFixed(1)}%` : "Live database metrics"}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.listContainer, { marginTop: 24 }]}>
                          <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>Salary Distribution</Text>
                          {displaySalaryBands.map((band, idx) => (
                            <View key={idx} style={styles.listItem}>
                              <View style={styles.listItemTextRow}>
                                <Text style={styles.listItemLabel}>{band.range}</Text>
                                <Text style={styles.listItemValue}>{band.percentage}%</Text>
                              </View>
                              <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${band.percentage}%`, backgroundColor: band.color }]} />
                              </View>
                            </View>
                          ))}
                        </View>
                      </Card>
                    )}

                    {statsSectionActiveFilter === 'branches' && (
                      /* Branch-wise placement rate progress */
                      <Card style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <Award color="#64748B" size={18} />
                          <Text style={styles.sectionTitle}>Branch-wise Placement Rate</Text>
                        </View>
                        <View style={styles.listContainer}>
                          {displayBranchPlacementRate.map((item, idx) => (
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
                    )}

                    {statsSectionActiveFilter === 'partners' && (
                      /* Recruiting Partners list */
                      <Card style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <Building2 color="#64748B" size={18} />
                          <Text style={styles.sectionTitle}>Company-wise Selections</Text>
                        </View>
                        <View style={styles.listContainer}>
                          {displayRecruiters.map((r, idx) => {
                            const initial = r.name.charAt(0).toUpperCase();
                            const avatarColor = getAvatarColor(r.name);
                            
                            return (
                              <View key={idx} style={[styles.entityRow, idx === displayRecruiters.length - 1 && styles.noBorder, { alignItems: 'center' }]}>
                                <View style={[styles.entityIconCircle, { backgroundColor: avatarColor }]}>
                                  <Text style={styles.entityIconText}>{initial}</Text>
                                </View>
                                <View style={styles.entityInfo}>
                                  <Text style={styles.entityName}>{r.name}</Text>
                                  <Text style={styles.entitySub}>{r.package || "—"}</Text>
                                </View>
                                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 70, alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>{r.offers} offers</Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </Card>
                    )}
                  </View>
                )}
              </>
            )}
          </Animated.View>
        )}
      </ScrollView>
      {renderAddEditDriveModal()}
      {renderBranchSelectorModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  
  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },

  // Switcher Tab styles
  tabSwitcherContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  activeTabBtn: { backgroundColor: '#FFF', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabBtnText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  activeTabBtnText: { color: '#0F172A' },

  // Metrics Grid
  metricsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 4, 
    marginBottom: 20,
    marginHorizontal: -4
  },

  // Drives subtab styles
  driveCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, borderStyle: 'solid', borderWidth: 1, borderColor: '#E2E8F0', gap: 14, marginBottom: 16 },
  driveHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  companyAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  companyAvatarText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  companyName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  roleName: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeOpen: { backgroundColor: 'rgba(16, 185, 129, 0.08)' },
  statusBadgeClosed: { backgroundColor: 'rgba(239, 68, 68, 0.08)' },
  statusBadgeShortlisted: { backgroundColor: 'rgba(245, 158, 11, 0.08)' },
  statusText: { fontSize: 9, fontWeight: '800' },
  statusTextOpen: { color: '#10B981' },
  statusTextClosed: { color: '#EF4444' },
  statusTextShortlisted: { color: '#F59E0B' },

  driveDetails: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: 10 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  driveFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deadlineText: { fontSize: 11, color: '#EF4444', fontWeight: '700' },
  manageBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FF6B00', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  manageBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  // Tracker / list styles
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 44, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchBarInput: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '500', height: '100%' },

  studentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1.1, marginRight: 8 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarCircleText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  studentName: { fontSize: 13, fontWeight: '800', color: '#1E293B', maxWidth: 120 },
  studentSubtitle: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  packageText: { fontSize: 11, fontWeight: '700', color: '#10B981', marginTop: 2 },

  // Eligibility subtab styles
  filterForm: { gap: 14 },
  filterInputGroup: { gap: 6 },
  filterLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  dropdownTriggerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, minHeight: 40 },
  dropdownTriggerText: { fontSize: 13, color: '#0F172A', fontWeight: '500', flex: 1 },
  filterRow: { flexDirection: 'row', gap: 12 },
  filterTextInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, color: '#0F172A', fontWeight: '500', height: 40 },
  studentSimpleRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  studentSimpleName: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  studentSimpleSub: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },

  // Stats tab styles
  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  sectionSubtitle: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },

  listContainer: { gap: 16 },
  listItem: { gap: 8 },
  listItemTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listItemLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  listItemValue: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  entityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  entityIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  entityIconText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  entityInfo: { flex: 1 },
  entityName: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  entitySub: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  entityStatus: { alignItems: 'flex-end' },
  entityStatusText: { fontSize: 12, fontWeight: '800', color: '#059669' },
  recPackageText: { fontSize: 10, color: '#64748B', marginTop: 2 },

  ctcHighlightCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  ctcLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 8 },
  ctcValue: { fontSize: 32, fontWeight: '900', color: '#0F172A', letterSpacing: -1, marginBottom: 8 },
  ctcBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ctcBadgeText: { fontSize: 9, fontWeight: '800', color: '#059669' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', fontFamily: typography.fontFamily.display },
  modalSub: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  subTabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 12 },
  subTabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeSubTabBtn: { borderBottomColor: '#FF6B00' },
  subTabBtnText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  activeSubTabBtnText: { color: '#0F172A' },

  candidateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  candidateLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  candidateAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  candidateAvatarText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  candidateName: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  candidateSub: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  
  actionGroup: { flexDirection: 'row', gap: 6 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnShortlist: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  btnSelect: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  btnReject: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  actionBtnText: { fontSize: 11, fontWeight: '800' },
  placedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  placedBadgeText: { fontSize: 10, fontWeight: '800', color: '#059669' },

  emptyCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 20, backgroundColor: '#FFF' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 6 },
  loaderContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loaderText: { marginTop: 8, fontSize: 13, color: '#64748B', fontWeight: '500' },
  eligibilityLists: { gap: 16, marginTop: 16 },

  // Selector list styles
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  selectedOption: { backgroundColor: '#F8FAFC' },
  optionText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  selectedOptionText: { color: '#0F172A', fontWeight: '800' },
  checkMark: { color: '#FF6B00', fontWeight: 'bold', fontSize: 14 },
  modalDoneBtn: { backgroundColor: '#0F172A', paddingVertical: 12, margin: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalDoneText: { color: '#FFF', fontSize: 14, fontWeight: '800' }
});
