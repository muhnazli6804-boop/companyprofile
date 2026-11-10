import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserFormModal } from './UserFormModal';
import { api, apiError, MANAGER_ME, ROLES, SUPER_ME, USERS, mockGet, renderWithProviders } from '../test-helpers';

vi.mock('@/lib/api-client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const onClose = vi.fn();
const onSaved = vi.fn();

function open(props: Partial<React.ComponentProps<typeof UserFormModal>> = {}) {
  return renderWithProviders(
    <UserFormModal isOpen user={null} roles={ROLES} canGrantSuperAdmin onClose={onClose} onSaved={onSaved} {...props} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGet(SUPER_ME);
});

describe('UserFormModal — tambah admin', () => {
  it('kolom kosong: pesan galat per kolom dan tidak ada permintaan', async () => {
    open();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Nama wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Alamat email wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Pilih minimal satu role.')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('mengirim nama, email, telepon, dan id role yang dicentang, lalu memberi tahu pemanggil', async () => {
    api.post.mockResolvedValue({ data: { data: USERS[1] } });
    open();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Nama'), 'Dewi Baru');
    await user.type(screen.getByLabelText('Email'), 'dewi@padindi.test');
    await user.type(screen.getByLabelText('Nomor telepon'), '0812');
    await user.click(screen.getByRole('checkbox', { name: 'Admin Konten' }));
    await user.click(screen.getByRole('button', { name: 'Simpan' }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/admin/users', { name: 'Dewi Baru', email: 'dewi@padindi.test', phone: '0812', roles: [3] }),
    );
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  });

  it('422 dari server dipetakan ke kolomnya dan dialog tetap terbuka', async () => {
    api.post.mockRejectedValue(apiError(422, { message: 'x', code: 'VALIDATION_ERROR', errors: { email: ['Email sudah digunakan.'] } }));
    open();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Nama'), 'Dewi');
    await user.type(screen.getByLabelText('Email'), 'dewi@padindi.test');
    await user.click(screen.getByRole('checkbox', { name: 'Admin Konten' }));
    await user.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Email sudah digunakan.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('galat lain (409/403) tampil sebagai alert di dalam dialog', async () => {
    api.post.mockRejectedValue(apiError(403, { message: 'Hanya Super Admin yang dapat mengelola role atau akun Super Admin.', code: 'FORBIDDEN' }));
    open();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Nama'), 'Dewi');
    await user.type(screen.getByLabelText('Email'), 'dewi@padindi.test');
    await user.click(screen.getByRole('checkbox', { name: 'Admin Konten' }));
    await user.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Hanya Super Admin');
  });

  it('bukan Super Admin: kotak Super Admin nonaktif', () => {
    open({ canGrantSuperAdmin: false });

    expect(screen.getByRole('checkbox', { name: 'Super Admin' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Admin Konten' })).toBeEnabled();
  });
});

describe('UserFormModal — ubah admin', () => {
  it('terisi data akun, mengirim PUT ke id akun', async () => {
    api.put.mockResolvedValue({ data: { data: USERS[1] } });
    open({ user: USERS[1] });
    const user = userEvent.setup();

    expect(screen.getByLabelText('Nama')).toHaveValue('Sari Konten');
    expect(screen.getByLabelText('Email')).toHaveValue('sari@padindi.test');
    expect(screen.getByRole('checkbox', { name: 'Admin Konten' })).toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: 'Admin Pendaftaran' }));
    await user.click(screen.getByRole('button', { name: 'Simpan' }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith('/admin/users/10', { name: 'Sari Konten', email: 'sari@padindi.test', phone: null, roles: [2, 3] }),
    );
  });

  it('Batal menutup tanpa permintaan', async () => {
    open({ user: USERS[1], canGrantSuperAdmin: MANAGER_ME.roles.includes('super_admin') });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Batal' }));

    expect(onClose).toHaveBeenCalled();
    expect(api.put).not.toHaveBeenCalled();
  });
});
