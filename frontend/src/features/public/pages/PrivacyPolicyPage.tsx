import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see PRD-Website-Yayasan-Padindi.md & DESIGN.md
export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <SeoHead title="Kebijakan Privasi" />
      <h1 className="text-3xl font-display font-bold text-primary mb-4">Kebijakan Privasi</h1>
      <p className="text-muted">Halaman kerangka untuk Kebijakan Privasi.</p>
    </div>
  );
};
export default PrivacyPolicyPage;
