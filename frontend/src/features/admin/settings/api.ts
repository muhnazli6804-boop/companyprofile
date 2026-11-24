import { apiClient } from "@/lib/api-client";
import { SystemSettings } from "./types";

export const getSettings = async () => {
  try {
    const response = await apiClient.get<{ data: SystemSettings }>("/admin/settings");
    return response.data.data;
  } catch (err: any) {
    if (err?.response?.status === 403 || err?.response?.status === 404) {
      const cmsResponse = await apiClient.get<{ data: SystemSettings }>("/admin/cms");
      return cmsResponse.data.data;
    }
    throw err;
  }
};

export const updateSettings = async (settings: Record<string, string>) => {
  try {
    const response = await apiClient.put<{ message: string }>("/admin/settings", { settings });
    return response.data;
  } catch (err: any) {
    if (err?.response?.status === 403 || err?.response?.status === 404) {
      const cmsResponse = await apiClient.put<{ message: string }>("/admin/cms", { settings });
      return cmsResponse.data;
    }
    throw err;
  }
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
