export interface TeacherEducationItem {
  id?: number;
  level: string;
  institution: string;
  major?: string;
  graduation_year?: number;
  gpa?: number;
  sort_order?: number;
}

export interface TeacherExperienceItem {
  id?: number;
  institution: string;
  position: string;
  start_date: string;
  end_date?: string | null;
  description?: string;
  sort_order?: number;
}

export interface TeacherCertificationItem {
  id?: number;
  name: string;
  issuer?: string;
  certificate_number?: string;
  year?: number;
}

export interface TeacherDocumentItem {
  id: number;
  document_type: string;
  sequence: number;
  original_name: string;
  size_bytes: number;
  verification_status: string;
  created_at: string;
}

export interface TeacherRequirementItem {
  document_type: string;
  label: string;
  description?: string;
  is_required: boolean;
  max_size_kb: number;
  allowed_mimes: string;
  is_uploaded: boolean;
  document?: TeacherDocumentItem | null;
}

export interface TeacherApplication {
  id: number;
  applied_position: string;
  registration_number?: string | null;
  status: string;
  current_step: number;
  unit?: { id: number; name: string; slug: string } | null;
  vacancy?: { id: number; title: string } | null;
  full_name: string;
  gender: 'L' | 'P';
  birth_place: string;
  birth_date: string;
  nik?: string;
  religion?: string;
  phone: string;
  masked_phone?: string;
  email: string;
  address: string;
  city?: string;
  province?: string;
  postal_code?: string;
  teaching_subjects: string[];
  cover_letter?: string | null;
  educations: TeacherEducationItem[];
  experiences: TeacherExperienceItem[];
  certifications: TeacherCertificationItem[];
  documents: TeacherDocumentItem[];
  declaration_accepted_at?: string | null;
  consent_accepted_at?: string | null;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherStatusHistoryItem {
  id: number;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_by: string;
  created_at: string;
}
