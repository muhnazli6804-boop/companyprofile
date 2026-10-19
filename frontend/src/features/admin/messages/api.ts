import { apiClient } from "@/lib/api-client";

export const getMessagesData = () => apiClient.get("/admin/messages");
