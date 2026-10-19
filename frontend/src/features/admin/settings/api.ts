import { apiClient } from "@/lib/api-client";

export const getSettingsData = () => apiClient.get("/admin/settings");
