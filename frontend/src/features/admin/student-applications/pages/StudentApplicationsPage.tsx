import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 8-11
export const StudentApplicationsPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Kelola Pendaftaran Siswa" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Kelola Pendaftaran Siswa</h1>
      <p className="text-muted">Halaman manajemen untuk Kelola Pendaftaran Siswa.</p>
    </div>
  );
};
export default StudentApplicationsPage;
