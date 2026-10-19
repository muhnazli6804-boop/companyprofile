import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 8-11
export const UsersRolesPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Pengguna & Hak Akses" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Pengguna & Hak Akses</h1>
      <p className="text-muted">Halaman manajemen untuk Pengguna & Hak Akses.</p>
    </div>
  );
};
export default UsersRolesPage;
