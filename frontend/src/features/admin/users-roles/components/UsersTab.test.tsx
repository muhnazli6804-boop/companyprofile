import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UsersTab } from './UsersTab';
import { api, apiError, MANAGER_ME, SUPER_ME, USERS, mockGet, renderWithProviders, usersPage } from '../test-helpers';

vi.mock('@/lib/api-client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const row = async (name: string) => {
  const cell = await screen.findByText(name);
  return within(cell.closest('tr') as HTMLElement);
};
const usersCalls = () => api.get.mock.calls.filter(([url]) => url === '/admin/users');
const lastUsersParams = () => usersCalls().at(-1)?.[1]?.params;

beforeEach(() => {
  vi.clearAllMocks();
  mockGet(SUPER_ME);
});

describe('UsersTab — daftar', () => {
  it('menampilkan nama, email, jenis akun, role, status (teks), terakhir masuk, dan total data', async () => {
    mockGet(SUPER_ME, { '/admin/users': () => ({ data: usersPage(USERS, { total: 73, last_page: 5 }) }) });
    renderWithProviders(<UsersTab />);

    const sari = await row('Sari Konten');
    expect(sari.getByText('sari@padindi.test')).toBeInTheDocument();
    expect(sari.getByText('Admin')).toBeInTheDocument();
    expect(sari.getByText('Admin Konten')).toBeInTheDocument();
    expect(sari.getByText('Aktif')).toBeInTheDocument();
    expect(sari.getByText('Belum pernah')).toBeInTheDocument();
    expect((await row('Wali Murid')).getByText('Nonaktif')).toBeInTheDocument();
    expect(screen.getByText('73 data')).toBeInTheDocument();
    expect(screen.getByText('Halaman 1 dari 5')).toBeInTheDocument();
  });

  it('meminta halaman 1 dengan 15 per halaman; halaman berikutnya meminta page=2', async () => {
    mockGet(SUPER_ME, { '/admin/users': () => ({ data: usersPage(USERS, { last_page: 2, total: 20 }) }) });
    renderWithProviders(<UsersTab />);
    await screen.findByText('Sari Konten');
    expect(lastUsersParams()).toMatchObject({ page: 1, per_page: 15 });

    await userEvent.setup().click(screen.getByRole('button', { name: 'Selanjutnya' }));

    await waitFor(() => expect(lastUsersParams()).toMatchObject({ page: 2 }));
  });

  it('pencarian dikirim sebagai q setelah jeda, kembali ke halaman 1', async () => {
    renderWithProviders(<UsersTab />);
    await screen.findByText('Sari Konten');

    await userEvent.setup().type(screen.getByRole('searchbox', { name: 'Cari pengguna' }), 'sari');

    await waitFor(() => expect(lastUsersParams()).toMatchObject({ q: 'sari', page: 1 }));
  });

  it('filter status dikirim sebagai filter[is_active]; filter kosong tidak dikirim', async () => {
    renderWithProviders(<UsersTab />);
    await screen.findByText('Sari Konten');
    expect(lastUsersParams()).not.toHaveProperty('filter[is_active]');

    await userEvent.setup().selectOptions(screen.getByLabelText('Status'), 'false');

    await waitFor(() => expect(lastUsersParams()).toMatchObject({ 'filter[is_active]': 'false' }));
  });

  it('filter jenis akun dan role dikirim', async () => {
    renderWithProviders(<UsersTab />);
    await screen.findByText('Sari Konten');
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText('Jenis akun'), 'applicant');
    await user.selectOptions(await screen.findByLabelText('Role'), 'admin_content');

    await waitFor(() => expect(lastUsersParams()).toMatchObject({ 'filter[user_type]': 'applicant', 'filter[role]': 'admin_content' }));
  });

  it('tidak ada hasil: keadaan kosong', async () => {
    mockGet(SUPER_ME, { '/admin/users': () => ({ data: usersPage([]) }) });
    renderWithProviders(<UsersTab />);

    expect(await screen.findByText('Tidak ada pengguna yang cocok')).toBeInTheDocument();
  });

  it('gagal memuat: alert dengan tombol Coba lagi', async () => {
    api.get.mockImplementation((url: string) =>
      url === '/admin/users'
        ? Promise.reject(apiError(500, { message: 'Server error' }))
        : url === '/auth/me'
          ? Promise.resolve({ data: { data: { ...SUPER_ME, user_type: 'admin' } } })
          : Promise.resolve({ data: { data: [] } }),
    );
    renderWithProviders(<UsersTab />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error');
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
  });
});

describe('UsersTab — aksi per baris', () => {
  it('akun pendaftar hanya bisa diaktifkan/dinonaktifkan', async () => {
    renderWithProviders(<UsersTab />);

    const wali = await row('Wali Murid');
    expect(wali.getByRole('button', { name: /Aktifkan/ })).toBeInTheDocument();
    for (const name of [/Ubah/, /Reset password/, /Hapus/]) {
      expect(wali.queryByRole('button', { name })).not.toBeInTheDocument();
    }
  });

  it('akun admin punya Ubah, Reset password, Nonaktifkan, Hapus', async () => {
    renderWithProviders(<UsersTab />);

    const sari = await row('Sari Konten');
    for (const name of [/Ubah/, /Reset password/, /Nonaktifkan/, /Hapus/]) {
      expect(sari.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('bukan Super Admin: baris Super Admin tanpa aksi ubah/reset/nonaktif/hapus', async () => {
    mockGet(MANAGER_ME);
    renderWithProviders(<UsersTab />);

    const budi = await row('Budi Super');
    expect(budi.queryAllByRole('button')).toHaveLength(0);
    expect((await row('Sari Konten')).getByRole('button', { name: /Ubah/ })).toBeInTheDocument();
  });

  it('Nonaktifkan meminta konfirmasi; Batal tidak mengirim apa pun', async () => {
    renderWithProviders(<UsersTab />);
    const user = userEvent.setup();

    await user.click((await row('Sari Konten')).getByRole('button', { name: /Nonaktifkan/ }));
    const dialog = screen.getByRole('dialog', { name: 'Nonaktifkan akun?' });
    await user.click(within(dialog).getByRole('button', { name: 'Batal' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('Nonaktifkan dikonfirmasi: PATCH is_active=false', async () => {
    api.patch.mockResolvedValue({ data: { data: { ...USERS[1], is_active: false } } });
    renderWithProviders(<UsersTab />);
    const user = userEvent.setup();

    await user.click((await row('Sari Konten')).getByRole('button', { name: /Nonaktifkan/ }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Nonaktifkan' }));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/admin/users/10/active', { is_active: false }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Aktifkan akun nonaktif langsung mengirim is_active=true tanpa dialog', async () => {
    api.patch.mockResolvedValue({ data: { data: { ...USERS[2], is_active: true } } });
    renderWithProviders(<UsersTab />);

    await userEvent.setup().click((await row('Wali Murid')).getByRole('button', { name: /Aktifkan/ }));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/admin/users/20/active', { is_active: true }));
  });

  it('Hapus dikonfirmasi: DELETE ke id akun', async () => {
    api.delete.mockResolvedValue({});
    renderWithProviders(<UsersTab />);
    const user = userEvent.setup();

    await user.click((await row('Sari Konten')).getByRole('button', { name: /Hapus/ }));
    const dialog = screen.getByRole('dialog', { name: 'Hapus akun?' });
    expect(within(dialog).getByText(/Sari Konten/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Hapus' }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/admin/users/10'));
  });

  it('Reset password dikonfirmasi: POST lalu pesan status tampil di halaman', async () => {
    api.post.mockResolvedValue({ data: { message: 'Tautan atur kata sandi telah dikirim ke email akun.' } });
    renderWithProviders(<UsersTab />);
    const user = userEvent.setup();

    await user.click((await row('Sari Konten')).getByRole('button', { name: /Reset password/ }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Kirim tautan' }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/admin/users/10/reset-password'));
    expect(await screen.findByRole('status')).toHaveTextContent('Tautan atur kata sandi telah dikirim');
  });

  it('409 LAST_SUPER_ADMIN: pesan server di dalam dialog, dialog tetap terbuka', async () => {
    api.delete.mockRejectedValue(apiError(409, { message: 'Tidak dapat menghapus Super Admin aktif terakhir.', code: 'LAST_SUPER_ADMIN' }));
    renderWithProviders(<UsersTab />);
    const user = userEvent.setup();

    await user.click((await row('Budi Super')).getByRole('button', { name: /Hapus/ }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Hapus' }));

    expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent('Super Admin aktif terakhir');
  });

  it('404 saat aksi: pesan tampil dan daftar dimuat ulang', async () => {
    api.delete.mockRejectedValue(apiError(404, { message: 'Data tidak ditemukan.' }));
    renderWithProviders(<UsersTab />);
    const user = userEvent.setup();
    await screen.findByText('Sari Konten');
    const before = usersCalls().length;

    await user.click((await row('Sari Konten')).getByRole('button', { name: /Hapus/ }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Hapus' }));

    expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent('Data tidak ditemukan');
    await waitFor(() => expect(usersCalls().length).toBeGreaterThan(before));
  });
});

describe('UsersTab — jadikan admin', () => {
  const promoteButton = (r: ReturnType<typeof within>, name: string) => r.queryByRole('button', { name: `Jadikan admin ${name}` });
  const openDialog = async (name = 'Calon Guru') => {
    const user = userEvent.setup();
    await user.click((await row(name)).getByRole('button', { name: `Jadikan admin ${name}` }));
    return { user, dialog: await screen.findByRole('dialog', { name: 'Jadikan admin' }) };
  };

  it('Super Admin: aksi hanya di baris pendaftar yang memenuhi syarat, tidak di baris admin', async () => {
    renderWithProviders(<UsersTab />);

    expect(promoteButton(await row('Calon Guru'), 'Calon Guru')).toBeEnabled();
    expect(promoteButton(await row('Sari Konten'), 'Sari Konten')).not.toBeInTheDocument();
    expect(promoteButton(await row('Budi Super'), 'Budi Super')).not.toBeInTheDocument();
  });

  it('bukan Super Admin: aksi tidak tampil sama sekali', async () => {
    mockGet(MANAGER_ME);
    renderWithProviders(<UsersTab />);

    await screen.findByText('Calon Guru');
    expect(screen.queryByRole('button', { name: /Jadikan admin/ })).not.toBeInTheDocument();
  });

  it('akun nonaktif atau email belum terverifikasi: aksi nonaktif dengan alasan terlihat', async () => {
    renderWithProviders(<UsersTab />);

    const wali = await row('Wali Murid');
    expect(promoteButton(wali, 'Wali Murid')).toBeDisabled();
    expect(wali.getByText('Aktifkan akun lebih dulu')).toBeInTheDocument();
    const baru = await row('Belum Verifikasi');
    expect(promoteButton(baru, 'Belum Verifikasi')).toBeDisabled();
    expect(baru.getByText('Email belum diverifikasi')).toBeInTheDocument();
  });

  it('dialog memuat peringatan akses panel, daftar role, dan Batal tidak mengirim apa pun', async () => {
    renderWithProviders(<UsersTab />);
    const { user, dialog } = await openDialog();

    expect(dialog).toHaveTextContent('Calon Guru');
    expect(dialog).toHaveTextContent('akses panel admin');
    expect(dialog).toHaveTextContent('tidak bisa lagi dipakai di area pendaftar');
    expect(dialog).toHaveTextContent('sesi');
    expect(within(dialog).getByRole('checkbox', { name: 'Admin Konten' })).not.toBeChecked();
    await user.click(within(dialog).getByRole('button', { name: 'Batal' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('tanpa role terpilih: pesan wajib muncul dan tidak ada permintaan', async () => {
    renderWithProviders(<UsersTab />);
    const { user, dialog } = await openDialog();

    await user.click(within(dialog).getByRole('button', { name: 'Jadikan admin' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Pilih minimal satu role.');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('sukses: POST nama role, dialog tutup, daftar dimuat ulang, pesan status minta masuk ulang', async () => {
    api.post.mockResolvedValue({ data: { data: { ...USERS[3], user_type: 'admin' } } });
    renderWithProviders(<UsersTab />);
    const { user, dialog } = await openDialog();
    const before = usersCalls().length;

    await user.click(within(dialog).getByRole('checkbox', { name: 'Admin Konten' }));
    await user.click(within(dialog).getByRole('button', { name: 'Jadikan admin' }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/admin/users/21/promote', { roles: ['admin_content'] }));
    expect(await screen.findByRole('status')).toHaveTextContent('Calon Guru kini admin');
    expect(screen.getByRole('status')).toHaveTextContent('masuk ulang');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(usersCalls().length).toBeGreaterThan(before));
  });

  it('422 ACCOUNT_NOT_ELIGIBLE: pesan server di dalam dialog, dialog tetap terbuka', async () => {
    api.post.mockRejectedValue(apiError(422, { message: 'Email akun belum diverifikasi.', code: 'ACCOUNT_NOT_ELIGIBLE' }));
    renderWithProviders(<UsersTab />);
    const { user, dialog } = await openDialog();

    await user.click(within(dialog).getByRole('checkbox', { name: 'Admin Konten' }));
    await user.click(within(dialog).getByRole('button', { name: 'Jadikan admin' }));

    expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent('Email akun belum diverifikasi.');
  });

  it('403: pesan server di dalam dialog', async () => {
    api.post.mockRejectedValue(apiError(403, { message: 'Anda tidak memiliki izin untuk aksi ini.', code: 'FORBIDDEN' }));
    renderWithProviders(<UsersTab />);
    const { user, dialog } = await openDialog();

    await user.click(within(dialog).getByRole('checkbox', { name: 'Admin Konten' }));
    await user.click(within(dialog).getByRole('button', { name: 'Jadikan admin' }));

    expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent('tidak memiliki izin');
  });

  it('404: pesan di dalam dialog dan daftar dimuat ulang', async () => {
    api.post.mockRejectedValue(apiError(404, { message: 'Data tidak ditemukan.' }));
    renderWithProviders(<UsersTab />);
    const { user, dialog } = await openDialog();
    const before = usersCalls().length;

    await user.click(within(dialog).getByRole('checkbox', { name: 'Admin Konten' }));
    await user.click(within(dialog).getByRole('button', { name: 'Jadikan admin' }));

    expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent('Data tidak ditemukan');
    await waitFor(() => expect(usersCalls().length).toBeGreaterThan(before));
  });
});

describe('UsersTab — tambah admin', () => {
  it('Tambah admin membuka formulir; setelah tersimpan muncul pesan status', async () => {
    api.post.mockResolvedValue({ data: { data: USERS[1] } });
    renderWithProviders(<UsersTab />);
    const user = userEvent.setup();
    await screen.findByText('Sari Konten');

    await user.click(screen.getByRole('button', { name: 'Tambah admin' }));
    const dialog = await screen.findByRole('dialog', { name: 'Tambah admin' });
    await user.type(within(dialog).getByLabelText('Nama'), 'Dewi');
    await user.type(within(dialog).getByLabelText('Email'), 'dewi@padindi.test');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Admin Konten' }));
    await user.click(within(dialog).getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Akun admin dibuat');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
