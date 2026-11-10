import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { apiErrorInfo } from '../api';
import { usePromoteUser } from '../hooks';
import type { AdminUser, Role } from '../types';

const schema = z.object({ roles: z.array(z.string()).min(1, 'Pilih minimal satu role.') });
type FormValues = z.infer<typeof schema>;

interface PromoteUserModalProps {
  user: AdminUser;
  roles: Role[];
  onClose: () => void;
  onPromoted: (user: AdminUser) => void;
}

export const PromoteUserModal: React.FC<PromoteUserModalProps> = ({ user, roles, onClose, onPromoted }) => {
  const promote = usePromoteUser();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { roles: [] } });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      onPromoted(await promote.mutateAsync({ id: user.id, roles: values.roles }));
    } catch (err) {
      setServerError(apiErrorInfo(err).message);
    }
  };

  return (
    <Modal isOpen title="Jadikan admin" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="text-ink flex flex-col gap-2">
          <p>
            Akun <strong>{user.name}</strong> ({user.email}) akan mendapat akses panel admin sesuai role yang dipilih.
          </p>
          <p>
            Akun ini tidak bisa lagi dipakai di area pendaftar. Data pendaftarannya tidak diubah. Semua sesi yang sedang aktif diakhiri, jadi
            pemiliknya harus masuk ulang.
          </p>
        </div>

        <fieldset aria-describedby={errors.roles ? 'promote-roles-error' : undefined}>
          <legend className="font-bold text-ink mb-1">Role</legend>
          <div className="flex flex-col">
            {roles.map((role) => (
              <label key={role.id} className="flex items-center gap-3 min-h-[44px] text-ink">
                <input type="checkbox" value={role.name} className="h-5 w-5 accent-primary" {...register('roles')} />
                {role.label}
              </label>
            ))}
          </div>
          {errors.roles && (
            <p id="promote-roles-error" role="alert" className="text-sm text-danger mt-1">
              {errors.roles.message}
            </p>
          )}
        </fieldset>

        {serverError && (
          <p role="alert" className="text-sm text-danger">
            {serverError}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="danger" isLoading={isSubmitting}>
            Jadikan admin
          </Button>
        </div>
      </form>
    </Modal>
  );
};
