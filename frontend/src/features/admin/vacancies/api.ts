import { apiClient } from "@/lib/api-client";

export const getVacanciesData = () => apiClient.get("/admin/vacancies");
