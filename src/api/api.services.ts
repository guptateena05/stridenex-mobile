import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "https://devstridenex.quantcloud.in/api/";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchProjectDetails = async (doctype: string) => {
  try {
    const response = await api.get(
      `method/quantlis_management.api.get_doctype_json`,
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

export const fetchBackgroundImage = async () => {
  try {
    const response = await api.get(
      `method/quantlis_management.api.get_background_image`
    );

    return response.data.message.background_image;
  } catch (error) {
    console.error("Error fetching background image:", error);
    throw new Error("Failed to fetch background image");
  }
};
