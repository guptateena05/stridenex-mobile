import { api } from "./api.services";

/**
 * Fetch college details by email.
 * Endpoint: method/stridenex_app.api_stridenex_app.college.college.get_college
 */
export const getCollegeDetails = async (email: string) => {
  try {
    const response = await api.get(
      'method/stridenex_app.api_stridenex_app.college.college.get_college',
      { params: { email } }
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

