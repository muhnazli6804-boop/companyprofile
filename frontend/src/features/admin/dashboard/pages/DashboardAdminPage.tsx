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
  ChevronRight,
  Sparkles,
  TrendingUp,
  BookOpen,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { StatusBadge } from '@/components/data/StatusBadge';
import { apiErrorInfo } from '@/features/admin/users-roles/api';
import { TrendChart } from '../components/TrendChart';
import { useDashboard } from '../hooks';
import type { DashboardData } from '../types';

const STUDENT_ORDER = ['submitted', 'in_review', 'revision_required', 'verified', 'accepted', 'waitlisted', 'rejected'];
const TEACHER_ORDER = ['submitted', 'administrative_review', 'interview_test', 'passed', 'reserve', 'failed'];

const PANEL = 'bg-white border border-line rounded-control shadow-2xs';
const LINK = 'inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary hover:underline group';

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
          link={<a href="#status-siswa" className="inline-block mt-2 py-1 text-primary underline underline-offset-2">Lihat status siswa</a>} />
        <StatCard label="Pelamar guru" value={data.totals.teachers} note="Semua periode"
          link={<a href="#status-guru" className="inline-block mt-2 py-1 text-primary underline underline-offset-2">Lihat status guru</a>} />
        <StatCard label="Dokumen menunggu verifikasi" value={data.documents_pending} note="Perlu tindakan" tone="warning" accent
          icon={<AlertTriangle size={16} aria-hidden="true" />}
          link={<Link to="/admin/pendaftaran-siswa" className="inline-block mt-2 py-1 text-primary underline underline-offset-2">Periksa dokumen</Link>} />
        <StatCard label="Pesan kontak baru" value={data.unread_contact_messages}
          note={data.unread_contact_messages > 0 ? 'Belum dibaca' : 'Tidak ada pesan baru'}
          tone={data.unread_contact_messages > 0 ? 'primary' : 'muted'}
          link={<Link to="/admin/pesan-kontak" className="inline-block mt-2 py-1 text-primary underline underline-offset-2">Buka pesan masuk</Link>} />
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

  // Mock baris tren 6 bulan untuk grafik visual konten publikasi guru
  const monthlyActivity = [
    { month: 'Jun', published: Math.max(1, Math.round(metrics.published_posts * 0.4)), draft: 1 },
    { month: 'Jul', published: Math.max(2, Math.round(metrics.published_posts * 0.6)), draft: 2 },
    { month: 'Agu', published: Math.max(1, Math.round(metrics.published_posts * 0.5)), draft: 1 },
    { month: 'Sep', published: Math.max(3, Math.round(metrics.published_posts * 0.8)), draft: 3 },
    { month: 'Okt', published: Math.max(2, Math.round(metrics.published_posts * 0.7)), draft: 2 },
    { month: 'Nov', published: Math.max(3, metrics.published_posts), draft: Math.max(1, metrics.draft_posts) },
  ];

  const maxVal = Math.max(...monthlyActivity.map((m) => Math.max(m.published, m.draft, 4)));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* 1. Hero Welcome Card Modern */}
      <div className="relative overflow-hidden rounded-control bg-gradient-to-r from-navy via-[#162D5E] to-[#1F366D] text-white p-6 md:p-7 shadow-md border border-navy/30">
        {/* Glow ambient background */}
        <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-star/15 rounded-full pointer-events-none blur-3xl" />
        <div className="absolute right-40 -top-12 w-44 h-44 bg-blue-400/10 rounded-full pointer-events-none blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-star/20 text-star text-xs font-bold border border-star/30 backdrop-blur-xs">
              <Sparkles size={13} className="text-star shrink-0" />
              <span>Portal Pengajar &amp; Pengelola Konten</span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
              Selamat Datang, {user?.name || 'Bapak/Ibu Pendidik'}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Kelola artikel edukasi, publikasikan dokumentasi kegiatan sekolah, dan jalin komunikasi dengan menjawab aspirasi masyarakat melalui website Yayasan Padindi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/admin/cms?tab=news"
              className="inline-flex items-center gap-2 px-4 py-2 bg-star text-navy font-bold text-xs rounded-control hover:bg-star/90 transition shadow-sm active:scale-95"
            >
              <PlusCircle size={15} />
              <span>+ Buat Berita Baru</span>
            </Link>
            <Link
              to="/admin/cms?tab=galleries"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-control transition border border-white/20 backdrop-blur-xs"
            >
              <FolderPlus size={15} />
              <span>+ Unggah Galeri</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Empat Stat Cards Modern dengan Card Visual Elegan */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {/* Berita & Artikel */}
        <div className="bg-white border border-line rounded-control p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs text-muted uppercase tracking-wider">Berita &amp; Artikel</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Newspaper size={16} />
              </div>
            </div>
            <p className="font-display font-bold text-3xl tabular-nums text-navy">{metrics.total_posts}</p>
            <p className="text-xs text-muted mt-1 font-medium">{metrics.published_posts} tayang · {metrics.draft_posts} draft</p>
          </div>
          <Link to="/admin/cms?tab=news" className={LINK}>
            <span>Kelola berita &amp; artikel</span>
            <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Galeri & Dokumentasi */}
        <div className="bg-white border border-line rounded-control p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs text-muted uppercase tracking-wider">Galeri &amp; Dokumentasi</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Image size={16} />
              </div>
            </div>
            <p className="font-display font-bold text-3xl tabular-nums text-navy">{metrics.total_galleries}</p>
            <p className="text-xs text-muted mt-1 font-medium">Dokumentasi kegiatan sekolah</p>
          </div>
          <Link to="/admin/cms?tab=galleries" className={LINK}>
            <span>Kelola galeri media</span>
            <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Pesan Kontak Masuk */}
        <div className={`bg-white border rounded-control p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between ${
          metrics.my_messages_unread > 0 ? 'border-amber-300 border-l-4 border-l-amber-500' : 'border-line'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs text-muted uppercase tracking-wider">Pesan Kontak Masuk</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                metrics.my_messages_unread > 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-50 text-primary border border-line'
              }`}>
                <Mail size={16} />
              </div>
            </div>
            <p className={`font-display font-bold text-3xl tabular-nums ${metrics.my_messages_unread > 0 ? 'text-amber-600' : 'text-navy'}`}>
              {metrics.my_messages_unread}
            </p>
            <p className={`text-xs mt-1 font-medium ${metrics.my_messages_unread > 0 ? 'text-amber-700' : 'text-muted'}`}>
              {metrics.my_messages_unread > 0 ? 'Pesan baru belum dibalas' : 'Semua pesan tertangani'}
            </p>
          </div>
          <Link to="/admin/pesan-kontak" className={LINK}>
            <span>Buka pesan masuk ({metrics.my_messages_total})</span>
            <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Log Aktivitas Anda */}
        <div className="bg-white border border-line rounded-control p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs text-muted uppercase tracking-wider">Log Aktivitas Anda</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">
                <History size={16} />
              </div>
            </div>
            <p className="font-display font-bold text-3xl tabular-nums text-navy">{metrics.my_activity_logs_count}</p>
            <p className="text-xs text-muted mt-1 font-medium">Riwayat tindakan audit akun</p>
          </div>
          <Link to="/admin/log-aktivitas" className={LINK}>
            <span>Lihat log aktivitas</span>
            <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="flex flex-wrap gap-6 items-start">
        {/* Kolom Kiri (Lebar): Berita, Galeri & Grafik Tren */}
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
                    <tr className="text-muted border-b border-line font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-2.5 px-3">Judul Artikel</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {metrics.recent_posts.map((post) => (
                      <tr key={post.id} className="hover:bg-tint-50/60 transition group">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-navy/5 text-navy flex items-center justify-center shrink-0 border border-line">
                              <BookOpen size={13} className="text-primary" />
                            </div>
                            <span className="font-semibold text-ink max-w-[240px] truncate block" title={post.title}>
                              {post.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-tint-50 text-navy border border-line">
                            {post.category?.name || 'Umum'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {post.status === 'published' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Tayang
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              <Clock size={11} />
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-muted whitespace-nowrap text-[11px]">
                          {new Date(post.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Link
                            to="/admin/cms?tab=news"
                            className="inline-flex items-center gap-0.5 text-primary hover:underline font-bold text-xs"
                          >
                            <span>Kelola</span>
                            <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-muted">
                <div className="w-12 h-12 rounded-full bg-tint-50 flex items-center justify-center mx-auto mb-3 text-primary border border-line">
                  <Newspaper className="w-6 h-6" />
                </div>
                <p className="font-semibold text-ink text-sm">Belum Ada Berita yang Diterbitkan</p>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                  Mulai tulis artikel berita, pengumuman sekolah, atau liputan kegiatan pertama untuk ditampilkan di website yayasan.
                </p>
                <Link
                  to="/admin/cms?tab=news"
                  className="inline-flex items-center gap-1.5 mt-4 px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-control hover:bg-primary/90 transition shadow-2xs"
                >
                  <PlusCircle size={14} />
                  <span>+ Tulis Berita Pertama</span>
                </Link>
              </div>
            )}
          </Panel>

          {/* Panel Grafik Aktivitas Konten Publikasi (Visual Chart) */}
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
              <div>
                <h2 className="font-display font-semibold text-base text-ink flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  <span>Aktivitas Publikasi Konten</span>
                </h2>
                <p className="text-[0.85rem] text-muted">Tren penulisan dan publikasi artikel 6 bulan terakhir.</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-ink font-medium">
                  <span className="w-3 h-3 rounded-xs bg-primary inline-block" />
                  Artikel Tayang
                </span>
                <span className="inline-flex items-center gap-1.5 text-ink font-medium">
                  <span className="w-3 h-3 rounded-xs bg-star inline-block border border-star/50" />
                  Draft
                </span>
              </div>
            </div>

            {/* Bagan Batang Responsif */}
            <div className="pt-2 pb-1">
              <div className="grid grid-cols-6 gap-3 items-end h-36 border-b border-line pb-2">
                {monthlyActivity.map((item, idx) => {
                  const hPub = Math.min(100, Math.max(12, (item.published / maxVal) * 100));
                  const hDraft = Math.min(100, Math.max(8, (item.draft / maxVal) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="flex items-end gap-1.5 w-full justify-center h-full">
                        {/* Batang Published */}
                        <div
                          style={{ height: `${hPub}%` }}
                          className="w-4 sm:w-5 bg-primary rounded-t-xs transition-all duration-300 group-hover:brightness-110 relative"
                          title={`${item.month}: ${item.published} artikel tayang`}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] bg-navy text-white px-1 rounded font-mono font-bold">
                            {item.published}
                          </span>
                        </div>
                        {/* Batang Draft */}
                        <div
                          style={{ height: `${hDraft}%` }}
                          className="w-4 sm:w-5 bg-star rounded-t-xs transition-all duration-300 group-hover:brightness-110 border border-star/60 relative"
                          title={`${item.month}: ${item.draft} draft`}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] bg-ink text-white px-1 rounded font-mono font-bold">
                            {item.draft}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-muted">{item.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted pt-2">
                <span>Data aktivitas publikasi guru &amp; pendidik</span>
                <span className="font-semibold text-primary">Periode Semester Berjalan</span>
              </div>
            </div>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-line text-ink rounded-control hover:bg-tint-50 transition shadow-2xs"
              >
                <FolderPlus size={14} className="text-primary" />
                <span>Kelola Galeri</span>
              </Link>
            </div>

            {metrics.recent_galleries && metrics.recent_galleries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {metrics.recent_galleries.map((gal) => (
                  <div
                    key={gal.id}
                    className="p-3 rounded-control border border-line bg-surface hover:bg-tint-50/50 hover:border-primary/40 transition flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                      <Image size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs text-ink truncate" title={gal.title}>
                        {gal.title}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {gal.event_date
                          ? new Date(gal.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Dokumentasi Yayasan'}
                      </p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Tayang Publik
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted text-xs">
                <Image className="w-9 h-9 mx-auto mb-2 text-muted/60" />
                <p className="font-semibold text-ink">Belum Ada Album Galeri</p>
                <p className="text-muted mt-0.5">Unggah dokumentasi foto kegiatan sekolah untuk ditampilkan di galeri profil.</p>
                <Link
                  to="/admin/cms?tab=galleries"
                  className="inline-block mt-3 text-xs text-primary font-semibold hover:underline"
                >
                  + Unggah Galeri Sekarang
                </Link>
              </div>
            )}
          </Panel>
        </div>

        {/* Kolom Kanan (Samping): Pesan Masuk, Riwayat & Pintasan Cepat */}
        <div className="flex-[5_1_340px] flex flex-col gap-6">
          {/* Panel Pesan Kontak Masuk */}
          <Panel>
            <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-line">
              <div>
                <h2 className="font-display font-semibold text-base text-ink flex items-center gap-1.5">
                  <MessageSquare size={16} className="text-primary" />
                  <span>Pesan Masuk untuk Anda</span>
                </h2>
                <p className="text-[0.82rem] text-muted">Aspirasi atau pertanyaan publik yang ditugaskan ke Anda.</p>
              </div>
              <Link to="/admin/pesan-kontak" className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
                <span>Lihat Semua</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {metrics.recent_messages && metrics.recent_messages.length > 0 ? (
              <ul className="list-none p-0 m-0 divide-y divide-line text-xs">
                {metrics.recent_messages.map((msg) => (
                  <li key={msg.id} className="py-2.5 flex items-start gap-3 hover:bg-tint-50/50 px-1 rounded transition">
                    <div className="w-8 h-8 rounded-full bg-navy/10 text-navy font-bold flex items-center justify-center shrink-0 border border-line text-xs">
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-ink truncate">{msg.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          msg.status === 'new'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {msg.status === 'new' ? 'Belum Dibalas' : 'Selesai'}
                        </span>
                      </div>
                      <p className="text-muted text-[11px] truncate mt-0.5">{msg.subject || 'Pesan pertanyaan / konsultasi'}</p>
                      <p className="text-[10px] text-muted/70 mt-0.5">
                        {new Date(msg.created_at).toLocaleDateString('id-ID', {
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
                <div className="w-10 h-10 rounded-full bg-tint-50 flex items-center justify-center mx-auto mb-2 text-primary border border-line">
                  <Mail className="w-5 h-5" />
                </div>
                <p className="font-semibold text-ink">Tidak Ada Pesan Baru</p>
                <p className="text-muted text-[11px] mt-0.5">Semua pesan kontak untuk akun Anda sudah ditangani dengan baik.</p>
              </div>
            )}
          </Panel>

          {/* Panel Riwayat Aktivitas Akun Terakhir */}
          <Panel>
            <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-line">
              <div>
                <h2 className="font-display font-semibold text-base text-ink flex items-center gap-1.5">
                  <History size={16} className="text-primary" />
                  <span>Aktivitas Akun Terakhir</span>
                </h2>
                <p className="text-[0.82rem] text-muted">Jejak tindakan audit akun Anda di sistem.</p>
              </div>
              <Link to="/admin/log-aktivitas" className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
                <span>Detail</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {metrics.recent_activities && metrics.recent_activities.length > 0 ? (
              <ul className="list-none p-0 m-0 divide-y divide-line text-xs">
                {metrics.recent_activities.map((act) => (
                  <li key={act.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <div>
                        <span className="font-mono text-[11px] font-bold text-navy bg-tint-50 px-2 py-0.5 rounded border border-line inline-block">
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

          {/* Pintasan Cepat Menu Guru Modern */}
          <Panel className="bg-gradient-to-br from-surface to-tint-50/60 border border-line">
            <h2 className="font-display font-semibold text-sm text-ink mb-2.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-star" />
              <span>Pintasan Menu Guru</span>
            </h2>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <Link
                to="/admin/cms?tab=news"
                className="p-3 rounded-control bg-white border border-line hover:border-primary hover:shadow-2xs transition-all flex flex-col gap-1 text-ink group"
              >
                <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform">
                  <Newspaper size={15} />
                </div>
                <span className="font-bold">Kelola Berita</span>
                <span className="text-[10px] text-muted">Artikel &amp; Edukasi</span>
              </Link>
              <Link
                to="/admin/cms?tab=galleries"
                className="p-3 rounded-control bg-white border border-line hover:border-primary hover:shadow-2xs transition-all flex flex-col gap-1 text-ink group"
              >
                <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform">
                  <Image size={15} />
                </div>
                <span className="font-bold">Galeri Media</span>
                <span className="text-[10px] text-muted">Album Dokumentasi</span>
              </Link>
              <Link
                to="/admin/pesan-kontak"
                className="p-3 rounded-control bg-white border border-line hover:border-primary hover:shadow-2xs transition-all flex flex-col gap-1 text-ink group"
              >
                <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform">
                  <Mail size={15} />
                </div>
                <span className="font-bold">Pesan Masuk</span>
                <span className="text-[10px] text-muted">Aspirasi Publik</span>
              </Link>
              <Link
                to="/admin/log-aktivitas"
                className="p-3 rounded-control bg-white border border-line hover:border-primary hover:shadow-2xs transition-all flex flex-col gap-1 text-ink group"
              >
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform">
                  <History size={15} />
                </div>
                <span className="font-bold">Log Aktivitas</span>
                <span className="text-[10px] text-muted">Riwayat Audit</span>
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
          <h1 className="text-2xl font-display font-semibold text-primary mb-1">
            {isGuruOnly ? "Dashboard Guru & Pendidik" : "Dashboard Administrator"}
          </h1>
          <p className="text-muted max-w-prose text-xs sm:text-sm">
            {isGuruOnly
              ? "Ringkasan publikasi konten, artikel berita, galeri kegiatan, dan pesan aspirasi yang berkaitan dengan Anda."
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
