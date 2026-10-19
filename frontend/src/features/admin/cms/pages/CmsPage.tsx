import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 8-11
export const CmsPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Manajemen Konten (CMS)" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Manajemen Konten (CMS)</h1>
      <p className="text-muted">Halaman manajemen untuk Manajemen Konten (CMS).</p>
    </div>
  );
};
export default CmsPage;
