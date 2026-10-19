import { apiClient } from "@/lib/api-client";

export const getEducationUnitsData = () => apiClient.get("/admin/education-units");
