export interface EducationUnit {
  id: number;
  name: string;
  code: string;
  slug: string;
  level: string;
  tagline?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website_url?: string | null;
  logo_path?: string | null;
  cover_path?: string | null;
  accreditation?: string | null;
  principal_name?: string | null;
  facilities?: string[] | null;
  programs?: string[] | null;
  is_active: boolean;
  sort_order?: number;
  student_applications_count?: number;
  teacher_applications_count?: number;
  teacher_vacancies_count?: number;
}

export interface EducationUnitPayload {
  name: string;
  code: string;
  level: string;
  tagline?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  accreditation?: string;
  principal_name?: string;
  facilities?: string[];
  programs?: string[];
  is_active?: boolean;
  sort_order?: number;
}

