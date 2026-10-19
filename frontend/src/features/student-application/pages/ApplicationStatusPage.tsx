import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 5
export const ApplicationStatusPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Status Pendaftaran Siswa" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Status Pendaftaran Siswa</h1>
      <p className="text-muted">Halaman kerangka untuk Status Pendaftaran Siswa.</p>
    </div>
  );
};
export default ApplicationStatusPage;
