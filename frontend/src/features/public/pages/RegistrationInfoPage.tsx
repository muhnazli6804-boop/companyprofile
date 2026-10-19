import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see PRD-Website-Yayasan-Padindi.md & DESIGN.md
export const RegistrationInfoPage: React.FC = () => {
  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <SeoHead title="Informasi Pendaftaran" />
      <h1 className="text-3xl font-display font-bold text-primary mb-4">Informasi Pendaftaran</h1>
      <p className="text-muted">Halaman kerangka untuk Informasi Pendaftaran.</p>
    </div>
  );
};
export default RegistrationInfoPage;
