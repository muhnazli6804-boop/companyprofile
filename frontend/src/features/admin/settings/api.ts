import { apiClient } from "@/lib/api-client";
import { SystemSettings } from "./types";

export const getSettings = async () => {
  const response = await apiClient.get<{ data: SystemSettings }>("/admin/settings");
  return response.data.data;
};

export const updateSettings = async (settings: Record<string, string>) => {
  const response = await apiClient.put<{ message: string }>("/admin/settings", { settings });
  return response.data;
};

export const uploadLogo = async (file: File) => {
  const formData = new FormData();
  formData.append("logo", file);
  const response = await apiClient.post<{ message: string; data: { logo_url: string; path: string } }>(
    "/admin/settings/logo",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};
