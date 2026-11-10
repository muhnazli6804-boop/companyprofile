// Bentuk respons GET /admin/dashboard (Rancangan-API-Padindi.md §8.1).
export interface DashboardPeriod {
  id: number;
  name: string;
  academic_year: string;
  wave: number;
  is_active: boolean;
}

export interface DashboardUnitCount {
  education_unit_id: number;
  name: string;
  students: number;
  teachers: number;
}

export interface DashboardQuota {
  education_unit_id: number;
  name: string;
  quota: number;
  filled: number;
  remaining: number;
}

export interface DashboardTrendDay {
  date: string; // YYYY-MM-DD
  students: number;
  teachers: number;
}

export interface DashboardData {
  period: DashboardPeriod | null;
  periods: Array<Pick<DashboardPeriod, 'id' | 'name' | 'is_active'>>;
  totals: { students: number; teachers: number };
  status_counts: { students: Record<string, number>; teachers: Record<string, number> };
  per_unit: DashboardUnitCount[];
  quota: DashboardQuota[];
  new_applicants: DashboardTrendDay[];
  unread_contact_messages: number;
  documents_pending: number;
}
