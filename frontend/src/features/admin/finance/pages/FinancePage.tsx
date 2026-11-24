import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ExternalLink } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { AdminPageHeader } from "@/components/admin";
import { Skeleton } from "@/components/feedback/Skeleton";
import { getFinanceDashboard } from "../api";
import { parseEmbedUrl } from "../embedUrl";
import { FinanceSettingsPanel } from "../components/FinanceSettingsPanel";

export const FinancePage: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-finance-dashboard"],
    queryFn: getFinanceDashboard,
    refetchOnWindowFocus: false, // setiap fetch tercatat di log aktivitas
  });

  const title = data?.title || "Dashboard Keuangan";
  // Validasi ulang di klien; iframe tidak pernah memakai nilai yang gagal validasi.
  const parsed = data?.url ? parseEmbedUrl(data.url) : null;
  const embedUrl = parsed && "url" in parsed ? parsed.url : null;

  return (
    <div className="space-y-6">
      <SeoHead title={`${title} — Admin Yayasan`} />

      <AdminPageHeader
        title={title}
        subtitle="Dashboard Looker Studio (hanya lihat). Data diperbarui tim keuangan melalui Google Sheets."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Keuangan" }]}
        actions={
          embedUrl ? (
            <a
              href={embedUrl}
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
        <div data-testid="finance-skeleton" className="space-y-3">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-[480px] w-full" />
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">Gagal memuat dashboard keuangan.</span>
        </div>
      ) : !embedUrl ? (
        <div className="bg-white border border-border rounded-xl p-8 text-center">
          <p className="font-bold text-navy mb-1">Dashboard keuangan belum dikonfigurasi</p>
          <p className="text-sm text-muted">
            URL embed Looker Studio belum diisi atau fitur belum diaktifkan. Hubungi Super Admin.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted">
            Jika laporan dibatasi, akun Google yang sedang login di browser ini harus punya akses ke laporan tersebut.
          </p>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <iframe
              title="Dashboard Keuangan SD Padindi"
              src={embedUrl}
              width="100%"
              height="1500"
              frameBorder="0"
              style={{ border: 0, width: "100%", minHeight: 1500 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      )}

      {data?.config && <FinanceSettingsPanel key={JSON.stringify(data.config)} config={data.config} />}
    </div>
  );
};

export default FinancePage;
