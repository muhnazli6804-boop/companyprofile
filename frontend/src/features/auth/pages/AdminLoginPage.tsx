import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 4 & PRD
export const AdminLoginPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Masuk Administrator" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4 text-center">Masuk Administrator</h1>
      <p className="text-muted text-sm text-center">Kerangka tampilan untuk Masuk Administrator.</p>
    </div>
  );
};
export default AdminLoginPage;
