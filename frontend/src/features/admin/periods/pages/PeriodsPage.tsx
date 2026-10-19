import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 8-11
export const PeriodsPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Kelola Periode & Kuota" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Kelola Periode & Kuota</h1>
      <p className="text-muted">Halaman manajemen untuk Kelola Periode & Kuota.</p>
    </div>
  );
};
export default PeriodsPage;
