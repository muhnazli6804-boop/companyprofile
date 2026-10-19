import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 8-11
export const MessagesPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Pesan Kontak" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Pesan Kontak</h1>
      <p className="text-muted">Halaman manajemen untuk Pesan Kontak.</p>
    </div>
  );
};
export default MessagesPage;
