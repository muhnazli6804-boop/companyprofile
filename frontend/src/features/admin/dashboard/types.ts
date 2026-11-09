export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  pending_students: number;
  pending_teachers: number;
  accepted_students: number;
  accepted_teachers: number;
}

export interface MonthlyData {
  month: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  label: string;
  count: number;
}

export interface RecentActivity {
  id: number;
  type: 'student' | 'teacher';
  name: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_by: string;
  created_at: string;
}

export interface RecentRegistration {
  id: number;
  type: 'student' | 'teacher';
  registration_number: string;
  name: string;
  date: string;
  status: string;
  status_label: string;
  created_at: string;
}

export interface DashboardData {
  stats: DashboardStats;
  student_monthly: MonthlyData[];
  teacher_monthly: MonthlyData[];
  student_status_distribution: StatusDistribution[];
  recent_activities: RecentActivity[];
  recent_registrations: RecentRegistration[];
}

