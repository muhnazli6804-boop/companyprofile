import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Search,
  Filter,
  Shield,
  CheckCircle2,
  KeyRound,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Power,
  ShieldCheck,
} from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { AdminPageHeader, AdminStatCard, ConfirmModal } from "@/components/admin";
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserActive,
  resetUserPassword,
  deleteUser,
  getRoles,
} from "../api";
import { AdminUser, UserPayload } from "../types";

export const UsersRolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [formData, setFormData] = useState<UserPayload>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role_ids: [],
    is_active: true,
  });

  // Fetch Roles
  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles-list"],
    queryFn: () => getRoles(),
  });

  // Fetch Users
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-users", { search, selectedRole, page }],
    queryFn: () =>
      getUsers({
        search: search || undefined,
        role_id: selectedRole || undefined,
        page,
      }),
  });

  const users = data?.data || [];
  const meta = data?.meta;

  const createMutation = useMutation({
    mutationFn: (payload: UserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UserPayload> }) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setIsModalOpen(false);
      setEditingUser(null);
      resetForm();
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => toggleUserActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, pass }: { id: number; pass: string }) => resetUserPassword(id, pass),
    onSuccess: () => {
      setResetPasswordUserId(null);
      setNewPassword("");
      alert("Kata sandi berhasil diatur ulang.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteTargetId(null);
    },
    onError: (err: unknown) => {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal menghapus pengguna.";
      alert(errorMsg);
      setDeleteTargetId(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role_ids: [],
      is_active: true,
    });
    setEditingUser(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (u: AdminUser) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      password: "",
      role_ids: u.roles?.map((r) => r.id) || [],
      is_active: u.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const activeCount = users.filter((u) => u.is_active).length;

  return (
    <div className="space-y-6">
      <SeoHead title="Manajemen Pengguna & Hak Akses — Admin Yayasan" />

      <AdminPageHeader
        title="Manajemen Pengguna &amp; Hak Akses"
        subtitle="Kelola akun pengurus yayasan, administrator PPDB, tim rekrutmen guru, serta pembagian peran dan izin akses sistem."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Pengguna & Hak Akses" },
        ]}
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Administrator</span>
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Total Administrator"
          value={meta?.total || users.length}
          subtitle="Akun pengelola terdaftar"
          icon={<Users className="w-5 h-5" />}
          variant="navy"
        />
        <AdminStatCard
          title="Akun Aktif"
          value={activeCount}
          subtitle="Dapat login ke sistem"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="leaf"
        />
        <AdminStatCard
          title="Peran / Role Terkonfigurasi"
          value={roles.length}
          subtitle="Grup izin hak akses"
          icon={<Shield className="w-5 h-5" />}
          variant="primary"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Cari nama, email, atau nomor telepon..."
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
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Semua Peran (Role)</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
          <p>Memuat akun pengguna...</p>
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 text-center text-danger">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
          <p className="font-semibold">Gagal memuat pengguna</p>
          <button onClick={() => refetch()} className="mt-3 text-sm underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted/60" />
          <h3 className="text-base font-semibold text-foreground">Tidak Ada Akun Ditemukan</h3>
          <p className="text-sm mt-1">Sesuaikan kata kunci atau tambahkan akun administrator baru.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface border-b border-border text-muted uppercase font-semibold">
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-4">Kontak</th>
                  <th className="py-3 px-4">Peran / Hak Akses</th>
                  <th className="py-3 px-4 text-center">Status Akun</th>
                  <th className="py-3 px-4">Terakhir Login</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-navy text-sm">{u.name}</div>
                      <div className="text-[11px] text-muted">ID: #{u.id} &bull; Tipe: {u.user_type}</div>
                    </td>
                    <td className="py-3 px-4 text-muted">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                          <Phone className="w-3 h-3 text-muted shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[11px] border border-primary/20"
                            >
                              <ShieldCheck className="w-3 h-3" /> {r.label}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted italic text-[11px]">Belum ada peran</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleActiveMutation.mutate(u.id)}
                        title="Klik untuk mengaktifkan / menonaktifkan akun"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          u.is_active
                            ? "bg-leaf/15 text-leaf border border-leaf/30 hover:bg-leaf/25"
                            : "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {u.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {u.last_login_at ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>
                            {new Date(u.last_login_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="italic text-muted/70">Belum pernah login</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setResetPasswordUserId(u.id)}
                          className="p-1.5 text-muted hover:text-warning transition rounded hover:bg-surface"
                          title="Atur Ulang Kata Sandi"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-muted hover:text-primary transition rounded hover:bg-surface"
                          title="Edit Pengguna"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(u.id)}
                          className="p-1.5 text-muted hover:text-danger transition rounded hover:bg-surface"
                          title="Hapus Pengguna"
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

      {/* Modal Tambah / Edit Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {editingUser ? "Edit Pengguna Administrator" : "Tambah Administrator Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama pengurus atau staf admin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Alamat Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@padindi.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxx"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Kata Sandi Akun *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 8 karakter"
                    value={formData.password || ""}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {/* Roles Multi-checkbox */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Pilih Peran &amp; Hak Akses:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-surface rounded-lg border border-border">
                  {roles.map((r) => {
                    const isChecked = formData.role_ids?.includes(r.id);
                    return (
                      <label key={r.id} className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const nextIds = e.target.checked
                              ? [...(formData.role_ids || []), r.id]
                              : (formData.role_ids || []).filter((id) => id !== r.id);
                            setFormData({ ...formData, role_ids: nextIds });
                          }}
                          className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div>
                          <span className="font-semibold text-navy text-xs block">{r.label}</span>
                          {r.description && (
                            <span className="text-[11px] text-muted">{r.description}</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="user_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="user_is_active" className="text-xs font-medium text-foreground cursor-pointer">
                  Akun aktif dan diizinkan mengakses panel admin
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
                  {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resetPasswordUserId !== null && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-sm w-full p-6 shadow-xl">
            <h3 className="font-bold text-navy text-base flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-warning" />
              Atur Ulang Kata Sandi
            </h3>
            <p className="text-xs text-muted mb-4">
              Masukkan kata sandi baru untuk akun administrator ini.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                resetPasswordMutation.mutate({ id: resetPasswordUserId, pass: newPassword });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kata Sandi Baru (Min. 8 Karakter)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setResetPasswordUserId(null)}
                  className="px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-muted hover:bg-surface"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="px-4 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy/90 disabled:opacity-50"
                >
                  {resetPasswordMutation.isPending ? "Menyimpan..." : "Ubah Kata Sandi"}
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
        title="Hapus Akun Pengguna"
        message="Apakah Anda yakin ingin menghapus akun administrator ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Pengguna"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default UsersRolesPage;
