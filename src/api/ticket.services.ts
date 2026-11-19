import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, BASE_URL } from "./api.services";

export interface TicketAttachment {
  file_name: string;
  file_url: string;
  file_size?: number;
  uploaded_at?: string;
}

export interface TicketSummary {
  ticket_id: string;
  subject: string;
  status: "Open" | "Replied" | "In Progress" | "Resolved" | "Closed" | string;
  priority: "Low" | "Medium" | "High" | "Urgent" | string;
  creation: string;
  modified?: string;
}

export interface TicketComment {
  comment_id: string;
  comment_by: string;
  message: string;
  created_at: string;
  is_user: boolean;
  attachments?: TicketAttachment[];
}

export interface TicketDetail {
  ticket_id: string;
  subject: string;
  description: string;
  status: "Open" | "Replied" | "In Progress" | "Resolved" | "Closed" | string;
  priority: "Low" | "Medium" | "High" | "Urgent" | string;
  created_at: string;
  attachments?: TicketAttachment[];
  comments: TicketComment[];
}

export interface MobileFileAttachment {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  priority?: "Low" | "Medium" | "High" | "Urgent" | string;
  attachments?: MobileFileAttachment[];
}

export interface AddCommentPayload {
  ticket_id: string;
  message: string;
  attachments?: MobileFileAttachment[];
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem("token");
  if (token && token.trim() && token !== "dummy-token") {
    return {
      Authorization: `token ${token.trim()}`,
    };
  }
  return {};
};

export const ticketService = {
  // 1. Create Support Ticket (ALWAYS multipart/form-data via FormData)
  createTicket: async (payload: CreateTicketPayload) => {
    const formData = new FormData();
    formData.append("subject", payload.subject.trim());
    formData.append("description", payload.description.trim());
    formData.append("priority", payload.priority || "Low");

    if (payload.attachments && payload.attachments.length > 0) {
      payload.attachments.forEach((att, index) => {
        const fileObj = {
          uri: att.uri,
          name: att.name || "attachment",
          type: att.type || "application/octet-stream",
        } as any;
        if (index === 0) {
          formData.append("file", fileObj);
        }
        formData.append("attachments", fileObj);
      });
    }

    const authHeaders = await getAuthHeaders();
    const endpoint = `${BASE_URL}method/stridenex_app.api_stridenex_app.ticket.create_ticket`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...authHeaders,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || (data?.http_status_code && data.http_status_code >= 400)) {
      const msg = data?.message || data?.exception || `Failed to create ticket (${response.status})`;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    return data;
  },

  // 2. Get My Raised Tickets (List View)
  getMyTickets: async () => {
    const response = await api.get(
      "method/stridenex_app.api_stridenex_app.ticket.get_my_tickets"
    );
    return response.data;
  },

  // 3. Get Ticket Details & Full Conversation (Content-Type: application/json, body: {"ticket_id": "..."})
  getTicketDetails: async (ticketId: string) => {
    try {
      const response = await api.post(
        "method/stridenex_app.api_stridenex_app.ticket.get_ticket_details",
        { ticket_id: String(ticketId) }
      );
      return response.data;
    } catch {
      // Fallback to GET with params if server expects GET
      const fallback = await api.get(
        `method/stridenex_app.api_stridenex_app.ticket.get_ticket_details`,
        { params: { ticket_id: String(ticketId) } }
      );
      return fallback.data;
    }
  },

  // 4. Reply to Ticket / Add Comment (ALWAYS multipart/form-data via FormData)
  addTicketComment: async (payload: AddCommentPayload) => {
    const formData = new FormData();
    formData.append("ticket_id", String(payload.ticket_id));
    formData.append("message", payload.message.trim());

    if (payload.attachments && payload.attachments.length > 0) {
      payload.attachments.forEach((att, index) => {
        const fileObj = {
          uri: att.uri,
          name: att.name || "attachment",
          type: att.type || "application/octet-stream",
        } as any;
        if (index === 0) {
          formData.append("file", fileObj);
        }
        formData.append("attachments", fileObj);
      });
    }

    const authHeaders = await getAuthHeaders();
    const endpoint = `${BASE_URL}method/stridenex_app.api_stridenex_app.ticket.add_ticket_comment`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...authHeaders,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || (data?.http_status_code && data.http_status_code >= 400)) {
      const msg = data?.message || data?.exception || `Failed to add reply (${response.status})`;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    return data;
  },
};
