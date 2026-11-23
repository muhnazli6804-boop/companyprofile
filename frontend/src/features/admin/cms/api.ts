import { apiClient } from "@/lib/api-client";

export const getCmsData = () => apiClient.get("/admin/settings");
export const getAdminPosts = () => apiClient.get("/admin/posts");
export const getAdminGalleries = () => apiClient.get("/admin/galleries");
export const getAdminBanners = () => apiClient.get("/admin/banners");
export const uploadCmsImage = (formData: FormData) =>
  apiClient.post("/admin/uploads/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
