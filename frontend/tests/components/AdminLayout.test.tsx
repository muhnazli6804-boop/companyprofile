import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { AdminLayout } from '@/layouts/AdminLayout';

vi.mock('@/lib/api-client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

const api = vi.mocked(apiClient);

const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/pendaftaran-siswa',
  '/admin/lamaran-guru',
  '/admin/periode',
  '/admin/unit-pendidikan',
  '/admin/syarat-dokumen',
  '/admin/lowongan-guru',
  '/admin/cms',
  '/admin/pesan-kontak',
  '/admin/pengguna',
  '/admin/log-aktivitas',
];

function renderAt(path: string, queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="*" element={<h1>Isi Halaman</h1>} />
          </Route>
          <Route path="/masuk" element={<div>Halaman Masuk</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return queryClient;
}

const sidebar = () => screen.getByRole('navigation', { name: 'Navigasi Admin' });
const menuReady = () => within(sidebar()).findAllByRole('link');
const menuHrefs = async () => (await menuReady()).map((a) => a.getAttribute('href'));

const ALL_PERMISSIONS = [
  'dashboard.view', 'applications.view', 'periods.manage', 'units.manage', 'requirements.manage', 'vacancies.manage',
  'content.manage', 'messages.manage', 'finance.view', 'users.manage', 'logs.view', 'settings.manage',
];
const me = (roles: string[], permissions: string[], name = 'Budi Admin') =>
  api.get.mockResolvedValue({ data: { data: { name, user_type: 'admin', roles, permissions } } });

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  me(['super_admin'], ALL_PERMISSIONS);
  api.post.mockResolvedValue({ data: { message: 'Berhasil keluar.' } });
});

describe('AdminLayout — Keluar', () => {
  it('berhasil: memanggil logout, menghapus token, mengosongkan seluruh cache, pindah ke /masuk', async () => {
    localStorage.setItem('auth_token', 'x');
    const queryClient = renderAt('/admin/dashboard');
    queryClient.setQueryData(['sentinel'], 1);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Keluar' }));

    expect(await screen.findByText('Halaman Masuk')).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(queryClient.getQueryData(['sentinel'])).toBeUndefined();
  });

  it('gagal 500: tetap di halaman, pesan galat, token dan cache tetap', async () => {
    localStorage.setItem('auth_token', 'x');
    api.post.mockRejectedValue({ response: { status: 500 } });
    const queryClient = renderAt('/admin/dashboard');
    queryClient.setQueryData(['sentinel'], 1);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Keluar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal keluar');
    expect(screen.queryByText('Halaman Masuk')).not.toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBe('x');
    expect(queryClient.getQueryData(['sentinel'])).toBe(1);
  });

  it('dengan 401 (sesi sudah berakhir) tetap membersihkan dan pindah ke /masuk', async () => {
    localStorage.setItem('auth_token', 'x');
    api.post.mockRejectedValue({ response: { status: 401 } });
    const queryClient = renderAt('/admin/dashboard');
    queryClient.setQueryData(['sentinel'], 1);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Keluar' }));

    expect(await screen.findByText('Halaman Masuk')).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(queryClient.getQueryData(['sentinel'])).toBeUndefined();
  });

  it('klik ganda hanya mengirim satu permintaan logout', async () => {
    api.post.mockReturnValue(new Promise(() => {}));
    renderAt('/admin/dashboard');
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: 'Keluar' });

    await user.click(button);
    await user.click(button);

    expect(api.post).toHaveBeenCalledTimes(1);
  });
});

describe('AdminLayout — menu dan header', () => {
  const activeLinks = () =>
    within(sidebar())
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page')
      .map((a) => a.textContent);

  it('menandai hanya menu aktif', async () => {
    renderAt('/admin/lamaran-guru');
    await menuReady();

    expect(activeLinks()).toEqual(['Lamaran Guru']);
  });

  it('rute bersarang tetap menandai menu induk', async () => {
    renderAt('/admin/pendaftaran-siswa/12');
    await menuReady();

    expect(activeLinks()).toEqual(['Pendaftaran Siswa']);
  });

  it('rute admin tak dikenal tidak menandai menu apa pun dan tidak crash', async () => {
    renderAt('/admin/tidak-ada');
    await menuReady();

    expect(activeLinks()).toEqual([]);
    expect(screen.getByRole('button', { name: 'Keluar' })).toBeInTheDocument();
  });

  it('header tidak menduplikasi judul: halaman memegang satu-satunya h1', () => {
    renderAt('/admin/dashboard');

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Isi Halaman');
    expect(within(screen.getByRole('banner')).queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('setiap grup menu punya nama yang bisa dibaca pembaca layar', async () => {
    renderAt('/admin/dashboard');
    await menuReady();

    for (const name of ['Ringkasan', 'Pendaftaran', 'Master Data', 'Konten', 'Sistem']) {
      expect(within(sidebar()).getByRole('list', { name })).toBeInTheDocument();
    }
  });

  it('super_admin: memuat 12 menu, 11 rute CMS & Pengaturan disatukan ditambah Keuangan', async () => {
    renderAt('/admin/dashboard');

    const hrefs = await menuHrefs();
    expect(hrefs).toHaveLength(12);
    expect(hrefs).toEqual(expect.arrayContaining([...ADMIN_ROUTES, '/admin/keuangan']));
  });

  it('admin_content: hanya Dashboard, Unit Pendidikan, CMS, Pesan Kontak; grup lain hilang seluruhnya', async () => {
    me(['admin_content'], ['dashboard.view', 'units.manage', 'content.manage', 'messages.manage']);
    renderAt('/admin/dashboard');

    expect(await menuHrefs()).toEqual(['/admin/dashboard', '/admin/unit-pendidikan', '/admin/cms', '/admin/pesan-kontak']);
    for (const name of ['Pendaftaran', 'Sistem']) {
      expect(within(sidebar()).queryByRole('list', { name })).not.toBeInTheDocument();
      expect(within(sidebar()).queryByText(name)).not.toBeInTheDocument();
    }
  });

  it('admin_registration: tanpa CMS, Pesan Kontak, Pengguna & Role, Keuangan, Log, Pengaturan', async () => {
    me(['admin_registration'], [
      'dashboard.view', 'applications.view', 'periods.manage', 'requirements.manage', 'vacancies.manage',
    ]);
    renderAt('/admin/dashboard');

    expect(await menuHrefs()).toEqual([
      '/admin/dashboard', '/admin/pendaftaran-siswa', '/admin/lamaran-guru',
      '/admin/periode', '/admin/syarat-dokumen', '/admin/lowongan-guru',
    ]);
    expect(within(sidebar()).queryByRole('list', { name: 'Sistem' })).not.toBeInTheDocument();
  });

  it('Keuangan hanya muncul untuk finance.view', async () => {
    me(['kustom'], ['dashboard.view', 'users.manage']);
    renderAt('/admin/dashboard');

    const hrefs = await menuHrefs();
    expect(hrefs).toContain('/admin/pengguna');
    expect(hrefs).not.toContain('/admin/keuangan');
  });

  it('tanpa izin sama sekali: tidak ada menu, header Keluar tetap ada', async () => {
    me([], []);
    renderAt('/admin/dashboard');

    await waitFor(() => expect(api.get).toHaveBeenCalled());
    await screen.findByText('Budi Admin');
    expect(within(sidebar()).queryAllByRole('link')).toEqual([]);
    expect(screen.getByRole('button', { name: 'Keluar' })).toBeInTheDocument();
  });

  it('nama admin hanya tampil sekali, di blok bawah sidebar, dengan title untuk nama panjang', async () => {
    renderAt('/admin/dashboard');

    const block = screen.getByTestId('sidebar-user');
    const name = await within(block).findByText('Budi Admin');
    expect(name).toHaveAttribute('title', 'Budi Admin');
    expect(within(block).getByText('Super Admin')).toBeInTheDocument();
    expect(within(block).queryByText('Administrator')).not.toBeInTheDocument();
    expect(screen.getAllByText('Budi Admin')).toHaveLength(1);
    expect(within(screen.getByRole('banner')).queryByText('Budi Admin')).not.toBeInTheDocument();
  });

  it('beberapa role ditampilkan sebagai label dipisah koma', async () => {
    me(['admin_content', 'admin_registration'], ['dashboard.view']);
    renderAt('/admin/dashboard');

    const block = screen.getByTestId('sidebar-user');
    expect(await within(block).findByText('Admin Konten, Admin Pendaftaran')).toBeInTheDocument();
  });

  it('tautan Lihat situs menuju / dan berada di luar daftar menu', () => {
    renderAt('/admin/dashboard');

    const link = screen.getByRole('link', { name: 'Lihat situs' });
    expect(link).toHaveAttribute('href', '/');
    expect(within(sidebar()).queryByRole('link', { name: 'Lihat situs' })).not.toBeInTheDocument();
  });

  it('header tetap tampil saat /auth/me gagal', async () => {
    api.get.mockRejectedValue({ response: { status: 401 } });
    renderAt('/admin/dashboard');

    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Keluar' })).toBeInTheDocument();
    expect(screen.queryByText('Budi Admin')).not.toBeInTheDocument();
  });
});

describe('AdminLayout — laci layar kecil', () => {
  const hamburger = () => screen.getByRole('button', { name: 'Buka menu', hidden: true });
  const main = () => document.getElementById('main-content');

  it('hamburger membuka laci; Esc menutup dan fokus kembali ke hamburger', async () => {
    renderAt('/admin/dashboard');
    await menuReady();
    const user = userEvent.setup();

    expect(hamburger()).toHaveAttribute('aria-expanded', 'false');
    expect(main()).not.toHaveAttribute('inert');

    await user.click(hamburger());
    expect(hamburger()).toHaveAttribute('aria-expanded', 'true');
    expect(main()).toHaveAttribute('inert');

    await user.keyboard('{Escape}');
    expect(hamburger()).toHaveAttribute('aria-expanded', 'false');
    expect(main()).not.toHaveAttribute('inert');
    expect(hamburger()).toHaveFocus();
  });

  it('klik menu menutup laci', async () => {
    renderAt('/admin/dashboard');
    await menuReady();
    const user = userEvent.setup();

    await user.click(hamburger());
    await user.click(within(sidebar()).getByRole('link', { name: 'Periode & Kuota' }));

    expect(hamburger()).toHaveAttribute('aria-expanded', 'false');
    expect(main()).not.toHaveAttribute('inert');
  });
});
