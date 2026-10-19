import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";

// TODO: see Rancangan-API-Padindi.md section 8-11
export const ActivityLogsPage: React.FC = () => {
  return (
    <div>
      <SeoHead title="Log Aktivitas" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Log Aktivitas</h1>
      <p className="text-muted">Halaman manajemen untuk Log Aktivitas.</p>
    </div>
  );
};
export default ActivityLogsPage;
