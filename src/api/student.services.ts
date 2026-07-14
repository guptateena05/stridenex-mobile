import { api } from "./api.services";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Fetch student details by email.
 * Endpoint: method/stridenex_app.api_stridenex_app.student.student.get_student_by_email
 */
export const getStudentByEmail = async (emailId: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.api_stridenex_app.student.student.get_student_by_email`,
      { params: { email_id: emailId } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student by email:", error);
    throw error;
  }
};

/**
 * Format mobile number to standard "+CountryCode-PhoneNumber" (like +91-7656787656)
 */
export const formatMobileNumber = (mobileNo: string): string => {
  if (!mobileNo) return "";
  let cleaned = String(mobileNo).trim();

  // If already in the format "+XX-XXXXXXXXXX" or similar (+country_code-number)
  if (/^\+\d+-\d+$/.test(cleaned)) {
    return cleaned;
  }

  // Remove all non-digit characters except the leading "+" if present
  const hasPlus = cleaned.startsWith("+");
  let digits = cleaned.replace(/\D/g, "");

  if (hasPlus) {
    if (digits.startsWith("91")) {
      const rest = digits.substring(2);
      return `+91-${rest}`;
    } else {
      if (digits.length === 11) {
        return `+${digits.substring(0, 1)}-${digits.substring(1)}`;
      } else if (digits.length === 12) {
        return `+${digits.substring(0, 2)}-${digits.substring(2)}`;
      } else if (digits.length === 13) {
        return `+${digits.substring(0, 3)}-${digits.substring(3)}`;
      }
      return `+${digits}`;
    }
  } else {
    if (digits.startsWith("91") && digits.length === 12) {
      return `+91-${digits.substring(2)}`;
    }
    if (digits.length === 10) {
      return `+91-${digits}`;
    }
    return `+91-${digits}`;
  }
};

/**
 * Update student details.
 * Endpoint: method/stridenex_app.api_stridenex_app.student.student.update_student
 */
export const updateStudent = async (emailId: string, data: any) => {
  try {
    const formattedData = { ...data };
    if (formattedData.mobile_no) {
      formattedData.mobile_no = formatMobileNumber(formattedData.mobile_no);
    }
    const response = await api.post(
      `method/stridenex_app.api_stridenex_app.student.student.update_student?email_id=${encodeURIComponent(emailId)}`,
      formattedData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};

/**
 * Fetch skill ledger summary for a student.
 */
export const getSkillLedger = async (studentEmail: string) => {
  try {
    const response = await api.post(
      "method/nexedu.skill_ledger.doctype.student_skill.student_skill.get_skill_ledger",
      { student: studentEmail }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching skill ledger:", error);
    throw error;
  }
};

/**
 * Fetch employability score for a student.
 */
export const getEmployabilityScore = async (studentEmail: string) => {
  try {
    const response = await api.post(
      "method/nexedu.skill_ledger.doctype.student_skill.student_skill.get_employability_score",
      { student: studentEmail }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching employability score:", error);
    throw error;
  }
};

/**
 * Create a new student skill.
 */
export const createStudentSkill = async (data: any) => {
  try {
    const response = await api.post(
      "method/nexedu.skill_ledger.doctype.student_skill.student_skill.create_student_skill",
      { data }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating student skill:", error);
    throw error;
  }
};

/**
 * Add skill evidence for a student.
 */
export const addSkillEvidence = async (data: any) => {
  try {
    const response = await api.post(
      "method/nexedu.skill_ledger.doctype.skill_evidence.skill_evidence.add_evidence",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error adding skill evidence:", error);
    throw error;
  }
};

/**
 * Fetch skill test questions.
 */
export const getSkillTestQuestions = async (student: string, skill: string, level: string) => {
  try {
    const response = await api.get(
      `method/nexedu.api.skill_assessment_ai.get_skill_test_questions?student=${encodeURIComponent(student)}&skill=${encodeURIComponent(skill)}&level=${encodeURIComponent(level)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching skill test questions:", error);
    throw error;
  }
};

/**
 * Submit skill test.
 */
export const submitSkillTest = async (payload: {
  student: string;
  skill: string;
  level: string;
  answers: Record<string, string>;
}) => {
  try {
    const response = await api.post(
      `method/nexedu.api.skill_assessment_ai.submit_skill_test`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting skill test:", error);
    throw error;
  }
};

export const mapYearToWord = (year: any): string | null => {
  if (!year) return null;
  const str = String(year).trim().toLowerCase();
  if (str === "1" || str.includes("1st") || str.includes("first")) return "First Year";
  if (str === "2" || str.includes("2nd") || str.includes("second")) return "Second Year";
  if (str === "3" || str.includes("3rd") || str.includes("third")) return "Third Year";
  if (str === "4" || str.includes("4th") || str.includes("final") || str.includes("fourth")) return "Final Year";
  return year;
};

/**
 * Fetch all available internships for students.
 */
export const getStudentInternshipList = async (
  studentEmail?: string,
  course?: string | null,
  department?: string | null,
  academicYear?: string | null,
  search?: string
) => {
  try {
    const yearWord = mapYearToWord(academicYear);
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.internship.internship.get_internship_list",
      {
        params: {
          student: studentEmail || "",
          course: course || "null",
          department: department || "null",
          current_year: yearWord || "null",
          search: search || ""
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student internship list:", error);
    throw error;
  }
};

/**
 * Fetch all available projects for students.
 */
export const getStudentProjectList = async (
  studentEmail?: string,
  course?: string | null,
  department?: string | null,
  academicYear?: string | null,
  search?: string
) => {
  try {
    const yearWord = mapYearToWord(academicYear);
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.industry_project.industry_project.get_project_list",
      {
        params: {
          student: studentEmail || "",
          course: course || "null",
          department: department || "null",
          current_year: yearWord || "null",
          search: search || ""
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student project list:", error);
    throw error;
  }
};

/**
 * Apply for an internship.
 */
export const createStudentApplication = async (data: any) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.internship_application.internship_application.create_student_application",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating student application:", error);
    throw error;
  }
};

/**
 * Enroll in a project.
 */
export const createStudentProjectEnrollment = async (data: any) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.student_project_enrollment.student_project_enrollment.create_student_project_enrollment",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating student project enrollment:", error);
    throw error;
  }
};

/**
 * Fetch student habits dashboard.
 */
export const getStudentDashboardHabits = async (studentEmail: string) => {
  try {
    const response = await api.post(
      "method/nexedu.habits_builder.api.get_student_dashboard",
      { student: studentEmail }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student habits dashboard:", error);
    throw error;
  }
};

/**
 * Log daily habits.
 */
export const logDailyHabits = async (data: any) => {
  try {
    const response = await api.post(
      "method/nexedu.habits_builder.api.log_daily_habits",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error logging daily habits:", error);
    throw error;
  }
};

/**
 * Update habit log status.
 */
export const updateLogStatus = async (logName: string, status: string) => {
  try {
    const response = await api.post(
      "method/nexedu.habits_builder.api.update_log_status",
      { log_name: logName, status }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating log status:", error);
    throw error;
  }
};

/**
 * Create a new habit plan.
 */
export const createHabitPlan = async (data: any) => {
  try {
    const response = await api.post(
      "method/nexedu.habits_builder.api.create_habit_plan",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating habit plan:", error);
    throw error;
  }
};

/**
 * Fetch student habit plans.
 */
export const getStudentPlans = async (studentEmail: string, status?: string) => {
  try {
    const payload: any = { student: studentEmail };
    if (status) payload.status = status;
    const response = await api.post(
      "method/nexedu.habits_builder.api.get_student_plans",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student plans:", error);
    throw error;
  }
};

/**
 * Fetch habit streaks for a student.
 */
export const getHabitStreaks = async (studentEmail: string) => {
  try {
    const response = await api.post(
      "method/nexedu.habits_builder.api.get_habit_streaks",
      { student: studentEmail }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching habit streaks:", error);
    throw error;
  }
};

/**
 * Fetch habit history.
 */
export const getHabitHistory = async (studentEmail: string, habit: string, days: number = 30) => {
  try {
    const response = await api.post(
      "method/nexedu.habits_builder.api.get_habit_history",
      { student: studentEmail, habit, days }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching habit history:", error);
    throw error;
  }
};

/**
 * Fetch today's pending habits.
 */
export const getTodaysPendingHabits = async (studentEmail: string) => {
  try {
    const response = await api.post(
      "method/nexedu.habits_builder.api.get_todays_pending_habits",
      { student: studentEmail }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching today's pending habits:", error);
    throw error;
  }
};

/**
 * Fetch habit plan summary.
 */
export const getPlanSummary = async (planName: string) => {
  try {
    const response = await api.post(
      "method/nexedu.habits_builder.api.get_plan_summary",
      { plan_name: planName }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching plan summary:", error);
    throw error;
  }
};

/**
 * Complete habit plan status.
 */
export const completeHabitPlanStatus = async (planName: string, habitName: string, student: string) => {
  try {
    const response = await api.post(
      "method/nexedu.habits_builder.api.complete_habit_plan_status",
      {
        plan_name: planName,
        habit_name: habitName,
        student: student
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error completing habit plan status:", error);
    throw error;
  }
};

/**
 * Delete habit plan.
 */
export const deleteHabitPlan = async (planName: string, habitName: string, student: string) => {
  try {
    const response = await api.post(
      "method/nexedu.habits_builder.api.delete_habit_plan",
      {
        plan_name: planName,
        habit_name: habitName,
        student: student
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting habit plan:", error);
    throw error;
  }
};

/**
 * Fetch mentor list for students.
 */
export const getMentorList = async (page: number = 1, page_size: number = 20, search?: string) => {
  try {
    const response = await api.get(
      "method/stridenex_app.api_stridenex_app.mentor.mentor.get_mentor_list",
      {
        params: {
          page,
          page_size,
          ...(search ? { search } : {})
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor list:", error);
    throw error;
  }
};

/**
 * Fetch mentor slot calendar.
 */
export const getMentorSlotCalendar = async (mentorEmail: string) => {
  try {
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.get_slot_calendar",
      { params: { mentor: mentorEmail } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor slot calendar:", error);
    throw error;
  }
};

/**
 * Book a mentor slot.
 */
export const bookMentorSlot = async (data: Record<string, string>) => {
  try {
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.book_slot",
      { params: data }
    );
    return response.data;
  } catch (error) {
    console.error("Error booking mentor slot:", error);
    throw error;
  }
};

/**
 * Fetch the next available slot for a mentor.
 */
export const getMentorNextAvailableSlot = async (mentorEmail: string) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_offering.mentor_offering._get_next_available_slot",
      { mentor: mentorEmail }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor next available slot:", error);
    throw error;
  }
};

/**
 * Get booked sessions for a student.
 */
export const getBookedSessions = async (studentEmail: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.get_booked_sessions`,
      { params: { student_email: studentEmail } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching booked sessions:", error);
    throw error;
  }
};

/**
 * Fetch mentor offerings list.
 */
export const getMentorOfferings = async (mentorEmail: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.mentor_offering.mentor_offering.get_mentor_offerings`,
      { params: { mentor: mentorEmail } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor offerings:", error);
    throw error;
  }
};

/**
 * Fetch master data for a specific doctype.
 */
export const getMasterData = async (doctype: string, additionalPayload: any = {}) => {
  try {
    const payload = {
      doctype,
      page: additionalPayload.page !== undefined ? additionalPayload.page : 1,
      search: additionalPayload.search !== undefined ? additionalPayload.search : "",
      ...additionalPayload
    };
    const url = `method/stridenex_app.api_stridenex_app.college.master.get_master_data?page=${payload.page}&search=${encodeURIComponent(payload.search)}&doctype=${doctype}`;
    const response = await api.post(url, payload);
    const responseData = response.data;
    let arr = [];
    if (responseData && responseData.data && Array.isArray(responseData.data.data)) {
      arr = responseData.data.data;
    } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
      arr = responseData.data;
    } else if (responseData && responseData.message && Array.isArray(responseData.message)) {
      arr = responseData.message;
    } else if (responseData && responseData.message && responseData.message.data && Array.isArray(responseData.message.data)) {
      arr = responseData.message.data;
    }
    return { data: arr, message: arr, pagination: responseData?.data?.pagination || responseData?.message?.pagination };
  } catch (error) {
    console.error(`Error fetching master data for ${doctype}:`, error);
    throw error;
  }
};

/**
 * Create a student event registration.
 */
export const createStudentEventRegistration = async (data: any) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.student_event_registeration.student_event_registeration.create_student_event_registeration",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating student event registration:", error);
    throw error;
  }
};

/**
 * Fetch college event list for a specific college and student.
 */
export const getCollegeEventList = async (college: string, studentEmail: string) => {
  try {
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.college_event.college_event.get_college_event_list",
      { params: { college, student: studentEmail } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching college event list:", error);
    throw error;
  }
};

/**
 * Fetch student career path.
 */
export const getStudentCareerPath = async (studentEmail: string) => {
  try {
    const response = await api.get(
      "method/nexedu.path_finder.app_api.get_student_career_path",
      { params: { student: studentEmail } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student career path:", error);
    throw error;
  }
};

/**
 * Fetch recommended paths.
 */
export const getRecommendedPaths = async (studentEmail: string) => {
  try {
    const response = await api.get(
      "method/nexedu.path_finder.app_api.get_recommended_paths",
      { params: { student: studentEmail } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching recommended paths:", error);
    throw error;
  }
};

/**
 * Enroll student in a career path.
 */
export const enrollStudentPath = async (studentEmail: string, careerPath: string) => {
  try {
    const response = await api.post(
      "method/nexedu.path_finder.api.path_enrollment.enroll_student",
      {
        student: studentEmail,
        career_path: careerPath
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error enrolling student path:", error);
    throw error;
  }
};

/**
 * List community channels.
 */
export const listChannels = async () => {
  try {
    const response = await api.get(
      "method/stridenex_app.api_stridenex_app.raven.list_channels"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching channels:", error);
    throw error;
  }
};

/**
 * Join a community channel.
 */
export const joinChannel = async (channelId: string) => {
  try {
    const storedToken = await AsyncStorage.getItem("token");
    const token = storedToken ? storedToken.trim() : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    const response = await api.post(
      "method/stridenex_app.api_stridenex_app.raven.join_channel",
      { channel_id: channelId },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error joining channel:", error);
    throw error;
  }
};

/**
 * Fetch category list by parent category.
 * Endpoint: method/stridenex_app.api_stridenex_app.raven.get_category_list
 */
export const getCategoryList = async (parentCategory: string) => {
  try {
    const response = await api.get(
      "method/stridenex_app.api_stridenex_app.raven.get_category_list",
      { params: { parent_category: parentCategory } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching category list:", error);
    throw error;
  }
};

/**
 * Fetch messages for a given channel.
 * Endpoint: method/stridenex_app.api_stridenex_app.raven.list_messages
 */
export const listMessages = async (channelId: string, channelCategory?: string) => {
  try {
    const response = await api.post(
      "method/stridenex_app.api_stridenex_app.raven.list_messages",
      { 
        channel_id: channelId,
        ...(channelCategory ? { channel_category: channelCategory } : {})
      },
      channelCategory ? {
        params: {
          channel_id: channelId,
          channel_category: channelCategory
        }
      } : undefined
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching message list:", error);
    throw error;
  }
};

/**
 * Leave a given channel.
 * Endpoint: method/stridenex_app.api_stridenex_app.raven.leave_channel
 */
export const leaveChannel = async (channelId: string) => {
  try {
    const storedToken = await AsyncStorage.getItem("userToken");
    const token = storedToken ? storedToken.trim() : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    const response = await api.post(
      "method/stridenex_app.api_stridenex_app.raven.leave_channel",
      { channel_id: channelId },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error leaving channel:", error);
    throw error;
  }
};

/**
 * Send a message or post a reply.
 * Endpoint: method/stridenex_app.api_stridenex_app.raven.send_message
 */
export const sendMessage = async (payload: {
  channel_id: string;
  reply_to_message?: string;
  channel_category?: string;
  text: string;
}) => {
  try {
    const response = await api.post(
      "method/stridenex_app.api_stridenex_app.raven.send_message",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Fetch all success stories.
 */
export const getSuccessStories = async () => {
  try {
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.success_story.success_story.get_success_stories"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching success stories:", error);
    throw error;
  }
};

/**
 * Create a new success story.
 */
export const createSuccessStory = async (data: any) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.success_story.success_story.create_success_story",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating success story:", error);
    throw error;
  }
};

/**
 * Fetch educational shorts feed.
 */
export const getShortsFeed = async (userEmail?: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.educational_short.educational_short.get_shorts_feed",
      {
        params: userEmail ? { user: userEmail } : {},
        headers
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching shorts feed:", error);
    throw error;
  }
};

/**
 * Save an educational short.
 */
export const saveShort = async (payload: { user: string; short_name: string }) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.educational_short.educational_short.save_short",
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving short:", error);
    throw error;
  }
};

/**
 * Unsave an educational short.
 */
export const unsaveShort = async (payload: { user: string; short_name: string }) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.educational_short.educational_short.unsave_short",
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error unsaving short:", error);
    throw error;
  }
};

/**
 * Toggle like status of an educational short.
 */
export const toggleLikeShort = async (payload: { short: string }) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.educational_short.educational_short.toggle_like",
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

/**
 * Fetch saved educational shorts.
 */
export const getSavedShorts = async (userEmail: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.educational_short.educational_short.get_saved_shorts",
      {
        params: { user: userEmail },
        headers
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching saved shorts:", error);
    throw error;
  }
};

/**
 * Fetch student skills snapshot.
 */
export const getStudentSkills = async (studentEmail: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.student.student.get_student_skills",
      {
        params: { student: studentEmail },
        headers
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student skills:", error);
    throw error;
  }
};

/**
 * Fetch student dashboard metrics / stats.
 */
export const getDashboardStats = async (studentEmail: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.student.student.get_dashboard_stats",
      {
        params: { student: studentEmail },
        headers
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};




