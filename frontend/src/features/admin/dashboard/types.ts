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

export interface GuruMetrics {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_galleries: number;
  my_messages_total: number;
  my_messages_unread: number;
  my_activity_logs_count: number;
  recent_posts: Array<{
    id: number;
    title: string;
    slug: string;
    post_category_id: number;
    status: string;
    created_at: string;
    category?: { id: number; name: string };
  }>;
  recent_galleries: Array<{
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    event_date: string | null;
    created_at: string;
  }>;
  recent_messages: Array<{
    id: number;
    name: string;
    subject: string | null;
    status: string;
    created_at: string;
  }>;
  recent_activities: Array<{
    id: number;
    action: string;
    subject_type: string | null;
    created_at: string;
  }>;
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
  guru_metrics?: GuruMetrics | null;
}

