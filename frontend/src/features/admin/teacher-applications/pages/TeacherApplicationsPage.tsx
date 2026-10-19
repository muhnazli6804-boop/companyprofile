import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 8-11
export const TeacherApplicationsPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Kelola Lamaran Guru" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Kelola Lamaran Guru</h1>
      <p className="text-muted">Halaman manajemen untuk Kelola Lamaran Guru.</p>
    </div>
  );
};
export default TeacherApplicationsPage;
