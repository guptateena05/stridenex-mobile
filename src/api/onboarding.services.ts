import { api } from "./api.services";

export interface College {
    name: string;
    college_name: string;
    status: string;
    registration_number: string;
    approved_status: string;
    college_code: string | null;
    university: string | null;
    college_type: string | null;
    website: string | null;
    is_active: number;
    country: string | null;
    state: string | null;
    district: string | null;
    city: string | null;
    taluka: string | null;
    approved_status_workflow: string | null;
    tahsil: string | null;
}

export interface CreateStudentPayload {
  first_name: string;
  last_name: string;
  mobile_no: string;
  email_id: string;
  stream: string;
  courses_type: Array<{ course_type: string }>;
  college: string;
  course: string;
  department: string;
  academic_year: string;
  semester: string;
  date_of_birth: string;
  skill: Array<{ skill: string }>;
  career_interest: Array<{ career_interest: string }>;
  github?: string;
  linkedin?: string;
  resume?: { uri: string; type: string; name: string } | null;
}

export interface OtpResponse {
    message: string;
    data?: string;
}

export interface EmailOtpResponse {
    message: {
        status: string;
        message: string;
    };
}

export interface OtpVerification {
    message: string;
    data: {
        success: boolean;
    };
}

// Send mobile OTP
export const sendMobileOTP = async (mobileNo: string): Promise<OtpResponse> => {
    try {
        const response = await api.get(
            `method/stridenex_app.api_stridenex_app.app.send_mobile_otp`,
            {
                params: {
                    mobile_no: mobileNo
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error sending mobile OTP:", error);
        throw error;
    }
};

// Verify mobile OTP
export const verifyMobileOTP = async (mobileNo: string, otp: string): Promise<any> => {
    try {
        const response = await api.get(
            `method/stridenex_app.api_stridenex_app.app.validate_mobile_otp?mobile_no=${encodeURIComponent(mobileNo)}&otp=${encodeURIComponent(otp)}`
        );
        return response.data;
    } catch (error) {
        console.error("Error verifying mobile OTP:", error);
        throw error;
    }
};

// Send email OTP
export const sendEmailOTP = async (email: string): Promise<EmailOtpResponse> => {
    try {
        const response = await api.get(
            `method/stridenex_app.api_stridenex_app.app.send_email_otp?email=${encodeURIComponent(email)}`
        );
        return response.data;
    } catch (error) {
        console.error("Error sending email OTP:", error);
        throw error;
    }
};

// Verify email OTP
export const verifyEmailOTP = async (email: string, otp: string): Promise<any> => {
    try {
        const response = await api.get(
            `method/stridenex_app.api_stridenex_app.app.validate_email_otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
        );
        return response.data;
    } catch (error) {
        console.error("Error verifying email OTP:", error);
        throw error;
    }
};

export const createStudent = async (payload: any) => {
  try {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(payload).forEach(key => {
      const value = payload[key];
      
      if (value === null || value === undefined) return;
      
      // Handle file upload for resume (React Native format)
      if (key === 'resume' && value && typeof value === 'object') {
        formData.append('resume', {
          uri: value.uri,
          type: value.type || 'application/pdf',
          name: value.name || 'resume.pdf',
        } as any);
      } 
      // Handle arrays that need to be sent as JSON strings
      else if (key === 'courses_type' || key === 'skill' || key === 'career_interest') {
        formData.append(key, JSON.stringify(value));
      } 
      // Handle all other fields
      else {
        formData.append(key, String(value));
      }
    });

    const response = await api.post(
      `method/stridenex_app.api_stridenex_app.student.student.create_student`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};
