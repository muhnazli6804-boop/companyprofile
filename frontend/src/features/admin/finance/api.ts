import { apiClient } from "@/lib/api-client";

export interface FinanceConfig {
  enabled: boolean;
  title: string;
  url: string;
}

export interface FinanceDashboard {
  enabled: boolean;
  title: string;
  url: string | null;
  config: FinanceConfig | null; // hanya diisi untuk Super Admin
}

export const getFinanceDashboard = async () => {
  const response = await apiClient.get<{ data: FinanceDashboard }>("/admin/finance-dashboard");
  return response.data.data;
};

export const updateFinanceDashboard = async (config: FinanceConfig) => {
  const response = await apiClient.put<{ message: string }>("/admin/finance-dashboard", config);
  return response.data;
};
