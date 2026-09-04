import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Switch, 
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  ChevronRight, 
  ChevronDown,
  Cpu, 
  Database, 
  LineChart,
  Sparkles,
  Check,
  GraduationCap,
  Briefcase,
  Calendar,
  Heart,
  BookOpen,
  ArrowRight,
  Compass,
  Search,
  Loader2,
  X,
  AlertCircle,
  Award,
  ShieldCheck,
  Lock,
  RefreshCw,
  SkipForward,
  ChevronUp,
  HelpCircle
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { 
  getStudentCareerPath, 
  getRecommendedPaths, 
  getAllCareerPaths,
  enrollStudentPath,
  deleteStudentEnrollment,
  getHierarchySkillsForPath,
  logMilestoneProgress,
  completeMilestonePoint,
  getSkillTestQuestions,
  submitSkillTest,
  getSkillTestResult,
  getStudentSkills,
  getCareerRecommendations,
  getCareerPathDetail,
  createStudentSkill
} from '@/api/student.services';
import SkillVerificationModal from '@/components/SkillVerificationModal';

// --- Helper UI Components for mobile ---

const Badge = ({ text, color, bgColor }: { text: string; color: string; bgColor: string }) => (
  <View style={{ backgroundColor: bgColor, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, marginBottom: 4 }}>
    <Text style={{ fontSize: 10, fontWeight: '700', color: color }}>{text}</Text>
  </View>
);


const DropdownSelect = ({ label, value, options, onSelect }: { label: string, value: string | number, options: {label: string, value: string | number}[], onSelect: (val: any) => void }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || value;
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[styles.input, { marginBottom: 0, justifyContent: 'center' }]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 13, color: '#1E293B', fontWeight: '500' }}>{selectedLabel}</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setModalVisible(false)}>
          <View style={{ width: '80%', backgroundColor: 'white', borderRadius: 12, maxHeight: 400, padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Select {label}</Text>
            <ScrollView>
              {options.map((opt, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9' }}
                  onPress={() => { onSelect(opt.value); setModalVisible(false); }}
                >
                  <Text style={{ fontSize: 14, color: opt.value === value ? '#2563EB' : '#334155', fontWeight: opt.value === value ? 'bold' : 'normal' }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export const StudentPathScreen = () => {
  const { userName } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activePath, setActivePath] = useState<any>(null);

  // Wizard States
  const [inWizardMode, setInWizardMode] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  
  // Profile Form (Step 1)
  const [degree, setDegree] = useState("B.Tech");
  const [specialisation, setSpecialisation] = useState("");
  const [academicYear, setAcademicYear] = useState<number>(1);
  const [interests, setInterests] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Recommendations / Master Paths (Step 2)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [alternatePaths, setAlternatePaths] = useState<any[]>([]);
  const [showMasterSearch, setShowMasterSearch] = useState(false);
  const [masterSearchQuery, setMasterSearchQuery] = useState("");
  const [filteredMasterPaths, setFilteredMasterPaths] = useState<any[]>([]);
  const [masterPathsLoading, setMasterPathsLoading] = useState(false);
  
  const [masterPage, setMasterPage] = useState(1);
  const [masterTotalCount, setMasterTotalCount] = useState(0);
  const [masterTotalPages, setMasterTotalPages] = useState(1);

  // Selection & Details (Step 3)
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [selectedPathDetails, setSelectedPathDetails] = useState<any>(null);
  const [hierarchySkills, setHierarchySkills] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleModalData, setToggleModalData] = useState<{ milestoneTitle: string, pointTitle: string, currentStatus: string } | null>(null);

  // AI Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("Initializing AI Agents...");
  const [isGenerationFailed, setIsGenerationFailed] = useState(false);
  const [failedPathTitle, setFailedPathTitle] = useState("");
  const [failedEnrollmentName, setFailedEnrollmentName] = useState("");

  // Skill Verification States
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [activeTestSkill, setActiveTestSkill] = useState("");
  const [activeTestLevel, setActiveTestLevel] = useState("Beginner");
  const [activeMilestoneForTest, setActiveMilestoneForTest] = useState<any>(null);
  
  // Active Journey Detailed States
  const [studentSkills, setStudentSkills] = useState<any[]>([]);
  const [collapsedChecklists, setCollapsedChecklists] = useState<Record<string, boolean>>({});
  const [revisedMilestones, setRevisedMilestones] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (!showMasterSearch) return;
    const timeoutId = setTimeout(() => {
      fetchMasterCareerPaths(masterSearchQuery, 1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [masterSearchQuery, showMasterSearch]);
  
  const fetchData = useCallback(async () => {
    const studentEmail = userName || 'ac1@gmail.com';
    setLoading(true);
    try {
      const careerRes = await getStudentCareerPath(studentEmail);
      if (careerRes?.message && careerRes.message.type === 'active_plan') {
        const data = careerRes.message.data;
        if (data.has_active_plan) {
          setActivePath(data);
          setInWizardMode(false);
          // Fetch student skills for checking acquired skills
          try {
             const skillsRes = await getStudentSkills(studentEmail);
             if (skillsRes && skillsRes.message) {
               setStudentSkills(skillsRes.message);
             }
          } catch (e) { console.error("Error fetching student skills", e); }
        } else {
          setInWizardMode(true);
        }
      } else if (careerRes?.message && careerRes.message.type === 'generating') {
         setIsGenerating(true);
         setInWizardMode(false);
         setGenerationPhase("AI is constructing milestones...");
         pollGenerationStatus(careerRes.message.enrollment_id);
      } else if (careerRes?.message && careerRes.message.type === 'generation_failed') {
         setIsGenerationFailed(true);
         setInWizardMode(false);
         setFailedPathTitle(careerRes.message.career_path || "");
         setFailedEnrollmentName(careerRes.message.enrollment_id);
      } else {
        setInWizardMode(true);
      }
    } catch (error) {
      console.error("Error fetching active path data:", error);
      setInWizardMode(true);
    } finally {
      setLoading(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pollGenerationStatus = async (enrollmentName: string) => {
    const studentEmail = userName || 'ac1@gmail.com';
    let attempts = 0;
    const maxAttempts = 24; // 2 mins total if polling every 5s
    const phases = [
      "Analyzing Profile & Gaps...",
      "Matching Core Domain Requirements...",
      "Drafting Custom Milestones...",
      "Refining Learning Outcomes...",
      "Finalizing Roadmap..."
    ];

    const interval = setInterval(async () => {
      attempts++;
      setGenerationPhase(phases[Math.min(attempts % phases.length, phases.length - 1)]);

      try {
        const checkRes = await getStudentCareerPath(studentEmail);
        if (checkRes?.message) {
          if (checkRes.message.type === 'active_plan' && checkRes.message.data?.has_active_plan) {
            clearInterval(interval);
            setIsGenerating(false);
            Alert.alert("Success", "Your personalized path has been successfully generated!");
            await fetchData();
          } else if (checkRes.message.type === 'generation_failed') {
            clearInterval(interval);
            setIsGenerating(false);
            setIsGenerationFailed(true);
            setFailedPathTitle(checkRes.message.career_path || "Unknown");
            setFailedEnrollmentName(checkRes.message.enrollment_id);
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 5000);
  };

  const handleGetRecommendations = async (fromStep1 = false) => {
    if (fromStep1) {
      if (!degree || !specialisation || !academicYear || !interests || !skillsInput) {
        Alert.alert("Error", "Please fill in all the fields before proceeding.");
        return;
      }
    }
    
    const studentEmail = userName || 'ac1@gmail.com';
    setRecommendationsLoading(true);
    
    // Process skills
    const parsedSkills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    setSelectedSkills(parsedSkills);

    try {
      const res = await getCareerRecommendations({
        degree: degree || "B.Tech",
        branch: specialisation || "Computer Science",
        year: academicYear || 3,
        country: "India",
        interests: interests || "Web Development, Artificial Intelligence",
        skills: parsedSkills.length > 0 ? parsedSkills : ["ML"]
      });
      if (res?.message?.recommended_paths) {
        setAlternatePaths(res.message.recommended_paths);
      }
      setWizardStep(2);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch recommendations. Try exploring the master list.");
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const fetchMasterCareerPaths = async (search: string, pageNum: number) => {
    setMasterPathsLoading(true);
    setMasterPage(pageNum);
    try {
      const res = await getAllCareerPaths(search, pageNum, 10);
      if (res && res.message && res.message.paths) {
        setFilteredMasterPaths(res.message.paths);
        setMasterTotalCount(res.message.total_count);
        setMasterTotalPages(res.message.total_pages);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load master career paths.");
    } finally {
      setMasterPathsLoading(false);
    }
  };

  const handleSelectPathForSkills = async (path: any) => {
    setSelectedPath(path);
    setHierarchySkills(null);
    setDetailsLoading(true);
    try {
      const pathTitle = path.career || path.title || path.path_name || path.name || "Unknown Path";
      const skillsRes = await getHierarchySkillsForPath(pathTitle);
      if (skillsRes && skillsRes.message) {
        setHierarchySkills(skillsRes.message);
      }
    } catch (err) {
      console.error(err);
      setHierarchySkills({
        foundation_skills: path.skills ? path.skills.slice(0, 2) : [],
        core_domain_skills: path.skills ? path.skills.slice(2, 4) : [],
        industry_skills: path.skills ? path.skills.slice(4, 5) : [],
        emerging_skills: path.skills ? path.skills.slice(5) : []
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleGoToGapAnalysis = async () => {
    if (!hierarchySkills) {
      Alert.alert("Hold on", "Please wait for skill hierarchy to load.");
      return;
    }
    if (!selectedPath) return;
    setDetailsLoading(true);
    try {
      const studentEmail = userName || 'ac1@gmail.com';
      const pathTitle = selectedPath.career || selectedPath.title || selectedPath.path_name || selectedPath.name || "Unknown Path";
      const res = await getCareerPathDetail(pathTitle, studentEmail);
      if (res && res.message) {
        setSelectedPathDetails(res.message);
      } else {
        setSelectedPathDetails(selectedPath);
      }
      setWizardStep(3);
    } catch (err) {
      console.error("Error getting career path detail:", err);
      setSelectedPathDetails(selectedPath);
      setWizardStep(3);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStartPersonalizedRoadmap = async () => {
    if (!selectedPath) return;
    const studentEmail = userName || 'ac1@gmail.com';
    const pathName = selectedPath.career || selectedPath.title || selectedPath.path_name || selectedPath.career_path || selectedPath.name || "Unknown Path";
    
    setShowConfirmModal(false);
    setIsGenerating(true);
    setGenerationPhase("Initializing SkillAgent for roadmap mapping...");
    setInWizardMode(false);

    try {
      // 1. Submit claimed skills
      if (selectedSkills && selectedSkills.length > 0) {
        for (const skill of selectedSkills) {
          try {
            await createStudentSkill({
              student: studentEmail,
              skill: skill,
              current_level: "Beginner", // Using a default since step 1 doesn't capture level per skill
              self_declared: 1
            });
          } catch (skillErr: any) {
            // Ignore errors for individual skills (e.g. "Could not find Skill: AI") so enrollment can proceed
            console.warn(`Failed to log skill ${skill}:`, skillErr?.response?.data?.message || skillErr?.message);
          }
        }
      }

      // 2. Enroll student
      await enrollStudentPath(studentEmail, pathName);
      
      // 3. Poll for generation status / land on path default page
      pollGenerationStatus("generating");
    } catch (err: any) {
      console.error("Enrollment error", err);
      setIsGenerating(false);
      setInWizardMode(true);
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to start AI generation.");
    }
  };

  // -----------------------------------------
  // Active Path Functions
  // -----------------------------------------
  const handleTogglePoint = (milestoneTitle: string, pointTitle: string, currentStatus: string) => {
    setToggleModalData({ milestoneTitle, pointTitle, currentStatus });
    setShowToggleModal(true);
  };

  const confirmTogglePoint = async () => {
    if (!activePath || !pathData?.enrollment_id || !toggleModalData) return;
    
    const { milestoneTitle, pointTitle, currentStatus } = toggleModalData;
    const newCompleted = currentStatus !== 'Completed';

    setShowToggleModal(false);

    try {
      const res = await completeMilestonePoint({
        enrollment: pathData.enrollment_id,
        milestone_title: milestoneTitle,
        point_title: pointTitle,
        completed: newCompleted
      });
      if (res?.message?.milestone_completed) {
        Alert.alert("🎉 Success!", "Milestone fully completed! You have gained the corresponding skills.");
      } else if (res?.message?.success) {
        // Quietly succeed
      }
      await fetchData();
    } catch (err) {
      console.error("Failed to check off task", err);
      Alert.alert("Error", "Failed to update task status.");
    }
  };

  const handleChecklistToggle = (milestoneName: string) => {
    setCollapsedChecklists(prev => ({
      ...prev,
      [milestoneName]: !prev[milestoneName]
    }));
  };


  const handleStartVerificationTest = async (milestone: any) => {
    setActiveMilestoneForTest(milestone);
    setActiveTestSkill(milestone.skill || milestone.milestone_title || "Unknown");
    setActiveTestLevel(milestone.required_skill_level || "Beginner");
    setIsTestModalOpen(true);
  };

  // --- Data Mapping Logic ---
  const pathData = activePath?.data || activePath;
  const activePathTitle = pathData?.career_path || pathData?.career_path_name || pathData?.path_name || pathData?.title || "Career Path";
  const activePathProgress = pathData?.progress_percent !== undefined
    ? pathData.progress_percent
    : (pathData?.progress || Math.round(((pathData?.matched_count || 0) / (pathData?.total_skills || 1)) * 100) || 0);
  const isPathCompleted = pathData?.is_completed === 1 || pathData?.is_completed === true || activePathProgress >= 100;
  const estCompletion = pathData?.estimated_completion || pathData?.est_completion || (pathData?.estimated_duration ? `${pathData.estimated_duration} Year(s)` : "Pending");
  const targetRole = pathData?.target_role || pathData?.target || "Target Role";

  const rawSteps = pathData?.milestones || pathData?.roadmap || pathData?.steps || pathData?.path_items || pathData?.items;
  const roadmap = Array.isArray(rawSteps) && rawSteps.length > 0
    ? rawSteps.map((step: any) => {
      return {
        name: step.name || "",
        title: step.milestone_title || step.title || step.step_name || "Untitled Step",
        skill: step.skill || "",
        required_skill_level: step.required_skill_level || step.level || "Beginner",
        category: step.category || "Fundamental",
        is_mandatory: step.is_mandatory !== undefined ? step.is_mandatory : 1,
        milestone_type: step.milestone_type || "Learn",
        linked_resource_type: step.linked_resource_type || "Course",
        linked_resource: step.linked_resource || "",
        date: step.display_date || (step.duration_days ? `${step.duration_days} Days` : ""),
        status: step.status || "upcoming",
        points: step.points || []
      };
    })
    : [];

  const firstIncompleteIdx = roadmap.findIndex((m: any) => m.status !== 'Completed' && m.status !== 'completed');

  // --- Render logic ---
  if (loading && !isGenerating) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        <Text style={styles.loadingText}>Syncing Career Path...</Text>
      </SafeAreaView>
    );
  }

  if (isGenerating) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Sparkles color="#F59E0B" size={40} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 16 }}>AI Roadmap Builder</Text>
          <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
            Your personalized learning roadmap is being built.
          </Text>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2563EB', marginTop: 16 }}>{generationPhase}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isGenerationFailed) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={{ alignItems: 'center', padding: 20 }}>
          <AlertCircle color="#EF4444" size={48} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 16 }}>Generation Failed</Text>
          <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
            We encountered an issue while building your path for {failedPathTitle}.
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#EF4444', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 12 }}
            onPress={() => {
              setIsGenerationFailed(false);
              setIsGenerating(true);
              pollGenerationStatus(failedEnrollmentName);
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry Generation</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center' }}
            onPress={async () => {
              if (failedEnrollmentName) await deleteStudentEnrollment(failedEnrollmentName);
              setIsGenerationFailed(false);
              setInWizardMode(true);
            }}
          >
            <Text style={{ color: '#475569', fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {inWizardMode ? (
        // WIZARD FLOW
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <View style={styles.headerBadge}>
                  <Sparkles size={10} color={colors.accent.DEFAULT} />
                  <Text style={styles.headerBadgeText}>AI CAREER PATHFINDER</Text>
                </View>
                <Text style={styles.title}>Onboarding</Text>
              </View>
              {activePath && (
                <TouchableOpacity onPress={() => setInWizardMode(false)} style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#DBEAFE' }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1D4ED8' }}>Back to Active</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Step Indicators */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 }}>
            {[1, 2, 3].map((step) => (
               <React.Fragment key={step}>
                 <View style={{
                   width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                   backgroundColor: wizardStep === step ? '#2563EB' : wizardStep > step ? '#10B981' : '#E2E8F0'
                 }}>
                   {wizardStep > step ? <Check color="white" size={16}/> : <Text style={{ color: wizardStep === step ? 'white' : '#64748B', fontWeight: 'bold' }}>{step}</Text>}
                 </View>
                 {step < 3 && <View style={{ height: 2, flex: 1, backgroundColor: wizardStep > step ? '#10B981' : '#E2E8F0', marginHorizontal: 4 }} />}
               </React.Fragment>
            ))}
          </View>

          {/* Guide Hint */}
          <View style={{ backgroundColor: '#FFFBEB', borderColor: '#FEF3C7', borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <AlertCircle size={16} color="#D97706" />
            <Text style={{ flex: 1, marginLeft: 8, fontSize: 12, color: '#92400E', fontWeight: '500' }}>
              Unsure about what to enter? Scroll down below the form to read our step-by-step Onboarding Guide.
            </Text>
          </View>

          <View style={styles.premiumCard}>
            {wizardStep === 1 && (
              <Animated.View entering={FadeInRight}>
                <Text style={styles.sectionTitle}>1. Academic Profile</Text>
                
                <DropdownSelect 
                  label="Degree / Qualification" 
                  value={degree} 
                  onSelect={setDegree} 
                  options={[
                    {label: "Bachelor of Technology (B.Tech)", value: "B.Tech"},
                    {label: "Bachelor of Engineering (B.E.)", value: "B.E."},
                    {label: "Master of Technology (M.Tech)", value: "M.Tech"},
                    {label: "Bachelor of Computer Applications (BCA)", value: "B.C.A."},
                    {label: "Master of Computer Applications (MCA)", value: "M.C.A."},
                    {label: "Bachelor of Science (B.Sc)", value: "B.Sc."},
                    {label: "Master of Science (M.Sc)", value: "M.Sc."}
                  ]} 
                />
                <DropdownSelect 
                  label="Academic Year" 
                  value={academicYear} 
                  onSelect={setAcademicYear} 
                  options={[
                    {label: "First Year (1st)", value: 1},
                    {label: "Second Year (2nd)", value: 2},
                    {label: "Third Year (3rd)", value: 3},
                    {label: "Fourth Year (4th)", value: 4},
                    {label: "Graduate / Completed", value: 5}
                  ]} 
                />
                
                <Text style={styles.label}>Branch / Specialisation</Text>
                <TextInput style={styles.input} value={specialisation} onChangeText={setSpecialisation} placeholder="e.g. Computer Science" />
                
                <Text style={styles.label}>Core Interests (Comma Separated)</Text>
                <TextInput style={styles.input} value={interests} onChangeText={setInterests} placeholder="e.g. Web Dev, AI" />
                
                <Text style={styles.label}>Claimed Skills (Comma Separated)</Text>
                <TextInput style={styles.input} value={skillsInput} onChangeText={setSkillsInput} placeholder="e.g. Python, React" />
                
                <TouchableOpacity style={styles.primaryBtn} onPress={() => handleGetRecommendations(true)} disabled={recommendationsLoading}>
                  {recommendationsLoading ? <ActivityIndicator color="white"/> : <Text style={styles.primaryBtnText}>Find Recommended Paths</Text>}
                </TouchableOpacity>
              </Animated.View>
            )}

            {wizardStep === 2 && (
              <Animated.View entering={FadeInRight}>
                <View style={{ marginBottom: 16 }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Target size={16} color="#3B82F6" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>
                        {!showMasterSearch 
                           ? "Recommended Career Paths (Retrieved/Generated by AI Agents)" 
                           : "AI Career Knowledgebase Library"}
                      </Text>
                   </View>
                   <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 18 }}>
                      {!showMasterSearch
                         ? "These paths were hand-picked by our AI based on your background and interests."
                         : "Browse or search through our extensive knowledgebase of careers mapped by AI agents. Select any path to initiate skill gap analysis and generate a personalized roadmap."}
                   </Text>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 16, backgroundColor: '#F1F5F9', padding: 4, borderRadius: 8 }}>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowMasterSearch(false);
                      if (alternatePaths.length === 0) {
                        handleGetRecommendations();
                      }
                    }} 
                    style={[styles.tabBtnSm, !showMasterSearch && styles.activeTabBtnSm, { flex: 1, alignItems: 'center' }]}
                  >
                    <Text style={[styles.tabBtnTextSm, !showMasterSearch && styles.activeTabBtnTextSm]}>Recommended</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShowMasterSearch(true); fetchMasterCareerPaths("", 1); }} style={[styles.tabBtnSm, showMasterSearch && styles.activeTabBtnSm, { flex: 1, alignItems: 'center' }]}>
                    <Text style={[styles.tabBtnTextSm, showMasterSearch && styles.activeTabBtnTextSm]}>Explore Other Paths</Text>
                  </TouchableOpacity>
                </View>

                {showMasterSearch && (
                  <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12 }}>
                     <Search size={16} color="#94A3B8" />
                     <TextInput 
                       style={{ flex: 1, height: 44, marginLeft: 8, color: '#1E293B', fontSize: 13 }} 
                       placeholder="Search career knowledgebase (e.g. AI Engineer, UX Designer)..." 
                       value={masterSearchQuery}
                       onChangeText={setMasterSearchQuery}
                       onSubmitEditing={() => fetchMasterCareerPaths(masterSearchQuery, 1)}
                     />
                  </View>
                )}

                {showMasterSearch && masterPathsLoading ? (
                  <ActivityIndicator style={{ margin: 20 }} />
                ) : !showMasterSearch && recommendationsLoading ? (
                  <View style={{ margin: 20, alignItems: 'center' }}>
                     <ActivityIndicator color="#2563EB" />
                     <Text style={{ marginTop: 8, fontSize: 12, color: '#64748B' }}>Fetching AI Recommendations...</Text>
                  </View>
                ) : (
                  <View style={{ marginBottom: 16 }}>
                    {(showMasterSearch ? filteredMasterPaths : alternatePaths).map((path: any, idx: number) => {
                      const pathTitle = path.career || path.title || path.path_name || "Unknown Path";
                      const isSelected = (selectedPath?.career || selectedPath?.title) === pathTitle;
                      
                      const confidence = path.confidence;
                      const industry = (path.industry || path.category || "GENERAL").toUpperCase();
                      const stage = path.career_stage || "Growing";
                      const demand = path.future_demand || "High";
                      const duration = path.estimated_duration || "1 Months Est.";
                      const skills = Array.isArray(path.skills) ? path.skills : [];
                      const displayedSkills = skills.slice(0, 4);
                      const extraSkillsCount = skills.length > 4 ? skills.length - 4 : 0;

                      return (
                        <TouchableOpacity 
                          key={idx} 
                          onPress={() => handleSelectPathForSkills(path)}
                          style={{
                            padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 16,
                            borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                            backgroundColor: 'white',
                            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <Text style={{ fontWeight: 'bold', color: '#1E293B', fontSize: 16, flex: 1, marginRight: 8 }}>{pathTitle}</Text>
                            {confidence && (
                               <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 }}>
                                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2563EB' }}>{confidence}% Match</Text>
                               </View>
                            )}
                          </View>
                          
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 12 }}>{industry}</Text>
                          
                          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                             <View style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' }}>
                                <Text style={{ fontSize: 10, color: '#475569' }}>{stage}</Text>
                             </View>
                             <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#E0E7FF' }}>
                                <Text style={{ fontSize: 10, color: '#4F46E5', fontWeight: 'bold' }}>{duration}</Text>
                             </View>
                          </View>
                          
                          {skills.length > 0 && (
                             <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                                {displayedSkills.map((s: string, sIdx: number) => (
                                   <View key={sIdx} style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                                      <Text style={{ fontSize: 10, color: '#475569' }}>{s.toLowerCase()}</Text>
                                   </View>
                                ))}
                                {extraSkillsCount > 0 && (
                                   <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                                      <Text style={{ fontSize: 10, color: '#475569' }}>+{extraSkillsCount} more</Text>
                                   </View>
                                )}
                             </View>
                          )}
                          
                          <View style={{ alignItems: 'center', marginTop: 4 }}>
                             <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>Click to View Details {'>'}</Text>
                          </View>
                        </TouchableOpacity>
                      )
                    })}

                    {showMasterSearch && masterTotalPages > 1 && (
                       <View style={{ marginTop: 12, marginBottom: 20, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                          <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center', marginBottom: 12 }}>
                             Showing {((masterPage - 1) * 10) + 1} - {Math.min(masterPage * 10, masterTotalCount)} of {masterTotalCount} paths
                          </Text>
                          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                             <TouchableOpacity 
                                disabled={masterPage <= 1} 
                                onPress={() => fetchMasterCareerPaths(masterSearchQuery, masterPage - 1)}
                                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: masterPage <= 1 ? '#F1F5F9' : 'white', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
                             >
                                <Text style={{ fontSize: 12, color: masterPage <= 1 ? '#94A3B8' : '#475569', fontWeight: 'bold' }}>Prev</Text>
                             </TouchableOpacity>
                             
                             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                               {Array.from({ length: Math.min(5, masterTotalPages) }, (_, i) => {
                                  let pageNum = i + 1;
                                  if (masterPage > 3 && masterTotalPages > 5) {
                                     pageNum = masterPage - 2 + i;
                                     if (pageNum > masterTotalPages) pageNum = masterTotalPages - (4 - i);
                                  }
                                  const isActive = masterPage === pageNum;
                                  return (
                                     <TouchableOpacity 
                                        key={pageNum}
                                        onPress={() => fetchMasterCareerPaths(masterSearchQuery, pageNum)}
                                        style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: isActive ? '#2563EB' : 'white', borderWidth: isActive ? 0 : 1, borderColor: '#E2E8F0' }}
                                     >
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: isActive ? 'white' : '#475569' }}>{pageNum}</Text>
                                     </TouchableOpacity>
                                  );
                               })}
                             </ScrollView>

                             <TouchableOpacity 
                                disabled={masterPage >= masterTotalPages}
                                onPress={() => fetchMasterCareerPaths(masterSearchQuery, masterPage + 1)}
                                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: masterPage >= masterTotalPages ? '#F1F5F9' : 'white', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
                             >
                                <Text style={{ fontSize: 12, color: masterPage >= masterTotalPages ? '#94A3B8' : '#475569', fontWeight: 'bold' }}>Next</Text>
                             </TouchableOpacity>
                          </View>
                       </View>
                    )}
                  </View>
                )}

                {selectedPath && (
                  <View style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 16, color: '#475569', textTransform: 'uppercase' }}>
                      <Text style={{ color: '#3B82F6' }}>✧</Text> SKILLAGENT HIERARCHY ANALYSIS: {(selectedPath.career || selectedPath.title || selectedPath.path_name || selectedPath.name || "Unknown Path").toUpperCase()}
                    </Text>
                    {detailsLoading ? <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 10 }} /> : hierarchySkills ? (
                      <View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                          <View style={{ width: '48%', backgroundColor: 'white', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#3B82F6', marginBottom: 8 }}>FOUNDATION</Text>
                            {hierarchySkills.foundation_skills?.map((s: string, i: number) => (
                              <Text key={i} style={{ fontSize: 11, color: '#334155', marginBottom: 4 }}>• {s}</Text>
                            ))}
                          </View>

                          <View style={{ width: '48%', backgroundColor: 'white', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#8B5CF6', marginBottom: 8 }}>CORE DOMAIN</Text>
                            {hierarchySkills.core_domain_skills?.map((s: string, i: number) => (
                              <Text key={i} style={{ fontSize: 11, color: '#334155', marginBottom: 4 }}>• {s}</Text>
                            ))}
                          </View>

                          <View style={{ width: '48%', backgroundColor: 'white', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10B981', marginBottom: 8 }}>INDUSTRY</Text>
                            {hierarchySkills.industry_skills?.map((s: string, i: number) => (
                              <Text key={i} style={{ fontSize: 11, color: '#334155', marginBottom: 4 }}>• {s}</Text>
                            ))}
                          </View>

                          <View style={{ width: '48%', backgroundColor: 'white', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#F97316', marginBottom: 8 }}>EMERGING</Text>
                            {hierarchySkills.emerging_skills?.map((s: string, i: number) => (
                              <Text key={i} style={{ fontSize: 11, color: '#334155', marginBottom: 4 }}>• {s}</Text>
                            ))}
                          </View>
                        </View>

                        <View style={{ alignItems: 'flex-end', marginTop: 4 }}>
                          <TouchableOpacity 
                            style={{ backgroundColor: '#2563EB', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center' }}
                            onPress={handleGoToGapAnalysis} 
                          >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Find Skill Gap {'>'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : <Text style={{ fontSize: 12, color: '#64748B' }}>Failed to load hierarchy.</Text>}
                  </View>
                )}

                <View style={{ alignItems: 'flex-start' }}>
                  <TouchableOpacity style={[styles.secondaryBtn, { paddingHorizontal: 20 }]} onPress={() => setWizardStep(1)}>
                    <Text style={styles.secondaryBtnText}>Back to Profile</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {wizardStep === 3 && selectedPath && (
              <Animated.View entering={FadeInRight}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>
                    <Text style={{ color: '#3B82F6' }}>✧</Text> AI Career Pathfinder Onboarding
                  </Text>
                  <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>Design your custom, gap-optimized milestone learning path</Text>

                  <View style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 }}>Career Goal: {selectedPathDetails?.name || selectedPath.title}</Text>
                    <Text style={{ fontSize: 12, color: '#64748B' }}>Comparing your claimed skills against SkillAgent requirements</Text>
                  </View>

                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Hierarchical Gap Assessment</Text>

                  {hierarchySkills && (
                    <View style={{ marginBottom: 24 }}>
                      {[
                        { key: 'foundation_skills', label: 'Foundation Tiers' },
                        { key: 'core_domain_skills', label: 'Core Domains' },
                        { key: 'industry_skills', label: 'Industry Applications' },
                        { key: 'emerging_skills', label: 'Emerging Fields' }
                      ].map(({ key, label }) => {
                        const skills = hierarchySkills[key] || [];
                        if (skills.length === 0) return null;

                        const missing = selectedPathDetails?.missing_skills 
                          ? skills.filter((s: string) => selectedPathDetails.missing_skills.some((m: any) => m.skill.toLowerCase() === s.toLowerCase()))
                          : skills.filter((s: string) => !selectedSkills.some(cs => cs.toLowerCase() === s.toLowerCase()));
                        
                        const matched = selectedPathDetails?.matched_skills 
                          ? skills.filter((s: string) => selectedPathDetails.matched_skills.some((m: any) => m.skill.toLowerCase() === s.toLowerCase()))
                          : skills.filter((s: string) => selectedSkills.some(cs => cs.toLowerCase() === s.toLowerCase()));

                        return (
                          <View key={key} style={{ flexDirection: 'row', backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }}>
                            <View style={{ flex: 1, padding: 12, borderRightWidth: 1, borderRightColor: '#E2E8F0' }}>
                              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>{label} - MATCHED</Text>
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {matched.length > 0 ? matched.map((s: string) => (
                                  <Text key={s} style={{ fontSize: 11, color: '#475569', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 }}>{s}</Text>
                                )) : <Text style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>None matched</Text>}
                              </View>
                            </View>
                            <View style={{ flex: 1, padding: 12 }}>
                              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>{label} - GAP</Text>
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {missing.length > 0 ? missing.map((s: string) => (
                                  <Text key={s} style={{ fontSize: 11, color: '#EF4444', backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 }}>{s}</Text>
                                )) : <Text style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>No gaps</Text>}
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {selectedPathDetails?.milestones && selectedPathDetails.milestones.length > 0 && (
                    <View style={{ marginBottom: 32 }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Roadmap Sequence Preview</Text>
                      {selectedPathDetails.milestones.map((m: any, idx: number) => (
                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <Text style={{ fontSize: 10, color: '#64748B', fontWeight: 'bold' }}>{m.idx || idx + 1}</Text>
                          </View>
                          <Text style={{ flex: 1, fontSize: 13, color: '#334155', fontWeight: '600' }}>{m.milestone_title}</Text>
                          <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <Text style={{ fontSize: 9, color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase' }}>{m.milestone_type || 'LEARN'}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={{ flexDirection: 'column', gap: 12 }}>
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#2563EB', width: '100%' }]} onPress={() => setShowConfirmModal(true)}>
                      <Text style={styles.primaryBtnText}>✨ Proceed & Activate Path</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.secondaryBtn, { width: '100%' }]} onPress={() => setWizardStep(2)}>
                      <Text style={styles.secondaryBtnText}>Back to Suggestions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Onboarding Guide Card */}
            <View style={{ marginTop: 32, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 20 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>Onboarding Guide</Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4, marginBottom: 20 }}>Follow these steps to generate your path</Text>
              
              <View>
                {[
                  { num: 1, title: "Academic Profile", desc: "Tell us about your degree, specialisation, and core interests.", action: "Fill out the fields on the left and click 'Find Recommended Paths'." },
                  { num: 2, title: "Select Career Path", desc: "Explore AI-recommended career paths matching your profile.", action: "Click a path to view its skill hierarchy, then click 'Find Skill Gap'." },
                  { num: 3, title: "Skill Gap Analysis", desc: "Compare your claimed skills against path requirements.", action: "Review your matched/missing skills, then click 'Proceed & Activate Path'." }
                ].map((step, idx, arr) => {
                  const isCompleted = wizardStep > step.num;
                  const isActive = wizardStep === step.num;
                  return (
                    <View key={step.num} style={{ flexDirection: 'row', marginBottom: idx === arr.length - 1 ? 0 : 20 }}>
                      <View style={{ alignItems: 'center', marginRight: 16 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: isCompleted ? '#10B981' : isActive ? '#2563EB' : 'white', borderWidth: 1, borderColor: isCompleted ? '#10B981' : isActive ? '#2563EB' : '#E2E8F0', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
                          {isCompleted ? <Check size={14} color="white" /> : <Text style={{ fontSize: 10, fontWeight: 'bold', color: isActive ? 'white' : '#94A3B8' }}>{step.num}</Text>}
                        </View>
                        {idx < arr.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: '#F1F5F9', marginTop: -4, marginBottom: -24, zIndex: 1 }} />}
                      </View>
                      <View style={{ flex: 1, paddingBottom: 4 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: isActive ? '#2563EB' : isCompleted ? '#334155' : '#94A3B8' }}>{step.title}</Text>
                        <Text style={{ fontSize: 12, color: isActive ? '#475569' : '#94A3B8', marginTop: 2 }}>{step.desc}</Text>
                        
                        {isActive && (
                          <View style={{ marginTop: 8, backgroundColor: '#EFF6FF', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#DBEAFE' }}>
                             <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1D4ED8', textTransform: 'uppercase', marginBottom: 4 }}>👉 What to do now:</Text>
                             <Text style={{ fontSize: 12, fontWeight: '600', color: '#1E40AF' }}>{step.action}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Future Workflow Card */}
            <View style={{ marginTop: 24, backgroundColor: '#0F172A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1E293B', overflow: 'hidden' }}>
              <View style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, backgroundColor: '#3B82F6', borderRadius: 50, opacity: 0.2 }} />
              <View style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, backgroundColor: '#8B5CF6', borderRadius: 50, opacity: 0.2 }} />
              
              <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(30, 58, 138, 0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(30, 58, 138, 0.8)', marginBottom: 12 }}>
                 <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 1 }}>Future Workflow</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>What happens next?</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 20 }}>Once onboarding is complete, here is your learning journey:</Text>
              
              <View>
                {[
                  { title: "AI Roadmap Builder", icon: <Sparkles size={16} color="#60A5FA" />, desc: "AI dynamically constructs milestones to close only your specific skill gaps." },
                  { title: "Skill Verification", icon: <Award size={16} color="#60A5FA" />, desc: "Complete short interactive assessments to verify and unlock milestones." },
                  { title: "Opportunity Matching", icon: <Briefcase size={16} color="#60A5FA" />, desc: "Get matched with tailored industry projects, internships, and job profiles." }
                ].map((step, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      {step.icon}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#E2E8F0' }}>{step.title}</Text>
                      <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{step.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

          </View>
        </ScrollView>
      ) : (
        // ACTIVE PATH VIEW
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
            <View style={styles.headerBadge}>
               <Target size={10} color={colors.accent.DEFAULT} />
               <Text style={styles.headerBadgeText}>STRATEGIC JOURNEY</Text>
            </View>
            <Text style={styles.title}>Your Path</Text>
          </Animated.View>

          {activePath && (
            <Animated.View entering={FadeInUp.delay(150)}>
              
              {/* Premium Progress Card */}
              <View style={styles.premiumCard}>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.sectionTitle}>{activePathTitle}</Text>
                    <TouchableOpacity onPress={() => setInWizardMode(true)} style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#DBEAFE' }}>
                       <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1D4ED8' }}>Switch Path</Text>
                    </TouchableOpacity>
                 </View>
                 
                 <View style={{ marginVertical: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                       <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#64748B' }}>Journey Progress</Text>
                       <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2563EB' }}>
                         {activePathProgress}%
                       </Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                       <View style={{ height: '100%', backgroundColor: '#2563EB', width: `${activePathProgress}%` }} />
                    </View>
                 </View>

                 {pathData && (pathData.difficulty_level || pathData.average_salary !== undefined) && (
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                       {pathData.difficulty_level && (
                          <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                             <Text style={{ fontSize: 10, fontWeight: '600', color: '#475569' }}>Difficulty: {pathData.difficulty_level}</Text>
                          </View>
                       )}
                       {pathData.average_salary !== undefined && (
                          <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                             <Text style={{ fontSize: 10, fontWeight: '600', color: '#475569' }}>{pathData.average_salary}</Text>
                          </View>
                       )}
                    </View>
                 )}

                 <View style={{ borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 16, marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <View style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flex: 1, minWidth: '48%' }}>
                       <Text style={{ fontSize: 10, color: '#64748B', marginBottom: 2 }}>EST. COMPLETION</Text>
                       <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1E293B' }}>{estCompletion}</Text>
                    </View>
                    <View style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flex: 1, minWidth: '48%' }}>
                       <Text style={{ fontSize: 10, color: '#64748B', marginBottom: 2 }}>TARGET ROLE</Text>
                       <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1E293B' }}>{targetRole}</Text>
                    </View>
                 </View>
              </View>

              {/* Skills Analysis */}
              {pathData && (
                <View style={{ marginBottom: 24, flexDirection: 'column', gap: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 }}>Skills Analysis</Text>
                  <View style={{ flexDirection: 'column', gap: 16 }}>
                     <View style={{ backgroundColor: '#F0FDF4', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#DCFCE7' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                           <View style={{ backgroundColor: '#DCFCE7', padding: 6, borderRadius: 8, marginRight: 8 }}>
                             <CheckCircle2 size={18} color="#16A34A" />
                           </View>
                           <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#16A34A' }}>Acquired Skills</Text>
                        </View>
                        {Array.isArray(pathData.matched_skills) && pathData.matched_skills.length > 0 ? (
                           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                              {pathData.matched_skills.map((matched: any, idx: number) => {
                                 const skillName = matched.skill || matched.name || "";
                                 const skillLevel = matched.current_level || matched.level || "Beginner";
                                 return (
                                   <View key={idx} style={{ backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#DCFCE7', flexDirection: 'row', alignItems: 'center' }}>
                                      <Text style={{ fontSize: 12, color: '#334155', fontWeight: '600' }}>{skillName}</Text>
                                      <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                                        <Text style={{ fontSize: 10, color: '#059669', fontWeight: 'bold' }}>{skillLevel}</Text>
                                      </View>
                                   </View>
                                 );
                              })}
                           </View>
                        ) : (
                           <Text style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic', marginTop: 4 }}>No acquired skills yet</Text>
                        )}
                     </View>

                     <View style={{ backgroundColor: '#FEF2F2', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FEE2E2' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                           <View style={{ backgroundColor: '#FEE2E2', padding: 6, borderRadius: 8, marginRight: 8 }}>
                             <Target size={18} color="#DC2626" />
                           </View>
                           <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#DC2626' }}>To Acquire</Text>
                        </View>
                        {Array.isArray(pathData.missing_skills) && pathData.missing_skills.length > 0 ? (
                           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                              {pathData.missing_skills.map((missing: any, idx: number) => {
                                 const skillName = missing.skill || missing.name || "";
                                 const skillLevel = missing.required_level || missing.level || "Beginner";
                                 return (
                                   <View key={idx} style={{ backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', flexDirection: 'row', alignItems: 'center' }}>
                                      <Text style={{ fontSize: 12, color: '#475569', fontWeight: '600' }}>{skillName}</Text>
                                      <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                                        <Text style={{ fontSize: 10, color: '#EF4444', fontWeight: 'bold' }}>{skillLevel}</Text>
                                      </View>
                                   </View>
                                 );
                              })}
                           </View>
                        ) : (
                           <Text style={{ fontSize: 12, color: '#059669', fontStyle: 'italic', marginTop: 4 }}>🎉 All required skills acquired!</Text>
                        )}
                     </View>
                  </View>
                </View>
              )}

              <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: '#F1F5F9' }}>
                 <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 }}>Journey Milestones</Text>
                 
                 {roadmap.map((m: any, idx: number) => {
                    const isCompleted = m.status === 'Completed' || m.status === 'completed';
                    const hasSkill = (Array.isArray(studentSkills) ? studentSkills : []).some((s: any) => s.skill_name?.toLowerCase() === m.skill?.toLowerCase() || s.name?.toLowerCase() === m.skill?.toLowerCase());
                    const showRevisionPrompt = hasSkill && !isCompleted && !revisedMilestones[`${activePath.id}_${idx}`];
                    const isExpanded = collapsedChecklists[`${activePath.id}_${idx}`] === true;
                    const isLocked = firstIncompleteIdx !== -1 && idx > firstIncompleteIdx;
                    const isAllPointsCompleted = !m.points || m.points.length === 0 || m.points.every((p: any) => p.status === 'Completed' || p.status === 'completed');

                    return (
                      <View key={idx} style={{ flexDirection: 'row', marginBottom: 24, opacity: isLocked ? 0.5 : 1 }} pointerEvents={isLocked ? 'none' : 'auto'}>
                         {/* Timeline Line & Dot */}
                         <View style={{ width: 24, alignItems: 'center', marginRight: 12 }}>
                            <View style={{ 
                               width: 24, height: 24, borderRadius: 12, 
                               backgroundColor: isCompleted ? '#10B981' : (showRevisionPrompt ? '#F59E0B' : '#EFF6FF'),
                               alignItems: 'center', justifyContent: 'center',
                               borderWidth: isCompleted || showRevisionPrompt ? 0 : 2,
                               borderColor: '#2563EB',
                               zIndex: 2
                            }}>
                               {isCompleted ? <Check size={14} color="white" /> : (showRevisionPrompt ? <RefreshCw size={14} color="white" /> : <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2563EB' }}>{idx + 1}</Text>)}
                            </View>
                            {idx < roadmap.length - 1 && (
                               <View style={{ width: 2, flex: 1, backgroundColor: isCompleted ? '#10B981' : '#E2E8F0', marginTop: -4, marginBottom: -28, zIndex: 1 }} />
                            )}
                         </View>
                         {/* Content Card */}
                         <View style={{ flex: 1 }}>
                            <View 
                               style={{ 
                                  backgroundColor: 'white',
                                  borderWidth: 1,
                                  borderColor: showRevisionPrompt ? '#FDE68A' : '#E2E8F0',
                                  borderRadius: 16,
                                  padding: 16,
                               }}
                            >
                               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <View style={{ flex: 1, marginRight: 8 }}>
                                     <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E293B' }}>{m.title || m.name}</Text>
                                        {m.is_mandatory === 1 && (
                                           <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FEE2E2' }}>
                                              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#DC2626' }}>Mandatory</Text>
                                           </View>
                                        )}
                                        {m.milestone_type && (
                                           <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#DBEAFE' }}>
                                              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#2563EB', textTransform: 'uppercase' }}>{m.milestone_type}</Text>
                                           </View>
                                        )}
                                        {m.points && m.points.length > 0 && (
                                           <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#475569' }}>
                                                 {m.points.filter((p:any) => p.status === 'Completed').length}/{m.points.length} Tasks
                                              </Text>
                                           </View>
                                        )}
                                     </View>
                                     <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
                                        <Text style={{ fontSize: 11, color: '#64748B' }}>Skill: <Text style={{ fontWeight: 'bold', color: '#334155' }}>{m.skill} ({m.required_skill_level || 'Beginner'})</Text></Text>
                                        <Text style={{ fontSize: 11, color: '#64748B' }}>Category: <Text style={{ fontWeight: 'bold', color: '#334155' }}>{m.category}</Text></Text>
                                     </View>
                                     {m.linked_resource_type && (
                                        <Text style={{ fontSize: 11, color: '#64748B' }}>Resource Type: <Text style={{ fontWeight: 'bold', color: '#334155' }}>{m.linked_resource_type}</Text></Text>
                                     )}
                                  </View>
                                  {m.date && (
                                     <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#475569' }}>{m.date}</Text>
                                     </View>
                                  )}
                               </View>

                               {showRevisionPrompt && (
                                  <View style={{ marginTop: 12, backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FEF3C7', flexDirection: 'row', alignItems: 'center' }}>
                                     <AlertCircle size={16} color="#D97706" style={{ marginRight: 8 }} />
                                     <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#B45309' }}>Skill already in your Profile!</Text>
                                        <Text style={{ fontSize: 10, color: '#92400E', marginTop: 2 }}>We detected {m.skill} in your verified skills. You can skip this milestone or keep it as revision.</Text>
                                     </View>
                                  </View>
                               )}

                               {m.points && m.points.length > 0 && (
                                  <View style={{ marginTop: 16, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                                     <TouchableOpacity 
                                        onPress={() => setCollapsedChecklists(prev => ({ ...prev, [`${activePath.id}_${idx}`]: !prev[`${activePath.id}_${idx}`] }))}
                                        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}
                                     >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                           <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>📝 Checklist Tasks ({m.points.filter((p:any) => p.status === 'Completed').length}/{m.points.length})</Text>
                                        </View>
                                        {isExpanded ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
                                     </TouchableOpacity>

                                     {isExpanded && (
                                        <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                                           {m.points.map((pt: any, pIdx: number) => {
                                              const isPtCompleted = pt.status === 'Completed' || pt.status === 'completed';
                                              const ptTitle = pt.point_title || pt.text || pt.title || pt.description;
                                              return (
                                                <TouchableOpacity 
                                                   key={pIdx}
                                                   style={{ 
                                                      flexDirection: 'row', 
                                                      alignItems: 'center', 
                                                      marginTop: 8, 
                                                      backgroundColor: isPtCompleted ? '#F0FDF4' : 'white', 
                                                      padding: 12, 
                                                      borderRadius: 8,
                                                      borderWidth: 1,
                                                      borderColor: isPtCompleted ? '#DCFCE7' : '#E2E8F0'
                                                   }}
                                                   onPress={() => handleTogglePoint(m.title || m.name, ptTitle, pt.status)}
                                                >
                                                   {isPtCompleted ? <CheckCircle2 color="#10B981" size={16} style={{ marginRight: 10 }}/> : <Circle color="#CBD5E1" size={16} style={{ marginRight: 10 }}/>}
                                                   <Text style={{ fontSize: 12, color: isPtCompleted ? '#10B981' : '#334155', textDecorationLine: isPtCompleted ? 'line-through' : 'none', flex: 1, fontWeight: isPtCompleted ? 'bold' : '500' }}>
                                                      {ptTitle}
                                                   </Text>
                                                </TouchableOpacity>
                                              )
                                           })}
                                        </View>
                                     )}
                                  </View>
                               )}
                               {!isCompleted && isAllPointsCompleted && (
                                  <TouchableOpacity 
                                     style={{ marginTop: 16, backgroundColor: '#F97316', paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                                     onPress={() => handleStartVerificationTest(m)}
                                  >
                                     <ShieldCheck size={16} color="white" style={{ marginRight: 8 }} />
                                     <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'white' }}>Attempt Skill Assessment</Text>
                                  </TouchableOpacity>
                               )}
                            </View>
                         </View>
                      </View>
                    )
                 })}
                 
                 {roadmap.length === 0 && (
                    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                       <Target size={32} color="#CBD5E1" />
                       <Text style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>No milestones defined for this path yet.</Text>
                    </View>
                 )}
              </View>
            </Animated.View>
          )}

          <TouchableOpacity style={[styles.secondaryBtn, { alignSelf: 'center', marginTop: 24, marginBottom: 24 }]} onPress={() => setInWizardMode(true)}>
             <Text style={styles.secondaryBtnText}>Explore Other Paths</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
           <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '85%', alignItems: 'center' }}>
              <AlertCircle size={40} color="#3B82F6" style={{ marginBottom: 16 }} />
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>Set as Active Path?</Text>
              <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 20 }}>
                Are you sure you want to select "{selectedPath?.title}"? AI will generate a personalized roadmap for this path.
              </Text>
              <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                 <TouchableOpacity style={[styles.secondaryBtn, { flex: 1, marginRight: 8 }]} onPress={() => setShowConfirmModal(false)}>
                   <Text style={styles.secondaryBtnText}>Cancel</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginLeft: 8 }]} onPress={handleStartPersonalizedRoadmap}>
                   <Text style={styles.primaryBtnText}>Confirm</Text>
                 </TouchableOpacity>
              </View>
           </View>
        </View>
      </Modal>

      {/* Toggle Task Confirmation Modal */}
      <Modal visible={showToggleModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
           <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '85%', alignItems: 'center' }}>
              <HelpCircle size={40} color={toggleModalData?.currentStatus !== 'Completed' ? '#10B981' : '#F59E0B'} style={{ marginBottom: 16 }} />
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#1E293B' }}>
                 {toggleModalData?.currentStatus !== 'Completed' ? "Complete Task?" : "Unmark Task?"}
              </Text>
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 18 }}>
                {toggleModalData?.currentStatus !== 'Completed' 
                  ? `Are you sure you want to mark "${toggleModalData?.pointTitle}" as completed?`
                  : `Are you sure you want to unmark "${toggleModalData?.pointTitle}"?`}
              </Text>
              <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                 <TouchableOpacity style={[styles.secondaryBtn, { flex: 1, marginRight: 8 }]} onPress={() => setShowToggleModal(false)}>
                   <Text style={styles.secondaryBtnText}>Cancel</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   style={[styles.primaryBtn, { flex: 1, marginLeft: 8, backgroundColor: toggleModalData?.currentStatus !== 'Completed' ? '#10B981' : '#F59E0B' }]} 
                   onPress={confirmTogglePoint}
                 >
                   <Text style={[styles.primaryBtnText, { color: 'white' }]}>Confirm</Text>
                 </TouchableOpacity>
              </View>
           </View>
        </View>
      </Modal>

      <SkillVerificationModal
        visible={isTestModalOpen}
        userName={userName || ''}
        skillName={activeTestSkill}
        skillLevel={activeTestLevel}
        onClose={() => setIsTestModalOpen(false)}
        onSuccess={(result) => {
          // If passed, auto-complete milestone
          if (activeMilestoneForTest) {
             fetchData();
          }
        }}
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
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
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
  premiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 13,
    color: '#1E293B'
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#475569',
    fontWeight: 'bold',
    fontSize: 13,
  },
  tabBtnSm: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent'
  },
  activeTabBtnSm: {
    borderColor: '#2563EB'
  },
  tabBtnTextSm: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B'
  },
  activeTabBtnTextSm: {
    color: '#2563EB'
  }
});
