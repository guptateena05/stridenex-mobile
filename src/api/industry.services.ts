import { api as baseApi } from "./api.services";
import { Alert } from "@/utils/alert";

const api = {
  get: async (url: string, config?: any) => {
    try {
      return await baseApi.get(url, config);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "An unexpected error occurred");
      throw error;
    }
  },
  post: async (url: string, data?: any, config?: any) => {
    try {
      return await baseApi.post(url, data, config);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "An unexpected error occurred");
      throw error;
    }
  },
  put: async (url: string, data?: any, config?: any) => {
    try {
      return await baseApi.put(url, data, config);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "An unexpected error occurred");
      throw error;
    }
  },
  patch: async (url: string, data?: any, config?: any) => {
    try {
      return await baseApi.patch(url, data, config);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "An unexpected error occurred");
      throw error;
    }
  },
  delete: async (url: string, config?: any) => {
    try {
      return await baseApi.delete(url, config);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "An unexpected error occurred");
      throw error;
    }
  },
};

export const getIndustryByEmail = async (email: string) => {
  try {
    const response = await api.get(
      'method/stridenex_app.api_stridenex_app.industry.industry.get_industry_by_name',
      { params: { email } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching industry by email:", error);
    throw error;
  }
};

export const updateIndustry = async (email: string, companyName: string, data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.api_stridenex_app.industry.industry.update_industry?company_name=${encodeURIComponent(companyName)}`,
      {
        ...data,
        email: email
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating industry:", error);
    throw error;
  }
};

export const getSkillDomain = async (industry: string) => {
  try {
    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.industry_skill_domain.industry_skill_domain.get_skill_domain',
      { params: { industry } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching skill domain:", error);
    throw error;
  }
};

export const createSkillDomain = async (data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.industry_skill_domain.industry_skill_domain.create_skill_domain?industry=${encodeURIComponent(data.industry)}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating skill domain:", error);
    throw error;
  }
};

export const updateSkillDomain = async (name: string, data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.industry_skill_domain.industry_skill_domain.update_skill_domain?name=${encodeURIComponent(name)}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating skill domain:", error);
    throw error;
  }
};

export const deleteSkillDomain = async (name: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.industry_skill_domain.industry_skill_domain.delete_skill_domain?name=${encodeURIComponent(name)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting skill domain:", error);
    throw error;
  }
};

export const addHiringRound = async (data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.api_stridenex_app.industry.industry.add_hiring_round`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error adding hiring round:", error);
    throw error;
  }
};

export const updateHiringRound = async (data: any) => {
  try {
    const companyName = data.industry_name || "";
    const rowName = data.row_name || "";
    const response = await api.post(
      `method/stridenex_app.api_stridenex_app.industry.industry.update_hiring_round?name=${encodeURIComponent(companyName)}&row_name=${encodeURIComponent(rowName)}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating hiring round:", error);
    throw error;
  }
};

export const deleteHiringRound = async (companyName: string, rowName: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.api_stridenex_app.industry.industry.delete_hiring_round?name=${encodeURIComponent(companyName)}&row_name=${encodeURIComponent(rowName)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting hiring round:", error);
    throw error;
  }
};

export const createSpecialization = async (specialization_name: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.specialization.specialization.create_specialization`,
      { specialization_name }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating specialization:", error);
    throw error;
  }
};

export const createSkill = async (skill_name: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.student.student.create_skill`,
      { skill_name }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating skill:", error);
    throw error;
  }
};

export const createDesignation = async (designation_name: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.job_function.job_function.create_designation`,
      { designation_name }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating designation:", error);
    throw error;
  }
};

export const getSkillDomainMaster = async () => getMasterData("Skill");
export const getDesignationMaster = async () => getMasterData("Designation");
export const getDomainMaster = async () => getMasterData("Domain");

export const createDomain = async (domain: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.sub_domain.sub_domain.create_domain`,
      { domain }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating domain:", error);
    throw error;
  }
};

export const createSubDomain = async (sub_domain: string, domain: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.sub_domain.sub_domain.create_sub_domain`,
      { sub_domain, domain }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating sub domain:", error);
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
export const getApplicationStatusCount = async (industry: string) => {
  try {
    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.internship_application.internship_application.get_application_status_count',
      { params: { industry } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching application status count:", error);
    throw error;
  }
};
export const getProjectList = async (industry: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.industry_project.industry_project.get_project_list?industry=${encodeURIComponent(industry)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching project list:", error);
    throw error;
  }
};

export const createProject = async (data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.industry_project.industry_project.create_project`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const updateProject = async (name: string, data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.industry_project.industry_project.update_project?name=${encodeURIComponent(name)}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProject = async (projectName: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.industry_project.industry_project.inactive_project?project_name=${encodeURIComponent(projectName)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const getProjectApplicationCount = async (industry: string) => {
  try {
    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.student_project_enrollment.student_project_enrollment.get_application_count_by_industry',
      { params: { industry } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching project application count:", error);
    throw error;
  }
};

export const getInternshipList = async (industry: string) => {
  try {
    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.internship.internship.get_internship_list',
      { params: { industry } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching internship list:", error);
    throw error;
  }
};

export const createInternship = async (data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.internship.internship.create_internship`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating internship:", error);
    throw error;
  }
};

export const updateInternship = async (name: string, data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.internship.internship.update_internship?name=${encodeURIComponent(name)}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating internship:", error);
    throw error;
  }
};

export const deleteInternship = async (internshipName: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.internship.internship.inactive_internship?name=${encodeURIComponent(internshipName)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting internship:", error);
    throw error;
  }
};

export const createCourse = async (course_name: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.courses.courses.create_course`,
      { course_name }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

export const createDepartment = async (department_name: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.college_department.college_department.create_department`,
      { department_name }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
};

export const getStudentApplicationList = async (industry: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.internship_application.internship_application.get_student_application_list`,
      { params: { industry } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student application list:", error);
    throw error;
  }
};

export const getFindTalentList = async (params: {
  search?: string;
  College?: string;
  current_year?: string;
  skill?: string;
  sort_by?: string;
  page?: number;
  page_size?: number;
}) => {
  try {
    let url = `method/stridenex_app.stridenex_app.doctype.student.student.get_student_list?page=${params.page || 1}&page_size=${params.page_size || 20}`;
    if (params.search) {
      url += `&search=${encodeURIComponent(params.search)}`;
    }
    if (params.College) {
      url += `&College=${encodeURIComponent(params.College)}`;
    }
    if (params.current_year) {
      url += `&current_year=${encodeURIComponent(params.current_year)}`;
    }
    if (params.skill) {
      url += `&skill=${encodeURIComponent(params.skill)}`;
    }
    if (params.sort_by) {
      url += `&sort_by=${encodeURIComponent(params.sort_by)}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching student list:", error);
    throw error;
  }
};

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

export const updateApplicationStatus = async (name: string, status: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.student_applications.student_applications.update_application_status`,
      { name, status }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

export const getProjectApplicationList = async (industry: string, projectName?: string) => {
  try {
    const filters: any = {};
    if (industry) filters.industry = industry;
    if (projectName) filters.project = projectName;
    
    console.log("[DEBUG] Fetching Project Apps with filters:", JSON.stringify(filters));

    const doctype = "Student Project Enrollment";
    const url = `method/stridenex_app.api_stridenex_app.college.master.get_master_data?page=1&search=&doctype=${doctype}`;
    const response = await api.post(
      url,
      { 
        doctype,
        filters,
        fields: ["name", "student", "project", "industry", "status", "applied_on", "resume"]
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching project application list:", error);
    throw error;
  }
};

export const updateProjectApplicationStatus = async (payload: { name: string, industry: string, status: string }) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.student_project_enrollment.student_project_enrollment.update_student_project_enrollment`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating project application status:", error);
    throw error;
  }
};

export const generateEmailTemplate = async (industry: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.recruitment_outreach_template.recruitment_outreach_template.generate_email_template`,
      { industry }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating email template:", error);
    throw error;
  }
};

export const getInvitationTemplate = async (industry: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.recruitment_outreach_template.recruitment_outreach_template.get_invitation_template`,
      { industry }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting invitation template:", error);
    throw error;
  }
};

export const createJobProfile = async (data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.industry_job_profile.industry_job_profile.create_job_profile`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating job profile:", error);
    throw error;
  }
};

export const updateJobProfile = async (data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.industry_job_profile.industry_job_profile.update_job_profile`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job profile:", error);
    throw error;
  }
};

export const getJobProfiles = async (industry?: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.industry_job_profile.industry_job_profile.get_job_profiles`,
      { params: industry ? { industry } : {} }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching job profiles:", error);
    throw error;
  }
};

export const uploadFile = async (file: { uri: string; type: string; name: string }) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
    formData.append("is_private", "0");
    
    const response = await api.post(
      "method/upload_file",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const getApplications = async (params: {
  opportunity_type: string;
  industry: string;
  project?: string;
  proect?: string;
  internship?: string;
  job_profile?: string;
}) => {
  try {
    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.student_applications.student_applications.get_applications',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

export const getAllDropdownData = async (params: {
  opportunity_type: string;
  industry: string;
}) => {
  try {
    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.student_applications.student_applications.get_all_dropdown_data',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    throw error;
  }
};

export const getApplicationsCount = async (params: {
  opportunity_type: string;
  industry: string;
  project?: string;
  proect?: string;
  internship?: string;
  job_profile?: string;
}) => {
  try {
    const response = await api.get(
      'method/stridenex_app.stridenex_app.doctype.student_applications.student_applications.get_applications_count',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching applications count:", error);
    throw error;
  }
};

export interface OfferTemplatePayload {
  template_name: string;
  template_code: string;
  link_ewqm: string;
  select_egwf: string;
  status: string;
  subject: string;
  salutation: string;
  body: string;
  compensation_type: string;
  compensation_amount: number;
  currency: string;
  duration: string;
  effective_from: string;
  effective_to: string;
}

export const createOfferTemplate = async (data: OfferTemplatePayload) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.offer_template.offer_template.create_offer_template`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating offer template:", error);
    throw error;
  }
};

export const getOfferTemplates = async (industry?: string) => {
  try {
    let url = `method/stridenex_app.stridenex_app.doctype.offer_template.offer_template.get_offer_templates`;
    if (industry) {
      url += `?link_ewqm=${encodeURIComponent(industry)}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching offer templates:", error);
    throw error;
  }
};

export const updateOfferTemplate = async (data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.offer_template.offer_template.update_offer_template`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating offer template:", error);
    throw error;
  }
};

export const deleteOfferTemplate = async (name: string) => {
  try {
    const response = await api.post(
      `method/stridenex_app.stridenex_app.doctype.offer_template.offer_template.delete_offer_template`,
      { name }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting offer template:", error);
    throw error;
  }
};

