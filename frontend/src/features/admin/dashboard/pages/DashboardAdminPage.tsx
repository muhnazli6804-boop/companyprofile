import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Newspaper,
  Image,
  Mail,
  History,
  PlusCircle,
  FolderPlus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { StatusBadge } from '@/components/data/StatusBadge';
import { apiErrorInfo } from '@/features/admin/users-roles/api';
import { useQueryClient } from '@tanstack/react-query';
import { TrendChart } from '../components/TrendChart';
import { useDashboard } from '../hooks';
import type { DashboardData } from '../types';

const STUDENT_ORDER = ['submitted', 'in_review', 'revision_required', 'verified', 'accepted', 'waitlisted', 'rejected'];
const TEACHER_ORDER = ['submitted', 'administrative_review', 'interview_test', 'passed', 'reserve', 'failed'];

const PANEL = 'bg-white border border-line rounded-control';
const LINK = 'inline-block mt-2 py-1 text-primary underline underline-offset-2';

const Panel: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className = '', children }) => (
  <section id={id} className={`${PANEL} p-5 scroll-mt-6 ${className}`}>{children}</section>
);

interface StatCardProps {
  label: string;
  value: number;
  note: string;
  tone?: 'primary' | 'warning' | 'muted';
  link: React.ReactNode;
  icon?: React.ReactNode;
  accent?: boolean;
}

const TONE = { primary: 'text-primary', warning: 'text-warning', muted: 'text-muted' };

const StatCard: React.FC<StatCardProps> = ({ label, value, note, tone = 'primary', link, icon, accent }) => (
  <div className={`${PANEL} p-5 flex flex-col gap-1 ${accent ? 'border-l-4 border-l-warning' : ''}`}>
    <p className="font-bold text-ink flex items-center gap-2">{icon}{label}</p>
    <p className={`font-display font-semibold text-3xl tabular-nums ${TONE[tone]}`}>{value}</p>
    <p className={`text-[0.9rem] ${tone === 'warning' ? 'text-warning' : 'text-muted'}`}>{note}</p>
    {link}
  </div>
);

const StatusPanel: React.FC<{
  id: string; title: string; total: string; type: 'student' | 'teacher'; order: string[]; counts: Record<string, number>;
}> = ({ id, title, total, type, order, counts }) => (
  <Panel id={id} className="flex-[1_1_440px]">
    <div className="flex items-baseline justify-between gap-3 mb-2">
      <h2 className="font-display font-semibold text-lg text-ink">{title}</h2>
      <p className="text-muted">{total}</p>
    </div>
    <ul className="list-none p-0 m-0">
      {order.map((status) => {
        const n = counts[status] ?? 0;
        return (
          <li key={status} className="border-t border-line min-h-12 flex items-center justify-between gap-3">
            <StatusBadge status={status} type={type} />
            <span className={`tabular-nums ${n > 0 ? 'font-bold text-ink' : 'text-muted'}`}>{n}</span>
          </li>
        );
      })}
    </ul>
  </Panel>
);

const LegendDot: React.FC<{ color: string; text: string }> = ({ color, text }) => (
  <span className="inline-flex items-center gap-2 text-[0.9rem] text-ink">
    <span aria-hidden="true" className={`inline-block h-3 w-3 ${color}`} />{text}
  </span>
);

const Content: React.FC<{ data: DashboardData }> = ({ data }) => {
  const quotaByUnit = new Map(data.quota.map((q) => [q.education_unit_id, q]));
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pendaftar siswa" value={data.totals.students} note="Periode terpilih"
          link={<a href="#status-siswa" className={LINK}>Lihat status siswa</a>} />
        <StatCard label="Pelamar guru" value={data.totals.teachers} note="Semua periode"
          link={<a href="#status-guru" className={LINK}>Lihat status guru</a>} />
        <StatCard label="Dokumen menunggu verifikasi" value={data.documents_pending} note="Perlu tindakan" tone="warning" accent
          icon={<AlertTriangle size={16} aria-hidden="true" />}
          link={<Link to="/admin/pendaftaran-siswa" className={LINK}>Periksa dokumen</Link>} />
        <StatCard label="Pesan kontak baru" value={data.unread_contact_messages}
          note={data.unread_contact_messages > 0 ? 'Belum dibaca' : 'Tidak ada pesan baru'}
          tone={data.unread_contact_messages > 0 ? 'primary' : 'muted'}
          link={<Link to="/admin/pesan-kontak" className={LINK}>Buka pesan masuk</Link>} />
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <Panel className="flex-[7_1_460px]">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg text-ink">Pendaftar baru 7 hari terakhir</h2>
              <p className="text-[0.9rem] text-muted">Dihitung dari tanggal pengiriman</p>
            </div>
            <div className="flex gap-4">
              <LegendDot color="bg-primary" text="Siswa" />
              <LegendDot color="bg-line-input" text="Guru" />
            </div>
          </div>
          <TrendChart days={data.new_applicants} />
        </Panel>

        <Panel className="flex-[5_1_340px]">
          <h2 className="font-display font-semibold text-lg text-ink">Unit pendidikan</h2>
          <p className="text-[0.9rem] text-muted mb-3">Jumlah pendaftar dan kuota siswa. Terisi berarti berstatus Diterima.</p>
          <ul className="list-none p-0 m-0">
            {data.per_unit.map((u) => {
              const q = quotaByUnit.get(u.education_unit_id);
              const pct = q && q.quota > 0 ? Math.min(100, (q.filled / q.quota) * 100) : 0;
              return (
                <li key={u.education_unit_id} className="border-t border-line py-3 flex flex-col gap-1">
                  <div className="flex flex-wrap justify-between gap-x-3">
                    <span className="font-bold text-ink">{u.name}</span>
                    <span className="text-muted">Siswa {u.students} · Guru {u.teachers}</span>
                  </div>
                  {q ? (
                    <>
                      <div className="flex flex-wrap justify-between gap-x-3 text-[0.9rem]">
                        <span className="text-muted">Kuota siswa terisi</span>
                        <span className="text-ink tabular-nums">{q.filled} dari {q.quota}, sisa {Math.max(0, q.remaining)}</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Kuota ${u.name}`}
                        aria-valuemin={0}
                        aria-valuemax={q.quota}
                        aria-valuenow={Math.min(q.filled, q.quota)}
                        className="h-2 rounded-control bg-tint-100 overflow-hidden"
                      >
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </>
                  ) : (
                    <p className="text-[0.9rem] text-muted">Belum ada kuota untuk periode ini.</p>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <StatusPanel id="status-siswa" title="Status pendaftar siswa" total={`Total ${data.totals.students}`}
          type="student" order={STUDENT_ORDER} counts={data.status_counts.students} />
        <StatusPanel id="status-guru" title="Status pelamar guru" total={`Total ${data.totals.teachers} · semua periode`}
          type="teacher" order={TEACHER_ORDER} counts={data.status_counts.teachers} />
      </div>
    </div>
  );
};

/** Dashboard Khusus Role Guru: Mengelola Konten, Galeri, Pesan Kontak, dan Log Aktivitas */
const GuruDashboardContent: React.FC<{ data: DashboardData; user?: { name?: string; email?: string } | null }> = ({
  data,
  user,
}) => {
  const metrics = data.guru_metrics || {
    total_posts: 0,
    published_posts: 0,
    draft_posts: 0,
    total_galleries: 0,
    my_messages_total: 0,
    my_messages_unread: data.unread_contact_messages ?? 0,
    my_activity_logs_count: 0,
    recent_posts: [],
    recent_galleries: [],
    recent_messages: [],
    recent_activities: [],
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Stat Cards Relevan Guru */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Berita & Artikel"
          value={metrics.total_posts}
          note={`${metrics.published_posts} tayang · ${metrics.draft_posts} draft`}
          icon={<Newspaper size={17} className="text-primary" />}
          link={
            <Link to="/admin/cms?tab=news" className={LINK}>
              Kelola berita &amp; artikel
            </Link>
          }
        />
        <StatCard
          label="Galeri & Dokumentasi"
          value={metrics.total_galleries}
          note="Dokumentasi kegiatan sekolah"
          icon={<Image size={17} className="text-primary" />}
          link={
            <Link to="/admin/cms?tab=galleries" className={LINK}>
              Kelola galeri media
            </Link>
          }
        />
        <StatCard
          label="Pesan Kontak Masuk"
          value={metrics.my_messages_unread}
          note={metrics.my_messages_unread > 0 ? 'Pesan baru belum dibalas' : 'Semua pesan tertangani'}
          tone={metrics.my_messages_unread > 0 ? 'warning' : 'primary'}
          accent={metrics.my_messages_unread > 0}
          icon={<Mail size={17} className={metrics.my_messages_unread > 0 ? 'text-warning' : 'text-primary'} />}
          link={
            <Link to="/admin/pesan-kontak" className={LINK}>
              Buka pesan masuk ({metrics.my_messages_total})
            </Link>
          }
        />
        <StatCard
          label="Log Aktivitas Anda"
          value={metrics.my_activity_logs_count}
          note="Riwayat tindakan audit akun"
          icon={<History size={17} className="text-muted" />}
          tone="muted"
          link={
            <Link to="/admin/log-aktivitas" className={LINK}>
              Lihat log aktivitas
            </Link>
          }
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-wrap gap-6 items-start">
        {/* Kolom Kiri: Berita & Galeri Terkini */}
        <div className="flex-[7_1_460px] flex flex-col gap-6">
          {/* Panel Berita & Artikel Terbaru */}
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
              <div>
                <h2 className="font-display font-semibold text-lg text-ink">Berita &amp; Artikel Publikasi</h2>
                <p className="text-[0.9rem] text-muted">Daftar publikasi artikel informasi website yang dikelola.</p>
              </div>
              <Link
                to="/admin/cms?tab=news"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-control hover:bg-primary/90 transition shadow-2xs"
              >
                <PlusCircle size={14} />
                <span>Tulis Berita Baru</span>
              </Link>
            </div>

            {metrics.recent_posts && metrics.recent_posts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-muted border-b border-line font-semibold">
                      <th className="py-2.5 px-2">Judul Artikel</th>
                      <th className="py-2.5 px-2">Kategori</th>
                      <th className="py-2.5 px-2">Status</th>
                      <th className="py-2.5 px-2">Tanggal</th>
                      <th className="py-2.5 px-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {metrics.recent_posts.map((post) => (
                      <tr key={post.id} className="hover:bg-tint-50/50 transition">
                        <td className="py-3 px-2 font-semibold text-ink max-w-[200px] truncate" title={post.title}>
                          {post.title}
                        </td>
                        <td className="py-3 px-2 text-muted">
                          {post.category?.name || 'Umum'}
                        </td>
                        <td className="py-3 px-2">
                          {post.status === 'published' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={11} /> Tayang
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              <Clock size={11} /> Draft
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-muted whitespace-nowrap">
                          {new Date(post.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap">
                          <Link
                            to="/admin/cms?tab=news"
                            className="text-primary hover:underline font-semibold"
                          >
                            Kelola
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-muted">
                <Newspaper className="w-10 h-10 mx-auto mb-2 text-muted/60" />
                <p className="font-semibold text-ink">Belum ada berita yang diterbitkan</p>
                <p className="text-xs text-muted mt-1">Mulai buat berita atau artikel edukasi pertama untuk website yayasan.</p>
                <Link
                  to="/admin/cms?tab=news"
                  className="inline-block mt-3 text-xs text-primary font-semibold hover:underline"
                >
                  + Tulis Berita Pertama
                </Link>
              </div>
            )}
          </Panel>

          {/* Panel Galeri & Dokumentasi Kegiatan */}
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
              <div>
                <h2 className="font-display font-semibold text-lg text-ink">Galeri &amp; Dokumentasi Media</h2>
                <p className="text-[0.9rem] text-muted">Album foto dan dokumentasi kegiatan yayasan pada landing page.</p>
              </div>
              <Link
                to="/admin/cms?tab=galleries"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-line text-ink rounded-control hover:bg-tint-50 transition"
              >
                <FolderPlus size={14} className="text-primary" />
                <span>Kelola Galeri</span>
              </Link>
            </div>

            {metrics.recent_galleries && metrics.recent_galleries.length > 0 ? (
              <ul className="list-none p-0 m-0 divide-y divide-line text-xs">
                {metrics.recent_galleries.map((gal) => (
                  <li key={gal.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-tint-50/50 px-1 rounded transition">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Image size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">{gal.title}</p>
                        <p className="text-[11px] text-muted">
                          {gal.event_date
                            ? new Date(gal.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Dokumentasi Yayasan'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Publik
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-muted text-xs">
                <Image className="w-8 h-8 mx-auto mb-2 text-muted/60" />
                <p>Belum ada album galeri yang diunggah.</p>
              </div>
            )}
          </Panel>
        </div>

        {/* Kolom Kanan: Pesan Aspirasi Masuk & Pintasan Cepat */}
        <div className="flex-[5_1_340px] flex flex-col gap-6">
          {/* Panel Pesan Kontak Masuk */}
          <Panel>
            <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-line">
              <div>
                <h2 className="font-display font-semibold text-base text-ink">Pesan Masuk untuk Anda</h2>
                <p className="text-[0.85rem] text-muted">Aspirasi atau pertanyaan publik yang berkaitan dengan akun Anda.</p>
              </div>
              <Link to="/admin/pesan-kontak" className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
                <span>Semua</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {metrics.recent_messages && metrics.recent_messages.length > 0 ? (
              <ul className="list-none p-0 m-0 divide-y divide-line text-xs">
                {metrics.recent_messages.map((msg) => (
                  <li key={msg.id} className="py-2.5 flex flex-col gap-1 hover:bg-tint-50/50 px-1 rounded transition">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-ink truncate">{msg.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        msg.status === 'new' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {msg.status === 'new' ? 'Belum Dibalas' : 'Selesai'}
                      </span>
                    </div>
                    <p className="text-muted text-[11px] truncate">{msg.subject || 'Pesan pertanyaan / konsultasi'}</p>
                    <p className="text-[10px] text-muted/70">
                      {new Date(msg.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-muted text-xs">
                <Mail className="w-8 h-8 mx-auto mb-1 text-muted/50" />
                <p className="font-medium text-ink">Tidak ada pesan baru</p>
                <p className="text-muted text-[11px]">Semua pesan kontak untuk akun Anda sudah ditangani.</p>
              </div>
            )}
          </Panel>

          {/* Panel Riwayat Aktivitas Akun Terakhir */}
          <Panel>
            <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-line">
              <div>
                <h2 className="font-display font-semibold text-base text-ink">Aktivitas Akun Terakhir</h2>
                <p className="text-[0.85rem] text-muted">Jejak tindakan audit akun Anda di sistem.</p>
              </div>
              <Link to="/admin/log-aktivitas" className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
                <span>Detail</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {metrics.recent_activities && metrics.recent_activities.length > 0 ? (
              <ul className="list-none p-0 m-0 divide-y divide-line text-xs">
                {metrics.recent_activities.map((act) => (
                  <li key={act.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono text-[11px] font-semibold text-ink bg-tint-50 px-1.5 py-0.5 rounded border border-line">
                        {act.action}
                      </span>
                      <p className="text-[10px] text-muted mt-0.5">
                        {new Date(act.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-muted text-xs">
                <History className="w-8 h-8 mx-auto mb-1 text-muted/50" />
                <p className="text-muted">Aktivitas pengelolaan Anda akan dicatat otomatis di sini.</p>
              </div>
            )}
          </Panel>

          {/* Pintasan Cepat Menu Guru */}
          <Panel className="bg-tint-50/40">
            <h2 className="font-display font-semibold text-sm text-ink mb-2">Pintasan Menu Guru</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/admin/cms?tab=news"
                className="p-2.5 rounded-control bg-white border border-line hover:border-primary transition flex flex-col gap-1 text-ink font-semibold"
              >
                <Newspaper size={15} className="text-primary" />
                <span>Kelola Berita</span>
              </Link>
              <Link
                to="/admin/cms?tab=galleries"
                className="p-2.5 rounded-control bg-white border border-line hover:border-primary transition flex flex-col gap-1 text-ink font-semibold"
              >
                <Image size={15} className="text-primary" />
                <span>Galeri Media</span>
              </Link>
              <Link
                to="/admin/pesan-kontak"
                className="p-2.5 rounded-control bg-white border border-line hover:border-primary transition flex flex-col gap-1 text-ink font-semibold"
              >
                <Mail size={15} className="text-primary" />
                <span>Pesan Masuk</span>
              </Link>
              <Link
                to="/admin/log-aktivitas"
                className="p-2.5 rounded-control bg-white border border-line hover:border-primary transition flex flex-col gap-1 text-ink font-semibold"
              >
                <History size={15} className="text-primary" />
                <span>Log Aktivitas</span>
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

// Bentuknya meniru Content agar tata letak tidak melompat saat data tiba (DESIGN.md 8.8).
const DashboardSkeleton: React.FC = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat dashboard">
    <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full" />)}
    </div>
    <div className="flex flex-wrap gap-6">
      <Skeleton className="h-80 flex-[7_1_460px]" />
      <Skeleton className="h-80 flex-[5_1_340px]" />
    </div>
    <div className="flex flex-wrap gap-6">
      <Skeleton className="h-96 flex-[1_1_440px]" />
      <Skeleton className="h-96 flex-[1_1_440px]" />
    </div>
  </div>
);

export const DashboardAdminPage: React.FC = () => {
  const [periodId, setPeriodId] = useState<number | undefined>();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<{ name?: string; email?: string }>(['currentUser']);
  const { data, error, isError, isPending, refetch } = useDashboard(periodId);
  const isGuruOnly = Boolean(data?.guru_metrics);

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title={isGuruOnly ? "Dashboard Guru & Pendidik" : "Dashboard Administrator"} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-primary mb-2">
            {isGuruOnly ? "Dashboard Guru & Pendidik" : "Dashboard Administrator"}
          </h1>
          <p className="text-muted max-w-prose">
            {isGuruOnly
              ? `Selamat datang, ${currentUser?.name || 'Bapak/Ibu Pendidik'}. Ringkasan publikasi konten, artikel berita, galeri kegiatan, dan pesan aspirasi masuk yang berkaitan dengan Anda.`
              : "Angka siswa mengikuti periode yang dipilih. Angka guru mencakup semua periode karena lamaran guru tidak terikat periode. Draft tidak dihitung."}
          </p>
        </div>
        {!isGuruOnly && data?.periods && data.periods.length > 0 && (
          <div className="flex flex-col gap-1">
            <label htmlFor="dashboard-period" className="font-bold text-ink">Periode</label>
            <select
              id="dashboard-period"
              className="w-[22rem] max-w-full min-h-12 px-3 rounded-control border-[1.5px] border-line-input bg-white text-ink"
              value={periodId ?? data.period?.id ?? ''}
              onChange={(e) => setPeriodId(Number(e.target.value))}
            >
              {data.periods.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.is_active ? '' : ' (nonaktif)'}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isError ? (
        <div role="alert" className="bg-white border border-line border-l-4 border-l-danger rounded-control p-4 text-danger flex flex-wrap items-center gap-3">
          <span>{apiErrorInfo(error).message}</span>
          <Button variant="secondary" onClick={() => void refetch()}>Coba lagi</Button>
        </div>
      ) : isPending ? (
        <DashboardSkeleton />
      ) : isGuruOnly ? (
        <GuruDashboardContent data={data} user={currentUser} />
      ) : (
        <>
          {!data.period && (
            <p className={`${PANEL} border-l-4 border-l-primary p-4 text-ink`}>
              Belum ada periode pendaftaran, jadi angka siswa tampil 0. Buat periode terlebih dahulu agar ringkasan siswa terisi.
            </p>
          )}
          <Content data={data} />
        </>
      )}
    </div>
  );
};

export default DashboardAdminPage;
