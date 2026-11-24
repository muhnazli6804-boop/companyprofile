import { apiClient } from "@/lib/api-client";
import { SystemSettings } from "@/features/admin/settings/types";

export const getCmsData = () =>
  apiClient.get<{ data: SystemSettings }>("/admin/cms");

export const updateCmsData = (settings: Record<string, string>) =>
  apiClient.put<{ message: string }>("/admin/cms", { settings });

export const getAdminPosts = () => apiClient.get("/admin/posts");
export const getAdminGalleries = () => apiClient.get("/admin/galleries");
export const getAdminBanners = () => apiClient.get("/admin/banners");
export const uploadCmsImage = (formData: FormData) =>
  apiClient.post("/admin/uploads/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
