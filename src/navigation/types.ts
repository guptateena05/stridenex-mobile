export type RootStackParamList = {
  Auth: undefined;
  Dashboard: undefined;
};

export type AuthStackParamList = {
  PublicTabs: undefined;
  Home: undefined;
  About: undefined;
  Offerings: undefined;
  Pathways: undefined;
  Solutions: undefined;
  Login: undefined;
  Signup: undefined;
  StudentOnboarding: undefined;
  // CollegeOnboarding: undefined;
  // IndustryOnboarding: undefined;
  // MentorOnboarding: undefined;
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
  WebOnboarding: { 
    url: string; 
    email?: string;
    sessionData?: {
      apiKey: string;
      apiSecret: string;
      email: string;
      isOnboarded: string;
      fullName: string;
    };
  };
};

export type DashboardStackParamList = {
  StudentDashboard: undefined;
  MentorDashboard: undefined;
  CollegeDashboard: undefined;
  IndustryDashboard: undefined;
};
