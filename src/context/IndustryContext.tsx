import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getIndustryByEmail } from "@/api/industry.services";
import { useAuth } from "./AuthContext";
import { IndustryData } from "@/types/industry";

interface IndustryContextType {
  industryData: IndustryData | null;
  loading: boolean;
  error: string | null;
  refreshIndustryData: () => Promise<void>;
}

const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export const IndustryProvider = ({ children }: { children: React.ReactNode }) => {
  const { userName, role, isAuthenticated } = useAuth();
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIndustryData = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getIndustryByEmail(email);
      
      // Standardize response handling
      let data = null;
      if (response?.message?.status === 200 || response?.message?.status === "200") {
        data = Array.isArray(response.message.data) ? response.message.data[0] : response.message.data;
      } else if (response?.message && !response?.message?.status) {
        // Flat response case
        data = Array.isArray(response.message) ? response.message[0] : response.message;
      } else if (response?.data && !response?.message) {
         data = Array.isArray(response.data) ? response.data[0] : response.data;
      }

      if (data) {
        // Standardize keys (e.g., CIN to cin)
        if (data.CIN && !data.cin) data.cin = data.CIN;
        setIndustryData(data);
      } else {
        setError(response?.message?.message || "No industry data found");
      }
    } catch (err: any) {
      console.error("Error in IndustryProvider:", err);
      setError(err?.message || "An error occurred while fetching company profile details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && role === 'Industry' && userName) {
      fetchIndustryData(userName);
    } else if (!isAuthenticated || role !== 'Industry') {
      setIndustryData(null);
      setLoading(false);
    }
  }, [userName, role, isAuthenticated, fetchIndustryData]);

  const refreshIndustryData = async () => {
    if (userName) {
      await fetchIndustryData(userName);
    }
  };

  return (
    <IndustryContext.Provider
      value={{
        industryData,
        loading,
        error,
        refreshIndustryData,
      }}
    >
      {children}
    </IndustryContext.Provider>
  );
};

export const useIndustry = () => {
  const context = useContext(IndustryContext);
  if (context === undefined) {
    throw new Error("useIndustry must be used within an IndustryProvider");
  }
  return context;
};
