import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 8-11
export const DashboardAdminPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Dashboard Administrator" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Dashboard Administrator</h1>
      <p className="text-muted">Halaman manajemen untuk Dashboard Administrator.</p>
    </div>
  );
};
export default DashboardAdminPage;
