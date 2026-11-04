export interface StudentData {
  id?: number;
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
}

export interface GuardianData {
  id?: number;
  relationship: 'father' | 'mother' | 'guardian';
  full_name: string;
  nik?: string;
  birth_year?: number;
  education_level?: string;
  occupation?: string;
  income_range?: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary_contact?: boolean;
}

export interface DocumentItem {
  id: number;
  document_type: string;
  sequence: number;
  original_name: string;
  size_bytes: number;
  verification_status: string;
  created_at: string;
}

export interface RequirementItem {
  document_type: string;
  label: string;
  description?: string;
  is_required: boolean;
  max_size_kb: number;
  allowed_mimes: string;
  is_uploaded: boolean;
  document?: DocumentItem | null;
}

export interface StudentApplication {
  id: number;
  registration_number?: string | null;
  status: string;
  current_step: number;
  track?: string | null;
  period?: { id: number; name: string; academic_year: string } | null;
  unit?: { id: number; code: string; name: string; slug: string; level: string } | null;
  student?: StudentData | null;
  guardians: GuardianData[];
  documents: DocumentItem[];
  declaration_accepted_at?: string | null;
  consent_accepted_at?: string | null;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StatusHistoryItem {
  id: number;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_by: string;
  created_at: string;
}
