export interface DocumentRequirement {
  id: number;
  applicant_type: "student" | "teacher";
  education_unit_id: number | null;
  document_type: string;
  label: string;
  description: string | null;
  is_required: boolean;
  max_size_kb: number;
  allowed_mimes: string;
  max_files: number;
  sort_order: number;
  is_active: boolean;
  education_unit?: {
    id: number;
    name: string;
    code: string;
    level: string;
  } | null;
}

export interface DocumentRequirementPayload {
  applicant_type: "student" | "teacher";
  education_unit_id?: number | null;
  document_type: string;
  label: string;
  description?: string;
  is_required?: boolean;
  max_size_kb?: number;
  allowed_mimes?: string;
  max_files?: number;
  sort_order?: number;
  is_active?: boolean;
}

