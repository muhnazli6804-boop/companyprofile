import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 8-11
export const SettingsPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Pengaturan Situs" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Pengaturan Situs</h1>
      <p className="text-muted">Halaman manajemen untuk Pengaturan Situs.</p>
    </div>
  );
};
export default SettingsPage;
