import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiErrorInfo } from '../api';
import { useCreateUser, useUpdateUser } from '../hooks';
import type { AdminUser, Role } from '../types';

const schema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi.'),
  email: z.string().trim().min(1, 'Alamat email wajib diisi.').email('Format email tidak valid.'),
  phone: z.string().trim(),
  // Kotak centang berkelompok bernilai string; dikonversi ke id saat dikirim.
  roles: z.array(z.string()).min(1, 'Pilih minimal satu role.'),
});
type FormValues = z.infer<typeof schema>;

interface UserFormModalProps {
  isOpen: boolean;
  /** null = tambah admin; akun = ubah. */
  user: AdminUser | null;
  roles: Role[];
  /** Hanya Super Admin yang boleh memberi/mencabut role super_admin (backend tetap memeriksa). */
  canGrantSuperAdmin: boolean;
  onClose: () => void;
  onSaved: (user: AdminUser) => void;
}

const FIELDS = ['name', 'email', 'phone', 'roles'] as const;

export const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, user, roles, canGrantSuperAdmin, onClose, onSaved }) => {
  const create = useCreateUser();
  const update = useUpdateUser();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      roles: user?.roles.map((r) => String(r.id)) ?? [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    const payload = { ...values, phone: values.phone || null, roles: values.roles.map(Number).sort((a, b) => a - b) };
    try {
      const saved = user ? await update.mutateAsync({ id: user.id, payload }) : await create.mutateAsync(payload);
      onSaved(saved);
    } catch (err) {
      const info = apiErrorInfo(err);
      const fieldErrors = info.status === 422 ? info.errors : undefined;
      let mapped = false;
      for (const [key, messages] of Object.entries(fieldErrors ?? {})) {
        const field = FIELDS.find((f) => key === f || key.startsWith(`${f}.`));
        if (field) {
          setError(field, { message: messages[0] });
          mapped = true;
        }
      }
      if (!mapped) setFormError(info.message);
    }
  };

  return (
    <Modal isOpen={isOpen} title={user ? 'Ubah admin' : 'Tambah admin'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input label="Nama" autoComplete="off" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="off" error={errors.email?.message} {...register('email')} />
        <Input label="Nomor telepon" type="tel" autoComplete="off" error={errors.phone?.message} {...register('phone')} />

        <fieldset aria-describedby={errors.roles ? 'roles-error' : undefined}>
          <legend className="font-bold text-ink mb-1">Role</legend>
          <div className="flex flex-col">
            {roles.map((role) => (
              <label key={role.id} className="flex items-center gap-3 min-h-[44px] text-ink">
                <input
                  type="checkbox"
                  value={role.id}
                  className="h-5 w-5 accent-primary"
                  disabled={role.name === 'super_admin' && !canGrantSuperAdmin}
                  {...register('roles')}
                />
                {role.label}
              </label>
            ))}
          </div>
          {errors.roles && (
            <p id="roles-error" role="alert" className="text-sm text-danger mt-1">
              {errors.roles.message}
            </p>
          )}
        </fieldset>

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
