import { apiClient } from "@/lib/api-client";

export const getActivityLogsData = () => apiClient.get("/admin/activity-logs");
