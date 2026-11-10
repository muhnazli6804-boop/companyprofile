import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { isSuperAdmin, useCurrentUser } from '@/features/auth/permissions';
import { apiErrorInfo } from '../api';
import { usePermissionGroups, useRoles, useUpdateRolePermissions } from '../hooks';
import type { Role } from '../types';

const SUPER_ADMIN = 'super_admin';
const USERS_MANAGE = 'users.manage';

const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((x) => b.has(x));

export const RolesTab: React.FC = () => {
  const { data: me } = useCurrentUser();
  const viewerIsSuper = isSuperAdmin(me);
  const roles = useRoles();
  const groups = usePermissionGroups();
  const update = useUpdateRolePermissions();

  // Hanya kolom yang sedang diubah punya draf; kolom lain membaca langsung dari server.
  const [drafts, setDrafts] = useState<Record<number, Set<string>>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (roles.isError || groups.isError) {
    const failed = roles.isError ? roles : groups;
    return (
      <div role="alert" className="rounded-control border-2 border-danger p-4 text-danger flex flex-wrap items-center gap-3">
        <span>{apiErrorInfo(failed.error).message}</span>
        <Button
          variant="secondary"
          onClick={() => {
            void roles.refetch();
            void groups.refetch();
          }}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  if (!roles.data || !groups.data) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const serverSet = (role: Role) => new Set(role.permissions.map((p) => p.name));
  const currentSet = (role: Role) => drafts[role.id] ?? serverSet(role);
  const isDirty = (role: Role) => !!drafts[role.id] && !sameSet(drafts[role.id], serverSet(role));

  const toggle = (role: Role, permission: string) => {
    const next = new Set(currentSet(role));
    if (!next.delete(permission)) next.add(permission);
    setDrafts((d) => ({ ...d, [role.id]: next }));
    setErrors(({ [role.id]: _cleared, ...rest }) => rest);
    setNotice(null);
  };

  const save = async (role: Role) => {
    setSavingId(role.id);
    setNotice(null);
    setErrors(({ [role.id]: _cleared, ...rest }) => rest);
    try {
      await update.mutateAsync({ id: role.id, permissions: [...currentSet(role)] });
      setDrafts(({ [role.id]: _saved, ...rest }) => rest);
      setNotice(`Izin ${role.label} disimpan.`);
    } catch (err) {
      const info = apiErrorInfo(err);
      setErrors((e) => ({ ...e, [role.id]: info.errors?.permissions?.[0] ?? info.message }));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted">
        Centang izin untuk tiap role, lalu simpan per kolom. Role Super Admin selalu memegang semua izin dan tidak dapat diubah.
      </p>
      {notice && (
        <p role="status" className="rounded-control border border-leaf bg-tint-100 px-4 py-3 text-ink">
          {notice}
        </p>
      )}

      <div className="rounded-panel border border-line bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-tint-100 text-ink">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-tint-100 border-r border-line px-4 py-3 font-bold min-w-[10rem] sm:min-w-[14rem]">
                Izin
              </th>
              {roles.data.map((role) => (
                <th key={role.id} scope="col" className="px-4 py-3 font-bold align-top min-w-[9rem]">
                  <span className="flex items-center gap-1.5">
                    {role.name === SUPER_ADMIN && <Lock className="h-4 w-4" aria-label="Terkunci" />}
                    {role.label}
                  </span>
                  <span className="block text-xs font-normal text-muted">{role.users_count} pengguna</span>
                  {isDirty(role) && <span className="block text-xs font-bold text-danger">Ada perubahan belum disimpan</span>}
                </th>
              ))}
            </tr>
          </thead>
          {groups.data.map((group) => (
            <tbody key={group.group_name}>
              <tr className="bg-paper">
                <th scope="row" colSpan={roles.data.length + 1} className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted">
                  {group.group_name}
                </th>
              </tr>
              {group.permissions.map((permission) => (
                <tr key={permission.id} className="border-t border-line hover:bg-tint-100">
                  <th scope="row" className="sticky left-0 z-10 bg-white border-r border-line px-4 py-2 font-normal text-ink">
                    {permission.label}
                    <span className="block text-xs text-muted">{permission.name}</span>
                  </th>
                  {roles.data.map((role) => {
                    const locked = role.name === SUPER_ADMIN;
                    const onlySuper = permission.name === USERS_MANAGE && !viewerIsSuper;
                    return (
                      <td key={role.id} className="px-4 py-2">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-primary"
                          aria-label={`${permission.label} — ${role.label}`}
                          checked={locked || currentSet(role).has(permission.name)}
                          disabled={locked || onlySuper}
                          onChange={() => toggle(role, permission.name)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot>
            <tr className="border-t border-line">
              <td className="sticky left-0 z-10 bg-white border-r border-line" />
              {roles.data.map((role) => (
                <td key={role.id} className="px-4 py-3 align-top">
                  {role.name !== SUPER_ADMIN && (
                    <>
                      <Button
                        className="!min-h-[40px] !px-4 !py-1.5 !text-sm"
                        disabled={!isDirty(role) || savingId !== null}
                        isLoading={savingId === role.id}
                        onClick={() => save(role)}
                        aria-label={`Simpan ${role.label}`}
                      >
                        Simpan
                      </Button>
                      {errors[role.id] && (
                        <p role="alert" className="mt-2 text-xs text-danger">
                          {errors[role.id]}
                        </p>
                      )}
                    </>
                  )}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
