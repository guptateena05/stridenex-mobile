import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "https://devstridenex.quantcloud.in/api/";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
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

      const token = await AsyncStorage.getItem("token");

      console.log("AFTER TOKEN FETCH", token);

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

    return response;
  },
  (error) => {
    console.log("API RESPONSE ERROR");

    if (error.response) {
      console.log("STATUS:", error.response.status);
      console.log("DATA:", error.response.data);
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