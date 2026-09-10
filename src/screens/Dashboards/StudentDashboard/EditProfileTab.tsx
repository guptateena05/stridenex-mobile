import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, DeviceEventEmitter, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getStudentByEmail, updateStudent, mapYearToWord } from '@/api/student.services';
import { uploadFileApi } from '@/api/api.services';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';
import ProfileImageUploader from '@/components/profile/ProfileImageUploader';
import { colors } from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const EditProfileTab = () => {
  const { userName, userImage } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profileFormValues, setProfileFormValues] = useState<any>({});
  const [studentDepartmentOptions, setStudentDepartmentOptions] = useState<any[]>([]);

  const fetchStudentData = async () => {
    if (!userName) return;
    try {
      const cached = await AsyncStorage.getItem(`studentDetails_${userName}`);
      if (cached) {
        setStudentData(JSON.parse(cached));
      }
      const res = await getStudentByEmail(userName);
      const data = res?.data || res?.message?.data || res?.message;
      if (data && typeof data === 'object') {
        setStudentData(data);
        await AsyncStorage.setItem(`studentDetails_${userName}`, JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to fetch student details in profile edit:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [userName]);

  const initialFormValues = useMemo(() => {
    if (!studentData) return {};
    return {
      first_name: typeof studentData.first_name === 'object' ? studentData.first_name?.name || "" : studentData.first_name || "",
      last_name: typeof studentData.last_name === 'object' ? studentData.last_name?.name || "" : studentData.last_name || "",
      email_id: typeof studentData.email_id === 'object' ? studentData.email_id?.name || "" : studentData.email_id || userName || "",
      mobile_no: typeof studentData.mobile_no === 'object' ? studentData.mobile_no?.name || "" : studentData.mobile_no || "",
      college: typeof studentData.college === 'object' ? studentData.college?.name || studentData.college?.college_name || "" : studentData.college || "",
      department: typeof studentData.department === 'object' ? studentData.department?.name || studentData.department?.department_name || "" : studentData.department || "",
      stream: typeof studentData.stream === 'object' ? studentData.stream?.name || studentData.stream?.stream_name || "" : studentData.stream || "",
      course_type: Array.isArray(studentData.courses_type) && studentData.courses_type.length > 0
        ? studentData.courses_type[0]?.course_type || studentData.courses_type[0]?.name || ""
        : typeof studentData.course_type === 'object' && studentData.course_type !== null
          ? studentData.course_type?.course_type || studentData.course_type?.name || ""
          : studentData.course_type || studentData.courses_type || "",
      course: typeof studentData.course === 'object' ? studentData.course?.name || studentData.course?.course_name || "" : studentData.course || "",
      semester: typeof studentData.semester === 'object' ? studentData.semester?.name || studentData.semester?.semester || "" : studentData.semester || "",
      current_year: mapYearToWord(typeof studentData.current_year === 'object' ? studentData.current_year?.name : studentData.current_year || (typeof studentData.academic_year === 'object' ? studentData.academic_year?.name : studentData.academic_year)) || "",
      date_of_birth: studentData.date_of_birth || "",
      gender: studentData.gender || "",
      linkedin: studentData.linkedin || "",
      github: studentData.github || "",
      cgpa: studentData.cgpa ? String(studentData.cgpa) : "",
      marksheet: studentData.marksheet || studentData.marksheet_file || "",
    };
  }, [studentData, userName]);

  const handleUpdateProfile = async (formData: any) => {
    if (!userName) return;
    setUpdateLoading(true);
    try {
      let marksheetUrl = formData.marksheet;

      if (formData.marksheet && typeof formData.marksheet === 'object' && formData.marksheet.uri) {
        try {
          const uploadRes = await uploadFileApi(
            formData.marksheet,
            "Student",
            userName,
            "marksheet"
          );
          marksheetUrl = uploadRes.file_url || uploadRes.file_name;
        } catch (uploadErr) {
          console.error("Marksheet upload failed:", uploadErr);
          Alert.alert("Upload Error", "Failed to upload marksheet. Profile update aborted.");
          setUpdateLoading(false);
          return;
        }
      }

      const payload = {
        ...studentData,
        first_name: formData.first_name || studentData?.first_name || "",
        last_name: formData.last_name || studentData?.last_name || "",
        email_id: formData.email_id || studentData?.email_id || userName || "",
        mobile_no: formData.mobile_no || studentData?.mobile_no || "",
        college: formData.college || studentData?.college || "",
        department: formData.department || studentData?.department || "",
        stream: formData.stream || studentData?.stream || "",
        courses_type: formData.course_type || formData.courses_type || studentData?.course_type || studentData?.courses_type || "",
        course_type: formData.course_type || studentData?.course_type || "",
        course: formData.course || studentData?.course || "",
        semester: formData.semester || studentData?.semester || "",
        current_year: mapYearToWord(formData.current_year) || mapYearToWord(studentData?.current_year || studentData?.academic_year) || "",
        academic_year: mapYearToWord(formData.current_year) || mapYearToWord(studentData?.current_year || studentData?.academic_year) || "",
        date_of_birth: formData.date_of_birth || studentData?.date_of_birth || "",
        gender: formData.gender || studentData?.gender || "",
        linkedin: formData.linkedin || studentData?.linkedin || "",
        github: formData.github || studentData?.github || "",
        cgpa: formData.cgpa ? Number(formData.cgpa) : undefined,
        marksheet: marksheetUrl || null,
      };

      await updateStudent(userName, payload);
      Alert.alert("Success", "Profile updated successfully!");
      fetchStudentData();
      DeviceEventEmitter.emit('PROFILE_UPDATED');
    } catch (err: any) {
      console.error("Failed to update student details:", err);
      Alert.alert("Error", err?.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleValuesChange = (values: Record<string, any>, changedFieldName: string) => {
    setProfileFormValues(values);
    let sideEffects: Record<string, any> = {};

    if (changedFieldName === "stream" || changedFieldName === "course_type") {
      sideEffects = {
        course: null,
        department: null,
        semester: null
      };
    } else if (changedFieldName === "course") {
      sideEffects = {
        department: null,
        semester: null
      };
    } else if (changedFieldName === "department") {
      sideEffects = {
        semester: null
      };
    }
    return sideEffects;
  };

  const editFields: FormField[] = useMemo(() => [
    {
      fieldname: 'first_name',
      label: 'First Name',
      fieldtype: 'Data',
      required: true,
      disabled: true,
      layout: 'full',
    },
    {
      fieldname: 'last_name',
      label: 'Last Name',
      fieldtype: 'Data',
      required: true,
      disabled: true,
      layout: 'full',
    },
    {
      fieldname: 'email_id',
      label: 'Email ID',
      fieldtype: 'Data',
      required: true,
      disabled: true,
      layout: 'full',
    },
    {
      fieldname: 'mobile_no',
      label: 'Mobile No',
      fieldtype: 'Data',
      required: true,
      placeholder: 'Enter Mobile Number',
      layout: 'full',
    },
    {
      fieldname: 'college',
      label: 'College',
      fieldtype: 'Data',
      required: true,
      disabled: true,
      layout: 'full',
    },
    {
      fieldname: 'course_type',
      label: 'Course Type',
      fieldtype: 'Data',
      required: true,
      apiEndpoint: "method/stridenex_app.api_stridenex_app.college.master.get_master_data",
      apiParams: { doctype: "Course Type" },
      mapOptions: (data: any) => {
        let items = Array.isArray(data) ? data : (data?.data?.data || data?.message?.data || data?.message || data?.data || []);
        items = Array.isArray(items) ? items : [];
        return items.map((item: any) => ({ value: item.name || item.course_type, label: item.course_type || item.name }));
      },
      layout: 'full',
    },
    {
      fieldname: 'stream',
      label: 'Stream',
      fieldtype: 'Data',
      required: true,
      apiEndpoint: "method/stridenex_app.api_stridenex_app.college.master.get_master_data",
      apiParams: { doctype: "Stream" },
      mapOptions: (data: any) => {
        let items = Array.isArray(data) ? data : (data?.data?.data || data?.message?.data || data?.message || data?.data || []);
        items = Array.isArray(items) ? items : [];
        return items.map((item: any) => ({ value: item.name, label: item.name }));
      },
      layout: 'full',
    },
    {
      fieldname: 'course',
      label: 'Course',
      fieldtype: 'Data',
      required: true,
      disabled: !profileFormValues.stream || !profileFormValues.course_type,
      apiEndpoint: "method/stridenex_app.api_stridenex_app.college.master.get_courses_by_type",
      apiParams: (profileFormValues.stream && profileFormValues.course_type) ? {
        stream: profileFormValues.stream,
        course_type: profileFormValues.course_type
      } : {},
      mapOptions: (data: any) => {
        const courses = data?.data?.courses || data?.courses || data?.message?.data?.courses || [];
        return courses.map((item: any) => ({ value: item.name, label: item.course_name || item.name }));
      },
      layout: 'full',
    },
    {
      fieldname: 'department',
      label: 'Department',
      fieldtype: 'Data',
      required: true,
      disabled: !profileFormValues.course,
      apiEndpoint: "method/stridenex_app.stridenex_app.doctype.college_department.college_department.get_departments_by_course",
      apiParams: profileFormValues.course ? {
        courses: profileFormValues.course
      } : {},
      mapOptions: (data: any) => {
        const depts = data?.data || data?.message?.data || [];
        const deptOptions = depts.map((d: any) => ({
          value: d.name,
          label: d.department_name || d.name,
          academicYears: d.academic_years || "",
          semester: d.semester || ""
        }));
        setStudentDepartmentOptions(deptOptions);
        return deptOptions.map(({ value, label }: { value: string; label: string }) => ({ value, label }));
      },
      layout: 'full',
    },
    {
      fieldname: 'semester',
      label: 'Semester',
      fieldtype: 'Data',
      required: true,
      disabled: !profileFormValues.department,
      apiEndpoint: "method/stridenex_app.api_stridenex_app.student.masters.get_semester",
      apiParams: profileFormValues.department ? {
        semester: studentDepartmentOptions.find(d => d.value === profileFormValues.department)?.semester || ""
      } : {},
      mapOptions: (data: any) => {
        let semesters = Array.isArray(data) ? data : (data?.data?.data || data?.message?.data || data?.message || data?.data || []);
        semesters = Array.isArray(semesters) ? semesters : [];
        return semesters.map((sem: any) => ({
          value: sem.name,
          label: sem.name
        }));
      },
      layout: 'full',
    },
    {
      fieldname: 'current_year',
      label: 'Current Year',
      fieldtype: 'Select',
      required: true,
      placeholder: 'Select Current Year',
      options: ['First Year', 'Second Year', 'Third Year', 'Final Year'],
      layout: 'full',
    },
    {
      fieldname: 'date_of_birth',
      label: 'Date of Birth',
      fieldtype: 'Date',
      required: true,
      placeholder: 'Select Date of Birth',
      layout: 'full',
      textTransform: 'uppercase',
      testTransform: 'uppercase',
    },
    {
      fieldname: 'gender',
      label: 'Gender',
      fieldtype: 'Select',
      required: true,
      options: ['Male', 'Female', 'Other'],
      layout: 'full',
    },
    {
      fieldname: 'linkedin',
      label: 'LinkedIn URL',
      fieldtype: 'Data',
      required: false,
      placeholder: 'Enter LinkedIn URL',
      layout: 'full',
    },
    {
      fieldname: 'github',
      label: 'GitHub URL',
      fieldtype: 'Data',
      required: false,
      placeholder: 'Enter GitHub URL',
      layout: 'full',
    },
    {
      fieldname: 'cgpa',
      label: 'CGPA',
      fieldtype: 'Float',
      required: true,
      placeholder: 'Enter CGPA',
      layout: 'full',
    },
    {
      fieldname: 'marksheet',
      label: 'Marksheet / Result',
      fieldtype: 'File',
      required: false,
      placeholder: 'Upload Marksheet',
      layout: 'full',
    },
  ], [profileFormValues.stream, profileFormValues.course_type, profileFormValues.course, profileFormValues.department, studentDepartmentOptions]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <ProfileImageUploader
            currentImageUrl={userImage || studentData?.image || undefined}
            initials={(typeof studentData?.first_name === 'object' ? studentData.first_name?.name : studentData?.first_name)?.charAt(0) || userName?.charAt(0) || "U"}
            size="lg"
          />
          <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
            {typeof studentData?.first_name === 'object' ? studentData.first_name?.name : studentData?.first_name} {typeof studentData?.last_name === 'object' ? studentData.last_name?.name : studentData?.last_name}
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Update your profile details
          </Text>
        </View>

        <DynamicForm
          fields={editFields}
          onSubmit={handleUpdateProfile}
          initialValues={initialFormValues}
          loading={updateLoading}
          buttonLabel="Update Profile"
          accentColor={colors.accent.DEFAULT}
          onValuesChange={handleValuesChange}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
