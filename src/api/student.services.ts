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


