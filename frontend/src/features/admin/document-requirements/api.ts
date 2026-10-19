import { apiClient } from "@/lib/api-client";

export const getDocumentRequirementsData = () => apiClient.get("/admin/document-requirements");
