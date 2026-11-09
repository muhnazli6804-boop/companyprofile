import { apiClient } from "@/lib/api-client";
import { ReportSummary } from "./types";

export const getReportSummary = async (params?: { registration_period_id?: string | number }) => {
  const response = await apiClient.get<{ data: ReportSummary }>("/admin/reports/summary", { params });
  return response.data.data;
};

