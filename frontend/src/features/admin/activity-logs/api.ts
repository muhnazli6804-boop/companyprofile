import { apiClient } from "@/lib/api-client";
import { ActivityLog } from "./types";

export const getActivityLogs = async (params?: { action?: string; user_id?: number | string; page?: number }) => {
  const response = await apiClient.get<{
    data: ActivityLog[];
    meta: { current_page: number; last_page: number; total: number };
  }>("/admin/activity-logs", { params });
  return response.data;
};
