export interface AdminTeacherApplication {
  id: number;
  applied_position: string;
  registration_number: string;
  status: string;
  status_label: string;
  current_step: number;
  admin_note: string | null;
  reviewed_at: string | null;
  reviewer?: { id: number; name: string; email: string } | null;
  unit?: { id: number; name: string; slug: string } | null;
  vacancy?: { id: number; title: string } | null;
  user?: { id: number; name: string; email: string; phone?: string } | null;
  full_name: string;
  gender: 'L' | 'P';
  birth_place: string;
  birth_date: string;
  nik: string;
  religion?: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  province?: string;
  postal_code?: string;
  teaching_subjects?: string[];
  cover_letter?: string;
  educations?: Array<{
    id: number;
    level: string;
    institution: string;
    major?: string;
    graduation_year?: number;
    gpa?: number;
  }>;
  experiences?: Array<{
    id: number;
    institution: string;
    position: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;
  certifications?: Array<{
    id: number;
    name: string;
    issuer?: string;
    certificate_number?: string;
    year?: number;
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

export interface TeacherFilterParams {
  search?: string;
  status?: string;
  education_unit_id?: number | string;
  teacher_vacancy_id?: number | string;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  include_draft?: boolean;
}

