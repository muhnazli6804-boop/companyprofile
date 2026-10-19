import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 6
export const ApplicationListPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Daftar Lamaran Guru" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Daftar Lamaran Guru</h1>
      <p className="text-muted">Halaman kerangka untuk Daftar Lamaran Guru.</p>
    </div>
  );
};
export default ApplicationListPage;
