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

export const suggestAltTime = async (payload: { booking_name: string; alt_date: string; alt_time: string }) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.suggest_alt_time",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error suggesting alternate time:", error);
    throw error;
  }
};

export const acceptRequest = async (payload: { booking_name: string; from_time: string; to_time: string }) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.accept_request",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error accepting request:", error);
    throw error;
  }
};

export const declineRequest = async (payload: { booking_name: string }) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.decline_request",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error declining request:", error);
    throw error;
  }
};

export const verifyAndEndorseSkill = async (evidenceName: string) => {
  try {
    const response = await api.post(
      "method/nexedu.skill_ledger.doctype.skill_evidence.skill_evidence.verify_and_endorse_skill",
      { evidence_name: evidenceName }
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying and endorsing skill:", error);
    throw error;
  }
};

export const rejectSkillEvidence = async (evidenceName: string) => {
  try {
    const response = await api.post(
      "method/nexedu.skill_ledger.doctype.skill_evidence.skill_evidence.reject_skill_evidence",
      { evidence_name: evidenceName }
    );
    return response.data;
  } catch (error) {
    console.error("Error rejecting skill evidence:", error);
    throw error;
  }
};

export const getSlotCalendar = async (mentor: string) => {
  try {
    const response = await api.get(
      `method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.get_slot_calendar?mentor=${encodeURIComponent(mentor)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching slot calendar:", error);
    throw error;
  }
};

export const getWeeklyBookedSessions = async (mentor: string) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.get_weekly_booked_sessions",
      { mentor }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly booked sessions:", error);
    throw error;
  }
};

export const getMonthlyBookedSessions = async (mentor: string) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_session_booking.mentor_session_booking.get_monthly_booked_sessions",
      { mentor }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly booked sessions:", error);
    throw error;
  }
};

export const blockTime = async (payload: {
  mentor: string;
  date: string;
  from_time: string;
  to_time: string;
  reason: string;
}) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_blocked_time.mentor_blocked_time.block_time",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error blocking time:", error);
    throw error;
  }
};

export const saveMentorAvailability = async (payload: any) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_availability.mentor_availability.save_mentor_availability",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error saving mentor availability:", error);
    throw error;
  }
};

export const deleteMentorAvailability = async (mentor: string) => {
  try {
    const response = await api.post(
      "method/stridenex_app.stridenex_app.doctype.mentor_availability.mentor_availability.delete_mentor_availability",
      { mentor }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting mentor availability:", error);
    throw error;
  }
};


