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
