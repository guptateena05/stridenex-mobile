import { api } from "./api.services";

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
}

export interface TicketDetail {
  ticket_id: string;
  subject: string;
  description: string;
  status: "Open" | "Replied" | "In Progress" | "Resolved" | "Closed" | string;
  priority: "Low" | "Medium" | "High" | "Urgent" | string;
  created_at: string;
  comments: TicketComment[];
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  priority?: "Low" | "Medium" | "High" | "Urgent" | string;
}

export interface AddCommentPayload {
  ticket_id: string;
  message: string;
}

export const ticketService = {
  // 1. Create Support Ticket
  createTicket: async (payload: CreateTicketPayload) => {
    const response = await api.post(
      "method/stridenex_app.api_stridenex_app.ticket.create_ticket",
      {
        subject: payload.subject.trim(),
        description: payload.description.trim(),
        priority: payload.priority || "Medium",
      }
    );
    return response.data;
  },

  // 2. Get My Raised Tickets (List View)
  getMyTickets: async () => {
    const response = await api.get(
      "method/stridenex_app.api_stridenex_app.ticket.get_my_tickets"
    );
    return response.data;
  },

  // 3. Get Ticket Details & Conversation (Chat View)
  getTicketDetails: async (ticketId: string) => {
    const response = await api.get(
      `method/stridenex_app.api_stridenex_app.ticket.get_ticket_details`,
      { params: { ticket_id: ticketId } }
    );
    return response.data;
  },

  // 4. Reply to Ticket / Add Comment
  addTicketComment: async (payload: AddCommentPayload) => {
    const response = await api.post(
      "method/stridenex_app.api_stridenex_app.ticket.add_ticket_comment",
      {
        ticket_id: payload.ticket_id,
        message: payload.message.trim(),
      }
    );
    return response.data;
  },
};
