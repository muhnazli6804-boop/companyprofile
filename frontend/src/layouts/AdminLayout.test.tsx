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
  '/admin/pengaturan',
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

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  api.get.mockResolvedValue({ data: { data: { name: 'Budi Admin', user_type: 'admin' } } });
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

  it('menandai hanya menu aktif', () => {
    renderAt('/admin/lamaran-guru');

    expect(activeLinks()).toEqual(['Lamaran Guru']);
  });

  it('rute bersarang tetap menandai menu induk', () => {
    renderAt('/admin/pendaftaran-siswa/12');

    expect(activeLinks()).toEqual(['Pendaftaran Siswa']);
  });

  it('rute admin tak dikenal tidak menandai menu apa pun dan tidak crash', () => {
    renderAt('/admin/tidak-ada');

    expect(activeLinks()).toEqual([]);
    expect(screen.getByRole('button', { name: 'Keluar' })).toBeInTheDocument();
  });

  it('header tidak menduplikasi judul: halaman memegang satu-satunya h1', () => {
    renderAt('/admin/dashboard');

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Isi Halaman');
    expect(within(screen.getByRole('banner')).queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('setiap grup menu punya nama yang bisa dibaca pembaca layar', () => {
    renderAt('/admin/dashboard');

    for (const name of ['Ringkasan', 'Pendaftaran', 'Master Data', 'Konten', 'Sistem']) {
      expect(within(sidebar()).getByRole('list', { name })).toBeInTheDocument();
    }
  });

  it('memuat 13 menu: 12 rute lama ditambah Keuangan', () => {
    renderAt('/admin/dashboard');

    const hrefs = within(sidebar())
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs).toHaveLength(13);
    expect(hrefs).toEqual(expect.arrayContaining([...ADMIN_ROUTES, '/admin/keuangan']));
  });

  it('nama admin hanya tampil sekali, di blok bawah sidebar, dengan title untuk nama panjang', async () => {
    renderAt('/admin/dashboard');

    const block = screen.getByTestId('sidebar-user');
    const name = await within(block).findByText('Budi Admin');
    expect(name).toHaveAttribute('title', 'Budi Admin');
    expect(within(block).getByText('Administrator')).toBeInTheDocument();
    expect(screen.getAllByText('Budi Admin')).toHaveLength(1);
    expect(within(screen.getByRole('banner')).queryByText('Budi Admin')).not.toBeInTheDocument();
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
    const user = userEvent.setup();

    await user.click(hamburger());
    await user.click(within(sidebar()).getByRole('link', { name: 'Periode & Kuota' }));

    expect(hamburger()).toHaveAttribute('aria-expanded', 'false');
    expect(main()).not.toHaveAttribute('inert');
  });
});
