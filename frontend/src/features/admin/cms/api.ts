import { apiClient } from "@/lib/api-client";

export const getCmsData = () => apiClient.get("/admin/cms");
