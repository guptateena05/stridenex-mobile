import { api } from "./api.services";

/**
 * Fetch college details by email.
 * Endpoint: method/stridenex_app.api_stridenex_app.college.college.get_college
 */
export const getCollegeDetails = async (email: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.api_stridenex_app.college.college.get_college?email=${encodeURIComponent(email)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching college details:", error);
    throw error;
  }
};

/**
 * Update college details by email.
 * Endpoint: method/stridenex_app.api_stridenex_app.college.college.update_college
 */
export const updateCollegeDetails = async (email: string, payload: any) => {
  try {
    const response = await api.put(
      `method/stridenex_app.api_stridenex_app.college.college.update_college?email=${encodeURIComponent(email)}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating college details:", error);
    throw error;
  }
};

export const getPlacementStats = async (college: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college_campus_drives.college_campus_drives.get_placement_stats`,
      { params: { college } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching placement stats:", error);
    throw error;
  }
};

export const getBranchWisePerformance = async (college: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college_campus_drives.college_campus_drives.get_branch_wise_performance`,
      { params: { college } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching branch wise performance:", error);
    throw error;
  }
};

export const getDriveCount = async (college: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college_campus_drives.college_campus_drives.get_drive_count/`,
      { params: { college } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching drive count:", error);
    throw error;
  }
};

export const getCollegeDrives = async (college: string, page = 1, pageSize = 20) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college_campus_drives.college_campus_drives.get_drives_by_college`,
      { params: { college, page, page_size: pageSize } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching college drives:", error);
    throw error;
  }
};

export const getDashboardSummary = async (college: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college.college.get_dashboard_summary`,
      { params: { college } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

export const getEmployabilityDistribution = async (college: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college.college.get_employability_distribution`,
      { params: { college } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching employability distribution:", error);
    throw error;
  }
};

export const getOnboardingGrowth = async (college: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college.college.get_onboarding_growth`,
      { params: { college } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching onboarding growth:", error);
    throw error;
  }
};

export const getTopSkillGaps = async (college: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college.college.get_top_skill_gaps`,
      { params: { college } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching top skill gaps:", error);
    throw error;
  }
};

export const getCollegeEvents = async (college: string, page: number = 1, pageSize: number = 20) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college_event.college_event.get_college_event_list`,
      { params: { college, page, page_size: pageSize } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching events for college ${college}:`, error);
    throw error;
  }
};

export const createCollegeEvent = async (eventData: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.college_event.college_event.create_college_event`,
      eventData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating college event:", error);
    throw error;
  }
};

export const updateCollegeEvent = async (name: string, eventData: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.college_event.college_event.update_college_event?name=${encodeURIComponent(name)}`,
      eventData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating college event ${name}:`, error);
    throw error;
  }
};

export const getCollegeNotices = async (college: string, page: number = 1, pageSize: number = 20) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college_notice.college_notice.get_college_notice_list`,
      { params: { college, page, page_size: pageSize } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching notices for college ${college}:`, error);
    throw error;
  }
};

export const createCollegeNotice = async (noticeData: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.college_notice.college_notice.create_college_notice`,
      noticeData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating college notice:", error);
    throw error;
  }
};

export const updateCollegeNotice = async (name: string, noticeData: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.college_notice.college_notice.update_college_notice?name=${encodeURIComponent(name)}`,
      noticeData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating college notice ${name}:`, error);
    throw error;
  }
};

export const deleteCollegeNotice = async (name: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.college_notice.college_notice.delete_college_notice?name=${encodeURIComponent(name)}`,
      { name }
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting college notice ${name}:`, error);
    throw error;
  }
};

export const getStudentAnalyticsList = async (params: {
  search?: string;
  college?: string;
  department?: string;
  skill?: string;
  current_year?: string;
  page?: number;
  page_size?: number;
}) => {
  try {
    const queryParts: string[] = [];
    if (params.search !== undefined) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.college !== undefined) queryParts.push(`college=${encodeURIComponent(params.college)}`);
    if (params.department !== undefined) queryParts.push(`department=${encodeURIComponent(params.department)}`);
    if (params.skill !== undefined) queryParts.push(`skill=${encodeURIComponent(params.skill)}`);
    if (params.current_year !== undefined) queryParts.push(`current_year=${encodeURIComponent(params.current_year)}`);
    if (params.page !== undefined) queryParts.push(`page=${encodeURIComponent(params.page)}`);
    if (params.page_size !== undefined) queryParts.push(`page_size=${encodeURIComponent(params.page_size)}`);

    let url = `method/stridenex_app.stridenex_app.doctype.campus_drive_application.campus_drive_application.get_student_Analytics_list`;
    if (queryParts.length > 0) {
      url += `?${queryParts.join("&")}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching student analytics list:", error);
    throw error;
  }
};

export const getLowEmployabilityStudents = async (college: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college_campus_drives.college_campus_drives.get_low_employability_students`,
      { params: { college } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching low employability students:", error);
    throw error;
  }
};

export const assignStudentMentor = async (payload: { student: string; mentor: string }) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.student_mentor_mapping.student_mentor_mapping.create_student_mentor_mapping`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning student mentor:", error);
    throw error;
  }
};

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

export const getPlacementList = async (college: string, name?: string, status?: string) => {
  try {
    const params: any = { college };
    if (name) params.name = name;
    if (status) params.status = status;
    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.campus_drive_application.campus_drive_application.get_placement_list',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching placement list for college ${college}:`, error);
    throw error;
  }
};

export const getPlacementCounts = async (college: string, name?: string) => {
  try {
    const params: any = { college };
    if (name) params.name = name;
    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.campus_drive_application.campus_drive_application.get_placement_counts',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching placement counts for college ${college}:`, error);
    throw error;
  }
};

export const getEligibleStudents = async (
  params: string | { branch?: string; cgpa?: number | string; backlog?: number | string; drive?: string; college?: string; academic_year?: string }
) => {
  try {
    let queryParams: any = {};
    if (typeof params === 'string') {
      queryParams.drive = params;
    } else {
      if (params.branch) queryParams.branch = params.branch;
      if (params.cgpa !== undefined && params.cgpa !== "") queryParams.cgpa = params.cgpa;
      if (params.backlog !== undefined && params.backlog !== "") queryParams.backlog = params.backlog;
      if (params.drive) queryParams.drive = params.drive;
      if (params.college) queryParams.college = params.college;
      if (params.academic_year) queryParams.academic_year = params.academic_year;
    }
    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.campus_drive_application.campus_drive_application.get_eligible_students',
      { params: queryParams }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching eligible students:`, error);
    throw error;
  }
};

export const getNonEligibleStudents = async (params: {
  branch?: string;
  cgpa?: number | string;
  backlog?: number | string;
  college?: string;
  academic_year?: string;
}) => {
  try {
    const queryParams: any = {};
    if (params.branch) queryParams.branch = params.branch;
    if (params.cgpa !== undefined && params.cgpa !== "") queryParams.cgpa = params.cgpa;
    if (params.backlog !== undefined && params.backlog !== "") queryParams.backlog = params.backlog;
    if (params.college) queryParams.college = params.college;
    if (params.academic_year) queryParams.academic_year = params.academic_year;

    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.campus_drive_application.campus_drive_application.get_not_eligible_students',
      { params: queryParams }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching non-eligible students:", error);
    throw error;
  }
};

export const updateCampusDriveApplicationStatus = async (applicationName: string, status: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.campus_drive_application.campus_drive_application.update_application_status?application_name=${encodeURIComponent(applicationName)}&status=${encodeURIComponent(status)}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating campus drive application status for ${applicationName}:`, error);
    throw error;
  }
};

export const sendCandidateStatusMail = async (data: {
  email: string;
  status: string;
  candidate_name: string;
  drive_name: string;
}) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.campus_drive_application.campus_drive_application.send_candidate_status_mail`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error sending candidate status mail to ${data.email}:`, error);
    throw error;
  }
};

export const getSalaryBands = async (college: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college_campus_drives.college_campus_drives.get_salary_bands`,
      { params: { college } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching salary bands for college ${college}:`, error);
    throw error;
  }
};

export const createCollegeDrive = async (driveData: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.college_campus_drives.college_campus_drives.create_drive`,
      driveData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating college drive:", error);
    throw error;
  }
};

export const updateCollegeDrive = async (driveData: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.college_campus_drives.college_campus_drives.update_drive`,
      driveData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating college drive:", error);
    throw error;
  }
};

export const deleteCollegeDrive = async (driveName: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.college_campus_drives.college_campus_drives.delete_drive?name=${encodeURIComponent(driveName)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting college drive:", error);
    throw error;
  }
};

export const getPlacementFunnel = async (college: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.college_campus_drives.college_campus_drives.get_placement_funnel`,
      { params: { college } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching placement funnel for college ${college}:`, error);
    throw error;
  }
};

export const exportEligibleStudents = async (params: {
  branch?: string;
  cgpa?: number | string;
  backlog?: number | string;
  college?: string;
  academic_year?: string;
}) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.campus_drive_application.campus_drive_application.export_eligible_students`,
      { params, responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    console.error("Error exporting eligible students:", error);
    throw error;
  }
};

export const exportNotEligibleStudents = async (params: {
  branch?: string;
  cgpa?: number | string;
  backlog?: number | string;
  college?: string;
  academic_year?: string;
}) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.campus_drive_application.campus_drive_application.export_not_eligible_students`,
      { params, responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    console.error("Error exporting not eligible students:", error);
    throw error;
  }
};




