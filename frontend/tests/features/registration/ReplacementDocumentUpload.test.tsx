import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApplicationStatusPage } from '@/features/student-application/pages/ApplicationStatusPage';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Fitur Modal Upload Dokumen Pengganti (ApplicationStatusPage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('menampilkan tombol "Unggah Berkas Pengganti" pada berkas yang ditolak dan membuka modal saat diklik', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/student-applications/55') {
        return Promise.resolve({
          data: {
            data: {
              id: 55,
              registration_number: 'PPDB-2027-00055',
              status: 'revision_required',
              current_step: 5,
              submitted_at: '2027-01-15T10:00:00Z',
              unit: { name: 'SD Padindi' },
              student: { full_name: 'Budi Santoso' },
              documents: [
                {
                  id: 101,
                  document_type: 'family_card',
                  sequence: 1,
                  original_name: 'kartu_keluarga_lama.jpg',
                  size_bytes: 450000,
                  verification_status: 'invalid',
                  verification_note: 'Foto kartu keluarga buram dan bagian NIK terpotong.',
                  created_at: '2027-01-15T10:05:00Z',
                },
                {
                  id: 102,
                  document_type: 'birth_certificate',
                  sequence: 2,
                  original_name: 'akta_kelahiran.pdf',
                  size_bytes: 800000,
                  verification_status: 'valid',
                  verification_note: null,
                  created_at: '2027-01-15T10:06:00Z',
                },
              ],
            },
          },
        });
      }
      if (url === '/student-applications/55/status-history') {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({ data: { data: {} } });
    });

    render(
      <MemoryRouter initialEntries={['/akun/pendaftaran/murid/55']}>
        <Routes>
          <Route path="/akun/pendaftaran/murid/:id" element={<ApplicationStatusPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Verifikasi berkas ditolak berstatus "Perlu Diganti" dan ada catatan verifikator
    expect(await screen.findByText('Kartu Keluarga (KK)')).toBeInTheDocument();
    expect(screen.getAllByText('Perlu Diganti').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Foto kartu keluarga buram/)).toBeInTheDocument();

    // Verifikasi tombol "Unggah Berkas Pengganti" ada
    const replaceBtns = screen.getAllByRole('button', { name: /Unggah Berkas Pengganti/i });
    expect(replaceBtns.length).toBeGreaterThanOrEqual(1);

    // Klik tombol untuk membuka modal
    fireEvent.click(replaceBtns[0]);

    // Verifikasi Modal terbuka
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Unggah Dokumen Pengganti' })).toBeInTheDocument();
    expect(screen.getByText('Dokumen yang akan diperbaiki:')).toBeInTheDocument();
    expect(screen.getByText(/Catatan Penolakan dari Verifikator/)).toBeInTheDocument();
    expect(screen.getAllByText(/bagian NIK terpotong/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/kartu_keluarga_lama.jpg/).length).toBeGreaterThanOrEqual(1);
  });

  it('dapat memilih berkas baru dan mengunggah dokumen pengganti hingga berhasil', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/student-applications/77') {
        return Promise.resolve({
          data: {
            data: {
              id: 77,
              registration_number: 'PPDB-2027-00077',
              status: 'revision_required',
              current_step: 5,
              submitted_at: '2027-01-15T10:00:00Z',
              unit: { name: 'SMP Padindi' },
              student: { full_name: 'Dewi Lestari' },
              documents: [
                {
                  id: 202,
                  document_type: 'diploma',
                  sequence: 1,
                  original_name: 'ijazah_buram.pdf',
                  size_bytes: 300000,
                  verification_status: 'invalid',
                  verification_note: 'Halaman belakang ijazah belum dilampirkan.',
                  created_at: '2027-01-15T10:05:00Z',
                },
              ],
            },
          },
        });
      }
      if (url === '/student-applications/77/status-history') {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({ data: { data: {} } });
    });

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        message: 'Dokumen berhasil diunggah.',
        data: { id: 303, original_name: 'ijazah_lengkap.pdf' },
      },
    } as any);

    render(
      <MemoryRouter initialEntries={['/akun/pendaftaran/murid/77']}>
        <Routes>
          <Route path="/akun/pendaftaran/murid/:id" element={<ApplicationStatusPage />} />
        </Routes>
      </MemoryRouter>
    );

    const replaceBtn = await screen.findByRole('button', { name: /Unggah Berkas Pengganti/i });
    fireEvent.click(replaceBtn);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Simulasikan pemilihan file baru
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const newFile = new File(['dummy-content-pdf'], 'ijazah_lengkap.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [newFile] } });

    // File terpilih tampil di preview
    expect(await screen.findByText('ijazah_lengkap.pdf')).toBeInTheDocument();
    expect(screen.getByText(/Siap diunggah/)).toBeInTheDocument();

    // Klik tombol submit di dalam modal
    const submitBtn = screen.getByRole('button', { name: /Unggah Dokumen Pengganti/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // Verifikasi API upload dipanggil
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/student-applications/77/documents',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'multipart/form-data' }),
        })
      );
    });

    // Verifikasi pesan sukses muncul di halaman
    expect(await screen.findByText(/berhasil diunggah/i)).toBeInTheDocument();
  });
});
