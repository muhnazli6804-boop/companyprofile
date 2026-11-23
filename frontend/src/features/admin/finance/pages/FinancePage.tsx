import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ExternalLink } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { AdminPageHeader } from "@/components/admin";
import { getFinanceDashboard } from "../api";

export const FinancePage: React.FC = () => {
  const [frameFailed, setFrameFailed] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-finance-dashboard"],
    queryFn: getFinanceDashboard,
    refetchOnWindowFocus: false, // setiap fetch tercatat di log aktivitas
  });

  const title = data?.title || "Dashboard Keuangan";

  return (
    <div className="space-y-6">
      <SeoHead title={`${title} — Admin Yayasan`} />

      <AdminPageHeader
        title={title}
        subtitle="Dashboard Looker Studio (hanya lihat). Data diperbarui tim keuangan melalui Google Sheets."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Keuangan" }]}
        actions={
          data?.url ? (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-semibold text-navy hover:bg-surface"
            >
              <ExternalLink className="w-4 h-4" /> Buka di tab baru
            </a>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="p-12 text-center text-muted">Memuat dashboard keuangan...</div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">Gagal memuat dashboard keuangan.</span>
        </div>
      ) : !data?.url ? (
        <div className="bg-white border border-border rounded-xl p-8 text-center">
          <p className="font-bold text-navy mb-1">Dashboard keuangan belum dikonfigurasi</p>
          <p className="text-sm text-muted">
            Super Admin dapat mengaktifkan dan mengisi URL embed Looker Studio di Pengaturan → Dashboard Keuangan.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {frameFailed && (
            <p className="p-3 text-sm text-danger border-b border-border">
              Dashboard gagal dimuat. Gunakan tombol &quot;Buka di tab baru&quot;.
            </p>
          )}
          <iframe
            title={title}
            src={data.url}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            referrerPolicy="no-referrer"
            onError={() => setFrameFailed(true)}
            className="w-full h-[75vh] border-0"
          />
        </div>
      )}
    </div>
  );
};

export default FinancePage;
