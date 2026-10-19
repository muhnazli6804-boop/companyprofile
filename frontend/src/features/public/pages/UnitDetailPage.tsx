import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see PRD-Website-Yayasan-Padindi.md & DESIGN.md
export const UnitDetailPage: React.FC = () => {
  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <SeoHead title="Detail Unit Pendidikan" />
      <h1 className="text-3xl font-display font-bold text-primary mb-4">Detail Unit Pendidikan</h1>
      <p className="text-muted">Halaman kerangka untuk Detail Unit Pendidikan.</p>
    </div>
  );
};
export default UnitDetailPage;
