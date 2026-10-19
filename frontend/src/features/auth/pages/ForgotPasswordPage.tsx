import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 4 & PRD
export const ForgotPasswordPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Lupa Kata Sandi" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4 text-center">Lupa Kata Sandi</h1>
      <p className="text-muted text-sm text-center">Kerangka tampilan untuk Lupa Kata Sandi.</p>
    </div>
  );
};
export default ForgotPasswordPage;
