import { apiClient } from "@/lib/api-client";

export const getTeacherApplicationsData = () => apiClient.get("/admin/teacher-applications");
