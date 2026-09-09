import { api } from "./api.services";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingStatusResponse {
    is_first_login: boolean;
    is_onboarded: boolean;
    test_completed: boolean;
    has_completed_test: boolean;
    submission?: {
        name: string;
        psychometric_test: string;
        score: number;
        percentage: number;
        creation: string;
    } | null;
    test_screen?: {
        name: string;
        creation: string;
        docstatus: number;
    } | null;
}

export interface QuestionData {
    question: string;
    question_type: "Choices" | "User Input" | "Open Ended";
    subject: string;
    options?: string[];
    multiple_correct?: boolean | number;
    is_last?: boolean;
    no_of_options?: string;
    saved_response?: string | null;
    completed?: boolean;
}

export interface SubmitTestResult {
    status: string;
    result: string;
    job_score: number;
    startup_score: number;
    higher_ed_score: number;
    subject_scores: Record<string, number>;
    ai_result?: string | null;
}

export const checkOnboardingStatus = async (email?: string): Promise<OnboardingStatusResponse> => {
    try {
        const url = email 
            ? `method/nexedu.api.check_onboarding_status?email=${encodeURIComponent(email)}` 
            : `method/nexedu.api.check_onboarding_status`;
            
        const res = await api.get(url);
        const data = res.data;
        const message = data.message || { is_first_login: true, is_onboarded: false, test_completed: false, has_completed_test: false };

        if (email && !message.is_onboarded) {
            const localCompleted = await AsyncStorage.getItem(`psychometric_completed_${email}`);
            if (localCompleted === "true") {
                return { ...message, is_first_login: false, is_onboarded: true, test_completed: true, has_completed_test: true };
            }
        }
        return message;
    } catch (err) {
        console.warn("Could not check onboarding status", err);
        return { is_first_login: false, is_onboarded: false, test_completed: false, has_completed_test: false };
    }
};

export const getTests = async (): Promise<Array<{ name: string }>> => {
    try {
        const res = await api.get('method/nexedu.api.get_tests');
        return res.data.message || [];
    } catch (err) {
        console.error("Failed to get tests", err);
        return [];
    }
};

export const startNewTest = async (testType: string, email?: string): Promise<string> => {
    const res = await api.post('method/nexedu.api.start_new_test', {
        test_type: testType,
        email
    });
    return res.data.message;
};

export const loadQuestion = async (screenName: string): Promise<QuestionData> => {
    const res = await api.post('method/nexedu.api.load_question', {
        screen_name: screenName
    });
    return res.data.message;
};

export const nextQuestion = async (params: {
    screen_name: string;
    selected_option?: string | string[];
    user_input?: string;
    open_ended?: string;
}): Promise<QuestionData> => {
    const res = await api.post('method/nexedu.api.next_question', params);
    return res.data.message;
};

export const previousQuestion = async (screenName: string): Promise<QuestionData> => {
    const res = await api.post('method/nexedu.api.previous_question', {
        screen_name: screenName
    });
    return res.data.message;
};

export const submitTest = async (screenName: string, email?: string): Promise<SubmitTestResult> => {
    const res = await api.post('method/nexedu.api.submit_test', {
        name: screenName,
        email
    });
    
    if (email) {
        await AsyncStorage.setItem(`psychometric_completed_${email}`, "true");
    }
    
    return res.data.message;
};
