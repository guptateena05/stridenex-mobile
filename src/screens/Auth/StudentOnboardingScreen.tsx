import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { AnimatedAuthLayout } from '@/components/layout/AnimatedAuthLayout';
import { Input } from '@/components/Shared/Input';
import { Button } from '@/components/Shared/Button';
import { useNavigation } from '@react-navigation/native';
import { sendEmailOTP, verifyEmailOTP, sendMobileOTP, verifyMobileOTP, createStudent } from '@/api/onboarding.services';
import { api } from '@/api/api.services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import DynamicForm from '@/components/forms/DynamicForm';
import { FormField } from '@/components/forms/DynamicField';

const API_BASE_URL = "https://devstridenex.quantcloud.in";

// Type definitions
interface DepartmentOption {
  value: string;
  label: string;
  academicYears: string;
  semester: string;
}

interface DynamicFormDataType {
  state: string;
  district: string;
  college: string;
  stream: string;
  courses: string[];
  course: string;
  department: string;
  academicYear: string;
  semester: string;
  current_year: string;
  dateOfBirth: string;
  gender: string;
  skills: string[];
  careerInterest: string[];
  resume: any;
  linkedinUrl: string;
  githubUrl: string;
  hasReferral?: string;
  referal_code?: string;
}

const StudentOnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [hasCreatedRecord, setHasCreatedRecord] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailTimer, setEmailTimer] = useState(0);
  const [mobileTimer, setMobileTimer] = useState(0);
  const fetchedFieldsRef = useRef<Set<string>>(new Set());

  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [mobile, setMobile] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);

  const [dynamicFormData, setDynamicFormData] = useState<DynamicFormDataType>({
    state: "", district: "", college: "", stream: "", courses: [], course: "", department: "",
    academicYear: "1", semester: "", current_year: "", dateOfBirth: "", gender: "Male", skills: [], careerInterest: [],
    resume: null, linkedinUrl: "", githubUrl: "",
    hasReferral: "0", referal_code: ""
  });

  // Timer effects
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [emailTimer]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (mobileTimer > 0) {
      interval = setInterval(() => {
        setMobileTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mobileTimer]);

  useEffect(() => {
    const restoreState = async () => {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedFirstName = await AsyncStorage.getItem('userFirstName');
      const savedLastName = await AsyncStorage.getItem('userLastName');
      const savedOnboarding = await AsyncStorage.getItem('studentOnboardingStep');
      const savedMobile = await AsyncStorage.getItem('userMobileNo');

      if (savedEmail) setEmail(savedEmail);
      if (savedFirstName) setFirstName(savedFirstName);
      if (savedLastName) setLastName(savedLastName);
      if (savedMobile) setMobile(savedMobile);

      const flag = parseInt(savedOnboarding || '0', 10);
      if (flag >= 2) {
        // Student profile was already created — just go to Login
        setHasCreatedRecord(true);
        setStep(2);
        setEmailVerified(true);
        setMobileVerified(true);
      } else if (flag >= 1) {
        // Verification was done — skip OTP step and go to profile form
        setStep(2);
        setEmailVerified(true);
        setMobileVerified(true);
      }
    };
    restoreState();
  }, []);

  // Auto-populate academic year when department changes
  useEffect(() => {
    if (dynamicFormData.department) {
      const selectedDept = departmentOptions.find(
        d => d.value === dynamicFormData.department
      );
      if (selectedDept?.academicYears) {
        setDynamicFormData(prev => ({
          ...prev,
          academicYear: `${selectedDept.academicYears} Years`
        }));
      }
    }
  }, [dynamicFormData.department, departmentOptions]);

  const handleSendEmailOTP = async () => {
    if (!email) { setError("Please enter email"); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await sendEmailOTP(email);
      const msg = res?.message as any;
      if (msg?.status === "success" || msg?.message === "OTP sent to email successfully" || msg === "OTP sent successfully") {
        setSuccess("OTP sent to email successfully");
        setEmailOtpSent(true);
        setEmailTimer(120);
      } else {
        setError(msg?.message || (typeof msg === 'string' ? msg : "Failed to send email OTP"));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message?.message || e?.response?.data?.message || e.message || "Error");
    } finally { setLoading(false); }
  };

  const handleVerifyEmail = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await verifyEmailOTP(email, emailOtp);
      if (res?.message === "Email verified successfully") {
        setEmailVerified(true);
        setSuccess("Email verified successfully");
      } else {
        setError(res?.message || "Invalid OTP");
      }
    } catch (e: any) {
      setError(e?.message || e?.response?.data?.message || "Verification failed");
    } finally { setLoading(false); }
  };

  const handleSendMobileOTP = async () => {
    if (mobile.length !== 10) { setError("Enter 10 digit mobile number"); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await sendMobileOTP(mobile, email);
      if (res?.message === "OTP sent successfully") {
        setSuccess("OTP sent successfully");
        setMobileOtpSent(true);
        setMobileTimer(120);
      } else {
        setError(res?.message || "Failed to send OTP");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error");
    } finally { setLoading(false); }
  };

  const handleVerifyMobile = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await verifyMobileOTP(mobile, mobileOtp, email);
      if (res?.message === "Mobile number verified successfully") {
        setMobileVerified(true);
        setSuccess("Mobile verified successfully");
        await AsyncStorage.setItem('userMobileNo', mobile);
      } else {
        setError(res?.message || "Invalid OTP");
      }
    } catch (e: any) {
      setError(e?.message || e?.response?.data?.message || "Verification failed");
    } finally { setLoading(false); }
  };

  const step3Fields: FormField[] = [
    {
      fieldname: "state",
      label: "State",
      fieldtype: "Data",
      required: true,
      placeholder: "Select State",
      layout: "full",
      apiEndpoint: `${API_BASE_URL}/api/method/stridenex_app.api_stridenex_app.college.master.get_master_data`,
      apiParams: {
        doctype: "State"
      },
      mapOptions: (data) => {
        return data.map((state: any) => ({
          value: state.name,
          label: state.name
        }));
      }
    },
    {
      fieldname: "district",
      label: "District",
      fieldtype: "Data",
      required: true,
      placeholder: "Select District",
      layout: "full",
      apiEndpoint: `${API_BASE_URL}/api/method/stridenex_app.api_stridenex_app.college.master.get_master_data`,
      apiParams: dynamicFormData.state ? {
        doctype: "District",
        fields: ["name", "district_name"],
        filters: [["state", "=", dynamicFormData.state]],
        order_by: "district_name asc",
        limit_page_length: 1000
      } : undefined,
      mapOptions: (data) => {
        return data.map((district: any) => ({
          value: district.name,
          label: district.district_name || district.name
        }));
      },
      disabled: !dynamicFormData.state
    },
    {
      fieldname: "college",
      label: "College",
      fieldtype: "Data",
      required: true,
      placeholder: "Select College",
      layout: "full",
      apiEndpoint: `${API_BASE_URL}/api/method/stridenex_app.api_stridenex_app.college.master.get_master_data`,
      apiParams: {
        doctype: "College",
        limit_page_length: 1000
      },
      mapOptions: (data) => {
        const colleges = data.data || data || [];
        return colleges.map((college: any) => ({
          value: college.name,
          label: college.college_name || college.name
        }));
      }
    },
    {
      fieldname: "courses",
      label: "Course Type",
      fieldtype: "Data",
      required: true,
      placeholder: "Select Course Type",
      layout: "full",
      apiEndpoint: `${API_BASE_URL}/api/method/stridenex_app.api_stridenex_app.college.master.get_master_data`,
      apiParams: {
        doctype: "Course Type",
        limit_page_length: 1000
      },
      mapOptions: (data) => {
        const courses = data.data || data || [];
        return courses.map((course: any) => ({
          value: course.name || course.course_type,
          label: course.course_type || course.name
        }));
      }
    },
    {
      fieldname: "stream",
      label: "Stream",
      fieldtype: "Data",
      required: true,
      placeholder: "Select Stream",
      layout: "full",
      apiEndpoint: (dynamicFormData.college && dynamicFormData.courses) ? `${API_BASE_URL}/api/method/stridenex_app.api_stridenex_app.college.master.get_master_data` : undefined,
      apiParams: (dynamicFormData.college && dynamicFormData.courses) ? {
        doctype: "College Program Details",
        fields: ["stream"],
        filters: [
          ["college", "=", dynamicFormData.college],
          ["course_type", "=", dynamicFormData.courses]
        ],
        limit_page_length: 1000
      } : undefined,
      mapOptions: (data) => {
        const items = data.data || data || [];
        const uniqueStreams = Array.from(new Set(items.map((item: any) => item.stream))).filter(Boolean);
        return uniqueStreams.map((stream: any) => ({
          value: stream,
          label: stream
        }));
      },
      disabled: !(dynamicFormData.college && dynamicFormData.courses)
    },
    {
      fieldname: "course",
      label: "Course",
      fieldtype: "Data",
      required: true,
      placeholder: "Select Course",
      layout: "full",
      apiEndpoint: (dynamicFormData.college && dynamicFormData.courses && dynamicFormData.stream) ? `${API_BASE_URL}/api/method/stridenex_app.api_stridenex_app.college.master.get_master_data` : undefined,
      apiParams: (dynamicFormData.college && dynamicFormData.courses && dynamicFormData.stream) ? {
        doctype: "College Program Details",
        fields: ["course"],
        filters: [
          ["college", "=", dynamicFormData.college],
          ["course_type", "=", dynamicFormData.courses],
          ["stream", "=", dynamicFormData.stream]
        ],
        limit_page_length: 1000
      } : undefined,
      mapOptions: (data) => {
        const items = data.data || data || [];
        const uniqueCourses = Array.from(new Set(items.map((item: any) => item.course))).filter(Boolean);
        return uniqueCourses.map((course: any) => ({
          value: course,
          label: course
        }));
      },
      disabled: !(dynamicFormData.college && dynamicFormData.courses && dynamicFormData.stream)
    },
    {
      fieldname: "department",
      label: "Department",
      fieldtype: "Data",
      required: true,
      placeholder: "Select department",
      layout: "full",
      apiEndpoint: (dynamicFormData.college && dynamicFormData.courses && dynamicFormData.stream && dynamicFormData.course) ? `${API_BASE_URL}/api/method/stridenex_app.api_stridenex_app.college.master.get_master_data` : undefined,
      apiParams: (dynamicFormData.college && dynamicFormData.courses && dynamicFormData.stream && dynamicFormData.course) ? {
        doctype: "College Program Details",
        fields: ["department", "academic_years", "semester"],
        filters: [
          ["college", "=", dynamicFormData.college],
          ["course_type", "=", dynamicFormData.courses],
          ["stream", "=", dynamicFormData.stream],
          ["course", "=", dynamicFormData.course]
        ],
        limit_page_length: 1000
      } : undefined,
      mapOptions: (data) => {
        const departments = data.data || data || [];
        const deptOptions = departments.map((dept: any) => ({
          value: dept.department || dept.name,
          label: dept.department || dept.name,
          academicYears: dept.academic_years || "3",
          semester: dept.semester || "Semester 1"
        }));
        setDepartmentOptions(deptOptions);
        return deptOptions.map(({ value, label }: { value: string; label: string }) => ({ value, label }));
      },
      disabled: !(dynamicFormData.college && dynamicFormData.courses && dynamicFormData.stream && dynamicFormData.course)
    },
    {
      fieldname: "academicYear",
      label: "Academic Year",
      fieldtype: "Data",
      required: false,
      placeholder: "Academic years",
      layout: "full",
      read_only: true
    },
    {
      fieldname: "semester",
      label: "Semester",
      fieldtype: "Data",
      required: true,
      placeholder: "Select Semester",
      layout: "full",
      apiEndpoint: dynamicFormData.department
        ? `${API_BASE_URL}/api/method/stridenex_app.api_stridenex_app.student.masters.get_semester`
        : undefined,
      apiParams: dynamicFormData.department ? {
        semester: departmentOptions.find(d => d.value === dynamicFormData.department)?.semester || ""
      } : undefined,
      mapOptions: (data) => {
        const semesters = data.data || data || [];
        return semesters.map((sem: any) => ({
          value: sem.name,
          label: sem.name
        }));
      },
      disabled: !dynamicFormData.department
    },
    {
      fieldname: "current_year",
      label: "Current Year",
      fieldtype: "Select",
      required: true,
      placeholder: "Select Current Year",
      layout: "full",
      options: ["First Year", "Second Year", "Third Year", "Final Year"]
    },
    {
      fieldname: "dateOfBirth",
      label: "Date of Birth",
      fieldtype: "Date",
      required: true,
      placeholder: "DD/MM/YYYY",
      layout: "full",
      inputClassName: "uppercase"
    },
    {
      fieldname: "gender",
      label: "Gender",
      fieldtype: "Select",
      required: false,
      placeholder: "Select Gender",
      layout: "full",
      options: ["Male", "Female", "Other", "Prefer not to say"]
    },
    {
      fieldname: "skills",
      label: "Skills",
      fieldtype: "Data",
      required: false,
      placeholder: "Select skills",
      layout: "full",
      multiSelect: true,
      apiEndpoint: `${API_BASE_URL}/api/method/stridenex_app.api_stridenex_app.college.master.get_master_data`,
      apiParams: {
        doctype: "Skill",
        fields: ["skill_name"]
      },
      mapOptions: (data) => {
        const items = data.data || data || [];
        return items.map((item: any) => ({
          value: item.name || item.skill_name,
          label: item.skill_name || item.name
        }));
      }
    },
    {
      fieldname: "careerInterest",
      label: "Career Interest",
      fieldtype: "Data",
      required: false,
      placeholder: "Select career interests",
      layout: "full",
      multiSelect: true,
      apiEndpoint: `${API_BASE_URL}/api/method/stridenex_app.api_stridenex_app.college.master.get_master_data`,
      apiParams: {
        doctype: "Student Career Interest"
      },
      mapOptions: (data) => {
        const items = data.data || data || [];
        return items.map((item: any) => ({
          value: item.name || item.career_interest_name,
          label: item.career_interest_name || item.name
        }));
      }
    },
    {
      fieldname: "resume",
      label: "Resume (PDF only)",
      fieldtype: "File",
      required: false,
      placeholder: "Upload your resume (PDF)",
      layout: "full",
      accept: ".pdf"
    },
    {
      fieldname: "linkedinUrl",
      label: "LinkedIn Profile URL",
      fieldtype: "Data",
      required: false,
      placeholder: "https://linkedin.com/in/username",
      layout: "full",
      inputClassName: "font-mono text-sm"
    },
    {
      fieldname: "githubUrl",
      label: "GitHub Profile URL",
      fieldtype: "Data",
      required: false,
      placeholder: "https://github.com/username",
      layout: "full",
      inputClassName: "font-mono text-sm"
    },
    {
      fieldname: "hasReferral",
      label: "",
      placeholder: "Are you using any referral code?",
      fieldtype: "Check",
      required: false,
      layout: "full"
    },
    ...(dynamicFormData.hasReferral === "1" ? [{
      fieldname: "referal_code",
      label: "Referral Code",
      placeholder: "Enter referral code",
      fieldtype: "Data",
      required: true,
      layout: "full" as const
    }] : [])
  ];

  const validateStep3 = (data: DynamicFormDataType) => {
    const errs: Record<string, string> = {};
    const requiredFields: (keyof DynamicFormDataType)[] = ['state', 'district', 'college', 'department', 'stream', 'course', 'semester', 'current_year', 'dateOfBirth'];
    requiredFields.forEach(f => {
      if (!data[f] || data[f].toString().trim() === '') errs[f as string] = 'This field is required';
    });
    if (!data.courses) errs.courses = 'Please select a course type';
    if (!data.skills || data.skills.length === 0) errs.skills = 'Please select at least one skill';

    if (data.hasReferral === "1" && (!data.referal_code || data.referal_code.trim() === '')) {
      errs.referal_code = 'Referral code is required';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFinalSubmit = async (data: DynamicFormDataType) => {
    if (!validateStep3(data)) {
      setError("Please fix the validation errors before submitting.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    // Guard: if student record was already created (detected on app restart),
    // skip the create call and just navigate to Login.
    if (hasCreatedRecord) {
      await AsyncStorage.multiRemove(["userEmail", "userFirstName", "userLastName", "studentOnboardingStep", "userMobileNo"]);
      setTimeout(() => { navigation.navigate("Login"); }, 500);
      return;
    }

    try {
      // Format mobile number with country code
      const formattedMobile = mobile ? `+91-${mobile}` : "";

      // Format courses type as array of objects
      const coursesTypeArray = typeof data.courses === "string" 
        ? (data.courses ? [{ course_type: data.courses }] : [])
        : Array.isArray(data.courses)
          ? data.courses.map((course: string) => ({ course_type: course }))
          : [];

      // Format skills as array of objects
      const skillsArray = (data.skills || []).map((skill: string) => ({
        skill: skill
      }));

      // Format career interests as array of objects
      const careerInterestArray = (data.careerInterest || []).map((interest: string) => ({
        career_interest: interest
      }));

      // Extract just the number from academicYear (e.g., "2 Years" -> "2")
      let academicYearValue = data.academicYear || "1";
      const numericMatch = academicYearValue.match(/\d+/);
      academicYearValue = numericMatch ? numericMatch[0] : "1";

      // Prepare payload matching web portal format
      const payload = {
        first_name: firstName || "Test",
        last_name: lastName || "User",
        mobile_no: formattedMobile,
        email_id: email,
        stream: data.stream || "Engineering",
        courses_type: coursesTypeArray.length > 0 ? coursesTypeArray : [{ course_type: "PG" }],
        college: data.college || "DRK",
        course: data.course || "BA",
        department: data.department || "Dispatch",
        academic_year: academicYearValue,
        semester: data.semester || "1",
        current_year: data.current_year || "",
        date_of_birth: data.dateOfBirth, // Already in YYYY-MM-DD format from handleDateConfirm
        skill: skillsArray.length > 0 ? skillsArray : [{ skill: "Creativity & innovation" }],
        career_interest: careerInterestArray.length > 0 ? careerInterestArray : [{ career_interest: "Biotechnology / Genetics" }],
        github: data.githubUrl || "",
        linkedin: data.linkedinUrl || "",
        resume: data.resume || null, // File object from document picker
        referal_code: data.hasReferral === "1" ? (data.referal_code || "") : ""
      };

      console.log("Submitting payload:", payload);

      // Call the createStudent service
      const responseData = await createStudent(payload);

      console.log("Registration response:", responseData);

      // Check if registration was successful
      if (responseData?.status === 200 || responseData?.message === "Student registered successfully") {
        // ─── BILLING INTEGRATION STARTS HERE ─────────────────────────────────
        try {
          const userEmail = (await AsyncStorage.getItem("userEmail")) || email || "";
          const userPassword = (await AsyncStorage.getItem("userPassword")) || "";
          const userFirstName = (await AsyncStorage.getItem("userFirstName")) || firstName || "Test";
          const userLastName = (await AsyncStorage.getItem("userLastName")) || lastName || "User";

          const billingPayload = {
            data: {
              account_type: "Individual",
              role_type: "Student Base",
              email: userEmail,
              user_password: userPassword,
              first_name: userFirstName,
              last_name: userLastName,
              default_currency: "INR",
              country: "India",
              billing_details: [{ title: "Stridenex App" }]
            }
          };
          console.log("Submitting Student Billing registration payload on mobile:", billingPayload);

          const billingResponse = await api.post(
            `method/quantbit_billing_platform.quantbit_billing_platform.doctype.billing_account_master.billing_account_master.create_billing_registration`,
            billingPayload
          );

          console.log("Billing API full response on mobile:", billingResponse.data);

          const billingResult = billingResponse.data?.message || billingResponse.data;
          if (billingResult?.status === "error") {
            throw new Error(billingResult.message || "Failed to create billing account.");
          }
        } catch (billingErr: any) {
          console.error("Billing API Integration Error on mobile:", billingErr);
          const errorMsg = billingErr?.message || "Profile saved, but failed to assign the default billing package.";
          setError(errorMsg);
          setLoading(false);
          return; // Stop flow and show error
        }
        // ─── BILLING INTEGRATION ENDS HERE ──────────────────────────────────

        setSuccess(responseData?.message || "Student registered successfully!");

        // Mark as created in AsyncStorage so a restart won't try to create again
        await AsyncStorage.setItem('studentOnboardingStep', '2');
        setHasCreatedRecord(true);

        // Clear onboarding-specific AsyncStorage items (including step tracker)
        await AsyncStorage.multiRemove(["userEmail", "userFirstName", "userLastName", "userPassword", "studentOnboardingStep", "userMobileNo"]);

        // Clear any errors
        setError("");
        setFormErrors({});

        // Redirect to login page after a short delay
        setTimeout(() => {
          navigation.navigate("Login");
        }, 1500);
      } else {
        // Handle error response
        const errorMsg = responseData?.message ||
          responseData?.error ||
          "Registration failed. Please try again.";
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error("Error submitting onboarding data:", err);

      if (err?.response?.status === 409) {
        setError("This email is already registered. Please login instead.");
        // Optional: Redirect to login after 2 seconds
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000);
      } else {
        const errorMessage = err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "An error occurred during registration";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFormData = (newData: Partial<DynamicFormDataType>, resetFields: string[] = []) => {
    setDynamicFormData(prev => {
      const baseUpdate: Partial<DynamicFormDataType> = {
        state: newData.state ?? prev.state,
        district: newData.district ?? prev.district,
        college: newData.college ?? prev.college,
        department: newData.department ?? prev.department,
        academicYear: newData.academicYear ?? prev.academicYear,
        stream: newData.stream ?? prev.stream,
        course: newData.course ?? prev.course,
        semester: newData.semester ?? prev.semester,
        current_year: newData.current_year ?? prev.current_year,
        dateOfBirth: newData.dateOfBirth ?? prev.dateOfBirth,
        courses: newData.courses ?? prev.courses,
        skills: newData.skills ?? prev.skills,
        careerInterest: newData.careerInterest ?? prev.careerInterest,
        gender: newData.gender ?? prev.gender,
        resume: newData.resume ?? prev.resume,
        linkedinUrl: newData.linkedinUrl ?? prev.linkedinUrl,
        githubUrl: newData.githubUrl ?? prev.githubUrl,
        hasReferral: newData.hasReferral ?? prev.hasReferral,
        referal_code: newData.hasReferral === '0' ? '' : (newData.referal_code ?? prev.referal_code)
      };

      const resetValues = resetFields.reduce((acc, field) => {
        acc[field as keyof DynamicFormDataType] = "" as any;
        return acc;
      }, {} as Partial<DynamicFormDataType>);

      return { ...prev, ...baseUpdate, ...resetValues };
    });
  };

  return (
    <AnimatedAuthLayout
      title="Complete Your Profile"
      subtitle={`Step ${step} of 2 - Verify your details to gain access`}
    >
      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          {[1, 2].map((num, index) => (
            <React.Fragment key={num}>
              <View style={[styles.circle, step >= num ? styles.activeCircle : styles.inactiveCircle]}>
                <Text style={[styles.circleText, step >= num ? styles.activeText : styles.inactiveText]}>{num}</Text>
              </View>
              {index < 1 && <View style={[styles.line, step > num ? styles.activeLine : styles.inactiveLine]} />}
            </React.Fragment>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        {step === 1 && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            {/* Email Section */}
            <View style={styles.sectionContainer}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (emailOtpSent) {
                    setEmailOtpSent(false);
                    setEmailOtp("");
                  }
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={false}
              />

              {!emailOtpSent && !emailVerified && (
                <Button
                  title={emailTimer > 0 ? `Resend in ${emailTimer}s` : "Send OTP"}
                  onPress={handleSendEmailOTP}
                  loading={loading}
                  disabled={!email || emailTimer > 0}
                  style={styles.orangeBtn}
                />
              )}

              {emailOtpSent && !emailVerified && (
                <>
                  <Input
                    label="Email Verification Code"
                    value={emailOtp}
                    onChangeText={setEmailOtp}
                    keyboardType="number-pad"
                    placeholder="Enter 6-digit code"
                  />
                  <Button
                    title="Verify Email"
                    onPress={handleVerifyEmail}
                    style={styles.orangeBtn}
                    loading={loading}
                    disabled={emailOtp.length !== 6}
                  />
                </>
              )}

              {emailVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Email Verified</Text>
                </View>
              )}
            </View>

            {/* Mobile Section */}
            {emailVerified && (
              <View style={[styles.sectionContainer, styles.borderTop]}>
                <Input
                  label="Mobile Number"
                  value={mobile}
                  onChangeText={(val) => {
                    setMobile(val);
                    if (mobileOtpSent) {
                      setMobileOtpSent(false);
                      setMobileOtp("");
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={10}
                  editable={!mobileVerified}
                />

                {!mobileOtpSent && !mobileVerified && (
                  <Button
                    title={mobileTimer > 0 ? `Resend in ${mobileTimer}s` : "Send OTP"}
                    onPress={handleSendMobileOTP}
                    loading={loading}
                    disabled={mobile.length !== 10 || mobileTimer > 0}
                    style={styles.orangeBtn}
                  />
                )}

                {mobileOtpSent && !mobileVerified && (
                  <>
                    <Input
                      label="Mobile Verification Code"
                      value={mobileOtp}
                      onChangeText={setMobileOtp}
                      keyboardType="number-pad"
                      placeholder="Enter 6-digit code"
                    />
                    <Button
                      title="Verify Mobile"
                      onPress={handleVerifyMobile}
                      style={styles.orangeBtn}
                      loading={loading}
                      disabled={mobileOtp.length !== 6}
                    />
                  </>
                )}

                {mobileVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Mobile Verified</Text>
                  </View>
                )}
              </View>
            )}

            {/* Continue Button */}
            {emailVerified && mobileVerified && (
              <Button
                title="Continue to Profile"
                onPress={async () => {
                  // Persist progress so app restart returns to step 2, not OTP screen
                  await AsyncStorage.setItem('studentOnboardingStep', '1');
                  setStep(2);
                  setError("");
                  setSuccess("");
                }}
                style={styles.continueBtn}
              />
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.skipContainer}>
              <Text style={styles.skipTextBtn}>Skip Onboarding</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {step === 2 && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            <DynamicForm
              fields={step3Fields}
              initialValues={dynamicFormData}
              onChange={(data: DynamicFormDataType) => {
                const changedField = Object.keys(data).find(
                  key => data[key as keyof DynamicFormDataType] !== dynamicFormData[key as keyof DynamicFormDataType]
                );

                if (changedField) {
                  const fieldDependencies: Record<string, string[]> = {
                    state: ["district", "college", "department", "academicYear", "course", "semester"],
                    district: ["college", "department", "academicYear", "course", "semester"],
                    stream: ["college", "department", "academicYear", "course", "semester"],
                    college: ["department", "academicYear", "course", "semester"],
                    department: ["semester"],
                    course: ["semester"]
                  };

                  const fieldsToReset = fieldDependencies[changedField] || [];
                  handleUpdateFormData(data, fieldsToReset);

                  setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[changedField];
                    if (fieldDependencies[changedField]) {
                      fieldDependencies[changedField].forEach(field => {
                        delete newErrors[field];
                      });
                    }
                    return newErrors;
                  });

                  if (changedField === "state" || changedField === "district" ||
                    changedField === "stream" || changedField === "college") {
                    fetchedFieldsRef.current.delete('department');
                    fetchedFieldsRef.current.delete('course');
                    fetchedFieldsRef.current.delete('semester');
                  } else if (changedField === "department") {
                    fetchedFieldsRef.current.delete('semester');
                  }
                } else {
                  setDynamicFormData(data);
                }
              }}
              onSubmit={handleFinalSubmit}
              buttonLabel="Finish Onboarding"
              loading={loading}
              errors={formErrors}
            />
            <View style={styles.backButtonContainer}>
              <Button
                title="Back to Verification"
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem('studentOnboardingStep');
                  } catch (e) {
                    console.warn(e);
                  }
                  setEmailVerified(false);
                  setEmailOtpSent(false);
                  setEmailOtp("");
                  setMobileVerified(false);
                  setMobileOtpSent(false);
                  setMobileOtp("");
                  setStep(1);
                }}
                variant="outline"
                size="sm"
                fullWidth={false}
              />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.skipContainer}>
              <Text style={styles.skipTextBtn}>Skip Onboarding</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </AnimatedAuthLayout>
  );
};

export default StudentOnboardingScreen;

const styles = StyleSheet.create({
  container: { width: '100%', flex: 1 },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2
  },
  activeCircle: {
    backgroundColor: colors.accent.DEFAULT,
    borderColor: colors.accent.DEFAULT
  },
  inactiveCircle: {
    backgroundColor: 'transparent',
    borderColor: colors.border
  },
  circleText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  activeText: {
    color: 'white'
  },
  inactiveText: {
    color: colors.text.secondary
  },
  line: {
    height: 2,
    flex: 1,
    marginHorizontal: 8
  },
  activeLine: {
    backgroundColor: colors.accent.DEFAULT
  },
  inactiveLine: {
    backgroundColor: colors.border
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontFamily: typography.fontFamily.display
  },
  successText: {
    color: colors.success,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontFamily: typography.fontFamily.display,
    fontWeight: 'bold'
  },
  orangeBtn: {
    backgroundColor: colors.accent.DEFAULT,
    marginTop: spacing.md
  },
  skipContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
    padding: spacing.sm
  },
  skipTextBtn: {
    color: colors.accent.DEFAULT,
    fontWeight: '600',
    fontSize: typography.fontSize.sm
  },
  backButtonContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  sectionContainer: {
    marginBottom: spacing.md,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  verifiedBadge: {
    backgroundColor: '#DEF7EC',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  verifiedText: {
    color: '#03543F',
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
  },
  continueBtn: {
    backgroundColor: colors.accent.DEFAULT,
    marginTop: spacing.lg,
    width: '100%',
  },
});