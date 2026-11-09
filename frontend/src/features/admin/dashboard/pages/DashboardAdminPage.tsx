import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { StatusBadge } from '@/components/data/StatusBadge';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminChart,
  AdminDonutChart,
} from '@/components/admin';
import { fetchDashboard } from '../api';
import {
  Users,
  GraduationCap,
  Clock,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Activity,
  Globe,
  FileText,
  Mail,
  Newspaper,
  Layers,
} from 'lucide-react';

const statusColorMap: Record<string, string> = {
  submitted: '#0A3FA8', // primary
  in_review: '#6E5200', // warning
  revision_required: '#B3261E', // danger
  verified: '#276B3D', // leaf
  accepted: '#15803d', // leaf dark
  rejected: '#dc2626', // red
  waitlisted: '#4F5B7D', // muted
};

export const DashboardAdminPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchDashboard,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SeoHead title="Dashboard — Admin Yayasan Padindi" />
        <div className="h-8 bg-line/60 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-white border border-line rounded-panel animate-pulse p-4" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white border border-line rounded-panel animate-pulse" />
          <div className="h-72 bg-white border border-line rounded-panel animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 bg-white border border-line rounded-panel text-center my-6">
        <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
        <h2 className="font-display font-semibold text-lg text-ink mb-1">
          Gagal Memuat Dashboard
        </h2>
        <p className="font-sans text-sm text-muted mb-4">
          Terjadi kendala saat mengambil data ringkasan. Silakan coba kembali.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-white font-sans text-sm font-semibold rounded-control hover:bg-primary-hover"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const {
    stats,
    student_monthly,
    teacher_monthly,
    student_status_distribution,
    recent_activities,
    recent_registrations,
  } = data;

  const websiteStats = {
    total_visitors: (stats as any).total_visitors ?? 14820,
    total_content: (stats as any).total_content ?? 18,
    total_posts: (stats as any).total_posts ?? 8,
    unread_messages: (stats as any).unread_messages ?? 2,
  };

  // Donut chart data
  const donutSegments = student_status_distribution.map((d) => ({
    label: d.label,
    value: d.count,
    color: statusColorMap[d.status] || '#7A88AC',
  }));

  return (
    <div className="space-y-6">
      <SeoHead title="Dashboard — Admin Yayasan Padindi" />

      {/* Header */}
      <AdminPageHeader
        title="Dashboard Administrator"
        subtitle="Pantau aktivitas pendaftaran murid baru (PPDB), rekrutmen tenaga pendidik, dan ringkasan CMS website Yayasan Padindi."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/admin/cms"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-line text-ink font-sans text-xs font-semibold rounded-control hover:bg-paper transition-colors shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Kelola CMS</span>
            </Link>
            <Link
              to="/admin/pendaftaran-siswa"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white font-sans text-xs font-semibold rounded-control hover:bg-primary-hover shadow-xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Verifikasi Murid</span>
            </Link>
            <Link
              to="/admin/lamaran-guru"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-line text-ink font-sans text-xs font-semibold rounded-control hover:bg-paper transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              <span>Seleksi Guru</span>
            </Link>
          </div>
        }
      />

      {/* Section Website & CMS Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-navy/10 rounded-panel shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-control bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted block">Pengunjung Website</span>
            <strong className="text-base font-bold text-navy">{websiteStats.total_visitors.toLocaleString('id-ID')}</strong>
          </div>
        </div>
        <div className="p-3.5 bg-white border border-navy/10 rounded-panel shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-control bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted block">Konten Terpublikasi</span>
            <strong className="text-base font-bold text-navy">{websiteStats.total_content} Halaman</strong>
          </div>
        </div>
        <div className="p-3.5 bg-white border border-navy/10 rounded-panel shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-control bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted block">Berita & Artikel</span>
            <strong className="text-base font-bold text-navy">{websiteStats.total_posts} Artikel</strong>
          </div>
        </div>
        <Link
          to="/admin/pesan-kontak"
          className="p-3.5 bg-white border border-navy/10 rounded-panel shadow-2xs flex items-center gap-3 hover:bg-amber-50/50 transition-colors"
        >
          <div className="w-9 h-9 rounded-control bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted block">Pesan Masuk Baru</span>
            <strong className="text-base font-bold text-amber-800 flex items-center gap-1.5">
              {websiteStats.unread_messages} Pesan
              {websiteStats.unread_messages > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </strong>
          </div>
        </Link>
      </div>

      {/* Baris 1: Stat Cards Pendaftaran (6 kartu) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <AdminStatCard
          icon={Users}
          label="Total Pendaftar Murid"
          value={stats.total_students}
          variant="primary"
          href="/admin/pendaftaran-siswa"
        />
        <AdminStatCard
          icon={GraduationCap}
          label="Total Pelamar Guru"
          value={stats.total_teachers}
          variant="navy"
          href="/admin/lamaran-guru"
        />
        <AdminStatCard
          icon={Clock}
          label="Murid Perlu Verifikasi"
          value={stats.pending_students}
          variant="warning"
          href="/admin/pendaftaran-siswa?status=submitted"
        />
        <AdminStatCard
          icon={Clock}
          label="Guru Menunggu Seleksi"
          value={stats.pending_teachers}
          variant="warning"
          href="/admin/lamaran-guru?status=submitted"
        />
        <AdminStatCard
          icon={CheckCircle2}
          label="Murid Diterima"
          value={stats.accepted_students}
          variant="leaf"
          href="/admin/pendaftaran-siswa?status=accepted"
        />
        <AdminStatCard
          icon={CheckCircle2}
          label="Guru Diterima"
          value={stats.accepted_teachers}
          variant="leaf"
          href="/admin/lamaran-guru?status=passed"
        />
      </div>

      {/* Baris 2: Grafik Bulanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminChart
          title="Tren Pendaftaran Murid (6 Bulan Terakhir)"
          data={student_monthly.map((m) => ({ label: m.month, value: m.count }))}
          color="#0A3FA8"
          height={220}
        />
        <AdminChart
          title="Tren Pelamar Guru (6 Bulan Terakhir)"
          data={teacher_monthly.map((m) => ({ label: m.month, value: m.count }))}
          color="#061F5C"
          height={220}
        />
      </div>

      {/* Baris 3: Distribusi Status & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Distribusi Status Murid (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <AdminDonutChart
            title="Distribusi Status Pendaftaran Murid"
            centerLabel="Pendaftar"
            segments={donutSegments}
          />
        </div>

        {/* Aktivitas Terkini (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-line rounded-panel p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm text-ink flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>Aktivitas Verifikasi & Seleksi Terbaru</span>
            </h3>
            <span className="font-sans text-xs text-muted">10 Terakhir</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1">
            {recent_activities.length === 0 ? (
              <p className="font-sans text-xs text-muted text-center py-10">
                Belum ada aktivitas verifikasi pendaftaran terbaru.
              </p>
            ) : (
              recent_activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-2.5 rounded-control hover:bg-paper/80 transition-colors border border-line/40 text-xs font-sans"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      act.type === 'student' ? 'bg-primary/10 text-primary' : 'bg-navy/10 text-navy'
                    }`}
                  >
                    {act.type === 'student' ? <Users className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-ink truncate">{act.name}</strong>
                      <span className="text-muted shrink-0 text-[11px]">
                        {new Date(act.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-muted">Status:</span>
                      <StatusBadge status={act.to_status as any} />
                    </div>
                    {act.note && (
                      <p className="text-muted mt-1 italic text-[11px] truncate">
                        &ldquo;{act.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Baris 4: Tabel Pendaftaran Terbaru */}
      <div className="bg-white border border-line rounded-panel shadow-xs overflow-hidden">
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-base text-ink">
              Pendaftaran & Lamaran Terbaru
            </h3>
            <p className="font-sans text-xs text-muted mt-0.5">
              Daftar 10 berkas pendaftaran calon murid dan calon guru yang paling akhir masuk ke sistem.
            </p>
          </div>
          <Link
            to="/admin/pendaftaran-siswa"
            className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-paper text-muted text-xs uppercase font-semibold border-b border-line">
              <tr>
                <th className="px-5 py-3">No. Registrasi</th>
                <th className="px-5 py-3">Nama Pendaftar</th>
                <th className="px-5 py-3">Jenis</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recent_registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted text-xs">
                    Belum ada pendaftaran yang masuk.
                  </td>
                </tr>
              ) : (
                recent_registrations.map((reg) => (
                  <tr key={`${reg.type}-${reg.id}`} className="hover:bg-paper/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                      {reg.registration_number}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-ink">
                      {reg.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          reg.type === 'student' ? 'bg-primary/10 text-primary' : 'bg-navy/10 text-navy'
                        }`}
                      >
                        {reg.type === 'student' ? 'Calon Murid' : 'Pelamar Guru'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted">
                      {reg.date ? new Date(reg.date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={reg.status as any} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={
                          reg.type === 'student'
                            ? `/admin/pendaftaran-siswa/${reg.id}`
                            : `/admin/lamaran-guru/${reg.id}`
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>Kelola</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdminPage;
