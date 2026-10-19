import { apiClient } from "@/lib/api-client";

export const getStudentApplicationsData = () => apiClient.get("/admin/student-applications");
