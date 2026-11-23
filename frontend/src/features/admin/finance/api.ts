import { apiClient } from "@/lib/api-client";

export interface FinanceDashboard {
  enabled: boolean;
  title: string;
  url: string | null;
}

export const getFinanceDashboard = async () => {
  const response = await apiClient.get<{ data: FinanceDashboard }>("/admin/finance-dashboard");
  return response.data.data;
};
