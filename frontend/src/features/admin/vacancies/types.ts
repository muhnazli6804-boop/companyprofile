export interface Vacancy {
  id: number;
  title: string;
  slug: string;
  education_unit_id: number | null;
  subject: string | null;
  employment_type: string | null;
  description: string | null;
  requirements: string | null;
  quota: number | null;
  opens_at: string | null;
  closes_at: string | null;
  is_published: boolean;
  created_at: string;
  applications_count?: number;
  education_unit?: {
    id: number;
    name: string;
    code: string;
    level: string;
  } | null;
}

export interface VacancyPayload {
  title: string;
  education_unit_id?: number | null;
  subject?: string;
  employment_type?: string;
  description?: string;
  requirements?: string;
  quota?: number;
  opens_at?: string;
  closes_at?: string;
  is_published?: boolean;
}

export interface VacancyFilterParams {
  search?: string;
  education_unit_id?: string | number;
  status?: string;
  page?: number;
  per_page?: number;
}

