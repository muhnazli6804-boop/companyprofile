import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileCheck2,
  Plus,
  Users,
  Briefcase,
  Building,
  Edit,
  Trash2,
  AlertCircle,
  Filter,
  Search,
  Power,
} from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { AdminPageHeader, ConfirmModal } from "@/components/admin";
import {
  getDocumentRequirements,
  createDocumentRequirement,
  updateDocumentRequirement,
  toggleRequirementActive,
  deleteDocumentRequirement,
} from "../api";
import { DocumentRequirement, DocumentRequirementPayload } from "../types";
import { apiClient } from "@/lib/api-client";

export const DocumentRequirementsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<DocumentRequirement | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<DocumentRequirementPayload>({
    applicant_type: "student",
    education_unit_id: null,
    document_type: "",
    label: "",
    description: "",
    is_required: true,
    max_size_kb: 2048,
    allowed_mimes: "pdf,jpg,jpeg,png",
    max_files: 1,
    sort_order: 1,
    is_active: true,
  });

  // Fetch education units for dropdown
  const { data: units = [] } = useQuery({
    queryKey: ["education-units-list"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Array<{ id: number; name: string; code: string }> }>("/admin/education-units");
      return res.data.data;
    },
  });

  const { data: requirements = [], isLoading, error, refetch } = useQuery({
    queryKey: ["admin-doc-requirements", { activeTab, selectedUnit, search }],
    queryFn: () =>
      getDocumentRequirements({
        applicant_type: activeTab,
        education_unit_id: selectedUnit || undefined,
        search: search || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: DocumentRequirementPayload) => createDocumentRequirement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doc-requirements"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal menyimpan syarat dokumen.";
      setFormError(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<DocumentRequirementPayload> }) =>
      updateDocumentRequirement(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doc-requirements"] });
      setIsModalOpen(false);
      setEditingReq(null);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal memperbarui syarat dokumen.";
      setFormError(msg);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => toggleRequirementActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doc-requirements"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDocumentRequirement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doc-requirements"] });
      setDeleteTargetId(null);
    },
  });

  const resetForm = () => {
    setFormData({
      applicant_type: activeTab,
      education_unit_id: null,
      document_type: "",
      label: "",
      description: "",
      is_required: true,
      max_size_kb: 2048,
      allowed_mimes: "pdf,jpg,jpeg,png",
      max_files: 1,
      sort_order: 1,
      is_active: true,
    });
    setEditingReq(null);
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, applicant_type: activeTab }));
    setIsModalOpen(true);
  };

  const openEditModal = (req: DocumentRequirement) => {
    setEditingReq(req);
    setFormData({
      applicant_type: req.applicant_type,
      education_unit_id: req.education_unit_id,
      document_type: req.document_type,
      label: req.label,
      description: req.description || "",
      is_required: req.is_required,
      max_size_kb: req.max_size_kb,
      allowed_mimes: req.allowed_mimes,
      max_files: req.max_files,
      sort_order: req.sort_order,
      is_active: req.is_active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (editingReq) {
      updateMutation.mutate({ id: editingReq.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Kelola Syarat Dokumen — Master Data Admin" />

      <AdminPageHeader
        title="Kelola Syarat Dokumen"
        subtitle="Atur daftar berkas dan lampiran persyaratan yang wajib maupun opsional diunggah oleh calon murid (PPDB) dan pelamar guru."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Master Data" },
          { label: "Syarat Dokumen" },
        ]}
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Syarat Dokumen</span>
          </button>
        }
      />

      {/* Tabs Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab("student");
              setSelectedUnit("");
              setSearch("");
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === "student"
                ? "bg-navy text-white shadow-sm"
                : "bg-surface text-muted hover:text-navy"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Dokumen Murid (PPDB)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("teacher");
              setSelectedUnit("");
              setSearch("");
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === "teacher"
                ? "bg-navy text-white shadow-sm"
                : "bg-surface text-muted hover:text-navy"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Dokumen Pelamar Guru</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Cari label / kode dokumen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-52"
            />
          </div>

          {activeTab === "student" && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted shrink-0" />
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Semua Jenjang / Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Requirements Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
          <p>Memuat syarat dokumen...</p>
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 text-center text-danger">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
          <p className="font-semibold">Gagal memuat syarat dokumen</p>
          <button onClick={() => refetch()} className="mt-3 text-sm underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      ) : requirements.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <FileCheck2 className="w-12 h-12 mx-auto mb-3 text-muted/60" />
          <h3 className="text-base font-semibold text-foreground">Belum Ada Syarat Dokumen</h3>
          <p className="text-sm mt-1">
            Klik tombol &quot;Tambah Syarat Dokumen&quot; di atas untuk menetapkan berkas persyaratan.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface border-b border-border text-muted uppercase font-semibold">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Dokumen</th>
                  <th className="py-3 px-4">Kode Jenis</th>
                  <th className="py-3 px-4">Unit Sekolah</th>
                  <th className="py-3 px-4">Kewajiban</th>
                  <th className="py-3 px-4">Batas Ukuran &amp; Format</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requirements.map((req, idx) => (
                  <tr key={req.id} className="hover:bg-surface/50 transition">
                    <td className="py-3 px-4 text-center text-muted font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-navy text-sm">{req.label}</div>
                      {req.description && (
                        <div className="text-muted text-[11px] line-clamp-1">{req.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted">{req.document_type}</td>
                    <td className="py-3 px-4">
                      {req.education_unit ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-navy">
                          <Building className="w-3 h-3 text-primary" />
                          {req.education_unit.name}
                        </span>
                      ) : (
                        <span className="text-muted italic">Semua Unit</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {req.is_required ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-danger/10 text-danger border border-danger/20">
                          Wajib
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface text-muted border border-border">
                          Opsional
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      <div>Maks: {Math.round(req.max_size_kb / 1024)} MB ({req.max_files} berkas)</div>
                      <div className="font-mono text-[10px] text-muted/80">{req.allowed_mimes}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {/* Instant Toggle Active */}
                      <button
                        type="button"
                        onClick={() => toggleActiveMutation.mutate(req.id)}
                        title="Klik untuk mengubah status aktif"
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                          req.is_active
                            ? "bg-leaf/15 text-leaf border border-leaf/30 hover:bg-leaf/25"
                            : "bg-surface text-muted border border-border hover:bg-surface/80"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {req.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(req)}
                          className="p-1 text-muted hover:text-primary transition rounded hover:bg-surface"
                          title="Edit Syarat Dokumen"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(req.id)}
                          className="p-1 text-muted hover:text-danger transition rounded hover:bg-surface"
                          title="Hapus Syarat Dokumen"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Tambah / Edit Dokumen Persyaratan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-primary" />
                {editingReq ? "Edit Syarat Dokumen" : "Tambah Syarat Dokumen Baru"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Jenis Sasaran Dokumen *
                  </label>
                  <select
                    value={formData.applicant_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicant_type: e.target.value as "student" | "teacher",
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="student">Calon Murid (PPDB)</option>
                    <option value="teacher">Pelamar Guru</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Berlaku untuk Unit Sekolah
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
                    <option value="">Semua Unit (Umum)</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama / Label Dokumen *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kartu Keluarga (KK)"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kode Jenis Dokumen (Key) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="family_card, birth_certificate, id_card, diploma"
                  value={formData.document_type}
                  onChange={(e) =>
                    setFormData({ ...formData, document_type: e.target.value.toLowerCase().replace(/\s+/g, "_") })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Petunjuk Pengunggahan (Deskripsi)
                </label>
                <textarea
                  rows={2}
                  placeholder="Petunjuk khusus bagi pendaftar saat memindai berkas..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Maks. Ukuran (KB)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={20480}
                    value={formData.max_size_kb || 2048}
                    onChange={(e) => setFormData({ ...formData, max_size_kb: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Maks. Jumlah Berkas
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.max_files || 1}
                    onChange={(e) => setFormData({ ...formData, max_files: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Urutan
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

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Format Ekstensi Diizinkan
                </label>
                <input
                  type="text"
                  placeholder="pdf,jpg,jpeg,png"
                  value={formData.allowed_mimes || "pdf,jpg,jpeg,png"}
                  onChange={(e) => setFormData({ ...formData, allowed_mimes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Dokumen ini Wajib Diunggah
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Aktifkan syarat dokumen ini di formulir
                  </span>
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
                  {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan Syarat"}
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
        title="Hapus Syarat Dokumen"
        message="Apakah Anda yakin ingin menghapus syarat dokumen ini? Berkas pendaftar yang sudah tersimpan sebelumnya tidak akan hilang."
        confirmText="Hapus Syarat"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default DocumentRequirementsPage;
