export interface IndustryRole {
  name?: string;
  role: string;
  duration: string | number;
  semester: string;
  description: string | null;
  available_positions: number;
}

export interface HiringRound {
  name?: string;
  round: string;
  based_on: string;
  duration: number;
}

export interface IndustryData {
  name?: string;
  company_name: string;
  about: string | null;
  business_type?: string;
  industry_sector?: string;
  headquarters?: string | null;
  employee_head_count?: string;
  cin?: string | null;
  gst_number?: string | null;
  turn_over_in_cr?: string | number | null;
  internship_per_year?: string | number | null;
  average_fresher_recruited_per_year?: string | number | null;
  company_website?: string | null;
  status?: string;
  specializations?: any[]; // Array of { specialization: string }
  location?: {
    address_line_1: string;
    address_line_2?: string;
    pincode: string;
    city?: string;
    district?: string;
    tahsil?: string;
    state?: string;
    country?: string;
    latitude?: number | null;
    longitude?: number | null;
    map_link?: string;
  };
  operating_hours?: Array<{
    day: string;
    opening_time: string;
    closing_time: string;
    is_closed: number;
  }>;
  required_roles?: IndustryRole[];
  hiring_process?: HiringRound[];
}
