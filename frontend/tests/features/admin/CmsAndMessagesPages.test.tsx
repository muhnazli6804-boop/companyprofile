import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { MessagesPage } from '@/features/admin/messages/pages/MessagesPage';
import { CmsPage } from '@/features/admin/cms/pages/CmsPage';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
    put: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('MessagesPage — Pesan & Pengaduan', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });
  });

  it('menampilkan halaman pesan masuk dengan stat card dan tabel data', async () => {
    renderWithClient(<MessagesPage />);

    expect(screen.getByText('Pesan Masuk & Pengaduan')).toBeInTheDocument();
    expect(screen.getByText('Total Pesan Masuk')).toBeInTheDocument();
    expect(screen.getByText('Pesan Baru (Belum Dibaca)')).toBeInTheDocument();
    expect(screen.getByText('Sudah Dibalas / Selesai')).toBeInTheDocument();

    // Default seeded messages
    expect(await screen.findByText('[Contoh] Ibu Ratna Dewi')).toBeInTheDocument();
  });

  it('dapat membuka modal detail pesan saat baris diklik', async () => {
    renderWithClient(<MessagesPage />);

    const row = await screen.findByText('[Contoh] Ibu Ratna Dewi');
    fireEvent.click(row);

    expect(screen.getByText('Detail Pesan Masuk')).toBeInTheDocument();
    expect(screen.getAllByText('ratna.dewi@example.com').length).toBeGreaterThan(0);
    expect(screen.getByText('Simpan Tanggapan & Tandai Selesai')).toBeInTheDocument();
  });

  it('role guru hanya menampilkan pesan miliknya dan tidak menampilkan pesan fallback umum saat kosong', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            data: {
              id: 2,
              name: 'Siti Rahmawati, S.Pd',
              email: 'guru@padindi.id',
              roles: ['guru'],
              permissions: ['dashboard.view', 'content.manage', 'messages.manage', 'logs.view'],
            },
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    renderWithClient(<MessagesPage />);

    expect(await screen.findByText('Belum ada pesan untuk akun Anda')).toBeInTheDocument();
    expect(screen.queryByText('[Contoh] Ibu Ratna Dewi')).not.toBeInTheDocument();
    // Stat card pesan disembunyikan pada role guru karena jumlah sudah tertera pada filter
    expect(screen.queryByText('Total Pesan Masuk')).not.toBeInTheDocument();
    expect(screen.queryByText('Pesan Baru (Belum Dibaca)')).not.toBeInTheDocument();
  });
});

describe('CmsPage — Manajemen Konten Landing Page', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });
  });

  it('menampilkan tab navigasi CMS dan banner hero', async () => {
    renderWithClient(<CmsPage />);

    expect(screen.getByText('CMS & Kelola Konten Landing Page')).toBeInTheDocument();
    expect(screen.getByText('1. Hero & Banner Beranda')).toBeInTheDocument();
    expect(screen.getByText('2. Berita & Artikel')).toBeInTheDocument();
    expect(screen.getByText('3. Galeri Media')).toBeInTheDocument();
    expect(screen.getByText('4. Halaman Statis')).toBeInTheDocument();
    expect(screen.getByText('5. Profil & Organisasi')).toBeInTheDocument();

    // Default seeded banner
    expect(await screen.findByText('[Contoh] Selamat Datang di Yayasan Perguruan Padindi')).toBeInTheDocument();
  });

  it('dapat beralih ke tab Berita & Artikel dan Profil', async () => {
    renderWithClient(<CmsPage />);

    const articlesTab = screen.getByText('2. Berita & Artikel');
    fireEvent.click(articlesTab);
    expect(await screen.findByText('Manajemen Berita & Artikel Yayasan')).toBeInTheDocument();

    const profileTab = screen.getByText('5. Profil & Organisasi');
    fireEvent.click(profileTab);
    expect(await screen.findByText('Visi & Misi Yayasan Padindi')).toBeInTheDocument();
    expect(screen.getByText('Struktur Dewan Pembina & Pengurus Yayasan')).toBeInTheDocument();
  });

  it('role guru hanya melihat tab Berita & Artikel dan Galeri Media', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            data: {
              id: 2,
              name: 'Siti Rahmawati, S.Pd',
              email: 'guru@padindi.id',
              roles: ['guru'],
              permissions: ['dashboard.view', 'content.manage', 'messages.manage', 'logs.view'],
            },
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    renderWithClient(<CmsPage />);

    expect(await screen.findByText('1. Berita & Artikel')).toBeInTheDocument();
    expect(screen.getByText('2. Galeri Media')).toBeInTheDocument();
    expect(screen.queryByText(/Hero & Banner Beranda/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Profil & Organisasi/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Identitas & Logo Yayasan/)).not.toBeInTheDocument();
    expect(await screen.findByText('Manajemen Berita & Artikel Yayasan')).toBeInTheDocument();
  });

  it('mem-parsing data site_achievements dan site_faqs dari backend saat reload dan mendukung aksi edit/hapus', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/admin/settings') {
        return Promise.resolve({
          data: {
            data: {
              flat: {
                site_achievements: JSON.stringify([
                  {
                    id: 101,
                    title: 'Juara 1 Sains Komputasi Nasional',
                    category: 'Akademik',
                    year: '2026',
                    description: 'Kompetisi tingkat nasional',
                  },
                ]),
                site_faqs: JSON.stringify([
                  {
                    id: 202,
                    question: 'Apakah sekolah menyediakan asrama?',
                    answer: 'Sekolah saat ini menyediakan fasilitas antar jemput.',
                    sort_order: 1,
                  },
                ]),
              },
              grouped: {},
            },
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    renderWithClient(<CmsPage />);

    // 1. Verifikasi parsing site_achievements
    const achTab = screen.getByText('6. Prestasi & Fasilitas');
    fireEvent.click(achTab);
    expect(await screen.findByText('Juara 1 Sains Komputasi Nasional')).toBeInTheDocument();

    // Hapus prestasi
    const deleteAchBtn = screen.getByRole('button', { name: 'Hapus' });
    fireEvent.click(deleteAchBtn);
    expect(apiClient.put).toHaveBeenCalledWith('/admin/settings', expect.objectContaining({
      settings: expect.objectContaining({
        site_achievements: JSON.stringify([]),
      }),
    }));

    // 2. Verifikasi parsing site_faqs
    const faqTab = screen.getByText('7. FAQ & Kontak');
    fireEvent.click(faqTab);
    expect(await screen.findByText('Apakah sekolah menyediakan asrama?')).toBeInTheDocument();

    // Hapus FAQ
    const deleteFaqBtn = screen.getByRole('button', { name: 'Hapus' });
    fireEvent.click(deleteFaqBtn);
    expect(apiClient.put).toHaveBeenCalledWith('/admin/settings', expect.objectContaining({
      settings: expect.objectContaining({
        site_faqs: JSON.stringify([]),
      }),
    }));
  });

  it('getCmsData dan updateCmsData memanggil endpoint /admin/cms secara selaras dengan backend', async () => {
    const { apiClient } = await import('@/lib/api-client');
    const { getCmsData, updateCmsData } = await import('@/features/admin/cms/api');

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: {
          flat: { site_name: 'Yayasan Padindi' },
          grouped: { general: { site_name: 'Yayasan Padindi' } },
        },
      },
    } as any);

    const res = await getCmsData();
    expect(apiClient.get).toHaveBeenCalledWith('/admin/cms');
    expect(res.data.data.flat.site_name).toBe('Yayasan Padindi');

    vi.mocked(apiClient.put).mockResolvedValueOnce({
      data: { message: 'Pengaturan berhasil diperbarui.' },
    } as any);

    const putRes = await updateCmsData({ site_name: 'Yayasan Padindi Baru' });
    expect(apiClient.put).toHaveBeenCalledWith('/admin/cms', {
      settings: { site_name: 'Yayasan Padindi Baru' },
    });
    expect(putRes.data.message).toBe('Pengaturan berhasil diperbarui.');
  });

  it('dapat mengelola halaman statis melalui tab 4. Halaman Statis', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/admin/pages') {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 1,
                title: 'Kebijakan Privasi Resmi',
                slug: 'kebijakan-privasi',
                content: '<p>Isi kebijakan privasi...</p>',
                meta_title: 'Kebijakan Privasi',
                meta_description: 'Deskripsi privasi.',
                is_published: true,
                sort_order: 1,
                updated_at: '2026-11-24T12:00:00Z',
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    renderWithClient(<CmsPage />);

    // Berpindah ke tab Halaman Statis
    const pagesTab = screen.getByText('4. Halaman Statis');
    expect(pagesTab).toBeInTheDocument();
    fireEvent.click(pagesTab);

    // Memverifikasi tabel data
    expect(await screen.findByText('Manajemen Halaman Statis & Informasi Publik')).toBeInTheDocument();
    expect(await screen.findByText('Kebijakan Privasi Resmi')).toBeInTheDocument();
    expect(screen.getByText('/halaman/kebijakan-privasi')).toBeInTheDocument();
    expect(screen.getByText('Terbit')).toBeInTheDocument();

    // Membuka modal tambah halaman
    const addBtn = screen.getByText('Tambah Halaman Baru');
    fireEvent.click(addBtn);

    expect(screen.getByText('Tambah Halaman Statis Baru')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contoh: Tata Tertib Siswa & Guru')).toBeInTheDocument();
    expect(screen.getByText('Generate dari Judul')).toBeInTheDocument();
    expect(screen.getByText('Simpan Halaman')).toBeInTheDocument();
  });
});
