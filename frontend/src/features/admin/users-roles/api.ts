import { apiClient } from "@/lib/api-client";

export const getUsersRolesData = () => apiClient.get("/admin/users-roles");
