import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 4 & PRD
export const RegisterPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Pendaftaran Akun Baru" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4 text-center">Pendaftaran Akun Baru</h1>
      <p className="text-muted text-sm text-center">Kerangka tampilan untuk Pendaftaran Akun Baru.</p>
    </div>
  );
};
export default RegisterPage;
