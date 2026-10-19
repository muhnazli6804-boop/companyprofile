import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 8-11
export const DocumentRequirementsPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Kelola Syarat Dokumen" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Kelola Syarat Dokumen</h1>
      <p className="text-muted">Halaman manajemen untuk Kelola Syarat Dokumen.</p>
    </div>
  );
};
export default DocumentRequirementsPage;
