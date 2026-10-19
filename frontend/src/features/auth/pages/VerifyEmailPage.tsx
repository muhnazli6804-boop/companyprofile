import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 4 & PRD
export const VerifyEmailPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Verifikasi Email" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4 text-center">Verifikasi Email</h1>
      <p className="text-muted text-sm text-center">Kerangka tampilan untuk Verifikasi Email.</p>
    </div>
  );
};
export default VerifyEmailPage;
