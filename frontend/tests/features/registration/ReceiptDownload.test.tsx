import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { downloadStudentReceipt } from '@/features/student-application/api';
import { downloadTeacherReceipt } from '@/features/teacher-application/api';
import { ApplicationStatusPage } from '@/features/student-application/pages/ApplicationStatusPage';
import { StudentSuccessPage } from '@/features/student-application/pages/StudentSuccessPage';
import { TeacherSuccessPage } from '@/features/teacher-application/pages/TeacherSuccessPage';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Fitur Unduh Bukti Pendaftaran Resmi (PDF)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost:3000/mock-uuid');
    window.URL.revokeObjectURL = vi.fn();
  });

  it('downloadStudentReceipt memanggil endpoint backend dengan responseType blob', async () => {
    const { apiClient } = await import('@/lib/api-client');
    const dummyBlob = new Blob(['%PDF-dummy'], { type: 'application/pdf' });
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: dummyBlob } as any);

    const blob = await downloadStudentReceipt(123);
    expect(apiClient.get).toHaveBeenCalledWith('/student-applications/123/receipt', {
      responseType: 'blob',
    });
    expect(blob).toBe(dummyBlob);
  });

  it('downloadTeacherReceipt memanggil endpoint backend dengan responseType blob', async () => {
    const { apiClient } = await import('@/lib/api-client');
    const dummyBlob = new Blob(['%PDF-dummy-teacher'], { type: 'application/pdf' });
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: dummyBlob } as any);

    const blob = await downloadTeacherReceipt(456);
    expect(apiClient.get).toHaveBeenCalledWith('/teacher-applications/456/receipt', {
      responseType: 'blob',
    });
    expect(blob).toBe(dummyBlob);
  });

  it('ApplicationStatusPage menampilkan tombol Unduh Bukti saat status terkirim', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/student-applications/10') {
        return Promise.resolve({
          data: {
            data: {
              id: 10,
              registration_number: 'PPDB-2027-00010',
              status: 'submitted',
              current_step: 5,
              submitted_at: '2027-01-15T10:00:00Z',
              unit: { name: 'SD Padindi' },
              student: { full_name: 'Ananda Test' },
              documents: [],
            },
          },
        });
      }
      if (url === '/student-applications/10/status-history') {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({ data: { data: {} } });
    });

    render(
      <MemoryRouter initialEntries={['/akun/pendaftaran/murid/10']}>
        <Routes>
          <Route path="/akun/pendaftaran/murid/:id" element={<ApplicationStatusPage />} />
        </Routes>
      </MemoryRouter>
    );

    const downloadBtn = await screen.findByRole('button', { name: /Unduh Bukti \(PDF\)/i });
    expect(downloadBtn).toBeInTheDocument();
  });

  it('StudentSuccessPage menampilkan tombol unduh bukti pendaftaran berstempel digital', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: {
          id: 25,
          registration_number: 'PPDB-2027-00025',
          unit: { name: 'SD Padindi' },
          student: { full_name: 'Ahmad Faiz' },
        },
      },
    } as any);

    render(
      <MemoryRouter initialEntries={['/pendaftaran/murid/25/sukses']}>
        <Routes>
          <Route path="/pendaftaran/murid/:id/sukses" element={<StudentSuccessPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Unduh Tanda Bukti Pendaftaran Resmi (PDF)')).toBeInTheDocument();
  });

  it('TeacherSuccessPage menampilkan tombol unduh bukti lamaran berstempel digital', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: {
          id: 30,
          registration_number: 'GURU-2027-00030',
          full_name: 'Nurul Hidayah, S.Pd.',
          applied_position: 'Guru Matematika',
        },
      },
    } as any);

    render(
      <MemoryRouter initialEntries={['/pendaftaran/guru/30/sukses']}>
        <Routes>
          <Route path="/pendaftaran/guru/:id/sukses" element={<TeacherSuccessPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Unduh Tanda Bukti Lamaran Resmi (PDF)')).toBeInTheDocument();
  });
});
