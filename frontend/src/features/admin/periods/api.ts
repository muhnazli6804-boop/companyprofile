import { apiClient } from "@/lib/api-client";

export const getPeriodsData = () => apiClient.get("/admin/periods");
