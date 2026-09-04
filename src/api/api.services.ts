import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "https://devstridenex.quantcloud.in/api/";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 600000,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  async (config) => {
    try {
      if (__DEV__) {
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
          config.params || config.data || ""
        );
      }

      console.log("BEFORE TOKEN FETCH");

      const storedToken = await AsyncStorage.getItem("token");
      const token = storedToken ? storedToken.trim() : null;

      if (__DEV__) {
        console.log("AFTER TOKEN FETCH", token ? "Token exists" : "No token");
      }

      if (token) {
        config.headers.Authorization = `token ${token}`;
      }

      return config;
    } catch (error) {
      console.log("REQUEST INTERCEPTOR ERROR", error);
      return config;
    }
  },
  (error) => {
    console.log("REQUEST ERROR", error);
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API SUCCESS] ${response.config.url}`,
      response.status
    );

    if (response.data?.message?.success === false || response.data?.success === false) {
      const errorMessage = response.data?.message?.message || response.data?.message || "Operation failed";
      const customError = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      (customError as any).status = 400; // Mock status
      (customError as any).response = { data: response.data };
      return Promise.reject(customError);
    }

    return response;
  },
  (error) => {
    console.log("API RESPONSE ERROR");

    if (error.response) {
      console.log("STATUS:", error.response.status);
      console.log("DATA:", error.response.data);

      const data = error.response.data;
      let serverMessage = null;

      // Extract server message from Frappe response structure
      if (data.exception && (data.exc_type === "ValidationError" || String(data.exception).includes("ValidationError"))) {
        const excStr = String(data.exception);
        const index = excStr.indexOf(":");
        serverMessage = index !== -1 ? excStr.slice(index + 1).trim() : excStr;
      }

      if (!serverMessage && data._server_messages) {
        try {
          const messages = typeof data._server_messages === 'string' ? JSON.parse(data._server_messages) : data._server_messages;
          if (Array.isArray(messages)) {
            serverMessage = messages.map((m: any) => {
              const msgObj = typeof m === 'string' ? JSON.parse(m) : m;
              return msgObj?.message;
            }).filter(Boolean).join(", ");
          }
        } catch (e) {
          console.error("Error parsing _server_messages", e);
        }
      }

      if (!serverMessage && data.exception) {
        const excStr = String(data.exception);
        const index = excStr.indexOf(":");
        serverMessage = index !== -1 ? excStr.slice(index + 1).trim() : excStr;
      }

      if (!serverMessage) {
        if (data.message && data.message.success === false && data.message.message) {
          serverMessage = data.message.message;
        } else {
          serverMessage = data.message || (data.exc && typeof data.exc === 'string' && !data.exc.includes("Traceback") ? data.exc : null);
        }
      }

      // Strip HTML tags from message
      if (serverMessage && typeof serverMessage === 'string') {
        serverMessage = serverMessage.replace(/<[^>]*>/g, '').trim();
      }

      // Cleanup common raw database errors
      if (serverMessage && typeof serverMessage === 'string') {
        if (serverMessage.includes("Data too long for column")) {
          const match = serverMessage.match(/column '([^']+)'/);
          const columnName = match ? match[1] : "one of the fields";
          serverMessage = `The content in the '${columnName}' field is too long. Please shorten it.`;
        } else if (serverMessage.includes("Duplicate entry")) {
          const match = serverMessage.match(/for key '([^']+)'/);
          const keyName = match ? match[1] : "this value";
          serverMessage = `This ${keyName.includes('primary') ? 'record' : keyName} already exists. Please use a unique value.`;
        } else if (serverMessage.startsWith("(") && serverMessage.endsWith(")")) {
          const parts = serverMessage.match(/\(([^,]+),\s*"([^"]+)"\)/);
          if (parts && parts[2]) {
            serverMessage = parts[2];
          }
        }
      }

      if (serverMessage && typeof serverMessage === 'string') {
        error.message = serverMessage;
      }
    }

    if (error.request) {
      console.log("REQUEST:", error.request);
    }

    console.log("MESSAGE:", error.message);

    return Promise.reject(error);
  }
);

// FETCH PROJECT DETAILS
export const fetchProjectDetails = async (doctype: string) => {
  try {
    const response = await api.get(
      "method/quantlis_management.api.get_doctype_json",
      {
        params: { doctype },
      }
    );

    return response.data.message;
  } catch (error) {
    console.error("Error fetching doctype:", error);
    throw new Error("Failed to fetch doctype");
  }
};

// FETCH BACKGROUND IMAGE
export const fetchBackgroundImage = async () => {
  try {
    const response = await api.get(
      "method/quantlis_management.api.get_background_image"
    );

    return response.data.message.background_image;
  } catch (error) {
    console.error("Error fetching background image:", error);
    throw new Error("Failed to fetch background image");
  }
};

export const getSkillScore = async (data: { student: string }) => {
  try {
    const response = await api.post("method/nexedu.skill_ledger.doctype.student_skill.student_skill.get_skill_score", data);
    return response.data;
  } catch (error) {
    console.error("Error fetching skill score:", error);
    throw error;
  }
};

export const createCategory = async (data: { category_name: string, description: string, parent_category: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.create_category", data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const createPost = async (data: { community: string, user: string, content: string, post_type: string, category: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.create_post", data);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getPosts = async (data: { community: string, category: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.get_posts", data);
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const getPostDetail = async (data: { post: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.get_post_detail", data);
    return response.data;
  } catch (error) {
    console.error("Error fetching post details:", error);
    throw error;
  }
};

export const postComment = async (data: { post: string, comment: string, parent_comment: string, student: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.post_comment", data);
    return response.data;
  } catch (error) {
    console.error("Error posting comment:", error);
    throw error;
  }
};

export const toggleCommentLike = async (data: { comment: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.toggle_comment_like", data);
    return response.data;
  } catch (error) {
    console.error("Error toggling comment like:", error);
    throw error;
  }
};

export const getCommunities = async (data: { user: string, user_type?: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.get_communities", data);
    return response.data;
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
};

export const joinCommunity = async (data: { community: string, student: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.join_community", data);
    return response.data;
  } catch (error) {
    console.error("Error joining community:", error);
    throw error;
  }
};

export const leaveCommunity = async (data: { community: string, student: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.leave_community", data);
    return response.data;
  } catch (error) {
    console.error("Error leaving community:", error);
    throw error;
  }
};

export const createTag = async (data: { title: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.create_tag", data);
    return response.data;
  } catch (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
};

export const getCommunityDetail = async (data: { community: string }) => {
  try {
    const response = await api.post("method/stridenex_app.stridenex_app.doctype.community.community.get_community", data);
    return response.data;
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
};

export const buildProfileImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const baseDomain = BASE_URL.replace(/\/api\/?$/, "");
  return `${baseDomain}${url}`;
};

export const uploadProfilePicture = async (file: any): Promise<{ file_url: string; file_name: string }> => {
  const token = await AsyncStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${BASE_URL}method/stridenex_app.api_stridenex_app.app.upload_profile_picture`,
    {
      method: "POST",
      headers: {
        ...(token && token !== 'dummy-token' ? { Authorization: `token ${token}` } : {}),
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok || data?.http_status_code >= 400) {
    const msg = data?.message || data?.exception || `Upload failed (HTTP ${response.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  const payload = data?.data ?? data?.message ?? data;
  if (!payload?.file_url) {
    // If it's a string, maybe it's just the URL directly?
    if (typeof payload === 'string') {
      return { file_url: payload, file_name: payload };
    }
    throw new Error("Upload succeeded but no file URL was returned");
  }

  return { file_url: payload.file_url, file_name: payload.file_name };
};

export const uploadFileApi = async (
  file: any,
  doctype: string = "Student",
  docname: string = "",
  fieldname: string = "marksheet"
): Promise<{ file_url: string; file_name: string }> => {
  const token = await AsyncStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);
  if (doctype) formData.append("doctype", doctype);
  if (docname) formData.append("docname", docname);
  if (fieldname) formData.append("fieldname", fieldname);
  formData.append("is_private", "0");

  const response = await fetch(
    `${BASE_URL}method/stridenex_app.api_stridenex_app.app.upload_file_api`,
    {
      method: "POST",
      headers: {
        ...(token && token !== 'dummy-token' ? { Authorization: `token ${token}` } : {}),
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok || data?.http_status_code >= 400) {
    const msg = data?.message?.message || (typeof data?.message === 'string' ? data.message : null) || data?.exception || `Upload failed (HTTP ${response.status})`;
    throw new Error(msg);
  }

  const fileUrl = data?.data?.file_url || data?.message?.file_url || data?.file_url;
  const fileName = data?.data?.file_name || data?.message?.file_name || data?.file_name;

  if (!fileUrl) {
    throw new Error("Upload succeeded but no file URL was returned");
  }

  return { file_url: fileUrl, file_name: fileName || fileUrl };
};

export const getProfilePicture = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem("token");
  if (!token || token === 'dummy-token') return null;

  try {
    const response = await fetch(
      `${BASE_URL}method/stridenex_app.api_stridenex_app.app.get_profile_picture`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data?.data?.user_image ?? data?.message?.user_image ?? null;
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return null;
  }
};

export const updateCommunityMemberStatus = async (params: { name: string; status: string }) => {
  const response = await api.post("method/stridenex_app.stridenex_app.doctype.community_member.community_member.update_community_member_status", params);
  return response.data;
};
