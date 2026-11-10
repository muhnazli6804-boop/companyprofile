import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RolesTab } from './RolesTab';
import { api, apiError, MANAGER_ME, ROLES, SUPER_ME, mockGet, renderWithProviders } from '../test-helpers';

vi.mock('@/lib/api-client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const box = (permission: string, role: string) => screen.findByRole('checkbox', { name: `${permission} — ${role}` });
const save = (role: string) => screen.getByRole('button', { name: `Simpan ${role}` });

beforeEach(() => {
  vi.clearAllMocks();
  mockGet(SUPER_ME);
});

describe('RolesTab — matriks', () => {
  it('izin dikelompokkan per group_name, satu kolom per role, jumlah anggota tampil', async () => {
    renderWithProviders(<RolesTab />);

    await box('Melihat Dashboard', 'Admin Konten');
    for (const group of ['Ringkasan', 'Konten', 'Sistem']) {
      expect(screen.getByRole('rowheader', { name: group })).toBeInTheDocument();
    }
    for (const role of ROLES) {
      expect(screen.getByRole('columnheader', { name: new RegExp(role.label) })).toBeInTheDocument();
    }
    expect(screen.getByRole('columnheader', { name: /Admin Pendaftaran/ })).toHaveTextContent('2 pengguna');
  });

  it('kotak mencerminkan izin role', async () => {
    renderWithProviders(<RolesTab />);

    expect(await box('Mengelola Konten', 'Admin Konten')).toBeChecked();
    expect(await box('Mengelola Konten', 'Admin Pendaftaran')).not.toBeChecked();
  });

  it('super_admin: semua tercentang, nonaktif, dan tidak ada tombol Simpan', async () => {
    renderWithProviders(<RolesTab />);

    for (const p of ['Melihat Dashboard', 'Mengelola Konten', 'Mengelola Pengguna']) {
      const cb = await box(p, 'Super Admin');
      expect(cb).toBeChecked();
      expect(cb).toBeDisabled();
    }
    expect(screen.queryByRole('button', { name: 'Simpan Super Admin' })).not.toBeInTheDocument();
  });

  it('bukan Super Admin: kotak users.manage nonaktif, kotak lain bisa diubah', async () => {
    mockGet(MANAGER_ME);
    renderWithProviders(<RolesTab />);

    expect(await box('Mengelola Pengguna', 'Admin Konten')).toBeDisabled();
    expect(await box('Mengelola Konten', 'Admin Konten')).toBeEnabled();
  });

  it('Super Admin boleh mengubah users.manage pada role lain', async () => {
    renderWithProviders(<RolesTab />);

    expect(await box('Mengelola Pengguna', 'Admin Konten')).toBeEnabled();
  });
});

describe('RolesTab — simpan per kolom', () => {
  it('tanpa perubahan: Simpan nonaktif, tanpa penanda', async () => {
    renderWithProviders(<RolesTab />);
    await box('Melihat Dashboard', 'Admin Konten');

    expect(save('Admin Konten')).toBeDisabled();
    expect(screen.queryByText('Ada perubahan belum disimpan')).not.toBeInTheDocument();
  });

  it('mengubah satu kolom: hanya kolom itu bertanda dan bisa disimpan', async () => {
    renderWithProviders(<RolesTab />);
    const user = userEvent.setup();

    await user.click(await box('Mengelola Konten', 'Admin Pendaftaran'));

    expect(screen.getAllByText('Ada perubahan belum disimpan')).toHaveLength(1);
    expect(save('Admin Pendaftaran')).toBeEnabled();
    expect(save('Admin Konten')).toBeDisabled();
  });

  it('mengembalikan ke nilai awal menghapus penanda', async () => {
    renderWithProviders(<RolesTab />);
    const user = userEvent.setup();
    const cb = await box('Mengelola Konten', 'Admin Pendaftaran');

    await user.click(cb);
    await user.click(cb);

    expect(screen.queryByText('Ada perubahan belum disimpan')).not.toBeInTheDocument();
    expect(save('Admin Pendaftaran')).toBeDisabled();
  });

  it('Simpan mengirim NAMA izin ke role itu; sesudahnya penanda hilang dan ada pesan status', async () => {
    const updated = { ...ROLES[1], permissions: [ROLES[1].permissions[0], ROLES[2].permissions[1]] };
    api.put.mockResolvedValue({ data: { data: updated } });
    renderWithProviders(<RolesTab />);
    const user = userEvent.setup();

    await user.click(await box('Mengelola Konten', 'Admin Pendaftaran'));
    await user.click(save('Admin Pendaftaran'));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith('/admin/roles/2/permissions', { permissions: ['dashboard.view', 'content.manage'] }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Izin Admin Pendaftaran disimpan');
    await waitFor(() => expect(screen.queryByText('Ada perubahan belum disimpan')).not.toBeInTheDocument());
    expect(await box('Mengelola Konten', 'Admin Pendaftaran')).toBeChecked();
  });

  it('kolom lain yang belum disimpan tidak ikut hilang saat satu kolom disimpan', async () => {
    api.put.mockResolvedValue({ data: { data: { ...ROLES[1], permissions: ROLES[2].permissions } } });
    renderWithProviders(<RolesTab />);
    const user = userEvent.setup();

    await user.click(await box('Mengelola Konten', 'Admin Pendaftaran'));
    await user.click(await box('Mengelola Konten', 'Admin Konten'));
    await user.click(save('Admin Pendaftaran'));

    await waitFor(() => expect(api.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getAllByText('Ada perubahan belum disimpan')).toHaveLength(1));
    expect(save('Admin Konten')).toBeEnabled();
  });

  it('409/403/422: pesan server tampil sebagai alert di kolom dan perubahan tidak hilang', async () => {
    api.put.mockRejectedValue(apiError(403, { message: 'Hanya Super Admin yang dapat memberi izin ini.', code: 'FORBIDDEN' }));
    renderWithProviders(<RolesTab />);
    const user = userEvent.setup();

    await user.click(await box('Mengelola Konten', 'Admin Pendaftaran'));
    await user.click(save('Admin Pendaftaran'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Hanya Super Admin');
    expect(screen.getAllByText('Ada perubahan belum disimpan')).toHaveLength(1);
    expect(await box('Mengelola Konten', 'Admin Pendaftaran')).toBeChecked();
  });

  it('422 pada permissions menampilkan pesan validasi pertama', async () => {
    api.put.mockRejectedValue(
      apiError(422, { message: 'x', code: 'VALIDATION_ERROR', errors: { permissions: ['Izin finance.view hanya untuk role admin.'] } }),
    );
    renderWithProviders(<RolesTab />);
    const user = userEvent.setup();

    await user.click(await box('Mengelola Konten', 'Admin Pendaftaran'));
    await user.click(save('Admin Pendaftaran'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Izin finance.view hanya untuk role admin.');
  });

  it('gagal memuat: alert dengan Coba lagi', async () => {
    api.get.mockImplementation((url: string) =>
      url === '/auth/me'
        ? Promise.resolve({ data: { data: { user_type: 'admin', ...SUPER_ME } } })
        : Promise.reject(apiError(500, { message: 'Server error' })),
    );
    renderWithProviders(<RolesTab />);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Server error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
  });
});
