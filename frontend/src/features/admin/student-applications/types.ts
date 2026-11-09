export interface AdminStudentApplication {
  id: number;
  registration_number: string;
  status: string;
  status_label: string;
  current_step: number;
  track: string;
  admin_note: string | null;
  reviewed_at: string | null;
  reviewer?: { id: number; name: string; email: string } | null;
  period?: { id: number; name: string; academic_year: string } | null;
  unit?: { id: number; code: string; name: string; slug: string; level: string } | null;
  user?: { id: number; name: string; email: string; phone?: string } | null;
  student?: {
    id: number;
    full_name: string;
    gender: 'L' | 'P';
    birth_place: string;
    birth_date: string;
    nik: string;
    nisn?: string;
    religion?: string;
    address: string;
    village?: string;
    district?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    phone?: string;
    previous_school?: string;
    previous_school_npsn?: string;
    graduation_year?: number;
  } | null;
  guardians?: Array<{
    id: number;
    relationship: 'father' | 'mother' | 'guardian';
    full_name: string;
    nik: string;
    birth_year?: number;
    education_level?: string;
    occupation?: string;
    income_range?: string;
    phone: string;
    email?: string;
    address?: string;
    is_primary_contact: boolean;
  }>;
  documents?: Array<{
    id: number;
    document_type: string;
    sequence: number;
    original_name: string;
    mime_type?: string;
    size_bytes: number;
    verification_status: 'pending' | 'valid' | 'invalid';
    verification_note?: string | null;
    verified_at?: string | null;
    created_at: string;
  }>;
  status_logs?: Array<{
    id: number;
    from_status: string | null;
    to_status: string;
    note: string | null;
    changed_by: { id: number; name: string } | null;
    created_at: string;
  }>;
  declaration_accepted_at?: string | null;
  consent_accepted_at?: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentFilterParams {
  search?: string;
  status?: string;
  education_unit_id?: number | string;
  registration_period_id?: number | string;
  track?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  include_draft?: boolean;
}

