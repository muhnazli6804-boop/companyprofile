export interface ReportSummary {
  active_period: {
    id: number;
    name: string;
    academic_year: string;
    wave: number;
    is_active: boolean;
  } | null;
  periods: Array<{
    id: number;
    name: string;
    academic_year: string;
    wave: number;
    is_active: boolean;
  }>;
  students: {
    total: number;
    submitted: number;
    verified: number;
    waiting: number;
    accepted: number;
    rejected: number;
  };
  teachers: {
    total: number;
    submitted: number;
    interview: number;
    waiting: number;
    accepted: number;
    rejected: number;
  };
  unit_breakdown: Array<{
    unit_id: number;
    unit_name: string;
    unit_code: string;
    level: string;
    quota: number | null;
    students_total: number;
    students_accepted: number;
    students_rejected: number;
    students_waiting: number;
    teachers_total: number;
    teachers_accepted: number;
    teachers_rejected: number;
  }>;
}

