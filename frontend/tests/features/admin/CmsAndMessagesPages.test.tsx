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
  beforeEach(() => {
    vi.clearAllMocks();
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
});

describe('CmsPage — Manajemen Konten Landing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('menampilkan tab navigasi CMS dan banner hero', async () => {
    renderWithClient(<CmsPage />);

    expect(screen.getByText('CMS & Kelola Konten Landing Page')).toBeInTheDocument();
    expect(screen.getByText('1. Hero & Banner Beranda')).toBeInTheDocument();
    expect(screen.getByText('2. Berita & Artikel')).toBeInTheDocument();
    expect(screen.getByText('3. Galeri Media')).toBeInTheDocument();
    expect(screen.getByText('4. Profil & Organisasi')).toBeInTheDocument();

    // Default seeded banner
    expect(await screen.findByText('[Contoh] Selamat Datang di Yayasan Perguruan Padindi')).toBeInTheDocument();
  });

  it('dapat beralih ke tab Berita & Artikel dan Profil', async () => {
    renderWithClient(<CmsPage />);

    const articlesTab = screen.getByText('2. Berita & Artikel');
    fireEvent.click(articlesTab);
    expect(await screen.findByText('Manajemen Berita & Artikel Yayasan')).toBeInTheDocument();

    const profileTab = screen.getByText('4. Profil & Organisasi');
    fireEvent.click(profileTab);
    expect(await screen.findByText('Visi & Misi Yayasan Padindi')).toBeInTheDocument();
    expect(screen.getByText('Struktur Dewan Pembina & Pengurus Yayasan')).toBeInTheDocument();
  });
});
