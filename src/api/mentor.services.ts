import { api } from "./api.services";

export const getMentorByEmail = async (email: string) => {
  try {
    const response = await api.post(
      "method/stridenex_app.api_stridenex_app.mentor.mentor.get_mentor_by_email",
      { email_id: email }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor by email:", error);
    throw error;
  }
};

export const getMentorDashboardStats = async (mentor: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.get_mentor_dashboard_stats?mentor=${encodeURIComponent(mentor)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor dashboard stats:", error);
    throw error;
  }
};

export const getUpcomingSessions = async (mentor: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.get_upcoming_sessions?mentor=${encodeURIComponent(mentor)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching upcoming sessions:", error);
    throw error;
  }
};

export const getPendingRequests = async (mentor: string, limit?: number) => {
  try {
    let url = `method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.get_pending_requests?mentor=${encodeURIComponent(mentor)}`;
    if (limit) url += `&limit=${limit}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor pending requests:", error);
    throw error;
  }
};

export const getMentorPendingVerifications = async (mentor: string, limit: number) => {
  try {
    const response = await api.post(
      "method/nexedu.skill_ledger.doctype.skill_evidence.skill_evidence.get_mentor_pending_verifications",
      { mentor, limit }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor pending verifications:", error);
    throw error;
  }
};

export const rescheduleSession = async (payload: { session_name: string; new_date: string; new_from_time: string; new_to_time: string; mentor?: string; student?: string }) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.reschedule_session",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error rescheduling session:", error);
    throw error;
  }
};

export const updateMentor = async (email: string, payload: any) => {
  try {
    const response = await api.put(
      `method/stridenex_app.api_stridenex_app.mentor.mentor.update_mentor?email_id=${encodeURIComponent(email)}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating mentor profile:", error);
    throw error;
  }
};

export const getMentorOfferings = async (mentor: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.mentor_offering.mentor_offering.get_mentor_offerings?mentor=${encodeURIComponent(mentor)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor offerings:", error);
    throw error;
  }
};

export const createMentorOffering = async (payload: any) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_offering.mentor_offering.create_mentor_offering",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error creating mentor offering:", error);
    throw error;
  }
};

export const updateMentorOffering = async (name: string, payload: any) => {
  try {
    const response = await api.put(
      `method/stridenex_app.stridenex_app.doctype.mentor_offering.mentor_offering.update_mentor_offering?name=${encodeURIComponent(name)}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating mentor offering:", error);
    throw error;
  }
};

export const getSessionHistory = async (mentor: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.get_session_history?mentor=${encodeURIComponent(mentor)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching session history:", error);
    throw error;
  }
};

export const updateMentorStats = async (mentor: string) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking._update_mentor_stats",
      { mentor }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating mentor stats:", error);
    throw error;
  }
};

export const getSessionNote = async (session_name: string, student: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.get_session_note?session_name=${encodeURIComponent(session_name)}&student=${encodeURIComponent(student)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching session note:", error);
    throw error;
  }
};

export const saveSessionNotes = async (payload: { session_name: string; student: string; notes: string; shared_with_student: string }) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.save_session_notes",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error saving session notes:", error);
    throw error;
  }
};

export const emailSessionNoteToStudent = async (payload: { session_name: string; student: string; subject: string; message: string }) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.email_to_student",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error emailing session notes:", error);
    throw error;
  }
};


