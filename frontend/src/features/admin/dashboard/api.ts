import { apiClient } from "@/lib/api-client";

export const getDashboardAdminData = () => apiClient.get("/admin/dashboard");
