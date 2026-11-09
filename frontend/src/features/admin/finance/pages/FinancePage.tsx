import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  Printer,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Building,
  TrendingUp,
  AlertCircle,
  Clock,
  PieChart as PieIcon,
  BarChart3,
} from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { AdminPageHeader, AdminStatCard, AdminChart, AdminDonutChart } from "@/components/admin";
import { getReportSummary } from "../api";

export const FinancePage: React.FC = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-reports-summary", selectedPeriodId],
    queryFn: () =>
      getReportSummary({
        registration_period_id: selectedPeriodId || undefined,
      }),
  });

  const students = summary?.students || { total: 0, submitted: 0, verified: 0, waiting: 0, accepted: 0, rejected: 0 };
  const teachers = summary?.teachers || { total: 0, submitted: 0, interview: 0, waiting: 0, accepted: 0, rejected: 0 };
  const unitBreakdown = summary?.unit_breakdown || [];
  const periods = summary?.periods || [];

  // Chart data for School Comparison
  const unitComparisonChart = unitBreakdown.map((u) => ({
    label: u.unit_code || u.unit_name,
    value: u.students_total,
    secondaryValue: u.students_accepted,
    tooltip: `${u.unit_name}: ${u.students_total} Pendaftar (${u.students_accepted} Diterima)`,
  }));

  // Student Status Donut
  const studentStatusDonut = [
    { label: "Diterima", value: students.accepted, color: "#16a34a" },
    { label: "Menunggu / Proses", value: students.waiting, color: "#0A3FA8" },
    { label: "Ditolak", value: students.rejected, color: "#dc2626" },
  ];

  // Teacher Status Donut
  const teacherStatusDonut = [
    { label: "Diterima", value: teachers.accepted, color: "#16a34a" },
    { label: "Proses Seleksi", value: teachers.waiting, color: "#f59e0b" },
    { label: "Ditolak", value: teachers.rejected, color: "#dc2626" },
  ];

  const handleExportCsv = () => {
    const url = `/api/v1/admin/reports/export?registration_period_id=${selectedPeriodId || ""}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Laporan & Rekapitulasi — Admin Yayasan" />

      <AdminPageHeader
        title="Laporan & Rekapitulasi Yayasan"
        subtitle="Analisis terintegrasi pendaftaran murid baru (PPDB), penyerapan kuota unit pendidikan, serta rekapitulasi rekrutmen tenaga pendidik."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Laporan & Rekapitulasi" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-leaf text-white text-xs font-semibold rounded-lg hover:bg-leaf/90 transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Excel / CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-border text-navy text-xs font-semibold rounded-lg hover:border-primary transition shadow-sm"
            >
              <Printer className="w-4 h-4 text-primary" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        }
      />

      {/* Period Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-navy shrink-0">
            Pilih Periode / Gelombang:
          </label>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="w-full sm:w-auto border border-border rounded-lg px-3 py-1.5 text-xs text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua Periode (Akumulasi)</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.academic_year} - Gel. {p.wave}) {p.is_active ? "[Aktif]" : ""}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-muted">
          Menampilkan data berdasarkan periode terpilih
        </span>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
          <p>Mengumpulkan rekapitulasi data yayasan...</p>
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 text-center text-danger">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
          <p className="font-semibold">Gagal memuat rekapitulasi laporan</p>
          <button onClick={() => refetch()} className="mt-3 text-sm underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          {/* Key Recap Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <AdminStatCard
              title="Pendaftar Murid"
              value={students.total}
              subtitle="Calon siswa terdaftar"
              icon={<Users className="w-4 h-4" />}
              variant="navy"
            />
            <AdminStatCard
              title="Murid Diterima"
              value={students.accepted}
              subtitle={`${students.total > 0 ? Math.round((students.accepted / students.total) * 100) : 0}% kelulusan`}
              icon={<CheckCircle2 className="w-4 h-4" />}
              variant="leaf"
            />
            <AdminStatCard
              title="Murid Ditolak"
              value={students.rejected}
              subtitle="Tidak memenuhi syarat"
              icon={<XCircle className="w-4 h-4" />}
              variant="danger"
            />
            <AdminStatCard
              title="Pelamar Guru"
              value={teachers.total}
              subtitle="Berkas masuk"
              icon={<Briefcase className="w-4 h-4" />}
              variant="primary"
            />
            <AdminStatCard
              title="Guru Diterima"
              value={teachers.accepted}
              subtitle="Lolos seleksi"
              icon={<CheckCircle2 className="w-4 h-4" />}
              variant="leaf"
            />
            <AdminStatCard
              title="Guru Ditolak"
              value={teachers.rejected}
              subtitle="Gugur seleksi"
              icon={<XCircle className="w-4 h-4" />}
              variant="danger"
            />
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* School Comparison Chart */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Pendaftar Murid per Unit Sekolah
                  </h3>
                  <span className="text-[11px] text-muted flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-navy" /> Pendaftar
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-leaf" /> Diterima
                  </span>
                </div>
                <p className="text-xs text-muted mb-4">
                  Perbandingan total calon siswa baru yang mendaftar dan yang telah dinyatakan diterima per unit.
                </p>
                <div className="h-64">
                  <AdminChart data={unitComparisonChart} height={240} />
                </div>
              </div>
            </div>

            {/* Status Distribution Donut */}
            <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-navy text-sm flex items-center gap-2 mb-2">
                  <PieIcon className="w-4 h-4 text-primary" />
                  Distribusi Status Murid (PPDB)
                </h3>
                <p className="text-xs text-muted mb-4">
                  Persentase status kelulusan berkas calon murid baru.
                </p>
                <div className="h-60 flex items-center justify-center">
                  <AdminDonutChart data={studentStatusDonut} totalLabel="Calon Siswa" />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Menunggu: <strong>{students.waiting}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-leaf" />
                  Lolos: <strong>{students.accepted}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Teacher Recruitment Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
              <h3 className="font-bold text-navy text-sm flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Distribusi Seleksi Calon Guru
              </h3>
              <p className="text-xs text-muted mb-4">
                Komposisi pelamar guru yang diterima, masih dalam tahap seleksi/wawancara, dan tidak lolos.
              </p>
              <div className="h-56 flex items-center justify-center">
                <AdminDonutChart data={teacherStatusDonut} totalLabel="Pelamar" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-navy text-sm flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Ringkasan Rasio Rekrutmen Guru
                </h3>
                <div className="space-y-3 mt-4 text-xs">
                  <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-border">
                    <span className="text-muted">Total Lamaran Masuk:</span>
                    <strong className="text-navy text-sm">{teachers.total} Berkas</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-border">
                    <span className="text-muted">Dalam Tahap Wawancara / Seleksi:</span>
                    <strong className="text-warning text-sm">{teachers.waiting} Orang</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-leaf/10 rounded-lg border border-leaf/20">
                    <span className="text-leaf font-medium">Tingkat Penerimaan Guru (Acceptance Rate):</span>
                    <strong className="text-leaf text-sm font-bold">
                      {teachers.total > 0 ? ((teachers.accepted / teachers.total) * 100).toFixed(1) : 0}%
                    </strong>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted italic mt-4">
                * Data pelamar guru diperbarui secara otomatis setiap kali status seleksi diverifikasi oleh tim rekrutmen.
              </p>
            </div>
          </div>

          {/* Comprehensive Unit Breakdown Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy text-base flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Rekapitulasi per Sekolah &amp; Jenjang Pendidikan
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Rincian pendaftar murid, penyerapan kuota daya tampung, dan rekrutmen per unit sekolah.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-border text-muted uppercase font-semibold">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Unit Sekolah</th>
                    <th className="py-3 px-4">Jenjang</th>
                    <th className="py-3 px-4 text-center">Daya Tampung</th>
                    <th className="py-3 px-4 text-center">Pendaftar Murid</th>
                    <th className="py-3 px-4 text-center">Menunggu</th>
                    <th className="py-3 px-4 text-center text-leaf">Diterima</th>
                    <th className="py-3 px-4 text-center text-danger">Ditolak</th>
                    <th className="py-3 px-4 text-center">% Terisi</th>
                    <th className="py-3 px-4 text-center">Pelamar Guru</th>
                    <th className="py-3 px-4 text-center text-leaf">Guru Diterima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {unitBreakdown.map((unit, idx) => {
                    const percentage =
                      unit.quota && unit.quota > 0
                        ? Math.min(100, Math.round((unit.students_accepted / unit.quota) * 100))
                        : null;

                    return (
                      <tr key={unit.unit_id} className="hover:bg-surface/50 transition">
                        <td className="py-3 px-4 text-center text-muted font-medium">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-navy">{unit.unit_name}</td>
                        <td className="py-3 px-4 uppercase font-semibold text-muted font-mono">
                          {unit.level}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-foreground">
                          {unit.quota !== null ? `${unit.quota} Kursi` : "-"}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-navy">
                          {unit.students_total}
                        </td>
                        <td className="py-3 px-4 text-center text-muted">
                          {unit.students_waiting}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-leaf">
                          {unit.students_accepted}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-danger">
                          {unit.students_rejected}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {percentage !== null ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                percentage >= 100
                                  ? "bg-leaf/15 text-leaf"
                                  : percentage >= 50
                                  ? "bg-primary/15 text-primary"
                                  : "bg-surface text-muted"
                              }`}
                            >
                              {percentage}%
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-foreground">
                          {unit.teachers_total}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-leaf">
                          {unit.teachers_accepted}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancePage;
