import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Search,
  User,
  Clock,
  ShieldCheck,
  AlertCircle,
  Monitor,
} from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { AdminPageHeader, AdminStatCard } from "@/components/admin";
import { getActivityLogs } from "../api";

export const ActivityLogsPage: React.FC = () => {
  const [searchAction, setSearchAction] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-activity-logs", { searchAction, page }],
    queryFn: () =>
      getActivityLogs({
        action: searchAction || undefined,
        page,
      }),
  });

  const logs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <SeoHead title="Log Aktivitas & Audit — Admin Yayasan" />

      <AdminPageHeader
        title="Log Aktivitas Sistem"
        subtitle="Audit jejak tindakan administratif, perubahan status pendaftaran, modifikasi kuota, dan aktivitas pengguna secara berkala."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Log Aktivitas" },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminStatCard
          title="Total Log Tercatat"
          value={meta?.total || logs.length}
          subtitle="Aktivitas audit sistem"
          icon={<History className="w-5 h-5" />}
          variant="navy"
        />
        <AdminStatCard
          title="Integritas Audit"
          value="100% Tercatat"
          subtitle="Tercatat bersama IP &amp; waktu"
          icon={<ShieldCheck className="w-5 h-5" />}
          variant="leaf"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Cari tindakan atau aksi (misal: login, status_update, store)..."
            value={searchAction}
            onChange={(e) => {
              setSearchAction(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <span className="text-xs text-muted">
          Menampilkan catatan audit terbaru
        </span>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
          <p>Memuat rekaman log audit...</p>
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 text-center text-danger">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
          <p className="font-semibold">Gagal memuat log aktivitas</p>
          <button onClick={() => refetch()} className="mt-3 text-sm underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <History className="w-12 h-12 mx-auto mb-3 text-muted/60" />
          <h3 className="text-base font-semibold text-foreground">Belum Ada Rekaman Aktivitas</h3>
          <p className="text-sm mt-1">Setiap tindakan administratif akan tercatat secara otomatis di sini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface border-b border-border text-muted uppercase font-semibold">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Aksi / Tindakan</th>
                  <th className="py-3 px-4">Objek / Subjek</th>
                  <th className="py-3 px-4">IP &amp; Perangkat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/50 transition">
                    <td className="py-3 px-4 text-muted whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>
                          {new Date(log.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {log.user ? (
                        <div className="flex items-center gap-1.5 font-semibold text-navy">
                          <User className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{log.user.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted italic">Sistem Otomatis</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface border border-border text-navy font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {log.subject_type ? (
                        <span>
                          {log.subject_type.split("\\").pop()} #{log.subject_id}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Monitor className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>{log.ip_address || "127.0.0.1"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs border border-border rounded bg-white text-muted disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span className="text-xs text-muted">
            Halaman {page} dari {meta.last_page}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, meta.last_page))}
            disabled={page === meta.last_page}
            className="px-3 py-1.5 text-xs border border-border rounded bg-white text-muted disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogsPage;
