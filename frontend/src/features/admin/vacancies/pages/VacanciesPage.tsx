import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  AlertCircle,
  LayoutGrid,
  List,
  ArrowRight,
} from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { AdminPageHeader, AdminStatCard, ConfirmModal } from "@/components/admin";
import { getVacancies, createVacancy, updateVacancy, deleteVacancy, publishVacancy, unpublishVacancy } from "../api";
import { Vacancy, VacancyPayload } from "../types";
import { apiClient } from "@/lib/api-client";

export const VacanciesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<VacancyPayload>({
    title: "",
    education_unit_id: null,
    subject: "",
    employment_type: "Penuh Waktu",
    quota: 1,
    description: "",
    requirements: "",
    opens_at: "",
    closes_at: "",
    is_published: true,
  });

  // Fetch education units for dropdown
  const { data: unitsData } = useQuery({
    queryKey: ["education-units-list"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Array<{ id: number; name: string; code: string }> }>("/admin/education-units");
      return res.data.data;
    },
  });

  // Fetch vacancies
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-vacancies", { search, selectedUnit, selectedStatus, page }],
    queryFn: () =>
      getVacancies({
        search: search || undefined,
        education_unit_id: selectedUnit || undefined,
        status: selectedStatus || undefined,
        page,
        per_page: 15,
      }),
  });

  const vacancies = data?.data || [];
  const meta = data?.meta;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: VacancyPayload) => createVacancy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vacancies"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal menyimpan lowongan.";
      setFormError(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<VacancyPayload> }) => updateVacancy(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vacancies"] });
      setIsModalOpen(false);
      setEditingVacancy(null);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal memperbarui lowongan.";
      setFormError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVacancy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vacancies"] });
      setDeleteTargetId(null);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => publishVacancy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vacancies"] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: number) => unpublishVacancy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vacancies"] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      education_unit_id: null,
      subject: "",
      employment_type: "Penuh Waktu",
      quota: 1,
      description: "",
      requirements: "",
      opens_at: "",
      closes_at: "",
      is_published: true,
    });
    setEditingVacancy(null);
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy);
    setFormData({
      title: vacancy.title,
      education_unit_id: vacancy.education_unit_id,
      subject: vacancy.subject || "",
      employment_type: vacancy.employment_type || "Penuh Waktu",
      quota: vacancy.quota || 1,
      description: vacancy.description || "",
      requirements: vacancy.requirements || "",
      opens_at: vacancy.opens_at ? vacancy.opens_at.split("T")[0] : "",
      closes_at: vacancy.closes_at ? vacancy.closes_at.split("T")[0] : "",
      is_published: vacancy.is_published,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (editingVacancy) {
      updateMutation.mutate({ id: editingVacancy.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Stats calculation
  const totalCount = meta?.total || vacancies.length;
  const publishedCount = vacancies.filter((v) => v.is_published).length;
  const totalApplicants = vacancies.reduce((sum, v) => sum + (v.applications_count || 0), 0);
  const totalQuotas = vacancies.reduce((sum, v) => sum + (v.quota || 0), 0);

  return (
    <div className="space-y-6">
      <SeoHead title="Manajemen Lowongan Guru — Master Data Admin" />

      <AdminPageHeader
        title="Manajemen Lowongan Guru"
        subtitle="Kelola informasi lowongan pengajar, formasi mata pelajaran, kualifikasi, kuota, dan status publikasi rekrutmen."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Master Data" },
          { label: "Lowongan Guru" },
        ]}
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lowongan</span>
          </button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Lowongan"
          value={totalCount}
          subtitle="Formasi terdaftar"
          icon={<Briefcase className="w-5 h-5" />}
          variant="navy"
        />
        <AdminStatCard
          title="Lowongan Tayang"
          value={publishedCount}
          subtitle="Aktif menerima pelamar"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="leaf"
        />
        <AdminStatCard
          title="Total Pelamar Terkait"
          value={totalApplicants}
          subtitle="Berkas lamaran masuk"
          icon={<Users className="w-5 h-5" />}
          variant="primary"
        />
        <AdminStatCard
          title="Total Kebutuhan Guru"
          value={totalQuotas}
          subtitle="Kapasitas formasi"
          icon={<Calendar className="w-5 h-5" />}
          variant="warning"
        />
      </div>

      {/* Filters Bar & View Switcher */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Cari posisi atau mata pelajaran..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted shrink-0" />
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setPage(1);
              }}
              className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Semua Unit Sekolah</option>
              {unitsData?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Semua Status</option>
              <option value="published">Tayang / Aktif</option>
              <option value="draft">Draf (Belum Tayang)</option>
              <option value="closed">Ditutup / Berakhir</option>
            </select>
          </div>
        </div>

        {/* View Switcher Button */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition ${
              viewMode === "grid" ? "bg-white text-navy shadow-xs font-semibold" : "text-muted hover:text-navy"
            }`}
            title="Tampilan Grid Card"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded transition ${
              viewMode === "table" ? "bg-white text-navy shadow-xs font-semibold" : "text-muted hover:text-navy"
            }`}
            title="Tampilan Tabel"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Rendering: Grid vs Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
          <p>Memuat daftar lowongan guru...</p>
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 text-center text-danger">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
          <p className="font-semibold">Gagal memuat lowongan</p>
          <button onClick={() => refetch()} className="mt-3 text-sm underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      ) : vacancies.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted/60" />
          <h3 className="text-base font-semibold text-foreground">Tidak Ada Lowongan Ditemukan</h3>
          <p className="text-sm mt-1">Sesuaikan kata kunci pencarian atau klik tombol &quot;Tambah Lowongan&quot; di atas.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              className="bg-white rounded-xl border border-border hover:border-primary/40 transition shadow-sm hover:shadow flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      vacancy.is_published
                        ? "bg-leaf/15 text-leaf border border-leaf/30"
                        : "bg-surface text-muted border border-border"
                    }`}
                  >
                    {vacancy.is_published ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Tayang
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" /> Draf
                      </>
                    )}
                  </span>
                  <span className="text-xs text-muted font-mono">
                    {vacancy.employment_type || "Penuh Waktu"}
                  </span>
                </div>

                <h3 className="font-bold text-navy text-lg leading-snug line-clamp-2 mb-1">
                  {vacancy.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
                  <Building className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span className="truncate">{vacancy.education_unit?.name || "Semua Unit / Yayasan"}</span>
                </div>

                {vacancy.subject && (
                  <div className="mb-3">
                    <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded">
                      Mapel: {vacancy.subject}
                    </span>
                  </div>
                )}

                {vacancy.requirements && (
                  <p className="text-xs text-muted line-clamp-3 mb-4 bg-surface/50 p-2.5 rounded-lg border border-border/50">
                    {vacancy.requirements}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                  <div>
                    <span className="text-muted block">Kebutuhan Kuota:</span>
                    <span className="font-semibold text-foreground">{vacancy.quota ? `${vacancy.quota} Orang` : "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Pelamar Masuk:</span>
                    <Link
                      to={`/admin/lamaran-guru?search=${encodeURIComponent(vacancy.title)}`}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      title="Lihat pelamar lowongan ini"
                    >
                      <span>{vacancy.applications_count || 0} Berkas</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {(vacancy.opens_at || vacancy.closes_at) && (
                  <div className="mt-3 text-[11px] text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted shrink-0" />
                    <span>
                      Batas:{" "}
                      {vacancy.closes_at
                        ? new Date(vacancy.closes_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Tidak ditentukan"}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-surface/60 px-5 py-3 border-t border-border flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    vacancy.is_published
                      ? unpublishMutation.mutate(vacancy.id)
                      : publishMutation.mutate(vacancy.id)
                  }
                  title={vacancy.is_published ? "Tarik dari tayang" : "Publikasikan lowongan"}
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-navy transition font-medium"
                >
                  {vacancy.is_published ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Diarsipkan
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-leaf" /> Tayangkan
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(vacancy)}
                    className="p-1.5 text-muted hover:text-primary transition rounded hover:bg-white"
                    title="Edit Lowongan"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(vacancy.id)}
                    className="p-1.5 text-muted hover:text-danger transition rounded hover:bg-white"
                    title="Hapus Lowongan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface border-b border-border text-muted uppercase font-semibold">
                  <th className="py-3 px-4">Nama Posisi &amp; Unit</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Tipe Kepegawaian</th>
                  <th className="py-3 px-4 text-center">Kuota</th>
                  <th className="py-3 px-4 text-center">Pelamar</th>
                  <th className="py-3 px-4">Batas Akhir</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vacancies.map((vacancy) => (
                  <tr key={vacancy.id} className="hover:bg-surface/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-navy text-sm">{vacancy.title}</div>
                      <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-primary" />
                        <span>{vacancy.education_unit?.name || "Semua Unit / Yayasan"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {vacancy.subject ? (
                        <span className="font-medium text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px]">
                          {vacancy.subject}
                        </span>
                      ) : (
                        <span className="text-muted italic">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {vacancy.employment_type || "Penuh Waktu"}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-navy">
                      {vacancy.quota ? `${vacancy.quota} Orang` : "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/admin/lamaran-guru?search=${encodeURIComponent(vacancy.title)}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                        title="Lihat pelamar lowongan ini"
                      >
                        <span>{vacancy.applications_count || 0}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted whitespace-nowrap">
                      {vacancy.closes_at
                        ? new Date(vacancy.closes_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Tidak ditentukan"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          vacancy.is_published
                            ? "bg-leaf/15 text-leaf border border-leaf/30"
                            : "bg-surface text-muted border border-border"
                        }`}
                      >
                        {vacancy.is_published ? "Tayang" : "Draf"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            vacancy.is_published
                              ? unpublishMutation.mutate(vacancy.id)
                              : publishMutation.mutate(vacancy.id)
                          }
                          className="p-1 text-muted hover:text-navy rounded hover:bg-surface"
                          title={vacancy.is_published ? "Tarik dari publikasi" : "Tayangkan"}
                        >
                          {vacancy.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-leaf" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(vacancy)}
                          className="p-1 text-muted hover:text-primary rounded hover:bg-surface"
                          title="Edit Lowongan"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(vacancy.id)}
                          className="p-1 text-muted hover:text-danger rounded hover:bg-surface"
                          title="Hapus Lowongan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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

      {/* Modal Tambah / Edit Lowongan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                {editingVacancy ? "Edit Lowongan Guru" : "Tambah Lowongan Guru Baru"}
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

            <form onSubmit={handleSubmitForm} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Posisi / Jabatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Guru Matematika SMP"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Unit Sekolah
                  </label>
                  <select
                    value={formData.education_unit_id ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education_unit_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Semua Unit (Yayasan)</option>
                    {unitsData?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Bidang Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Matematika, IPA, Seni Musik"
                    value={formData.subject || ""}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tipe Kepegawaian
                  </label>
                  <select
                    value={formData.employment_type || "Penuh Waktu"}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Penuh Waktu">Penuh Waktu (Full Time)</option>
                    <option value="Paruh Waktu">Paruh Waktu (Part Time)</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Guru Honorer">Guru Honorer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Jumlah Kebutuhan (Kuota)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.quota || 1}
                    onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tanggal Dibuka
                  </label>
                  <input
                    type="date"
                    value={formData.opens_at || ""}
                    onChange={(e) => setFormData({ ...formData, opens_at: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Batas Akhir Pendaftaran
                  </label>
                  <input
                    type="date"
                    value={formData.closes_at || ""}
                    onChange={(e) => setFormData({ ...formData, closes_at: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kualifikasi & Persyaratan Khusus
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Pendidikan minimal S1 Pendidikan Matematika, IPK min 3.00, pengalaman mengajar 1 tahun diutamakan..."
                  value={formData.requirements || ""}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Deskripsi Pekerjaan / Catatan Tambahan
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi tugas dan tanggung jawab pengajar..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="is_published" className="text-xs font-medium text-foreground cursor-pointer">
                  Langsung publikasikan lowongan ke halaman publik yayasan
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
                  {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan Lowongan"}
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
        title="Hapus Lowongan Guru"
        message="Apakah Anda yakin ingin menghapus lowongan ini? Tindakan ini akan mengarsipkan lowongan dari daftar aktif."
        confirmText="Hapus Lowongan"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default VacanciesPage;
