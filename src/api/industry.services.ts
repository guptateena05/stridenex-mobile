import { api } from "./api.services";

export const getIndustryByEmail = async (email: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.api_stridenex_app.industry.industry.get_industry_by_name?email=${encodeURIComponent(email)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching industry by email:", error);
    throw error;
  }
};

export const updateIndustry = async (companyName: string, data: any) => {
  try {
    const response = await api.post(
      `method/stridenex_app.api_stridenex_app.industry.industry.update_industry?company_name=${encodeURIComponent(companyName)}`,
      data
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
      `method/stridenex_app.stridenex_app.doctype.industry_skill_domain.industry_skill_domain.get_skill_domain?industry=${encodeURIComponent(industry)}`
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

export const getMasterData = async (doctype: string, additionalPayload: any = {}) => {
  try {
    const response = await api.post(
      "method/stridenex_app.api_stridenex_app.college.master.get_master_data",
      { doctype, ...additionalPayload }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching master data for ${doctype}:`, error);
    throw error;
  }
};
