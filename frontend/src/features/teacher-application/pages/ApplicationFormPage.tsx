import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 6
export const ApplicationFormPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Formulir Lamaran Guru" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Formulir Lamaran Guru</h1>
      <p className="text-muted">Halaman kerangka untuk Formulir Lamaran Guru.</p>
    </div>
  );
};
export default ApplicationFormPage;
