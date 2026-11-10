import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Edit,
  Trash2,
  Users,
  Building,
  AlertCircle,
  Coins,
  Settings2,
  Power,
  Calendar,
} from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { AdminPageHeader, AdminStatCard, ConfirmModal } from "@/components/admin";
import {
  getRegistrationPeriods,
  createRegistrationPeriod,
  updateRegistrationPeriod,
  togglePeriodActive,
  deleteRegistrationPeriod,
  updatePeriodQuotas,
} from "../api";
import { RegistrationPeriod, RegistrationPeriodPayload } from "../types";
import { apiClient } from "@/lib/api-client";

export const PeriodsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [academicYearFilter, setAcademicYearFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<RegistrationPeriod | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Quota modal states
  const [quotaModalPeriod, setQuotaModalPeriod] = useState<RegistrationPeriod | null>(null);
  const [quotaInputs, setQuotaInputs] = useState<Record<number, number>>({});
  const [quotaError, setQuotaError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RegistrationPeriodPayload>({
    name: "",
    academic_year: "2026/2027",
    wave: 1,
    opens_at: "",
    closes_at: "",
    announcement_at: "",
    description: "",
    registration_fee: 0,
    is_active: true,
  });

  // Fetch education units for quota mapping
  const { data: units = [] } = useQuery({
    queryKey: ["education-units-list"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Array<{ id: number; name: string; code: string; level: string }> }>("/admin/education-units");
      return res.data.data;
    },
  });

  const { data: periods = [], isLoading, error, refetch } = useQuery({
    queryKey: ["admin-registration-periods", academicYearFilter],
    queryFn: () => getRegistrationPeriods({ academic_year: academicYearFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: RegistrationPeriodPayload) => createRegistrationPeriod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registration-periods"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal menyimpan periode.";
      setFormError(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RegistrationPeriodPayload> }) =>
      updateRegistrationPeriod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registration-periods"] });
      setIsModalOpen(false);
      setEditingPeriod(null);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal memperbarui periode.";
      setFormError(msg);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => togglePeriodActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registration-periods"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRegistrationPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registration-periods"] });
      setDeleteTargetId(null);
    },
  });

  const quotaMutation = useMutation({
    mutationFn: ({
      periodId,
      quotas,
    }: {
      periodId: number;
      quotas: Array<{ education_unit_id: number; quota: number }>;
    }) => updatePeriodQuotas(periodId, quotas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registration-periods"] });
      setQuotaModalPeriod(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal memperbarui kuota unit.";
      setQuotaError(msg);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      academic_year: "2026/2027",
      wave: 1,
      opens_at: "",
      closes_at: "",
      announcement_at: "",
      description: "",
      registration_fee: 0,
      is_active: true,
    });
    setEditingPeriod(null);
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (period: RegistrationPeriod) => {
    setEditingPeriod(period);
    setFormData({
      name: period.name,
      academic_year: period.academic_year,
      wave: period.wave,
      opens_at: period.opens_at ? period.opens_at.split("T")[0] : "",
      closes_at: period.closes_at ? period.closes_at.split("T")[0] : "",
      announcement_at: period.announcement_at ? period.announcement_at.split("T")[0] : "",
      description: period.description || "",
      registration_fee: Number(period.registration_fee) || 0,
      is_active: period.is_active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openQuotaModal = (period: RegistrationPeriod) => {
    setQuotaModalPeriod(period);
    setQuotaError(null);
    const initialMap: Record<number, number> = {};
    units.forEach((u) => {
      const existing = period.quotas?.find((q) => q.education_unit_id === u.id);
      initialMap[u.id] = existing ? existing.quota : 0;
    });
    setQuotaInputs(initialMap);
  };

  const handleSubmitPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (editingPeriod) {
      updateMutation.mutate({ id: editingPeriod.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleSaveQuotas = (e: React.FormEvent) => {
    e.preventDefault();
    setQuotaError(null);
    if (!quotaModalPeriod) return;
    const quotasArray = Object.entries(quotaInputs).map(([unitId, quota]) => ({
      education_unit_id: Number(unitId),
      quota: Number(quota),
    }));
    quotaMutation.mutate({ periodId: quotaModalPeriod.id, quotas: quotasArray });
  };

  // Stats
  const totalPeriods = periods.length;
  const activePeriods = periods.filter((p) => p.is_active).length;
  const totalStudents = periods.reduce((sum, p) => sum + (p.student_applications_count || 0), 0);

  // Available academic years for filter
  const uniqueYears = Array.from(new Set(periods.map((p) => p.academic_year)));

  return (
    <div className="space-y-6">
      <SeoHead title="Periode & Kuota Pendaftaran — Master Data Admin" />

      <AdminPageHeader
        title="Periode & Kuota Pendaftaran"
        subtitle="Atur tahun ajaran aktif, gelombang pendaftaran murid baru (PPDB), rentang tanggal, biaya formulir, dan alokasi daya tampung kuota per unit sekolah."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Master Data" },
          { label: "Periode & Kuota" },
        ]}
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Periode</span>
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Total Periode PPDB"
          value={totalPeriods}
          subtitle="Riwayat gelombang tersimpan"
          icon={<CalendarDays className="w-5 h-5" />}
          variant="navy"
        />
        <AdminStatCard
          title="Periode Aktif"
          value={activePeriods}
          subtitle="Menerima pendaftaran online"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="leaf"
        />
        <AdminStatCard
          title="Total Siswa Mendaftar"
          value={totalStudents}
          subtitle="Akumulasi seluruh gelombang"
          icon={<Users className="w-5 h-5" />}
          variant="primary"
        />
      </div>

      {/* Filter Year Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted shrink-0" />
          <span className="text-xs font-semibold text-navy">Filter Tahun Ajaran:</span>
          <select
            value={academicYearFilter}
            onChange={(e) => setAcademicYearFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-1.5 text-xs text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua Tahun Ajaran</option>
            {uniqueYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-muted">
          Menampilkan {periods.length} gelombang pendaftaran
        </span>
      </div>

      {/* Periods List */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
          <p>Memuat daftar periode pendaftaran...</p>
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 text-center text-danger">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
          <p className="font-semibold">Gagal memuat periode pendaftaran</p>
          <button onClick={() => refetch()} className="mt-3 text-sm underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      ) : periods.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 text-muted/60" />
          <h3 className="text-base font-semibold text-foreground">Belum Ada Periode Pendaftaran</h3>
          <p className="text-sm mt-1">Klik tombol &quot;Tambah Periode&quot; untuk membuka gelombang PPDB baru.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {periods.map((period) => (
            <div
              key={period.id}
              className="bg-white rounded-xl border border-border hover:border-primary/40 transition shadow-sm p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {/* Instant Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => toggleActiveMutation.mutate(period.id)}
                      title="Klik untuk mengubah status aktif gelombang"
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition ${
                        period.is_active
                          ? "bg-leaf/15 text-leaf border border-leaf/30 hover:bg-leaf/25"
                          : "bg-surface text-muted border border-border hover:bg-surface/80"
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {period.is_active ? "Aktif (Menerima Pendaftar)" : "Nonaktif / Tutup"}
                    </button>

                    <span className="font-bold text-navy text-xs px-2 py-0.5 rounded bg-surface border border-border">
                      Tahun Ajaran {period.academic_year}
                    </span>
                    <span className="text-xs text-muted font-medium">Gelombang {period.wave}</span>
                  </div>
                  <h3 className="text-xl font-bold text-navy">{period.name}</h3>
                  {period.description && (
                    <p className="text-xs text-muted mt-1">{period.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => openQuotaModal(period)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition rounded-lg text-xs font-semibold"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Atur Kuota Unit
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(period)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border text-navy hover:border-primary transition rounded-lg text-xs font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5 text-primary" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(period.id)}
                    className="p-2 bg-white border border-border text-danger hover:bg-danger/10 transition rounded-lg"
                    title="Hapus Periode"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Details & Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
                <div className="bg-surface/50 p-3 rounded-lg border border-border/50">
                  <span className="text-muted block mb-1">Masa Pendaftaran:</span>
                  <div className="font-semibold text-foreground">
                    {new Date(period.opens_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    &mdash;{" "}
                    {new Date(period.closes_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="bg-surface/50 p-3 rounded-lg border border-border/50">
                  <span className="text-muted block mb-1">Pengumuman Kelulusan:</span>
                  <div className="font-semibold text-foreground">
                    {period.announcement_at
                      ? new Date(period.announcement_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Sesuai jadwal seleksi"}
                  </div>
                </div>

                <div className="bg-surface/50 p-3 rounded-lg border border-border/50">
                  <span className="text-muted block mb-1">Biaya Pendaftaran:</span>
                  <div className="font-semibold text-foreground flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-warning" />
                    {Number(period.registration_fee) > 0
                      ? `Rp ${Number(period.registration_fee).toLocaleString("id-ID")}`
                      : "Gratis"}
                  </div>
                </div>

                <div className="bg-surface/50 p-3 rounded-lg border border-border/50">
                  <span className="text-muted block mb-1">Pendaftar Masuk:</span>
                  <div className="font-semibold text-primary text-sm">
                    {period.student_applications_count || 0} Calon Murid
                  </div>
                </div>
              </div>

              {/* Quotas Breakdown */}
              <div className="mt-4 pt-3 border-t border-border">
                <span className="text-xs font-semibold text-navy flex items-center gap-1.5 mb-2">
                  <Building className="w-3.5 h-3.5 text-primary" /> Alokasi Kuota Daya Tampung:
                </span>
                <div className="flex flex-wrap gap-2">
                  {period.quotas && period.quotas.length > 0 ? (
                    period.quotas.map((q) => (
                      <span
                        key={q.id || q.education_unit_id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-lg text-xs"
                      >
                        <span className="font-medium text-foreground">
                          {q.education_unit?.name || `Unit #${q.education_unit_id}`}:
                        </span>
                        <strong className="text-navy">{q.quota} Siswa</strong>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted italic">
                      Belum ada alokasi kuota unit. Klik &quot;Atur Kuota Unit&quot; di atas untuk menetapkan kapasitas sekolah.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Periode */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border max-w-xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                {editingPeriod ? "Edit Periode Pendaftaran" : "Buka Periode PPDB Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPeriod} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Periode / Gelombang *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PPDB Gelombang 1 TP 2026/2027"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tahun Ajaran *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2026/2027"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nomor Gelombang *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.wave || 1}
                    onChange={(e) => setFormData({ ...formData, wave: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tanggal Buka Pendaftaran *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.opens_at}
                    onChange={(e) => setFormData({ ...formData, opens_at: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tanggal Tutup Pendaftaran *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.closes_at}
                    onChange={(e) => setFormData({ ...formData, closes_at: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tanggal Pengumuman Kelulusan
                  </label>
                  <input
                    type="date"
                    value={formData.announcement_at || ""}
                    onChange={(e) => setFormData({ ...formData, announcement_at: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Biaya Formulir Pendaftaran (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="0 jika gratis"
                    value={formData.registration_fee || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, registration_fee: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Catatan / Keterangan Gelombang
                </label>
                <textarea
                  rows={2}
                  placeholder="Informasi alur tes, kuota khusus, atau catatan gelombang..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="period_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="period_is_active" className="text-xs font-medium text-foreground cursor-pointer">
                  Jadikan periode ini aktif untuk pendaftaran murid baru saat ini
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted hover:bg-surface transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition shadow-sm disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan Periode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Atur Kuota Unit */}
      {quotaModalPeriod && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="font-bold text-navy text-base flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  Atur Kuota Sekolah
                </h3>
                <p className="text-xs text-muted mt-0.5">{quotaModalPeriod.name}</p>
              </div>
              <button
                onClick={() => setQuotaModalPeriod(null)}
                className="text-muted hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {quotaError && (
              <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{quotaError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuotas} className="space-y-4 pt-4">
              <p className="text-xs text-muted">
                Tentukan daya tampung maksimum murid baru untuk masing-masing unit pendidikan pada periode gelombang ini.
              </p>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between gap-3 p-3 bg-surface rounded-lg border border-border"
                  >
                    <div>
                      <span className="font-semibold text-navy text-xs block">{unit.name}</span>
                      <span className="text-[11px] text-muted font-mono uppercase">{unit.level} &bull; {unit.code}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={quotaInputs[unit.id] ?? 0}
                        onChange={(e) =>
                          setQuotaInputs({
                            ...quotaInputs,
                            [unit.id]: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-20 px-2 py-1.5 border border-border rounded text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="text-xs text-muted">Kursi</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setQuotaModalPeriod(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted hover:bg-surface transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={quotaMutation.isPending}
                  className="px-5 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition shadow-sm disabled:opacity-50"
                >
                  {quotaMutation.isPending ? "Menyimpan Kuota..." : "Simpan Kuota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Hapus */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId !== null) {
            deleteMutation.mutate(deleteTargetId);
          }
        }}
        title="Hapus Periode Pendaftaran"
        message="Apakah Anda yakin ingin menghapus periode pendaftaran ini? Semua riwayat pendaftaran murid yang sudah ada tetap aman di database."
        confirmText="Hapus Periode"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default PeriodsPage;
