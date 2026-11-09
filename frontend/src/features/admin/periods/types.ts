export interface RegistrationPeriod {
  id: number;
  name: string;
  academic_year: string;
  wave: number;
  opens_at: string;
  closes_at: string;
  announcement_at: string | null;
  description: string | null;
  registration_fee: string | number;
  is_active: boolean;
  student_applications_count?: number;
  quotas?: PeriodQuota[];
}

export interface PeriodQuota {
  id?: number;
  registration_period_id?: number;
  education_unit_id: number;
  quota: number;
  education_unit?: {
    id: number;
    name: string;
    code: string;
    level: string;
  };
}

export interface RegistrationPeriodPayload {
  name: string;
  academic_year: string;
  wave?: number;
  opens_at: string;
  closes_at: string;
  announcement_at?: string;
  description?: string;
  registration_fee?: number;
  is_active?: boolean;
}

