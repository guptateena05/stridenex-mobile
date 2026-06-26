import { api } from "./api.services";

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
 * Update student details.
 * Endpoint: method/stridenex_app.api_stridenex_app.student.student.update_student
 */
export const updateStudent = async (emailId: string, data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.api_stridenex_app.student.student.update_student?email_id=${encodeURIComponent(emailId)}`,
      data
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
      `method/nexedu.api.skill_assessment.ai.get_skill_test_questions`,
      { params: { student, skill, level } }
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
export const submitSkillTest = async (sessionId: string, answers: any[]) => {
  try {
    const response = await api.post(
      `method/nexedu.api.skill_assessment.ai.submit_skill_test`,
      { session_id: sessionId, answers }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting skill test:", error);
    throw error;
  }
};

/**
 * Fetch all available internships for students.
 */
export const getStudentInternshipList = async (
  studentEmail?: string,
  course?: string | null,
  department?: string | null,
  academicYear?: string | null
) => {
  try {
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.internship.internship.get_internship_list",
      {
        params: {
          student: studentEmail || "",
          course: course || "null",
          department: department || "null"
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
  academicYear?: string | null
) => {
  try {
    const response = await api.get(
      "method/stridenex_app.stridenex_app.doctype.industry_project.industry_project.get_project_list",
      {
        params: {
          student: studentEmail || "",
          course: course || "null",
          department: department || "null",
          academic_year: academicYear || "null"
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


