import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Newspaper,
  LayoutTemplate,
  CheckCircle2,
  FileEdit,
  Clock,
  AlertTriangle,
  PlusCircle,
  FolderPlus,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Calendar,
  Eye,
  Edit,
  GraduationCap,
  Briefcase,
  Mail,
  ListTodo,
  ArrowRight,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { staffStore, type StaffNewsItem, type WebsiteContentItem, type RecentActivity } from '../services/staffContentStore';
import { useCurrentUser, hasPermission } from '@/features/auth/permissions';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';

export const StaffDashboardPage: React.FC = () => {
  const { data: user } = useCurrentUser();
  const [stats, setStats] = useState(staffStore.getStats());
  const [recentNews, setRecentNews] = useState<StaffNewsItem[]>([]);
  const [recentContent, setRecentContent] = useState<WebsiteContentItem[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  const hasAppAccess = hasPermission(user, 'applications.view');
  const hasMessageAccess = hasPermission(user, 'messages.manage');
  const hasDashboardAccess = hasPermission(user, 'dashboard.view');

  const { data: adminSummary } = useQuery({
    queryKey: ['adminDashboardSummary'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<ApiResponse<any>>('/admin/dashboard');
        return res.data.data;
      } catch {
        return null;
      }
    },
    enabled: Boolean(hasDashboardAccess),
    staleTime: 60_000,
  });

  useEffect(() => {
    setStats(staffStore.getStats());
    setRecentNews(staffStore.getNews().slice(0, 5));
    setRecentContent(staffStore.getWebsiteContent().slice(0, 5));
    setActivities(staffStore.getRecentActivities().slice(0, 6));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            Dipublikasikan
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} />
            Menunggu Persetujuan
          </span>
        );
      case 'revision':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={12} />
            Perlu Revisi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <FileEdit size={12} />
            Draft
          </span>
        );
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  // Dummy monthly activity data for chart
  const months = ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'];
  const publishData = [12, 19, 15, 26, 22, 31];
  const draftData = [5, 8, 11, 7, 9, 14];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy via-[#0C3259] to-primary text-white p-6 rounded-card shadow-sm border border-navy/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-star/20 text-star text-xs font-bold">
            Portal Guru & Staf Pengelola Konten
          </span>
          <h1 className="font-display font-bold text-2xl text-white">
            Selamat Datang, {user?.name || 'Bapak/Ibu Pendidik'}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            Kelola publikasi berita, artikel, dan konten website Yayasan Padindi secara terpadu.
            Setiap konten yang diajukan akan ditinjau oleh Administrator sebelum tampil di Landing Page publik.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/staff/berita/tambah"
            className="inline-flex items-center gap-2 px-4 py-2 bg-star text-navy font-bold text-xs rounded-control hover:bg-star/90 transition-all shadow-md active:scale-95"
          >
            <PlusCircle size={15} />
            <span>Buat Berita Baru</span>
          </Link>
          <Link
            to="/staff/konten"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-control transition-all border border-white/20"
          >
            <FolderPlus size={15} />
            <span>Kelola Konten</span>
          </Link>
        </div>
      </div>

      {/* 6 Statistic Cards: Status Alur Konten Lengkap */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Konten */}
        <div className="bg-white p-4 rounded-card border border-navy/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Total Konten</span>
            <div className="w-8 h-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
              <LayoutTemplate size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-navy">{stats.totalContent}</span>
            <span className="text-[11px] text-muted">item</span>
          </div>
          <Link to="/staff/konten" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium">
            <span>Kelola konten</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Total Berita */}
        <div className="bg-white p-4 rounded-card border border-navy/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Total Berita</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Newspaper size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-navy">{stats.totalNews}</span>
            <span className="text-[11px] text-muted">artikel</span>
          </div>
          <Link to="/staff/berita" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium">
            <span>Lihat semua berita</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Dipublikasikan */}
        <div className="bg-white p-4 rounded-card border border-emerald-200/60 shadow-2xs space-y-2 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Dipublikasikan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-emerald-700">{stats.published}</span>
            <span className="text-[11px] text-emerald-600">aktif live</span>
          </div>
          <Link to="/staff/publikasi?status=published" className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-medium">
            <span>Tampil di web</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Menunggu Persetujuan */}
        <div className="bg-white p-4 rounded-card border border-amber-200/60 shadow-2xs space-y-2 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Menunggu Admin</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-amber-700">{stats.pending}</span>
            <span className="text-[11px] text-amber-600">antrean review</span>
          </div>
          <Link to="/staff/publikasi?status=pending" className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:underline font-medium">
            <span>Pantau review</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Perlu Revisi */}
        <div className={`bg-white p-4 rounded-card border shadow-2xs space-y-2 ${stats.revision > 0 ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-200' : 'border-navy/10'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${stats.revision > 0 ? 'text-rose-800' : 'text-muted'}`}>Perlu Revisi</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stats.revision > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`font-display font-bold text-2xl ${stats.revision > 0 ? 'text-rose-700' : 'text-slate-800'}`}>{stats.revision}</span>
            <span className={`text-[11px] ${stats.revision > 0 ? 'text-rose-600 font-semibold' : 'text-muted'}`}>harus diperbaiki</span>
          </div>
          <Link to="/staff/publikasi?status=revision" className="inline-flex items-center gap-1 text-[11px] text-rose-700 hover:underline font-medium">
            <span>Tinjau revisi</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Draft Konten */}
        <div className="bg-white p-4 rounded-card border border-navy/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Draft Tersimpan</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileEdit size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-slate-800">{stats.draft}</span>
            <span className="text-[11px] text-muted">draft artikel</span>
          </div>
          <Link to="/staff/publikasi?status=draft" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium">
            <span>Lanjutkan naskah</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* Operasional Layanan Terpadu (Kondisional: PPDB, Rekrutmen, dan Pesan Masuk) */}
      {(hasAppAccess || hasMessageAccess) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-navy flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Statistik Layanan & Operasional Terpadu
            </h2>
            <span className="text-xs text-muted">Sinkronisasi data real-time yayasan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kartu PPDB */}
            {hasAppAccess && (
              <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Penerimaan Siswa (PPDB)</span>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <GraduationCap size={18} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-bold text-3xl text-navy">
                      {adminSummary?.total_registrations ?? 0}
                    </span>
                    <span className="text-xs text-muted">calon murid mendaftar</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    <strong className="text-amber-700">{adminSummary?.pending_verifications ?? 0}</strong> berkas menunggu verifikasi
                  </p>
                </div>
                <div className="pt-2 border-t border-navy/10">
                  <Link
                    to="/staff/pendaftaran-siswa"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-navy transition-colors"
                  >
                    <span>Buka Verifikasi Dokumen PPDB</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}

            {/* Kartu Rekrutmen Pendidik */}
            {hasAppAccess && (
              <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-navy">Rekrutmen Guru & Staf</span>
                  <div className="w-9 h-9 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                    <Briefcase size={18} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-bold text-3xl text-navy">
                      {adminSummary?.teacher_applications ?? 0}
                    </span>
                    <span className="text-xs text-muted">berkas pelamar masuk</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Proses seleksi berkas administrasi dan wawancara pendidik
                  </p>
                </div>
                <div className="pt-2 border-t border-navy/10">
                  <Link
                    to="/staff/lamaran-guru"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-navy transition-colors"
                  >
                    <span>Buka Seleksi Pelamar Guru</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}

            {/* Kartu Pesan Kontak & Pengaduan */}
            {hasMessageAccess && (
              <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Pesan & Pengaduan</span>
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-bold text-3xl text-navy">
                      {adminSummary?.new_contact_messages ?? 0}
                    </span>
                    <span className="text-xs text-muted">pesan baru belum dibalas</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Pertanyaan calon orang tua murid dan aspirasi masyarakat
                  </p>
                </div>
                <div className="pt-2 border-t border-navy/10">
                  <Link
                    to="/staff/pesan-kontak"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-navy transition-colors"
                  >
                    <span>Buka Kotak Masuk Pesan</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Widget Daftar Tugas & Tindak Lanjut (Action Items) */}
      <div className="bg-white p-5 md:p-6 rounded-card border border-navy/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-base text-navy flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary" />
              Daftar Tugas & Tindak Lanjut Operasional
            </h2>
            <p className="text-xs text-muted">Item pekerjaan yang memerlukan perhatian dan tindakan Anda</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-navy/5 text-navy">
            Prioritas Kerja
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Task 1: Revisi Konten */}
          {stats.revision > 0 ? (
            <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-rose-900 truncate">Revisi Konten Diperlukan</p>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Terdapat {stats.revision} naskah yang dikembalikan oleh Admin dengan catatan perbaikan.
                  </p>
                </div>
              </div>
              <Link
                to="/staff/publikasi?status=revision"
                className="shrink-0 text-xs font-semibold text-rose-700 bg-white border border-rose-300 px-2.5 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                Perbaiki
              </Link>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-xs font-medium text-emerald-900">
                  Tidak ada catatan revisi tertunda. Seluruh naskah Anda siap tayang!
                </p>
              </div>
            </div>
          )}

          {/* Task 2: Verifikasi Berkas PPDB */}
          {hasAppAccess && (
            <div className="p-3.5 rounded-lg border border-navy/10 bg-paper/60 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <FileCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-navy truncate">Pemeriksaan Berkas PPDB</p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Periksa kelengkapan KK, akta, dan rapor calon murid baru tahun ajaran aktif.
                  </p>
                </div>
              </div>
              <Link
                to="/staff/pendaftaran-siswa"
                className="shrink-0 text-xs font-semibold text-primary bg-white border border-navy/15 px-2.5 py-1 rounded hover:bg-navy/5 transition-colors"
              >
                Buka
              </Link>
            </div>
          )}

          {/* Task 3: Pantau Antrean Persetujuan Konten */}
          {stats.pending > 0 && (
            <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-amber-900 truncate">Menunggu Persetujuan Admin</p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {stats.pending} konten sedang dalam proses peninjauan sebelum ditayangkan di website publik.
                  </p>
                </div>
              </div>
              <Link
                to="/staff/publikasi?status=pending"
                className="shrink-0 text-xs font-semibold text-amber-700 bg-white border border-amber-300 px-2.5 py-1 rounded hover:bg-amber-50 transition-colors"
              >
                Pantau
              </Link>
            </div>
          )}

          {/* Task 4: Tanggapi Pesan Kontak */}
          {hasMessageAccess && (
            <div className="p-3.5 rounded-lg border border-navy/10 bg-paper/60 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <Mail className="w-4 h-4 text-navy mt-0.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-navy truncate">Tanggapan Pesan & Pengaduan</p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Beri tanggapan resmi atas pertanyaan dan pengaduan yang dikirim masyarakat.
                  </p>
                </div>
              </div>
              <Link
                to="/staff/pesan-kontak"
                className="shrink-0 text-xs font-semibold text-navy bg-white border border-navy/15 px-2.5 py-1 rounded hover:bg-navy/5 transition-colors"
              >
                Periksa
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Aktivitas Publikasi Konten */}
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-card border border-navy/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-navy flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Grafik Aktivitas Publikasi Konten
              </h3>
              <p className="text-xs text-muted">Statistik konten yang dipublikasikan dan dibuat 6 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-navy">
                <span className="w-3 h-3 rounded-sm bg-primary" />
                Dipublikasikan
              </span>
              <span className="flex items-center gap-1.5 font-medium text-muted">
                <span className="w-3 h-3 rounded-sm bg-slate-300" />
                Draft
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 pb-2">
            <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 border-b border-navy/10 px-2">
              {months.map((m, idx) => {
                const pubHeight = (publishData[idx] / 35) * 100;
                const draftHeight = (draftData[idx] / 35) * 100;
                return (
                  <div key={m} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-navy text-white text-[10px] py-1 px-2 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                      {publishData[idx]} dipublikasi • {draftData[idx]} draft
                    </div>
                    {/* Dual bars */}
                    <div className="w-full flex items-end justify-center gap-1.5 h-40">
                      <div
                        style={{ height: `${pubHeight}%` }}
                        className="w-full max-w-[20px] bg-primary rounded-t-sm hover:brightness-110 transition-all"
                      />
                      <div
                        style={{ height: `${draftHeight}%` }}
                        className="w-full max-w-[20px] bg-slate-300 rounded-t-sm hover:brightness-110 transition-all"
                      />
                    </div>
                    <span className="text-xs text-muted font-medium">{m}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-paper p-3 rounded-lg flex items-center justify-between text-xs text-muted">
            <span>Rata-rata 22 konten baru diproduksi oleh tenaga pendidik setiap bulannya.</span>
            <span className="text-primary font-semibold">Tingkat persetujuan 94%</span>
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white p-5 md:p-6 rounded-card border border-navy/10 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-navy flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Aktivitas Terbaru
            </h3>
            <span className="text-xs text-muted">Live update</span>
          </div>

          <div className="flex-1 space-y-3.5 divide-y divide-navy/5">
            {activities.map((act) => (
              <div key={act.id} className="pt-3.5 first:pt-0 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-semibold text-navy truncate">{act.target}</p>
                  <p className="text-[11px] text-muted">{act.action}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted/80 pt-0.5">
                    <span className="font-medium text-ink-muted">{act.user}</span>
                    <span>•</span>
                    <span>{act.timestamp}</span>
                  </div>
                </div>
                <div className="shrink-0">{getStatusBadge(act.status)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Berita Terakhir & Konten Website Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Berita Terakhir Dibuat */}
        <div className="bg-white p-5 md:p-6 rounded-card border border-navy/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-navy flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-primary" />
              Daftar Berita Terakhir Dibuat
            </h3>
            <Link to="/staff/berita" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              <span>Kelola Berita</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-navy/10">
            {recentNews.map((n) => (
              <div key={n.id} className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={n.thumbnail}
                    alt={n.title}
                    className="w-12 h-12 rounded-lg object-cover bg-navy/10 shrink-0 border border-navy/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/news/ppdb-cover.jpg';
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-navy truncate" title={n.title}>
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-muted mt-0.5 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-navy/5 text-navy font-semibold text-[10px]">
                        {n.category}
                      </span>
                      <span>•</span>
                      <span>{formatDate(n.createdAt)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(n.status)}
                  <Link
                    to={`/staff/berita/edit/${n.id}`}
                    className="p-1.5 text-ink-muted hover:text-navy hover:bg-navy/5 rounded transition-colors"
                    title="Edit Berita"
                  >
                    <Edit size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Konten Terakhir Diperbarui */}
        <div className="bg-white p-5 md:p-6 rounded-card border border-navy/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-navy flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-primary" />
              Konten Terakhir Diperbarui
            </h3>
            <Link to="/staff/konten" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              <span>Kelola Konten</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-navy/10">
            {recentContent.map((c) => (
              <div key={c.id} className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-navy/10 text-navy">
                      {c.section}
                    </span>
                    <span className="text-xs font-semibold text-ink-muted truncate">{c.subCategory}</span>
                  </div>
                  <h4 className="text-xs font-bold text-navy truncate" title={c.title}>
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-muted line-clamp-1">{c.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(c.status)}
                  <Link
                    to="/staff/konten"
                    className="p-1.5 text-ink-muted hover:text-navy hover:bg-navy/5 rounded transition-colors"
                    title="Buka Pengelolaan Konten"
                  >
                    <Eye size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardPage;

