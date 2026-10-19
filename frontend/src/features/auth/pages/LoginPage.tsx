import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 4 & PRD
export const LoginPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Masuk Akun" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4 text-center">Masuk Akun</h1>
      <p className="text-muted text-sm text-center">Kerangka tampilan untuk Masuk Akun.</p>
    </div>
  );
};
export default LoginPage;
