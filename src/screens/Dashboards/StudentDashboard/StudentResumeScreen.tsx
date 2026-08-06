import React, { useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { getStudentByEmail, updateStudent } from '@/api/student.services';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  GraduationCap, 
  Award, 
  Briefcase, 
  FolderGit2, 
  X,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';

// Interfaces
interface Education {
  education_level: string;
  institution_name: string;
  board_university: string;
  specialization: string;
  passing_year: number;
  percentage_cgpa: string;
  grade: string;
}

interface Certificate {
  certificate_name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date: string;
  certificate_file: string;
}

interface Internship {
  company_name: string;
  job_title: string;
  employment_type: string;
  location: string;
  start_date: string;
  end_date: string;
  technologies_used: string;
}

interface Project {
  project_name: string;
  company_name: string;
  start_date: string;
  end_date: string;
  project_description: string;
  project_link?: string;
}

export const StudentResumeScreen = () => {
  const { userName } = useAuth();
  const [loading, setLoading] = useState(true);

  const [educationList, setEducationList] = useState<Education[]>([]);
  const [certificatesList, setCertificatesList] = useState<Certificate[]>([]);
  const [internshipList, setInternshipList] = useState<Internship[]>([]);
  const [projectList, setProjectList] = useState<Project[]>([]);

  // Fetch student details & prefill sections
  useEffect(() => {
    const fetchData = async () => {
      if (!userName) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getStudentByEmail(userName);
        const data = res?.data || res?.message?.data || res?.message;
        if (data && typeof data === 'object') {
          const educationData = data.resume_details || data.table_apwt;
          if (educationData && Array.isArray(educationData)) {
            setEducationList(educationData);
          }
          if (data.certificates && Array.isArray(data.certificates)) {
            setCertificatesList(data.certificates);
          }
          if (data.internship && Array.isArray(data.internship)) {
            const mappedInternships = data.internship.map((item: any) => ({
              ...item,
              technologies_used: item.technologies || item.technologies_used || ""
            }));
            setInternshipList(mappedInternships);
          }
          if (data.project && Array.isArray(data.project)) {
            setProjectList(data.project);
          }
        }
      } catch (err) {
        console.log("Error fetching dynamic resume data on mobile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userName]);

  const saveResumeToServer = async (
    updatedEducation: Education[],
    updatedCertificates: Certificate[],
    updatedInternships: Internship[],
    updatedProjects: Project[]
  ) => {
    if (!userName) return;
    try {
      // 1. Fetch fresh student details to avoid overwriting profile fields
      const res = await getStudentByEmail(userName);
      const studentProfile = res?.data || res?.message?.data || res?.message;
      if (!studentProfile) {
        Alert.alert("Error", "Failed to fetch profile details for update");
        return;
      }

      // 2. Build the updated payload matching the specified JSON format
      const payload = {
        ...studentProfile,
        table_apwt: updatedEducation,
        certificates: updatedCertificates,
        internship: updatedInternships.map(item => ({
          company_name: item.company_name,
          job_title: item.job_title,
          employment_type: item.employment_type,
          location: item.location,
          start_date: item.start_date,
          end_date: item.end_date,
          technologies: item.technologies_used || (item as any).technologies || ""
        })),
        project: updatedProjects
      };

      // 3. Call updateStudent
      await updateStudent(userName, payload);
      Alert.alert("Success", "Resume details updated successfully!");
    } catch (err: any) {
      console.log("Failed to sync resume with server on mobile:", err);
      const errMsg = err?.response?.data?.message || err?.message?.message || err?.message || "Failed to sync resume details";
      Alert.alert("Error", errMsg);
    }
  };

  // Modal and Form States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalSection, setModalSection] = useState<'education' | 'certificate' | 'internship' | 'project'>('education');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<any>({});

  // Dynamic Form Field Configurations
  const educationFields: FormField[] = useMemo(() => [
    {
      fieldname: 'education_level',
      label: 'Education Level',
      fieldtype: 'Select',
      options: ['SSC', 'HSC', 'Diploma', 'UG', 'PG', 'PhD'],
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'institution_name',
      label: 'Institution Name',
      fieldtype: 'Data',
      placeholder: 'e.g. VJTI Mumbai',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'board_university',
      label: 'Board / University',
      fieldtype: 'Data',
      placeholder: 'e.g. Mumbai University',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'specialization',
      label: 'Specialization / Stream',
      fieldtype: 'Data',
      placeholder: 'e.g. Computer Engineering',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'passing_year',
      label: 'Passing Year',
      fieldtype: 'Int',
      placeholder: 'e.g. 2026',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'percentage_cgpa',
      label: 'Percentage / CGPA',
      fieldtype: 'Data',
      placeholder: 'e.g. 9.2 CGPA or 88%',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'grade',
      label: 'Grade',
      fieldtype: 'Data',
      placeholder: 'e.g. A+',
      required: true,
      layout: 'full',
    },
  ], []);

  const certificateFields: FormField[] = useMemo(() => [
    {
      fieldname: 'certificate_name',
      label: 'Certificate Name',
      fieldtype: 'Data',
      placeholder: 'e.g. AWS Solutions Architect',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'issuing_organization',
      label: 'Issuing Organization',
      fieldtype: 'Data',
      placeholder: 'e.g. Amazon Web Services',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'issue_date',
      label: 'Issue Date',
      fieldtype: 'Date',
      required: true,
      layout: 'full',
      textTransform: 'uppercase',
      testTransform: 'uppercase',
    },
    {
      fieldname: 'expiry_date',
      label: 'Expiry Date',
      fieldtype: 'Date',
      required: false,
      layout: 'full',
      textTransform: 'uppercase',
      testTransform: 'uppercase',
    },
    {
      fieldname: 'certificate_file',
      label: 'Certificate File / Credential URL',
      fieldtype: 'Data',
      placeholder: 'https://credentials.aws.com/...',
      required: false,
      layout: 'full',
    },
  ], []);

  const internshipFields: FormField[] = useMemo(() => [
    {
      fieldname: 'company_name',
      label: 'Company Name',
      fieldtype: 'Data',
      placeholder: 'e.g. Razorpay',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'job_title',
      label: 'Job Title',
      fieldtype: 'Data',
      placeholder: 'e.g. Frontend Intern',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'employment_type',
      label: 'Employment Type',
      fieldtype: 'Select',
      options: ['Internship', 'Industrial Training', 'Apprenticeship', 'Part Time', 'Full Time'],
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'location',
      label: 'Location',
      fieldtype: 'Data',
      placeholder: 'e.g. Remote / Mumbai',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'start_date',
      label: 'Start Date',
      fieldtype: 'Date',
      required: true,
      layout: 'full',
      textTransform: 'uppercase',
      testTransform: 'uppercase',
    },
    {
      fieldname: 'end_date',
      label: 'End Date',
      fieldtype: 'Date',
      required: true,
      layout: 'full',
      textTransform: 'uppercase',
      testTransform: 'uppercase',
    },
    {
      fieldname: 'technologies_used',
      label: 'Technologies Used (comma separated)',
      fieldtype: 'Data',
      placeholder: 'React, TypeScript, CSS',
      required: true,
      layout: 'full',
    },
  ], []);

  const projectFields: FormField[] = useMemo(() => [
    {
      fieldname: 'project_name',
      label: 'Project Name',
      fieldtype: 'Data',
      placeholder: 'e.g. AI Portfolio Builder',
      required: true,
      layout: 'full',
    },
    {
      fieldname: 'company_name',
      label: 'Company / Project Client (Optional)',
      fieldtype: 'Data',
      placeholder: 'e.g. Self Project',
      required: false,
      layout: 'full',
    },
    {
      fieldname: 'start_date',
      label: 'Start Date',
      fieldtype: 'Date',
      required: true,
      layout: 'full',
      textTransform: 'uppercase',
      testTransform: 'uppercase',
    },
    {
      fieldname: 'end_date',
      label: 'End Date',
      fieldtype: 'Date',
      required: true,
      layout: 'full',
      textTransform: 'uppercase',
      testTransform: 'uppercase',
    },
    {
      fieldname: 'project_link',
      label: 'Project Link (Optional)',
      fieldtype: 'Data',
      placeholder: 'e.g. https://github.com/...',
      required: false,
      layout: 'full',
    },
    {
      fieldname: 'project_description',
      label: 'Project Description',
      fieldtype: 'Text',
      placeholder: 'Describe your contributions and deliverables...',
      required: true,
      layout: 'full',
    },
  ], []);

  // Handlers for Add, Edit, Delete
  const handleOpenAdd = (section: typeof modalSection) => {
    setModalSection(section);
    setEditingIndex(null);
    setFormInitialValues({});
    setIsModalVisible(true);
  };

  const handleOpenEdit = (section: typeof modalSection, index: number) => {
    setModalSection(section);
    setEditingIndex(index);
    let values = {};
    if (section === 'education') values = educationList[index];
    else if (section === 'certificate') values = certificatesList[index];
    else if (section === 'internship') values = internshipList[index];
    else if (section === 'project') values = projectList[index];
    setFormInitialValues(values);
    setIsModalVisible(true);
  };

  const handleDelete = (section: typeof modalSection, index: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this entry?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            let newEducation = [...educationList];
            let newCertificates = [...certificatesList];
            let newInternships = [...internshipList];
            let newProjects = [...projectList];

            if (section === 'education') {
              newEducation = educationList.filter((_, i) => i !== index);
              setEducationList(newEducation);
            } else if (section === 'certificate') {
              newCertificates = certificatesList.filter((_, i) => i !== index);
              setCertificatesList(newCertificates);
            } else if (section === 'internship') {
              newInternships = internshipList.filter((_, i) => i !== index);
              setInternshipList(newInternships);
            } else if (section === 'project') {
              newProjects = projectList.filter((_, i) => i !== index);
              setProjectList(newProjects);
            }
          }
        }
      ]
    );
  };

  const handleFormSubmit = async (data: any) => {
    let newEducation = [...educationList];
    let newCertificates = [...certificatesList];
    let newInternships = [...internshipList];
    let newProjects = [...projectList];

    if (modalSection === 'education') {
      const ed: Education = {
        education_level: data.education_level,
        institution_name: data.institution_name,
        board_university: data.board_university,
        specialization: data.specialization,
        passing_year: Number(data.passing_year),
        percentage_cgpa: data.percentage_cgpa,
        grade: data.grade
      };
      if (editingIndex !== null) {
        newEducation = educationList.map((item, i) => i === editingIndex ? ed : item);
        setEducationList(newEducation);
      } else {
        newEducation = [...educationList, ed];
        setEducationList(newEducation);
      }
    } else if (modalSection === 'certificate') {
      const cert: Certificate = {
        certificate_name: data.certificate_name,
        issuing_organization: data.issuing_organization,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date || "",
        certificate_file: data.certificate_file || ""
      };
      if (editingIndex !== null) {
        newCertificates = certificatesList.map((item, i) => i === editingIndex ? cert : item);
        setCertificatesList(newCertificates);
      } else {
        newCertificates = [...certificatesList, cert];
        setCertificatesList(newCertificates);
      }
    } else if (modalSection === 'internship') {
      const intern: Internship = {
        company_name: data.company_name,
        job_title: data.job_title,
        employment_type: data.employment_type,
        location: data.location,
        start_date: data.start_date,
        end_date: data.end_date,
        technologies_used: data.technologies_used
      };
      if (editingIndex !== null) {
        newInternships = internshipList.map((item, i) => i === editingIndex ? intern : item);
        setInternshipList(newInternships);
      } else {
        newInternships = [...internshipList, intern];
        setInternshipList(newInternships);
      }
    } else if (modalSection === 'project') {
      const proj: Project = {
        project_name: data.project_name,
        company_name: data.company_name || "Self Project",
        start_date: data.start_date,
        end_date: data.end_date,
        project_description: data.project_description,
        project_link: data.project_link || ""
      };
      if (editingIndex !== null) {
        newProjects = projectList.map((item, i) => i === editingIndex ? proj : item);
        setProjectList(newProjects);
      } else {
        newProjects = [...projectList, proj];
        setProjectList(newProjects);
      }
    }
    setIsModalVisible(false);
  };

  const currentSectionConfig = useMemo(() => {
    switch (modalSection) {
      case 'education':
        return {
          title: editingIndex !== null ? 'Edit Education' : 'Add Education',
          fields: educationFields
        };
      case 'certificate':
        return {
          title: editingIndex !== null ? 'Edit Certificate' : 'Add Certificate',
          fields: certificateFields
        };
      case 'internship':
        return {
          title: editingIndex !== null ? 'Edit Internship' : 'Add Internship',
          fields: internshipFields
        };
      case 'project':
        return {
          title: editingIndex !== null ? 'Edit Project' : 'Add Project',
          fields: projectFields
        };
    }
  }, [modalSection, editingIndex, educationFields, certificateFields, internshipFields, projectFields]);

  // Helper empty state component
  const EmptyState = ({ section, label }: { section: typeof modalSection; label: string }) => (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconBg}>
        <FileText size={24} color="#64748B" />
      </View>
      <Text style={styles.emptyTitle}>No Data Available</Text>
      <Text style={styles.emptySubtitle}>Tap the button below to add your {label.toLowerCase()} details.</Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => handleOpenAdd(section)}
        activeOpacity={0.8}
      >
        <Plus size={16} color="#FFF" style={{ marginRight: 4 }} />
        <Text style={styles.addButtonText}>Add {label}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        <Text style={{ marginTop: 12, fontSize: 13, color: '#64748B', fontWeight: '600', letterSpacing: 0.5 }}>
          SYNCING RESUME DETAILS...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <FileText size={20} color={colors.accent.DEFAULT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Resume Builder</Text>
            <Text style={styles.subtitle}>Fill in and build your professional resume</Text>
          </View>
          <TouchableOpacity 
            style={{ 
              backgroundColor: colors.accent.DEFAULT, 
              paddingHorizontal: 12, 
              paddingVertical: 8, 
              borderRadius: 8 
            }}
            onPress={() => saveResumeToServer(educationList, certificatesList, internshipList, projectList)}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFF' }}>Save Resume</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContentContainer}>
            
            {/* 1. Education Details */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <GraduationCap size={18} color={colors.accent.DEFAULT} />
                  <Text style={styles.sectionTitle}>Education Level</Text>
                </View>
                {educationList.length > 0 && (
                  <TouchableOpacity onPress={() => handleOpenAdd('education')} style={styles.headerAddBtn}>
                    <Plus size={14} color={colors.accent.DEFAULT} />
                    <Text style={styles.headerAddBtnText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              {educationList.length === 0 ? (
                <EmptyState section="education" label="Education" />
              ) : (
                <View style={styles.itemList}>
                  {educationList.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemMainTitle}>{item.education_level}</Text>
                        <Text style={styles.itemSubtitle}>{item.institution_name} • {item.specialization}</Text>
                        <Text style={styles.itemMeta}>{item.board_university} • Passing Year: {item.passing_year}</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                          <Text style={styles.badgeText}>Score: {item.percentage_cgpa}</Text>
                          <Text style={styles.badgeText}>Grade: {item.grade}</Text>
                        </View>
                      </View>
                      <View style={styles.actionCol}>
                        <TouchableOpacity onPress={() => handleOpenEdit('education', index)} style={styles.actionBtn}>
                          <Edit3 size={14} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete('education', index)} style={styles.actionBtn}>
                          <Trash2 size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 2. Certificates */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Award size={18} color={colors.accent.DEFAULT} />
                  <Text style={styles.sectionTitle}>Certificates</Text>
                </View>
                {certificatesList.length > 0 && (
                  <TouchableOpacity onPress={() => handleOpenAdd('certificate')} style={styles.headerAddBtn}>
                    <Plus size={14} color={colors.accent.DEFAULT} />
                    <Text style={styles.headerAddBtnText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              {certificatesList.length === 0 ? (
                <EmptyState section="certificate" label="Certificate" />
              ) : (
                <View style={styles.itemList}>
                  {certificatesList.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemMainTitle}>{item.certificate_name}</Text>
                        <Text style={styles.itemSubtitle}>{item.issuing_organization}</Text>
                        <Text style={styles.itemMeta}>Issued: {item.issue_date} {item.expiry_date ? `• Expiry: ${item.expiry_date}` : ''}</Text>
                        {item.certificate_file ? (
                          <Text style={[styles.badgeText, { color: colors.accent.DEFAULT, marginTop: 4 }]}>Credential Attached</Text>
                        ) : null}
                      </View>
                      <View style={styles.actionCol}>
                        <TouchableOpacity onPress={() => handleOpenEdit('certificate', index)} style={styles.actionBtn}>
                          <Edit3 size={14} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete('certificate', index)} style={styles.actionBtn}>
                          <Trash2 size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 3. Internship */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={18} color={colors.accent.DEFAULT} />
                  <Text style={styles.sectionTitle}>Internships</Text>
                </View>
                {internshipList.length > 0 && (
                  <TouchableOpacity onPress={() => handleOpenAdd('internship')} style={styles.headerAddBtn}>
                    <Plus size={14} color={colors.accent.DEFAULT} />
                    <Text style={styles.headerAddBtnText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              {internshipList.length === 0 ? (
                <EmptyState section="internship" label="Internship" />
              ) : (
                <View style={styles.itemList}>
                  {internshipList.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemMainTitle}>{item.job_title}</Text>
                        <Text style={styles.itemSubtitle}>{item.company_name} • {item.employment_type}</Text>
                        <Text style={styles.itemMeta}>{item.location} • {item.start_date} to {item.end_date}</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {item.technologies_used.split(',').map((tech, idx) => (
                            <View key={idx} style={styles.techTag}>
                              <Text style={styles.techTagText}>{tech.trim()}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <View style={styles.actionCol}>
                        <TouchableOpacity onPress={() => handleOpenEdit('internship', index)} style={styles.actionBtn}>
                          <Edit3 size={14} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete('internship', index)} style={styles.actionBtn}>
                          <Trash2 size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 4. Projects */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <FolderGit2 size={18} color={colors.accent.DEFAULT} />
                  <Text style={styles.sectionTitle}>Projects</Text>
                </View>
                {projectList.length > 0 && (
                  <TouchableOpacity onPress={() => handleOpenAdd('project')} style={styles.headerAddBtn}>
                    <Plus size={14} color={colors.accent.DEFAULT} />
                    <Text style={styles.headerAddBtnText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              {projectList.length === 0 ? (
                <EmptyState section="project" label="Project" />
              ) : (
                <View style={styles.itemList}>
                  {projectList.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemMainTitle}>{item.project_name}</Text>
                        <Text style={styles.itemSubtitle}>{item.company_name}</Text>
                        <Text style={styles.itemMeta}>{item.start_date} to {item.end_date}</Text>
                        <Text style={styles.itemDesc} numberOfLines={2}>{item.project_description}</Text>
                        {item.project_link ? (
                          <TouchableOpacity 
                            onPress={() => {
                              if (item.project_link) {
                                Linking.openURL(item.project_link).catch(err => console.log("Couldn't open project link:", err));
                              }
                            }} 
                            style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                          >
                            <Text style={{ fontSize: 11, color: colors.accent.DEFAULT, fontWeight: '700' }}>Project Link</Text>
                            <ExternalLink size={10} color={colors.accent.DEFAULT} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      <View style={styles.actionCol}>
                        <TouchableOpacity onPress={() => handleOpenEdit('project', index)} style={styles.actionBtn}>
                          <Edit3 size={14} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete('project', index)} style={styles.actionBtn}>
                          <Trash2 size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </View>
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Entry Modal */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentSectionConfig?.title}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
               <View style={{ padding: 20 }}>
                 {currentSectionConfig && (
                   <DynamicForm
                     fields={currentSectionConfig.fields}
                     onSubmit={handleFormSubmit}
                     initialValues={formInitialValues}
                     loading={false}
                     buttonLabel="Save Details"
                     accentColor={colors.accent.DEFAULT}
                   />
                 )}
               </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  addTabButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addTabButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  tabContentContainer: {
    gap: 20,
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  scoreCard: {
    backgroundColor: '#F8FAFC',
    borderColor: 'rgba(255, 107, 0, 0.1)',
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  circularScore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    borderWidth: 2,
    borderColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.accent.DEFAULT,
  },
  scoreStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  scoreDesc: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 14,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  headerAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent.DEFAULT,
  },
  itemList: {
    padding: 16,
    gap: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
  },
  itemMainTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  itemDesc: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 14,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  techTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  techTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  actionCol: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 2,
  },
  emptySubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  footerSpacer: {
    height: 80,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    height: '80%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  modalTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0F172A' 
  },
  closeBtn: { 
    padding: 6, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 20 
  },
  modalScroll: { 
    paddingBottom: 60 
  },
});
