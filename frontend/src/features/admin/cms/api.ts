import { apiClient } from "@/lib/api-client";
import { SystemSettings } from "@/features/admin/settings/types";

export interface AdminPageItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  is_published: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export const getCmsData = () =>
  apiClient.get<{ data: SystemSettings }>("/admin/cms");

export const updateCmsData = (settings: Record<string, string>) =>
  apiClient.put<{ message: string }>("/admin/cms", { settings });

export const getAdminPosts = () => apiClient.get("/admin/posts");
export const getAdminGalleries = () => apiClient.get("/admin/galleries");
export const getAdminBanners = () => apiClient.get("/admin/banners");

export const getAdminPages = () =>
  apiClient.get<{ data: AdminPageItem[] }>("/admin/pages");

export const getAdminPage = (id: number | string) =>
  apiClient.get<{ data: AdminPageItem }>(`/admin/pages/${id}`);

export const createAdminPage = (data: Partial<AdminPageItem>) =>
  apiClient.post<{ message: string; data: AdminPageItem }>("/admin/pages", data);

export const updateAdminPage = (id: number | string, data: Partial<AdminPageItem>) =>
  apiClient.put<{ message: string; data: AdminPageItem }>(`/admin/pages/${id}`, data);

export const deleteAdminPage = (id: number | string) =>
  apiClient.delete<{ message: string }>(`/admin/pages/${id}`);

export const uploadCmsImage = (formData: FormData) =>
  apiClient.post("/admin/uploads/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
