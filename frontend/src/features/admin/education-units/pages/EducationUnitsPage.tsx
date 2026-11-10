import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Award,
  User,
  CheckCircle2,
  Edit,
  Trash2,
  AlertCircle,
  Users,
  Briefcase,
  Power,
  Upload,
} from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { AdminPageHeader, AdminStatCard, ConfirmModal } from "@/components/admin";
import {
  getEducationUnits,
  createEducationUnit,
  updateEducationUnit,
  toggleUnitActive,
  deleteEducationUnit,
  uploadUnitMedia,
} from "../api";
import { EducationUnit, EducationUnitPayload } from "../types";

export const EducationUnitsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<EducationUnit | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EducationUnitPayload>({
    name: "",
    code: "",
    level: "sd",
    tagline: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website_url: "",
    accreditation: "A",
    principal_name: "",
    is_active: true,
    sort_order: 1,
  });

  const { data: units = [], isLoading, error, refetch } = useQuery({
    queryKey: ["admin-education-units", { search, selectedLevel }],
    queryFn: () =>
      getEducationUnits({
        search: search || undefined,
        level: selectedLevel || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: EducationUnitPayload) => createEducationUnit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education-units"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal menyimpan unit sekolah.";
      setFormError(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EducationUnitPayload> }) =>
      updateEducationUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education-units"] });
      setIsModalOpen(false);
      setEditingUnit(null);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal memperbarui unit sekolah.";
      setFormError(msg);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => toggleUnitActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education-units"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEducationUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education-units"] });
      setDeleteTargetId(null);
    },
  });

  const uploadMediaMutation = useMutation({
    mutationFn: ({ id, type, file }: { id: number; type: "logo" | "cover"; file: File }) =>
      uploadUnitMedia(id, type, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education-units"] });
      alert("Berkas gambar berhasil diperbarui.");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      level: "sd",
      tagline: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website_url: "",
      accreditation: "A",
      principal_name: "",
      is_active: true,
      sort_order: 1,
    });
    setEditingUnit(null);
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (unit: EducationUnit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      code: unit.code,
      level: unit.level,
      tagline: unit.tagline || "",
      description: unit.description || "",
      address: unit.address || "",
      phone: unit.phone || "",
      email: unit.email || "",
      website_url: unit.website_url || "",
      accreditation: unit.accreditation || "A",
      principal_name: unit.principal_name || "",
      is_active: unit.is_active,
      sort_order: unit.sort_order || 1,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Stats calculation
  const totalUnits = units.length;
  const activeUnits = units.filter((u) => u.is_active).length;
  const totalStudents = units.reduce((acc, u) => acc + (u.student_applications_count || 0), 0);
  const totalTeachers = units.reduce((acc, u) => acc + (u.teacher_applications_count || 0), 0);

  return (
    <div className="space-y-6">
      <SeoHead title="Data Sekolah & Unit Pendidikan — Master Data Admin" />

      <AdminPageHeader
        title="Data Sekolah & Unit Pendidikan"
        subtitle="Kelola informasi sekolah di bawah naungan yayasan, jenjang pendidikan, akreditasi, kontak, dan status operasional."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Master Data" },
          { label: "Unit Pendidikan" },
        ]}
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sekolah</span>
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Unit Sekolah"
          value={totalUnits}
          subtitle="Terdaftar di yayasan"
          icon={<Building2 className="w-5 h-5" />}
          variant="navy"
        />
        <AdminStatCard
          title="Unit Aktif"
          value={activeUnits}
          subtitle="Operasional penuh"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="leaf"
        />
        <AdminStatCard
          title="Pendaftar Siswa"
          value={totalStudents}
          subtitle="Akumulasi PPDB"
          icon={<Users className="w-5 h-5" />}
          variant="primary"
        />
        <AdminStatCard
          title="Pelamar Guru"
          value={totalTeachers}
          subtitle="Akumulasi rekrutmen"
          icon={<Briefcase className="w-5 h-5" />}
          variant="warning"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Cari nama sekolah, kode, atau kepala sekolah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted shrink-0" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Semua Jenjang</option>
              <option value="paud">PAUD</option>
              <option value="tk">TK</option>
              <option value="sd">SD</option>
              <option value="smp">SMP</option>
              <option value="sma">SMA</option>
              <option value="smk">SMK</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Education Units */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
          <p>Memuat data sekolah...</p>
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 text-center text-danger">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
          <p className="font-semibold">Gagal memuat data sekolah</p>
          <button onClick={() => refetch()} className="mt-3 text-sm underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      ) : units.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-muted/60" />
          <h3 className="text-base font-semibold text-foreground">Tidak Ada Data Sekolah</h3>
          <p className="text-sm mt-1">Silakan tambahkan data sekolah baru menggunakan tombol di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-xl border border-border hover:border-primary/40 transition shadow-sm hover:shadow flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-navy text-white uppercase tracking-wider">
                        {unit.level}
                      </span>
                      <span className="font-mono text-xs text-muted font-medium">
                        Kode: {unit.code}
                      </span>
                      {unit.accreditation && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-warning/15 text-warning font-semibold border border-warning/30">
                          <Award className="w-3 h-3" /> Akreditasi {unit.accreditation}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-navy">{unit.name}</h3>
                    {unit.tagline && (
                      <p className="text-xs text-muted italic mt-0.5">&ldquo;{unit.tagline}&rdquo;</p>
                    )}
                  </div>

                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => toggleActiveMutation.mutate(unit.id)}
                    title="Klik untuk mengubah status aktif"
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition ${
                      unit.is_active
                        ? "bg-leaf/15 text-leaf border border-leaf/30 hover:bg-leaf/25"
                        : "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {unit.is_active ? "Aktif" : "Nonaktif"}
                  </button>
                </div>

                {unit.description && (
                  <p className="text-xs text-muted line-clamp-2 mb-4 bg-surface/50 p-3 rounded-lg border border-border/50">
                    {unit.description}
                  </p>
                )}

                <div className="space-y-2 text-xs text-muted mb-4">
                  {unit.principal_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        Kepala Sekolah: <strong className="text-foreground">{unit.principal_name}</strong>
                      </span>
                    </div>
                  )}

                  {unit.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{unit.address}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    {unit.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{unit.phone}</span>
                      </div>
                    )}
                    {unit.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{unit.email}</span>
                      </div>
                    )}
                    {unit.website_url && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                        <a
                          href={unit.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-primary"
                        >
                          Kunjungi Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-stats for Applications */}
                <div className="grid grid-cols-3 gap-2 bg-surface/80 p-3 rounded-lg border border-border text-center text-xs">
                  <div>
                    <span className="text-muted block text-[11px]">Pendaftar Murid</span>
                    <span className="font-bold text-navy text-sm">{unit.student_applications_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Pelamar Guru</span>
                    <span className="font-bold text-primary text-sm">{unit.teacher_applications_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Lowongan Aktif</span>
                    <span className="font-bold text-leaf text-sm">{unit.teacher_vacancies_count || 0}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="bg-surface/50 px-6 py-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted">
                  Urutan Tampilan: #{unit.sort_order ?? 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(unit)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border text-xs font-semibold text-navy rounded-lg hover:border-primary transition"
                  >
                    <Edit className="w-3.5 h-3.5 text-primary" /> Edit Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(unit.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border text-xs font-semibold text-danger rounded-lg hover:bg-danger/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Unit Pendidikan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                {editingUnit ? "Edit Unit Sekolah" : "Tambah Unit Sekolah Baru"}
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

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nama Sekolah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMP Padindi Jakarta"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Kode Singkat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMP-PADINDI"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Jenjang Pendidikan *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="paud">PAUD</option>
                    <option value="tk">TK</option>
                    <option value="sd">SD</option>
                    <option value="smp">SMP</option>
                    <option value="sma">SMA</option>
                    <option value="smk">SMK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Akreditasi
                  </label>
                  <select
                    value={formData.accreditation || "A"}
                    onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="A">A (Unggul)</option>
                    <option value="B">B (Baik)</option>
                    <option value="C">C (Cukup)</option>
                    <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.sort_order || 1}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nama Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    placeholder="Nama lengkap & gelar"
                    value={formData.principal_name || ""}
                    onChange={(e) => setFormData({ ...formData, principal_name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Cerdas, Kreatif, Berkarakter"
                    value={formData.tagline || ""}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Alamat Lengkap Sekolah
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat jalan, nomor, kelurahan, kecamatan, kota..."
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="021-xxxxxx"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    placeholder="smp@padindi.sch.id"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tautan Website
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.website_url || ""}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Deskripsi / Profil Sekolah
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan sejarah, keunggulan dan profil unit..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Upload Media if Editing */}
              {editingUnit && (
                <div className="p-3 bg-surface rounded-lg border border-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-navy block">Logo Sekolah</span>
                    <span className="text-muted text-[11px]">Perbarui logo khusus unit pendidikan ini</span>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded-lg text-navy font-semibold hover:border-primary cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>{uploadMediaMutation.isPending ? "Mengunggah..." : "Unggah Logo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadMediaMutation.isPending}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          uploadMediaMutation.mutate({
                            id: editingUnit.id,
                            type: "logo",
                            file: e.target.files[0],
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-xs font-medium text-foreground cursor-pointer">
                  Unit sekolah aktif dan dapat dipilih oleh pendaftar murid &amp; guru
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
                  {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan Data Sekolah"}
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
        title="Hapus Unit Sekolah"
        message="Apakah Anda yakin ingin menghapus data sekolah ini? Semua data pendaftaran terkait unit ini tetap tersimpan di riwayat arsip."
        confirmText="Hapus Sekolah"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default EducationUnitsPage;
