import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see PRD §7.7, FR-080 s.d. FR-086 (iframe Looker Studio, hanya finance.view)
export const FinancePage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Keuangan" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Keuangan</h1>
      <p className="text-muted">Halaman manajemen untuk Dashboard Keuangan.</p>
    </div>
  );
};
export default FinancePage;
