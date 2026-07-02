"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  ChevronRight, 
  Cpu, 
  Database, 
  LineChart 
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { getStudentCareerPath, getRecommendedPaths, enrollStudentPath } from '@/api/student.services';

export const StudentPathScreen = () => {
  const { userName } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activePath, setActivePath] = useState<any>(null);
  const [recommendedPaths, setRecommendedPaths] = useState<any[]>([]);
  const [enrollingPath, setEnrollingPath] = useState<string | null>(null);

  // Section visibility states
  const [showActivePath, setShowActivePath] = useState(true);
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);
  const [showAlternatePaths, setShowAlternatePaths] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'alternate'>('active');

  const fetchData = useCallback(async () => {
    const studentEmail = userName || 'ac1@gmail.com';
    setLoading(true);
    try {
      const [careerRes, recommendedRes] = await Promise.allSettled([
        getStudentCareerPath(studentEmail),
        getRecommendedPaths(studentEmail),
      ]);

      if (careerRes.status === 'fulfilled' && careerRes.value?.message) {
        setActivePath(careerRes.value.message);
      }
      if (recommendedRes.status === 'fulfilled' && recommendedRes.value?.message) {
        const message = recommendedRes.value.message;
        setRecommendedPaths(Array.isArray(message) ? message : []);
      }
    } catch (error) {
      console.error("Error fetching path data:", error);
    } finally {
      setLoading(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEnrollPath = async (careerPathName: string) => {
    const studentEmail = userName || 'ac1@gmail.com';
    try {
      setEnrollingPath(careerPathName);
      const res = await enrollStudentPath(studentEmail, careerPathName);
      if (res) {
        Alert.alert("Success", `Successfully enrolled in path: ${careerPathName}`);
        await fetchData();
      }
    } catch (err: any) {
      console.error("Enrollment failed:", err);
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to switch career path. Please try again.");
    } finally {
      setEnrollingPath(null);
    }
  };

  const defaultRoadmap = [
    { title: "Python Fundamentals", subtitle: "Complete Python Basics course", date: "Jan 12", status: "completed" },
    { title: "Data Structures & Algo", subtitle: "DSA + 30 LeetCode problems", date: "Jan 28", status: "completed" },
    { title: "SQL & Database Design", subtitle: "Advanced SQL + 2 projects", date: "Feb 5", status: "completed" },
    { title: "Machine Learning Basics", subtitle: "Sklearn, Pandas - Active", date: "Due Mar 1", status: "active" },
    { title: "ML Capstone Project", subtitle: "Industry live project submission", date: "Mar 30", status: "upcoming" },
    { title: "Data Science Internship", subtitle: "Apply to shortlisted companies", date: "Apr-Jun", status: "upcoming" },
  ];

  const defaultRecommended = [
    {
      career_path: "ML Engineer",
      path_name: "ML Engineer",
      target_role: "Developer",
      difficulty_level: "Beginner-Friendly",
      fit_score: 0.0,
      matched_count: 0,
      partial_count: 0,
      missing_count: 3,
      total_skills: 3,
      estimated_duration: 1,
      average_salary: 6.0
    },
    {
      career_path: "Data Science",
      path_name: "Data Science",
      target_role: "Data Scientist",
      difficulty_level: "Beginner-Friendly",
      fit_score: 0.0,
      matched_count: 0,
      partial_count: 0,
      missing_count: 3,
      total_skills: 3,
      estimated_duration: 1,
      average_salary: 6.0
    },
    {
      career_path: "Data Analyst",
      path_name: "Data Analyst",
      target_role: "Data analyst",
      difficulty_level: "Beginner-Friendly",
      fit_score: 0.0,
      matched_count: 0,
      partial_count: 0,
      missing_count: 3,
      total_skills: 3,
      estimated_duration: 1,
      average_salary: 5.0
    }
  ];

  const pathData = activePath?.data || activePath;
  const activePathTitle = pathData?.career_path || pathData?.career_path_name || pathData?.path_name || pathData?.title || "Data Scientist";
  const activePathProgress = pathData?.progress !== undefined 
    ? pathData?.progress 
    : (pathData?.total_skills 
        ? Math.round(((pathData.matched_count || 0) / pathData.total_skills) * 100) 
        : (pathData?.completion_rate || 58));
  const estCompletion = pathData?.estimated_completion || pathData?.est_completion || (pathData?.estimated_duration ? `${pathData.estimated_duration} Year(s)` : "Apr 2025");
  const targetRole = pathData?.target_role || pathData?.target || "Data Scientist @ Startup";

  const rawSteps = pathData?.milestones || pathData?.roadmap || pathData?.steps || pathData?.path_items || pathData?.items;
  
  let firstIncompleteFound = false;
  const roadmap = Array.isArray(rawSteps) && rawSteps.length > 0 
    ? rawSteps.map((step: any) => {
        const skillName = step.skill;
        let status = "upcoming";
        
        // Find if this skill is matched
        const isMatched = pathData?.matched_skills?.some((s: any) => 
          (typeof s === 'string' ? s.toLowerCase() === skillName?.toLowerCase() : s?.skill?.toLowerCase() === skillName?.toLowerCase())
        );

        if (isMatched) {
          status = "completed";
        } else {
          const isPartial = pathData?.partial_skills?.some((s: any) => 
            (typeof s === 'string' ? s.toLowerCase() === skillName?.toLowerCase() : s?.skill?.toLowerCase() === skillName?.toLowerCase())
          );
          if (isPartial) {
            status = "active";
            firstIncompleteFound = true;
          } else if (!firstIncompleteFound) {
            status = "active";
            firstIncompleteFound = true;
          } else {
            status = "upcoming";
          }
        }

        return {
          title: step.milestone_title || step.title || step.step_name || step.name || "Untitled Step",
          skill: step.skill || "",
          required_skill_level: step.required_skill_level || step.level || "Beginner",
          category: step.category || "Fundamental",
          topic: step.topic || "",
          subtopic: step.subtopic || "",
          is_mandatory: step.is_mandatory !== undefined ? step.is_mandatory : 1,
          milestone_type: step.milestone_type || "Learn",
          linked_resource_type: step.linked_resource_type || "Course",
          date: step.date || step.due_date || step.target_date || step.estimated_date || (step.duration_days ? `${step.duration_days} Days` : ""),
          status: step.status || status
        };
      })
    : defaultRoadmap;

  const rawAlternatePaths = recommendedPaths.length > 0 ? recommendedPaths : defaultRecommended;
  const alternatePaths = rawAlternatePaths.map((path: any) => {
    const fitScore = typeof path.fit_score === 'number' ? path.fit_score : (typeof path.score === 'number' ? path.score : (typeof path.match_percentage === 'number' ? path.match_percentage : 80));
    const color = fitScore >= 85 ? "#EF4444" : fitScore >= 75 ? "#3B82F6" : "#8B5CF6";
    const icon = fitScore >= 85 ? Cpu : fitScore >= 75 ? Database : LineChart;
    return {
      title: path.career_path || path.path_name || path.title || "Career Path",
      fit: `${fitScore}%`,
      skills: Array.isArray(path.skills) 
        ? path.skills 
        : (typeof path.skills === 'string' 
            ? path.skills.split(',').map((s: string) => s.trim()) 
            : (path.tags || [])),
      targetRole: path.target_role || "N/A",
      difficulty: path.difficulty_level || "Beginner",
      matchedCount: path.matched_count !== undefined ? path.matched_count : 0,
      missingCount: path.missing_count !== undefined ? path.missing_count : 0,
      totalSkills: path.total_skills !== undefined ? path.total_skills : 0,
      duration: path.estimated_duration !== undefined ? path.estimated_duration : 1,
      salary: path.average_salary !== undefined ? path.average_salary : 0,
      color,
      icon
    };
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        <Text style={styles.loadingText}>Syncing Paths...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerBadge}>
            <Target size={10} color={colors.accent.DEFAULT} />
            <Text style={styles.headerBadgeText}>STRATEGIC JOURNEY</Text>
          </View>
          <Text style={styles.title}>Your Path</Text>
          <Text style={styles.subtitle}>Curated roadmap based on your goals</Text>
        </Animated.View>

        {/* Segmented Tab Switcher */}
        <Animated.View entering={FadeInUp.delay(120)} style={styles.tabSwitcherContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'active' && styles.activeTabBtn]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'active' && styles.activeTabBtnText]}>
              Active Path
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'alternate' && styles.activeTabBtn]}
            onPress={() => setActiveTab('alternate')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'alternate' && styles.activeTabBtnText]}>
              Alternate Paths ({alternatePaths.length})
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {activeTab === 'active' ? (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.premiumCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitle}>
                <View style={[styles.titleIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Target size={16} color="#2563EB" />
                </View>
                <Text style={styles.sectionTitle}>Active: {activePathTitle}</Text>
              </View>
              <Switch
                value={showActivePath}
                onValueChange={setShowActivePath}
                trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                thumbColor={showActivePath ? "#2563EB" : "#94A3B8"}
              />
            </View>

            {showActivePath && (
              <>
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                     <Text style={styles.progressLabel}>Current Progress</Text>
                     <Text style={styles.progressValue}>{activePathProgress}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                     <Animated.View 
                       style={[styles.progressBarFill, { width: `${activePathProgress}%` }]} 
                     />
                  </View>
                  <View style={styles.progressFooter}>
                     <TrendingUp size={12} color="#64748B" />
                     <Text style={styles.progressFooterText}>Est. completion: {estCompletion} • Target: {targetRole}</Text>
                  </View>

                  {pathData && (pathData.difficulty_level || pathData.average_salary || pathData.missing_count !== undefined) && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                      {pathData.difficulty_level && (
                        <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#475569' }}>Difficulty: {pathData.difficulty_level}</Text>
                        </View>
                      )}
                      {pathData.average_salary && (
                        <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#047857' }}>Avg Salary: {pathData.average_salary} LPA</Text>
                        </View>
                      )}
                      {pathData.missing_count !== undefined && (
                        <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#B45309' }}>Missing Skills: {pathData.missing_count}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Prerequisites and Missing Skills details */}
                {pathData && (
                  <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16, marginTop: 16, gap: 12 }}>
                    {/* Prerequisites */}
                    <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#1E293B', marginBottom: 8 }}>🔑 PREREQUISITE SKILLS</Text>
                      {Array.isArray(pathData.prerequisite_skills) && pathData.prerequisite_skills.length > 0 ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {pathData.prerequisite_skills.map((prereq: any, idx: number) => {
                            const skillName = prereq.prerequisite_skills || prereq.skill || prereq.name || "";
                            const skillLevel = prereq.level || prereq.required_level || "Beginner";
                            return (
                              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#334155' }}>{skillName} </Text>
                                <Text style={{ fontSize: 8, fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 }}>{skillLevel}</Text>
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#94A3B8' }}>No prerequisites required</Text>
                      )}
                    </View>

                    {/* Missing Skills */}
                    <View style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#B45309', marginBottom: 8 }}>⚠️ MISSING SKILLS TO ACQUIRE</Text>
                      {Array.isArray(pathData.missing_skills) && pathData.missing_skills.length > 0 ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {pathData.missing_skills.map((missing: any, idx: number) => {
                            const skillName = missing.skill || missing.name || "";
                            const skillLevel = missing.required_level || missing.level || "Beginner";
                            return (
                              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FDE68A' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#334155' }}>{skillName} </Text>
                                <Text style={{ fontSize: 8, fontWeight: '800', color: '#D97706', backgroundColor: '#FEF3C7', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 }}>{skillLevel}</Text>
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#059669' }}>🎉 All skills matched! You are fully qualified.</Text>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.timelineContainer}>
                  {roadmap.map((step: any, idx) => (
                    <View key={idx} style={[styles.timelineItem, step.status === 'upcoming' && styles.upcomingStep]}>
                      <View style={styles.timelineLeft}>
                         <View style={[styles.timelineDotContainer, step.status === 'upcoming' && styles.upcomingDot]}>
                            {step.status === 'completed' ? (
                              <CheckCircle2 size={18} color="#10B981" />
                            ) : step.status === 'active' ? (
                              <View style={styles.activeDotOutline}>
                                 <View style={styles.activeDotInner} />
                              </View>
                            ) : (
                              <Circle size={18} color="#CBD5E1" />
                            )}
                         </View>
                         {idx < roadmap.length - 1 && <View style={styles.timelineConnector} />}
                      </View>
                      <View style={styles.timelineRight}>
                         <View style={styles.stepHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                              <Text style={[styles.stepTitle, step.status === 'active' && styles.activeStepTitle]}>{step.title}</Text>
                              {step.is_mandatory === 1 && (
                                <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 0.5, borderColor: '#FCA5A5' }}>
                                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#EF4444' }}>Mandatory</Text>
                                </View>
                              )}
                              {step.milestone_type && (
                                <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 0.5, borderColor: '#BFDBFE' }}>
                                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#3B82F6' }}>{step.milestone_type}</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.stepDate}>{step.date}</Text>
                         </View>

                         <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginTop: 6, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 }}>
                           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                             <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>Skill: <Text style={{ color: '#334155', fontWeight: '700' }}>{step.skill} ({step.required_skill_level})</Text></Text>
                             <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>Cat: <Text style={{ color: '#334155', fontWeight: '700' }}>{step.category}</Text></Text>
                           </View>
                           {(step.topic || step.subtopic) && (
                             <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 }}>
                               Focus: <Text style={{ color: '#334155', fontWeight: '700' }}>{step.topic || "N/A"}{step.subtopic ? ` → ${step.subtopic}` : ""}</Text>
                             </Text>
                           )}
                           {step.linked_resource_type && (
                             <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 }}>
                               Resource: <Text style={{ color: '#334155', fontWeight: '700' }}>{step.linked_resource_type}</Text>
                             </Text>
                           )}
                         </View>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Animated.View>
        ) : (
          <View>
            <View style={[styles.sectionHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
               <Text style={styles.sectionTitleSimple}>Alternate Paths</Text>
               <Switch
                 value={showAlternatePaths}
                 onValueChange={setShowAlternatePaths}
                 trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                 thumbColor={showAlternatePaths ? "#2563EB" : "#94A3B8"}
               />
            </View>

            {showAlternatePaths && alternatePaths.map((path, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInRight.delay(200 + index * 100)}
                style={styles.pathItemCard}
              >
                 <View style={[styles.pathItemLeft, { flex: 1 }]}>
                     <View style={[styles.pathIconContainer, { backgroundColor: `${path.color}10` }]}>
                        <path.icon size={20} color={path.color} />
                     </View>
                     <View style={[styles.pathItemInfo, { flex: 1 }]}>
                        <Text style={styles.pathItemTitle}>{path.title}</Text>
                        {path.targetRole && (
                           <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '500', marginBottom: 2 }}>Target: {path.targetRole}</Text>
                        )}
                        
                        {/* Details Badges */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                           {path.difficulty && (
                             <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 8, fontWeight: '700', color: '#475569' }}>{path.difficulty}</Text>
                             </View>
                           )}
                           {path.salary > 0 && (
                             <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 8, fontWeight: '700', color: '#047857' }}>{path.salary} LPA</Text>
                             </View>
                           )}
                           {path.duration > 0 && (
                             <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 8, fontWeight: '700', color: '#1E40AF' }}>{path.duration} Yr</Text>
                             </View>
                           )}
                           {path.totalSkills > 0 && (
                             <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 8, fontWeight: '700', color: '#B45309' }}>Skills: {path.matchedCount}/{path.totalSkills}</Text>
                             </View>
                           )}
                        </View>

                        {path.skills && path.skills.length > 0 && (
                          <View style={styles.skillBadgeRow}>
                             {path.skills.map((skill: string, si: number) => (
                               <View key={si} style={styles.skillBadge}>
                                  <Text style={styles.skillBadgeText}>{skill}</Text>
                               </View>
                             ))}
                          </View>
                        )}
                        
                        <View style={{ marginTop: 8, flexDirection: 'row' }}>
                           <TouchableOpacity
                             onPress={() => handleEnrollPath(path.title)}
                             disabled={enrollingPath !== null || activePathTitle?.toLowerCase() === path.title?.toLowerCase()}
                             style={{
                               paddingHorizontal: 10,
                               paddingVertical: 6,
                               borderRadius: 6,
                               borderWidth: activePathTitle?.toLowerCase() === path.title?.toLowerCase() ? 1 : 0,
                               borderColor: activePathTitle?.toLowerCase() === path.title?.toLowerCase() ? '#A7F3D0' : 'transparent',
                               backgroundColor: activePathTitle?.toLowerCase() === path.title?.toLowerCase() ? '#ECFDF5' : '#2563EB',
                               flexDirection: 'row',
                               alignItems: 'center',
                               gap: 4
                             }}
                           >
                             {enrollingPath === path.title && (
                               <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 2 }} />
                             )}
                             <Text
                               style={{
                                 fontSize: 10,
                                 fontWeight: '800',
                                 color: activePathTitle?.toLowerCase() === path.title?.toLowerCase() ? '#047857' : '#FFFFFF'
                               }}
                             >
                               {enrollingPath === path.title ? "Enrolling..." : (activePathTitle?.toLowerCase() === path.title?.toLowerCase() ? "Active" : "Set Active")}
                             </Text>
                           </TouchableOpacity>
                         </View>
                     </View>
                 </View>
                 <View style={styles.pathItemRight}>
                    <Text style={[styles.fitScore, { color: path.color }]}>{path.fit}</Text>
                    <Text style={styles.fitLabel}>FIT SCORE</Text>
                 </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* AI part stays on both tabs */}
        {showAiSuggestions && (
          <Animated.View entering={FadeInUp.delay(300)} style={styles.aiCard}>
            <View style={[styles.aiCardHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.aiEmoji}>🤖</Text>
                  <Text style={styles.aiTitle}>AI Path Suggestions</Text>
               </View>
               <Switch
                 value={showAiSuggestions}
                 onValueChange={setShowAiSuggestions}
                 trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                 thumbColor={showAiSuggestions ? "#2563EB" : "#94A3B8"}
               />
            </View>
            <View style={styles.aiContentCard}>
               <View style={styles.aiGlow} />
               <Text style={styles.aiContentText}>
                 Based on your psychometric profile, add <Text style={styles.aiHighlight}>Feature Engineering</Text> next — it will boost your ML project quality by ~30%.
               </Text>
               <View style={styles.aiActions}>
                  <TouchableOpacity style={styles.aiButtonPrimary}>
                     <Text style={styles.aiButtonTextPrimary}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.aiButtonSecondary}>
                     <Text style={styles.aiButtonTextSecondary}>Other Paths</Text>
                  </TouchableOpacity>
               </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>
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
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  expandText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.accent.DEFAULT,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressFooterText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 60,
  },
  upcomingStep: {
    opacity: 0.5,
  },
  upcomingDot: {
    opacity: 0.3,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
  },
  timelineDotContainer: {
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
  },
  activeDotOutline: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: '#F1F5F9',
    marginTop: -2,
    marginBottom: -2,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  activeStepTitle: {
    color: '#1E293B',
    fontWeight: '800',
  },
  stepDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  aiEmoji: {
    fontSize: 18,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  aiContentCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  aiGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  aiContentText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '500',
  },
  aiHighlight: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  aiActions: {
    flexDirection: 'row',
    gap: 12,
  },
  aiButtonPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.accent.DEFAULT,
    borderRadius: 8,
  },
  aiButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  aiButtonSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  aiButtonTextSecondary: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sectionTitleSimple: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pathItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pathItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pathIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathItemInfo: {
    flex: 1,
  },
  pathItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  skillBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  skillBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  pathItemRight: {
    alignItems: 'flex-end',
  },
  fitScore: {
    fontSize: 16,
    fontWeight: '900',
  },
  fitLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 2,
  },
  footerSpacer: {
    height: 40,
  },
  tabSwitcherContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 16, 
    padding: 4, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  tabBtn: { 
    flex: 1, 
    paddingVertical: 10, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'transparent' 
  },
  activeTabBtn: { 
    backgroundColor: '#FFF', 
    shadowColor: '#64748B', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  tabBtnText: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#64748B' 
  },
  activeTabBtnText: { 
    color: '#0F172A' 
  }
});
