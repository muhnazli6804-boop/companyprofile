import React, { useState } from 'react';
import { CheckCircle2, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/data/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/feedback/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils';
import { isSuperAdmin, useCurrentUser } from '@/features/auth/permissions';
import { apiErrorInfo } from '../api';
import { useDeleteUser, useResetUserPassword, useRoles, useSetUserActive, useUsers } from '../hooks';
import type { AdminUser } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { PromoteUserModal } from './PromoteUserModal';
import { UserFormModal } from './UserFormModal';

type Confirm = { kind: 'deactivate' | 'delete' | 'reset'; user: AdminUser };

const CONFIRM_TEXT = {
  deactivate: { title: 'Nonaktifkan akun?', action: 'Nonaktifkan', danger: true },
  delete: { title: 'Hapus akun?', action: 'Hapus', danger: true },
  reset: { title: 'Reset password?', action: 'Kirim tautan', danger: false },
} as const;

const TYPE_OPTIONS = [
  { label: 'Semua', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'Pendaftar', value: 'applicant' },
];
const STATUS_OPTIONS = [
  { label: 'Semua', value: '' },
  { label: 'Aktif', value: 'true' },
  { label: 'Nonaktif', value: 'false' },
];

/** Alasan akun pendaftar belum bisa dijadikan admin (cermin syarat backend); null bila memenuhi syarat. */
const promoteBlocker = (u: AdminUser) =>
  !u.is_active ? 'Aktifkan akun lebih dulu' : !u.email_verified_at ? 'Email belum diverifikasi' : null;

export const UsersTab: React.FC = () => {
  const { data: me } = useCurrentUser();
  const viewerIsSuper = isSuperAdmin(me);
  const roles = useRoles();

  const [search, setSearch] = useState('');
  const [userType, setUserType] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search.trim(), 300);

  const users = useUsers({ q, user_type: userType, role, is_active: isActive, page });

  const [form, setForm] = useState<{ user: AdminUser | null } | null>(null);
  const [promoting, setPromoting] = useState<AdminUser | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const setActive = useSetUserActive();
  const resetPassword = useResetUserPassword();
  const remove = useDeleteUser();
  const busy = setActive.isPending || resetPassword.isPending || remove.isPending;

  const filter = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  const openConfirm = (c: Confirm) => {
    setConfirmError(null);
    setConfirm(c);
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setConfirmError(null);
    const { kind, user } = confirm;
    try {
      if (kind === 'deactivate') {
        await setActive.mutateAsync({ id: user.id, is_active: false });
        setNotice(`Akun ${user.name} dinonaktifkan.`);
      } else if (kind === 'delete') {
        await remove.mutateAsync(user.id);
        setNotice(`Akun ${user.name} dihapus.`);
      } else {
        const res = await resetPassword.mutateAsync(user.id);
        setNotice(res.message);
      }
      setConfirm(null);
    } catch (err) {
      setConfirmError(apiErrorInfo(err).message);
    }
  };

  const activate = async (user: AdminUser) => {
    setNotice(null);
    setPageError(null);
    try {
      await setActive.mutateAsync({ id: user.id, is_active: true });
      setNotice(`Akun ${user.name} diaktifkan.`);
    } catch (err) {
      setPageError(apiErrorInfo(err).message);
    }
  };

  const rows = users.data?.data ?? [];
  const meta = users.data?.meta;
  const roleOptions = [{ label: 'Semua', value: '' }, ...(roles.data ?? []).map((r) => ({ label: r.label, value: r.name }))];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
          <Input
            label="Cari pengguna"
            type="search"
            placeholder="Nama atau email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select label="Jenis akun" className="w-full" value={userType} onChange={filter(setUserType)} options={TYPE_OPTIONS} />
          <Select label="Role" className="w-full" value={role} onChange={filter(setRole)} options={roleOptions} />
          <Select label="Status" className="w-full" value={isActive} onChange={filter(setIsActive)} options={STATUS_OPTIONS} />
        </div>
        <Button onClick={() => setForm({ user: null })}>Tambah admin</Button>
      </div>

      {notice && (
        <p role="status" className="rounded-control border border-leaf bg-tint-100 px-4 py-3 text-ink">
          {notice}
        </p>
      )}
      {pageError && (
        <p role="alert" className="rounded-control border-2 border-danger px-4 py-3 text-danger">
          {pageError}
        </p>
      )}

      {users.isError && !users.data ? (
        <div role="alert" className="rounded-control border-2 border-danger p-4 text-danger flex flex-wrap items-center gap-3">
          <span>{apiErrorInfo(users.error).message}</span>
          <Button variant="secondary" onClick={() => users.refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : users.isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="Tidak ada pengguna yang cocok" description="Ubah kata kunci atau filter untuk melihat hasil lain." />
      ) : (
        <div className="rounded-panel border border-line bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-tint-100 text-ink">
                <tr>
                  {['Nama', 'Email', 'Jenis akun', 'Role', 'Status', 'Terakhir masuk', 'Aksi'].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-bold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                  const targetIsSuper = u.roles.some((r) => r.name === 'super_admin');
                  const canManageAdmin = u.user_type === 'admin' && (viewerIsSuper || !targetIsSuper);
                  return (
                    <tr key={u.id} className="border-t border-line hover:bg-tint-100">
                      <td className="px-4 py-3 font-bold text-ink">{u.name}</td>
                      <td className="px-4 py-3 text-ink">{u.email}</td>
                      <td className="px-4 py-3 text-ink">{u.user_type === 'admin' ? 'Admin' : 'Pendaftar'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge key={r.id} className="bg-tint-200 text-primary">
                              {r.label}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-leaf font-bold">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-muted font-bold">
                            <MinusCircle className="h-4 w-4" aria-hidden="true" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink">{u.last_login_at ? formatDate(u.last_login_at) : 'Belum pernah'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {canManageAdmin && (
                            <>
                              <RowButton label="Ubah" name={u.name} onClick={() => setForm({ user: u })} />
                              <RowButton label="Reset password" name={u.name} onClick={() => openConfirm({ kind: 'reset', user: u })} />
                            </>
                          )}
                          {(u.user_type === 'applicant' || canManageAdmin) &&
                            (u.is_active ? (
                              <RowButton label="Nonaktifkan" name={u.name} onClick={() => openConfirm({ kind: 'deactivate', user: u })} />
                            ) : (
                              <RowButton label="Aktifkan" name={u.name} disabled={busy} onClick={() => activate(u)} />
                            ))}
                          {canManageAdmin && (
                            <RowButton label="Hapus" name={u.name} danger onClick={() => openConfirm({ kind: 'delete', user: u })} />
                          )}
                          {u.user_type === 'applicant' && viewerIsSuper && (
                            <>
                              <RowButton label="Jadikan admin" name={u.name} disabled={!!promoteBlocker(u)} onClick={() => setPromoting(u)} />
                              {promoteBlocker(u) && <span className="w-full text-xs text-muted">{promoteBlocker(u)}</span>}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {meta && <Pagination currentPage={meta.current_page} totalPages={meta.last_page} total={meta.total} onPageChange={setPage} />}
        </div>
      )}

      {form && (
        <UserFormModal
          key={form.user?.id ?? 'baru'}
          isOpen
          user={form.user}
          roles={roles.data ?? []}
          canGrantSuperAdmin={viewerIsSuper}
          onClose={() => setForm(null)}
          onSaved={(saved) => {
            setNotice(
              form.user ? `Perubahan akun ${saved.name} disimpan.` : `Akun admin dibuat untuk ${saved.name}. Tautan atur kata sandi dikirim ke email akun.`,
            );
            setPageError(null);
            setForm(null);
          }}
        />
      )}

      {promoting && (
        <PromoteUserModal
          key={promoting.id}
          user={promoting}
          roles={roles.data ?? []}
          onClose={() => setPromoting(null)}
          onPromoted={(saved) => {
            setNotice(`${saved.name} kini admin. Pemilik akun harus masuk ulang untuk memakai panel admin.`);
            setPageError(null);
            setPromoting(null);
          }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={CONFIRM_TEXT[confirm.kind].title}
          confirmLabel={CONFIRM_TEXT[confirm.kind].action}
          danger={CONFIRM_TEXT[confirm.kind].danger}
          isLoading={busy}
          error={confirmError}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
        >
          {confirm.kind === 'deactivate' && <p>{confirm.user.name} tidak akan bisa masuk sampai diaktifkan kembali.</p>}
          {confirm.kind === 'delete' && <p>Akun {confirm.user.name} akan dihapus dan tidak bisa masuk lagi. Tindakan ini tidak dapat dibatalkan dari panel.</p>}
          {confirm.kind === 'reset' && <p>Tautan untuk menentukan kata sandi baru akan dikirim ke {confirm.user.email}.</p>}
        </ConfirmDialog>
      )}
    </div>
  );
};

const RowButton: React.FC<{ label: string; name: string; onClick: () => void; danger?: boolean; disabled?: boolean }> = ({
  label,
  name,
  onClick,
  danger,
  disabled,
}) => (
  <Button
    variant={danger ? 'danger' : 'secondary'}
    className="!min-h-[40px] !px-3 !py-1 !text-sm"
    aria-label={`${label} ${name}`}
    disabled={disabled}
    onClick={onClick}
  >
    {label}
  </Button>
);
