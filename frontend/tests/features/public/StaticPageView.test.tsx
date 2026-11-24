import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { StaticPageView } from '@/features/public/pages/StaticPageView';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

function renderWithRoute(slug: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/halaman/${slug}`]}>
        <Routes>
          <Route path="/halaman/:slug" element={<StaticPageView />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('StaticPageView — Halaman Publik /halaman/:slug', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('menampilkan konten halaman statis resmi ketika data berhasil diambil', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/public/pages/tata-tertib-sekolah') {
        return Promise.resolve({
          data: {
            data: {
              id: 10,
              title: 'Tata Tertib Sekolah 2026/2027',
              slug: 'tata-tertib-sekolah',
              content: '<p class="lead">Panduan etika berpakaian dan kedisiplinan seluruh civitas sekolah.</p>',
              meta_title: 'Tata Tertib Sekolah Resmi — Yayasan Padindi',
              meta_description: 'Aturan dan tata tertib resmi murid Yayasan Padindi.',
              updated_at: '2026-11-20T10:00:00Z',
            },
          },
        });
      }
      return Promise.resolve({ data: { data: {} } });
    });

    renderWithRoute('tata-tertib-sekolah');

    expect(await screen.findByRole('heading', { name: 'Tata Tertib Sekolah 2026/2027' })).toBeInTheDocument();
    expect(screen.getByText(/Panduan etika berpakaian dan kedisiplinan/)).toBeInTheDocument();
    expect(screen.getByText('Halaman Informasi Resmi')).toBeInTheDocument();
    expect(screen.getByText(/Terakhir diperbarui:/)).toBeInTheDocument();
    expect(screen.getByText('Bagikan Halaman')).toBeInTheDocument();
  });

  it('dapat menyalin URL saat tombol bagikan halaman diklik', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/public/pages/info-beasiswa') {
        return Promise.resolve({
          data: {
            data: {
              id: 11,
              title: 'Program Beasiswa Prestasi',
              slug: 'info-beasiswa',
              content: '<p>Kriteria penerima beasiswa tahfidz dan prestasi akademik.</p>',
            },
          },
        });
      }
      return Promise.resolve({ data: { data: {} } });
    });

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    renderWithRoute('info-beasiswa');

    const shareBtn = await screen.findByText('Bagikan Halaman');
    fireEvent.click(shareBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(await screen.findByText('Tautan Disalin')).toBeInTheDocument();
  });

  it('menampilkan status 404 ketika halaman tidak ditemukan di backend', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockRejectedValue({
      response: { status: 404, data: { message: 'Not found' } },
    });

    renderWithRoute('halaman-tidak-ada');

    expect(await screen.findByText('Halaman Tidak Ditemukan')).toBeInTheDocument();
    expect(screen.getAllByText(/halaman-tidak-ada/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Kembali ke Beranda')).toBeInTheDocument();
  });
});
