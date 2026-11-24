import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TeacherFormPage } from '@/features/teacher-application/pages/TeacherFormPage';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

function renderTeacherForm(initialUrl: string = '/pendaftaran/guru?vacancy_id=5') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route path="/pendaftaran/guru" element={<TeacherFormPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TeacherFormPage - Asosiasi Lowongan Guru', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { apiClient } = await import('@/lib/api-client');

    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/public/vacancies') {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 5,
                title: 'Guru Bimbingan Konseling (BK)',
                slug: 'guru-bk-sma',
                subject: 'BK',
                education_unit_id: 3,
                education_unit: {
                  id: 3,
                  name: 'SMA Padindi',
                  level: 'sma',
                  slug: 'sma-padindi',
                },
              },
            ],
          },
        });
      }

      if (url === '/public/registration-info') {
        return Promise.resolve({
          data: {
            data: {
              units: [
                { id: 3, name: 'SMA Padindi', code: 'SMA-PADINDI', level: 'sma' },
              ],
            },
          },
        });
      }

      return Promise.resolve({ data: { data: [] } });
    });
  });

  it('menampilkan banner informasi formasi dan mengisi otomatis posisi saat vacancy_id ada di URL', async () => {
    renderTeacherForm('/pendaftaran/guru?vacancy_id=5');

    expect(await screen.findByText('Melamar Formasi:')).toBeInTheDocument();
    expect(screen.getByText('Guru Bimbingan Konseling (BK)')).toBeInTheDocument();
    expect(screen.getAllByText(/SMA Padindi/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Pilih Formasi Lain' })).toHaveAttribute('href', '/lowongan-guru');

    const positionInput = screen.getByLabelText(/Posisi \/ Jabatan yang Dilamar/i) as HTMLInputElement;
    expect(positionInput.value).toBe('Guru Bimbingan Konseling (BK)');
  });
});
